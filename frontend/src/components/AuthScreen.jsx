import React from 'react';
import { Icon } from './Icons.jsx';
import { Captcha } from './Captcha.jsx';
import { api, setToken } from '../api/client.js';

export const AuthScreen = ({ onAuthed, captchaVariant }) => {
  const [mode, setMode] = React.useState('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [captchaOk, setCaptchaOk] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');

  // Handle OAuth popup messages
  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.token) {
        setToken(e.data.token);
        api.auth.me().then(({ user }) => onAuthed(user)).catch(() => setErr('OAuth login failed'));
      } else if (e.data?.error) {
        setErr(e.data.error);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onAuthed]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!email.includes('@')) return setErr('Enter a valid email.');
    if (!password || password.length < 3) return setErr('Password required.');
    if (!captchaOk) return setErr('Please complete the verification.');
    setErr('');
    setLoading(true);
    try {
      const fn = mode === 'signin' ? api.auth.login : api.auth.register;
      const { token, user } = await fn({ email, password, name: name || undefined });
      setToken(token);
      onAuthed(user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openOAuth = (provider) => {
    const w = window.open(`/api/auth/oauth/${provider}`, 'oauth', 'width=520,height=620,popup=1');
    if (!w) setErr('Please allow popups to use social login.');
  };

  return (
    <div className="auth-wrap">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '100%' }}>
        <div className="brand" style={{ fontSize: 22 }}>
          <div className="brand-mark"><Icon name="wave" size={14} /></div>
          <span>Shortwave</span>
        </div>
        <div className="mute" style={{ fontSize: 13, marginTop: -8, letterSpacing: '0.04em' }}>
          short links. long signals.
        </div>

        <form className="auth-card glass-strong" onSubmit={submit}>
          <div className="auth-tabs">
            <button type="button" className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
                    onClick={() => { setMode('signin'); setErr(''); }}>Sign in</button>
            <button type="button" className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                    onClick={() => { setMode('signup'); setErr(''); }}>Create account</button>
          </div>

          <div className="social-row">
            <button type="button" className="btn" onClick={() => openOAuth('google')}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 11v3.2h4.5a4 4 0 0 1-1.7 2.6l2.8 2.2A7.8 7.8 0 0 0 20 12c0-.6 0-1.2-.2-1.7H12z" opacity="0.9"/>
                <path fill="#4285F4" d="M12 20c2.2 0 4-.7 5.3-2l-2.8-2.2a4.8 4.8 0 0 1-7.2-2.5H4.4v2.3A8 8 0 0 0 12 20z" opacity="0.9"/>
                <path fill="#FBBC05" d="M7.3 13.3a4.8 4.8 0 0 1 0-3.1V7.9H4.4a8 8 0 0 0 0 7.2l2.9-1.8z" opacity="0.9"/>
                <path fill="#34A853" d="M12 7.4a4.3 4.3 0 0 1 3 1.2l2.3-2.3A8 8 0 0 0 4.4 7.9l2.9 2.3A4.8 4.8 0 0 1 12 7.4z" opacity="0.9"/>
              </svg>
              Google
            </button>
            <button type="button" className="btn" onClick={() => openOAuth('github')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.93.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="auth-divider">or use email</div>

          {mode === 'signup' && (
            <div style={{ marginBottom: 12 }}>
              <label className="field-label">Name</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Rivera" />
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label className="field-label">Email</label>
            <input className="input" type="email" value={email}
                   onChange={e => setEmail(e.target.value)} placeholder="you@domain.com" />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="field-label">Password</label>
              {mode === 'signin' && (
                <a href="#" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>Forgot?</a>
              )}
            </div>
            <input className="input" type="password" value={password}
                   onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <Captcha variant={captchaVariant} onVerified={() => setCaptchaOk(true)} verified={captchaOk} />
          </div>

          {err && (
            <div style={{ fontSize: 12, color: 'oklch(0.7 0.22 25)', marginBottom: 10 }}>{err}</div>
          )}

          <button type="submit" className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Just a sec…' : (mode === 'signin' ? 'Sign in' : 'Create account')}
            {!loading && <Icon name="arrow" size={14} />}
          </button>

          <p className="mute" style={{ fontSize: 11, textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
            By continuing you agree to the Terms & a world with fewer long URLs.
          </p>
        </form>
      </div>
    </div>
  );
};
