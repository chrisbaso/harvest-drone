import{r,j as e}from"./index-t6KqAXdK.js";import{S as Ue}from"./Shell-C71CozMt.js";import{s as T}from"./supabase-Di9bpDgL.js";function k(s){return{grower:"Grower",operator:"Operator",hylio:"Hylio",dealer:"Dealer",partner:"Partner",grower_direct:"Grower direct",operator_routed:"Operator routed",hylio_sale:"Hylio sale",dealer_distribution:"Dealer distribution",earthoptics_distribution:"EarthOptics distribution",sound_ag_direct:"Sound Ag direct",direct_hd:"Direct Harvest Drone",route_to_operator:"Route to operator",operator_pool:"Operator pool"}[s]||s||"-"}function O(s){return{new:"New",contacted:"Contacted",qualified:"Qualified",call_scheduled:"Call Scheduled",closed_won:"Closed Won",closed_lost:"Closed Lost",open:"Open",assigned:"Assigned",unassigned:"Unassigned"}[s]||(s==null?void 0:s.replaceAll("_"," "))||"-"}function L(s){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(Number(s??0))}function Q(s){return s?new Intl.DateTimeFormat("en-US",{dateStyle:"medium",timeStyle:"short"}).format(new Date(s)):"-"}function j(s){return new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(Number(s??0))}function ve(s){return s==null||s===""?"-":typeof s=="number"?s.toLocaleString():typeof s=="boolean"?s?"Yes":"No":String(s)}function Xe(s=""){const a=String(s).toLowerCase();return["closed_won","active","approved","qualified"].includes(a)?{bg:"rgba(74,222,128,0.12)",color:"#4ADE80"}:["route_to_operator","call_scheduled","assigned","contacted"].includes(a)?{bg:"rgba(96,165,250,0.12)",color:"#60A5FA"}:["closed_lost","inactive"].includes(a)?{bg:"rgba(248,113,113,0.12)",color:"#F87171"}:["hylio","hylio_sale"].includes(a)?{bg:"rgba(251,191,36,0.12)",color:"#FBBF24"}:{bg:"rgba(255,255,255,0.06)",color:"#9CA38C"}}const Ye=`
.cdp-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-end;
  animation: cdp-fadeIn 0.15s ease;
}
@keyframes cdp-fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.cdp-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
}

.cdp {
  --cdp-bg: #111610;
  --cdp-surface: #181E14;
  --cdp-border: rgba(255,255,255,0.06);
  --cdp-text: #E8E6E1;
  --cdp-text-muted: #727966;
  --cdp-accent: #A3D977;
  --cdp-accent-dim: rgba(163,217,119,0.10);
  --cdp-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;
  --cdp-serif: 'DM Serif Display', Georgia, serif;

  position: relative;
  z-index: 1;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  background: var(--cdp-bg);
  border-left: 1px solid var(--cdp-border);
  font-family: var(--cdp-sans);
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cdp-slideIn 0.2s ease;
}
@keyframes cdp-slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cdp__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 28px 24px;
  border-bottom: 1px solid var(--cdp-border);
  flex-shrink: 0;
}
.cdp__header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.cdp__eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
}
.cdp__title {
  font-family: var(--cdp-serif);
  font-size: 1.4rem;
  font-weight: 400;
  color: #fff;
  margin: 0;
  line-height: 1.25;
  word-break: break-word;
}
.cdp__subtitle {
  font-size: 13px;
  color: var(--cdp-text-muted);
  margin: 2px 0 0;
  line-height: 1.5;
}
.cdp__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--cdp-border);
  background: transparent;
  color: var(--cdp-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.cdp__close:hover {
  background: rgba(255,255,255,0.04);
  color: var(--cdp-text);
  border-color: rgba(255,255,255,0.12);
}

.cdp__quick-stats {
  display: flex;
  gap: 1px;
  background: var(--cdp-border);
  border-bottom: 1px solid var(--cdp-border);
  flex-shrink: 0;
}
.cdp__quick-stat {
  flex: 1;
  padding: 14px 16px;
  background: var(--cdp-surface);
  text-align: center;
}
.cdp__quick-stat span {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
  margin-bottom: 4px;
}
.cdp__quick-stat strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.cdp__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cdp__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cdp__section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--cdp-border);
  margin: 0;
}

.cdp__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  background: var(--cdp-border);
  border-radius: 8px;
  overflow: hidden;
}
.cdp__grid-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px 16px;
  background: var(--cdp-surface);
}
.cdp__grid-item dt {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--cdp-text-muted);
}
.cdp__grid-item dd {
  font-size: 14px;
  color: var(--cdp-text);
  font-weight: 500;
  margin: 0;
}
.cdp__grid-item--highlight dd {
  color: var(--cdp-accent);
  font-weight: 700;
}

.cdp__stage-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  width: fit-content;
}
.cdp__stage-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.cdp__notes {
  font-size: 14px;
  color: var(--cdp-text);
  line-height: 1.65;
  margin: 0;
  padding: 14px 16px;
  background: var(--cdp-surface);
  border-radius: 8px;
  border: 1px solid var(--cdp-border);
}

@media (max-width: 520px) {
  .cdp {
    width: 100vw;
  }
  .cdp__header {
    padding: 20px 20px 18px;
  }
  .cdp__body {
    padding: 20px 20px 32px;
  }
  .cdp__grid {
    grid-template-columns: 1fr;
  }
}
`;function Ke({record:s,onClose:a}){const n=r.useRef(null);if(r.useEffect(()=>{if(!s)return;function c(m){m.key==="Escape"&&a()}return document.addEventListener("keydown",c),()=>document.removeEventListener("keydown",c)},[s,a]),!s)return null;const p=Object.entries(s.metadata||{}).filter(([,c])=>c!==null&&c!==""),l=s.stage||s.status||"",b=Xe(l),i=[{label:"Type",value:k(s.lead_type||s.opportunity_type||s.contact_type||s.account_type||s.operator_type||s.route_type)},{label:"State",value:s.state},{label:"County",value:s.county},{label:"Owner",value:s.owner||"Harvest Drone"},{label:"Source",value:s.source},{label:"Acres",value:s.acres??s.acreage_capacity,highlight:!0},{label:"Estimated value",value:s.estimated_value?L(s.estimated_value):null,highlight:!0},{label:"Created",value:Q(s.created_at)},{label:"Updated",value:Q(s.updated_at)}].filter(c=>c.value!==null&&c.value!==void 0),N=s.full_name||s.name||k(s.opportunity_type||s.lead_type||s.account_type||s.operator_type),d=[s.email,s.mobile,s.company_name,s.counties_served].filter(Boolean),M=[s.acres&&{label:"Acres",value:Number(s.acres).toLocaleString()},s.acreage_capacity&&!s.acres&&{label:"Capacity",value:Number(s.acreage_capacity).toLocaleString()},s.estimated_value&&{label:"Value",value:L(s.estimated_value)},l&&{label:"Stage",value:O(l)}].filter(Boolean).slice(0,3);return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:Ye}),e.jsxs("div",{className:"cdp-overlay",role:"dialog","aria-modal":"true",children:[e.jsx("div",{className:"cdp-backdrop",onClick:a}),e.jsxs("aside",{className:"cdp",ref:n,children:[e.jsxs("header",{className:"cdp__header",children:[e.jsxs("div",{className:"cdp__header-info",children:[e.jsx("span",{className:"cdp__eyebrow",children:"Record details"}),e.jsx("h3",{className:"cdp__title",children:N}),d.length>0&&e.jsx("p",{className:"cdp__subtitle",children:d.join(" - ")}),l&&e.jsxs("div",{className:"cdp__stage-badge",style:{background:b.bg,color:b.color,marginTop:8},children:[e.jsx("span",{className:"cdp__stage-dot",style:{background:b.color}}),O(l)]})]}),e.jsx("button",{type:"button",className:"cdp__close",onClick:a,"aria-label":"Close details",children:e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",children:e.jsx("path",{d:"M4 4l8 8M12 4l-8 8"})})})]}),M.length>0&&e.jsx("div",{className:"cdp__quick-stats",children:M.map(c=>e.jsxs("div",{className:"cdp__quick-stat",children:[e.jsx("span",{children:c.label}),e.jsx("strong",{children:c.value})]},c.label))}),e.jsxs("div",{className:"cdp__body",children:[e.jsxs("section",{className:"cdp__section",children:[e.jsx("h4",{className:"cdp__section-title",children:"Snapshot"}),e.jsx("dl",{className:"cdp__grid",children:i.map(c=>e.jsxs("div",{className:`cdp__grid-item${c.highlight?" cdp__grid-item--highlight":""}`,children:[e.jsx("dt",{children:c.label}),e.jsx("dd",{children:ve(c.value)})]},c.label))})]}),s.notes&&e.jsxs("section",{className:"cdp__section",children:[e.jsx("h4",{className:"cdp__section-title",children:"Notes"}),e.jsx("p",{className:"cdp__notes",children:s.notes})]}),p.length>0&&e.jsxs("section",{className:"cdp__section",children:[e.jsx("h4",{className:"cdp__section-title",children:"Metadata"}),e.jsx("dl",{className:"cdp__grid",children:p.map(([c,m])=>e.jsxs("div",{className:"cdp__grid-item",children:[e.jsx("dt",{children:c.replaceAll("_"," ")}),e.jsx("dd",{children:ve(m)})]},c))})]})]})]})]})]})}const Qe=`
.cf {
  --cf-bg: #151A12;
  --cf-surface: #1A2015;
  --cf-border: rgba(255,255,255,0.06);
  --cf-border-focus: rgba(163,217,119,0.4);
  --cf-text: #E8E6E1;
  --cf-text-muted: #727966;
  --cf-accent: #A3D977;
  --cf-accent-dim: rgba(163,217,119,0.10);
  --cf-input-bg: #0E1209;
  --cf-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;

  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 16px 20px;
  background: var(--cf-bg);
  border: 1px solid var(--cf-border);
  border-radius: 12px;
  font-family: var(--cf-sans);
  -webkit-font-smoothing: antialiased;
  flex-wrap: wrap;
}

.cf__search {
  flex: 1.6;
  min-width: 200px;
}

.cf__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 130px;
}

.cf__label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cf-text-muted);
  padding-left: 2px;
}

.cf__input,
.cf__select {
  font-family: var(--cf-sans);
  font-size: 13px;
  color: var(--cf-text);
  background: var(--cf-input-bg);
  border: 1px solid var(--cf-border);
  border-radius: 8px;
  padding: 9px 12px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.cf__input::placeholder {
  color: var(--cf-text-muted);
}
.cf__input:focus,
.cf__select:focus {
  border-color: var(--cf-border-focus);
  box-shadow: 0 0 0 2px var(--cf-accent-dim);
}

.cf__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23727966' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  cursor: pointer;
}
.cf__select.is-filtered {
  border-color: rgba(163,217,119,0.25);
  background-color: rgba(163,217,119,0.04);
}

.cf__active-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding-top: 4px;
  flex-wrap: wrap;
}
.cf__active-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--cf-accent);
  background: var(--cf-accent-dim);
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-family: var(--cf-sans);
  transition: background 0.15s;
}
.cf__active-pill:hover {
  background: rgba(163,217,119,0.18);
}
.cf__active-pill__x {
  font-size: 13px;
  line-height: 1;
  opacity: 0.7;
}
.cf__clear-all {
  font-family: var(--cf-sans);
  font-size: 11px;
  font-weight: 600;
  color: var(--cf-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s;
}
.cf__clear-all:hover {
  color: var(--cf-text);
}

@media (max-width: 768px) {
  .cf {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 14px 16px;
  }
  .cf__search,
  .cf__field {
    min-width: unset;
    flex: unset;
  }
  .cf__filters-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}
`;function Je({searchQuery:s,typeFilter:a,stageFilter:n,stateFilter:p,ownerFilter:l,typeOptions:b,stageOptions:i,stateOptions:N,ownerOptions:d,onSearchChange:M,onTypeChange:c,onStageChange:m,onStateChange:v,onOwnerChange:z}){const A=[a!=="all"&&{label:k(a),clear:()=>c("all")},n!=="all"&&{label:O(n),clear:()=>m("all")},p!=="all"&&{label:p,clear:()=>v("all")},l!=="all"&&{label:l,clear:()=>z("all")}].filter(Boolean),J=A.length>0||s.length>0;function $(){M(""),c("all"),m("all"),v("all"),z("all")}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:Qe}),e.jsxs("section",{className:"cf",children:[e.jsxs("div",{className:"cf__field cf__search",children:[e.jsx("span",{className:"cf__label",children:"Search"}),e.jsx("input",{className:"cf__input",type:"search",value:s,onChange:o=>M(o.target.value),placeholder:"Names, accounts, states, counties..."})]}),e.jsxs("div",{className:"cf__field",children:[e.jsx("span",{className:"cf__label",children:"Type"}),e.jsxs("select",{className:`cf__select${a!=="all"?" is-filtered":""}`,value:a,onChange:o=>c(o.target.value),children:[e.jsx("option",{value:"all",children:"All types"}),b.map(o=>e.jsx("option",{value:o,children:k(o)},o))]})]}),e.jsxs("div",{className:"cf__field",children:[e.jsx("span",{className:"cf__label",children:"Stage"}),e.jsxs("select",{className:`cf__select${n!=="all"?" is-filtered":""}`,value:n,onChange:o=>m(o.target.value),children:[e.jsx("option",{value:"all",children:"All stages"}),i.map(o=>e.jsx("option",{value:o,children:O(o)},o))]})]}),e.jsxs("div",{className:"cf__field",children:[e.jsx("span",{className:"cf__label",children:"State"}),e.jsxs("select",{className:`cf__select${p!=="all"?" is-filtered":""}`,value:p,onChange:o=>v(o.target.value),children:[e.jsx("option",{value:"all",children:"All states"}),N.map(o=>e.jsx("option",{value:o,children:o},o))]})]}),e.jsxs("div",{className:"cf__field",children:[e.jsx("span",{className:"cf__label",children:"Owner"}),e.jsxs("select",{className:`cf__select${l!=="all"?" is-filtered":""}`,value:l,onChange:o=>z(o.target.value),children:[e.jsx("option",{value:"all",children:"All owners"}),d.map(o=>e.jsx("option",{value:o,children:o},o))]})]}),A.length>0&&e.jsxs("div",{className:"cf__active-row",children:[A.map(o=>e.jsxs("button",{type:"button",className:"cf__active-pill",onClick:o.clear,children:[o.label,e.jsx("span",{className:"cf__active-pill__x",children:"x"})]},o.label)),J&&e.jsx("button",{type:"button",className:"cf__clear-all",onClick:$,children:"Clear all"})]})]})]})}const Ze={open:"#60A5FA",assigned:"#FBBF24",qualified:"#A3D977",closed_won:"#4ADE80",closed_lost:"#F87171"},et=`
.cpb {
  --cpb-bg: #0C0F0A;
  --cpb-surface: #151A12;
  --cpb-card-bg: #1A2015;
  --cpb-card-hover: #1F261A;
  --cpb-border: rgba(255,255,255,0.06);
  --cpb-border-hover: rgba(255,255,255,0.12);
  --cpb-text: #E8E6E1;
  --cpb-text-muted: #727966;
  --cpb-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;

  display: grid;
  grid-template-columns: repeat(var(--cpb-cols, 4), 1fr);
  gap: 12px;
  font-family: var(--cpb-sans);
  -webkit-font-smoothing: antialiased;
}

.cpb__col {
  display: flex;
  flex-direction: column;
  background: var(--cpb-surface);
  border: 1px solid var(--cpb-border);
  border-radius: 12px;
  overflow: hidden;
  min-height: 320px;
}

.cpb__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--cpb-border);
}
.cpb__header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cpb__stage-label {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cpb__stage-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cpb__stage-desc {
  font-size: 12px;
  color: var(--cpb-text-muted);
  margin-top: 2px;
}
.cpb__header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}
.cpb__count {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}
.cpb__total {
  font-size: 11px;
  color: var(--cpb-text-muted);
  font-weight: 500;
}

.cpb__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.cpb__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: var(--cpb-card-bg);
  border: 1px solid var(--cpb-border);
  border-radius: 8px;
  font-family: var(--cpb-sans);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  color: var(--cpb-text);
}
.cpb__card:hover {
  background: var(--cpb-card-hover);
  border-color: var(--cpb-border-hover);
  transform: translateY(-1px);
}

.cpb__card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.cpb__card-type {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}
.cpb__card-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--cpb-accent, #A3D977);
  white-space: nowrap;
  flex-shrink: 0;
}

.cpb__card-location {
  font-size: 12px;
  color: var(--cpb-text-muted);
  margin: 0;
  line-height: 1.4;
}

.cpb__card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--cpb-border);
}
.cpb__card-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--cpb-text-muted);
  background: rgba(255,255,255,0.04);
  padding: 2px 8px;
  border-radius: 4px;
}
.cpb__card-owner {
  font-size: 11px;
  color: var(--cpb-text-muted);
}

