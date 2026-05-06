import { startTransition, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CONTACT_METHOD_OPTIONS,
  RESULTS_DISCLAIMER,
} from "../../shared/harvestLeadEngine";
import QualificationFlow from "../components/harvest/QualificationFlow";
import Shell from "../components/Shell";
import {
  SourceButton,
  SourceCard,
  SourceReviewPage,
  SourceSection,
  SourceSectionHeader,
  SourceShell,
} from "../components/source-review/SourceReviewPrimitives";
import { submitHarvestLead, trackHarvestEvent } from "../lib/harvestApi";
import { saveHarvestResultSession } from "../lib/harvestResultSession";
import { captureHarvestTracking } from "../lib/harvestTracking";
import { trackMetaEventOnce } from "../lib/metaPixel";
import { usePageMeta } from "../lib/pageMeta";
import "../styles/harvest-engine.css";

const FIT_POINTS = [
  {
    title: "Foliar-applied crop input",
    description:
      "SOURCE is a foliar-applied crop input designed to help crops access nutrients already present in the field.",
  },
  {
    title: "Practical fit review",
    description:
      "Harvest Drone helps evaluate whether application timing, acreage, and crop fit make a custom plan worth discussing.",
  },
  {
    title: "Human review for strong fits",
    description:
      "Qualified opportunities are reviewed by a real person so strong-fit acres get faster follow-up.",
  },
];

const WHO_ITS_FOR = [
  {
    title: "Corn / soybean growers",
    description:
      "Especially farms where nutrient efficiency, timing, and practical agronomic fit matter.",
  },
  {
    title: "Growers with meaningful acreage",
    description:
      "Operations where acreage size makes timing and follow-up worth prioritizing quickly.",
  },
  {
    title: "Operators looking at nutrient efficiency",
    description:
      "Farmers who want a grounded conversation about how SOURCE may fit a real fertility plan.",
  },
  {
    title: "Open to evaluating new application strategies",
    description:
      "Growers willing to evaluate a new approach without jumping straight into hype or hard claims.",
  },
  {
    title: "Practical ROI thinkers",
    description:
      "Operations that want useful field-level conversations, not generic promises.",
  },
];

const QUALIFICATION_PREVIEW = [
  { label: "Acres", value: "How many acres you farm or manage" },
  { label: "Crop type", value: "What crop mix matters most right now" },
  { label: "Current application method", value: "How crop inputs are being applied today" },
  { label: "Timing", value: "Whether this is a near-term or future decision" },
  { label: "Interest level", value: "How open you are to a SOURCE or drone-applied plan" },
  { label: "Contact info", value: "How Harvest Drone should follow up if it looks like a fit" },
];

