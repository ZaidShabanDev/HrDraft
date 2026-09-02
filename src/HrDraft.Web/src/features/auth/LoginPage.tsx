import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo, Button, TextField } from '../../components';
import { useAppConfig } from '../../config/ConfigProvider';
import { useIsPhone } from '../../hooks/useBreakpoint';
import { TOOLS } from '../tools/toolRegistry';
import './login.css';

export function LoginPage() {
  const navigate = useNavigate();
  const isPhone = useIsPhone();
  const { branding, auth } = useAppConfig();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // LDAP takes a domain username rather than an email, so the field's label and
  // type follow whichever credential path is configured. If both are on, the
  // directory wins — it's the one a company actually wants people using.
  const usesDirectory = auth.ldap.enabled;
  const showCredentials = auth.local || auth.ldap.enabled;
  const identifierLabel = usesDirectory ? auth.ldap.domainLabel : 'Work email';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`${identifierLabel} is required.`);
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }
    setError('');
    navigate('/');
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

          {/* Only rendered when a tenant is configured. An SSO button nobody can
              use is worse than no button — so it's hidden, not disabled. */}
          {auth.entra.enabled ? (
            <Button variant="brand-dark" block onClick={() => navigate('/')}>
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
                onChange={(e) => setIdentifier(e.target.value)}
              />

              <TextField
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                {...(error ? { error } : {})}
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

              <Button type="submit" variant="primary" block>
                Sign in
              </Button>
            </>
          ) : null}

          {/* Every method disabled is a misconfiguration, not a state to design
              around — but it must say so rather than render an empty panel. */}
          {!auth.entra.enabled && !showCredentials ? (
            <p className="login-misconfigured">
              No sign-in method is enabled. Set one in <code>config/deployment.json</code>.
            </p>
          ) : null}

          <p className="text-muted login-notice">{branding.confidentialityNotice}</p>
        </form>
      </div>
    </div>
  );
}
