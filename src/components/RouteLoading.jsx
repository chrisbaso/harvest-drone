const css = `
  .route-loader {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 2rem;
    color: var(--muted);
    background:
      radial-gradient(circle at top, rgba(91, 130, 77, 0.2), transparent 28%),
      linear-gradient(180deg, #08110d 0%, #0d1713 45%, #101b16 100%);
  }

  .route-loader__panel {
    display: grid;
    justify-items: center;
    gap: 0.9rem;
    width: min(100%, 22rem);
    padding: 1.35rem;
    border: 1px solid var(--line);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.04);
    box-shadow: var(--shadow);
  }

  .route-loader__spinner {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 999px;
    border: 3px solid rgba(255, 255, 255, 0.12);
    border-top-color: var(--accent);
    animation: route-loader-spin 760ms linear infinite;
  }

  .route-loader__label {
    margin: 0;
    color: var(--text);
    font-family: "Space Grotesk", sans-serif;
    font-weight: 700;
    letter-spacing: 0;
  }

  .route-loader__hint {
    margin: 0;
    color: var(--muted);
    font-size: 0.9rem;
    text-align: center;
  }

  @keyframes route-loader-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .route-loader__spinner {
      animation: none;
    }
  }
`;

function RouteLoading({ label = "Loading Harvest Drone", hint = "Preparing the next view." }) {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <style>{css}</style>
      <div className="route-loader__panel">
        <span className="route-loader__spinner" aria-hidden="true" />
        <p className="route-loader__label">{label}</p>
        <p className="route-loader__hint">{hint}</p>
      </div>
    </div>
  );
}

export default RouteLoading;
