import{r as a,j as e}from"./index-t6KqAXdK.js";import{S}from"./Shell-C71CozMt.js";import{c as C}from"./submissions-D-sYs9vi.js";import"./supabase-Di9bpDgL.js";const z=[{label:"First name",name:"firstName",required:!0,placeholder:"Emma",autoComplete:"given-name"},{label:"Email",name:"email",type:"email",required:!0,placeholder:"emma@collinsfarms.com",autoComplete:"email",inputMode:"email"},{label:"State",name:"state",required:!0,placeholder:"Illinois",autoComplete:"address-level1"},{label:"Crop type",name:"cropType",required:!0,placeholder:"Corn, soybeans"},{label:"Total acres",name:"acres",type:"number",required:!0,placeholder:"500",inputMode:"numeric",min:"0",step:"1"}],E=[{q:"What is SOURCE?",a:"SOURCE is a biological soil activator from Sound Agriculture. It activates soil microbes to fix atmospheric nitrogen and solubilize bound phosphorus so growers can reduce dependency on synthetic fertilizer while maintaining or improving yield."},{q:"How much does it cost per acre?",a:"Harvest Drone sells SOURCE and BLUEPRINT together for about $25 per acre. On a typical 500-acre order, that works out to roughly $12,500 total."},{q:"When should I apply it?",a:"SOURCE is applied as a single foliar application during the growing season. We will follow up after your order to confirm crop timing, acres, and delivery details."},{q:"Does it replace my current fertilizer program?",a:"It is designed to reduce dependency on synthetic fertilizer, not force a blind replacement. Many growers start with part of the program, evaluate results, and then dial in the next season based on field performance."},{q:"How do I get it delivered?",a:"Harvest Drone follows up directly after the order comes in. We confirm acres, timing, and shipping details, then coordinate delivery or local fulfillment from current inventory."}],R=`
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');

.sp {
  --bg: #0C0F0A;
  --surface: #151A12;
  --card: #1A2015;
  --border: rgba(255,255,255,0.06);
  --text: #E8E6E1;
  --text-muted: #727966;
  --accent: #A3D977;
  --accent-dim: rgba(163,217,119,0.10);
  --accent-hover: #B8E68A;
  --danger: #F87171;
  --sans: 'Instrument Sans', system-ui, sans-serif;
  --serif: 'DM Serif Display', Georgia, serif;

  background: var(--bg);
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

.sp__hero {
  max-width: 1200px;
  margin: 0 auto;
  padding: 56px 32px 64px;
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 56px;
  align-items: start;
}
.sp__hero-copy {
  padding-top: 16px;
}
.sp__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 20px;
}
.sp__eyebrow::before {
  content: '';
  width: 28px;
  height: 1px;
  background: var(--accent);
}
.sp__hero h1 {
  font-family: var(--serif);
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 400;
  line-height: 1.12;
  color: #fff;
  margin: 0 0 20px;
  max-width: 720px;
}
.sp__hero h1 em {
  font-style: normal;
  color: var(--accent);
}
.sp__hero-sub {
  font-size: 17px;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 560px;
  margin: 0 0 28px;
}
.sp__hero-proof {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.sp__hero-proof-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sp__hero-proof-item strong {
  font-family: var(--serif);
  font-size: 1.6rem;
  color: #fff;
}
.sp__hero-proof-item span {
  font-size: 12px;
  color: var(--text-muted);
}

.sp__form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 32px 32px;
  position: sticky;
  top: 24px;
}
.sp__form-header {
  margin-bottom: 24px;
}
.sp__form-header h2 {
  font-family: var(--serif);
  font-size: 1.35rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 6px;
}
.sp__form-header p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}
.sp__form-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sp__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sp__field-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding-left: 2px;
}
.sp__required {
  color: var(--accent);
  margin-left: 2px;
}
.sp__input {
  font-family: var(--sans);
  font-size: 15px;
  color: var(--text);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.sp__input::placeholder {
  color: rgba(114,121,102,0.6);
}
.sp__input:focus {
  border-color: rgba(163,217,119,0.4);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.sp__order-note {
  font-size: 12px;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid rgba(163,217,119,0.14);
  border-radius: 8px;
  padding: 10px 12px;
  line-height: 1.6;
}
.sp__form-error {
  font-size: 13px;
  color: var(--danger);
  margin: 4px 0 0;
}
.sp__submit {
  width: 100%;
  padding: 14px;
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  margin-top: 6px;
}
.sp__submit:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}
.sp__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sp__form-footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 10px;
}

.sp__success {
  text-align: center;
  padding: 24px 0;
}
.sp__success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.sp__success h2 {
  font-family: var(--serif);
  font-size: 1.3rem;
  font-weight: 400;
  color: #fff;
  margin: 0 0 10px;
}
.sp__success p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

.sp__section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 72px;
}
.sp__section-title {
  font-family: var(--serif);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 400;
  color: #fff;
  margin: 0 0 40px;
  max-width: 560px;
  line-height: 1.25;
}

.sp__roi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}
.sp__roi-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.sp__roi-inputs {
  padding: 32px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sp__roi-results {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sp__metric {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sp__metric span {
  font-size: 13px;
  color: var(--text-muted);
}
.sp__metric strong {
  font-family: var(--serif);
  font-size: 1.3rem;
  color: #fff;
}
.sp__metric--highlight {
  background: var(--accent-dim);
  border-color: rgba(163,217,119,0.15);
}
.sp__metric--highlight strong {
  color: var(--accent);
}
.sp__roi-note {
  font-size: 12px;
  color: var(--text-muted);
  margin: 4px 0 0;
  line-height: 1.6;
}

.sp__steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.sp__step {
  background: var(--surface);
  padding: 36px 32px;
}
.sp__step-num {
  font-family: var(--serif);
  font-size: 2.4rem;
  color: var(--accent);
  opacity: 0.3;
  line-height: 1;
  margin-bottom: 16px;
}
.sp__step-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.sp__step-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.sp__paths {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.sp__path-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sp__path-card h3 {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.sp__path-card p {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
}
.sp__path-chip {
  width: fit-content;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
.sp__path-btn {
  width: fit-content;
  margin-top: 8px;
  padding: 12px 20px;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
.sp__path-btn:hover {
  background: var(--accent-hover);
}

.sp__faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sp__faq {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.sp__faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}
.sp__faq-chevron {
  flex-shrink: 0;
  transition: transform 0.2s;
  color: var(--text-muted);
}
.sp__faq-chevron.is-open {
  transform: rotate(180deg);
}
.sp__faq-a {
  padding: 0 24px 20px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.65;
  margin: 0;
}

.sp__bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 80px;
}
.sp__bottom-card {
  background: linear-gradient(135deg, rgba(163,217,119,0.08) 0%, transparent 60%);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 56px 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sp__bottom-card h2 {
  font-family: var(--serif);
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 400;
  color: #fff;
  margin: 0 0 12px;
  max-width: 620px;
  line-height: 1.25;
}
.sp__bottom-card p {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0 0 28px;
  max-width: 520px;
}
.sp__bottom-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sans);
  font-size: 15px;
  font-weight: 700;
  color: var(--bg);
  background: var(--accent);
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  cursor: pointer;
}
.sp__bottom-btn:hover {
  background: var(--accent-hover);
}

@media (max-width: 900px) {
  .sp__hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 40px 20px 48px;
  }
  .sp__form-card {
    position: static;
  }
  .sp__roi-layout,
  .sp__paths,
  .sp__steps {
    grid-template-columns: 1fr;
  }
  .sp__roi-inputs {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
}

@media (max-width: 600px) {
  .sp__hero {
    padding: 32px 16px 36px;
  }
  .sp__form-card {
    padding: 28px 20px 24px;
  }
  .sp__section,
  .sp__bottom {
    padding-left: 16px;
    padding-right: 16px;
  }
  .sp__bottom-card {
    padding: 40px 24px;
  }
}
`;function m(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n)}function I(){const n=a.useRef(null),[c,v]=a.useState({firstName:"",email:"",state:"",cropType:"",acres:"500"}),[o,b]=a.useState({acres:"500",syntheticCostPerAcre:"120"}),[h,x]=a.useState(!1),[y,j]=a.useState(!1),[_,u]=a.useState(""),[p,w]=a.useState(null),l=Number(c.acres)>=1e3?"volume_quote":"standard",d=a.useMemo(()=>{const s=Number(o.acres)||0,r=Number(o.syntheticCostPerAcre)||0,t=s*25,i=s*Math.min(45,r*.35||0),q=i-t;return{acres:s,sourceCost:t,estimatedSavings:i,netBenefit:q}},[o]);function N(s){const{name:r,value:t}=s.target;v(i=>({...i,[r]:t}))}function f(s){const{name:r,value:t}=s.target;b(i=>({...i,[r]:t}))}async function k(s){s.preventDefault(),x(!0),u("");try{await C(c),j(!0)}catch(r){u(r.message??"Something went wrong. Please try again.")}finally{x(!1)}}function g(){var s;(s=n.current)==null||s.scrollIntoView({behavior:"smooth",block:"center"})}return e.jsxs(S,{compact:!0,children:[e.jsx("style",{children:R}),e.jsxs("div",{className:"sp",children:[e.jsxs("section",{className:"sp__hero",children:[e.jsxs("div",{className:"sp__hero-copy",children:[e.jsx("span",{className:"sp__eyebrow",children:"SOURCE by Sound Agriculture"}),e.jsxs("h1",{children:["Spend less on ",e.jsx("em",{children:"synthetic fertilizer."})," Get the same yield or better."]}),e.jsx("p",{className:"sp__hero-sub",children:"SOURCE is a biological soil activator that helps microbes fix atmospheric nitrogen and solubilize bound phosphorus, giving growers a simpler way to cut synthetic input dependency without sacrificing performance."}),e.jsxs("div",{className:"sp__hero-proof",children:[e.jsxs("div",{className:"sp__hero-proof-item",children:[e.jsx("strong",{children:"~$25/acre"}),e.jsx("span",{children:"SOURCE + BLUEPRINT combined"})]}),e.jsxs("div",{className:"sp__hero-proof-item",children:[e.jsx("strong",{children:"Up to $45"}),e.jsx("span",{children:"Synthetic savings per acre in some cases"})]}),e.jsxs("div",{className:"sp__hero-proof-item",children:[e.jsx("strong",{children:"1 pass"}),e.jsx("span",{children:"Single foliar application"})]})]})]}),e.jsx("div",{className:"sp__form-card",ref:n,children:y?e.jsxs("div",{className:"sp__success",children:[e.jsx("div",{className:"sp__success-icon",children:e.jsx("svg",{width:"28",height:"28",viewBox:"0 0 28 28",fill:"none",stroke:"#A3D977",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M6 14.5l5.5 5.5L22 9"})})}),e.jsx("h2",{children:"Your SOURCE order is in review."}),e.jsx("p",{children:"Jake will follow up to confirm acres, timing, and delivery details. Current inventory is moving now, so we will reach out quickly."})]}):e.jsxs("form",{className:"sp__form-grid",onSubmit:k,children:[e.jsxs("div",{className:"sp__form-header",children:[e.jsx("h2",{children:l==="volume_quote"?"Request your volume quote":"Place your order"}),e.jsx("p",{children:l==="volume_quote"?"Large-acreage request. Jake will follow up with custom pricing and logistics.":"Current inventory is in stock and ready to allocate."})]}),z.map(s=>e.jsxs("div",{className:"sp__field",children:[e.jsxs("label",{className:"sp__field-label",children:[s.label,s.required&&e.jsx("span",{className:"sp__required",children:"*"})]}),e.jsx("input",{className:"sp__input",name:s.name,type:s.type??"text",required:s.required,placeholder:s.placeholder,autoComplete:s.autoComplete,inputMode:s.inputMode,min:s.min,step:s.step,value:c[s.name],onChange:N})]},s.name)),l==="volume_quote"&&e.jsx("div",{className:"sp__order-note",children:"Orders over 1,000 acres are handled as a volume quote. Jake will follow up directly with acreage planning, fulfillment timing, and custom pricing."}),_&&e.jsx("p",{className:"sp__form-error",children:_}),e.jsx("button",{className:"sp__submit",type:"submit",disabled:h,children:h?"Submitting...":l==="volume_quote"?"Request My Volume Quote ->":"Place My Order ->"}),e.jsx("p",{className:"sp__form-footer",children:"Harvest Drone currently has 110 gallons available for immediate allocation."})]})})]}),e.jsxs("section",{className:"sp__section",children:[e.jsx("span",{className:"sp__eyebrow",children:"ROI math"}),e.jsx("h2",{className:"sp__section-title",children:"Model what a SOURCE program can look like on your acres."}),e.jsx("div",{className:"sp__roi-card",children:e.jsxs("div",{className:"sp__roi-layout",children:[e.jsxs("div",{className:"sp__roi-inputs",children:[e.jsxs("div",{className:"sp__field",children:[e.jsx("label",{className:"sp__field-label",children:"Total acres"}),e.jsx("input",{className:"sp__input",type:"number",name:"acres",min:"0",step:"1",value:o.acres,onChange:f})]}),e.jsxs("div",{className:"sp__field",children:[e.jsx("label",{className:"sp__field-label",children:"Current synthetic fertilizer cost per acre"}),e.jsx("input",{className:"sp__input",type:"number",name:"syntheticCostPerAcre",min:"0",step:"1",value:o.syntheticCostPerAcre,onChange:f})]}),e.jsx("p",{className:"sp__roi-note",children:"This is a directional calculator. It uses the $25/acre SOURCE + BLUEPRINT price and a simplified savings estimate based on the input cost you provide."})]}),e.jsxs("div",{className:"sp__roi-results",children:[e.jsxs("div",{className:"sp__metric sp__metric--highlight",children:[e.jsx("span",{children:"SOURCE cost"}),e.jsx("strong",{children:m(d.sourceCost)})]}),e.jsxs("div",{className:"sp__metric",children:[e.jsx("span",{children:"Estimated savings"}),e.jsx("strong",{children:m(d.estimatedSavings)})]}),e.jsxs("div",{className:"sp__metric sp__metric--highlight",children:[e.jsx("span",{children:"Net benefit"}),e.jsx("strong",{children:m(d.netBenefit)})]})]})]})})]}),e.jsxs("section",{className:"sp__section",children:[e.jsx("span",{className:"sp__eyebrow",children:"How it works"}),e.jsx("h2",{className:"sp__section-title",children:"Three simple steps from foliar pass to lower input pressure."}),e.jsxs("div",{className:"sp__steps",children:[e.jsxs("div",{className:"sp__step",children:[e.jsx("div",{className:"sp__step-num",children:"01"}),e.jsx("div",{className:"sp__step-title",children:"Apply SOURCE as a foliar spray"}),e.jsx("div",{className:"sp__step-desc",children:"One application, timed for the crop, layered into the season without adding operational complexity."})]}),e.jsxs("div",{className:"sp__step",children:[e.jsx("div",{className:"sp__step-num",children:"02"}),e.jsx("div",{className:"sp__step-title",children:"Microbes go to work"}),e.jsx("div",{className:"sp__step-desc",children:"SOURCE activates soil microbes to fix atmospheric nitrogen and solubilize phosphorus your soil already holds."})]}),e.jsxs("div",{className:"sp__step",children:[e.jsx("div",{className:"sp__step-num",children:"03"}),e.jsx("div",{className:"sp__step-title",children:"Reduce synthetics based on results"}),e.jsx("div",{className:"sp__step-desc",children:"Use field performance and economics to decide how aggressively to reduce your synthetic fertilizer program next season."})]})]})]}),e.jsxs("section",{className:"sp__section",children:[e.jsx("span",{className:"sp__eyebrow",children:"Order paths"}),e.jsx("h2",{className:"sp__section-title",children:"Fast path for standard orders. Human follow-up for larger acreage."}),e.jsxs("div",{className:"sp__paths",children:[e.jsxs("div",{className:"sp__path-card",children:[e.jsx("span",{className:"sp__path-chip",children:"Under 1,000 acres"}),e.jsx("h3",{children:"Place the order now."}),e.jsx("p",{children:"Send your acreage, crop, and state through the order form. We will review the request and lock in inventory while it is still available."})]}),e.jsxs("div",{className:"sp__path-card",children:[e.jsx("span",{className:"sp__path-chip",children:"Over 1,000 acres"}),e.jsx("h3",{children:"Request a volume quote."}),e.jsx("p",{children:"Large-acreage orders are handled directly so Jake can confirm fulfillment timing, pricing, and any logistics questions before invoicing."}),e.jsx("button",{type:"button",className:"sp__path-btn",onClick:g,children:"Request Volume Quote ->"})]})]})]}),e.jsxs("section",{className:"sp__section",children:[e.jsx("span",{className:"sp__eyebrow",children:"Grower proof"}),e.jsx("h2",{className:"sp__section-title",children:"What growers keep coming back for after the first season."}),e.jsxs("div",{className:"sp__paths",children:[e.jsxs("div",{className:"sp__path-card",children:[e.jsx("h3",{children:"Yield upside without more synthetic spend"}),e.jsx("p",{children:"Growers have reported 3-4 bushel corn lift in some cases, plus meaningful fertilizer savings where SOURCE fit the operation well."})]}),e.jsxs("div",{className:"sp__path-card",children:[e.jsx("h3",{children:"Performance that holds up in tough conditions"}),e.jsx("p",{children:"Results have stayed compelling enough that some growers move SOURCE across all acres after the first season once they see the field-by-field economics."})]})]})]}),e.jsxs("section",{className:"sp__section",children:[e.jsx("span",{className:"sp__eyebrow",children:"Common questions"}),e.jsx("h2",{className:"sp__section-title",children:"What growers ask before they place an order."}),e.jsx("div",{className:"sp__faq-list",children:E.map((s,r)=>e.jsxs("div",{className:"sp__faq",children:[e.jsxs("button",{type:"button",className:"sp__faq-q",onClick:()=>w(p===r?null:r),children:[s.q,e.jsx("svg",{className:`sp__faq-chevron${p===r?" is-open":""}`,width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M4 6l4 4 4-4"})})]}),p===r&&e.jsx("p",{className:"sp__faq-a",children:s.a})]},s.q))})]}),e.jsx("section",{className:"sp__bottom",children:e.jsxs("div",{className:"sp__bottom-card",children:[e.jsx("h2",{children:"110 gallons available now. Once it is gone, lead times are 6-8 weeks."}),e.jsx("p",{children:"Use current inventory while it is on hand. Every delayed decision risks pushing delivery into the next availability window."}),e.jsx("button",{type:"button",className:"sp__bottom-btn",onClick:g,children:"Place My Order ->"})]})})]})]})}export{I as default};
