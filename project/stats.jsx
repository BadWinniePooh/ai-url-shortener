// Stats page — detailed analytics for a URL

const Stats = ({ url, onBack }) => {
  const s = window.DETAIL_STATS;
  const [range, setRange] = React.useState("30d");
  const shortUrl = `shw.link/${url.slug}`;

  // scale series based on total clicks
  const scale = url.clicks / s.series.reduce((a, b) => a + b, 0);
  const series = s.series.map(v => Math.round(v * (scale || 1)));
  const totalGeo = s.geo.reduce((a, g) => a + g.count, 0);

  const copyShort = () => {
    navigator.clipboard && navigator.clipboard.writeText("https://" + shortUrl);
  };

  return (
    <div className="stats-page">
      <div className="crumbs">
        <a onClick={onBack}>← Links</a>
        <span>/</span>
        <span className="mono">{url.slug}</span>
      </div>

      <div className="stats-hero glass-strong">
        <div style={{minWidth: 0}}>
          <div className="row" style={{gap: 10, marginBottom: 8}}>
            <HealthPill health={url.health} />
            <span className="chip">
              Created {relDate(url.created)}
            </span>
            <span className="chip">
              Last checked {Math.floor((Date.now() - url.lastCheck) / 60000)}m ago
            </span>
          </div>
          <div className="short-big">
            <span className="mute">shw.link/</span>
            <span style={{color: "var(--accent)"}}>{url.slug}</span>
            <button className="btn btn-icon tt" data-tt="Copy" onClick={copyShort}>
              <Icon name="copy" size={14}/>
            </button>
            <button className="btn btn-icon tt" data-tt="Open" onClick={() => window.open(url.target, "_blank")}>
              <Icon name="external" size={14}/>
            </button>
          </div>
          <div className="target-big mute">→ {url.target}</div>
          <div className="row" style={{gap: 24, marginTop: 18}}>
            <div>
              <div className="mute" style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em"}}>Total clicks</div>
              <div style={{fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em"}}>{url.clicks.toLocaleString()}</div>
            </div>
            <div>
              <div className="mute" style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em"}}>Unique visitors</div>
              <div style={{fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em"}}>{Math.round(url.clicks * 0.72).toLocaleString()}</div>
            </div>
            <div>
              <div className="mute" style={{fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em"}}>Peak day</div>
              <div style={{fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em"}}>{Math.max(...series).toLocaleString()}</div>
            </div>
          </div>
        </div>
        <div className="qr-wrap">
          <QRCode value={shortUrl} size={120} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="card glass">
          <div className="card-title">
            <h3 className="h3">Clicks over time</h3>
            <div className="seg">
              {["7d", "30d", "90d"].map(r =>
                <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>{r}</button>
              )}
            </div>
          </div>
          <LineChart data={range === "7d" ? series.slice(-7) : range === "90d" ? [...series, ...series, ...series].slice(0, 90) : series} />
        </div>
        <div className="card glass">
          <div className="card-title">
            <h3 className="h3">Top countries</h3>
            <Icon name="globe" size={14} />
          </div>
          <div className="geo-list">
            {s.geo.slice(0, 8).map(g => (
              <div key={g.code} className="geo-item">
                <div className="flag">{g.code}</div>
                <div>
                  <div style={{display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12}}>
                    <span>{g.name}</span>
                    <span className="mute">{((g.count / totalGeo) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="geo-bar">
                    <div className="fill" style={{width: `${(g.count / s.geo[0].count) * 100}%`}}/>
                  </div>
                </div>
                <div style={{fontVariantNumeric: "tabular-nums", fontSize: 13}}>{g.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card glass">
        <div className="card-title">
          <h3 className="h3">Visitor geography</h3>
          <span className="mute" style={{fontSize: 12}}>{totalGeo.toLocaleString()} clicks across {s.geo.length} countries</span>
        </div>
        <WorldMap points={s.geo} />
      </div>

      <div className="stats-row2">
        <div className="card glass">
          <div className="card-title">
            <h3 className="h3">Uptime — last 30 days</h3>
            <span className="chip chip-alive"><span className="chip-dot"/>99.3%</span>
          </div>
          <div className="uptime">
            {s.uptime.map((u, i) => (
              <div key={i} className={`bar ${u === 0 ? "down" : u < 1 ? "partial" : ""}`}
                   title={`Day -${30 - i} · ${u === 0 ? "down" : u < 1 ? "partial" : "100%"}`} />
            ))}
          </div>
          <div className="uptime-legend">
            <span><span className="swatch" style={{background: "oklch(0.75 0.18 150)"}}/>Up</span>
            <span><span className="swatch" style={{background: "oklch(0.75 0.15 80)"}}/>Partial</span>
            <span><span className="swatch" style={{background: "oklch(0.70 0.22 25)"}}/>Down</span>
            <span className="mute" style={{marginLeft: "auto"}}>Checked daily at 03:00 UTC</span>
          </div>
        </div>

        <div className="card glass">
          <div className="card-title"><h3 className="h3">Devices</h3></div>
          <div className="bd-list">
            {s.devices.map(d => (
              <div key={d.name} className="bd-item">
                <div className="bd-head"><span>{d.name}</span><span className="mute">{d.value}%</span></div>
                <div className="bd-bar"><div className="fill" style={{width: `${d.value}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-row2">
        <div className="card glass">
          <div className="card-title"><h3 className="h3">Top referrers</h3></div>
          <div className="bd-list">
            {s.referrers.map(d => (
              <div key={d.name} className="bd-item">
                <div className="bd-head">
                  <span className="mono" style={{fontSize: 12}}>{d.name}</span>
                  <span className="mute">{d.value}%</span>
                </div>
                <div className="bd-bar"><div className="fill" style={{width: `${d.value * 2.5}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card glass">
          <div className="card-title"><h3 className="h3">Browsers</h3></div>
          <div className="bd-list">
            {s.browsers.map(d => (
              <div key={d.name} className="bd-item">
                <div className="bd-head"><span>{d.name}</span><span className="mute">{d.value}%</span></div>
                <div className="bd-bar"><div className="fill" style={{width: `${d.value * 1.5}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Stats = Stats;
