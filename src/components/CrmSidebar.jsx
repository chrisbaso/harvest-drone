import { useState } from "react";

const sidebarIcons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1" width="7" height="7" rx="1.5" />
      <rect x="10" y="1" width="7" height="4" rx="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" />
      <rect x="10" y="7" width="7" height="10" rx="1.5" />
    </svg>
  ),
  leads: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1v16M1 9h16" />
      <circle cx="9" cy="9" r="7" />
    </svg>
  ),
  opportunities: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 14l4-5 4 3 4-7 4 5" />
      <path d="M1 17h16" />
    </svg>
  ),
  operators: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="5" r="3.5" />
      <path d="M2 16.5c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" />
    </svg>
  ),
  growers: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17V8" />
      <path d="M9 8c0-4 3-6 6-7-1 3-2 5-6 7z" />
      <path d="M9 8c0-4-3-6-6-7 1 3 2 5 6 7z" />
      <path d="M4 17h10" />
    </svg>
  ),
  hylio: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2l2.5 5H15l-3.5 3.5L13 16l-4-2.5L5 16l1.5-5.5L3 7h3.5z" />
    </svg>
  ),
  activities: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4h16M1 9h16M1 14h10" />
    </svg>
  ),
  accounts: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="12" rx="2" />
      <path d="M6 7h6M6 11h4" />
    </svg>
  ),
  acres: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 13l4-3 3 2 4-5 5 4" />
      <rect x="1" y="1" width="16" height="16" rx="2" />
    </svg>
  ),
  automations: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="12" rx="2" />
      <path d="M6 1v4M12 1v4M5 9h2l1 2 2-4 1 2h2" />
    </svg>
  ),
};

const css = `
.crmside {
  --cs-bg: #0E1209;
  --cs-surface: #161C11;
  --cs-border: rgba(255,255,255,0.06);
  --cs-text: #C8CCBF;
  --cs-text-muted: #727966;
  --cs-accent: #A3D977;
  --cs-accent-dim: rgba(163,217,119,0.10);
  --cs-active-bg: rgba(163,217,119,0.08);
  --cs-hover-bg: rgba(255,255,255,0.03);
  --cs-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;
  --cs-serif: 'DM Serif Display', Georgia, serif;

  display: flex;
  flex-direction: column;
  width: 280px;
  min-height: 100%;
  background: var(--cs-bg);
  border-right: 1px solid var(--cs-border);
  font-family: var(--cs-sans);
  -webkit-font-smoothing: antialiased;
  overflow-y: auto;
  flex-shrink: 0;
}

.crmside__brand {
  padding: 28px 24px 20px;
  border-bottom: 1px solid var(--cs-border);
}
.crmside__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.crmside__logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--cs-accent) 0%, #6BBF3B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.crmside__logo-mark svg {
  width: 16px;
  height: 16px;
  color: var(--cs-bg);
}
.crmside__logo-text {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
}
.crmside__subtitle {
  font-size: 12px;
  color: var(--cs-text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  margin: 0;
}

.crmside__section-label {
  padding: 20px 24px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cs-text-muted);
}

.crmside__nav {
  display: flex;
  flex-direction: column;
  padding: 4px 12px;
  gap: 2px;
  flex: 1;
}
.crmside__link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--cs-text);
  font-family: var(--cs-sans);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  position: relative;
}
.crmside__link:hover {
  background: var(--cs-hover-bg);
}
.crmside__link.is-active {
  background: var(--cs-active-bg);
  color: #fff;
}
.crmside__link.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--cs-accent);
}
.crmside__link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,255,255,0.04);
  color: var(--cs-text-muted);
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}
.crmside__link.is-active .crmside__link-icon {
  background: var(--cs-accent-dim);
  color: var(--cs-accent);
}
.crmside__link-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.crmside__link-copy strong {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
}
.crmside__link-copy span {
  font-size: 11.5px;
  color: var(--cs-text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.crmside__link.is-active .crmside__link-copy span {
  color: rgba(163,217,119,0.6);
}
.crmside__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--cs-text-muted);
  background: rgba(255,255,255,0.04);
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 28px;
  text-align: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.crmside__link.is-active .crmside__count {
  background: var(--cs-accent-dim);
  color: var(--cs-accent);
}

.crmside__toggle {
  display: none;
}

@media (max-width: 900px) {
  .crmside {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  }
  .crmside.is-open {
    transform: translateX(0);
  }
  .crmside__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 101;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--cs-border);
    background: var(--cs-bg);
    color: var(--cs-text);
    cursor: pointer;
  }
  .crmside__backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
    background: rgba(0,0,0,0.6);
  }
}
`;

function CrmSidebar({ sections, activeSection, onSelect }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSelect(id) {
    onSelect(id);
    setMobileOpen(false);
  }

  return (
    <>
      <style>{css}</style>

      <button
        type="button"
        className="crmside__toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open CRM navigation"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {mobileOpen && (
        <div className="crmside__backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`crmside${mobileOpen ? " is-open" : ""}`}>
        <div className="crmside__brand">
          <div className="crmside__logo">
            <div className="crmside__logo-mark">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 14V6" />
                <path d="M8 6c0-3 2.5-5 5-5.5-.5 2.5-1.5 4-5 5.5z" />
                <path d="M8 6c0-3-2.5-5-5-5.5.5 2.5 1.5 4 5 5.5z" />
              </svg>
            </div>
            <span className="crmside__logo-text">Harvest Drone</span>
          </div>
          <p className="crmside__subtitle">Revenue operating system</p>
        </div>

        <div className="crmside__section-label">Workspace</div>

        <nav className="crmside__nav" aria-label="CRM sections">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`crmside__link${section.id === activeSection ? " is-active" : ""}`}
              onClick={() => handleSelect(section.id)}
            >
              <div className="crmside__link-icon">
                {sidebarIcons[section.id] || sidebarIcons.dashboard}
              </div>
              <div className="crmside__link-copy">
                <strong>{section.label}</strong>
                <span>{section.description}</span>
              </div>
              <span className="crmside__count">{section.count}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default CrmSidebar;
