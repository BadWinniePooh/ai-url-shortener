// Root app: routing, state, tweaks panel

const LS_KEY = "shortwave_state_v1";

const loadState = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
};
const saveState = (s) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
};

const App = () => {
  const persisted = loadState();
  const [user, setUser] = React.useState(persisted.user || null);
  const [route, setRoute] = React.useState(persisted.route || { name: "dashboard" });
  const [urls, setUrls] = React.useState(window.SAMPLE_URLS);
  const [newShort, setNewShort] = React.useState(null);

  // Tweak state (defaults wrapped in EDITMODE markers for persistence)
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "dark",
    "accent": "cyan",
    "captcha": "checkbox",
    "layout": "grid",
    "density": "comfortable"
  }/*EDITMODE-END*/;
  const [tweaks, setTweaks] = React.useState({ ...TWEAK_DEFAULTS, ...(persisted.tweaks || {}) });
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  // edit mode protocol
  React.useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.type === "__activate_edit_mode") setTweaksOpen(true);
      if (d.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({type: "__edit_mode_available"}, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const setTweak = (key, value) => {
    setTweaks(t => {
      const next = { ...t, [key]: value };
      window.parent.postMessage({type: "__edit_mode_set_keys", edits: {[key]: value}}, "*");
      return next;
    });
  };

  // Apply accent + theme to document
  React.useEffect(() => {
    const accents = {
      cyan:   210,
      violet: 290,
      lime:   130,
      amber:  70,
      rose:   15,
    };
    document.documentElement.style.setProperty("--accent-h", accents[tweaks.accent] ?? 210);
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.setAttribute("data-density", tweaks.density);
  }, [tweaks.theme, tweaks.accent, tweaks.density]);

  // persist
  React.useEffect(() => {
    saveState({ user, route, tweaks });
  }, [user, route, tweaks]);

  const onAuthed = (u) => { setUser(u); setRoute({ name: "dashboard" }); };
  const signOut = () => { setUser(null); setRoute({ name: "dashboard" }); };

  const push = (msg, opts) => window.__toast && window.__toast(msg, opts);

  const onCreate = (url) => {
    setUrls(u => [url, ...u]);
    setNewShort(url);
    push("Link created", { icon: "check" });
  };
  const onCopy = (u) => {
    const s = `https://shw.link/${u.slug}`;
    navigator.clipboard && navigator.clipboard.writeText(s);
    push("Copied " + s, { icon: "copy" });
  };
  const onDelete = (u) => {
    setUrls(urls.filter(x => x.slug !== u.slug));
    push("Deleted " + u.slug);
  };
  const onOpen = (slug) => setRoute({ name: "stats", slug });

  const currentUrl = route.name === "stats" ? urls.find(u => u.slug === route.slug) : null;

  return (
    <ToastProvider>
      <ToastAttach />
      <div className="mesh-bg">
        <div className="blob" />
        <div className="grain" />
      </div>
      <div className="app">
        {user && (
          <div className="topbar">
            <div className="brand" onClick={() => setRoute({name: "dashboard"})} style={{cursor: "pointer"}}>
              <div className="brand-mark"><Icon name="wave" size={14}/></div>
              <span>Shortwave</span>
            </div>
            <div className="grow" />
            <button className="btn btn-ghost" onClick={() => setRoute({name: "dashboard"})}>
              <Icon name="link" size={14}/>
              Links
            </button>
            <UserMenu user={user} onSignOut={signOut} />
          </div>
        )}

        {!user && (
          <AuthScreen onAuthed={onAuthed} captchaVariant={tweaks.captcha} />
        )}

        {user && route.name === "dashboard" && (
          <Dashboard
            urls={urls}
            layout={tweaks.layout}
            onLayout={(l) => setTweak("layout", l)}
            onOpen={onOpen}
            onCreate={onCreate}
            onCopy={onCopy}
            onDelete={onDelete}
            captchaVariant={tweaks.captcha}
            push={push}
          />
        )}

        {user && route.name === "stats" && currentUrl && (
          <Stats url={currentUrl} onBack={() => setRoute({ name: "dashboard" })} />
        )}

        {user && route.name === "stats" && !currentUrl && (
          <div className="dashboard">
            <div className="glass empty">
              <h3 className="h3">Link not found</h3>
              <button className="btn btn-primary" onClick={() => setRoute({name: "dashboard"})}>Back to links</button>
            </div>
          </div>
        )}

        {/* Newly-shortened modal */}
        {newShort && (
          <div className="modal-backdrop" onClick={() => setNewShort(null)}>
            <div className="modal glass-strong" onClick={e => e.stopPropagation()}>
              <h2 className="h2">Your short link is live</h2>
              <p className="sub">Anyone with this link can open <span className="mono">{newShort.target.slice(0, 50)}{newShort.target.length > 50 ? "…" : ""}</span></p>
              <div className="result-short">
                <span><span className="mute">https://</span>shw.link/<span style={{color: "var(--accent)"}}>{newShort.slug}</span></span>
                <button className="btn btn-icon" onClick={() => {
                  navigator.clipboard && navigator.clipboard.writeText(`https://shw.link/${newShort.slug}`);
                  push("Copied", { icon: "copy" });
                }}>
                  <Icon name="copy" size={14}/>
                </button>
              </div>
              <div className="row" style={{justifyContent: "flex-end", gap: 8}}>
                <button className="btn" onClick={() => setNewShort(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => { onOpen(newShort.slug); setNewShort(null); }}>
                  View stats
                  <Icon name="arrow" size={14}/>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tweaks panel */}
        <TweaksButton open={tweaksOpen} onToggle={() => setTweaksOpen(o => !o)} />
        {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setTweaksOpen(false)} />}
      </div>
    </ToastProvider>
  );
};

const ToastAttach = () => {
  const push = React.useContext(ToastContext);
  React.useEffect(() => { window.__toast = push; }, [push]);
  return null;
};

const UserMenu = ({ user, onSignOut }) => {
  const [open, setOpen] = React.useState(false);
  const initials = (user.name || user.email).split(/[\s@]/)[0].slice(0, 2).toUpperCase();
  return (
    <div style={{position: "relative"}}>
      <div className="topbar-user" onClick={() => setOpen(o => !o)}>
        <div className="avatar">{initials}</div>
        <span>{user.name || user.email}</span>
        <Icon name="chevronRight" size={12} style={{transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform .15s"}} />
      </div>
      {open && (
        <div className="glass-strong" style={{position: "absolute", right: 0, top: "calc(100% + 6px)", minWidth: 200, padding: 8, zIndex: 20}}>
          <div style={{padding: "8px 10px", borderBottom: "1px solid var(--glass-border)", marginBottom: 6}}>
            <div style={{fontSize: 13, fontWeight: 500}}>{user.name || user.email}</div>
            <div className="mute" style={{fontSize: 11}}>{user.email}</div>
          </div>
          <button className="btn btn-ghost" style={{width:"100%", justifyContent:"flex-start"}}>
            <Icon name="settings" size={14}/>Settings
          </button>
          <button className="btn btn-ghost" style={{width:"100%", justifyContent:"flex-start", color: "oklch(0.7 0.22 25)"}}
                  onClick={onSignOut}>
            <Icon name="logout" size={14}/>Sign out
          </button>
        </div>
      )}
    </div>
  );
};

const TweaksButton = ({ open, onToggle }) => (
  <button className="tweaks-fab tt" data-tt={open ? "Close tweaks" : "Open tweaks"} onClick={onToggle}>
    {open ? <Icon name="x" size={16}/> : <Icon name="settings" size={16}/>}
  </button>
);

const TweaksPanel = ({ tweaks, setTweak, onClose }) => {
  const accentSwatches = [
    ["cyan",   "oklch(0.78 0.16 210)"],
    ["violet", "oklch(0.68 0.22 290)"],
    ["lime",   "oklch(0.84 0.19 130)"],
    ["amber",  "oklch(0.82 0.17 70)"],
    ["rose",   "oklch(0.72 0.20 15)"],
  ];
  return (
    <div className="tweaks-panel glass-strong">
      <div className="row between">
        <h4>Tweaks</h4>
        <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>

      <div className="row">
        <div className="row-label" style={{flex: 1}}>Theme</div>
        <div className="seg">
          <button className={tweaks.theme === "dark" ? "active" : ""} onClick={() => setTweak("theme", "dark")}>
            <Icon name="moon" size={12}/>
          </button>
          <button className={tweaks.theme === "light" ? "active" : ""} onClick={() => setTweak("theme", "light")}>
            <Icon name="sun" size={12}/>
          </button>
        </div>
      </div>

      <div className="row">
        <div className="row-label" style={{flex: 1}}>Accent</div>
        <div className="accent-swatches">
          {accentSwatches.map(([k, c]) => (
            <div key={k} className={`sw ${tweaks.accent === k ? "active" : ""}`}
                 style={{background: c}}
                 onClick={() => setTweak("accent", k)} />
          ))}
        </div>
      </div>

      <div className="col" style={{gap: 6}}>
        <div className="row-label">Captcha style</div>
        <div className="opts">
          {[["checkbox", "Checkbox"], ["slider", "Puzzle slide"], ["pow", "Proof-of-work"]].map(([k, label]) => (
            <div key={k} className={`opt ${tweaks.captcha === k ? "active" : ""}`}
                 onClick={() => setTweak("captcha", k)}>{label}</div>
          ))}
        </div>
      </div>

      <div className="col" style={{gap: 6}}>
        <div className="row-label">Dashboard layout</div>
        <div className="opts">
          {[["grid", "Grid"], ["list", "List"]].map(([k, label]) => (
            <div key={k} className={`opt ${tweaks.layout === k ? "active" : ""}`}
                 onClick={() => setTweak("layout", k)}>{label}</div>
          ))}
        </div>
      </div>

      <div className="col" style={{gap: 6}}>
        <div className="row-label">Density</div>
        <div className="opts">
          {[["comfortable", "Comfortable"], ["compact", "Compact"]].map(([k, label]) => (
            <div key={k} className={`opt ${tweaks.density === k ? "active" : ""}`}
                 onClick={() => setTweak("density", k)}>{label}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
