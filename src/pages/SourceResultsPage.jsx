import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  LEAD_TIERS,
  RESULTS_DISCLAIMER,
  formatCrops,
  getFollowUpSequence,
  getLeadTierContent,
  getPreferredOfferPath,
} from "../../shared/harvestLeadEngine";
import { getHarvestLeadDetail, trackHarvestEvent } from "../lib/harvestApi";
import { loadHarvestResultSession } from "../lib/harvestResultSession";
import {
  trackMetaCustomEvent,
  trackMetaEventOnce,
} from "../lib/metaPixel";
import { usePageMeta } from "../lib/pageMeta";
import Shell from "../components/Shell";
import {
  SourceButton,
  SourceCard,
  SourceReviewPage,
  SourceSection,
  SourceSectionHeader,
  SourceShell,
} from "../components/source-review/SourceReviewPrimitives";
import "../styles/harvest-engine.css";

function buildExpectationItems(lead, offerPath) {
  const contactMethod = lead?.preferred_contact_method || "your preferred contact method";

  return [
    `Harvest Drone will review your acres, crop mix, and timing against a ${offerPath.toLowerCase()}.`,
    `If the fit looks strong, someone may follow up by ${contactMethod.toLowerCase()} to talk through next steps.`,
    "If timing is not immediate, follow-up should stay practical and low-pressure.",
  ];
}

function ResultsAction({ lead }) {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const tierContent = getLeadTierContent(lead.lead_tier);
  const ctaLabel = lead.result_cta || tierContent.cta;

  return (
    <div className="harvest-results__actions">
      <SourceButton
        type="button"
        onClick={() => {
          setHasConfirmed(true);
          trackHarvestEvent(
            "cta_clicked",
            { lead_tier: lead.lead_tier, cta_label: ctaLabel },
            lead.id,
          );

          if (lead.lead_tier === LEAD_TIERS.HOT) {
            trackMetaCustomEvent("QualifiedLead", {
              score: lead.lead_score,
              lead_tier: lead.lead_tier,
            });
          }
        }}
      >
        {ctaLabel}
      </SourceButton>
      <SourceButton as="a" href="tel:+16122580582" variant="secondary">
        Call Harvest Drone
      </SourceButton>

      {hasConfirmed ? (
        <p className="harvest-results__confirmation">
          Your request is already in the queue. Harvest Drone will use your preferred contact
          method if a follow-up makes sense.
        </p>
      ) : null}
    </div>
  );
}

