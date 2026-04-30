import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { usePageMeta } from "../lib/pageMeta";
import { loadSourceReviewSession } from "../lib/sourceReviewSession";

const JAKE_PHONE_DISPLAY = "218-255-9111";
const JAKE_PHONE_LINK = "tel:+12182559111";

function SourceThankYouPage() {
  const session = loadSourceReviewSession();

  usePageMeta({
    title: "Thanks | SOURCE Acre Review",
    description:
      "Your SOURCE Acre Review request was received. Harvest Drone will review your request and follow up about fit, timing, and next steps.",
  });

  return (
    <Shell compact>
      <section className="section">
        <div className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">Request received</span>
          <h1 style={{ marginTop: "0.8rem" }}>
            Thanks - your SOURCE Acre Review request was received.
          </h1>
          <p style={{ maxWidth: "48rem" }}>
            Jake / Harvest Drone will review your acres, crop, and fertility goals and
            follow up about fit, timing, and next steps.
          </p>

          <div className="card-grid" style={{ marginTop: "1.25rem" }}>
            <article className="summary-box">
              <h3>What happens next</h3>
              <ul className="next-steps">
                <li>Harvest Drone reviews your crop, acres, and stated fertility concern.</li>
                <li>Jake follows up on fit, timing, product availability, and any applicable program details.</li>
                <li>You decide whether a deeper SOURCE conversation makes sense.</li>
              </ul>
            </article>

            <article className="summary-box">
              <h3>Your request snapshot</h3>
              <ul className="next-steps">
                <li>{session?.name || "Your contact details"} received</li>
                <li>{session?.acres || "Acres under review"}</li>
                <li>{session?.cropType || "Crop discussion"} in {session?.county && session?.state ? `${session.county}, ${session.state}` : session?.state || "your area"}</li>
              </ul>
            </article>

            <article className="summary-box">
              <h3>Need Jake now?</h3>
              <ul className="next-steps">
                <li>Call or text: <a href={JAKE_PHONE_LINK}>{JAKE_PHONE_DISPLAY}</a></li>
                <li>Tell him you submitted a SOURCE Acre Review</li>
                <li>Have crop, acres, and timing questions ready</li>
              </ul>
            </article>
          </div>

          <div className="hero-actions" style={{ marginTop: "1.25rem" }}>
            <Link className="button button--primary" to="/source-acre-review">
              Back to SOURCE Acre Review
            </Link>
            <Link className="button button--secondary" to="/source">
              View SOURCE Page
            </Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default SourceThankYouPage;
