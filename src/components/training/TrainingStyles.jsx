const css = `
  .training-page {
    display: grid;
    gap: 1rem;
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
    gap: 1rem;
    background:
      radial-gradient(circle at top right, rgba(213, 209, 154, 0.13), transparent 30%),
      linear-gradient(180deg, rgba(24, 39, 32, 0.98), rgba(10, 17, 14, 0.98));
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
    font-size: clamp(2rem, 6vw, 4rem);
    max-width: 13ch;
  }

  .training-hero p,
  .training-header p,
  .training-card p,
  .training-reader__meta,
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
    border: 1px solid var(--line);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
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
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--line);
  }

  .training-lesson-row:last-child,
  .training-mini-row:last-child {
    border-bottom: 0;
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

  .training-reader__body {
    display: grid;
    gap: 1rem;
    font-size: 1.05rem;
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
