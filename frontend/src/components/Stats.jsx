import React from 'react';
import { Icon } from './Icons.jsx';
import { LineChart, WorldMap, QRCode } from './Charts.jsx';
import { api } from '../api/client.js';
import { HealthPill, relDate } from './Dashboard.jsx';
import { getBaseHost, shortUrl } from '../utils/baseUrl.js';

export const Stats = ({ urlSlug, onBack, push }) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState('30d');
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    api.stats.get(urlSlug)
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [urlSlug]);

  if (loading) {
    return (
      <div className="stats-page">
        <div style={{ padding: 60, textAlign: 'center' }} className="mute">Loading stats…</div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="stats-page">
        <div className="glass empty">
          <h3 className="h3">Could not load stats</h3>
          <p className="mute">{err}</p>
          <button className="btn btn-primary" onClick={onBack}>Back to links</button>
        </div>
      </div>
    );
  }

  const shortLink = shortUrl(data.slug);
  const shortDisplay = `${getBaseHost()}/${data.slug}`;
  const seriesDisplay = range === '7d' ? data.series.slice(-7)
    : range === '90d' ? [...data.series, ...data.series, ...data.series].slice(0, 90)
    : data.series;

  const copyShort = () => {
    navigator.clipboard?.writeText(shortLink);
    push('Copied', { icon: 'copy' });
  };

  const totalGeo = data.geo.reduce((a, g) => a + g.count, 0);
  const uptime99 = data.uptime.filter(v => v > 0).length / data.uptime.length * 100;

  return (
    <div className="stats-page">
      <div className="crumbs">
        <a onClick={onBack}>← Links</a>
        <span>/</span>
        <span className="mono">{data.slug}</span>
      </div>

      <div className="stats-hero glass-strong">
        <div style={{ minWidth: 0 }}>
          <div className="row" style={{ gap: 10, marginBottom: 8 }}>
            <HealthPill health={data.health} />
            <span className="chip">Created {relDate(data.createdAt)}</span>
            {data.lastCheck && (
              <span className="chip">
                Last checked {Math.floor((Date.now() - new Date(data.lastCheck).getTime()) / 60000)}m ago
              </span>
            )}
          </div>
          <div className="short-big">
            <span className="mute">{getBaseHost()}/</span>
            <span style={{ color: 'var(--accent)' }}>{data.slug}</span>
            <button className="btn btn-icon tt" data-tt="Copy" onClick={copyShort}>
              <Icon name="copy" size={14} />
            </button>
            <button className="btn btn-icon tt" data-tt="Open" onClick={() => window.open(data.target, '_blank')}>
              <Icon name="external" size={14} />
            </button>
          </div>
          <div className="target-big mute">→ {data.target}</div>
          <div className="row" style={{ gap: 24, marginTop: 18 }}>
            <div>
              <div className="mute" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total clicks</div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{data.clicks.toLocaleString()}</div>
            </div>
            <div>
              <div className="mute" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unique visitors</div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{data.uniqueVisitors.toLocaleString()}</div>
            </div>
            <div>
              <div className="mute" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Peak day</div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{Math.max(...data.series, 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="qr-wrap">
          <QRCode value={shortLink} size={120} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="card glass">
          <div className="card-title">
            <h3 className="h3">Clicks over time</h3>
            <div className="seg">
              {['7d', '30d', '90d'].map(r => (
                <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
          </div>
          <LineChart data={seriesDisplay.length ? seriesDisplay : [0]} />
        </div>
        <div className="card glass">
          <div className="card-title">
            <h3 className="h3">Top countries</h3>
            <Icon name="globe" size={14} />
          </div>
          {data.geo.length === 0 ? (
            <p className="mute" style={{ fontSize: 13 }}>No geographic data yet.</p>
          ) : (
            <div className="geo-list">
              {data.geo.slice(0, 8).map(g => (
                <div key={g.code} className="geo-item">
                  <div className="flag">{g.code}</div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span>{g.name}</span>
                      <span className="mute">{((g.count / totalGeo) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="geo-bar">
                      <div className="fill" style={{ width: `${(g.count / data.geo[0].count) * 100}%` }} />
                    </div>
                  </div>
                  <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{g.count.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.geo.length > 0 && (
        <div className="card glass">
          <div className="card-title">
            <h3 className="h3">Visitor geography</h3>
            <span className="mute" style={{ fontSize: 12 }}>
              {totalGeo.toLocaleString()} clicks across {data.geo.length} countries
            </span>
          </div>
          <WorldMap points={data.geo} />
        </div>
      )}

      <div className="stats-row2">
        <div className="card glass">
          <div className="card-title">
            <h3 className="h3">Uptime — last 30 days</h3>
            <span className="chip chip-alive">
              <span className="chip-dot" />{uptime99.toFixed(1)}%
            </span>
          </div>
          <div className="uptime">
            {data.uptime.map((u, i) => (
              <div key={i} className={`bar ${u === 0 ? 'down' : u < 1 ? 'partial' : ''}`}
                   title={`Day -${30 - i} · ${u === 0 ? 'down' : u < 1 ? 'partial' : '100%'}`} />
            ))}
          </div>
          <div className="uptime-legend">
            <span><span className="swatch" style={{ background: 'oklch(0.75 0.18 150)' }} />Up</span>
            <span><span className="swatch" style={{ background: 'oklch(0.75 0.15 80)' }} />Partial</span>
            <span><span className="swatch" style={{ background: 'oklch(0.70 0.22 25)' }} />Down</span>
            <span className="mute" style={{ marginLeft: 'auto' }}>Checked daily at 03:00 UTC</span>
          </div>
        </div>

        <div className="card glass">
          <div className="card-title"><h3 className="h3">Devices</h3></div>
          <div className="bd-list">
            {data.devices.length === 0
              ? <p className="mute" style={{ fontSize: 13 }}>No data yet.</p>
              : data.devices.map(d => (
                <div key={d.name} className="bd-item">
                  <div className="bd-head"><span>{d.name}</span><span className="mute">{d.value}%</span></div>
                  <div className="bd-bar"><div className="fill" style={{ width: `${d.value}%` }} /></div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="stats-row2">
        <div className="card glass">
          <div className="card-title"><h3 className="h3">Top referrers</h3></div>
          <div className="bd-list">
            {data.referrers.length === 0
              ? <p className="mute" style={{ fontSize: 13 }}>No referrer data yet.</p>
              : data.referrers.map(d => (
                <div key={d.name} className="bd-item">
                  <div className="bd-head">
                    <span className="mono" style={{ fontSize: 12 }}>{d.name}</span>
                    <span className="mute">{d.value}%</span>
                  </div>
                  <div className="bd-bar"><div className="fill" style={{ width: `${Math.min(d.value * 2, 100)}%` }} /></div>
                </div>
              ))
            }
          </div>
        </div>
        <div className="card glass">
          <div className="card-title"><h3 className="h3">Browsers</h3></div>
          <div className="bd-list">
            {data.browsers.length === 0
              ? <p className="mute" style={{ fontSize: 13 }}>No data yet.</p>
              : data.browsers.map(d => (
                <div key={d.name} className="bd-item">
                  <div className="bd-head"><span>{d.name}</span><span className="mute">{d.value}%</span></div>
                  <div className="bd-bar"><div className="fill" style={{ width: `${d.value}%` }} /></div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};