function SourceResultsPage() {
  const [searchParams] = useSearchParams();
  const [leadDetail, setLeadDetail] = useState(() => {
    const session = loadHarvestResultSession();
    return session ? { lead: session.lead, summary: session.summary, mode: session.mode } : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const leadId = searchParams.get("lead");

  const lead = leadDetail?.lead || null;
  const summary = leadDetail?.summary || lead?.lead_summary || null;
  const reasonCodes = lead?.reason_codes || [];
  const followUpSequence = useMemo(() => getFollowUpSequence(lead?.lead_tier), [lead?.lead_tier]);
  const offerPath = lead?.offer_path || getPreferredOfferPath(lead?.lead_tier);
  const expectationItems = useMemo(
    () => buildExpectationItems(lead, offerPath),
    [lead, offerPath],
  );

  usePageMeta({
    title: "SOURCE Fit Check Results | Harvest Drone",
    description:
      "See whether your acres may be a fit for a Harvest Drone SOURCE review and what the next step looks like.",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadLead() {
      if (!leadId || lead) {
        return;
      }

      setIsLoading(true);

      try {
        const result = await getHarvestLeadDetail(leadId);

        if (isMounted && result?.lead) {
          setLeadDetail({
            lead: result.lead,
            summary: result.summary || result.lead.lead_summary,
            mode: result.mode,
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLead();

    return () => {
      isMounted = false;
    };
  }, [lead, leadId]);

  useEffect(() => {
    if (!lead) {
      return;
    }

    trackHarvestEvent(
      "result_viewed",
      {
        lead_id: lead.id,
        lead_tier: lead.lead_tier,
        lead_score: lead.lead_score,
      },
      lead.id,
    );

    trackMetaEventOnce(`result:${lead.id}`, "CompleteRegistration", {
      content_name: "SOURCE Fit Check Result",
      status: lead.lead_tier,
      score: lead.lead_score,
    });

    if (lead.lead_tier === LEAD_TIERS.HOT) {
      trackMetaCustomEvent("QualifiedLead", {
        score: lead.lead_score,
        lead_tier: lead.lead_tier,
      });
      trackMetaCustomEvent("HotLead", {
        score: lead.lead_score,
        lead_tier: lead.lead_tier,
      });
    }
  }, [lead]);

  const snapshotItems = useMemo(
    () => [
      { label: "Fit result", value: lead?.lead_tier || "-" },
      { label: "Review score", value: lead?.lead_score ?? "-" },
      { label: "Acres reviewed", value: lead?.acreage_range || "-" },
      { label: "Crop focus", value: formatCrops(lead?.crops) },
      { label: "Decision timing", value: lead?.decision_timing || "-" },
      { label: "Review path", value: offerPath || "-" },
      { label: "Preferred contact", value: lead?.preferred_contact_method || "-" },
      { label: "Next step", value: lead?.recommended_action || "-" },
    ],
    [lead, offerPath],
  );

  if (isLoading) {
    return (
      <Shell compact>
        <section className="section">
          <div className="card" style={{ padding: "1.5rem" }}>
            Loading your SOURCE fit result...
          </div>
        </section>
      </Shell>
    );
  }

  if (!lead) {
    return (
      <Shell compact>
        <section className="section">
          <div className="card" style={{ padding: "1.5rem" }}>
            <h1>We couldn't find that fit check.</h1>
            <p>
              If you just completed the quiz, head back and submit again or restart the fit check
              below.
            </p>
            <div className="hero-actions">
              <Link className="button button--primary" to="/source-acre-review">
                Restart the fit check
              </Link>
            </div>
          </div>
        </section>
      </Shell>
    );
  }

  return (
    <Shell compact>
      <SourceReviewPage className="harvest-results">
        <SourceSection flush className="harvest-results__hero">
          <SourceShell>
            <div className="harvest-results__hero-grid">
              <SourceCard className="harvest-results__hero-card" tone="strong">
                <span className="source-ui__eyebrow">SOURCE fit result</span>
                <h1>{lead.result_headline || "Your SOURCE fit check is ready."}</h1>
                <p>{lead.result_body || "We've reviewed your answers and mapped the next best step."}</p>
                <ResultsAction lead={lead} />
                <p className="harvest-results__discussion-note">
                  A Harvest Drone team member can help estimate whether a SOURCE trial or
                  application plan makes sense based on your acres and timing.
                </p>
              </SourceCard>

              <SourceCard className="harvest-results__snapshot" tone="accent">
                <h3>Your review snapshot</h3>
                <div className="harvest-results__snapshot-grid">
                  {snapshotItems.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </SourceCard>
            </div>
          </SourceShell>
        </SourceSection>

        <SourceSection>
          <SourceShell>
            <div className="harvest-results__detail-grid">
              <SourceCard className="harvest-results__detail-card">
                <SourceSectionHeader
                  eyebrow="Why you got this result"
                  title="What stood out in your answers"
                  description="This fit check looks at acreage, crop fit, timing, application path, and interest level to decide how quickly a human review should happen."
                />
                <ul className="source-ui__list" style={{ marginTop: "1rem" }}>
                  {reasonCodes.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </SourceCard>

              <SourceCard className="harvest-results__detail-card" tone="soft">
                <SourceSectionHeader
                  eyebrow="What happens next"
                  title={offerPath || "What Harvest Drone should review next"}
                  description="Harvest Drone uses this result to decide whether a practical follow-up conversation makes sense now or later."
                />
                <div className="harvest-results__summary-stack">
                  <div>
                    <strong>Recommended next step</strong>
                    <p>{lead.recommended_action}</p>
                  </div>
                  <div>
                    <strong>What Harvest Drone will review</strong>
                    <p>
                      Acres, crop fit, application timing, and whether a measured SOURCE trial or
                      broader plan makes sense for the operation.
                    </p>
                  </div>
                  {summary ? (
                    <div>
                      <strong>Why this result came back the way it did</strong>
                      <p>{summary.whyItMatters}</p>
                    </div>
                  ) : null}
                </div>
              </SourceCard>
            </div>

            <SourceCard className="harvest-results__detail-card" tone="accent">
              <SourceSectionHeader
                eyebrow="What to expect"
                title="What happens from here"
                description="Not every grower gets the same pressure or the same follow-up path. The goal is a useful next step, not a generic sales sequence."
              />
              <div className="harvest-results__summary-stack">
                {expectationItems.map((item) => (
                  <div key={item}>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </SourceCard>

            {followUpSequence.length ? (
              <SourceCard className="harvest-results__detail-card" tone="soft">
                <SourceSectionHeader
                  eyebrow="If we follow up"
                  title="The kind of guidance we may send"
                  description="Any follow-up should stay practical and tied to your timing, acres, and crop plan."
                />
                <div className="harvest-results__summary-stack">
                  {followUpSequence.map((step, index) => (
                    <div key={`${step.day}-${step.subject}`}>
                      <strong>{index === 0 ? "First" : index === 1 ? "Next" : "Later"}</strong>
                      <p>{step.message}</p>
                    </div>
                  ))}
                </div>
              </SourceCard>
            ) : null}

            <SourceCard className="harvest-results__detail-card" tone="accent">
              <span className="source-ui__eyebrow">Discussion estimate only</span>
              <p className="harvest-results__disclaimer">{RESULTS_DISCLAIMER}</p>
            </SourceCard>
          </SourceShell>
        </SourceSection>
      </SourceReviewPage>
    </Shell>
  );
}

export default SourceResultsPage;
