import React from 'react';
import { Icon } from './Icons.jsx';
import { Captcha } from './Captcha.jsx';
import { api } from '../api/client.js';
import { getBaseHost, shortUrl } from '../utils/baseUrl.js';

const relDate = (ts) => {
  const d = (Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24);
  if (d < 1) return 'today';
  if (d < 2) return 'yesterday';
  if (d < 30) return `${Math.floor(d)}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

const HealthPill = ({ health, compact }) => {
  const cls = health === 'alive' ? 'chip-alive' : health === 'down' ? 'chip-down' : 'chip-unknown';
  const label = health === 'alive' ? 'Alive' : health === 'down' ? 'Down' : 'Checking';
  return (
    <span className={`chip ${cls}`} style={compact ? { fontSize: 11, padding: '2px 8px' } : undefined}>
      <span className="chip-dot" />
      {label}
    </span>
  );
};

const ShortenBar = ({ onCreate, captchaVariant, push }) => {
  const [target, setTarget] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [captchaOk, setCaptchaOk] = React.useState(false);
  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!target) { push('Paste a URL first', { icon: 'link' }); return; }
    try { new URL(target); } catch { push("That doesn't look like a URL", { icon: 'x' }); return; }
    if (!captchaOk) { setCaptchaOpen(true); return; }

    setLoading(true);
    try {
      const { url } = await api.urls.create({ target_url: target, slug: slug.trim() || undefined });
      onCreate(url);
      setTarget(''); setSlug('');
      setCaptchaOk(false); setCaptchaOpen(false);
    } catch (err) {
      push(err.message, { icon: 'x' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="shorten-bar glass-strong" onSubmit={submit}>
      <div className="field">
        <label className="field-label">Destination URL</label>
        <input className="input" type="url" placeholder="https://your-long-url.example/path"
               value={target} onChange={e => setTarget(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">
          Custom slug <span className="mute" style={{ textTransform: 'none', letterSpacing: 0 }}>— leave blank for random</span>
        </label>
        <div className="slug-wrap">
          <span className="slug-prefix">{getBaseHost()}/</span>
          <input className="input" placeholder="auto"
                 value={slug} onChange={e => setSlug(e.target.value.replace(/[^a-z0-9_-]/gi, ''))} />
        </div>
      </div>
      <div className="field" style={{ alignSelf: 'end' }}>
        <button type="submit" className="btn btn-primary" style={{ height: 46 }} disabled={loading}>
          <Icon name="zap" size={14} />
          {loading ? 'Shortening…' : 'Shorten'}
        </button>
      </div>
      {captchaOpen && !captchaOk && (
        <div style={{ gridColumn: '1 / -1' }}>
          <Captcha variant={captchaVariant}
                   onVerified={() => { setCaptchaOk(true); setTimeout(() => submit(), 300); }}
                   verified={captchaOk} />
        </div>
      )}
    </form>
  );
};

const StatCard = ({ label, value, delta, deltaDir }) => (
  <div className="stat-card glass">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {delta && <div className={`stat-delta ${deltaDir || ''}`}>{delta}</div>}
  </div>
);

const UrlCard = ({ u, onOpen, onCopy, onDelete }) => {
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
  return (
    <div className="url-card glass" onClick={() => onOpen(u.slug)}>
      <div className="row between">
        <HealthPill health={u.health} compact />
        <span className="mute" style={{ fontSize: 11 }}>{relDate(u.created_at)}</span>
      </div>
      <div className="short">
        <span className="mute">{getBaseHost()}/</span>
        <span className="accent">{u.slug}</span>
      </div>
      <div className="target" title={u.target_url}>{u.target_url}</div>
      <div className="meta-row">
        <div className="col" style={{ gap: 0 }}>
          <div className="clicks">{(u.clicks || 0).toLocaleString()}</div>
          <div className="mute" style={{ fontSize: 11 }}>clicks</div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-icon tt" data-tt="Copy" onClick={stop(() => onCopy(u))}>
            <Icon name="copy" size={14} />
          </button>
          <button className="btn btn-icon tt" data-tt="Open" onClick={stop(() => window.open(u.target_url, '_blank'))}>
            <Icon name="external" size={14} />
          </button>
          <button className="btn btn-icon tt" data-tt="Stats" onClick={stop(() => onOpen(u.slug))}>
            <Icon name="chart" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const UrlRow = ({ u, onOpen, onCopy }) => {
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
  return (
    <div className="url-row" onClick={() => onOpen(u.slug)}>
      <div className="short-cell">
        <span className="mute">{getBaseHost()}/</span>
        <span style={{ color: 'var(--accent)' }}>{u.slug}</span>
      </div>
      <div className="target-cell">{u.target_url}</div>
      <div className="num">{(u.clicks || 0).toLocaleString()}</div>
      <div className="date-cell mute" style={{ fontSize: 12 }}>{relDate(u.created_at)}</div>
      <div className="health-cell"><HealthPill health={u.health} compact /></div>
      <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
        <button className="btn btn-icon tt" data-tt="Copy" onClick={stop(() => onCopy(u))}>
          <Icon name="copy" size={14} />
        </button>
        <button className="btn btn-icon tt" data-tt="Stats" onClick={stop(() => onOpen(u.slug))}>
          <Icon name="chart" size={14} />
        </button>
      </div>
    </div>
  );
};

export const Dashboard = ({ urls, layout, onLayout, onOpen, onCreate, onCopy, onDelete, captchaVariant, push, newShort, onCloseNewShort }) => {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const filtered = urls.filter(u => {
    if (filter === 'alive' && u.health !== 'alive') return false;
    if (filter === 'down' && u.health !== 'down') return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return u.slug.toLowerCase().includes(q) || u.target_url.toLowerCase().includes(q);
  });

  const total = urls.reduce((a, u) => a + (u.clicks || 0), 0);
  const alive = urls.filter(u => u.health === 'alive').length;
  const down = urls.filter(u => u.health === 'down').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="h1">Your links</h1>
          <p className="dim" style={{ margin: '6px 0 0 0' }}>Shorten, share, measure. All in one wave.</p>
        </div>
      </div>

      <div className="stat-row">
        <StatCard label="Total links" value={urls.length} delta="+3 this week" deltaDir="up" />
        <StatCard label="Total clicks" value={total.toLocaleString()} delta="+12.4% vs last week" deltaDir="up" />
        <StatCard label="Alive" value={alive} delta="health-checked daily" />
        <StatCard label="Down" value={down} delta={down ? 'needs attention' : 'all good'} deltaDir={down ? 'down' : 'up'} />
      </div>

      <ShortenBar onCreate={onCreate} captchaVariant={captchaVariant} push={push} />

      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <input className="input" placeholder="Search links or destinations…"
                 value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="seg">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'alive' ? 'active' : ''} onClick={() => setFilter('alive')}>Alive</button>
          <button className={filter === 'down' ? 'active' : ''} onClick={() => setFilter('down')}>Down</button>
        </div>
        <div className="view-toggle">
          <button className={layout === 'grid' ? 'active' : ''} onClick={() => onLayout('grid')}>
            <Icon name="grid" size={14} />
          </button>
          <button className={layout === 'list' ? 'active' : ''} onClick={() => onLayout('list')}>
            <Icon name="list" size={14} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass empty">
          <Icon name="link" size={36} />
          <h3 className="h3" style={{ marginTop: 10 }}>No matching links</h3>
          <p className="mute">Try a different filter or shorten a new one above.</p>
        </div>
      ) : layout === 'grid' ? (
        <div className="url-grid">
          {filtered.map(u => (
            <UrlCard key={u.slug} u={u} onOpen={onOpen} onCopy={onCopy} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="url-list glass">
          {filtered.map(u => (
            <UrlRow key={u.slug} u={u} onOpen={onOpen} onCopy={onCopy} onDelete={onDelete} />
          ))}
        </div>
      )}

      {newShort && (
        <div className="modal-backdrop" onClick={onCloseNewShort}>
          <div className="modal glass-strong" onClick={e => e.stopPropagation()}>
            <h2 className="h2">Your short link is live</h2>
            <p className="sub">
              Anyone with this link can open{' '}
              <span className="mono">{newShort.target_url.slice(0, 50)}{newShort.target_url.length > 50 ? '…' : ''}</span>
            </p>
            <div className="result-short">
              <span>
                <span className="mute">{getBaseHost()}/</span><span style={{ color: 'var(--accent)' }}>{newShort.slug}</span>
              </span>
              <button className="btn btn-icon" onClick={() => {
                navigator.clipboard?.writeText(shortUrl(newShort.slug));
                push('Copied', { icon: 'copy' });
              }}>
                <Icon name="copy" size={14} />
              </button>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn" onClick={onCloseNewShort}>Close</button>
              <button className="btn btn-primary" onClick={() => { onOpen(newShort.slug); onCloseNewShort(); }}>
                View stats <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { relDate, HealthPill };
