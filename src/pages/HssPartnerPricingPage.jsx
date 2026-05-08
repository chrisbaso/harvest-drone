import { useMemo, useState } from "react";
import Shell from "../components/Shell";
import { usePageMeta } from "../lib/pageMeta";

const LIC_BASE = 20000;
const INC_AC = 10000;
const OV_RATE = 2;
const LIC_CAP = 75000;
const CAP_ACRES = INC_AC + (LIC_CAP - LIC_BASE) / OV_RATE;
const SFEE = 10;
const SCOUT_S = 1200;
const SCOUT_C = 800;
const MWL = 27.83;

const css = `
.hss-pricing{--hss-surface:rgba(19,31,26,.96);--hss-card:rgba(255,255,255,.045);--hss-soft:rgba(255,255,255,.065);--hss-line:rgba(189,223,181,.18);--hss-line-strong:rgba(189,223,181,.34);--hss-text:#edf5ee;--hss-muted:#c0cbc3;--hss-subtle:#8f9a91;--hss-green:#88d66c;--hss-green-deep:#bdeaa9;--hss-blue:#9cc9ff;--hss-gold:#f0d881;--hss-red:#f2a6a6;display:grid;gap:16px;color:var(--hss-text)}
.hss-pricing *{letter-spacing:0}
.hss-pricing h1,.hss-pricing h2,.hss-pricing h3,.hss-pricing p{margin:0}
.hss-pricing h1,.hss-pricing h2,.hss-pricing h3{font-family:"Space Grotesk",sans-serif;line-height:1}
.hss-pricing__hero{display:grid;gap:14px;padding:22px;border:1px solid var(--hss-line);border-radius:8px;background:radial-gradient(circle at top right,rgba(136,214,108,.14),transparent 34%),linear-gradient(180deg,rgba(26,42,35,.98),rgba(10,17,14,.98))}
.hss-pricing__hero h1{max-width:13ch;font-size:clamp(2.2rem,7vw,4.5rem)}
.hss-pricing__hero p,.hss-pricing__intro p,.hss-pricing__note,.hss-pricing__muted{color:var(--hss-muted)}
.hss-pricing__hero-actions{display:flex;flex-wrap:wrap;gap:10px}
.hss-pricing__layout{display:grid;gap:16px;align-items:start}
.hss-pricing__panel,.hss-pricing__card,.hss-pricing__metric,.hss-pricing__feedback,.hss-pricing__table-wrap{border:1px solid var(--hss-line);border-radius:8px;background:var(--hss-surface)}
.hss-pricing__panel{padding:16px;display:grid;gap:14px}
.hss-pricing__section-label{font-size:11px;font-weight:800;color:var(--accent-warm);text-transform:uppercase;letter-spacing:.12em;margin:0 0 4px}
.hss-pricing__slider{display:grid;gap:8px;padding:12px;border:1px solid var(--hss-line);border-radius:8px;background:var(--hss-card)}
.hss-pricing__slider-top,.hss-pricing__ticks,.hss-pricing__row,.hss-pricing__total,.hss-pricing__metric-row{display:flex;justify-content:space-between;gap:12px}
.hss-pricing__slider label{font-size:13px;color:var(--hss-muted);font-weight:700}
.hss-pricing__slider strong{color:var(--hss-green-deep);font-size:13px;text-align:right}
.hss-pricing input[type="range"]{width:100%;accent-color:var(--hss-green);margin:0}
.hss-pricing__ticks{font-size:10px;color:var(--hss-subtle)}
.hss-pricing__card{padding:15px 17px}
.hss-pricing__row{align-items:baseline;padding:8px 0;border-top:1px solid var(--hss-line);font-size:12.5px}
.hss-pricing__row:first-child{border-top:0;padding-top:0}
.hss-pricing__label{color:var(--hss-muted)}
.hss-pricing__value{font-weight:800;color:var(--hss-text);text-align:right}
.hss-pricing__value--green{color:var(--hss-green-deep)}
.hss-pricing__value--red{color:var(--hss-red)}
.hss-pricing__value--blue{color:var(--hss-blue)}
.hss-pricing__value--gold{color:var(--hss-gold)}
.hss-pricing__total{padding:10px 0 0;margin-top:4px;border-top:2px solid var(--hss-line-strong);font-size:14px;font-weight:800}
.hss-pricing__phase{border-radius:8px;padding:10px 12px;font-size:12px;font-weight:800;line-height:1.5}
.hss-pricing__results{display:grid;gap:10px}
.hss-pricing__metrics{display:grid;gap:8px}
.hss-pricing__metric{padding:13px;background:var(--hss-soft)}
.hss-pricing__metric span{display:block;font-size:11px;color:var(--hss-muted)}
.hss-pricing__metric strong{display:block;margin-top:3px;font-family:"Space Grotesk",sans-serif;font-size:clamp(1.35rem,4vw,1.65rem);line-height:1;color:var(--hss-text)}
.hss-pricing__metric small{display:block;margin-top:5px;color:var(--hss-subtle)}
.hss-pricing__feedback{padding:12px 14px;font-size:13px;line-height:1.6}
.hss-pricing__table-title{display:grid;gap:3px;margin-top:4px}
.hss-pricing__table-title h2{font-size:1.05rem}
.hss-pricing__table-wrap{overflow-x:auto}
.hss-pricing__table{min-width:920px}
.hss-pricing__tr{display:grid;grid-template-columns:1.6fr .8fr .9fr 1fr 1fr 1fr 1fr;border-bottom:1px solid var(--hss-line);font-size:11.5px}
.hss-pricing__tr:last-child{border-bottom:0}
.hss-pricing__tr--head{background:rgba(255,255,255,.055);font-size:10px;font-weight:800;color:var(--hss-muted);text-transform:uppercase}
.hss-pricing__tc{padding:8px 9px;min-width:0}
.hss-pricing__tc--strong{font-weight:800;color:var(--hss-text)}
.hss-pricing__tc--green{color:var(--hss-green-deep);font-weight:800}
.hss-pricing__pill{display:inline-block;margin-left:5px;font-size:9px;font-weight:800;padding:2px 7px;border-radius:999px;vertical-align:middle}
.hss-pricing__divider{height:1px;background:var(--hss-line);margin:2px 0}
@media(max-width:680px){.hss-pricing__hero-actions .button{width:100%}.hss-pricing__slider-top,.hss-pricing__row,.hss-pricing__total{align-items:flex-start}.hss-pricing__metrics{grid-template-columns:1fr}}
@media(min-width:760px){.hss-pricing__metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:980px){.hss-pricing__layout{grid-template-columns:minmax(320px,.9fr) minmax(0,1.1fr)}.hss-pricing__results{position:sticky;top:14px}}
`;