.cpb__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 32px 16px;
  font-size: 13px;
  color: var(--cpb-text-muted);
  text-align: center;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .cpb {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .cpb {
    grid-template-columns: 1fr;
  }
  .cpb__col {
    min-height: 200px;
  }
}
`;function tt({columns:s,rows:a,onSelect:n,emptyMessage:p="No records match the current filters."}){return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:et}),e.jsx("section",{className:"cpb",style:{"--cpb-cols":s.length},children:s.map(l=>{const b=a.filter(d=>d.stage===l.id),i=b.reduce((d,M)=>d+Number(M.estimated_value??0),0),N=Ze[l.id]||"#A3D977";return e.jsxs("article",{className:"cpb__col",children:[e.jsxs("header",{className:"cpb__header",children:[e.jsxs("div",{className:"cpb__header-info",children:[e.jsxs("span",{className:"cpb__stage-label",children:[e.jsx("span",{className:"cpb__stage-dot",style:{background:N}}),O(l.id)]}),e.jsx("span",{className:"cpb__stage-desc",children:l.description})]}),e.jsxs("div",{className:"cpb__header-right",children:[e.jsx("span",{className:"cpb__count",children:b.length}),i>0&&e.jsx("span",{className:"cpb__total",children:L(i)})]})]}),e.jsx("div",{className:"cpb__stack",children:b.length===0?e.jsx("div",{className:"cpb__empty",children:p}):b.map(d=>e.jsxs("button",{type:"button",className:"cpb__card",onClick:()=>n(d),style:{"--cpb-accent":N},children:[e.jsxs("div",{className:"cpb__card-top",children:[e.jsx("span",{className:"cpb__card-type",children:k(d.opportunity_type||d.lead_type)}),e.jsx("span",{className:"cpb__card-value",children:L(d.estimated_value)})]}),e.jsxs("p",{className:"cpb__card-location",children:[d.state||"No state",d.county?`, ${d.county}`:""]}),e.jsxs("div",{className:"cpb__card-meta",children:[e.jsx("span",{className:"cpb__card-tag",children:k(d.route_type)}),e.jsx("span",{className:"cpb__card-owner",children:d.owner||"Harvest Drone"})]})]},d.id))})]},l.id)})})]})}const je={dashboard:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("rect",{x:"1",y:"1",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"10",y:"1",width:"7",height:"4",rx:"1.5"}),e.jsx("rect",{x:"1",y:"10",width:"7",height:"7",rx:"1.5"}),e.jsx("rect",{x:"10",y:"7",width:"7",height:"10",rx:"1.5"})]}),leads:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M9 1v16M1 9h16"}),e.jsx("circle",{cx:"9",cy:"9",r:"7"})]}),opportunities:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 14l4-5 4 3 4-7 4 5"}),e.jsx("path",{d:"M1 17h16"})]}),operators:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"9",cy:"5",r:"3.5"}),e.jsx("path",{d:"M2 16.5c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5"})]}),growers:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M9 17V8"}),e.jsx("path",{d:"M9 8c0-4 3-6 6-7-1 3-2 5-6 7z"}),e.jsx("path",{d:"M9 8c0-4-3-6-6-7 1 3 2 5 6 7z"}),e.jsx("path",{d:"M4 17h10"})]}),hylio:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M9 2l2.5 5H15l-3.5 3.5L13 16l-4-2.5L5 16l1.5-5.5L3 7h3.5z"})}),activities:e.jsx("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M1 4h16M1 9h16M1 14h10"})}),accounts:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("rect",{x:"2",y:"3",width:"14",height:"12",rx:"2"}),e.jsx("path",{d:"M6 7h6M6 11h4"})]}),acres:e.jsxs("svg",{width:"18",height:"18",viewBox:"0 0 18 18",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 13l4-3 3 2 4-5 5 4"}),e.jsx("rect",{x:"1",y:"1",width:"16",height:"16",rx:"2"})]})},st=`
.crmside {
  --cs-bg: #0E1209;
  --cs-surface: #161C11;
  --cs-border: rgba(255,255,255,0.06);
  --cs-text: #C8CCBF;
  --cs-text-muted: #727966;
  --cs-accent: #A3D977;
  --cs-accent-dim: rgba(163,217,119,0.10);
  --cs-active-bg: rgba(163,217,119,0.08);
  --cs-hover-bg: rgba(255,255,255,0.03);
  --cs-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;
  --cs-serif: 'DM Serif Display', Georgia, serif;

  display: flex;
  flex-direction: column;
  width: 280px;
  min-height: 100%;
  background: var(--cs-bg);
  border-right: 1px solid var(--cs-border);
  font-family: var(--cs-sans);
  -webkit-font-smoothing: antialiased;
  overflow-y: auto;
  flex-shrink: 0;
}

