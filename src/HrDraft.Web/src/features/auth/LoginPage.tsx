import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../../api/client';
import { Banner, BrandLogo, Button, TextField } from '../../components';
import { useAppConfig } from '../../config/ConfigProvider';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { TOOLS } from '../tools/toolRegistry';
import { useAuth } from './AuthProvider';
import './login.css';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPhone = useIsPhone();
  const { branding, auth } = useAppConfig();
  const { status, signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Where they were headed before the guard sent them here.
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  // LDAP takes a domain username rather than an email, so the field's label and
  // type follow whichever credential path is configured. If both are on, the
  // directory wins — it's the one a company actually wants people using.
  const usesDirectory = auth.ldap.enabled;
  const showCredentials = auth.local || auth.ldap.enabled;
  const identifierLabel = usesDirectory ? auth.ldap.domainLabel : 'Work email';

  // Covers both an already-valid session and the moment straight after signing in.
  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = identifier.trim();
    setIdentifierError(trimmed ? '' : `${identifierLabel} is required.`);
    setPasswordError(password ? '' : 'Password is required.');
    setFormError('');
    if (!trimmed || !password) return;

    setSubmitting(true);
    try {
      await signIn(trimmed, password);
      navigate(from, { replace: true });
    } catch (error) {
      // The server answers every failure the same way on purpose — which one it
      // was is in the audit log, not in the response. Show it as it came.
      setFormError(
        error instanceof ApiError ? error.message : 'Something went wrong signing in.',
      );
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-split">
      <aside className="login-brand paper-dark">
        <BrandLogo surface="dark" size="lg" />

        <div className="login-brand-copy">
          {isPhone ? (
            <>
              <span className="login-eyebrow">
                Internal · {branding.departmentName}
              </span>
              <h3 className="login-brand-title">{branding.productName}</h3>
            </>
          ) : (
            <>
              <span className="login-eyebrow">{branding.tagline}</span>
              <h2 className="login-brand-title">{branding.productName}</h2>
              <p className="login-brand-body">
                Job descriptions, interview kits and onboarding plans, drafted from a short form
                and your company profile. Staff access only.
              </p>
            </>
          )}
        </div>

        {!isPhone ? (
          <div className="login-brand-footer">
            <span>{TOOLS.length} tools live</span>
            <span>
              {branding.departmentName} · {branding.companyName}
            </span>
            <span className="login-version">v1.0</span>
          </div>
        ) : null}
      </aside>

      <div className="login-form paper">
        <form onSubmit={submit} className="stack stack-5">
          <div>
            <h6 className="kicker-accent">Sign in</h6>
            {!isPhone ? (
              <h3 className="login-heading">Use your {branding.companyName} account.</h3>
            ) : null}
          </div>

          {formError ? (
            <div role="alert">
              <Banner kicker="Sign-in failed" tone="danger">
                {formError}
              </Banner>
            </div>
          ) : null}

          {/* Only rendered when a tenant is configured. An SSO button nobody can
              use is worse than no button — so it's hidden, not disabled. */}
          {auth.entra.enabled ? (
            <Button
              variant="brand-dark"
              block
              disabled={submitting}
              /* A full page navigation, not a fetch: the identity provider needs
                 the browser itself to follow the redirect. */
              onClick={() => {
                window.location.href = '/api/auth/entra/challenge';
              }}
            >
              {auth.entra.buttonLabel}
            </Button>
          ) : null}

          {auth.entra.enabled && showCredentials ? (
            <div className="login-or">
              <span className="login-or-rule" />
              <span className="text-muted login-or-label">OR</span>
              <span className="login-or-rule" />
            </div>
          ) : null}

          {showCredentials ? (
            <>
              <TextField
                label={identifierLabel}
                type={usesDirectory ? 'text' : 'email'}
                autoComplete="username"
                placeholder={usesDirectory ? undefined : `name@${branding.emailDomain}`}
                value={identifier}
                disabled={submitting}
                {...(identifierError ? { error: identifierError } : {})}
                onChange={(e) => setIdentifier(e.target.value)}
              />

              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                disabled={submitting}
                {...(passwordError ? { error: passwordError } : {})}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="login-meta">
                {/* A directory password isn't ours to reset. */}
                {auth.local && !usesDirectory ? (
                  <a href="#reset" className="login-forgot">
                    Forgot password?
                  </a>
                ) : (
                  <span className="text-muted login-granted">
                    Use your usual network password.
                  </span>
                )}
                {!isPhone ? (
                  <span className="text-muted login-granted">Access granted by an admin</span>
                ) : null}
              </div>

              <Button
                type="submit"
                variant="primary"
                block
                loading={submitting}
                loadingLabel="Signing in…"
              >
                Sign in
              </Button>
            </>
          ) : null}

          {/* Every method disabled is a misconfiguration, not a state to design
              around — but it must say so rather than render an empty panel. */}
          {!auth.entra.enabled && !showCredentials ? (
            <p className="login-misconfigured">
              No sign-in method is enabled. Turn one on under <code>HrDraft:Auth</code> in the
              API's <code>appsettings.json</code>.
            </p>
          ) : null}

          <p className="text-muted login-notice">{branding.confidentialityNotice}</p>
        </form>
      </div>
    </div>
  );
}