const milestones = [
  { label: "Starting out", acres: 5000, bg: "#F0EFFE", tc: "#3C3489", badge: "5k ac" },
  { label: "License max", acres: 10000, bg: "#EAF3DE", tc: "#2D5A1B", badge: "10k ac" },
  { label: "Growth", acres: 15000, bg: "#E4F5F0", tc: "#085041", badge: "15k ac" },
  { label: "Expanding", acres: 25000, bg: "#EBF3FB", tc: "#1A4A7A", badge: "25k ac" },
  { label: "Flat rate", acres: 37500, bg: "#FDF3E0", tc: "#7A4A08", badge: "37.5k CAP" },
  { label: "Above cap", acres: 50000, bg: "#FAECE7", tc: "#712B13", badge: "50k ac" },
  { label: "Enterprise", acres: 75000, bg: "#EAF3DE", tc: "#085041", badge: "75k ac" },
];

const sliders = [
  { key: "acres", label: "Acres you service per year", min: 1000, max: 75000, step: 500, ticks: ["1k", "10k", "25k", "37.5k", "50k", "75k"] },
  { key: "grid", label: "Grid density", min: 1, max: 10, step: 0.5, ticks: ["1 ac", "2.5 ac", "5 ac", "7.5 ac", "10 ac"] },
  { key: "gprice", label: "What you charge growers per acre", min: 8, max: 50, step: 0.5, ticks: ["$8", "$18", "$28", "$38", "$50"] },
  { key: "subs", label: "Scout Pro subscriptions sold", min: 0, max: 250, step: 1, ticks: ["0", "60", "125", "190", "250"] },
];

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.round(n));
}

