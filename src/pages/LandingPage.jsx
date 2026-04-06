import { Link } from "react-router-dom";
import Shell from "../components/Shell";

const pathCards = [
  {
    eyebrow: "For growers",
    title: "Improve profit per acre with better data and smarter inputs",
    description: "Built for growers who want a clearer plan and a faster next step.",
    cta: "Get My Acre Plan",
    to: "/growers",
    tone: "grower",
  },
  {
    eyebrow: "For operators",
    title: "Add a recurring revenue stream to your ag business",
    description: "Built for operators who want territory growth and a stronger business opportunity.",
    cta: "See If My Area Qualifies",
    to: "/operators",
    tone: "operator",
  },
];

function LandingPage() {
  return (
    <Shell>
      <section className="hero card hero-card">
        <div className="hero-copy">
          <h1>Choose the right Harvest Drone path.</h1>
          <div className="hero-actions">
            <Link className="button button--primary" to="/growers">
              For Growers
            </Link>
            <Link className="button button--secondary" to="/operators">
              For Operators
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="path-grid">
          {pathCards.map((card) => (
            <article className={`path-card card path-card--${card.tone}`} key={card.title}>
              <span className="eyebrow">{card.eyebrow}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link className="button button--primary" to={card.to}>
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

export default LandingPage;
