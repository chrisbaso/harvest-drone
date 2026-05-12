import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import Shell from "../components/Shell";
import { trackMetaEventOnce } from "../lib/metaPixel";
import { usePageMeta } from "../lib/pageMeta";
import { submitGrowerLead } from "../lib/submissions";

const STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const proofPoints = [
  {
    quote:
      "Put SOURCE on half my corn acres. The treated side yielded 4 bushels more per acre and I cut $30/acre off my urea bill. It's going on everything next year.",
    meta: "Corn grower, 1,400 acres, southern Minnesota",
    stat: { value: "+4 bu/acre", label: "reported yield lift" },
  },
  {
    quote:
      "I was skeptical until I saw my own field data. The check strips don't lie. SOURCE-treated rows came through a dry June better than the untreated side.",
    meta: "Row crop operation, 2,200 acres, central Minnesota",
    stat: { value: "$25-45", label: "targeted N savings per acre" },
  },
  {
    quote:
      "One ounce replacing 25 pounds of N sounded too good. But the math works when you run it against the actual fertilizer line items.",
    meta: "Corn and soybean grower, 800 acres",
    stat: { value: "150%", label: "reported net retention" },
  },
  {
    quote:
      "We started with 200 acres to test it. Now we're doing 1,200. The data from the first season sold me, not the sales pitch.",
    meta: "Multi-generation farm, western Minnesota",
    stat: { value: "1M+", label: "US acres on SOURCE" },
  },
];

const faqs = [
  {
    q: "What exactly is SOURCE?",
    a: "SOURCE is a synthetic soil activator from Sound Agriculture with an extremely low use rate: one ounce replaces 25 pounds of nitrogen. It helps activate soil microbes to deliver nitrogen and phosphorus to crops, reducing dependence on anhydrous, urea, and UAN.",
  },
  {
    q: "How much does it cost?",
    a: "SOURCE is $15/acre. BLUEPRINT is $11/acre. The SOURCE + BLUEPRINT bundle is $25/acre, and Harvest Drone can quote application if you want the product applied by drone.",
  },
  {
    q: "What fertilizer line items can it reduce?",
    a: "SOURCE is used to reduce part of an anhydrous ammonia, urea, or UAN program. BLUEPRINT is used to help address phosphorus availability and reduce pressure on DAP or MAP spend. Your acre plan compares the product cost against the dollars you are considering cutting or reallocating.",
  },
  {
    q: "Do I have to put it on every acre?",
    a: "No. The recommended path is a practical trial: choose a portion of your acres, leave check strips, and compare at harvest. The point is to let your own field data decide whether it earns more acres next season.",
  },
  {
    q: "What happens after I submit the form?",
    a: "Jake reviews the acres, location, and product fit, then follows up with a short cost breakdown. If it looks like a fit, you can choose product only, SOURCE plus BLUEPRINT, or a drone-applied plan.",
  },
  {
    q: "What about drone application?",
    a: "Drone application is optional. It can help when fields are wet, canopy is tall, or spray windows are tight. It also avoids compaction and crop damage from ground rigs.",
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700;800&display=swap');

@keyframes gpFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.gp2{--bg:#0C0F0A;--surface:#151A12;--card:#1A2015;--elevated:#1F261A;--border:rgba(255,255,255,0.07);--border-active:rgba(163,217,119,0.28);--text:#E8E6E1;--muted:#8A927E;--dim:#5F6653;--accent:#A3D977;--accent-hover:#B8E68A;--accent-soft:rgba(163,217,119,0.08);--accent-med:rgba(163,217,119,0.16);--danger:#F87171;--warning:#FBBF24;--blue:#60A5FA;--serif:'DM Serif Display',Georgia,serif;--sans:'Instrument Sans',system-ui,sans-serif;--radius:10px;--radius-lg:16px;background:var(--bg);color:var(--text);font-family:var(--sans);-webkit-font-smoothing:antialiased;min-height:100vh}
.gp2 *,.gp2 *::before,.gp2 *::after{box-sizing:border-box}
.gp2 h1,.gp2 h2,.gp2 h3,.gp2 p{margin:0}
.gp2 button,.gp2 input,.gp2 select{font:inherit}

.gp2__hero{max-width:1120px;margin:0 auto;padding:48px 28px 56px;display:grid;gap:32px;align-items:start}
@media(min-width:900px){.gp2__hero{grid-template-columns:minmax(0,1fr) 390px;column-gap:56px;row-gap:28px;padding:58px 32px 72px}}

.gp2__hero-content{animation:gpFadeUp 0.5s ease both}
.gp2__hero-proof-block{animation:gpFadeUp 0.5s ease 0.08s both}
.gp2__hero-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:0.72rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);margin-bottom:20px}
.gp2__hero-eyebrow::before{content:'';width:24px;height:1px;background:var(--accent)}
.gp2__hero h1{font-family:var(--serif);font-size:clamp(2.05rem,5vw,3.3rem);font-weight:400;line-height:1.08;color:#fff;margin-bottom:20px}
.gp2__hero h1 em{font-style:normal;color:var(--accent)}
.gp2__hero-sub{font-size:1rem;line-height:1.7;color:var(--muted);max-width:540px;margin-bottom:28px}

.gp2__hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:0}
.gp2__hero-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:13px 20px;border-radius:var(--radius);border:1px solid transparent;font-size:0.9rem;font-weight:800;cursor:pointer;text-decoration:none;transition:background 0.15s,border-color 0.15s,transform 0.1s}
.gp2__hero-btn--primary{color:var(--bg);background:var(--accent)}
.gp2__hero-btn--primary:hover{background:var(--accent-hover);transform:translateY(-1px)}
.gp2__hero-btn--secondary{color:var(--text);background:rgba(255,255,255,0.04);border-color:var(--border)}
.gp2__hero-btn--secondary:hover{background:var(--accent-soft);border-color:var(--border-active)}