function SourcePage() {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const { dealerSlug } = useParams();
  const [searchParams] = useSearchParams();

  const contactMethods = useMemo(() => CONTACT_METHOD_OPTIONS.join(", "), []);

  usePageMeta({
    title: "See If Your Acres Are a Fit for SOURCE | Harvest Drone",
    description:
      "Answer a few quick questions about your acres, crops, and timing to see whether SOURCE may fit your operation.",
  });

  useEffect(() => {
    const tracking = captureHarvestTracking(searchParams, {
      source: "Harvest Drone Funnel",
    });

    trackHarvestEvent("landing_page_view", {
      landing_page_url: tracking.landing_page_url,
      utm_source: tracking.utm_source,
      utm_campaign: tracking.utm_campaign,
    });

    trackMetaEventOnce(`source-view:${tracking.landing_page_url}`, "ViewContent", {
      content_name: "Harvest Drone SOURCE Acre Review",
      content_category: "SOURCE lead funnel",
      utm_source: tracking.utm_source || undefined,
      utm_campaign: tracking.utm_campaign || undefined,
    });
  }, [searchParams]);

  function scrollToQuiz() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(draft) {
    const tracking = captureHarvestTracking(searchParams, {
      source: "Harvest Drone Funnel",
    });
    const productNote = draft.product ? `SOURCE offer selected: ${draft.product}` : "";
    const payload = {
      ...draft,
      ...tracking,
      notes: [productNote, draft.notes].filter(Boolean).join("\n\n"),
      dealerSlug,
      landing_page_url: tracking.landing_page_url,
      referrer: tracking.referrer,
    };
    const result = await submitHarvestLead(payload);
    const lead = result.lead;

    trackMetaEventOnce(`lead-submit:${lead.id}`, "Lead", {
      content_name: "Harvest Drone SOURCE Fit Check",
      lead_tier: lead.lead_tier,
      preferred_contact_method: lead.preferred_contact_method,
    });

    saveHarvestResultSession({
      lead,
      summary: result.summary || lead?.lead_summary,
      mode: result.mode,
    });

    startTransition(() => {
      navigate(`/source-acre-review/results?lead=${encodeURIComponent(lead.id)}`);
    });
  }

  return (
    <Shell compact>
      <SourceReviewPage className="harvest-source">
        <SourceSection flush className="harvest-source__hero">
          <SourceShell>
            <div className="harvest-source__hero-grid">
              <div className="harvest-source__hero-copy">
                <span className="source-ui__eyebrow">Harvest Drone x SOURCE</span>
                <h1>See If Your Acres Are a Fit for SOURCE</h1>
                <p>
                  Answer a few quick questions about your acres, crops, and application timing.
                  We'll help determine whether SOURCE may fit your operation and whether a custom
                  application plan makes sense.
                </p>
                <div className="harvest-source__hero-actions">
                  <SourceButton type="button" onClick={scrollToQuiz}>
                    Check My Acres
                  </SourceButton>
                  <SourceButton type="button" variant="secondary" onClick={scrollToQuiz}>
                    See If My Farm Qualifies
                  </SourceButton>
                </div>
              </div>

              <div className="harvest-source__hero-panel">
                <SourceCard className="harvest-source__hero-card" tone="strong">
                  <span className="source-ui__eyebrow">What this tool does</span>
                  <div className="harvest-source__trust-list">
                    <div>
                      <span>Positioning</span>
                      <strong>
                        Find out if your acres are a fit for a SOURCE application plan.
                      </strong>
                    </div>
                    <div>
                      <span>What you'll answer</span>
                      <strong>
                        Acres, crops, location, timing, and how you want to be contacted.
                      </strong>
                    </div>
                    <div>
                      <span>What happens next</span>
                      <strong>
                        Strong-fit opportunities get human review instead of a generic contact form
                        reply.
                      </strong>
                    </div>
                  </div>
                </SourceCard>

                <div ref={formRef}>
                  <QualificationFlow onSubmit={handleSubmit} onTrackEvent={trackHarvestEvent} />
                </div>
              </div>
            </div>
          </SourceShell>
        </SourceSection>

        <SourceSection>
          <SourceShell>
            <SourceSectionHeader
              eyebrow="Practical use"
              title="A farmer-friendly way to evaluate fit"
              description="The goal is not to promise results. The goal is to decide whether SOURCE may fit the operation, whether a trial makes sense, and whether timing supports a useful conversation."
            />
            <div className="harvest-source__credibility-grid">
              {FIT_POINTS.map((item) => (
                <SourceCard className="harvest-source__credibility-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </SourceCard>
              ))}
            </div>
          </SourceShell>
        </SourceSection>

        <SourceSection>
          <SourceShell>
            <SourceSectionHeader
              eyebrow="Who this is for"
              title="Built for growers evaluating real acres"
              description="This fit check helps identify where SOURCE may fit this season, whether a starter trial makes sense, and what follow-up would be most useful."
            />
            <div className="harvest-source__section-grid">
              {WHO_ITS_FOR.map((item) => (
                <SourceCard className="harvest-source__who-card" tone="soft" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </SourceCard>
              ))}
            </div>
          </SourceShell>
        </SourceSection>

        <SourceSection>
          <SourceShell>
            <div className="harvest-source__credibility-grid">
              <SourceCard className="harvest-source__preview-card">
                <SourceSectionHeader
                  eyebrow="Qualification preview"
                  title="What the fit check looks at"
                  description="The quiz keeps typing to a minimum until the final step, then collects the few details Harvest Drone needs to route and follow up intelligently."
                />
                <div className="harvest-source__preview-list" style={{ marginTop: "1rem" }}>
                  {QUALIFICATION_PREVIEW.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </SourceCard>

              <SourceCard className="harvest-source__cta-card" tone="accent">
                <h2>Check My Acres</h2>
                <p>
                  We'll use your answers to score fit, recommend the next step, and decide whether
                  immediate human follow-up makes sense.
                </p>
                <div className="harvest-source__hero-actions">
                  <SourceButton type="button" onClick={scrollToQuiz}>
                    Check My Acres
                  </SourceButton>
                  <SourceButton type="button" variant="secondary" onClick={scrollToQuiz}>
                    See If My Farm Qualifies
                  </SourceButton>
                </div>
              </SourceCard>
            </div>
          </SourceShell>
        </SourceSection>

        <SourceSection>
          <SourceShell>
            <SourceCard className="harvest-source__disclaimer-card" tone="accent">
              <span className="source-ui__eyebrow">Compliance note</span>
              <h2>Discussion estimate only</h2>
              <p>{RESULTS_DISCLAIMER}</p>
              <p>
                Harvest Drone will follow up using your preferred contact method where possible:{" "}
                {contactMethods}. Strong-fit opportunities may receive faster human review.
              </p>
              <p>
                Crop examples and follow-up summaries are directional only. They are meant to
                support a practical agronomic conversation, not guarantee a field outcome.
              </p>
            </SourceCard>
          </SourceShell>
        </SourceSection>
      </SourceReviewPage>
    </Shell>
  );
}

export default SourcePage;
