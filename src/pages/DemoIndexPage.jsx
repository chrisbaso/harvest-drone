import { Link } from "react-router-dom";
import Shell from "../components/Shell";

const css = `
  .demo-index {
    display: grid;
    gap: 1rem;
  }

  .demo-index__hero,
  .demo-index__section {
    padding: 1.25rem 0;
  }

  .demo-index__hero {
    display: grid;
    gap: 0.8rem;
    padding: 1.25rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    background:
      radial-gradient(circle at top right, rgba(163, 217, 119, 0.15), transparent 32%),
      linear-gradient(180deg, rgba(24, 39, 32, 0.98), rgba(10, 17, 14, 0.98));
  }

  .demo-index h1,
  .demo-index h2,
  .demo-index h3 {
    margin: 0;
    font-family: "Space Grotesk", sans-serif;
    letter-spacing: 0;
    line-height: 1;
  }

  .demo-index h1 {
    max-width: 12ch;
    font-size: clamp(2.2rem, 7vw, 4.8rem);
  }

  .demo-index p {
    margin: 0;
    color: var(--muted);
  }

  .demo-index__grid {
    display: grid;
    gap: 0.85rem;
  }

  .demo-index__card {
    display: grid;
    gap: 0.7rem;
    padding: 1rem;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
  }

  .demo-index__card span {
    color: var(--accent-warm);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .demo-index__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .demo-index__note {
    padding: 1rem;
    border: 1px solid rgba(163, 217, 119, 0.22);
    border-radius: 8px;
    background: rgba(163, 217, 119, 0.08);
    color: var(--text);
  }

  @media (min-width: 780px) {
    .demo-index__hero {
      padding: 1.75rem;
    }

    .demo-index__section {
      padding: 1.75rem 0;
    }

    .demo-index__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1120px) {
    .demo-index__grid--three {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`;

const publicRoutes = [
  {
    title: "Harvest Drone Story",
    path: "/",
    description: "The main operating-system narrative and business model overview.",
  },
  {
    title: "Grower Funnel",
    path: "/growers",
    description: "Public grower acre-plan lead capture.",
  },
  {
    title: "SOURCE Order Funnel",
    path: "/source",
    description: "Public SOURCE order and pricing flow.",
  },
  {
    title: "Operator Funnel",
    path: "/operators",
    description: "Public operator network recruiting funnel.",
  },
  {
    title: "Hylio Funnel",
    path: "/hylio",
    description: "Public Hylio drone sales funnel.",
  },
  {
    title: "Dealer Onboarding",
    path: "/join",
    description: "Self-service dealer signup flow.",
  },
];

const dealerRoutes = [
  {
    title: "Demo Territory SOURCE Funnel",
    path: "/d/demo-territory",
    description: "Dealer-attributed SOURCE funnel. This intentionally renders the SOURCE page.",
  },
  {
    title: "Demo Territory Grower Funnel",
    path: "/d/demo-territory/growers",
    description: "Dealer-attributed grower funnel. This intentionally renders the Grower page.",
  },
];

const internalRoutes = [
  {
    title: "Admin Dashboard",
    path: "/admin",
    description: "Harvest Drone internal lead engine.",
  },
  {
    title: "CRM",
    path: "/crm",
    description: "CRM workspace for leads, accounts, activities, and automations.",
  },
  {
    title: "Routing Dashboard",
    path: "/dashboard",
    description: "Demand routing and operator assignment overview.",
  },
  {
    title: "Agent",
    path: "/agent",
    description: "Internal AI agent workspace.",
  },
  {
    title: "Training",
    path: "/training",
    description: "Operator training dashboard.",
  },
  {
    title: "Qualification Review",
    path: "/training/qualification",
    description: "Operator qualification gate and review module.",
  },
  {
    title: "Admin Training",
    path: "/admin/training",
    description: "Admin qualification matrix.",
  },
  {
    title: "Credential Vault",
    path: "/compliance/credentials",
    description: "Compliance credential tracking.",
  },
  {
    title: "Job Readiness",
    path: "/jobs/1842/readiness",
    description: "Assignment readiness check for a demo job.",
  },
  {
    title: "Enterprise Drone Division",
    path: "/enterprise/rdo/division",
    description: "RDO drone division command center, blueprint, spray calendar, readiness gates, records, support, and ROI.",
  },
  {
    title: "Dealer Dashboard",
    path: "/dealer",
    description: "Dealer-scoped leads, orders, training, and URL tools.",
  },
  {
    title: "Network Dashboard",
    path: "/network",
    description: "Network manager rollup and dealer leaderboard.",
  },
];

function RouteCard({ route, tone = "Internal" }) {
  return (
    <article className="demo-index__card">
      <span>{tone}</span>
      <h3>{route.title}</h3>
      <p>{route.description}</p>
      <div className="demo-index__actions">
        <Link className="button button--secondary button--small" to={route.path}>
          Open {route.path}
        </Link>
      </div>
    </article>
  );
}

function DemoIndexPage() {
  return (
    <Shell compact>
      <style>{css}</style>
      <section className="section demo-index">
        <div className="demo-index__hero">
          <span className="eyebrow">Demo navigation</span>
          <h1>Every Harvest OS demo route in one place.</h1>
          <p>
            Public pages are funnels. Demo territory URLs are intentionally attributed funnels. Internal
            dashboards require the logged-in role shown in the app navigation.
          </p>
          <div className="demo-index__note">
            If a page sends you to login, that is the protected-route gate working. After login,
            use this page to move between dashboards without touching public funnel navigation.
          </div>
        </div>

        <article className="demo-index__section">
          <span className="eyebrow">Public</span>
          <h2>Public pages and funnels</h2>
          <div className="demo-index__grid demo-index__grid--three">
            {publicRoutes.map((route) => (
              <RouteCard key={route.path} route={route} tone="Public" />
            ))}
          </div>
        </article>

        <article className="demo-index__section">
          <span className="eyebrow">Demo attribution</span>
          <h2>Generic attributed funnel URLs</h2>
          <div className="demo-index__grid">
            {dealerRoutes.map((route) => (
              <RouteCard key={route.path} route={route} tone="Dealer URL" />
            ))}
          </div>
        </article>

        <article className="demo-index__section">
          <span className="eyebrow">Internal</span>
          <h2>Dashboards, training, and operations</h2>
          <div className="demo-index__grid demo-index__grid--three">
            {internalRoutes.map((route) => (
              <RouteCard key={route.path} route={route} />
            ))}
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default DemoIndexPage;
