import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import * as authApi from '../../api/auth';
import { ApiError, setUnauthorizedHandler } from '../../api/client';
import type { CurrentUser } from '../../types/domain';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  status: AuthStatus;
  user: CurrentUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-reads the user, which is how the quota in the chrome stays current. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>.');
  return value;
}

/**
 * For anything rendered under `RequireAuth`, where a null user is impossible.
 * Saves every screen a narrowing check for a state it can't be in.
 */
export function useCurrentUser(): CurrentUser {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser must be used inside <RequireAuth>.');
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // The cookie is HttpOnly, so the only way to know whether there is a session is
  // to ask. Runs once, before anything decides which screen to show.
  useEffect(() => {
    let cancelled = false;

    authApi
      .fetchCurrentUser()
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus('authenticated');
      })
      .catch(() => {
        // 401 is the ordinary "not signed in" answer. A network failure lands here
        // too, and the login screen is the right place for it: the attempt will
        // report the real problem rather than the app hanging on a spinner.
        if (cancelled) return;
        setUser(null);
        setStatus('anonymous');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus('anonymous');
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const current = await authApi.signIn(email, password);
    setUser(current);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
    } finally {
      // Cleared either way. If the call failed the cookie may still exist, but
      // leaving someone looking signed in after they asked not to be is worse —
      // and the next request will 401 and land them here anyway.
      setUser(null);
      setStatus('anonymous');
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.fetchCurrentUser());
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        setUser(null);
        setStatus('anonymous');
      }
      // Anything else — a blip refreshing the quota — leaves the last known user
      // in place rather than signing someone out over a failed background read.
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signOut, refresh }),
    [status, user, signIn, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Gate for every route inside the app shell. While the session check is in flight
 * it paints the paper ground and nothing else — a spinner for a request that
 * usually finishes in a few milliseconds is more distracting than a still page.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <div className="app-frame paper" aria-busy="true" />;
  }

  if (status === 'anonymous') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <>{children}</>;
}
