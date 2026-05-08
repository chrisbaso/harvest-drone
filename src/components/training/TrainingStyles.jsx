const css = `
  .training-page {
    display: grid;
    gap: 1.25rem;
    --training-surface: rgba(255, 255, 255, 0.045);
    --training-surface-strong: rgba(255, 255, 255, 0.075);
    --training-border: rgba(255, 255, 255, 0.085);
    --training-muted: #9ba492;
  }

  .training-hero,
  .training-header,
  .training-reader,
  .training-assessment,
  .training-checklist,
  .training-readiness {
    padding: 1.25rem;
  }

  .training-hero {
    display: grid;
    gap: 1.1rem;
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(24, 39, 32, 0.98), rgba(10, 17, 14, 0.98));
  }

  .training-hero h1,
  .training-header h1,
  .training-reader h1,
  .training-assessment h1,
  .training-checklist h1,
  .training-readiness h2,
  .training-card h2,
  .training-module h2 {
    margin: 0;
    font-family: "Space Grotesk", sans-serif;
    letter-spacing: 0;
    line-height: 1;
  }

  .training-hero h1,
  .training-header h1 {
    font-size: clamp(2rem, 5vw, 3.4rem);
    max-width: 16ch;
  }

  .training-hero p,
  .training-header p,
  .training-card p,
  .training-reader__meta,
  .training-reader__source,
  .training-reader__body p,
  .training-assessment p,
  .training-checklist p,
  .training-module span,
  .training-lesson-row span,
  .training-explanation {
    color: var(--muted);
  }

  .training-actions,
  .training-reader__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .training-status-panel,
  .training-card,
  .training-module,
  .training-callout,
  .training-question,
  .training-result {
    border: 1px solid var(--training-border);
    border-radius: 8px;
    background: var(--training-surface);
  }

  .training-status-panel,
  .training-card,
  .training-module {
    padding: 1rem;
  }

  .training-status-panel span,
  .training-card__meta,
  .training-module__number {
    display: block;
    color: var(--accent-warm);
    font-size: 0.76rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
  }

  .training-status-panel strong {
    display: block;
    margin-top: 0.35rem;
    font-family: "Space Grotesk", sans-serif;
    font-size: 1.55rem;
  }

  .training-ready-badge,
  .training-chip {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    border-radius: 999px;
    padding: 0.45rem 0.75rem;
    font-weight: 700;
    border: 1px solid var(--line);
  }

  .training-ready-badge.is-ready,
  .training-result.is-pass,
  .training-readiness.is-ready {
    border-color: rgba(90, 197, 136, 0.32);
    background: rgba(90, 197, 136, 0.1);
  }

  .training-ready-badge.is-blocked,
  .training-result.is-fail,
  .training-readiness.is-blocked {
    border-color: rgba(255, 124, 124, 0.28);
    background: rgba(255, 124, 124, 0.08);
  }

  .training-grid,
  .training-module-list {
    display: grid;
    gap: 1rem;
  }

  .training-classroom {
    display: grid;
    gap: 1rem;
  }

  .training-classroom__main,
  .training-classroom__rail,
  .training-course-shell,
  .training-reader-shell {
    display: grid;
    gap: 1rem;
  }

  .training-section-title {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
  }

  .training-section-title h2 {
    margin: 0;
    font-family: "Space Grotesk", sans-serif;
    letter-spacing: 0;
    line-height: 1;
  }

  .training-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.35rem;
    border: 1px solid var(--training-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
  }

  .training-tab {
    display: inline-flex;
    align-items: center;
    min-height: 2.2rem;
    border-radius: 6px;
    padding: 0.45rem 0.75rem;
    color: var(--muted);
    font-weight: 800;
    text-decoration: none;
  }

  .training-tab.is-active {
    background: rgba(163, 217, 119, 0.13);
    color: var(--text);
  }

  .training-course-card {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.9rem;
    align-items: start;
    min-height: 100%;
  }

  .training-course-card__icon,
  .training-lesson-index,
  .training-module__number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid rgba(163, 217, 119, 0.25);
    border-radius: 8px;
    background: rgba(163, 217, 119, 0.11);
    color: var(--accent);
    font-weight: 900;
  }

  .training-course-card__body {
    display: grid;
    gap: 0.7rem;
    min-width: 0;
  }

  .training-rail-list {
    display: grid;
    gap: 0.65rem;
  }

  .training-rail-item {
    display: grid;
    gap: 0.2rem;
    padding: 0.75rem;
    border: 1px solid var(--training-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.035);
  }

  .training-rail-item span,
  .training-source-badge {
    color: var(--accent-warm);
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .training-progress {
    width: 100%;
    height: 0.65rem;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid var(--line);
  }

  .training-progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--accent), var(--accent-warm));
  }

  .training-card {
    display: grid;
    gap: 0.8rem;
  }

  .training-card__footer,
  .training-lesson-row,
  .training-mini-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .training-list {
    margin: 0;
    padding-left: 1.2rem;
    color: #f0e5de;
  }

  .training-list li + li {
    margin-top: 0.45rem;
  }

  .training-module {
    display: grid;
    gap: 1rem;
  }

  .training-lesson-row,
  .training-mini-row {
    padding: 0.85rem;
    border: 1px solid var(--training-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.028);
    margin-top: 0.6rem;
  }

  .training-lesson-row:last-child,
  .training-mini-row:last-child {
    border-bottom: 1px solid var(--training-border);
  }

  .training-lesson-row div,
  .training-mini-row {
    min-width: 0;
  }

  .training-lesson-row strong,
  .training-lesson-row span {
    display: block;
  }

  .training-reader,
  .training-assessment,
  .training-checklist,
  .training-readiness {
    display: grid;
    gap: 1rem;
  }

  .training-reader {
    align-content: start;
  }

  .training-reader__body {
    display: grid;
    gap: 1rem;
    font-size: 1.05rem;
    max-width: 76ch;
  }

  .training-reader__body h2,
  .training-reader__body h3 {
    margin: 0.35rem 0 0;
    font-family: "Space Grotesk", sans-serif;
    letter-spacing: 0;
    line-height: 1.1;
  }

  .training-reader__source {
    width: fit-content;
    border: 1px solid rgba(213, 209, 154, 0.22);
    border-radius: 999px;
    background: rgba(213, 209, 154, 0.08);
    padding: 0.35rem 0.65rem;
    font-size: 0.78rem;
  }

  .training-lesson-nav {
    display: grid;
    gap: 0.65rem;
    align-content: start;
  }

  .training-lesson-nav a {
    display: grid;
    gap: 0.2rem;
    padding: 0.75rem;
    border: 1px solid var(--training-border);
    border-radius: 8px;
    color: var(--text);
    text-decoration: none;
    background: rgba(255, 255, 255, 0.028);
  }

  .training-lesson-nav a.is-active {
    border-color: rgba(163, 217, 119, 0.35);
    background: rgba(163, 217, 119, 0.1);
  }

  .training-lesson-nav span {
    color: var(--muted);
    font-size: 0.78rem;
  }

  .training-markdown-list {
    margin: 0;
    padding-left: 1.25rem;
    color: #f0e5de;
  }

  .training-markdown-list li + li {
    margin-top: 0.35rem;
  }

  .training-callout,
  .training-question,
  .training-result {
    padding: 1rem;
  }

  .training-question {
    display: grid;
    gap: 0.75rem;
    margin: 0;
  }

  .training-question legend {
    font-weight: 800;
  }

  .training-question label,
  .training-check-item {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
  }

  .training-question input,
  .training-check-item input {
    margin-top: 0.35rem;
  }

  .training-explanation {
    margin: 0;
    font-size: 0.92rem;
  }

  .training-result {
    display: grid;
    gap: 0.15rem;
  }

  .training-check-item {
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.035);
  }

  .training-chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .training-chip {
    color: var(--text);
    background: rgba(255, 255, 255, 0.05);
    font-size: 0.86rem;
  }

  @media (min-width: 800px) {
    .training-hero {
      grid-template-columns: 1fr 320px;
      align-items: start;
      padding: 1.75rem;
    }

    .training-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .training-grid--two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .training-module {
      grid-template-columns: 4.5rem minmax(0, 1fr);
    }

    .training-classroom {
      grid-template-columns: minmax(0, 1fr) 320px;
      align-items: start;
    }

    .training-course-shell {
      grid-template-columns: 280px minmax(0, 1fr);
      align-items: start;
    }

    .training-course-sidebar {
      position: sticky;
      top: 1rem;
    }

    .training-reader-shell {
      grid-template-columns: minmax(0, 1fr) 300px;
      align-items: start;
    }

    .training-reader-sidebar {
      position: sticky;
      top: 1rem;
    }

    .training-header,
    .training-reader,
    .training-assessment,
    .training-checklist,
    .training-readiness {
      padding: 1.75rem;
    }
  }
`;

function TrainingStyles() {
  return <style>{css}</style>;
}

export default TrainingStyles;
