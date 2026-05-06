const css = `
  .enterprise-page {
    display: grid;
    gap: 1rem;
  }

  .enterprise-hero,
  .enterprise-panel,
  .enterprise-card {
    border-radius: 8px;
    min-width: 0;
  }

  .enterprise-hero,
  .enterprise-panel {
    padding: 1.25rem;
  }

  .enterprise-hero {
    display: grid;
    gap: 1rem;
    background:
      radial-gradient(circle at top right, rgba(136, 214, 108, 0.13), transparent 32%),
      linear-gradient(180deg, rgba(23, 37, 31, 0.98), rgba(9, 16, 13, 0.98));
  }

  .enterprise-page h1,
  .enterprise-page h2,
  .enterprise-page h3 {
    margin: 0;
    font-family: "Space Grotesk", sans-serif;
    letter-spacing: 0;
    line-height: 1;
  }

  .enterprise-page h1 {
    max-width: 14ch;
    font-size: clamp(2.1rem, 6vw, 4.4rem);
  }

  .enterprise-page p {
    margin: 0;
    color: var(--muted);
  }

  .enterprise-nav,
  .enterprise-actions,
  .enterprise-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .enterprise-panel__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .enterprise-nav {
    padding: 0.75rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
  }

  .enterprise-nav a {
    border-radius: 999px;
    padding: 0.62rem 0.85rem;
    color: var(--muted);
    border: 1px solid transparent;
  }

  .enterprise-nav a.is-active,
  .enterprise-nav a:hover {
    color: var(--text);
    border-color: rgba(136, 214, 108, 0.28);
    background: rgba(136, 214, 108, 0.1);
  }

  .enterprise-grid,
  .enterprise-grid--two,
  .enterprise-grid--three,
  .enterprise-stack {
    display: grid;
    gap: 1rem;
  }

  .enterprise-card {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.04);
  }

  .enterprise-card__label,
  .enterprise-table-label {
    color: var(--accent-warm);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .enterprise-kpi strong {
    display: block;
    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(1.5rem, 4vw, 2.3rem);
    line-height: 1;
  }

  .enterprise-kpi span,
  .enterprise-muted,
  .enterprise-list li {
    color: var(--muted);
  }

  .enterprise-demo-note {
    max-width: 58rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(213, 209, 154, 0.24);
    border-radius: 8px;
    background: rgba(213, 209, 154, 0.08);
    font-size: 0.92rem;
  }

  .enterprise-demo-path {
    display: grid;
    gap: 0.75rem;
  }

  .enterprise-demo-step {
    display: grid;
    gap: 0.25rem;
    padding: 0.9rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--text);
    background: rgba(255, 255, 255, 0.035);
  }

  .enterprise-demo-step span {
    color: var(--accent-warm);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .enterprise-demo-step small {
    color: var(--muted);
    line-height: 1.45;
  }

  .enterprise-inline-form {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
  }

  .enterprise-inline-form .field {
    margin: 0;
  }

  .enterprise-inline-form input,
  .enterprise-inline-form select {
    width: 100%;
  }

  .enterprise-form-actions {
    display: flex;
    align-items: end;
  }

  .enterprise-action-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .enterprise-action-strip--panel {
    padding: 0.8rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
  }

  .enterprise-progress {
    height: 0.58rem;
    overflow: hidden;
    border-radius: 999px;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.06);
  }

  .enterprise-progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--accent), var(--accent-warm));
  }

  .enterprise-status {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    border-radius: 999px;
    padding: 0.38rem 0.65rem;
    border: 1px solid var(--line);
    color: var(--text);
    font-size: 0.82rem;
    font-weight: 800;
    text-transform: capitalize;
  }

  .enterprise-status--ready,
  .enterprise-status--complete,
  .enterprise-status--closed,
  .enterprise-status--reviewed {
    border-color: rgba(90, 197, 136, 0.32);
    background: rgba(90, 197, 136, 0.12);
  }

  .enterprise-status--blocked,
  .enterprise-status--blocking,
  .enterprise-status--open {
    border-color: rgba(255, 124, 124, 0.28);
    background: rgba(255, 124, 124, 0.1);
  }

  .enterprise-status--watching,
  .enterprise-status--in_progress,
  .enterprise-status--active,
  .enterprise-status--waiting_on_vendor {
    border-color: rgba(213, 209, 154, 0.3);
    background: rgba(213, 209, 154, 0.1);
  }

  .enterprise-list {
    margin: 0;
    padding-left: 1.1rem;
  }

  .enterprise-list li + li {
    margin-top: 0.45rem;
  }

  .enterprise-table-wrap {
    max-width: 100%;
    min-width: 0;
    overflow-x: auto;
  }

  .enterprise-table-wrap table {
    min-width: 560px;
  }

  .enterprise-select-grid {
    display: grid;
    gap: 0.85rem;
  }

  .enterprise-alert {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 124, 124, 0.3);
    background: rgba(255, 124, 124, 0.09);
  }

  .enterprise-success {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(90, 197, 136, 0.32);
    background: rgba(90, 197, 136, 0.1);
  }

  @media (min-width: 760px) {
    .enterprise-hero,
    .enterprise-panel {
      padding: 1.75rem;
    }

    .enterprise-hero {
      grid-template-columns: 1.15fr 0.85fr;
      align-items: start;
    }

    .enterprise-grid--two,
    .enterprise-select-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .enterprise-grid--three {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .enterprise-demo-path {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .enterprise-inline-form {
      grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
      align-items: end;
    }

    .enterprise-inline-form--wide {
      grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
    }

    .enterprise-inline-form--compact {
      grid-template-columns: minmax(0, 1fr) 10rem auto;
    }
  }

  @media (min-width: 1080px) {
    .enterprise-grid {
      grid-template-columns: 1.35fr 0.65fr;
      align-items: start;
    }

    .enterprise-grid--three {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
`;

function EnterpriseStyles() {
  return <style>{css}</style>;
}

export default EnterpriseStyles;
