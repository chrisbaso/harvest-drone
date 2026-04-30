import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { usePageMeta } from "../lib/pageMeta";

function TermsPage() {
  usePageMeta({
    title: "Terms and Disclaimer | Harvest Drone",
    description:
      "Terms and disclaimer information for Harvest Drone SOURCE Acre Review requests.",
  });

  return (
    <Shell compact>
      <section className="section">
        <div className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">Terms</span>
          <h1 style={{ marginTop: "0.8rem" }}>Harvest Drone Terms and Disclaimer</h1>
          <p>
            The SOURCE Acre Review is an informational review intended to help growers
            discuss potential fit, timing, application options, and next steps with
            Harvest Drone. It is not a guarantee of product performance, economic
            outcome, yield response, or program eligibility.
          </p>
          <p>
            SOURCE performance, application recommendations, and any Sound Agriculture
            guarantee or program benefits vary by crop, acres, soil conditions,
            fertility plan, timing, weather, label instructions, and other field-specific
            factors.
          </p>
          <p>
            Always read and follow product label directions. Any purchase, application,
            or program decision should be made only after reviewing current product and
            program requirements.
          </p>
          <div className="hero-actions" style={{ marginTop: "1rem" }}>
            <Link className="button button--primary" to="/source-acre-review">
              Back to SOURCE Acre Review
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default TermsPage;
