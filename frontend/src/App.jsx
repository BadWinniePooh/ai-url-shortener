import React from 'react';
import { Icon } from './components/Icons.jsx';
import { ToastProvider, ToastContext } from './components/Toast.jsx';
import { TweaksButton, TweaksPanel } from './components/TweaksPanel.jsx';
import { AuthScreen } from './components/AuthScreen.jsx';
import { Dashboard } from './components/Dashboard.jsx';
import { Stats } from './components/Stats.jsx';
import { api, setToken } from './api/client.js';

const LS_KEY = 'shortwave_state_v1';
const loadState = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } };
const saveState = (s) => { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} };

const TWEAK_DEFAULTS = { theme: 'dark', accent: 'cyan', captcha: 'checkbox', layout: 'grid', density: 'comfortable' };

function AppInner() {
  const push = React.useContext(ToastContext);
  const persisted = loadState();

  const [user, setUser] = React.useState(persisted.user || null);
  const [route, setRoute] = React.useState(persisted.route || { name: 'dashboard' });
  const [urls, setUrls] = React.useState([]);
  const [urlsLoaded, setUrlsLoaded] = React.useState(false);
  const [newShort, setNewShort] = React.useState(null);
  const [tweaks, setTweaks] = React.useState({ ...TWEAK_DEFAULTS, ...(persisted.tweaks || {}) });
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  // Load URLs when logged in
  React.useEffect(() => {
    if (!user) return;
    api.urls.list()
      .then(({ urls }) => { setUrls(urls); setUrlsLoaded(true); })
      .catch(() => setUrlsLoaded(true));
  }, [user]);

  // Apply accent + theme to document
  React.useEffect(() => {
    const accents = { cyan: 210, violet: 290, lime: 130, amber: 70, rose: 15 };
    document.documentElement.style.setProperty('--accent-h', accents[tweaks.accent] ?? 210);
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-density', tweaks.density);
  }, [tweaks.theme, tweaks.accent, tweaks.density]);

  // Persist state
  React.useEffect(() => { saveState({ user, route, tweaks }); }, [user, route, tweaks]);

  // Verify token on startup
  React.useEffect(() => {
    const token = localStorage.getItem('sw_token');
    if (token && !user) {
      api.auth.me()
        .then(({ user: u }) => setUser(u))
        .catch(() => { setToken(null); });
    }
  }, []);

  const setTweak = (key, value) => setTweaks(t => ({ ...t, [key]: value }));

  const onAuthed = (u) => { setUser(u); setRoute({ name: 'dashboard' }); };
  const signOut = () => {
    setUser(null); setToken(null); setUrls([]);
    setUrlsLoaded(false); setRoute({ name: 'dashboard' });
  };

  const onCreate = (url) => {
    setUrls(u => [url, ...u]);
    setNewShort(url);
    push('Link created', { icon: 'check' });
  };
  const onCopy = (u) => {
    const s = `https://shw.link/${u.slug}`;
    navigator.clipboard?.writeText(s);
    push('Copied ' + s, { icon: 'copy' });
  };
  const onDelete = async (u) => {
    try {
      await api.urls.delete(u.slug);
      setUrls(prev => prev.filter(x => x.slug !== u.slug));
      push('Deleted ' + u.slug);
    } catch (err) {
      push(err.message, { icon: 'x' });
    }
  };
  const onOpen = (slug) => setRoute({ name: 'stats', slug });

  return (
    <>
      <div className="mesh-bg">
        <div className="blob" />
        <div className="grain" />
      </div>
      <div className="app">
        {user && (
          <div className="topbar">
            <div className="brand" onClick={() => setRoute({ name: 'dashboard' })} style={{ cursor: 'pointer' }}>
              <div className="brand-mark"><Icon name="wave" size={14} /></div>
              <span>Shortwave</span>
            </div>
            <div className="grow" />
            <button className="btn btn-ghost" onClick={() => setRoute({ name: 'dashboard' })}>
              <Icon name="link" size={14} />Links
            </button>
            <UserMenu user={user} onSignOut={signOut} />
          </div>
        )}

        {!user && <AuthScreen onAuthed={onAuthed} captchaVariant={tweaks.captcha} />}

        {user && route.name === 'dashboard' && (
          <Dashboard
            urls={urls}
            layout={tweaks.layout}
            onLayout={(l) => setTweak('layout', l)}
            onOpen={onOpen}
            onCreate={onCreate}
            onCopy={onCopy}
            onDelete={onDelete}
            captchaVariant={tweaks.captcha}
            push={push}
            newShort={newShort}
            onCloseNewShort={() => setNewShort(null)}
          />
        )}

        {user && route.name === 'stats' && (
          <Stats urlSlug={route.slug} onBack={() => setRoute({ name: 'dashboard' })} push={push} />
        )}
      </div>

      <TweaksButton open={tweaksOpen} onToggle={() => setTweaksOpen(o => !o)} />
      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setTweaksOpen(false)} />}
    </>
  );
}

const UserMenu = ({ user, onSignOut }) => {
  const [open, setOpen] = React.useState(false);
  const initials = (user.name || user.email).split(/[\s@]/)[0].slice(0, 2).toUpperCase();
  return (
    <div style={{ position: 'relative' }}>
      <div className="topbar-user" onClick={() => setOpen(o => !o)}>
        <div className="avatar">{initials}</div>
        <span>{user.name || user.email}</span>
        <Icon name="chevronRight" size={12}
              style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .15s' }} />
      </div>
      {open && (
        <div className="glass-strong" style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)',
          minWidth: 200, padding: 8, zIndex: 20,
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--glass-border)', marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name || user.email}</div>
            <div className="mute" style={{ fontSize: 11 }}>{user.email}</div>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <Icon name="settings" size={14} />Settings
          </button>
          <button className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', color: 'oklch(0.7 0.22 25)' }}
                  onClick={onSignOut}>
            <Icon name="logout" size={14} />Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
