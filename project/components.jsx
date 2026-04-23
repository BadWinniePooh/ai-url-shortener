// Icons, captchas, charts, small shared UI atoms

const Icon = ({ name, size = 16, ...props }) => {
  const paths = {
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    list: <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    check: <><path d="M20 6 9 17l-5-5"/></>,
    chevronRight: <><path d="m9 18 6-6-6-6"/></>,
    chevronLeft: <><path d="m15 18-6-6 6-6"/></>,
    chart: <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-5"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    trash: <><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></>,
    qr: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M20 14h1v1h-1z"/><path d="M17 20h4"/><path d="M14 17h1"/></>,
    more: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></>,
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    arrow: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></>,
    wave: <><path d="M2 12c2 0 2-4 5-4s3 8 5 8 2-8 5-8 3 4 5 4"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,
    zap: <><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
};

/* ---------------- CAPTCHA VARIANTS ---------------- */

const CheckboxCaptcha = ({ onVerified, verified }) => {
  const [state, setState] = React.useState(verified ? "done" : "idle");
  React.useEffect(() => { if (verified) setState("done"); }, [verified]);
  const click = () => {
    if (state !== "idle") return;
    setState("verifying");
    setTimeout(() => { setState("done"); onVerified && onVerified(); }, 1100);
  };
  return (
    <div className="captcha-box glass">
      <div
        className={`captcha-check ${state === "verifying" ? "verifying" : ""} ${state === "done" ? "verified" : ""}`}
        onClick={click}
      >
        {state === "done" && <Icon name="check" size={14} />}
      </div>
      <div className="captcha-label">
        {state === "done" ? "Verified — you're human." : "I'm not a robot"}
      </div>
      <div className="captcha-brand">
        shortwave<br/>verify
      </div>
    </div>
  );
};

const SliderCaptcha = ({ onVerified, verified }) => {
  const [x, setX] = React.useState(0);
  const [done, setDone] = React.useState(!!verified);
  const trackRef = React.useRef(null);
  const draggingRef = React.useRef(false);

  React.useEffect(() => { if (verified) setDone(true); }, [verified]);

  const onPointerDown = (e) => {
    if (done) return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current || done || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width - 44, e.clientX - rect.left - 22));
    setX(px);
  };
  const onPointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const rect = trackRef.current.getBoundingClientRect();
    // target gap at ~70% of pane width
    const paneWidth = rect.width;
    const targetX = paneWidth * 0.7 - 24;
    if (Math.abs(x - targetX) < 14) {
      setX(targetX);
      setDone(true);
      onVerified && onVerified();
    } else {
      setX(0);
    }
  };

  const paneW = trackRef.current ? trackRef.current.getBoundingClientRect().width : 320;
  const gapLeft = Math.max(0, paneW * 0.7 - 24);

  return (
    <div className="slider-cap glass">
      <div className="image-pane">
        <div className="gap" style={{ left: gapLeft }} />
        <div className="piece" style={{ left: x }} />
      </div>
      <div
        ref={trackRef}
        className="slider-track"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span>{done ? "Verified" : "Slide the puzzle piece into place →"}</span>
        <div className="slider-fill" style={{ width: x + 44 }} />
        <div
          className="slider-handle"
          style={{ left: x, background: done ? "oklch(0.72 0.18 150)" : undefined }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {done
            ? <Icon name="check" size={16} />
            : <Icon name="arrow" size={16} />
          }
        </div>
      </div>
    </div>
  );
};