.crmside__brand {
  padding: 28px 24px 20px;
  border-bottom: 1px solid var(--cs-border);
}
.crmside__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.crmside__logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--cs-accent) 0%, #6BBF3B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.crmside__logo-mark svg {
  width: 16px;
  height: 16px;
  color: var(--cs-bg);
}
.crmside__logo-text {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
}
.crmside__subtitle {
  font-size: 12px;
  color: var(--cs-text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  margin: 0;
}

.crmside__section-label {
  padding: 20px 24px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--cs-text-muted);
}

.crmside__nav {
  display: flex;
  flex-direction: column;
  padding: 4px 12px;
  gap: 2px;
  flex: 1;
}
.crmside__link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--cs-text);
  font-family: var(--cs-sans);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  position: relative;
}
.crmside__link:hover {
  background: var(--cs-hover-bg);
}
.crmside__link.is-active {
  background: var(--cs-active-bg);
  color: #fff;
}
.crmside__link.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--cs-accent);
}
.crmside__link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,255,255,0.04);
  color: var(--cs-text-muted);
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
}
.crmside__link.is-active .crmside__link-icon {
  background: var(--cs-accent-dim);
  color: var(--cs-accent);
}
.crmside__link-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.crmside__link-copy strong {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
}
.crmside__link-copy span {
  font-size: 11.5px;
  color: var(--cs-text-muted);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.crmside__link.is-active .crmside__link-copy span {
  color: rgba(163,217,119,0.6);
}
.crmside__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--cs-text-muted);
  background: rgba(255,255,255,0.04);
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 28px;
  text-align: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.crmside__link.is-active .crmside__count {
  background: var(--cs-accent-dim);
  color: var(--cs-accent);
}

