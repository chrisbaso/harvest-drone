import{j as e,L as a}from"./index-t6KqAXdK.js";import{S as n}from"./Shell-C71CozMt.js";const o=[{num:"01",label:"Capture",title:"One front end for all demand.",desc:"Growers and operators enter through a single coordinated system. Geography, crop type, acreage, and intent are captured once - no redundant intake, no fragmented pipelines.",accent:"#A3D977"},{num:"02",label:"Route",title:"Every lead finds its highest-value path.",desc:"Rule-based routing scores each lead and assigns it to direct Harvest Drone service, operator fulfillment, or a nurture sequence - based on acreage thresholds, territory coverage, and operator availability.",accent:"#60A5FA"},{num:"03",label:"Monetize",title:"Three revenue layers on every qualified acre.",desc:"Application services generate immediate cash flow. Input distribution (SOURCE, BLUEPRINT) adds recurring margin. EarthOptics soil data creates the prescription flywheel that drives retention and reorder.",accent:"#FBBF24"}],s=[{label:"Application",range:"$8-14/acre",desc:"Drone spraying and seeding. Immediate service revenue on every job.",color:"#FBBF24"},{label:"Inputs",range:"$2-9/acre",desc:"SOURCE and BLUEPRINT biological distribution. $9 direct, $2 through sub-dealers. Recurring annually.",color:"#A3D977"},{label:"Soil data",range:"$1-3/acre",desc:"EarthOptics subsurface scanning. Drives the prescription that makes inputs sticky.",color:"#60A5FA"},{label:"Stacked total",range:"$11-26/acre",desc:"Per acre, per year, on every enrolled grower relationship.",color:"#fff"}],l=[{title:"Operator network",desc:"Sub-dealers and operators expand territory coverage without adding Harvest Drone headcount. Each operator brings their existing grower relationships and acres into the network."},{title:"Routing automation",desc:"Rule-based scoring and assignment turn lead flow into a repeatable system. Demand scales without proportional manual effort."},{title:"Distribution flywheel",desc:"EarthOptics data prescribes inputs. Inputs drive reorder. Reorder drives recurring margin. Each acre enrolled gets stickier every season."},{title:"NetCo ecosystem",desc:"Access to 800,000+ acres through existing agronomic relationships. Growth happens through integration, not cold acquisition."}],t=[{label:"Shared front end",sub:"Ads, landing pages, lead capture"},{label:"Intake & scoring",sub:"Geography, acreage, crop, intent"},{label:"Route decision",sub:"Direct HD - Operator - Nurture"},{label:"Opportunity",sub:"Job assigned or sequence triggered"},{label:"Service + inputs",sub:"Application + SOURCE/BLUEPRINT"},{label:"EarthOptics scan",sub:"Soil data -> prescription map"},{label:"Recurring revenue",sub:"Annual reorder on same acres"}],c=`
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');

.hiw{--h-bg:#0C0F0A;--h-surface:#151A12;--h-card:#1A2015;--h-border:rgba(255,255,255,0.06);--h-border-h:rgba(255,255,255,0.12);--h-text:#E8E6E1;--h-muted:#727966;--h-accent:#A3D977;--h-accent-dim:rgba(163,217,119,0.10);--h-sans:'Instrument Sans',system-ui,sans-serif;--h-serif:'DM Serif Display',Georgia,serif;background:var(--h-bg);color:var(--h-text);font-family:var(--h-sans);-webkit-font-smoothing:antialiased;min-height:100vh}

/* Hero */
.hiw__hero{max-width:1200px;margin:0 auto;padding:72px 32px 48px}
.hiw__hero-eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--h-accent);margin-bottom:20px}
.hiw__hero-eyebrow::before{content:'';width:28px;height:1px;background:var(--h-accent)}
.hiw__hero h1{font-family:var(--h-serif);font-size:clamp(2.2rem,5vw,3.6rem);font-weight:400;line-height:1.1;color:#fff;margin:0 0 20px;max-width:760px}
.hiw__hero-sub{font-size:18px;color:var(--h-muted);line-height:1.7;max-width:600px;margin:0}

/* Metric strip */
.hiw__metrics{max-width:1200px;margin:0 auto;padding:0 32px 72px}
.hiw__metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--h-border);border:1px solid var(--h-border);border-radius:12px;overflow:hidden}
.hiw__metric{background:var(--h-surface);padding:32px 28px;text-align:center}
.hiw__metric span{display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--h-muted);margin-bottom:6px}
.hiw__metric strong{display:block;font-family:var(--h-serif);font-size:1.5rem;color:#fff;margin-bottom:6px}
.hiw__metric p{font-size:13px;color:var(--h-muted);margin:0;line-height:1.5}

/* Section */
.hiw__section{max-width:1200px;margin:0 auto;padding:0 32px 72px}
.hiw__eyebrow{display:inline-flex;align-items:center;gap:10px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--h-accent);margin-bottom:12px}
.hiw__eyebrow::before{content:'';width:20px;height:1px;background:var(--h-accent)}
.hiw__title{font-family:var(--h-serif);font-size:clamp(1.5rem,3vw,2.2rem);font-weight:400;color:#fff;margin:0 0 40px;max-width:560px;line-height:1.2}
.hiw__divider{max-width:1200px;margin:0 auto;padding:0 32px}.hiw__divider-line{height:1px;background:var(--h-border);margin-bottom:72px}

/* Pillar cards */
.hiw__pillars{display:flex;flex-direction:column;gap:16px}
.hiw__pillar{display:grid;grid-template-columns:64px 1fr;gap:28px;background:var(--h-surface);border:1px solid var(--h-border);border-radius:12px;padding:36px 36px;align-items:start;transition:border-color .3s}
.hiw__pillar:hover{border-color:var(--h-border-h)}
.hiw__pillar-num{font-family:var(--h-serif);font-size:1.8rem;opacity:.3;padding-top:4px}
.hiw__pillar-content{display:flex;flex-direction:column;gap:6px}
.hiw__pillar-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.hiw__pillar-title{font-size:17px;font-weight:700;color:#fff;margin:0}
.hiw__pillar-desc{font-size:14px;color:var(--h-muted);line-height:1.65;margin:0}

/* Revenue stack */
.hiw__stack{display:flex;flex-direction:column;gap:2px;border-radius:12px;overflow:hidden;border:1px solid var(--h-border)}
.hiw__stack-row{display:flex;align-items:center;justify-content:space-between;padding:20px 28px;background:var(--h-surface);gap:16px;transition:background .15s}
.hiw__stack-row:hover{background:var(--h-card)}
.hiw__stack-left{display:flex;flex-direction:column;gap:2px;flex:1}
.hiw__stack-label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.hiw__stack-desc{font-size:13px;color:var(--h-muted);line-height:1.5}
.hiw__stack-range{font-family:var(--h-serif);font-size:1.3rem;color:#fff;white-space:nowrap;flex-shrink:0}
.hiw__stack-row--total{background:var(--h-accent-dim);border-top:1px solid rgba(163,217,119,0.15)}
.hiw__stack-row--total .hiw__stack-range{color:var(--h-accent);font-size:1.5rem}

/* Flow diagram */
.hiw__flow{display:flex;align-items:center;gap:0;overflow-x:auto;padding:8px 0}
.hiw__flow-node{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:140px;flex-shrink:0}
.hiw__flow-bubble{background:var(--h-surface);border:1px solid var(--h-border);border-radius:10px;padding:16px 18px;text-align:center;width:100%;transition:border-color .15s}
.hiw__flow-bubble:hover{border-color:var(--h-border-h)}
.hiw__flow-label{font-size:13px;font-weight:600;color:#fff;display:block}
.hiw__flow-sub{font-size:11px;color:var(--h-muted);display:block;margin-top:3px}
.hiw__flow-arrow{color:var(--h-muted);opacity:.3;font-size:18px;padding:0 6px;flex-shrink:0}

/* Scale levers */
.hiw__scale-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.hiw__scale-card{background:var(--h-surface);border:1px solid var(--h-border);border-radius:12px;padding:32px 28px;display:flex;flex-direction:column;gap:8px;transition:border-color .3s}
.hiw__scale-card:hover{border-color:var(--h-border-h)}
.hiw__scale-card h3{font-size:15px;font-weight:700;color:#fff;margin:0}
.hiw__scale-card p{font-size:14px;color:var(--h-muted);line-height:1.6;margin:0}

/* Bottom CTA */
.hiw__bottom{max-width:1200px;margin:0 auto;padding:0 32px 80px}
.hiw__bottom-card{background:linear-gradient(135deg,rgba(163,217,119,0.08) 0%,transparent 60%);border:1px solid var(--h-border);border-radius:16px;padding:56px 48px;display:flex;align-items:center;justify-content:space-between;gap:40px}
.hiw__bottom-copy{max-width:520px}
.hiw__bottom-copy h2{font-family:var(--h-serif);font-size:clamp(1.4rem,3vw,2rem);font-weight:400;color:#fff;margin:0 0 10px;line-height:1.25}
.hiw__bottom-copy p{font-size:15px;color:var(--h-muted);margin:0;line-height:1.7}
.hiw__bottom-actions{display:flex;gap:12px;flex-shrink:0}
.hiw__btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--h-sans);font-size:14px;font-weight:600;border-radius:8px;padding:12px 24px;text-decoration:none;cursor:pointer;transition:all .2s;border:none}
.hiw__btn--primary{background:var(--h-accent);color:var(--h-bg)}
.hiw__btn--primary:hover{filter:brightness(1.1);transform:translateY(-1px)}
.hiw__btn--secondary{background:transparent;color:var(--h-text);border:1px solid var(--h-border)}
.hiw__btn--secondary:hover{background:var(--h-surface);border-color:var(--h-border-h)}

/* Responsive */
@media(max-width:900px){.hiw__metrics-grid{grid-template-columns:1fr}.hiw__pillar{grid-template-columns:1fr;gap:12px}.hiw__scale-grid{grid-template-columns:1fr}.hiw__flow{flex-wrap:wrap;justify-content:center;gap:8px}.hiw__flow-arrow{display:none}.hiw__bottom-card{flex-direction:column;text-align:center;padding:40px 32px}.hiw__bottom-actions{justify-content:center}}
@media(max-width:600px){.hiw__hero{padding:48px 16px 36px}.hiw__metrics,.hiw__section,.hiw__divider,.hiw__bottom{padding-left:16px;padding-right:16px}.hiw__bottom-card{padding:36px 24px}.hiw__bottom-actions{flex-direction:column;width:100%}.hiw__btn{justify-content:center}}
`;function p(){return e.jsxs(n,{children:[e.jsx("style",{children:c}),e.jsxs("div",{className:"hiw",children:[e.jsxs("section",{className:"hiw__hero",children:[e.jsx("span",{className:"hiw__hero-eyebrow",children:"How it works"}),e.jsx("h1",{children:"One acre. Three revenue streams. Every season."}),e.jsx("p",{className:"hiw__hero-sub",children:"Harvest Drone captures agricultural demand through a single front end, routes it to the highest-value path, and monetizes every qualified acre across application, inputs, and soil data - compounding annually."})]}),e.jsx("div",{className:"hiw__metrics",children:e.jsxs("div",{className:"hiw__metrics-grid",children:[e.jsxs("div",{className:"hiw__metric",children:[e.jsx("span",{children:"Front end"}),e.jsx("strong",{children:"One shared system"}),e.jsx("p",{children:"Growers and operators enter through one coordinated experience"})]}),e.jsxs("div",{className:"hiw__metric",children:[e.jsx("span",{children:"Routing"}),e.jsx("strong",{children:"Direct + network"}),e.jsx("p",{children:"Each lead is scored and routed into its highest-value path"})]}),e.jsxs("div",{className:"hiw__metric",children:[e.jsx("span",{children:"Economics"}),e.jsx("strong",{children:"$11-26 per acre"}),e.jsx("p",{children:"Application, inputs, and data stack on every enrolled acre"})]})]})}),e.jsx("div",{className:"hiw__divider",children:e.jsx("div",{className:"hiw__divider-line"})}),e.jsxs("section",{className:"hiw__section",children:[e.jsx("span",{className:"hiw__eyebrow",children:"The model"}),e.jsx("h2",{className:"hiw__title",children:"Capture once. Route intelligently. Monetize three ways."}),e.jsx("div",{className:"hiw__pillars",children:o.map(i=>e.jsxs("div",{className:"hiw__pillar",children:[e.jsx("span",{className:"hiw__pillar-num",style:{color:i.accent},children:i.num}),e.jsxs("div",{className:"hiw__pillar-content",children:[e.jsx("span",{className:"hiw__pillar-label",style:{color:i.accent},children:i.label}),e.jsx("h3",{className:"hiw__pillar-title",children:i.title}),e.jsx("p",{className:"hiw__pillar-desc",children:i.desc})]})]},i.num))})]}),e.jsx("div",{className:"hiw__divider",children:e.jsx("div",{className:"hiw__divider-line"})}),e.jsxs("section",{className:"hiw__section",children:[e.jsx("span",{className:"hiw__eyebrow",children:"Revenue per acre"}),e.jsx("h2",{className:"hiw__title",children:"The acre doesn't stop at service revenue."}),e.jsx("div",{className:"hiw__stack",children:s.map((i,r)=>e.jsxs("div",{className:`hiw__stack-row${r===s.length-1?" hiw__stack-row--total":""}`,children:[e.jsxs("div",{className:"hiw__stack-left",children:[e.jsx("span",{className:"hiw__stack-label",style:{color:i.color},children:i.label}),e.jsx("span",{className:"hiw__stack-desc",children:i.desc})]}),e.jsx("span",{className:"hiw__stack-range",children:i.range})]},i.label))})]}),e.jsx("div",{className:"hiw__divider",children:e.jsx("div",{className:"hiw__divider-line"})}),e.jsxs("section",{className:"hiw__section",children:[e.jsx("span",{className:"hiw__eyebrow",children:"System flow"}),e.jsx("h2",{className:"hiw__title",children:"From ad click to recurring revenue in seven steps."}),e.jsx("div",{className:"hiw__flow",children:t.map((i,r)=>e.jsxs("div",{style:{display:"contents"},children:[e.jsx("div",{className:"hiw__flow-node",children:e.jsxs("div",{className:"hiw__flow-bubble",children:[e.jsx("span",{className:"hiw__flow-label",children:i.label}),e.jsx("span",{className:"hiw__flow-sub",children:i.sub})]})}),r<t.length-1&&e.jsx("span",{className:"hiw__flow-arrow",children:"->"})]},i.label))})]}),e.jsx("div",{className:"hiw__divider",children:e.jsx("div",{className:"hiw__divider-line"})}),e.jsxs("section",{className:"hiw__section",children:[e.jsx("span",{className:"hiw__eyebrow",children:"Why it scales"}),e.jsx("h2",{className:"hiw__title",children:"Routing and coverage compound together."}),e.jsx("div",{className:"hiw__scale-grid",children:l.map(i=>e.jsxs("div",{className:"hiw__scale-card",children:[e.jsx("h3",{children:i.title}),e.jsx("p",{children:i.desc})]},i.title))})]}),e.jsx("div",{className:"hiw__bottom",children:e.jsxs("div",{className:"hiw__bottom-card",children:[e.jsxs("div",{className:"hiw__bottom-copy",children:[e.jsx("h2",{children:"The system is live. The model is working. The question is scale."}),e.jsx("p",{children:"See the live dashboard, walk through the grower or operator funnel, or explore the full business model."})]}),e.jsxs("div",{className:"hiw__bottom-actions",children:[e.jsx(a,{className:"hiw__btn hiw__btn--primary",to:"/growers",children:"Grower funnel"}),e.jsx(a,{className:"hiw__btn hiw__btn--secondary",to:"/operators",children:"Operator funnel"})]})]})})]})]})}export{p as default};