.gp2__proof{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;max-width:560px;margin-bottom:20px}
.gp2__proof-item{background:var(--surface);padding:19px 14px;text-align:center}
.gp2__proof-value{font-family:var(--serif);font-size:clamp(1.35rem,3vw,1.8rem);color:#fff;display:block;line-height:1}
.gp2__proof-label{font-size:0.7rem;color:var(--muted);margin-top:6px;display:block;line-height:1.3}
.gp2__trust{font-size:0.86rem;color:var(--muted);line-height:1.6;max-width:560px}
.gp2__trust strong{color:var(--text)}

.gp2__mini-plan{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:560px;margin-top:26px}
.gp2__mini-card{background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));border:1px solid var(--border);border-radius:var(--radius);padding:16px}
.gp2__mini-label{display:block;font-size:0.68rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--dim);margin-bottom:8px}
.gp2__mini-card strong{display:block;font-size:0.92rem;color:#fff;line-height:1.35}
.gp2__mini-card span:last-child{display:block;font-size:0.78rem;color:var(--muted);line-height:1.45;margin-top:6px}
@media(max-width:600px){.gp2__mini-plan{grid-template-columns:1fr}.gp2__proof{grid-template-columns:1fr}}

.gp2__form-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px 28px 28px;animation:gpFadeUp 0.5s ease 0.12s both}
@media(min-width:900px){.gp2__form-card{grid-column:2;grid-row:1 / span 2;position:sticky;top:24px}.gp2__hero-proof-block{grid-column:1;grid-row:2}}
.gp2__form-badge{display:inline-flex;align-items:center;gap:6px;font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--accent);background:var(--accent-soft);border:1px solid var(--accent-med);padding:5px 10px;border-radius:999px;margin-bottom:16px}
.gp2__form-badge::before{content:'';width:6px;height:6px;border-radius:999px;background:var(--accent)}
.gp2__form-title{font-family:var(--serif);font-size:1.35rem;font-weight:400;color:#fff;margin-bottom:4px}
.gp2__form-sub{font-size:0.84rem;color:var(--muted);margin-bottom:24px;line-height:1.5}
.gp2__form-fields{display:grid;gap:14px}
.gp2__field{display:grid;gap:5px}
.gp2__field-label{font-size:0.72rem;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:var(--muted)}
.gp2__field-label .req{color:var(--accent);margin-left:2px}
.gp2__input,.gp2__select{font-family:var(--sans);font-size:0.92rem;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px 14px;outline:none;transition:border-color 0.15s,box-shadow 0.15s;width:100%}
.gp2__input::placeholder{color:rgba(138,146,126,0.55)}
.gp2__input:focus,.gp2__select:focus{border-color:rgba(163,217,119,0.45);box-shadow:0 0 0 3px var(--accent-soft)}
.gp2__select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238A927E' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:36px}
.gp2__submit{width:100%;padding:14px;font-family:var(--sans);font-size:0.92rem;font-weight:800;color:var(--bg);background:var(--accent);border:none;border-radius:var(--radius);cursor:pointer;transition:background 0.15s,transform 0.1s;margin-top:8px}
.gp2__submit:hover:not(:disabled){background:var(--accent-hover);transform:translateY(-1px)}
.gp2__submit:disabled{opacity:0.55;cursor:not-allowed}
.gp2__form-footer{text-align:center;font-size:0.72rem;color:var(--dim);margin-top:10px;line-height:1.5}
.gp2__form-error{font-size:0.82rem;color:var(--danger);margin-top:4px}

.gp2__success{text-align:center;padding:32px 0;animation:gpFadeUp 0.4s ease both}
.gp2__success-icon{width:56px;height:56px;border-radius:999px;background:var(--accent-soft);border:2px solid var(--accent-med);display:grid;place-items:center;margin:0 auto 20px}
.gp2__success h2{font-family:var(--serif);font-size:1.28rem;font-weight:400;color:#fff;margin-bottom:10px}
.gp2__success p{font-size:0.86rem;color:var(--muted);line-height:1.6;max-width:320px;margin:0 auto}

.gp2__divider{max-width:1120px;margin:0 auto;padding:0 28px}
.gp2__divider-line{height:1px;background:var(--border)}
.gp2__section{max-width:1120px;margin:0 auto;padding:64px 28px}
.gp2__section-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.gp2__section-eyebrow::before{content:'';width:16px;height:1px;background:var(--accent)}
.gp2__section-title{font-family:var(--serif);font-size:clamp(1.38rem,3vw,1.95rem);font-weight:400;color:#fff;margin-bottom:38px;max-width:520px;line-height:1.2}

.gp2__calc{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
.gp2__calc-header{padding:24px 28px;border-bottom:1px solid var(--border)}
.gp2__calc-header h3{font-family:var(--serif);font-size:1.16rem;font-weight:400;color:#fff}
.gp2__calc-header p{font-size:0.82rem;color:var(--muted);margin-top:4px;line-height:1.5}
.gp2__calc-body{padding:24px 28px;display:grid;gap:20px}
.gp2__calc-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:600px){.gp2__calc-row{grid-template-columns:1fr}}
.gp2__calc-field{display:grid;gap:5px}
.gp2__calc-field label{font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.04em;color:var(--muted)}
.gp2__calc-results{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border-top:1px solid var(--border)}
@media(max-width:700px){.gp2__calc-results{grid-template-columns:1fr}}
.gp2__calc-result{background:var(--card);padding:24px;text-align:center}
.gp2__calc-result-value{font-family:var(--serif);font-size:1.6rem;color:var(--accent);display:block;line-height:1}
.gp2__calc-result-label{font-size:0.72rem;color:var(--muted);margin-top:6px;display:block;line-height:1.35}

.gp2__proof-grid{display:grid;gap:12px}
@media(min-width:700px){.gp2__proof-grid{grid-template-columns:1fr 1fr;gap:16px}}
.gp2__proof-card{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:var(--radius);padding:24px;display:grid;gap:12px}
.gp2__proof-card-quote{font-size:0.95rem;color:var(--text);line-height:1.6;font-style:italic}
.gp2__proof-card-meta{font-size:0.75rem;color:var(--dim)}
.gp2__proof-card-stat{display:flex;align-items:baseline;gap:8px}
.gp2__proof-card-stat strong{font-family:var(--serif);font-size:1.5rem;color:#fff}
.gp2__proof-card-stat span{font-size:0.82rem;color:var(--muted)}

.gp2__products{display:grid;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden}
@media(min-width:740px){.gp2__products{grid-template-columns:repeat(4,1fr)}}
.gp2__product{background:var(--surface);padding:24px 20px;display:grid;gap:8px}
.gp2__product-name{font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase}
.gp2__product-price{font-family:var(--serif);font-size:1.5rem;color:#fff}
.gp2__product-price small{font-size:0.6em;color:var(--muted)}
.gp2__product-desc{font-size:0.8rem;color:var(--muted);line-height:1.5}
.gp2__product--highlight{background:var(--card);border-left:3px solid var(--accent)}

.gp2__steps{display:grid;gap:0}
@media(min-width:700px){.gp2__steps{grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}.gp2__step{background:var(--surface)}}
.gp2__step{padding:28px 24px;display:grid;gap:8px}
.gp2__step-num{font-size:0.68rem;font-weight:800;color:var(--accent);letter-spacing:0.08em}
.gp2__step-title{font-size:1rem;font-weight:800;color:#fff}
.gp2__step-desc{font-size:0.85rem;color:var(--muted);line-height:1.6}

.gp2__faq-list{display:grid;gap:4px}
.gp2__faq{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
.gp2__faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 20px;background:var(--surface);border:none;color:var(--text);font-family:var(--sans);font-size:0.9rem;font-weight:700;text-align:left;cursor:pointer;transition:background 0.15s}
.gp2__faq-q:hover{background:var(--card)}
.gp2__faq-chevron{transition:transform 0.2s;color:var(--muted);flex-shrink:0}
.gp2__faq-chevron.is-open{transform:rotate(180deg)}
.gp2__faq-a{padding:0 20px 16px;font-size:0.88rem;color:var(--muted);line-height:1.65;background:var(--surface)}

.gp2__bottom{max-width:1120px;margin:0 auto;padding:0 28px 80px}
.gp2__bottom-card{background:linear-gradient(135deg,var(--card) 0%,var(--surface) 100%);border:1px solid var(--border);border-radius:var(--radius-lg);padding:48px 32px;text-align:center}
.gp2__bottom-card h2{font-family:var(--serif);font-size:clamp(1.35rem,3vw,1.8rem);font-weight:400;color:#fff;max-width:560px;margin:0 auto 12px;line-height:1.2}
.gp2__bottom-card p{font-size:0.9rem;color:var(--muted);max-width:500px;margin:0 auto 24px;line-height:1.6}
.gp2__bottom-btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;font-family:var(--sans);font-size:0.92rem;font-weight:800;color:var(--bg);background:var(--accent);border:none;border-radius:var(--radius);cursor:pointer;transition:background 0.15s,transform 0.1s}
.gp2__bottom-btn:hover{background:var(--accent-hover);transform:translateY(-1px)}
`;

function getParam(searchParams, key) {
  return searchParams.get(key) || undefined;
}

function GrowerPage() {
  const formRef = useRef(null);
  const location = useLocation();
  const { dealerSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [calcAcres, setCalcAcres] = useState(1000);
  const [calcCurrentN, setCalcCurrentN] = useState(35);
  const sourceCost = calcAcres * 15;
  const currentNSpend = calcAcres * calcCurrentN;
  const estimatedSavings = Math.max(0, currentNSpend - sourceCost);
  const isSourceRoute = location.pathname === "/source";
  const leadSource = isSourceRoute ? "website-source-sales-page" : "website-grower-funnel";
  const pageVersion = isSourceRoute ? "source-sales-acre-plan-v2" : "grower-source-acre-plan-v2";
  const funnelName = isSourceRoute ? "SOURCE sales funnel" : "grower funnel";

  usePageMeta({
    title: "Get a SOURCE Acre Plan | Harvest Drone",
    description:
      "See what SOURCE could cost on your acres and what nitrogen dollars it may help reduce.",
  });

  useEffect(() => {
    trackMetaEventOnce(`source-sales-view:${location.pathname}`, "ViewContent", {
      content_name: isSourceRoute ? "Harvest Drone SOURCE Sales Funnel" : "Harvest Drone Grower Funnel",
      content_category: "SOURCE acre plan",
      lead_source: leadSource,
      page_version: pageVersion,
    });
  }, [isSourceRoute, leadSource, location.pathname, pageVersion]);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const fd = new FormData(event.currentTarget);
    const data = {
      firstName: fd.get("firstName")?.toString().trim(),
      email: fd.get("email")?.toString().trim(),
      state: fd.get("state")?.toString().trim(),
      cropType: "Corn/Soybeans",
      acres: fd.get("acres")?.toString().trim(),
      interestType: "Product availability/pricing",
      fertilityConcern: "Nitrogen efficiency",
      productInterest: "Yes",
      leadSource,
      landingPage: location.pathname,
      pageVersion,
      nitrogenProgramNotes: `Calculator N dollars reviewed: $${calcCurrentN}/acre across ${calcAcres} acres.`,
      notes: [
        `Requested free SOURCE acre plan from ${funnelName}.`,
        `Calculator SOURCE cost: $${sourceCost.toLocaleString()}.`,
        `Calculator potential net savings: $${estimatedSavings.toLocaleString()}.`,
      ].join("\n"),
      dealerSlug: dealerSlug || undefined,
      utm_source: getParam(searchParams, "utm_source"),
      utm_medium: getParam(searchParams, "utm_medium"),
      utm_campaign: getParam(searchParams, "utm_campaign"),
      utm_content: getParam(searchParams, "utm_content"),
      utm_term: getParam(searchParams, "utm_term"),
    };

    if (!data.firstName || !data.email || !data.state || !data.acres) {
      setErrorMessage("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitGrowerLead(data);
      trackMetaEventOnce(`source-sales-lead:${leadSource}:${result.created_at}`, "Lead", {
        content_name: isSourceRoute ? "Harvest Drone SOURCE Acre Plan" : "Harvest Drone Grower Acre Plan",
        content_category: "SOURCE acre plan",
        lead_source: leadSource,
        page_version: pageVersion,
        acres: Number(data.acres) || undefined,
        state: data.state,
      });
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong. Try again or call 612-258-0582.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <div className="gp2">
        <section className="gp2__hero">
          <div className="gp2__hero-content">
            <span className="gp2__hero-eyebrow">For growers watching nitrogen costs</span>
            <h1>
              One ounce replaces
              <br />
              <em>25 pounds of nitrogen.</em>
            </h1>
            <p className="gp2__hero-sub">
              SOURCE is a synthetic soil activator at $15/acre. Growers use it to reduce
              anhydrous, urea, and UAN spend while protecting yield potential. Get a quick
              acre plan that shows product cost, target savings, and whether a trial makes sense
              on your fields.
            </p>
            <div className="gp2__hero-actions">
              <button type="button" className="gp2__hero-btn gp2__hero-btn--primary" onClick={scrollToForm}>
                Get my acre plan
              </button>
              <button
                type="button"
                className="gp2__hero-btn gp2__hero-btn--secondary"
                onClick={() => document.getElementById("source-calculator")?.scrollIntoView({ behavior: "smooth" })}
              >
                Run the numbers
              </button>
            </div>
          </div>

          <div className="gp2__form-card" ref={formRef} id="grower-acre-plan-form">
            {isSubmitted ? (
              <div className="gp2__success">
                <div className="gp2__success-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#A3D977" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 14.5l5.5 5.5L22 9" />
                  </svg>
                </div>
                <h2>We're building your acre plan.</h2>
                <p>
                  Jake will follow up within one business day with a SOURCE recommendation
                  specific to your acres.
                </p>
              </div>
            ) : (
              <>
                <div className="gp2__form-badge">Free - 30 seconds</div>
                <h2 className="gp2__form-title">Get your acre plan</h2>
                <p className="gp2__form-sub">
                  We will show what SOURCE would cost on your fields and what nitrogen
                  dollars it may help reduce.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="gp2__form-fields">
                    <div className="gp2__field">
                      <label className="gp2__field-label" htmlFor="firstName">
                        First name <span className="req">*</span>
                      </label>
                      <input
                        className="gp2__input"
                        id="firstName"
                        name="firstName"
                        required
                        placeholder="Your first name"
                        autoComplete="given-name"
                        defaultValue={searchParams.get("firstName") || ""}
                      />
                    </div>
                    <div className="gp2__field">
                      <label className="gp2__field-label" htmlFor="email">
                        Email <span className="req">*</span>
                      </label>
                      <input
                        className="gp2__input"
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@yourfarm.com"
                        autoComplete="email"
                        inputMode="email"
                        defaultValue={searchParams.get("email") || ""}
                      />
                    </div>
                    <div className="gp2__field">
                      <label className="gp2__field-label" htmlFor="state">
                        State <span className="req">*</span>
                      </label>
                      <select
                        className="gp2__select"
                        id="state"
                        name="state"
                        required
                        defaultValue={searchParams.get("state") || ""}
                      >
                        <option value="" disabled>
                          Select your state
                        </option>
                        {STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="gp2__field">
                      <label className="gp2__field-label" htmlFor="acres">
                        Total acres <span className="req">*</span>
                      </label>
                      <input
                        className="gp2__input"
                        id="acres"
                        name="acres"
                        type="number"
                        required
                        placeholder="1,200"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        defaultValue={searchParams.get("acres") || ""}
                      />
                    </div>
                  </div>
                  {errorMessage ? <p className="gp2__form-error">{errorMessage}</p> : null}
                  <button className="gp2__submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Reviewing your acres..." : "Get my acre plan"}
                  </button>
                  <p className="gp2__form-footer">
                    No commitment. Includes cost breakdown and trial recommendation.
                  </p>
                </form>
              </>
            )}
          </div>

          <div className="gp2__hero-proof-block">
            <div className="gp2__proof">
              <div className="gp2__proof-item">
                <span className="gp2__proof-value">$15</span>
                <span className="gp2__proof-label">per acre</span>
              </div>
              <div className="gp2__proof-item">
                <span className="gp2__proof-value">3-4 bu</span>
                <span className="gp2__proof-label">reported corn lift</span>
              </div>
              <div className="gp2__proof-item">
                <span className="gp2__proof-value">1M+</span>
                <span className="gp2__proof-label">US acres on SOURCE</span>
              </div>
            </div>
            <p className="gp2__trust">
              <strong>Start with a test block.</strong> Leave check strips, compare at harvest,
              and expand only if your field data earns it.
            </p>
            <div className="gp2__mini-plan" aria-label="What your acre plan includes">
              <div className="gp2__mini-card">
                <span className="gp2__mini-label">Cost</span>
                <strong>Product spend by acre</strong>
                <span>SOURCE, BLUEPRINT, bundle, and drone application options.</span>
              </div>
              <div className="gp2__mini-card">
                <span className="gp2__mini-label">Trial</span>
                <strong>Simple check-strip plan</strong>
                <span>Where to test, what to compare, and how to judge the result.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="gp2__section" id="source-calculator">
          <span className="gp2__section-eyebrow">Run your own numbers</span>
          <h2 className="gp2__section-title">See how a SOURCE trial changes your nitrogen math.</h2>
          <div className="gp2__calc">
            <div className="gp2__calc-header">
              <h3>SOURCE savings calculator</h3>
              <p>
                Use the nitrogen dollars you are considering cutting or reallocating,
                then compare that against SOURCE at $15/acre.
              </p>
            </div>
            <div className="gp2__calc-body">
              <div className="gp2__calc-row">
                <div className="gp2__calc-field">
                  <label htmlFor="calcAcres">Acres to evaluate</label>
                  <input
                    className="gp2__input"
                    id="calcAcres"
                    type="number"
                    value={calcAcres}
                    onChange={(event) => setCalcAcres(Math.max(0, Number(event.target.value)))}
                    min="0"
                    step="100"
                  />
                </div>
                <div className="gp2__calc-field">
                  <label htmlFor="calcCurrentN">N dollars targeted per acre</label>
                  <input
                    className="gp2__input"
                    id="calcCurrentN"
                    type="number"
                    value={calcCurrentN}
                    onChange={(event) => setCalcCurrentN(Math.max(0, Number(event.target.value)))}
                    min="0"
                    step="5"
                  />
                </div>
              </div>
            </div>
            <div className="gp2__calc-results">
              <div className="gp2__calc-result">
                <span className="gp2__calc-result-value">${sourceCost.toLocaleString()}</span>
                <span className="gp2__calc-result-label">
                  SOURCE cost ({calcAcres.toLocaleString()} acres x $15)
                </span>
              </div>
              <div className="gp2__calc-result">
                <span className="gp2__calc-result-value">${currentNSpend.toLocaleString()}</span>
                <span className="gp2__calc-result-label">Nitrogen dollars under review</span>
              </div>
              <div className="gp2__calc-result">
                <span className="gp2__calc-result-value">${estimatedSavings.toLocaleString()}</span>
                <span className="gp2__calc-result-label">Potential net savings before yield impact</span>
              </div>
            </div>
          </div>
        </section>

        <div className="gp2__divider">
          <div className="gp2__divider-line" />
        </div>

        <section className="gp2__section">
          <span className="gp2__section-eyebrow">What growers are reporting</span>
          <h2 className="gp2__section-title">They tried it on part of their fields. Then they expanded.</h2>
          <div className="gp2__proof-grid">
            {proofPoints.map((point) => (
              <div className="gp2__proof-card" key={point.quote}>
                <p className="gp2__proof-card-quote">"{point.quote}"</p>
                <span className="gp2__proof-card-meta">{point.meta}</span>
                <div className="gp2__proof-card-stat">
                  <strong>{point.stat.value}</strong>
                  <span>{point.stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="gp2__divider">
          <div className="gp2__divider-line" />
        </div>

        <section className="gp2__section">
          <span className="gp2__section-eyebrow">Transparent pricing</span>
          <h2 className="gp2__section-title">Know the product cost before anyone calls you.</h2>
          <div className="gp2__products">
            <div className="gp2__product">
              <span className="gp2__product-name" style={{ color: "var(--accent)" }}>
                SOURCE
              </span>
              <span className="gp2__product-price">
                $15<small>/acre</small>
              </span>
              <span className="gp2__product-desc">
                Synthetic activator. 1 oz replaces 25 pounds of N. Built for anhydrous,
                urea, and UAN reduction plans.
              </span>
            </div>
            <div className="gp2__product">
              <span className="gp2__product-name" style={{ color: "var(--blue)" }}>
                BLUEPRINT
              </span>
              <span className="gp2__product-price">
                $11<small>/acre</small>
              </span>
              <span className="gp2__product-desc">
                Helps improve phosphorus availability and reduce pressure on DAP or MAP spend.
              </span>
            </div>
            <div className="gp2__product gp2__product--highlight">
              <span className="gp2__product-name" style={{ color: "var(--accent)" }}>
                Bundle
              </span>
              <span className="gp2__product-price">
                $25<small>/acre</small>
              </span>
              <span className="gp2__product-desc">
                SOURCE plus BLUEPRINT. Use when both nitrogen efficiency and phosphorus access matter.
              </span>
            </div>
            <div className="gp2__product">
              <span className="gp2__product-name" style={{ color: "var(--warning)" }}>
                Drone apply
              </span>
              <span className="gp2__product-price">
                Quote<small>/acre</small>
              </span>
              <span className="gp2__product-desc">
                Optional Harvest Drone application for wet fields, tall canopy, and tight timing windows.
              </span>
            </div>
          </div>
        </section>

        <div className="gp2__divider">
          <div className="gp2__divider-line" />
        </div>

        <section className="gp2__section">
          <span className="gp2__section-eyebrow">How it works</span>
          <h2 className="gp2__section-title">Three steps. No complexity.</h2>
          <div className="gp2__steps">
            <div className="gp2__step">
              <span className="gp2__step-num">STEP 01</span>
              <span className="gp2__step-title">Tell us about your acres</span>
              <span className="gp2__step-desc">
                Four fields. 30 seconds. We build a free acre plan showing product cost
                and a practical SOURCE trial path.
              </span>
            </div>
            <div className="gp2__step">
              <span className="gp2__step-num">STEP 02</span>
              <span className="gp2__step-title">Start with a test block</span>
              <span className="gp2__step-desc">
                Pick fields, leave check strips, and compare SOURCE-treated rows against
                your current program at harvest.
              </span>
            </div>
            <div className="gp2__step">
              <span className="gp2__step-num">STEP 03</span>
              <span className="gp2__step-title">Expand based on your result</span>
              <span className="gp2__step-desc">
                If the math and yield data work, expand next season. If not, you tested
                a contained portion and now you know.
              </span>
            </div>
          </div>
        </section>

        <div className="gp2__divider">
          <div className="gp2__divider-line" />
        </div>

        <section className="gp2__section">
          <span className="gp2__section-eyebrow">Common questions</span>
          <h2 className="gp2__section-title">Straight answers before you try it.</h2>
          <div className="gp2__faq-list">
            {faqs.map((faq, index) => (
              <div className="gp2__faq" key={faq.q}>
                <button
                  type="button"
                  className="gp2__faq-q"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                >
                  {faq.q}
                  <svg className={`gp2__faq-chevron${openFaq === index ? " is-open" : ""}`} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </button>
                {openFaq === index ? <div className="gp2__faq-a">{faq.a}</div> : null}
              </div>
            ))}
          </div>
        </section>

        <section className="gp2__bottom">
          <div className="gp2__bottom-card">
            <h2>Your nitrogen bill went up. Your yield does not have to go down.</h2>
            <p>
              Tell us about your fields. We will show you what SOURCE costs on your acres,
              what nitrogen dollars it may help reduce, and how to test it without betting
              the whole farm.
            </p>
            <button type="button" className="gp2__bottom-btn" onClick={scrollToForm}>
              Get my acre plan
            </button>
          </div>
        </section>
      </div>
    </Shell>
  );
}

export default GrowerPage;