.crmside__toggle {
  display: none;
}

@media (max-width: 900px) {
  .crmside {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 4px 0 24px rgba(0,0,0,0.5);
  }
  .crmside.is-open {
    transform: translateX(0);
  }
  .crmside__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 101;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid var(--cs-border);
    background: var(--cs-bg);
    color: var(--cs-text);
    cursor: pointer;
  }
  .crmside__backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
    background: rgba(0,0,0,0.6);
  }
}
`;function rt({sections:s,activeSection:a,onSelect:n}){const[p,l]=r.useState(!1);function b(i){n(i),l(!1)}return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:st}),e.jsx("button",{type:"button",className:"crmside__toggle",onClick:()=>l(!0),"aria-label":"Open CRM navigation",children:e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",children:e.jsx("path",{d:"M3 5h14M3 10h14M3 15h14"})})}),p&&e.jsx("div",{className:"crmside__backdrop",onClick:()=>l(!1)}),e.jsxs("aside",{className:`crmside${p?" is-open":""}`,children:[e.jsxs("div",{className:"crmside__brand",children:[e.jsxs("div",{className:"crmside__logo",children:[e.jsx("div",{className:"crmside__logo-mark",children:e.jsxs("svg",{viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M8 14V6"}),e.jsx("path",{d:"M8 6c0-3 2.5-5 5-5.5-.5 2.5-1.5 4-5 5.5z"}),e.jsx("path",{d:"M8 6c0-3-2.5-5-5-5.5.5 2.5 1.5 4 5 5.5z"})]})}),e.jsx("span",{className:"crmside__logo-text",children:"Harvest Drone"})]}),e.jsx("p",{className:"crmside__subtitle",children:"Revenue operating system"})]}),e.jsx("div",{className:"crmside__section-label",children:"Workspace"}),e.jsx("nav",{className:"crmside__nav","aria-label":"CRM sections",children:s.map(i=>e.jsxs("button",{type:"button",className:`crmside__link${i.id===a?" is-active":""}`,onClick:()=>b(i.id),children:[e.jsx("div",{className:"crmside__link-icon",children:je[i.id]||je.dashboard}),e.jsxs("div",{className:"crmside__link-copy",children:[e.jsx("strong",{children:i.label}),e.jsx("span",{children:i.description})]}),e.jsx("span",{className:"crmside__count",children:i.count})]},i.id))})]})]})}const I=25,at=`
.lt {
  --lt-bg: #0C0F0A;
  --lt-surface: #151A12;
  --lt-card-bg: #1A2015;
  --lt-border: rgba(255,255,255,0.06);
  --lt-border-hover: rgba(255,255,255,0.12);
  --lt-text: #E8E6E1;
  --lt-text-muted: #727966;
  --lt-accent: #A3D977;
  --lt-accent-dim: rgba(163,217,119,0.10);
  --lt-row-hover: rgba(255,255,255,0.025);
  --lt-row-stripe: rgba(255,255,255,0.012);
  --lt-sans: 'Instrument Sans', 'Inter', system-ui, sans-serif;

  background: var(--lt-surface);
  border: 1px solid var(--lt-border);
  border-radius: 12px;
  overflow: hidden;
  font-family: var(--lt-sans);
  -webkit-font-smoothing: antialiased;
}

.lt__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--lt-border);
}
.lt__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.lt__title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.lt__count {
  font-size: 12px;
  font-weight: 600;
  color: var(--lt-accent);
  background: var(--lt-accent-dim);
  padding: 3px 10px;
  border-radius: 10px;
}

.lt__wrap {
  overflow-x: auto;
}

.lt__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}
.lt__table thead {
  position: sticky;
  top: 0;
  z-index: 2;
}
.lt__table th {
  padding: 12px 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lt-text-muted);
  background: var(--lt-card-bg);
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--lt-border);
  user-select: none;
}
.lt__table th:first-child {
  padding-left: 24px;
}
.lt__table th:last-child {
  padding-right: 24px;
}
.lt__table td {
  padding: 14px 20px;
  color: var(--lt-text);
  border-bottom: 1px solid var(--lt-border);
  vertical-align: middle;
  line-height: 1.45;
}
.lt__table td:first-child {
  padding-left: 24px;
}
.lt__table td:last-child {
  padding-right: 24px;
}
.lt__table tbody tr {
  transition: background 0.1s;
}
.lt__table tbody tr:nth-child(even) {
  background: var(--lt-row-stripe);
}
.lt__table tbody tr:hover {
  background: var(--lt-row-hover);
}
.lt__table tbody tr.lt-row--clickable {
  cursor: pointer;
}

.lt__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  font-size: 14px;
  color: var(--lt-text-muted);
  text-align: center;
  line-height: 1.6;
}

