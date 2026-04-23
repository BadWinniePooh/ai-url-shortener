import React from 'react';
import { Icon } from './Icons.jsx';

export const TweaksButton = ({ open, onToggle }) => (
  <button className="tweaks-fab tt" data-tt={open ? 'Close tweaks' : 'Open tweaks'} onClick={onToggle}>
    {open ? <Icon name="x" size={16} /> : <Icon name="settings" size={16} />}
  </button>
);

export const TweaksPanel = ({ tweaks, setTweak, onClose }) => {
  const accentSwatches = [
    ['cyan',   'oklch(0.78 0.16 210)'],
    ['violet', 'oklch(0.68 0.22 290)'],
    ['lime',   'oklch(0.84 0.19 130)'],
    ['amber',  'oklch(0.82 0.17 70)'],
    ['rose',   'oklch(0.72 0.20 15)'],
  ];

  return (
    <div className="tweaks-panel glass-strong">
      <div className="row between">
        <h4>Tweaks</h4>
        <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" size={14} /></button>
      </div>

      <div className="row">
        <div className="row-label" style={{ flex: 1 }}>Theme</div>
        <div className="seg">
          <button className={tweaks.theme === 'dark' ? 'active' : ''} onClick={() => setTweak('theme', 'dark')}>
            <Icon name="moon" size={12} />
          </button>
          <button className={tweaks.theme === 'light' ? 'active' : ''} onClick={() => setTweak('theme', 'light')}>
            <Icon name="sun" size={12} />
          </button>
        </div>
      </div>

      <div className="row">
        <div className="row-label" style={{ flex: 1 }}>Accent</div>
        <div className="accent-swatches">
          {accentSwatches.map(([k, c]) => (
            <div key={k} className={`sw ${tweaks.accent === k ? 'active' : ''}`}
                 style={{ background: c }} onClick={() => setTweak('accent', k)} />
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <div className="row-label">Captcha style</div>
        <div className="opts">
          {[['checkbox', 'Checkbox'], ['slider', 'Puzzle slide'], ['pow', 'Proof-of-work']].map(([k, label]) => (
            <div key={k} className={`opt ${tweaks.captcha === k ? 'active' : ''}`}
                 onClick={() => setTweak('captcha', k)}>{label}</div>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <div className="row-label">Dashboard layout</div>
        <div className="opts">
          {[['grid', 'Grid'], ['list', 'List']].map(([k, label]) => (
            <div key={k} className={`opt ${tweaks.layout === k ? 'active' : ''}`}
                 onClick={() => setTweak('layout', k)}>{label}</div>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <div className="row-label">Density</div>
        <div className="opts">
          {[['comfortable', 'Comfortable'], ['compact', 'Compact']].map(([k, label]) => (
            <div key={k} className={`opt ${tweaks.density === k ? 'active' : ''}`}
                 onClick={() => setTweak('density', k)}>{label}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
