import React from 'react';
import { Icon } from './Icons.jsx';

export const CheckboxCaptcha = ({ onVerified, verified }) => {
  const [state, setState] = React.useState(verified ? 'done' : 'idle');
  React.useEffect(() => { if (verified) setState('done'); }, [verified]);

  const click = () => {
    if (state !== 'idle') return;
    setState('verifying');
    setTimeout(() => { setState('done'); onVerified?.(); }, 1100);
  };

  return (
    <div className="captcha-box glass">
      <div
        className={`captcha-check ${state === 'verifying' ? 'verifying' : ''} ${state === 'done' ? 'verified' : ''}`}
        onClick={click}
      >
        {state === 'done' && <Icon name="check" size={14} />}
      </div>
      <div className="captcha-label">
        {state === 'done' ? "Verified — you're human." : "I'm not a robot"}
      </div>
      <div className="captcha-brand">shortwave<br/>verify</div>
    </div>
  );
};

export const SliderCaptcha = ({ onVerified, verified }) => {
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
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const rect = trackRef.current.getBoundingClientRect();
    const targetX = rect.width * 0.7 - 24;
    if (Math.abs(x - targetX) < 14) {
      setX(targetX);
      setDone(true);
      onVerified?.();
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
        <span>{done ? 'Verified' : 'Slide the puzzle piece into place →'}</span>
        <div className="slider-fill" style={{ width: x + 44 }} />
        <div
          className="slider-handle"
          style={{ left: x, background: done ? 'oklch(0.72 0.18 150)' : undefined }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {done ? <Icon name="check" size={16} /> : <Icon name="arrow" size={16} />}
        </div>
      </div>
    </div>
  );
};

export const PoWCaptcha = ({ onVerified, verified }) => {
  const [done, setDone] = React.useState(!!verified);
  const [running, setRunning] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [nonce, setNonce] = React.useState(0);
  const [hash, setHash] = React.useState('a73f1c0e9d8b6a42f0e5c1b3a7f9e2d4c6b8a0f2e4d6c8b0a2f4e6d8c0b2a4f6');

  React.useEffect(() => { if (verified) setDone(true); }, [verified]);

  const solve = () => {
    if (done) return;
    setRunning(true);
    setProgress(0);
    let step = 0;
    const total = 60;
    const id = setInterval(() => {
      step++;
      setProgress(step / total * 100);
      setNonce(n => n + Math.floor(Math.random() * 1200 + 200));
      const chars = '0123456789abcdef';
      setHash(Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join(''));
      if (step >= total) {
        clearInterval(id);
        setHash('0000a2c7f91b3e5d8c2a6f4e7d0b9c3a5f18e6d2c7b4a9e0f3d5c1b8a46e9d7c0');
        setProgress(100);
        setRunning(false);
        setDone(true);
        onVerified?.();
      }
    }, 28);
  };

  return (
    <div className="pow-cap glass">
      <div className="pow-head">
        <Icon name="shield" size={18} />
        <div className="grow" style={{ fontSize: 13 }}>
          <div>Proof-of-Work challenge</div>
          <div className="mute" style={{ fontSize: 11 }}>
            Find hash prefix <span className="mono" style={{ color: 'var(--accent)' }}>0000</span> · target difficulty 16
          </div>
        </div>
        {!done && !running && (
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={solve}>
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
      <div className={`hash-line ${done ? 'found' : ''}`}>
        nonce={nonce.toLocaleString()} · sha256={hash}
      </div>
      <div className="pow-progress">
        <div className="fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export const Captcha = ({ variant, onVerified, verified }) => {
  if (variant === 'slider') return <SliderCaptcha onVerified={onVerified} verified={verified} />;
  if (variant === 'pow') return <PoWCaptcha onVerified={onVerified} verified={verified} />;
  return <CheckboxCaptcha onVerified={onVerified} verified={verified} />;
};