.lt__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid var(--lt-border);
}
.lt__page-info {
  font-size: 12px;
  color: var(--lt-text-muted);
}
.lt__page-buttons {
  display: flex;
  gap: 6px;
}
.lt__page-btn {
  font-family: var(--lt-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--lt-text);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--lt-border);
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.lt__page-btn:hover:not(:disabled) {
  background: var(--lt-accent-dim);
  border-color: var(--lt-border-hover);
}
.lt__page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .lt__header {
    padding: 16px 16px;
  }
  .lt__table th,
  .lt__table td {
    padding: 10px 12px;
    font-size: 12px;
  }
  .lt__table th:first-child,
  .lt__table td:first-child {
    padding-left: 16px;
  }
  .lt__pagination {
    padding: 12px 16px;
    flex-direction: column;
    gap: 10px;
  }
}
`;function P({title:s,columns:a,rows:n,countLabel:p="records",getRowProps:l,emptyMessage:b="No records available yet."}){const[i,N]=r.useState(0),d=Math.max(1,Math.ceil(n.length/I)),M=n.length>I,c=r.useMemo(()=>n.slice(i*I,(i+1)*I),[n,i]);return r.useEffect(()=>{i>=d&&N(0)},[i,d,n.length]),e.jsxs(e.Fragment,{children:[e.jsx("style",{children:at}),e.jsxs("section",{className:"lt",children:[e.jsx("div",{className:"lt__header",children:e.jsxs("div",{className:"lt__header-left",children:[e.jsx("h3",{className:"lt__title",children:s}),e.jsxs("span",{className:"lt__count",children:[n.length," ",p]})]})}),n.length===0?e.jsx("div",{className:"lt__empty",children:b}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"lt__wrap",children:e.jsxs("table",{className:"lt__table",children:[e.jsx("thead",{children:e.jsx("tr",{children:a.map(m=>e.jsx("th",{children:m.label},m.key))})}),e.jsx("tbody",{children:c.map(m=>{const v=l?l(m):{},z=[v.className||"",v.onClick?"lt-row--clickable":""].filter(Boolean).join(" ");return e.jsx("tr",{...v,className:z,children:a.map(A=>e.jsx("td",{children:A.render?A.render(m):m[A.key]},A.key))},m.id)})})]})}),M&&e.jsxs("div",{className:"lt__pagination",children:[e.jsxs("span",{className:"lt__page-info",children:["Showing ",i*I+1,"-",Math.min((i+1)*I,n.length)," of ",n.length]}),e.jsxs("div",{className:"lt__page-buttons",children:[e.jsx("button",{type:"button",className:"lt__page-btn",disabled:i===0,onClick:()=>N(m=>m-1),children:"< Prev"}),e.jsx("button",{type:"button",className:"lt__page-btn",disabled:i>=d-1,onClick:()=>N(m=>m+1),children:"Next >"})]})]})]})]})]})}const ye=[{id:"open",description:"Fresh revenue paths"},{id:"assigned",description:"Owned and moving"},{id:"qualified",description:"Validated for close"},{id:"closed_won",description:"Revenue captured"}];function E(s=""){const a=String(s).toLowerCase();return["closed_won","active","approved","qualified"].includes(a)?"status-pill status-pill--success":["route_to_operator","call_scheduled","assigned","contacted"].includes(a)?"status-pill status-pill--info":["closed_lost","inactive"].includes(a)?"status-pill status-pill--danger":["hylio","hylio_sale"].includes(a)?"status-pill status-pill--highlight":"status-pill"}function it(s=""){return s.split(" ").filter(Boolean).slice(0,2).map(a=>{var n;return(n=a[0])==null?void 0:n.toUpperCase()}).join("")}function W(s){return Number(s??0).toLocaleString()}function F(s,a){return a?Object.values(s||{}).flatMap(p=>p&&typeof p=="object"&&!Array.isArray(p)?Object.values(p):[p]).filter(p=>typeof p=="string"||typeof p=="number").join(" ").toLowerCase().includes(a.toLowerCase()):!0}function V(s,a,n="Open"){return e.jsx("button",{type:"button",className:"button button--secondary button--small",onClick:()=>s(a),children:n})}function ot(){var xe;const[s,a]=r.useState([]),[n,p]=r.useState([]),[l,b]=r.useState([]),[i,N]=r.useState([]),[d,M]=r.useState([]),[c,m]=r.useState([]),[v,z]=r.useState([]),[A,J]=r.useState("dashboard"),[$,o]=r.useState("board"),[ke,_]=r.useState(null),[y,we]=r.useState(""),[h,Ne]=r.useState("all"),[C,Ce]=r.useState("all"),[x,Se]=r.useState("all"),[u,Me]=r.useState("all"),[ae,Z]=r.useState(!0),[ee,ie]=r.useState("");r.useEffect(()=>{let t=!0;async function g(){Z(!0),ie("");const[w,R,K,ue,ge,_e,be]=await Promise.all([T.from("crm_accounts").select("*").order("created_at",{ascending:!1}),T.from("crm_contacts").select("*").order("created_at",{ascending:!1}),T.from("crm_leads").select("*").order("created_at",{ascending:!1}),T.from("crm_opportunities").select("*").order("created_at",{ascending:!1}),T.from("crm_acres").select("*").order("created_at",{ascending:!1}),T.from("crm_operators").select("*").order("created_at",{ascending:!1}),T.from("crm_activities").select("*").order("created_at",{ascending:!1}).limit(60)]);if(!t)return;const fe=w.error||R.error||K.error||ue.error||ge.error||_e.error||be.error;if(fe){ie(fe.message||"Unable to load CRM data."),a([]),p([]),b([]),N([]),M([]),m([]),z([]),Z(!1);return}a(w.data??[]),p(R.data??[]),b(K.data??[]),N(ue.data??[]),M(ge.data??[]),m(_e.data??[]),z(be.data??[]),Z(!1)}return g(),()=>{t=!1}},[]);const Ae=r.useMemo(()=>[...new Set([...n.map(t=>t.contact_type).filter(Boolean),...l.map(t=>t.lead_type).filter(Boolean),...l.map(t=>t.route_type).filter(Boolean),...i.map(t=>t.opportunity_type).filter(Boolean),...i.map(t=>t.route_type).filter(Boolean),...c.map(t=>t.operator_type).filter(Boolean)])],[n,l,i,c]),Oe=r.useMemo(()=>[...new Set([...l.map(t=>t.stage).filter(Boolean),...i.map(t=>t.stage).filter(Boolean),...c.map(t=>t.status).filter(Boolean),...v.map(t=>t.stage).filter(Boolean)])],[v,l,i,c]),Le=r.useMemo(()=>[...new Set([...s.map(t=>t.state).filter(Boolean),...n.map(t=>t.state).filter(Boolean),...l.map(t=>t.state).filter(Boolean),...i.map(t=>t.state).filter(Boolean),...d.map(t=>t.state).filter(Boolean),...c.map(t=>t.state).filter(Boolean),...v.map(t=>t.state).filter(Boolean)])],[s,n,l,i,d,c,v]),Be=r.useMemo(()=>[...new Set([...s.map(t=>t.owner).filter(Boolean),...n.map(t=>t.owner).filter(Boolean),...l.map(t=>t.owner).filter(Boolean),...i.map(t=>t.owner).filter(Boolean),...d.map(t=>t.owner).filter(Boolean),...c.map(t=>t.owner).filter(Boolean),...v.map(t=>t.owner).filter(Boolean)])],[s,n,l,i,d,c,v]),G=r.useMemo(()=>s.filter(t=>(h==="all"||t.account_type===h)&&(x==="all"||t.state===x)&&(u==="all"||t.owner===u)&&F(t,y)),[s,u,y,x,h]),te=r.useMemo(()=>n.filter(t=>(h==="all"||t.contact_type===h)&&(x==="all"||t.state===x)&&(u==="all"||t.owner===u)&&F(t,y)),[n,u,y,x,h]),D=r.useMemo(()=>l.filter(t=>(h==="all"||t.lead_type===h||t.route_type===h)&&(C==="all"||t.stage===C)&&(x==="all"||t.state===x)&&(u==="all"||t.owner===u)&&F(t,y)),[l,u,y,C,x,h]),S=r.useMemo(()=>i.filter(t=>(h==="all"||t.opportunity_type===h||t.route_type===h)&&(C==="all"||t.stage===C)&&(x==="all"||t.state===x)&&(u==="all"||t.owner===u)&&F(t,y)),[i,u,y,C,x,h]),H=r.useMemo(()=>d.filter(t=>(h==="all"||t.route_type===h)&&(x==="all"||t.state===x)&&(u==="all"||t.owner===u)&&F(t,y)),[d,u,y,x,h]),q=r.useMemo(()=>c.filter(t=>(h==="all"||t.operator_type===h)&&(C==="all"||t.status===C)&&(x==="all"||t.state===x)&&(u==="all"||t.owner===u)&&F(t,y)),[c,u,y,C,x,h]),U=r.useMemo(()=>v.filter(t=>{var w,R;const g=((w=t.metadata)==null?void 0:w.lead_type)||((R=t.metadata)==null?void 0:R.opportunity_type)||null;return(h==="all"||g===h)&&(C==="all"||t.stage===C)&&(x==="all"||t.state===x)&&(u==="all"||t.owner===u)&&F(t,y)}),[v,u,y,C,x,h]),se=r.useMemo(()=>D.filter(t=>t.lead_type==="grower"),[D]),ce=r.useMemo(()=>D.filter(t=>t.lead_type==="hylio"),[D]),X=r.useMemo(()=>S.filter(t=>t.opportunity_type==="hylio_sale"),[S]),re=r.useMemo(()=>S.filter(t=>t.route_type==="direct_hd"),[S]),ne=r.useMemo(()=>S.filter(t=>t.route_type==="route_to_operator"),[S]),Y=r.useMemo(()=>q.filter(t=>["approved","active","qualified"].includes(t.status)),[q]),f=r.useMemo(()=>({accounts:G.length,contacts:te.length,leads:D.length,opportunities:S.length,pipelineValue:S.reduce((t,g)=>t+Number(g.estimated_value??0),0),acresTracked:H.reduce((t,g)=>t+Number(g.acres??0),0),activeOperators:Y.length,directOpportunities:re.length,routedOpportunities:ne.length,hylioPipeline:X.reduce((t,g)=>t+Number(g.estimated_value??0),0)}),[Y.length,re.length,G.length,te.length,D.length,S,H,X,ne.length]),Re=[{label:"Live demand engine",value:j(f.leads),detail:"Grower, operator, Hylio, and dealer demand entering one shared system."},{label:"Pipeline value",value:L(f.pipelineValue),detail:"Opportunity value visible across direct, routed, and high-ticket revenue streams."},{label:"Acres captured",value:j(f.acresTracked),detail:"Tracked acreage already feeding routing, operator assignment, and expansion logic."},{label:"Active operators",value:j(f.activeOperators),detail:"Qualified, approved, or active operator coverage available for routed demand."}],B={dashboard:f.leads+f.opportunities,leads:D.length,opportunities:S.length,operators:q.length,growers:se.length,hylio:ce.length,activities:U.length,accounts:G.length,acres:H.length},le=[{id:"dashboard",label:"Dashboard",description:"Executive operating view",count:B.dashboard},{id:"leads",label:"Leads",description:"Demand intake and qualification",count:B.leads},{id:"opportunities",label:"Opportunities",description:"Revenue paths and stages",count:B.opportunities},{id:"operators",label:"Operators",description:"Capacity and territory coverage",count:B.operators},{id:"growers",label:"Growers",description:"Direct service and acreage demand",count:B.growers},{id:"hylio",label:"Hylio",description:"High-ticket drone pipeline",count:B.hylio},{id:"activities",label:"Activities",description:"Calls, tasks, emails, texts",count:B.activities},{id:"accounts",label:"Accounts",description:"Contacts and account records",count:B.accounts},{id:"acres",label:"Acres",description:"Territory and assignment visibility",count:B.acres}],oe=[{key:"lead_type",label:"Lead",render:t=>e.jsxs("div",{className:"crm-table-primary",children:[e.jsx("strong",{children:k(t.lead_type)}),e.jsx("span",{children:t.source||"Website funnel"})]})},{key:"stage",label:"Stage",render:t=>e.jsx("span",{className:E(t.stage),children:O(t.stage)})},{key:"route_type",label:"Route",render:t=>e.jsx("span",{className:E(t.route_type),children:k(t.route_type)})},{key:"state",label:"State"},{key:"acres",label:"Acres",render:t=>W(t.acres)},{key:"owner",label:"Owner",render:t=>t.owner||"Harvest Drone"},{key:"actions",label:"Actions",render:t=>V(_,t)}],de=[{key:"opportunity_type",label:"Opportunity",render:t=>e.jsxs("div",{className:"crm-table-primary",children:[e.jsx("strong",{children:k(t.opportunity_type)}),e.jsxs("span",{children:[t.revenue_stream||"Revenue path"," - ",k(t.route_type)]})]})},{key:"stage",label:"Stage",render:t=>e.jsx("span",{className:E(t.stage),children:O(t.stage)})},{key:"state",label:"State"},{key:"estimated_value",label:"Value",render:t=>L(t.estimated_value)},{key:"owner",label:"Owner",render:t=>t.owner||"Harvest Drone"},{key:"actions",label:"Actions",render:t=>V(_,t)}],ze=[{key:"full_name",label:"Contact",render:t=>e.jsxs("div",{className:"crm-table-primary",children:[e.jsx("strong",{children:t.full_name}),e.jsx("span",{children:t.email||t.mobile||"-"})]})},{key:"contact_type",label:"Type",render:t=>e.jsx("span",{className:E(t.contact_type),children:k(t.contact_type)})},{key:"state",label:"State"},{key:"owner",label:"Owner",render:t=>t.owner||"Harvest Drone"},{key:"actions",label:"Actions",render:t=>V(_,t)}],De=[{key:"operator_type",label:"Operator",render:t=>e.jsxs("div",{className:"crm-table-primary",children:[e.jsx("strong",{children:k(t.operator_type)}),e.jsx("span",{children:t.counties_served||"County coverage not set"})]})},{key:"status",label:"Status",render:t=>e.jsx("span",{className:E(t.status),children:O(t.status)})},{key:"state",label:"State"},{key:"acreage_capacity",label:"Capacity",render:t=>W(t.acreage_capacity)},{key:"actions",label:"Actions",render:t=>V(_,t)}],Ee=[{key:"acres",label:"Acres",render:t=>W(t.acres)},{key:"crop_type",label:"Crop",render:t=>t.crop_type||"-"},{key:"state",label:"State"},{key:"county",label:"County"},{key:"route_type",label:"Route",render:t=>e.jsx("span",{className:E(t.route_type),children:k(t.route_type)})},{key:"actions",label:"Actions",render:t=>V(_,t)}],pe=U.slice(0,12),he=G.slice(0,6),me=r.useMemo(()=>{const t=new Map;return H.forEach(g=>{const w=g.state||"Unknown";t.set(w,(t.get(w)||0)+Number(g.acres??0))}),[...t.entries()].map(([g,w])=>({state:g,acres:w})).sort((g,w)=>w.acres-g.acres).slice(0,6)},[H]);function He(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsxs("section",{className:"crm-hero card",children:[e.jsxs("div",{className:"crm-hero__copy",children:[e.jsx("span",{className:"crm-hero__eyebrow",children:"Dashboard"}),e.jsx("h1",{children:"One clean operating view for demand, routing, operators, and revenue."}),e.jsx("p",{children:"This is the working command center for Harvest Drone: direct grower demand, routed acreage, Hylio pipeline, operator capacity, and revenue-bearing opportunities in one place."})]}),e.jsx("div",{className:"crm-hero__rail",children:Re.map(t=>e.jsxs("article",{className:"crm-kpi-card crm-kpi-card--hero",children:[e.jsx("span",{children:t.label}),e.jsx("strong",{children:t.value}),e.jsx("p",{children:t.detail})]},t.label))})]}),e.jsxs("section",{className:"crm-kpi-grid",children:[e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Leads"}),e.jsx("strong",{children:j(f.leads)}),e.jsx("p",{children:"Total demand currently visible after filters."})]}),e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Direct opportunities"}),e.jsx("strong",{children:j(f.directOpportunities)}),e.jsx("p",{children:"Revenue paths staying with Harvest Drone."})]}),e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Routed opportunities"}),e.jsx("strong",{children:j(f.routedOpportunities)}),e.jsx("p",{children:"Opportunities better matched to operator coverage."})]}),e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Hylio pipeline"}),e.jsx("strong",{children:L(f.hylioPipeline)}),e.jsx("p",{children:"High-ticket pipeline modeled inside the same CRM."})]})]}),e.jsxs("section",{className:"crm-dashboard-grid",children:[e.jsxs("article",{className:"crm-card card",children:[e.jsx("div",{className:"crm-card__header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-card__eyebrow",children:"Pipeline summary"}),e.jsx("h3",{children:"Revenue mix by path"})]})}),e.jsxs("div",{className:"crm-summary-list",children:[e.jsxs("div",{className:"crm-summary-list__item",children:[e.jsx("strong",{children:j(f.directOpportunities)}),e.jsx("span",{children:"Direct opportunities"})]}),e.jsxs("div",{className:"crm-summary-list__item",children:[e.jsx("strong",{children:j(f.routedOpportunities)}),e.jsx("span",{children:"Routed opportunities"})]}),e.jsxs("div",{className:"crm-summary-list__item",children:[e.jsx("strong",{children:j(f.activeOperators)}),e.jsx("span",{children:"Active operator coverage"})]}),e.jsxs("div",{className:"crm-summary-list__item",children:[e.jsx("strong",{children:j(f.acresTracked)}),e.jsx("span",{children:"Tracked acres"})]})]})]}),e.jsxs("article",{className:"crm-card card",children:[e.jsx("div",{className:"crm-card__header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-card__eyebrow",children:"Recent activity"}),e.jsx("h3",{children:"What the team is touching now"})]})}),e.jsx("div",{className:"crm-timeline-list",children:pe.length===0?e.jsx("div",{className:"crm-empty-card",children:"Activity will appear here as the CRM starts moving live records."}):pe.map(t=>e.jsxs("button",{type:"button",className:"crm-timeline-card",onClick:()=>_(t),children:[e.jsxs("div",{children:[e.jsx("strong",{children:t.subject||t.activity_type}),e.jsx("p",{children:t.outcome||"Sales and routing activity logged in the CRM."})]}),e.jsx("span",{children:Q(t.created_at)})]},t.id))})]}),e.jsxs("article",{className:"crm-card card",children:[e.jsx("div",{className:"crm-card__header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-card__eyebrow",children:"Opportunity flow"}),e.jsx("h3",{children:"Pipeline by stage"})]})}),e.jsx("div",{className:"crm-stage-summary",children:ye.map(t=>{const g=S.filter(R=>R.stage===t.id),w=g.reduce((R,K)=>R+Number(K.estimated_value??0),0);return e.jsxs("div",{className:"crm-stage-summary__item",children:[e.jsx("span",{children:O(t.id)}),e.jsx("strong",{children:g.length}),e.jsx("p",{children:L(w)})]},t.id)})})]}),e.jsxs("article",{className:"crm-card card",children:[e.jsx("div",{className:"crm-card__header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-card__eyebrow",children:"Operator availability"}),e.jsx("h3",{children:"Coverage that can close routed demand"})]})}),e.jsx("div",{className:"crm-mini-list",children:Y.length===0?e.jsx("div",{className:"crm-empty-card",children:"Approved and active operators will appear here as coverage grows."}):Y.slice(0,6).map(t=>e.jsxs("button",{type:"button",className:"crm-mini-list__item",onClick:()=>_(t),children:[e.jsxs("div",{children:[e.jsx("strong",{children:t.state||"Open territory"}),e.jsx("p",{children:t.counties_served||"County coverage pending"})]}),e.jsx("span",{children:W(t.acreage_capacity)})]},t.id))})]})]})]})}function Te(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsx("section",{className:"crm-section-header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Leads"}),e.jsx("h2",{children:"Demand intake and routing qualification"}),e.jsx("p",{children:"Every lead source in one place, with cleaner stages, route visibility, and faster inspection."})]})}),e.jsx(P,{title:"Leads pipeline",columns:oe,rows:D,countLabel:"leads",emptyMessage:"No leads match the current filters.",getRowProps:t=>({className:"table-row table-row--clickable",onClick:()=>_(t)})})]})}function Pe(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsxs("section",{className:"crm-section-header crm-section-header--split",children:[e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Opportunities"}),e.jsx("h2",{children:"Pipeline built for revenue movement"}),e.jsx("p",{children:"Switch between a board view for stage scanning and a table view for detailed pipeline management."})]}),e.jsxs("div",{className:"crm-toggle-group",children:[e.jsx("button",{type:"button",className:`crm-toggle${$==="board"?" is-active":""}`,onClick:()=>o("board"),children:"Board"}),e.jsx("button",{type:"button",className:`crm-toggle${$==="table"?" is-active":""}`,onClick:()=>o("table"),children:"Table"})]})]}),$==="board"?e.jsx(tt,{columns:ye,rows:S,onSelect:_}):e.jsx(P,{title:"Opportunities table",columns:de,rows:S,countLabel:"opportunities",emptyMessage:"No opportunities match the current filters.",getRowProps:t=>({className:"table-row table-row--clickable",onClick:()=>_(t)})})]})}function Fe(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsx("section",{className:"crm-section-header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Accounts and contacts"}),e.jsx("h2",{children:"Clean records for people and entities"}),e.jsx("p",{children:"Accounts give the business context. Contacts give the operator, grower, or buyer relationship context."})]})}),e.jsxs("section",{className:"crm-dashboard-grid",children:[e.jsxs("article",{className:"crm-card card",children:[e.jsx("div",{className:"crm-card__header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-card__eyebrow",children:"Accounts"}),e.jsx("h3",{children:"Entity records"})]})}),e.jsx("div",{className:"crm-record-grid",children:he.length===0?e.jsx("div",{className:"crm-empty-card",children:"Accounts will appear here as lead intake syncs into CRM."}):he.map(t=>e.jsxs("button",{type:"button",className:"crm-record-card",onClick:()=>_(t),children:[e.jsx("div",{className:"crm-record-card__avatar",children:it(t.name)}),e.jsxs("div",{children:[e.jsx("strong",{children:t.name}),e.jsxs("p",{children:[k(t.account_type)," - ",t.state||"No state"]})]})]},t.id))})]}),e.jsx(P,{title:"Contacts",columns:ze,rows:te,countLabel:"contacts",emptyMessage:"No contacts match the current filters.",getRowProps:t=>({className:"table-row table-row--clickable",onClick:()=>_(t)})})]})]})}function qe(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsx("section",{className:"crm-section-header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Activities"}),e.jsx("h2",{children:"Timeline of calls, emails, tasks, and sales movement"}),e.jsx("p",{children:"A cleaner activity feed makes it obvious what happened, who owns it, and what needs follow-up."})]})}),e.jsx("section",{className:"crm-activity-timeline card",children:U.length===0?e.jsx("div",{className:"crm-empty-card",children:"No activities match the current filters."}):U.map(t=>e.jsxs("button",{type:"button",className:"crm-activity-item",onClick:()=>_(t),children:[e.jsx("div",{className:"crm-activity-item__rail"}),e.jsxs("div",{className:"crm-activity-item__copy",children:[e.jsxs("div",{className:"crm-activity-item__top",children:[e.jsx("strong",{children:t.subject||t.activity_type}),e.jsx("span",{className:E(t.stage),children:O(t.stage)})]}),e.jsx("p",{children:t.outcome||"Activity logged in CRM."}),e.jsxs("small",{children:[t.owner||"Harvest Drone"," - ",t.state||"No state"," - ",Q(t.created_at)]})]})]},t.id))})]})}function Ie(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsx("section",{className:"crm-section-header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Operators"}),e.jsx("h2",{children:"Coverage, counties, and capacity in one view"}),e.jsx("p",{children:"See who can fulfill routed demand, where they serve, and how much acreage they can support."})]})}),e.jsxs("section",{className:"crm-dashboard-grid",children:[e.jsxs("article",{className:"crm-card card",children:[e.jsx("div",{className:"crm-card__header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-card__eyebrow",children:"Operator cards"}),e.jsx("h3",{children:"Fast visual scan"})]})}),e.jsx("div",{className:"crm-record-grid",children:q.length===0?e.jsx("div",{className:"crm-empty-card",children:"Operators will appear here as operator and Hylio leads are qualified."}):q.slice(0,8).map(t=>e.jsxs("button",{type:"button",className:"crm-operator-card",onClick:()=>_(t),children:[e.jsxs("div",{className:"crm-operator-card__top",children:[e.jsx("strong",{children:t.state||"Open territory"}),e.jsx("span",{className:E(t.status),children:O(t.status)})]}),e.jsx("p",{children:t.counties_served||"Coverage still being defined."}),e.jsxs("div",{className:"crm-operator-card__meta",children:[e.jsx("span",{children:k(t.operator_type)}),e.jsxs("span",{children:[W(t.acreage_capacity)," acres"]})]})]},t.id))})]}),e.jsx(P,{title:"Operator table",columns:De,rows:q,countLabel:"operators",emptyMessage:"No operators match the current filters.",getRowProps:t=>({className:"table-row table-row--clickable",onClick:()=>_(t)})})]})]})}function We(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsx("section",{className:"crm-section-header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Growers"}),e.jsx("h2",{children:"Direct grower demand and acreage opportunity"}),e.jsx("p",{children:"Keep retail revenue visible while still seeing which accounts are better served through routed coverage."})]})}),e.jsxs("section",{className:"crm-kpi-grid crm-kpi-grid--mini",children:[e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Grower leads"}),e.jsx("strong",{children:j(se.length)}),e.jsx("p",{children:"Retail demand currently inside the system."})]}),e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Direct pipeline"}),e.jsx("strong",{children:j(re.filter(t=>t.opportunity_type==="grower_direct").length)}),e.jsx("p",{children:"Grower opportunities staying direct with Harvest Drone."})]}),e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Tracked acres"}),e.jsx("strong",{children:j(H.reduce((t,g)=>t+Number(g.acres??0),0))}),e.jsx("p",{children:"Acreage now visible in the CRM."})]})]}),e.jsx(P,{title:"Grower leads",columns:oe,rows:se,countLabel:"grower leads",emptyMessage:"No grower leads match the current filters.",getRowProps:t=>({className:"table-row table-row--clickable",onClick:()=>_(t)})})]})}function $e(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsx("section",{className:"crm-section-header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Hylio"}),e.jsx("h2",{children:"High-ticket pipeline with qualification context"}),e.jsx("p",{children:"Budget, experience level, and area qualification stay visible so the sales motion feels closer to a real deal desk."})]})}),e.jsxs("section",{className:"crm-kpi-grid crm-kpi-grid--mini",children:[e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Hylio leads"}),e.jsx("strong",{children:j(ce.length)}),e.jsx("p",{children:"High-ticket leads now in active review."})]}),e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Hylio pipeline"}),e.jsx("strong",{children:L(f.hylioPipeline)}),e.jsx("p",{children:"Modeled value currently inside the sales funnel."})]}),e.jsxs("article",{className:"crm-kpi-card card",children:[e.jsx("span",{children:"Area-qualified deals"}),e.jsx("strong",{children:j(X.filter(t=>t.hylio_area_qualified).length)}),e.jsx("p",{children:"Opportunities already marked as area-qualified."})]})]}),e.jsx(P,{title:"Hylio opportunities",columns:de,rows:X,countLabel:"Hylio opportunities",emptyMessage:"No Hylio opportunities match the current filters.",getRowProps:t=>({className:"table-row table-row--clickable",onClick:()=>_(t)})})]})}function Ve(){return e.jsxs("div",{className:"crm-view-stack",children:[e.jsx("section",{className:"crm-section-header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-section-header__eyebrow",children:"Acres"}),e.jsx("h2",{children:"Territory visibility for routing and operator fit"}),e.jsx("p",{children:"Track acreage totals, route mix, and where the next assignment opportunities are accumulating."})]})}),e.jsxs("section",{className:"crm-dashboard-grid",children:[e.jsxs("article",{className:"crm-card card",children:[e.jsx("div",{className:"crm-card__header",children:e.jsxs("div",{children:[e.jsx("span",{className:"crm-card__eyebrow",children:"State concentration"}),e.jsx("h3",{children:"Top acreage states"})]})}),e.jsx("div",{className:"crm-mini-list",children:me.length===0?e.jsx("div",{className:"crm-empty-card",children:"Acre concentration will appear here as territory data grows."}):me.map(t=>e.jsxs("div",{className:"crm-mini-list__item crm-mini-list__item--static",children:[e.jsxs("div",{children:[e.jsx("strong",{children:t.state}),e.jsx("p",{children:"Tracked acreage in CRM"})]}),e.jsx("span",{children:W(t.acres)})]},t.state))})]}),e.jsx(P,{title:"Acre records",columns:Ee,rows:H,countLabel:"acre records",emptyMessage:"No acre records match the current filters.",getRowProps:t=>({className:"table-row table-row--clickable",onClick:()=>_(t)})})]})]})}function Ge(){switch(A){case"leads":return Te();case"opportunities":return Pe();case"operators":return Ie();case"growers":return We();case"hylio":return $e();case"activities":return qe();case"accounts":return Fe();case"acres":return Ve();case"dashboard":default:return He()}}return e.jsxs(Ue,{compact:!0,children:[e.jsxs("div",{className:"crm-workspace",children:[e.jsx(rt,{sections:le,activeSection:A,onSelect:J}),e.jsxs("div",{className:"crm-main",children:[e.jsxs("header",{className:"crm-topbar card",children:[e.jsxs("div",{children:[e.jsx("span",{className:"crm-topbar__eyebrow",children:"Operating workspace"}),e.jsx("h2",{children:((xe=le.find(t=>t.id===A))==null?void 0:xe.label)||"CRM"}),e.jsx("p",{children:"Designed to manage growers, operators, Hylio sales, accounts, acres, and the revenue routes between them."})]}),e.jsxs("div",{className:"crm-topbar__meta",children:[e.jsxs("div",{className:"crm-topbar__meta-item",children:[e.jsx("span",{children:"Pipeline"}),e.jsx("strong",{children:L(f.pipelineValue)})]}),e.jsxs("div",{className:"crm-topbar__meta-item",children:[e.jsx("span",{children:"Acres"}),e.jsx("strong",{children:j(f.acresTracked)})]})]})]}),e.jsx(Je,{searchQuery:y,typeFilter:h,stageFilter:C,stateFilter:x,ownerFilter:u,typeOptions:Ae,stageOptions:Oe,stateOptions:Le,ownerOptions:Be,onSearchChange:we,onTypeChange:Ne,onStageChange:Ce,onStateChange:Se,onOwnerChange:Me}),ae?e.jsx("section",{className:"card crm-loading-state",children:"Loading CRM data..."}):null,ee?e.jsxs("section",{className:"card crm-loading-state",children:["Supabase error: ",ee]}):null,!ae&&!ee?Ge():null]})]}),e.jsx(Ke,{record:ke,onClose:()=>_(null)})]})}export{ot as default};