const PoWCaptcha = ({ onVerified, verified }) => {
  const [done, setDone] = React.useState(!!verified);
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [nonce, setNonce] = React.useState(0);
  const [hash, setHash] = React.useState("a73f1c0e9d8b6a42f0e5c1b3a7f9e2d4c6b8a0f2e4d6c8b0a2f4e6d8c0b2a4f6");
  const target = "0000";

  React.useEffect(() => { if (verified) setDone(true); }, [verified]);

  const solve = () => {
    if (done) return;
    setRunning(true);
    setProgress(0);
    let step = 0;
    const totalSteps = 60;
    const id = setInterval(() => {
      step++;
      setProgress(step / totalSteps * 100);
      setNonce(n => n + Math.floor(Math.random() * 1200 + 200));
      // fake hash
      const chars = "0123456789abcdef";
      let h = "";
      for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
      setHash(h);
      if (step >= totalSteps) {
        clearInterval(id);
        setHash("0000" + "a2c7f91b3e5d8c2a6f4e7d0b9c3a5f18e6d2c7b4a9e0f3d5c1b8a46e9d7c0");
        setProgress(100);
        setRunning(false);
        setDone(true);
        onVerified && onVerified();
      }
    }, 28);
  };

  return (
    <div className="pow-cap glass">
      <div className="pow-head">
        <Icon name="shield" size={18} />
        <div className="grow" style={{fontSize: 13}}>
          <div>Proof-of-Work challenge</div>
          <div className="mute" style={{fontSize: 11}}>
            Find hash prefix <span className="mono" style={{color:"var(--accent)"}}>{target}</span> · target difficulty 16
          </div>
        </div>
        {!done && !running && (
          <button className="btn btn-primary" style={{padding: "6px 12px", fontSize: 12}} onClick={solve}>
            Solve
          </button>
        )}
        {done && (
          <span className="chip chip-alive">
            <span className="chip-dot" />
            Verified
          </span>
        )}
      </div>
      <div className={`hash-line ${done ? "found" : ""}`}>
        nonce={nonce.toLocaleString()} · sha256={hash}
      </div>
      <div className="pow-progress">
        <div className="fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

const Captcha = ({ variant, onVerified, verified }) => {
  if (variant === "slider") return <SliderCaptcha onVerified={onVerified} verified={verified} />;
  if (variant === "pow") return <PoWCaptcha onVerified={onVerified} verified={verified} />;
  return <CheckboxCaptcha onVerified={onVerified} verified={verified} />;
};

/* ---------------- CHART ---------------- */

const LineChart = ({ data, height = 200 }) => {
  const w = 720;
  const h = height;
  const pad = { top: 20, right: 16, bottom: 28, left: 36 };
  const max = Math.max(...data) * 1.15;
  const min = 0;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const xs = data.map((_, i) => pad.left + (i / (data.length - 1)) * innerW);
  const ys = data.map(v => pad.top + (1 - (v - min) / (max - min)) * innerH);
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${xs[xs.length - 1]} ${pad.top + innerH} L ${xs[0]} ${pad.top + innerH} Z`;

  const yTicks = 4;
  const ticks = Array.from({length: yTicks + 1}, (_, i) => {
    const v = (max / yTicks) * i;
    const y = pad.top + (1 - (v - min) / (max - min)) * innerH;
    return { v, y };
  });

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        {/* grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} x2={w - pad.right} y1={t.y} y2={t.y}
                  stroke="currentColor" strokeOpacity="0.08" />
            <text x={pad.left - 8} y={t.y + 4} textAnchor="end"
                  fontSize="10" fill="currentColor" fillOpacity="0.5">
              {Math.round(t.v).toLocaleString()}
            </text>
          </g>
        ))}
        {/* x ticks */}
        {[0, 9, 19, 29].map(i => (
          <text key={i} x={xs[i]} y={h - 8} textAnchor="middle"
                fontSize="10" fill="currentColor" fillOpacity="0.5">
            {30 - i}d
          </text>
        ))}
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
        {/* points */}
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r={i === xs.length - 1 ? 4 : 2.5}
                  fill="var(--accent)" opacity={i === xs.length - 1 ? 1 : 0.6}>
            <title>{data[i].toLocaleString()} clicks · day {30 - i}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
};

/* ---------------- WORLD MAP (simplified dots) ---------------- */

const WorldMap = ({ points }) => {
  // simple continent silhouette using low-fidelity shapes
  // viewbox 960 x 440
  return (
    <div className="world-map">
      <svg viewBox="0 0 960 440" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* dotted map grid (approximate continents with dots on a hex-ish grid) */}
        <g fill="currentColor" fillOpacity="0.18">
          {Array.from({length: 44}, (_, row) => {
            return Array.from({length: 96}, (_, col) => {
              const x = col * 10 + (row % 2 ? 5 : 0);
              const y = row * 10 + 10;
              // rough continent mask using sine bands + noise-ish
              const inLand = maskLand(x, y);
              if (!inLand) return null;
              return <circle key={`${row}-${col}`} cx={x} cy={y} r="1.4" />;
            });
          })}
        </g>
        {/* points */}
        {points.map(p => (
          <g key={p.code} transform={`translate(${p.x}, ${p.y})`}>
            <circle r="16" fill="url(#pulseGrad)" className="pulse" />
            <circle r={4 + Math.log10(Math.max(p.count, 10)) * 1.8} fill="var(--accent)" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" />
            <text y="-10" textAnchor="middle" fontSize="10"
                  fill="currentColor" fillOpacity="0.85" fontWeight="600">
              {p.code} {p.count.toLocaleString()}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// crude land mask for decorative dotted world map
function maskLand(x, y) {
  // North America
  if (x > 80 && x < 280 && y > 80 && y < 230) {
    const edge = Math.abs(x - 180) / 100 + Math.abs(y - 150) / 100;
    if (edge < 1.0 && !(x < 120 && y > 200)) return true;
  }
  // South America
  if (x > 220 && x < 340 && y > 240 && y < 380) {
    const edge = Math.abs(x - 290) / 70 + Math.abs(y - 310) / 80;
    if (edge < 1.0) return true;
  }
  // Europe
  if (x > 430 && x < 540 && y > 100 && y < 200) {
    const edge = Math.abs(x - 485) / 55 + Math.abs(y - 150) / 55;
    if (edge < 1.0) return true;
  }
  // Africa
  if (x > 450 && x < 580 && y > 180 && y < 340) {
    const edge = Math.abs(x - 510) / 65 + Math.abs(y - 260) / 85;
    if (edge < 1.0) return true;
  }
  // Asia
  if (x > 540 && x < 840 && y > 90 && y < 260) {
    const edge = Math.abs(x - 690) / 160 + Math.abs(y - 170) / 90;
    if (edge < 1.0 && !(x < 580 && y > 200)) return true;
  }
  // Australia
  if (x > 790 && x < 900 && y > 310 && y < 370) {
    const edge = Math.abs(x - 845) / 50 + Math.abs(y - 340) / 30;
    if (edge < 1.0) return true;
  }
  return false;
}

/* ---------------- QR CODE (deterministic random pattern) ---------------- */

const QRCode = ({ value, size = 128 }) => {
  // Deterministic pseudo-QR pattern from string — decorative (not a scannable code)
  const n = 25;
  const cells = React.useMemo(() => {
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed >>> 8) & 0xff; };
    const grid = Array.from({length: n}, () => Array(n).fill(0));
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) grid[y][x] = (rand() & 1);
    // 3 position markers
    const drawMarker = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const on = (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4));
        grid[oy+y][ox+x] = on ? 1 : 0;
      }
    };
    drawMarker(0, 0); drawMarker(n-7, 0); drawMarker(0, n-7);
    return grid;
  }, [value]);
  const cell = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((row, y) => row.map((v, x) => v
        ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0a0a0f" />
        : null))}
    </svg>
  );
};

/* ---------------- TOAST ---------------- */

const ToastContext = React.createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, ...opts }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 2200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className="toast glass-strong">
            {t.icon && <Icon name={t.icon} size={14} />}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

Object.assign(window, {
  Icon, Captcha, CheckboxCaptcha, SliderCaptcha, PoWCaptcha,
  LineChart, WorldMap, QRCode,
  ToastContext, ToastProvider,
});
