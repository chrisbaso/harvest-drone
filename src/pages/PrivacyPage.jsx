import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { usePageMeta } from "../lib/pageMeta";

function PrivacyPage() {
  usePageMeta({
    title: "Privacy Policy | Harvest Drone",
    description:
      "Privacy information for Harvest Drone lead forms and SOURCE Acre Review requests.",
  });

  return (
    <Shell compact>
      <section className="section">
        <div className="card" style={{ padding: "1.5rem" }}>
          <span className="eyebrow">Privacy</span>
          <h1 style={{ marginTop: "0.8rem" }}>Harvest Drone Privacy Policy</h1>
          <p>
            When you submit a form on this site, Harvest Drone may collect the contact,
            acreage, crop, and request details needed to review SOURCE fit, application
            options, and next steps.
          </p>
          <p>
            We use that information to follow up on your request, route internal lead
            notifications, and improve marketing performance through campaign tracking
            parameters such as UTM tags. We do not ask for more information than is
            needed for the review process.
          </p>
          <p>
            If you want your information updated or removed, contact Harvest Drone
            directly.
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

export default PrivacyPage;