function fmtD(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtP(n) {
  return `${n.toFixed(1)}%`;
}

function fmtN(n) {
  return Math.round(n).toLocaleString();
}

function licAndAc(acres) {
  if (acres <= INC_AC) {
    return LIC_BASE;
  }

  return Math.min(LIC_BASE + (acres - INC_AC) * OV_RATE, LIC_CAP);
}

function compute({ acres, grid, gprice, subs }) {
  const samples = Math.round(acres / grid);
  const licAc = licAndAc(acres);
  const sampCost = samples * SFEE;
  const scCost = subs * SCOUT_C;
  const total = licAc + sampCost + scCost;
  const sampRev = acres * gprice;
  const scRev = subs * SCOUT_S;
  const totRev = sampRev + scRev;
  const margin = totRev - total;
  const mPct = totRev > 0 ? (margin / totRev) * 100 : 0;
  const blended = acres > 0 ? total / acres : 0;
  const mwl = samples * MWL;
  const savings = mwl - sampCost;
  const ovAc = Math.max(0, Math.min(acres, CAP_ACRES) - INC_AC);
  const capped = acres >= CAP_ACRES;

  return { acres, samples, licAc, sampCost, scCost, total, sampRev, scRev, totRev, margin, mPct, blended, mwl, savings, ovAc, capped };
}

function SliderField({ def, value, displayValue, onChange }) {
  return (
    <div className="hss-pricing__slider">
      <div className="hss-pricing__slider-top">
        <label htmlFor={`hss-${def.key}`}>{def.label}</label>
        <strong>{displayValue}</strong>
      </div>
      <input
        id={`hss-${def.key}`}
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(event) => onChange(def.key, event.target.value)}
      />
      <div className="hss-pricing__ticks">
        {def.ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value, tone }) {
  const toneClass = tone ? ` hss-pricing__value--${tone}` : "";

  return (
    <div className="hss-pricing__row">
      <span className="hss-pricing__label">{label}</span>
      <span className={`hss-pricing__value${toneClass}`}>{value}</span>
    </div>
  );
}

function MetricCard({ label, value, note, tone = "green" }) {
  return (
    <div className="hss-pricing__metric">
      <span>{label}</span>
      <strong className={`hss-pricing__value--${tone}`}>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function getPhase(acres, result) {
  if (acres <= INC_AC) {
    return {
      style: { background: "rgba(168,160,255,.14)", border: "1px solid rgba(168,160,255,.45)", color: "#dedaff" },
      text: `Phase 1 - Within license - All ${fmtN(acres)} acres covered by your $20,000 license.`,
    };
  }

  if (!result.capped) {
    const pct = Math.round(((result.licAc - LIC_BASE) / (LIC_CAP - LIC_BASE)) * 100);

    return {
      style: { background: "rgba(99,162,235,.14)", border: "1px solid rgba(99,162,235,.42)", color: "#dcecff" },
      text: `Phase 2 - Building to flat rate - ${pct}% there. ${fmtN(CAP_ACRES - acres)} more acres locks in the $75,000 cap.`,
    };
  }

  return {
    style: { background: "rgba(136,214,108,.14)", border: "1px solid rgba(136,214,108,.38)", color: "#dff6d3" },
    text: "Phase 3 - Flat rate locked - License + acreage permanently capped at $75,000. Only samples scale from here.",
  };
}

function getFeedback(result, gprice) {
  if (result.margin < 0) {
    return {
      style: { background: "rgba(248,113,113,.12)", borderColor: "rgba(248,113,113,.3)", color: "#ffd8d8" },
      title: "Underwater.",
      text: `Costs exceed revenue by ${fmt(Math.abs(result.margin))}. Raise your service price or add Scout subscriptions.`,
    };
  }

  if (result.blended > gprice) {
    return {
      style: { background: "rgba(240,216,129,.12)", borderColor: "rgba(240,216,129,.36)", color: "#f7e9b0" },
      title: "Service price below breakeven.",
      text: `Your all-in HSS cost is ${fmtD(result.blended)}/ac. You need to charge at least that before covering any field labor.`,
    };
  }

  if (result.capped) {
    return {
      style: { background: "rgba(136,214,108,.14)", borderColor: "rgba(136,214,108,.38)", color: "#dff6d3" },
      title: "Flat rate achieved.",
      text: "Your platform cost is locked at $75,000 no matter how many acres you add. Every new acre increases revenue with zero increase in platform cost.",
    };
  }

  if (result.mPct < 30) {
    return {
      style: { background: "rgba(240,216,129,.12)", borderColor: "rgba(240,216,129,.36)", color: "#f7e9b0" },
      title: "Margin is tight.",
      text: `${fmtP(result.mPct)} gross before field costs. Growing acreage toward the ${fmtN(CAP_ACRES)}-acre flat rate or adding Scout subscriptions will strengthen the picture.`,
    };
  }

  return {
    style: { background: "rgba(136,214,108,.14)", borderColor: "rgba(136,214,108,.38)", color: "#dff6d3" },
    title: "Healthy model.",
    text: `${fmt(result.margin)} gross margin at ${fmtP(result.mPct)} before field costs. Lab work is ${fmt(result.savings)} cheaper than Midwest Labs. ${fmtN(CAP_ACRES - result.acres)} more acres reaches the $75,000 flat rate cap.`,
  };
}

function HssPartnerPricingPage() {
  const [inputs, setInputs] = useState({ acres: 15000, grid: 2.5, gprice: 13, subs: 20 });

  usePageMeta({
    title: "HSS Partner Pricing Model | Harvest Drone OS",
    description: "Interactive HSS Partner revenue model with acreage cap, sample costs, Scout Pro margin, and milestone economics.",
  });

  const result = useMemo(() => compute(inputs), [inputs]);
  const phase = useMemo(() => getPhase(inputs.acres, result), [inputs.acres, result]);
  const feedback = useMemo(() => getFeedback(result, inputs.gprice), [inputs.gprice, result]);

  function setValue(key, value) {
    setInputs((current) => ({
      ...current,
      [key]: key === "acres" || key === "subs" ? parseInt(value, 10) : parseFloat(value),
    }));
  }

  const sliderDisplays = {
    acres: `${fmtN(inputs.acres)} ac`,
    grid: `${inputs.grid} ac -> ${fmtN(result.samples)} samples`,
    gprice: `${fmtD(inputs.gprice)} / ac`,
    subs: `${inputs.subs} grower${inputs.subs === 1 ? "" : "s"}`,
  };

  const licenseLabel = result.capped
    ? "License + acreage (capped - flat $75,000)"
    : inputs.acres <= INC_AC
      ? `Annual license (all ${fmtN(inputs.acres)} ac included)`
      : `License + overage (${fmtN(result.ovAc)} ac x $2.00)`;

  const marginTone = result.margin < 0 ? "red" : result.margin < 20000 ? "gold" : "green";
  const marginPercentTone = result.mPct < 25 ? "red" : result.mPct < 35 ? "gold" : "green";

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="section hss-pricing">
        <header className="hss-pricing__hero">
          <span className="eyebrow">HSS Partner economics</span>
          <h1>Your HSS Partner revenue model</h1>
          <p>Adjust the sliders. The annual model and flat-rate journey table stay synced to your exact acreage, density, pricing, and Scout Pro inputs.</p>
          <div className="hss-pricing__hero-actions">
            <a className="button button--primary button--small" href="#hss-results">View annual numbers</a>
            <a className="button button--secondary button--small" href="#hss-journey">Flat-rate journey</a>
          </div>
        </header>

        <div className="hss-pricing__layout">
          <section className="hss-pricing__panel" aria-labelledby="hss-operation-title">
            <div>
              <p className="hss-pricing__section-label" id="hss-operation-title">Your operation</p>
              <p className="hss-pricing__muted">Tune the operating assumptions for the partner conversation.</p>
            </div>

            {sliders.map((slider) => (
              <SliderField
                key={slider.key}
                def={slider}
                value={inputs[slider.key]}
                displayValue={sliderDisplays[slider.key]}
                onChange={setValue}
              />
            ))}

            <div className="hss-pricing__divider" />

            <div>
              <p className="hss-pricing__section-label">How the program works</p>
              <div className="hss-pricing__card">
                <InfoRow label="Annual license fee" value="$20,000 / year" tone="blue" />
                <InfoRow label="Acres included in license" value="10,000 ac" />
                <InfoRow label="Overage rate (10k - 37.5k ac)" value="$2.00 / ac" />
                <InfoRow label="License + acreage cap" value="$75,000 at 37,500 ac" tone="blue" />
                <InfoRow label="Above 37,500 ac" value="Flat $75,000 - acreage charge stops" tone="green" />
                <InfoRow label="Soil sample fee" value="$10.00 / sample - always" />
                <InfoRow label="Scout Pro: your cost" value="$800 / grower" />
                <InfoRow label="Scout Pro: grower price" value="$1,200 / grower" />
                <InfoRow label="Scout Pro: your margin" value="$400 / grower" tone="green" />
              </div>
            </div>

            <div className="hss-pricing__phase" style={phase.style}>{phase.text}</div>
          </section>

          <aside className="hss-pricing__results" id="hss-results">
            <div className="hss-pricing__card">
              <p className="hss-pricing__section-label">Revenue</p>
              <InfoRow label={`Sampling revenue (${fmtN(inputs.acres)} ac x ${fmtD(inputs.gprice)})`} value={fmt(result.sampRev)} tone="green" />
              <InfoRow label={`Scout Pro revenue (${inputs.subs} x $1,200)`} value={fmt(result.scRev)} tone="green" />
              <div className="hss-pricing__total"><span>Total revenue</span><span className="hss-pricing__value hss-pricing__value--green">{fmt(result.totRev)}</span></div>
            </div>

            <div className="hss-pricing__card">
              <p className="hss-pricing__section-label">Costs to HSS</p>
              <InfoRow label={licenseLabel} value={fmt(result.licAc)} />
              <InfoRow label={`Soil samples (${fmtN(result.samples)} x $10.00)`} value={fmt(result.sampCost)} />
              <InfoRow label={`Scout Pro wholesale (${inputs.subs} x $800)`} value={fmt(result.scCost)} />
              <div className="hss-pricing__total"><span>Total cost to HSS</span><span className="hss-pricing__value hss-pricing__value--red">{fmt(result.total)}</span></div>
            </div>

            <div className="hss-pricing__metrics">
              <MetricCard label="Your gross margin" value={fmt(result.margin)} note="before field costs" tone={marginTone} />
              <MetricCard label="Margin %" value={fmtP(result.mPct)} note="before field costs" tone={marginPercentTone} />
              <MetricCard label="Your cost per acre" value={fmtD(result.blended)} note="all-in breakeven" tone="blue" />
              <MetricCard label="Scout Pro margin" value={fmt(inputs.subs * 400)} note="$400 x subscriptions" tone="green" />
            </div>

            <div className="hss-pricing__card">
              <p className="hss-pricing__section-label">Lab savings vs. Midwest Labs ($27.83/sample)</p>
              <InfoRow label="Your lab cost through HSS" value={fmt(result.sampCost)} tone="green" />
              <InfoRow label="Midwest Labs - same samples" value={fmt(result.mwl)} tone="red" />
              <div className="hss-pricing__total"><span>You save</span><span className="hss-pricing__value hss-pricing__value--green">{fmt(result.savings)}</span></div>
            </div>

            <div className="hss-pricing__feedback" style={feedback.style}>
              <strong>{feedback.title}</strong> {feedback.text}
            </div>
          </aside>
        </div>

        <section className="hss-pricing__table-title" id="hss-journey">
          <h2>Your flat-rate journey - license + acreage + samples only</h2>
          <p className="hss-pricing__note">Scout Pro is excluded from this table. Above 37,500 acres the acreage charge is gone; only samples scale with volume.</p>
        </section>

        <div className="hss-pricing__table-wrap">
          <div className="hss-pricing__table">
            <div className="hss-pricing__tr hss-pricing__tr--head">
              <div className="hss-pricing__tc">Milestone</div>
              <div className="hss-pricing__tc">Acres</div>
              <div className="hss-pricing__tc">Samples</div>
              <div className="hss-pricing__tc">Lic + acreage</div>
              <div className="hss-pricing__tc">Sample fees</div>
              <div className="hss-pricing__tc">Total to HSS</div>
              <div className="hss-pricing__tc">Sampling revenue</div>
            </div>
            {milestones.map((milestone) => {
              const mSamples = Math.round(milestone.acres / inputs.grid);
              const mLicAc = licAndAc(milestone.acres);
              const mSampCost = mSamples * SFEE;
              const mTotal = mLicAc + mSampCost;
              const mSampRev = milestone.acres * inputs.gprice;
              const mMargin = mSampRev - mTotal;
              const mPct = mSampRev > 0 ? (mMargin / mSampRev) * 100 : 0;
              const isActive = Math.abs(inputs.acres - milestone.acres) < 3000;
              const isCapped = milestone.acres >= CAP_ACRES;

              return (
                <div
                  className="hss-pricing__tr"
                  key={milestone.label}
                  style={isActive ? { background: "rgba(136,214,108,.08)", borderLeft: "3px solid #88d66c" } : undefined}
                >
                  <div className="hss-pricing__tc hss-pricing__tc--strong">
                    {milestone.label}
                    <span className="hss-pricing__pill" style={{ background: milestone.bg, color: milestone.tc }}>{milestone.badge}</span>
                    {isCapped ? <span className="hss-pricing__pill" style={{ background: "#EAF3DE", color: "#2D5A1B" }}>FLAT RATE</span> : null}
                    {isActive ? <span className="hss-pricing__pill" style={{ background: "#EAF3DE", color: "#2D5A1B" }}>YOU</span> : null}
                  </div>
                  <div className="hss-pricing__tc">{fmtN(milestone.acres)}</div>
                  <div className="hss-pricing__tc">{fmtN(mSamples)}</div>
                  <div className="hss-pricing__tc">{fmt(mLicAc)}</div>
                  <div className="hss-pricing__tc">{fmt(mSampCost)}</div>
                  <div className="hss-pricing__tc hss-pricing__tc--strong">{fmt(mTotal)}</div>
                  <div className={mMargin < 0 || mPct < 30 ? "hss-pricing__tc" : "hss-pricing__tc hss-pricing__tc--green"}>{fmt(mSampRev)}</div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="hss-pricing__note">Revenue based on your current grower price ({fmtD(inputs.gprice)}/ac). Scout Pro margin is on top of these figures.</p>
      </section>
    </Shell>
  );
}

export default HssPartnerPricingPage;
