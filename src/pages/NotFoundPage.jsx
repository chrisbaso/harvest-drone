import { Link } from "react-router-dom";
import Shell from "../components/Shell";

const css = `
.not-found{display:grid;gap:1rem;min-height:52vh;align-content:center}
.not-found__card{padding:clamp(1.4rem,4vw,2rem);display:grid;gap:1rem}
.not-found h1{margin:0;font-family:"DM Serif Display",Georgia,serif;font-weight:400;line-height:1.04;font-size:clamp(2.6rem,8vw,5rem);letter-spacing:0;color:#fff}
.not-found p{margin:0;max-width:42rem;color:var(--muted)}
`;

function NotFoundPage() {
  return (
    <Shell compact>
      <style>{css}</style>
      <section className="not-found">
        <article className="card not-found__card">
          <span className="eyebrow">Page not found</span>
          <h1>This route is not in the flight plan.</h1>
          <p>Use the demo index or return home to pick up the right Harvest Drone workflow.</p>
          <div className="inline-actions">
            <Link className="button button--primary button--small" to="/demo">Open demo index</Link>
            <Link className="button button--secondary button--small" to="/">Go home</Link>
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default NotFoundPage;
