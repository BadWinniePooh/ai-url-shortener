import React from 'react';

export const LineChart = ({ data, height = 200 }) => {
  const w = 720, h = height;
  const pad = { top: 20, right: 16, bottom: 28, left: 36 };
  const max = Math.max(...data, 1) * 1.15;
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const xs = data.map((_, i) => pad.left + (i / Math.max(data.length - 1, 1)) * innerW);
  const ys = data.map(v => pad.top + (1 - v / max) * innerH);
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const areaPath = `${path} L ${xs[xs.length - 1]} ${pad.top + innerH} L ${xs[0]} ${pad.top + innerH} Z`;

  const ticks = Array.from({ length: 5 }, (_, i) => {
    const v = (max / 4) * i;
    const y = pad.top + (1 - v / max) * innerH;
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
        {[0, Math.floor(data.length / 3), Math.floor(data.length * 2 / 3), data.length - 1].map(i => (
          xs[i] !== undefined && (
            <text key={i} x={xs[i]} y={h - 8} textAnchor="middle"
                  fontSize="10" fill="currentColor" fillOpacity="0.5">
              {data.length - i}d
            </text>
          )
        ))}
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r={i === xs.length - 1 ? 4 : 2.5}
                  fill="var(--accent)" opacity={i === xs.length - 1 ? 1 : 0.6}>
            <title>{data[i].toLocaleString()} clicks · day {data.length - i}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
};

function maskLand(x, y) {
  if (x > 80 && x < 280 && y > 80 && y < 230) {
    return Math.abs(x - 180) / 100 + Math.abs(y - 150) / 100 < 1.0 && !(x < 120 && y > 200);
  }
  if (x > 220 && x < 340 && y > 240 && y < 380) {
    return Math.abs(x - 290) / 70 + Math.abs(y - 310) / 80 < 1.0;
  }
  if (x > 430 && x < 540 && y > 100 && y < 200) {
    return Math.abs(x - 485) / 55 + Math.abs(y - 150) / 55 < 1.0;
  }
  if (x > 450 && x < 580 && y > 180 && y < 340) {
    return Math.abs(x - 510) / 65 + Math.abs(y - 260) / 85 < 1.0;
  }
  if (x > 540 && x < 840 && y > 90 && y < 260) {
    return Math.abs(x - 690) / 160 + Math.abs(y - 170) / 90 < 1.0 && !(x < 580 && y > 200);
  }
  if (x > 790 && x < 900 && y > 310 && y < 370) {
    return Math.abs(x - 845) / 50 + Math.abs(y - 340) / 30 < 1.0;
  }
  return false;
}

export const WorldMap = ({ points }) => (
  <div className="world-map">
    <svg viewBox="0 0 960 440" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <g fill="currentColor" fillOpacity="0.18">
        {Array.from({ length: 44 }, (_, row) =>
          Array.from({ length: 96 }, (_, col) => {
            const x = col * 10 + (row % 2 ? 5 : 0);
            const y = row * 10 + 10;
            if (!maskLand(x, y)) return null;
            return <circle key={`${row}-${col}`} cx={x} cy={y} r="1.4" />;
          })
        )}
      </g>
      {points.map(p => (
        <g key={p.code} transform={`translate(${p.x}, ${p.y})`}>
          <circle r="16" fill="url(#pulseGrad)" style={{ transformOrigin: 'center', animation: 'pulse 2s ease-in-out infinite' }} />
          <circle r={4 + Math.log10(Math.max(p.count, 10)) * 1.8} fill="var(--accent)" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" />
          <text y="-10" textAnchor="middle" fontSize="10" fill="currentColor" fillOpacity="0.85" fontWeight="600">
            {p.code} {p.count.toLocaleString()}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

export const QRCode = ({ value, size = 128 }) => {
  const n = 25;
  const cells = React.useMemo(() => {
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed >>> 8) & 0xff; };
    const grid = Array.from({ length: n }, () => Array(n).fill(0));
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) grid[y][x] = rand() & 1;
    const drawMarker = (ox, oy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        grid[oy + y][ox + x] = (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) ? 1 : 0;
      }
    };
    drawMarker(0, 0); drawMarker(n - 7, 0); drawMarker(0, n - 7);
    return grid;
  }, [value]);

  const cell = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((row, y) => row.map((v, x) =>
        v ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0a0a0f" /> : null
      ))}
    </svg>
  );
};
