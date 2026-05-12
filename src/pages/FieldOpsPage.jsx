import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import FieldMapPreview from "../components/FieldMapPreview";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import {
  addFieldOpsJobNote,
  createFieldOpsJob,
  createFieldOpsRecord,
  createOpsJobFromLead,
  loadFieldOpsState,
  resetLocalFieldOpsState,
  updateFieldOpsChecklist,
  updateFieldOpsJob,
  updateFieldOpsJobberReference,
} from "../lib/fieldOpsApi";
import { getDailyOpsBrief, sendDailyOpsBriefToSlack } from "../lib/dailyOpsApi";
import { usePageMeta } from "../lib/pageMeta";
import {
  DEFAULT_CHECKLIST_TEMPLATES,
  FIELD_OPS_BOARD_COLUMNS,
  FIELD_OPS_FLEET_STATUSES,
  FIELD_OPS_JOB_STATUSES,
  FIELD_OPS_PRIORITIES,
  canDispatchFieldOps,
  enrichOpsJob,
  filterOpsJobs,
  formatFieldOpsPriority,
  formatFleetStatus,
  formatFieldOpsStatus,
  getClientRollup,
  getDailyOpsCommandCenter,
  getFieldOpsRole,
  getFleetTrackingSummary,
  getJobDispatchPacket,
  getJobReadiness,
  getOpsDashboardSummary,
  getRelevantSops,
  toggleChecklistItem,
} from "../../shared/fieldOps";
import { formatDateTime } from "../lib/crm";
import { getHarvestAdminData, downloadHarvestLeadsCsv } from "../lib/harvestApi";
import { formatCrops, formatDateLabel } from "../../shared/harvestLeadEngine";
import { buildRevenueCommandCenter } from "../../shared/revenueOps";
import "../styles/field-ops.css";

const EMPTY_FILTERS = {
  search: "",
  status: "all",
  operatorId: "all",
  serviceType: "all",
  cropType: "all",
  clientId: "all",
  invoiceNeeded: "all",
  sourceInterest: "all",
  dateFrom: "",
  dateTo: "",
};

const BILLING_OPEN_STATUSES = ["completed", "needs_review", "invoice_needed"];

const blankJobForm = {
  client_id: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  farm_id: "",
  farm_name: "",
  field_id: "",
  field_name: "",
  acres: "",
  crop_type: "",
  service_type: "Drone Application",
  application_product: "",
  source_interest: false,
  requested_date: "",
  scheduled_start: "",
  assigned_operator_id: "",
  priority: "normal",
  staging_area: "",
  access_notes: "",
  weather_window: "",
  wind_limit_mph: "",
  application_rate: "",
  spray_volume_gpa: "",
  water_source: "",
  quoted_rate_per_acre: "",
  customer_po: "",
  customer_preference: "",
  payment_terms: "",
  notes: "",
};

const blankClientForm = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  zip: "",
  source: "",
  jobber_client_id: "",
  notes: "",
};

const blankFarmFieldForm = {
  client_id: "",
  farm_name: "",
  address_line_1: "",
  city: "",
  state: "",
  zip: "",
  latitude: "",
  longitude: "",
  field_name: "",
  crop_type: "",
  acres: "",
  boundary_geojson: "",
  notes: "",
};

const SALES_FUNNELS = [
  {
    title: "SOURCE acre review",
    path: "/source-acre-review",
    audience: "Growers",
    purpose: "Qualify acres, crop, timing, location, and SOURCE interest.",
    handoff: "Review in New Requests, then create the ops job when acreage and timing are real.",
  },
  {
    title: "Grower services",
    path: "/growers",
    audience: "Farm customers",
    purpose: "Explain drone application, scouting, spot treatment, and field services.",
    handoff: "Use for direct grower conversations and convert serious inquiries into clients.",
  },
  {
    title: "Operator recruiting",
    path: "/operators",
    audience: "Drone operators",
    purpose: "Capture operator interest, service regions, and qualification fit.",
    handoff: "Turn qualified operators into operator profiles and assign training.",
  },
  {
    title: "Dealer signup",
    path: "/join",
    audience: "Dealer partners",
    purpose: "Start dealer onboarding and network expansion conversations.",
    handoff: "Route good partners into follow-up and local demand planning.",
  },
  {
    title: "Hylio equipment",
    path: "/hylio",
    audience: "Equipment buyers",
    purpose: "Support Hylio research, purchase intent, and enterprise equipment conversations.",
    handoff: "Use for equipment leads that may become training, setup, or field ops work.",
  },
  {
    title: "ROI calculator",
    path: "/roi-calculator",
    audience: "Growers and partners",
    purpose: "Help estimate economics before a SOURCE or application conversation.",
    handoff: "Attach the discussion to the grower record or lead notes.",
  },
];

const OPS_GUIDE_WORKFLOWS = [
  {
    title: "Lead to field ops job",
    audience: "Sales and ops",
    duration: "4 min",
    videoStatus: "Video ready",
    videoUrl: "/training-videos/ops/generated/ops-01-lead-to-job.webm",
    path: "/ops/leads",
    steps: [
      "Open New Requests and review contact, farm, acres, crop, timing, and SOURCE interest.",
      "Use Create Ops Job only when the request has real acreage and a next field step.",
      "Confirm or clean up the client, farm, field, service, and notes on the new job.",
      "Leave the job unscheduled if timing or product details are not ready yet.",
    ],
  },
  {
    title: "Create a job from a phone call",
    audience: "Dispatcher",
    duration: "5 min",
    videoStatus: "Video ready",
    videoUrl: "/training-videos/ops/generated/ops-02-new-job-from-call.webm",
    path: "/ops/jobs/new",
    steps: [
      "Start with the grower and contact details.",
      "Add the farm, field, acres, crop, service, product notes, and requested timing.",
      "Add staging, access, weather, water, and quote/handoff details if known.",
      "Create the job, then finish scheduling or assignment from the job detail page.",
    ],
  },
  {
    title: "Schedule and assign work",
    audience: "Ops manager",
    duration: "4 min",
    videoStatus: "Video ready",
    videoUrl: "/training-videos/ops/generated/ops-03-schedule-and-assign.webm",
    path: "/ops/schedule",
    steps: [
      "Open Schedule and review Today, This Week, and Unscheduled.",
      "Pick a start time, assign an operator, and move the status to scheduled or operator assigned.",
      "Use readiness warnings to catch missing fields, product, contact info, or weather issues.",
      "Check the loadout and weather cards before confirming the day.",
    ],
  },
  {
    title: "Check maps before dispatch",
    audience: "Dispatcher and operator",
    duration: "3 min",
    videoStatus: "Video placeholder",
    path: "/ops/maps",
    steps: [
      "Open Maps and review active jobs with missing coordinates or field boundaries.",
      "Confirm staging, gate, tender, hazards, and no-spray buffers before dispatch.",
      "Use Open map or Directions for truck routing, then copy the map packet into field notes when needed.",
      "Add boundary GeoJSON on the farm/field record when a grower or operator provides it.",
    ],
  },
  {
    title: "Track drone locations",
    audience: "Dispatcher and operator",
    duration: "3 min",
    videoStatus: "Video placeholder",
    path: "/ops/fleet-map",
    steps: [
      "Open Fleet Map to see each drone's last known status and check-in time.",
      "Call operators from the fleet board when a drone is stale or not linked to a job.",
      "Operators update In transit, On site, Flying, and Drone done from their job detail page.",
      "Use Field Maps for boundaries and staging; use Fleet Map for where the equipment is right now.",
    ],
  },
  {
    title: "Run a job in the field",
    audience: "Operator",
    duration: "5 min",
    videoStatus: "Video ready",
    videoUrl: "/training-videos/ops/generated/ops-04-operator-field-work.webm",
    path: "/operator/jobs",
    steps: [
      "Open My Jobs and choose today's assigned job.",
      "Review grower contact, field, staging, access, product, weather, and loadout.",
      "Complete the checklist items before launch.",
      "Update status as work starts and mark complete after completion notes are captured.",
    ],
  },
  {
    title: "Close out billing handoff",
    audience: "Admin",
    duration: "3 min",
    videoStatus: "Video ready",
    videoUrl: "/training-videos/ops/generated/ops-05-billing-handoff.webm",
    path: "/ops/billing",
    steps: [
      "Open Billing and review completed or invoice-needed work.",
      "Confirm estimated service total, acres, Jobber reference, and missing handoff details.",
      "Use Flag invoice when completed work needs external billing.",
      "Close the job after Jobber or QuickBooks handoff is done.",
    ],
  },
  {
    title: "Use the Daily Ops Agent",
    audience: "Admin",
    duration: "3 min",
    videoStatus: "Video ready",
    videoUrl: "/training-videos/ops/generated/ops-06-daily-agent.webm",
    path: "/ops/daily-agent",
    steps: [
      "Open the Daily Ops Agent during the morning review.",
      "Scan priority items, recommended moves, Jobber loops, email follow-ups, and SMS replies.",
      "Use Open loops for follow-up tracking.",
      "Regenerate the brief after integrations or open loops change.",
    ],
  },
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Unscheduled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFleetAge(value) {
  if (!value) return "No check-in yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No check-in yet";
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${Math.round(diffHours / 24)} days ago`;
}

function buildGoogleMapsPointUrl(latitude, longitude) {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function toInputDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function fromInputDateTime(value) {
  return value ? new Date(value).toISOString() : null;
}

function parseBoundaryGeoJsonInput(value) {
  if (!String(value || "").trim()) return null;
  try {
    const parsed = JSON.parse(value);
    const type = parsed?.type;
    const isBoundary =
      type === "Feature" ||
      type === "FeatureCollection" ||
      type === "Polygon" ||
      type === "MultiPolygon";
    if (!isBoundary) {
      throw new Error("Boundary must be GeoJSON Feature, FeatureCollection, Polygon, or MultiPolygon.");
    }
    return parsed;
  } catch (error) {
    throw new Error(error.message || "Boundary GeoJSON is not valid JSON.");
  }
}

function uniqueOptions(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function getJobMetadataObject(job = {}) {
  const value = job.metadata_json || job.metadata || {};
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_error) {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value : {};
}

function getServiceForJob(job = {}, state = {}) {
  return (state.services || []).find((service) => service.name === job.service_type);
}

function getJobEstimate(job = {}, state = {}) {
  const metadata = getJobMetadataObject(job);
  const lineItems = Array.isArray(metadata.service_line_items) ? metadata.service_line_items : [];
  const service = getServiceForJob(job, state);
  const rate = metadata.quoted_rate_per_acre ?? metadata.rate_per_acre ?? service?.default_rate_per_acre ?? null;
  const acres = Number(job.acres || 0);
  const subtotal = lineItems.length
    ? lineItems.reduce((sum, item) => sum + Number(item.amount || item.total || 0), 0)
    : rate && acres ? rate * acres : null;
  return {
    rate,
    subtotal,
    lineItems,
    quoteStatus: metadata.quote_status || (job.status === "quoted" ? "Quoted" : rate ? "Estimate" : "Manual quote"),
    invoiceStatus: metadata.invoice_status || (job.invoice_needed || job.status === "invoice_needed" ? "Ready for external invoice" : "Not flagged"),
    billingContact: metadata.billing_contact || job.client?.name || job.client_name || "",
    customerPo: metadata.customer_po || "",
    paymentTerms: metadata.payment_terms || "External billing in Jobber or QuickBooks",
  };
}

function getJobProgress(job = {}) {
  const order = [
    "new_request",
    "qualified",
    "quoted",
    "scheduled",
    "operator_assigned",
    "pre_flight",
    "in_progress",
    "completed",
    "invoice_needed",
    "closed",
  ];
  const activeIndex = Math.max(0, order.indexOf(job.status));
  return Math.round((activeIndex / (order.length - 1)) * 100);
}

function getChecklistProgress(jobId, state = {}, checklistType = null) {
  const checklists = (state.jobChecklists || []).filter((checklist) =>
    checklist.job_id === jobId && (!checklistType || checklist.checklist_type === checklistType),
  );
  const items = checklists.flatMap((checklist) => checklist.items_json || []);
  if (!items.length) {
    return { completed: 0, total: 0, percent: 0 };
  }
  const completed = items.filter((item) => item.completed).length;
  return {
    completed,
    total: items.length,
    percent: Math.round((completed / items.length) * 100),
  };
}

function copyText(value) {
  navigator.clipboard?.writeText(value);
}

function buildDispatchSummary(job = {}, state = {}) {
  const packet = getJobDispatchPacket(job, state);
  return [
    `Dispatch: ${job.title}`,
    `Grower: ${packet.client.name} | ${packet.client.phone || packet.client.email || "contact missing"}`,
    `Field: ${packet.farm.name} / ${packet.field.name}`,
    `Acres/Crop: ${formatNumber(packet.field.acres)} acres / ${packet.field.crop || "crop TBD"}`,
    `Service: ${packet.operation.service}`,
    `Product: ${packet.operation.product || "product TBD"}`,
    `Schedule: ${formatDate(packet.timing.scheduledStart)}`,
    `Operator: ${packet.operator.name}`,
    `Staging: ${packet.flightPlan.stagingArea}`,
    `Access: ${packet.flightPlan.accessNotes}`,
    `Weather: ${packet.flightPlan.weatherWindow}`,
    `Loadout: ${packet.loadout.join(", ") || "not documented"}`,
  ].join("\n");
}

function buildEtaMessage(job = {}) {
  return [
    `Harvest Drone update for ${job.title}:`,
    `We have this ${job.service_type || "field service"} scheduled for ${formatDate(job.scheduled_start)}.`,
    `Operator: ${job.operator_name || "to be assigned"}.`,
    "Please reply with any gate, access, product, or weather-window changes before arrival.",
  ].join(" ");
}

function buildCompletionReport(job = {}, state = {}) {
  const packet = getJobDispatchPacket(job, state);
  const completionProgress = getChecklistProgress(job.id, state, "completion");
  return [
    `Completion report: ${job.title}`,
    `Grower: ${packet.client.name}`,
    `Farm/Field: ${packet.farm.name} / ${packet.field.name}`,
    `Service: ${packet.operation.service}`,
    `Acres: ${formatNumber(packet.field.acres)}`,
    `Crop: ${packet.field.crop || "Crop TBD"}`,
    `Product: ${packet.operation.product || "Not documented"}`,
    `Rate/volume: ${[packet.operation.applicationRate, packet.operation.sprayVolumeGpa ? `${packet.operation.sprayVolumeGpa} GPA` : ""].filter(Boolean).join(" | ") || "Not documented"}`,
    `Operator: ${packet.operator.name}`,
    `Scheduled: ${formatDate(packet.timing.scheduledStart)}`,
    `Completion checklist: ${completionProgress.completed}/${completionProgress.total}`,
    `Notes: ${job.notes || "No customer notes captured."}`,
  ].join("\n");
}

function getChecklistTitle(type) {
  const labels = {
    pre_flight: "Pre-flight checklist",
    product: "Chemical/product checklist",
    weather: "Weather check",
    completion: "Completion checklist",
  };
  return labels[type] || type;
}

function StatusBadge({ status }) {
  return <span className={`ops-status ops-status--${status}`}>{formatFieldOpsStatus(status)}</span>;
}

function FleetStatusBadge({ status }) {
  return <span className={`ops-fleet-status ops-fleet-status--${status || "offline"}`}>{formatFleetStatus(status)}</span>;
}

function PriorityBadge({ priority }) {
  return <span className={`ops-priority-badge ops-priority-badge--${priority || "normal"}`}>{formatFieldOpsPriority(priority)}</span>;
}

function ReadinessBadge({ readiness }) {
  return (
    <span className={`ops-readiness ops-readiness--${readiness.status}`}>
      {readiness.status === "ready" ? "Ready" : readiness.status.replaceAll("_", " ")} - {readiness.score}
    </span>
  );
}

function ReadinessPanel({ readiness }) {
  const items = [...readiness.blockers, ...readiness.warnings];
  return (
    <div className="ops-readiness-panel">
      <div className="ops-readiness-panel__top ops-next-step">
        <ReadinessBadge readiness={readiness} />
        <div>
          <span>Next step</span>
          <strong>{readiness.nextAction.label}</strong>
        </div>
      </div>
      {items.length ? (
        <div className="ops-list">
          {items.map((item) => (
            <div className={`ops-row ops-row--${item.severity}`} key={`${item.action}-${item.label}`}>
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="ops-muted">Core dispatch details are present.</p>}
    </div>
  );
}

function getActionPath(action) {
  if (!action?.jobId) return "/ops/jobs";
  if (["schedule_job", "assign_operator", "complete_preflight", "capture_completion", "flag_invoice", "add_boundary"].includes(action.action)) {
    return `/ops/jobs/${action.jobId}`;
  }
  return `/ops/jobs/${action.jobId}`;
}

function ActionRow({ action, primary = false }) {
  return (
    <Link className={`ops-attention-row ${primary ? "ops-attention-row--primary" : ""} ops-row--${action.severity}`} to={getActionPath(action)}>
      <div>
        <span>{action.priority ? formatFieldOpsPriority(action.priority) : "Action"}</span>
        <strong>{action.label}</strong>
        <p>{action.jobTitle} | {action.clientName || "Client TBD"}{action.detail ? ` | ${action.detail}` : ""}</p>
      </div>
      <small>Open</small>
    </Link>
  );
}

function DispatchPacket({ packet }) {
  return (
    <div className="ops-dispatch-packet">
      <div className="ops-detail-list">
        <div><span>Contact</span><strong>{packet.client.phone || packet.client.email || "Contact missing"}</strong></div>
        <div><span>Staging</span><p>{packet.flightPlan.stagingArea}</p></div>
        <div><span>Access</span><p>{packet.flightPlan.accessNotes}</p></div>
        <div><span>Weather</span><strong>{packet.flightPlan.weatherWindow}</strong></div>
        <div><span>Wind limit</span><strong>{packet.flightPlan.windLimitMph ? `${packet.flightPlan.windLimitMph} mph` : "Not set"}</strong></div>
        <div><span>Application</span><p>{[packet.operation.product, packet.operation.applicationRate, packet.operation.sprayVolumeGpa ? `${packet.operation.sprayVolumeGpa} GPA` : ""].filter(Boolean).join(" | ") || "Details pending"}</p></div>
        <div><span>Water / PPE</span><p>{[packet.operation.waterSource, packet.operation.ppe].filter(Boolean).join(" | ") || "Not documented"}</p></div>
      </div>
      <div className="ops-loadout">
        {packet.loadout.map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function EmptyState({ title, children }) {
  return (
    <div className="ops-empty">
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

function OpsQuickSearch({ state }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (text.length < 2) return [];
    const rows = [
      ...(state.jobs || []).map((job) => {
        const enriched = enrichOpsJob(job, state);
        return {
          id: `job-${job.id}`,
          type: "Job",
          title: enriched.title,
          detail: [enriched.client_name, enriched.field_name, formatFieldOpsStatus(enriched.status)].filter(Boolean).join(" | "),
          href: `/ops/jobs/${job.id}`,
          haystack: [enriched.title, enriched.client_name, enriched.farm_name, enriched.field_name, enriched.service_type, enriched.crop_type, enriched.jobber_job_id, enriched.jobber_request_id, enriched.notes, enriched.internal_notes].filter(Boolean).join(" "),
        };
      }),
      ...(state.clients || []).map((client) => ({
        id: `client-${client.id}`,
        type: "Grower",
        title: client.name,
        detail: [client.phone, client.email, client.city, client.state].filter(Boolean).join(" | "),
        href: `/ops/clients/${client.id}`,
        haystack: [client.name, client.company_name, client.phone, client.email, client.city, client.state, client.jobber_client_id, client.notes].filter(Boolean).join(" "),
      })),
      ...(state.farms || []).map((farm) => ({
        id: `farm-${farm.id}`,
        type: "Farm",
        title: farm.name,
        detail: [farm.city, farm.state].filter(Boolean).join(", ") || "Farm record",
        href: "/ops/farms",
        haystack: [farm.name, farm.city, farm.state, farm.zip, farm.notes].filter(Boolean).join(" "),
      })),
      ...(state.fields || []).map((field) => ({
        id: `field-${field.id}`,
        type: "Field",
        title: field.name,
        detail: [formatNumber(field.acres), field.crop_type || field.crop].filter(Boolean).join(" acres | "),
        href: "/ops/farms",
        haystack: [field.name, field.crop_type, field.crop, field.notes, field.acres].filter(Boolean).join(" "),
      })),
      ...(state.operatorProfiles || []).map((operator) => ({
        id: `operator-${operator.id}`,
        type: "Operator",
        title: operator.name,
        detail: [operator.phone, operator.email, operator.certification_status].filter(Boolean).join(" | "),
        href: "/ops/settings",
        haystack: [operator.name, operator.phone, operator.email, operator.certification_status, Array.isArray(operator.service_regions) ? operator.service_regions.join(" ") : operator.service_regions].filter(Boolean).join(" "),
      })),
      ...(state.fleetAssets || []).map((asset) => ({
        id: `fleet-${asset.id}`,
        type: "Drone",
        title: asset.name,
        detail: [formatFleetStatus(asset.status), asset.model, asset.serial_number].filter(Boolean).join(" | "),
        href: "/ops/fleet-map",
        haystack: [asset.name, asset.model, asset.serial_number, asset.home_base, asset.status, asset.notes].filter(Boolean).join(" "),
      })),
    ];
    return rows
      .filter((row) => row.haystack.toLowerCase().includes(text))
      .slice(0, 7);
  }, [query, state]);

  return (
    <div className="ops-quick-search">
      <label className="field">
        <span>Quick search</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Job, grower, field, phone" />
      </label>
      {results.length ? (
        <div className="ops-quick-search__results">
          {results.map((result) => (
            <Link className="ops-quick-result" to={result.href} key={result.id} onClick={() => setQuery("")}>
              <span>{result.type}</span>
              <strong>{result.title}</strong>
              <small>{result.detail}</small>
            </Link>
          ))}
        </div>
      ) : query.trim().length >= 2 ? <p className="ops-muted">No matches.</p> : null}
    </div>
  );
}

function OpsNav({ role }) {
  const groups = [
    {
      label: "Daily work",
      items: [
        ["Home", "/ops"],
        ["Today", "/ops/today"],
        ["Maps", "/ops/maps"],
        ["Fleet Map", "/ops/fleet-map"],
        ["How to Use", "/ops/guide"],
        ["New Requests", "/ops/leads"],
        ["Jobs", "/ops/jobs"],
        ["Schedule", "/ops/schedule"],
        ["Billing", "/ops/billing"],
      ],
    },
    {
      label: "Growth",
      items: [["Sales Funnels", "/ops/funnels"]],
    },
    {
      label: "Records",
      items: [
        ["Growers", "/ops/clients"],
        ["Farms & Fields", "/ops/farms"],
      ],
    },
    {
      label: "Training",
      items: [
        ["Academy", "/training"],
        ["Qualification", "/training/qualification"],
      ],
    },
    {
      label: "Assistant",
      items: role === "admin" ? [["Daily Ops Agent", "/ops/daily-agent"]] : [],
    },
    {
      label: "Setup",
      items: [["Settings", "/ops/settings"]],
    },
  ].filter((group) => group.items.length);
  return (
    <nav className="ops-nav" aria-label="Field operations">
      <Link className="ops-primary-nav-action" to="/ops/jobs/new">New job</Link>
      {groups.map((group) => (
        <div className="ops-nav__group" key={group.label}>
          <span>{group.label}</span>
          {group.items.map(([label, href]) => (
            <NavLink key={href} to={href} end={href === "/ops"}>{label}</NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function OpsHeader({ title, eyebrow = "Field operations", children, actions }) {
  return (
    <header className="ops-header card">
      <div>
        <span className="ops-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {children ? <p>{children}</p> : null}
      </div>
      {actions ? <div className="ops-actions">{actions}</div> : null}
    </header>
  );
}

function StatTile({ label, value, detail }) {
  return (
    <article className="ops-stat card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </article>
  );
}

function JobCard({ job, state, operators, onStatusChange }) {
  const readiness = getJobReadiness(job, state);
  const estimate = getJobEstimate(job, state);
  return (
    <article className="ops-job-card">
      <div className="ops-job-card__top">
        <div>
          <strong>{job.title}</strong>
          <p>{job.client_name || "Client TBD"}{job.field_name ? ` | ${job.field_name}` : ""}</p>
        </div>
        <PriorityBadge priority={job.priority} />
      </div>
      <div className="ops-progress" aria-label={`Job progress ${getJobProgress(job)} percent`}>
        <span style={{ width: `${getJobProgress(job)}%` }} />
      </div>
      <ReadinessBadge readiness={readiness} />
      <div className="ops-job-card__meta">
        <span>{formatNumber(job.acres)} acres</span>
        <span>{job.crop_type || "Crop TBD"}</span>
        <span>{job.service_type}</span>
        <span>{formatDate(job.scheduled_start)}</span>
        <span>{estimate.subtotal ? formatCurrency(estimate.subtotal) : estimate.quoteStatus}</span>
      </div>
      <p className="ops-next-action">{readiness.nextAction.label}</p>
      <div className="ops-job-card__service">
        <span>{job.application_product || "Product TBD"}</span>
        <span>{estimate.invoiceStatus}</span>
      </div>
      <div className="ops-job-card__footer">
        <span>{operators.find((operator) => operator.id === job.assigned_operator_id)?.name || "Unassigned"}</span>
        <select value={job.status} onChange={(event) => onStatusChange(job, event.target.value)} aria-label={`Update ${job.title} status`}>
          {FIELD_OPS_JOB_STATUSES.map((status) => (
            <option key={status.id} value={status.id}>{status.label}</option>
          ))}
        </select>
      </div>
      <Link className="ops-card-link" to={`/ops/jobs/${job.id}`}>Open job</Link>
    </article>
  );
}

function JobFilters({ filters, onChange, state }) {
  const jobs = state.jobs || [];
  const serviceOptions = uniqueOptions(jobs.map((job) => job.service_type));
  const cropOptions = uniqueOptions(jobs.map((job) => job.crop_type));

  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section className="ops-filter-card card">
      <label className="field ops-search-field">
        <span>Search</span>
        <input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Client, field, product, notes" />
      </label>
      <label className="field">
        <span>Status</span>
        <select value={filters.status} onChange={(event) => update("status", event.target.value)}>
          <option value="all">All statuses</option>
          {FIELD_OPS_JOB_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Operator</span>
        <select value={filters.operatorId} onChange={(event) => update("operatorId", event.target.value)}>
          <option value="all">All operators</option>
          {(state.operatorProfiles || []).map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Service</span>
        <select value={filters.serviceType} onChange={(event) => update("serviceType", event.target.value)}>
          <option value="all">All services</option>
          {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Crop</span>
        <select value={filters.cropType} onChange={(event) => update("cropType", event.target.value)}>
          <option value="all">All crops</option>
          {cropOptions.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Invoice</span>
        <select value={filters.invoiceNeeded} onChange={(event) => update("invoiceNeeded", event.target.value)}>
          <option value="all">Any</option>
          <option value="yes">Invoice needed</option>
          <option value="no">No invoice flag</option>
        </select>
      </label>
      <label className="field">
        <span>SOURCE</span>
        <select value={filters.sourceInterest} onChange={(event) => update("sourceInterest", event.target.value)}>
          <option value="all">Any</option>
          <option value="yes">SOURCE interest</option>
          <option value="no">No SOURCE interest</option>
        </select>
      </label>
    </section>
  );
}

function JobTable({ jobs, state, onStatusChange, onAssign }) {
  if (!jobs.length) {
    return <EmptyState title="No jobs match these filters">Create a job or loosen the filters to see work here.</EmptyState>;
  }

  return (
    <div className="ops-table-wrap card">
      <table className="ops-table">
        <thead>
          <tr>
            <th>Job</th>
            <th>Client</th>
            <th>Acres</th>
            <th>Crop</th>
            <th>Service</th>
            <th>Scheduled</th>
            <th>Operator</th>
            <th>Status</th>
            <th>Readiness</th>
            <th>Estimate</th>
            <th>Invoice</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const readiness = getJobReadiness(job, state);
            const estimate = getJobEstimate(job, state);
            return (
              <tr key={job.id}>
                <td><Link to={`/ops/jobs/${job.id}`}><strong>{job.title}</strong></Link></td>
                <td>{job.client_name || "-"}</td>
                <td>{formatNumber(job.acres)}</td>
                <td>{job.crop_type || "-"}</td>
                <td>{job.service_type}</td>
                <td>{formatDate(job.scheduled_start)}</td>
                <td>
                  <select value={job.assigned_operator_id || ""} onChange={(event) => onAssign(job, event.target.value || null)}>
                    <option value="">Unassigned</option>
                    {(state.operatorProfiles || []).map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
                  </select>
                </td>
                <td>
                  <select value={job.status} onChange={(event) => onStatusChange(job, event.target.value)}>
                    {FIELD_OPS_JOB_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
                  </select>
                </td>
                <td><ReadinessBadge readiness={readiness} /></td>
                <td>{estimate.subtotal ? formatCurrency(estimate.subtotal) : estimate.quoteStatus}</td>
                <td>{job.invoice_needed || job.status === "invoice_needed" ? "Yes" : "No"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function useFieldOpsData() {
  const { profile } = useAuth();
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function reload() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await loadFieldOpsState(profile);
      setState(result);
      setMessage(result.warning || "");
    } catch (error) {
      setErrorMessage(error.message || "Unable to load field operations.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, profile?.role, profile?.ops_role]);

  async function runAction(action, successMessage) {
    setErrorMessage("");
    setMessage("");
    try {
      const result = await action(state);
      if (result?.state) setState(result.state);
      if (successMessage) setMessage(successMessage);
      return result;
    } catch (error) {
      setErrorMessage(error.message || "Field operations action failed.");
      return null;
    }
  }

  return { state, setState, isLoading, message, errorMessage, setMessage, runAction, reload, profile };
}

function DashboardView({ state, jobs, onStatusChange, role }) {
  const summary = useMemo(() => getOpsDashboardSummary({ ...state, jobs }), [jobs, state]);
  const commandCenter = useMemo(() => getDailyOpsCommandCenter({ ...state, jobs }), [jobs, state]);
  const fleetSummary = useMemo(() => getFleetTrackingSummary({ ...state, jobs }), [jobs, state]);
  const todayJobs = jobs
    .filter((job) => job.scheduled_start && new Date(job.scheduled_start).toDateString() === new Date().toDateString())
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));
  const assignmentJobs = jobs.filter((job) => ["qualified", "quoted", "scheduled"].includes(job.status) && !job.assigned_operator_id);
  const invoiceJobs = jobs.filter((job) => job.invoice_needed || job.status === "invoice_needed");
  const firstAction = commandCenter.nextActions[0];

  return (
    <div className="ops-stack">
      <OpsHeader
        title="Operations"
        actions={
          <>
            <Link className="button button--primary" to="/ops/jobs/new">New job</Link>
            <Link className="button button--secondary" to="/ops/today">Today</Link>
            <Link className="button button--secondary" to="/ops/schedule">Schedule</Link>
          </>
        }
      >
        Start with what needs attention, then schedule, assign, fly, and close out field work.
      </OpsHeader>

      <section className="ops-focus-grid">
        <article className="ops-focus-card card">
          <span className="ops-eyebrow">Do first</span>
          {firstAction ? (
            <ActionRow action={firstAction} primary />
          ) : (
            <EmptyState title="No urgent action">The active jobs have their main dispatch details covered.</EmptyState>
          )}
        </article>
        <article className="ops-focus-card card">
          <span className="ops-eyebrow">Fast paths</span>
          <div className="ops-quick-actions">
            <Link to="/ops/today"><strong>Run today</strong><span>{summary.jobsScheduledToday} jobs</span></Link>
            <Link to="/ops/jobs?attention=1"><strong>Fix blockers</strong><span>{commandCenter.blockedJobs.length} blocked</span></Link>
            <Link to="/ops/fleet-map"><strong>Fleet map</strong><span>{fleetSummary.activeAssets.length} active</span></Link>
            <Link to="/ops/billing"><strong>Billing handoff</strong><span>{summary.invoiceNeededJobs} jobs</span></Link>
            {role === "admin" ? <Link to="/ops/daily-agent"><strong>Daily agent</strong><span>Brief</span></Link> : null}
          </div>
        </article>
      </section>

      <section className="ops-stat-grid">
        <StatTile label="Attention" value={commandCenter.nextActions.length} detail="open actions" />
        <StatTile label="Today" value={summary.jobsScheduledToday} />
        <StatTile label="Drones active" value={fleetSummary.activeAssets.length} />
        <StatTile label="Unassigned" value={summary.needsOperatorAssignment} />
        <StatTile label="Flying" value={summary.inProgressJobs} />
        <StatTile label="Invoice" value={summary.invoiceNeededJobs} />
        <StatTile label="Open acres" value={formatNumber(summary.openAcres)} />
      </section>

      <section className="ops-command-grid">
        <article className="ops-panel card ops-command-card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Command center</span>
              <h2>Next best actions</h2>
            </div>
            <span className="ops-command-count">{commandCenter.blockedJobs.length} blocked</span>
          </div>
          <div className="ops-list">
            {commandCenter.nextActions.length ? commandCenter.nextActions.slice(0, 5).map((action) => (
              <ActionRow action={action} key={`${action.jobId}-${action.action}`} />
            )) : <EmptyState title="No urgent actions">The active board has the essentials it needs.</EmptyState>}
          </div>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Launch board</span>
              <h2>Readiness</h2>
            </div>
          </div>
          <div className="ops-readiness-meters">
            <div><strong>{commandCenter.readyJobs.length}</strong><span>ready</span></div>
            <div><strong>{commandCenter.attentionJobs.length}</strong><span>needs review</span></div>
            <div><strong>{commandCenter.blockedJobs.length}</strong><span>blocked</span></div>
          </div>
          <p className="ops-muted">{formatNumber(commandCenter.scheduledAcresToday)} acres are on today&apos;s launch board.</p>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Loadout</span>
              <h2>Today&apos;s yard list</h2>
            </div>
          </div>
          <div className="ops-loadout">
            {commandCenter.loadoutItems.length ? commandCenter.loadoutItems.slice(0, 10).map((item) => <span key={item}>{item}</span>) : <span>No loadout needed yet</span>}
          </div>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Crew</span>
              <h2>Operator workload</h2>
            </div>
          </div>
          <div className="ops-list">
            {commandCenter.operatorWorkload.map((operator) => (
              <div className="ops-row" key={operator.operatorId}>
                <div>
                  <strong>{operator.operatorName}</strong>
                  <p>{operator.todayJobs} today | {operator.activeJobs} active | {formatNumber(operator.acres)} acres</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="ops-two-col">
        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Today</span>
              <h2>Today&apos;s Operations</h2>
            </div>
            <Link to="/ops/schedule">Schedule</Link>
          </div>
          <div className="ops-list">
            {todayJobs.length ? todayJobs.map((job) => (
              <div className="ops-row" key={job.id}>
                <div>
                  <strong>{job.title}</strong>
                  <p>{job.client_name} | {formatNumber(job.acres)} acres | {formatDate(job.scheduled_start)} | {job.operator_name || "Unassigned"}</p>
                </div>
                <ReadinessBadge readiness={getJobReadiness(job, state)} />
              </div>
            )) : <EmptyState title="No jobs scheduled today">Scheduled jobs will appear here first.</EmptyState>}
          </div>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Training</span>
              <h2>Academy and SOPs</h2>
            </div>
          </div>
          <div className="ops-list">
            <Link className="ops-row" to="/training"><strong>Open Academy</strong><span>Courses, SOPs, and resources</span></Link>
            <Link className="ops-row" to="/training/qualification"><strong>Operator qualification</strong><span>Training and credential readiness</span></Link>
            <Link className="ops-row" to="/training/checklists/hylio-preflight-checklist"><strong>Pre-flight checklist</strong><span>Field launch checklist</span></Link>
          </div>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Growth</span>
              <h2>Sales funnels</h2>
            </div>
            <Link to="/ops/funnels">Open</Link>
          </div>
          <div className="ops-list">
            <Link className="ops-row" to="/source-acre-review"><strong>SOURCE acre review</strong><span>Grower intake and acre qualification</span></Link>
            <Link className="ops-row" to="/growers"><strong>Grower services</strong><span>Application, scouting, and spot treatment demand</span></Link>
            <Link className="ops-row" to="/operators"><strong>Operator recruiting</strong><span>Crew and service-region growth</span></Link>
          </div>
        </article>

        {role === "admin" ? (
          <article className="ops-panel card">
            <div className="ops-panel__header">
              <div>
                <span className="ops-eyebrow">Assistant</span>
                <h2>Daily Ops Agent</h2>
              </div>
              <Link to="/ops/daily-agent">Open</Link>
            </div>
            <p className="ops-muted">Morning brief, open loops, Jobber follow-ups, email/SMS signals, and recommended admin moves.</p>
          </article>
        ) : null}
      </section>

      <section className="ops-two-col">
        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Dispatch</span>
              <h2>Needs operator assignment</h2>
            </div>
          </div>
          <div className="ops-list">
            {assignmentJobs.length ? assignmentJobs.map((job) => (
              <div className="ops-row" key={job.id}>
                <div>
                  <strong>{job.title}</strong>
                  <p>{job.client_name} | {job.service_type}</p>
                </div>
                <Link className="button button--secondary button--small" to={`/ops/jobs/${job.id}`}>Assign</Link>
              </div>
            )) : <EmptyState title="Assignment queue clear">No qualified or scheduled jobs are waiting on an operator.</EmptyState>}
          </div>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Billing handoff</span>
              <h2>Invoice-needed jobs</h2>
            </div>
            <Link to="/ops/billing">Billing</Link>
          </div>
          <div className="ops-list">
            {invoiceJobs.length ? invoiceJobs.map((job) => (
              <div className="ops-row" key={job.id}>
                <div>
                  <strong>{job.title}</strong>
                  <p>{job.client_name} | Jobber {job.jobber_job_id || "not linked"}</p>
                </div>
                <button className="button button--secondary button--small" type="button" onClick={() => onStatusChange(job, "closed")}>Close</button>
              </div>
            )) : <EmptyState title="No invoice flags">Completed jobs flagged for Jobber or QuickBooks will show here.</EmptyState>}
          </div>
        </article>
      </section>

      <section className="ops-panel card">
        <div className="ops-panel__header">
          <div>
            <span className="ops-eyebrow">AI Ops Summary</span>
            <h2>Plain-English briefing</h2>
          </div>
        </div>
        <ul className="ops-summary-list">
          {summary.aiSummary.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>
    </div>
  );
}

function TodayFieldCard({ job, state, profile, runAction }) {
  const readiness = getJobReadiness(job, state);
  const packet = getJobDispatchPacket(job, state);
  const preflight = getChecklistProgress(job.id, state, "pre_flight");
  const completion = getChecklistProgress(job.id, state, "completion");

  async function updateJob(updates, message) {
    await runAction(
      (currentState) => updateFieldOpsJob(job.id, updates, { state: currentState, profile }),
      message,
    );
  }

  return (
    <article className="ops-field-card card">
      <div className="ops-field-card__top">
        <div>
          <span className="ops-eyebrow">{formatDate(job.scheduled_start)}</span>
          <h2>{job.title}</h2>
          <p>{job.client_name || "Client TBD"} | {job.farm_name || "Farm TBD"} | {job.field_name || "Field TBD"}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <ReadinessPanel readiness={readiness} />
      <FieldMapPreview job={job} state={state} compact />
      <div className="ops-field-card__grid">
        <div><span>Operator</span><strong>{job.operator_name || "Unassigned"}</strong></div>
        <div><span>Acres</span><strong>{formatNumber(job.acres)}</strong></div>
        <div><span>Product</span><strong>{job.application_product || "TBD"}</strong></div>
        <div><span>Wind limit</span><strong>{packet.flightPlan.windLimitMph ? `${packet.flightPlan.windLimitMph} mph` : "Not set"}</strong></div>
      </div>
      <div className="ops-checklist-progress">
        <div><span>Pre-flight</span><strong>{preflight.completed}/{preflight.total}</strong></div>
        <div className="ops-progress"><span style={{ width: `${preflight.percent}%` }} /></div>
        <div><span>Completion</span><strong>{completion.completed}/{completion.total}</strong></div>
        <div className="ops-progress"><span style={{ width: `${completion.percent}%` }} /></div>
      </div>
      <div className="ops-loadout">
        {packet.loadout.length ? packet.loadout.slice(0, 8).map((item) => <span key={item}>{item}</span>) : <span>No loadout documented</span>}
      </div>
      <div className="ops-actions">
        {packet.client.phone ? <a className="button button--secondary button--small" href={`tel:${packet.client.phone}`}>Call grower</a> : null}
        {packet.client.phone ? <a className="button button--secondary button--small" href={`sms:${packet.client.phone}`}>Text grower</a> : null}
        <button className="button button--secondary button--small" type="button" onClick={() => copyText(buildEtaMessage(job))}>Copy ETA</button>
        <button className="button button--secondary button--small" type="button" onClick={() => copyText(buildDispatchSummary(job, state))}>Copy dispatch</button>
        <button className="button button--secondary button--small" type="button" onClick={() => updateJob({ status: "in_progress" }, "Job moved to in progress.")}>Start</button>
        <button className="button button--primary button--small" type="button" onClick={() => updateJob({ status: "completed" }, "Job marked complete.")}>Complete</button>
        <Link className="button button--secondary button--small" to={`/ops/jobs/${job.id}`}>Open</Link>
      </div>
    </article>
  );
}

function TodayView({ state, jobs, profile, runAction }) {
  const commandCenter = useMemo(() => getDailyOpsCommandCenter({ ...state, jobs }), [jobs, state]);
  const todayJobs = commandCenter.todayJobs;
  const readyToday = todayJobs.filter((job) => getJobReadiness(job, state).status === "ready");
  const blockedToday = todayJobs.filter((job) => getJobReadiness(job, state).status === "blocked");
  const unassignedToday = todayJobs.filter((job) => !job.assigned_operator_id);
  const activeToday = todayJobs.filter((job) => !["completed", "invoice_needed", "closed", "cancelled"].includes(job.status));

  return (
    <div className="ops-stack">
      <OpsHeader
        eyebrow="Launch board"
        title="Today in the field"
        actions={
          <>
            <Link className="button button--primary" to="/ops/schedule">Schedule</Link>
            <Link className="button button--secondary" to="/operator/jobs">Operator view</Link>
          </>
        }
      >
        A field-ready view for today&apos;s jobs, readiness blockers, grower contact, loadout, and operator lanes.
      </OpsHeader>

      <section className="ops-stat-grid">
        <StatTile label="Today" value={todayJobs.length} detail="scheduled jobs" />
        <StatTile label="Active" value={activeToday.length} />
        <StatTile label="Ready" value={readyToday.length} />
        <StatTile label="Blocked" value={blockedToday.length} />
        <StatTile label="Unassigned" value={unassignedToday.length} />
        <StatTile label="Acres" value={formatNumber(commandCenter.scheduledAcresToday)} />
      </section>

      <section className="ops-command-grid">
        <article className="ops-panel card ops-command-card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Needs action</span>
              <h2>Before leaving the yard</h2>
            </div>
          </div>
          <div className="ops-list">
            {commandCenter.nextActions.length ? commandCenter.nextActions.slice(0, 6).map((action) => (
              <Link className={`ops-row ops-row--${action.severity}`} to={`/ops/jobs/${action.jobId}`} key={`${action.jobId}-${action.action}`}>
                <div>
                  <strong>{action.label}</strong>
                  <p>{action.jobTitle} | {action.detail}</p>
                </div>
                <PriorityBadge priority={action.priority} />
              </Link>
            )) : <EmptyState title="No urgent launch blockers">Today&apos;s work has the basic dispatch information present.</EmptyState>}
          </div>
        </article>

        <article className="ops-panel card">
          <span className="ops-eyebrow">Loadout</span>
          <h2>Yard list</h2>
          <div className="ops-loadout">
            {commandCenter.loadoutItems.length ? commandCenter.loadoutItems.slice(0, 12).map((item) => <span key={item}>{item}</span>) : <span>No loadout needed yet</span>}
          </div>
        </article>

        <article className="ops-panel card">
          <span className="ops-eyebrow">Weather</span>
          <h2>Windows to watch</h2>
          <div className="ops-list">
            {commandCenter.weatherCards.length ? commandCenter.weatherCards.map((weather) => (
              <Link className={`ops-row ops-row--${weather.status === "blocked" ? "blocker" : "warning"}`} to={`/ops/jobs/${weather.jobId}`} key={weather.jobId}>
                <div>
                  <strong>{weather.label}</strong>
                  <p>{weather.jobTitle} | wind {weather.windMph || "-"} mph | gust {weather.gustMph || "-"} mph</p>
                </div>
              </Link>
            )) : <p className="ops-muted">No weather-sensitive jobs today.</p>}
          </div>
        </article>

        <article className="ops-panel card">
          <span className="ops-eyebrow">Crew</span>
          <h2>Operator lanes</h2>
          <div className="ops-list">
            {commandCenter.operatorWorkload.map((operator) => (
              <div className="ops-row" key={operator.operatorId}>
                <div>
                  <strong>{operator.operatorName}</strong>
                  <p>{operator.todayJobs} today | {formatNumber(operator.acres)} active acres</p>
                </div>
                {operator.phone ? <a className="button button--secondary button--small" href={`tel:${operator.phone}`}>Call</a> : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="ops-stack">
        {todayJobs.length ? todayJobs.map((job) => (
          <TodayFieldCard key={job.id} job={job} state={state} profile={profile} runAction={runAction} />
        )) : <EmptyState title="No scheduled jobs today">Use Schedule to put qualified work on today&apos;s board.</EmptyState>}
      </section>
    </div>
  );
}

function MapsView({ state, jobs }) {
  const activeJobs = jobs.filter((job) => !["closed", "cancelled"].includes(job.status));
  const mappedJobs = activeJobs.filter((job) => job.field?.boundary_geojson || job.farm?.latitude || job.farm?.longitude);
  const missingBoundaryJobs = activeJobs.filter((job) => job.field_id && !job.field?.boundary_geojson);
  const missingLocationJobs = activeJobs.filter((job) => job.farm_id && !job.farm?.latitude && !job.farm?.longitude);
  const mappingGapJobs = activeJobs.filter((job) => (job.field_id && !job.field?.boundary_geojson) || (job.farm_id && !job.farm?.latitude && !job.farm?.longitude));
  const fieldsWithBoundary = (state.fields || []).filter((field) => field.boundary_geojson).length;
  const farmsWithCoordinates = (state.farms || []).filter((farm) => farm.latitude || farm.longitude).length;

  return (
    <div className="ops-stack">
      <OpsHeader
        eyebrow="Field mapping"
        title="Maps and boundaries"
        actions={
          <>
            <Link className="button button--primary" to="/ops/farms">Add field boundary</Link>
            <Link className="button button--secondary" to="/ops/today">Today</Link>
          </>
        }
      >
        Field map previews, external directions, staging notes, hazards, and boundary readiness for daily drone work.
      </OpsHeader>

      <section className="ops-stat-grid">
        <StatTile label="Mapped jobs" value={mappedJobs.length} />
        <StatTile label="Need boundary" value={missingBoundaryJobs.length} />
        <StatTile label="Need coordinates" value={missingLocationJobs.length} />
        <StatTile label="Field boundaries" value={`${fieldsWithBoundary}/${(state.fields || []).length}`} />
        <StatTile label="Farm locations" value={`${farmsWithCoordinates}/${(state.farms || []).length}`} />
        <StatTile label="Mapped acres" value={formatNumber(mappedJobs.reduce((sum, job) => sum + Number(job.acres || 0), 0))} />
      </section>

      <section className="ops-two-col">
        <article className="ops-panel card">
          <span className="ops-eyebrow">Setup queue</span>
          <h2>Mapping gaps</h2>
          <div className="ops-list">
            {mappingGapJobs.slice(0, 8).map((job) => (
              <Link className="ops-row ops-row--warning" to={`/ops/jobs/${job.id}`} key={`${job.id}-map-gap`}>
                <div>
                  <strong>{job.title}</strong>
                  <p>{!job.field?.boundary_geojson ? "Boundary needed" : "Coordinates needed"} | {job.farm_name || "Farm TBD"} | {job.field_name || "Field TBD"}</p>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
            {!missingBoundaryJobs.length && !missingLocationJobs.length ? <EmptyState title="Map data looks good">Active jobs have field boundaries or usable farm locations.</EmptyState> : null}
          </div>
        </article>

        <article className="ops-panel card">
          <span className="ops-eyebrow">Capture standard</span>
          <h2>What ops should collect</h2>
          <div className="ops-list">
            {[
              "Farm coordinates or a precise address for directions.",
              "Field boundary GeoJSON before application work.",
              "Staging area, gate, tender/water location, and truck route.",
              "Obstacles: trees, power lines, pivots, wet lanes, roads, homes, and no-spray buffers.",
              "Grower-confirmed access notes before the operator leaves the yard.",
            ].map((item) => <div className="ops-row" key={item}><p>{item}</p></div>)}
          </div>
        </article>
      </section>

      <section className="ops-card-grid">
        {activeJobs.length ? activeJobs.map((job) => (
          <article className="ops-record-card card" key={job.id}>
            <FieldMapPreview job={job} state={state} />
            <div className="ops-actions">
              <Link className="button button--primary button--small" to={`/ops/jobs/${job.id}`}>Open job</Link>
              <Link className="button button--secondary button--small" to="/ops/farms">Edit farm or field</Link>
            </div>
          </article>
        )) : <EmptyState title="No active jobs">Open jobs with farm or field data will show map previews here.</EmptyState>}
      </section>
    </div>
  );
}

function getFleetMarkerPosition(asset, bounds) {
  const lat = Number(asset.latitude);
  const lng = Number(asset.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const latRange = Math.max(0.001, bounds.maxLat - bounds.minLat);
  const lngRange = Math.max(0.001, bounds.maxLng - bounds.minLng);
  const x = 8 + ((lng - bounds.minLng) / lngRange) * 84;
  const y = 8 + ((bounds.maxLat - lat) / latRange) * 84;

  return {
    left: `${Math.min(92, Math.max(8, x))}%`,
    top: `${Math.min(92, Math.max(8, y))}%`,
  };
}

function FleetMapCanvas({ assets }) {
  const positionedAssets = assets.filter((asset) => Number.isFinite(Number(asset.latitude)) && Number.isFinite(Number(asset.longitude)));
  const bounds = positionedAssets.reduce((current, asset) => ({
    minLat: Math.min(current.minLat, Number(asset.latitude)),
    maxLat: Math.max(current.maxLat, Number(asset.latitude)),
    minLng: Math.min(current.minLng, Number(asset.longitude)),
    maxLng: Math.max(current.maxLng, Number(asset.longitude)),
  }), {
    minLat: Number.POSITIVE_INFINITY,
    maxLat: Number.NEGATIVE_INFINITY,
    minLng: Number.POSITIVE_INFINITY,
    maxLng: Number.NEGATIVE_INFINITY,
  });
  const safeBounds = positionedAssets.length ? bounds : { minLat: 44, maxLat: 46, minLng: -97, maxLng: -94 };

  return (
    <div className="ops-fleet-map">
      <svg viewBox="0 0 100 56" role="img" aria-label="Last known drone locations">
        <rect className="ops-fleet-map__bg" width="100" height="56" rx="3" />
        {[12, 28, 44, 60, 76, 92].map((x) => <line className="ops-fleet-map__grid" key={`x-${x}`} x1={x} x2={x} y1="0" y2="56" />)}
        {[10, 22, 34, 46].map((y) => <line className="ops-fleet-map__grid" key={`y-${y}`} x1="0" x2="100" y1={y} y2={y} />)}
        <path className="ops-fleet-map__route" d="M8 42 C24 20, 42 46, 58 26 S83 18, 94 34" />
      </svg>
      {positionedAssets.map((asset, index) => {
        const markerPosition = getFleetMarkerPosition(asset, safeBounds);
        const mapsUrl = buildGoogleMapsPointUrl(asset.latitude, asset.longitude);
        return (
          <a
            className={`ops-fleet-marker ops-fleet-marker--${asset.status || "offline"} ${asset.stale ? "is-stale" : ""}`}
            href={mapsUrl || "#"}
            key={asset.id}
            style={markerPosition}
            target={mapsUrl ? "_blank" : undefined}
            rel={mapsUrl ? "noreferrer" : undefined}
            title={`${asset.name}: ${asset.statusLabel}`}
          >
            <span>{index + 1}</span>
          </a>
        );
      })}
      <div className="ops-fleet-map__legend">
        <span>Last known check-ins</span>
        <strong>{positionedAssets.length}/{assets.length} mapped</strong>
      </div>
    </div>
  );
}

function FleetAssetCard({ asset }) {
  const mapsUrl = buildGoogleMapsPointUrl(asset.latitude, asset.longitude);
  return (
    <article className={`ops-fleet-card ${asset.stale ? "ops-row--warning" : ""}`}>
      <div className="ops-fleet-card__top">
        <div>
          <span className="ops-eyebrow">{asset.model || "Drone"}</span>
          <strong>{asset.name}</strong>
          <p>{asset.operatorName} | {asset.jobTitle}</p>
        </div>
        <FleetStatusBadge status={asset.status} />
      </div>
      <div className="ops-detail-list">
        <div><span>Last check-in</span><strong>{formatFleetAge(asset.lastSeenAt)}</strong></div>
        <div><span>Accuracy</span><strong>{asset.accuracyMeters ? `${Math.round(asset.accuracyMeters)} m` : "Not reported"}</strong></div>
        <div><span>Base</span><strong>{asset.home_base || "Not set"}</strong></div>
        <div><span>Source</span><strong>{asset.source || "manual"}</strong></div>
      </div>
      {asset.lastNote ? <p className="ops-muted">{asset.lastNote}</p> : null}
      <div className="ops-actions">
        {asset.currentJob ? <Link className="button button--primary button--small" to={`/ops/jobs/${asset.currentJob.id}`}>Open job</Link> : null}
        {mapsUrl ? <a className="button button--secondary button--small" href={mapsUrl} target="_blank" rel="noreferrer">Open map</a> : null}
        {asset.operator?.phone ? <a className="button button--secondary button--small" href={`tel:${asset.operator.phone}`}>Call operator</a> : null}
      </div>
    </article>
  );
}

function FleetMapView({ state, jobs }) {
  const summary = useMemo(() => getFleetTrackingSummary({ ...state, jobs }), [jobs, state]);
  const orderedAssets = [...summary.trackedAssets].sort((a, b) => {
    const aScore = (a.stale ? 0 : 2) + (summary.activeAssets.includes(a) ? 2 : 0);
    const bScore = (b.stale ? 0 : 2) + (summary.activeAssets.includes(b) ? 2 : 0);
    return bScore - aScore || a.name.localeCompare(b.name);
  });
  const activeLabel = summary.activeAssets.length === 1 ? "drone is out" : "drones are out";

  return (
    <div className="ops-stack">
      <OpsHeader
        eyebrow="Fleet tracking"
        title="Drone locations"
        actions={
          <>
            <Link className="button button--primary" to="/ops/today">Run today</Link>
            <Link className="button button--secondary" to="/ops/maps">Field maps</Link>
          </>
        }
      >
        Last known drone positions from operator check-ins, job assignments, and fleet records. Use this to see which drones are at the yard, in transit, on site, or flying.
      </OpsHeader>

      <section className="ops-stat-grid">
        <StatTile label="Tracked" value={summary.trackedAssets.length} />
        <StatTile label="Active" value={summary.activeAssets.length} detail={activeLabel} />
        <StatTile label="Flying" value={summary.flyingAssets.length} />
        <StatTile label="On site" value={summary.onSiteAssets.length} />
        <StatTile label="Stale" value={summary.staleAssets.length} />
        <StatTile label="Offline" value={summary.offlineAssets.length} />
      </section>

      <section className="ops-two-col">
        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Map</span>
              <h2>Last known positions</h2>
            </div>
          </div>
          <FleetMapCanvas assets={orderedAssets} />
          <p className="ops-muted">This is check-in based tracking. True live telemetry can be wired in later when a drone platform API or tracker feed is available.</p>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Needs attention</span>
              <h2>Fleet next actions</h2>
            </div>
          </div>
          <div className="ops-list">
            {summary.nextActions.length ? summary.nextActions.map((action) => {
              const asset = summary.trackedAssets.find((item) => item.id === action.assetId);
              return (
                <div className={`ops-row ops-row--${action.severity}`} key={action.id}>
                  <div>
                    <strong>{action.label}</strong>
                    <p>{action.detail}</p>
                  </div>
                  {asset?.operator?.phone ? <a className="button button--secondary button--small" href={`tel:${asset.operator.phone}`}>Call</a> : null}
                </div>
              );
            }) : <EmptyState title="Fleet looks current">Active drones have recent check-ins and job links.</EmptyState>}
          </div>
        </article>
      </section>

      <section className="ops-panel card">
        <div className="ops-panel__header">
          <div>
            <span className="ops-eyebrow">Fleet board</span>
            <h2>Every drone</h2>
          </div>
          <div className="ops-chip-list">{FIELD_OPS_FLEET_STATUSES.map((status) => <FleetStatusBadge key={status.id} status={status.id} />)}</div>
        </div>
        <div className="ops-fleet-grid">
          {orderedAssets.length ? orderedAssets.map((asset) => <FleetAssetCard asset={asset} key={asset.id} />) : <EmptyState title="No drones tracked yet">Add fleet assets in settings or seed data, then operators can check in from their job view.</EmptyState>}
        </div>
      </section>
    </div>
  );
}

function SalesFunnelsView() {
  return (
    <div className="ops-stack">
      <OpsHeader
        eyebrow="Growth"
        title="Sales funnels"
        actions={
          <>
            <Link className="button button--primary" to="/ops/leads">Review new requests</Link>
            <Link className="button button--secondary" to="/ops/jobs/new">Create job</Link>
          </>
        }
      >
        The public intake paths that feed Harvest Drone Ops. Keep the funnels simple, then move real work into leads, growers, fields, and jobs.
      </OpsHeader>

      <section className="ops-card-grid">
        {SALES_FUNNELS.map((funnel) => (
          <article className="ops-record-card" key={funnel.path}>
            <div className="ops-record-card__top">
              <div>
                <span className="ops-eyebrow">{funnel.audience}</span>
                <strong>{funnel.title}</strong>
                <p>{funnel.purpose}</p>
              </div>
            </div>
            <div className="ops-detail-list">
              <div>
                <span>Ops handoff</span>
                <p>{funnel.handoff}</p>
              </div>
            </div>
            <div className="ops-actions">
              <Link className="button button--secondary button--small" to={funnel.path}>Open funnel</Link>
              <Link className="button button--secondary button--small" to="/ops/leads">Lead queue</Link>
            </div>
          </article>
        ))}
      </section>

      <section className="ops-two-col">
        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Daily use</span>
              <h2>How funnels feed Ops</h2>
            </div>
          </div>
          <ol className="ops-summary-list">
            <li>Use the funnel link in calls, texts, emails, and partner follow-up.</li>
            <li>Review new submissions in New Requests.</li>
            <li>Convert qualified demand into a client, farm, field, and job.</li>
            <li>Schedule, assign, complete, and flag invoice-needed work inside Ops.</li>
          </ol>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">What belongs here</span>
              <h2>Keep it practical</h2>
            </div>
          </div>
          <div className="ops-list">
            <div className="ops-row"><strong>Grower demand</strong><span>SOURCE, application, scouting, spot treatment</span></div>
            <div className="ops-row"><strong>Network growth</strong><span>Operators, dealers, equipment conversations</span></div>
            <div className="ops-row"><strong>Ops handoff</strong><span>Only qualified work should become scheduled jobs</span></div>
          </div>
        </article>
      </section>
    </div>
  );
}

function OpsGuideView() {
  return (
    <div className="ops-stack">
      <OpsHeader
        eyebrow="Internal guide"
        title="How to use Harvest Drone Ops"
        actions={
          <>
            <Link className="button button--primary" to="/ops/jobs/new">Practice new job</Link>
            <Link className="button button--secondary" to="/training">Open Academy</Link>
          </>
        }
      >
        A simple internal guide for the daily workflows: intake, job creation, scheduling, field execution, closeout, and billing handoff.
      </OpsHeader>

      <section className="ops-two-col">
        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Morning rhythm</span>
              <h2>Start here every day</h2>
            </div>
          </div>
          <ol className="ops-summary-list">
            <li>Open Operations and scan Today&apos;s Operations, Next best actions, and Readiness.</li>
            <li>Check New Requests before creating or scheduling jobs.</li>
            <li>Open Maps for any job that needs boundary, access, staging, or hazard confirmation.</li>
            <li>Use Schedule to assign operators and confirm the day&apos;s loadout.</li>
            <li>Use Billing at the end of the day to flag completed work for external invoicing.</li>
          </ol>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Videos</span>
              <h2>Workflow recordings</h2>
            </div>
          </div>
          <p className="ops-muted">First-pass workflow videos are available now. Replace them with narrated screen recordings later without changing this guide structure.</p>
          <div className="ops-list">
            <div className="ops-video-placeholder"><strong>Recommended format</strong><span>3-5 minutes, screen recording, one workflow per video</span></div>
            <div className="ops-video-placeholder"><strong>Who records</strong><span>Ops lead narrates; operator video can be recorded from the field view</span></div>
          </div>
        </article>
      </section>

      <section className="ops-card-grid">
        {OPS_GUIDE_WORKFLOWS.map((workflow) => (
          <article className="ops-record-card card" key={workflow.title}>
            <div className="ops-record-card__top">
              <div>
                <span className="ops-eyebrow">{workflow.audience}</span>
                <strong>{workflow.title}</strong>
                <p>{workflow.duration} walkthrough | {workflow.videoStatus}</p>
              </div>
              <Link className="button button--secondary button--small" to={workflow.path}>Open</Link>
            </div>
            <ol className="ops-summary-list">
              {workflow.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            {workflow.videoUrl ? (
              <video className="ops-guide-video" controls preload="metadata" src={workflow.videoUrl}>
                <a href={workflow.videoUrl}>Open video</a>
              </video>
            ) : (
              <div className="ops-video-placeholder">
                <strong>Video placeholder</strong>
                <span>Record this workflow and link the file here.</span>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function DailyAgentItemList({ items, emptyTitle, emptyText }) {
  if (!items?.length) {
    return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;
  }

  return (
    <div className="ops-list">
      {items.slice(0, 8).map((item) => (
        <article className="ops-row" key={item.id || item.source_external_id || item.title || item.summary}>
          <div>
            <strong>{item.title || item.summary || "Review item"}</strong>
            <p>{item.summary || item.suggested_next_action || item.action || "No summary available."}</p>
            {item.suggested_next_action || item.action ? <span>{item.suggested_next_action || item.action}</span> : null}
          </div>
          {item.priority ? <PriorityBadge priority={item.priority} /> : null}
        </article>
      ))}
    </div>
  );
}

function DailyAgentCalendarList({ events, emptyTitle, emptyText }) {
  if (!events?.length) {
    return <EmptyState title={emptyTitle}>{emptyText}</EmptyState>;
  }

  return (
    <div className="ops-list">
      {events.slice(0, 8).map((event) => (
        <article className="ops-row" key={event.id || `${event.summary}-${event.start}`}>
          <div>
            <strong>{event.summary || "Calendar event"}</strong>
            <p>{[formatDateTime(event.start), event.location].filter(Boolean).join(" | ") || "Time not available"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function DailyAgentView() {
  const [snapshot, setSnapshot] = useState({ brief: null, loops: [], mode: "loading" });
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  async function loadBrief() {
    setIsLoading(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const result = await getDailyOpsBrief();
      setSnapshot(result);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load Daily Ops Agent.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBrief();
  }, []);

  async function handleSendSlack() {
    setIsPosting(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const result = await sendDailyOpsBriefToSlack({ date: snapshot.brief?.brief_date });
      setSnapshot(result);
      setInfoMessage(result.slackResult?.reason || `Slack status: ${result.slackResult?.status || "not_sent"}`);
    } catch (error) {
      setErrorMessage(error.message || "Unable to post Daily Ops brief.");
    } finally {
      setIsPosting(false);
    }
  }

  const summary = snapshot.brief?.summary || {};
  const counts = summary.counts || {};
  const loops = snapshot.loops || summary.loops || [];
  const grouped = useMemo(
    () => ({
      email: loops.filter((loop) => loop.source === "gmail"),
      jobber: loops.filter((loop) => loop.source === "jobber"),
      sms: loops.filter((loop) => loop.source === "twilio"),
      enterprise: loops.filter((loop) => loop.loop_type === "rdo_followup"),
    }),
    [loops],
  );

  return (
    <div className="ops-stack">
      <OpsHeader
        eyebrow="Assistant"
        title="Daily Ops Agent"
        actions={
          <>
            <button className="button button--secondary" type="button" onClick={loadBrief} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Regenerate"}
            </button>
            <button className="button button--secondary" type="button" onClick={handleSendSlack} disabled={isPosting || !snapshot.brief}>
              {isPosting ? "Posting..." : "Post to Slack"}
            </button>
            <Link className="button button--secondary" to="/admin/open-loops">Open loops</Link>
          </>
        }
      >
        A morning operating brief for calendar work, customer replies, Jobber handoffs, SMS replies, and recommended admin moves.
      </OpsHeader>

      {errorMessage ? <div className="ops-message ops-message--error card">{errorMessage}</div> : null}
      {infoMessage ? <div className="ops-message card">{infoMessage}</div> : null}
      {summary.warnings?.length ? <div className="ops-message card">{summary.warnings.join(" ")}</div> : null}

      <section className="ops-stat-grid">
        <StatTile label="Today" value={counts.todayEvents || 0} detail="calendar items" />
        <StatTile label="Tomorrow" value={counts.tomorrowEvents || 0} detail="calendar items" />
        <StatTile label="Open loops" value={counts.openLoops || 0} />
        <StatTile label="Priority" value={counts.priorityItems || 0} />
        <StatTile label="Email" value={counts.emailFollowUps || 0} detail="follow-ups" />
        <StatTile label="SMS" value={counts.smsReplies || 0} detail="replies" />
      </section>

      {isLoading ? <div className="card ops-loading">Loading Daily Ops Agent...</div> : null}

      {!isLoading ? (
        <>
          <section className="ops-two-col">
            <article className="ops-panel card">
              <div className="ops-panel__header">
                <div>
                  <span className="ops-eyebrow">Priority</span>
                  <h2>Items needing action</h2>
                </div>
              </div>
              <DailyAgentItemList items={summary.priorityItems} emptyTitle="No urgent items" emptyText="No urgent or high-priority items are in this brief." />
            </article>

            <article className="ops-panel card">
              <div className="ops-panel__header">
                <div>
                  <span className="ops-eyebrow">Next actions</span>
                  <h2>Recommended moves</h2>
                </div>
              </div>
              <DailyAgentItemList items={summary.recommendedNextActions} emptyTitle="No recommended moves" emptyText="The agent has no recommended actions yet." />
            </article>
          </section>

          <section className="ops-two-col">
            <article className="ops-panel card">
              <span className="ops-eyebrow">Calendar</span>
              <h2>Today</h2>
              <DailyAgentCalendarList events={summary.todayEvents} emptyTitle="No calendar items" emptyText="No important calendar events found for today." />
            </article>
            <article className="ops-panel card">
              <span className="ops-eyebrow">Jobber</span>
              <h2>Jobs and quotes needing attention</h2>
              <DailyAgentItemList items={grouped.jobber} emptyTitle="No Jobber loops" emptyText="Jobber follow-ups will appear here when connected." />
            </article>
            <article className="ops-panel card">
              <span className="ops-eyebrow">Email</span>
              <h2>Customer emails</h2>
              <DailyAgentItemList items={grouped.email} emptyTitle="No email follow-ups" emptyText="No customer email follow-ups detected." />
            </article>
            <article className="ops-panel card">
              <span className="ops-eyebrow">SMS and enterprise</span>
              <h2>Replies and strategic loops</h2>
              <DailyAgentItemList items={[...grouped.sms, ...grouped.enterprise]} emptyTitle="No SMS or enterprise loops" emptyText="No SMS replies or enterprise follow-ups detected." />
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}

function JobsView({ state, jobs, filters, setFilters, onStatusChange, onAssign }) {
  const [mode, setMode] = useState("board");
  const filteredJobs = useMemo(() => filterOpsJobs(jobs, filters), [filters, jobs]);

  return (
    <div className="ops-stack">
      <OpsHeader
        title="Job pipeline"
        actions={<Link className="button button--primary" to="/ops/jobs/new">New Job</Link>}
      >
        Move requests from qualification to scheduled work, completion, invoicing, and closeout.
      </OpsHeader>
      <div className="ops-segmented card">
        <button className={mode === "board" ? "is-active" : ""} type="button" onClick={() => setMode("board")}>Pipeline board</button>
        <button className={mode === "list" ? "is-active" : ""} type="button" onClick={() => setMode("list")}>List view</button>
      </div>
      <details className="ops-filter-disclosure">
        <summary>Search and filters</summary>
        <JobFilters filters={filters} onChange={setFilters} state={state} />
      </details>
      {mode === "board" ? (
        <section className="ops-board">
          {FIELD_OPS_BOARD_COLUMNS.map((column) => {
            const columnJobs = filteredJobs.filter((job) => column.statuses.includes(job.status));
            return (
              <article className="ops-board__column card" key={column.id}>
                <header>
                  <strong>{column.label}</strong>
                  <span>{columnJobs.length}</span>
                </header>
                <div className="ops-board__stack">
                  {columnJobs.length ? columnJobs.map((job) => (
                    <JobCard key={job.id} job={job} state={state} operators={state.operatorProfiles || []} onStatusChange={onStatusChange} />
                  )) : <p className="ops-muted">No jobs here.</p>}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <JobTable jobs={filteredJobs} state={state} onStatusChange={onStatusChange} onAssign={onAssign} />
      )}
    </div>
  );
}

function NewJobView({ state, profile, runAction }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...blankJobForm,
    requested_date: new Date().toISOString().slice(0, 10),
  });

  const farmsForClient = state.farms.filter((farm) => farm.client_id === form.client_id);
  const fieldsForFarm = state.fields.filter((field) => field.farm_id === form.farm_id);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await runAction(async (currentState) => {
      let workingState = currentState;
      let clientId = form.client_id;
      let farmId = form.farm_id;
      let fieldId = form.field_id;

      if (!clientId) {
        const clientResult = await createFieldOpsRecord("clients", {
          name: form.client_name,
          company_name: form.client_name,
          email: form.client_email || null,
          phone: form.client_phone || null,
          source: "Ops job form",
        }, { state: workingState, profile });
        workingState = clientResult.state;
        clientId = clientResult.row.id;
      }

      if (!farmId && form.farm_name) {
        const farmResult = await createFieldOpsRecord("farms", {
          client_id: clientId,
          name: form.farm_name,
          notes: "Created from job form.",
        }, { state: workingState, profile });
        workingState = farmResult.state;
        farmId = farmResult.row.id;
      }

      if (!fieldId && form.field_name) {
        const fieldResult = await createFieldOpsRecord("fields", {
          farm_id: farmId || null,
          name: form.field_name,
          crop: form.crop_type || null,
          crop_type: form.crop_type || null,
          acres: form.acres ? Number(form.acres) : null,
          notes: form.notes || null,
        }, { state: workingState, profile });
        workingState = fieldResult.state;
        fieldId = fieldResult.row.id;
      }

      const jobResult = await createFieldOpsJob({
        client_id: clientId,
        farm_id: farmId || null,
        field_id: fieldId || null,
        title: `${form.client_name || state.clients.find((client) => client.id === clientId)?.name || "Grower"} ${form.service_type}`,
        service_type: form.service_type,
        crop_type: form.crop_type || state.fields.find((field) => field.id === fieldId)?.crop_type || null,
        acres: form.acres ? Number(form.acres) : null,
        status: form.scheduled_start ? "scheduled" : "new_request",
        priority: form.priority,
        requested_date: form.requested_date || null,
        scheduled_start: fromInputDateTime(form.scheduled_start),
        scheduled_end: form.scheduled_start ? new Date(new Date(form.scheduled_start).getTime() + 3 * 60 * 60 * 1000).toISOString() : null,
        assigned_operator_id: form.assigned_operator_id || null,
        application_product: form.application_product || null,
        source_interest: Boolean(form.source_interest),
        metadata_json: {
          staging_area: form.staging_area || "Staging area not documented yet.",
          access_notes: form.access_notes || "",
          weather_window: form.weather_window || "",
          wind_limit_mph: form.wind_limit_mph ? Number(form.wind_limit_mph) : null,
          application_rate: form.application_rate || null,
          spray_volume_gpa: form.spray_volume_gpa ? Number(form.spray_volume_gpa) : null,
          water_source: form.water_source || null,
          quoted_rate_per_acre: form.quoted_rate_per_acre ? Number(form.quoted_rate_per_acre) : null,
          quote_status: form.quoted_rate_per_acre ? "Estimate" : "Manual quote",
          customer_po: form.customer_po || null,
          customer_preference: form.customer_preference || null,
          payment_terms: form.payment_terms || "External billing in Jobber or QuickBooks",
          loadout: [
            form.application_product ? `Product: ${form.application_product}` : "",
            form.water_source ? `Water source: ${form.water_source}` : "",
          ].filter(Boolean),
        },
        notes: form.notes || null,
        invoice_needed: false,
      }, { state: workingState, profile });

      return jobResult;
    }, "Job created.");

    if (result?.row?.id) {
      navigate(`/ops/jobs/${result.row.id}`);
    }
  }

  return (
    <div className="ops-stack">
      <OpsHeader title="New field ops job">Only the basics are required. Add field details now, then schedule and assign when the work is real.</OpsHeader>
      <section className="ops-helper-strip card">
        <div><strong>Fast path</strong><span>Grower, field, acres, crop, service, notes.</span></div>
        <div><strong>Optional now</strong><span>Schedule, operator, staging, quote, Jobber handoff.</span></div>
        <div><strong>After create</strong><span>Use the job detail page for readiness and checklist work.</span></div>
      </section>
      <form className="ops-form card ops-fast-job-form" onSubmit={handleSubmit}>
        <section>
          <h2>Grower</h2>
          <div className="ops-form-grid">
            <label className="field">
              <span>Existing client</span>
              <select value={form.client_id} onChange={(event) => update("client_id", event.target.value)}>
                <option value="">Create a new client</option>
                {state.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>
            {!form.client_id ? (
              <>
                <label className="field"><span>Client name</span><input required={!form.client_id} value={form.client_name} onChange={(event) => update("client_name", event.target.value)} /></label>
                <label className="field"><span>Email</span><input type="email" value={form.client_email} onChange={(event) => update("client_email", event.target.value)} /></label>
                <label className="field"><span>Phone</span><input value={form.client_phone} onChange={(event) => update("client_phone", event.target.value)} /></label>
              </>
            ) : null}
          </div>
        </section>

        <section>
          <h2>Field</h2>
          <div className="ops-form-grid">
            <label className="field">
              <span>Farm</span>
              <select value={form.farm_id} onChange={(event) => update("farm_id", event.target.value)}>
                <option value="">Add quick farm</option>
                {farmsForClient.map((farm) => <option key={farm.id} value={farm.id}>{farm.name}</option>)}
              </select>
            </label>
            {!form.farm_id ? <label className="field"><span>Farm name</span><input value={form.farm_name} onChange={(event) => update("farm_name", event.target.value)} /></label> : null}
            <label className="field">
              <span>Field</span>
              <select value={form.field_id} onChange={(event) => {
                const nextField = state.fields.find((field) => field.id === event.target.value);
                setForm((current) => ({
                  ...current,
                  field_id: event.target.value,
                  acres: nextField?.acres || current.acres,
                  crop_type: nextField?.crop_type || nextField?.crop || current.crop_type,
                }));
              }}>
                <option value="">Add quick field</option>
                {fieldsForFarm.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}
              </select>
            </label>
            {!form.field_id ? <label className="field"><span>Field name</span><input value={form.field_name} onChange={(event) => update("field_name", event.target.value)} /></label> : null}
            <label className="field"><span>Acres</span><input inputMode="decimal" value={form.acres} onChange={(event) => update("acres", event.target.value)} /></label>
            <label className="field"><span>Crop</span><input value={form.crop_type} onChange={(event) => update("crop_type", event.target.value)} /></label>
          </div>
        </section>

        <section>
          <h2>Service</h2>
          <div className="ops-form-grid">
            <label className="field">
              <span>Service type</span>
              <select value={form.service_type} onChange={(event) => update("service_type", event.target.value)}>
                {state.services.map((service) => <option key={service.id} value={service.name}>{service.name}</option>)}
              </select>
            </label>
            <label className="field"><span>Product/application notes</span><input value={form.application_product} onChange={(event) => update("application_product", event.target.value)} /></label>
            <label className="ops-checkline"><input type="checkbox" checked={form.source_interest} onChange={(event) => update("source_interest", event.target.checked)} /> SOURCE interest</label>
            <label className="field"><span>Requested date</span><input type="date" value={form.requested_date} onChange={(event) => update("requested_date", event.target.value)} /></label>
          </div>
        </section>

        <section>
          <h2>Schedule</h2>
          <div className="ops-form-grid">
            <label className="field"><span>Scheduled start</span><input type="datetime-local" value={form.scheduled_start} onChange={(event) => update("scheduled_start", event.target.value)} /></label>
            <label className="field">
              <span>Operator</span>
              <select value={form.assigned_operator_id} onChange={(event) => update("assigned_operator_id", event.target.value)}>
                <option value="">Assign later</option>
                {state.operatorProfiles.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Priority</span>
              <select value={form.priority} onChange={(event) => update("priority", event.target.value)}>
                {FIELD_OPS_PRIORITIES.map((priority) => <option key={priority} value={priority}>{formatFieldOpsPriority(priority)}</option>)}
              </select>
            </label>
            <label className="field field-span-2"><span>Notes</span><textarea rows="4" value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label>
          </div>
        </section>

        <details className="ops-form-optional">
          <summary>Optional dispatch details</summary>
          <div className="ops-form-grid">
            <label className="field"><span>Staging area</span><input value={form.staging_area} onChange={(event) => update("staging_area", event.target.value)} placeholder="South entrance, gravel pad, tender location" /></label>
            <label className="field"><span>Field access notes</span><input value={form.access_notes} onChange={(event) => update("access_notes", event.target.value)} placeholder="Gate, driveway, obstacles, buffer notes" /></label>
            <label className="field"><span>Weather window</span><input value={form.weather_window} onChange={(event) => update("weather_window", event.target.value)} placeholder="Morning before wind builds" /></label>
            <label className="field"><span>Wind limit mph</span><input inputMode="numeric" value={form.wind_limit_mph} onChange={(event) => update("wind_limit_mph", event.target.value)} /></label>
            <label className="field"><span>Application rate</span><input value={form.application_rate} onChange={(event) => update("application_rate", event.target.value)} placeholder="2 pt/ac, SOURCE plan pending" /></label>
            <label className="field"><span>Spray volume GPA</span><input inputMode="decimal" value={form.spray_volume_gpa} onChange={(event) => update("spray_volume_gpa", event.target.value)} /></label>
            <label className="field field-span-2"><span>Water source</span><input value={form.water_source} onChange={(event) => update("water_source", event.target.value)} placeholder="Grower nurse tank, bring tender, hydrant" /></label>
          </div>
        </details>

        <details className="ops-form-optional">
          <summary>Optional quote and handoff</summary>
          <div className="ops-form-grid">
            <label className="field"><span>Quoted rate per acre</span><input inputMode="decimal" value={form.quoted_rate_per_acre} onChange={(event) => update("quoted_rate_per_acre", event.target.value)} placeholder="Leave blank for service default" /></label>
            <label className="field"><span>Customer PO</span><input value={form.customer_po} onChange={(event) => update("customer_po", event.target.value)} /></label>
            <label className="field"><span>Customer preference</span><input value={form.customer_preference} onChange={(event) => update("customer_preference", event.target.value)} placeholder="Text before arrival, email report" /></label>
            <label className="field"><span>Payment terms</span><input value={form.payment_terms} onChange={(event) => update("payment_terms", event.target.value)} placeholder="External billing in Jobber or QuickBooks" /></label>
          </div>
        </details>

        <div className="ops-actions">
          <button className="button button--primary" type="submit">Create job</button>
          <Link className="button button--secondary" to="/ops/jobs">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function DetailBlock({ title, children }) {
  return (
    <article className="ops-panel card">
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function JobDetailView({ state, profile, job, runAction, onStateChange }) {
  const [scheduleStart, setScheduleStart] = useState(toInputDateTime(job.scheduled_start));
  const [scheduleEnd, setScheduleEnd] = useState(toInputDateTime(job.scheduled_end));
  const [noteText, setNoteText] = useState("");
  const [jobberForm, setJobberForm] = useState({
    jobber_job_id: job.jobber_job_id || "",
    jobber_request_id: job.jobber_request_id || "",
    jobber_url: (state.jobberLinks || []).find((link) => link.local_entity_id === job.id)?.jobber_url || "",
  });
  const notes = (state.jobNotes || []).filter((note) => note.job_id === job.id);
  const checklists = (state.jobChecklists || []).filter((checklist) => checklist.job_id === job.id);
  const history = (state.jobStatusHistory || []).filter((entry) => entry.job_id === job.id);
  const attachments = (state.jobAttachments || []).filter((attachment) => attachment.job_id === job.id);
  const jobberLink = (state.jobberLinks || []).find((link) => link.local_entity_type === "job" && link.local_entity_id === job.id);
  const canDispatch = canDispatchFieldOps(profile);
  const readiness = getJobReadiness(job, state);
  const dispatchPacket = getJobDispatchPacket(job, state);
  const estimate = getJobEstimate(job, state);
  const metadata = getJobMetadataObject(job);
  const fleetSummary = useMemo(() => getFleetTrackingSummary(state), [state]);
  const jobFleetAssets = fleetSummary.trackedAssets.filter((asset) => asset.currentJob?.id === job.id || asset.current_job_id === job.id);
  const operatorFleetAssets = fleetSummary.trackedAssets.filter((asset) => asset.assigned_operator_id && asset.assigned_operator_id === job.assigned_operator_id);
  const relevantFleetAssets = jobFleetAssets.length ? jobFleetAssets : operatorFleetAssets;

  async function quickUpdate(updates, message) {
    await runAction(
      (currentState) => updateFieldOpsJob(job.id, updates, { state: currentState, profile }),
      message,
    );
  }

  async function handleSchedule(event) {
    event.preventDefault();
    await quickUpdate({
      scheduled_start: fromInputDateTime(scheduleStart),
      scheduled_end: fromInputDateTime(scheduleEnd),
      status: job.status === "new_request" || job.status === "qualified" || job.status === "quoted" ? "scheduled" : job.status,
    }, "Schedule updated.");
  }

  async function handleAddNote(event) {
    event.preventDefault();
    if (!noteText.trim()) return;
    const result = await runAction(
      (currentState) => addFieldOpsJobNote(job.id, { note: noteText, visibility: "internal" }, { state: currentState, profile }),
      "Note added.",
    );
    if (result) setNoteText("");
  }

  async function handleChecklistToggle(checklist, itemId, completed) {
    const updated = toggleChecklistItem(checklist, itemId, completed, { userId: profile?.id });
    const result = await runAction(
      (currentState) => updateFieldOpsChecklist(checklist.id, updated, { state: currentState, profile }),
      "Checklist updated.",
    );
    if (result?.state) onStateChange(result.state);
  }

  async function handleChecklistComplete(checklist) {
    const completed = {
      ...checklist,
      items_json: (checklist.items_json || []).map((item) => ({ ...item, completed: true })),
      completed_by: profile?.id || null,
      completed_at: new Date().toISOString(),
    };
    await runAction(
      (currentState) => updateFieldOpsChecklist(checklist.id, completed, { state: currentState, profile }),
      "Checklist completed.",
    );
  }

  async function handleJobberSave(event) {
    event.preventDefault();
    await runAction(
      (currentState) => updateFieldOpsJobberReference(job.id, jobberForm, { state: currentState, profile }),
      "Jobber reference saved.",
    );
  }

  function firstAvailableOperatorId() {
    const workloads = (state.operatorProfiles || []).map((operator) => ({
      operator,
      count: (state.jobs || []).filter((item) => item.assigned_operator_id === operator.id && !["closed", "cancelled"].includes(item.status)).length,
    }));
    return workloads.sort((a, b) => a.count - b.count)[0]?.operator.id || null;
  }

  async function runNextAction(action) {
    if (action === "assign_operator") {
      const operatorId = firstAvailableOperatorId();
      if (operatorId) {
        await quickUpdate({
          assigned_operator_id: operatorId,
          status: ["new_request", "qualified", "quoted", "scheduled"].includes(job.status) ? "operator_assigned" : job.status,
        }, "Assigned first available operator.");
      }
      return;
    }

    if (action === "schedule_job") {
      const start = new Date();
      start.setHours(start.getHours() + 2, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 3);
      await quickUpdate({
        scheduled_start: start.toISOString(),
        scheduled_end: end.toISOString(),
        status: ["new_request", "qualified", "quoted"].includes(job.status) ? "scheduled" : job.status,
      }, "Job scheduled into the next open window.");
      setScheduleStart(toInputDateTime(start.toISOString()));
      setScheduleEnd(toInputDateTime(end.toISOString()));
      return;
    }

    if (action === "complete_preflight") {
      await quickUpdate({ status: "pre_flight" }, "Job moved to pre-flight.");
      return;
    }

    if (action === "flag_invoice") {
      await quickUpdate({ status: "invoice_needed", invoice_needed: true }, "Invoice flag added.");
      return;
    }

    if (action === "capture_completion") {
      await quickUpdate({ status: "needs_review" }, "Job moved to review.");
    }
  }

  function copySummary() {
    const summary = [
      job.title,
      `${job.client_name || "Client TBD"} | ${job.farm_name || "Farm TBD"} | ${job.field_name || "Field TBD"}`,
      `${formatNumber(job.acres)} acres | ${job.crop_type || "Crop TBD"} | ${job.service_type}`,
      `Scheduled: ${formatDate(job.scheduled_start)}`,
      `Operator: ${job.operator_name || "Unassigned"}`,
      `Status: ${formatFieldOpsStatus(job.status)}`,
      job.notes ? `Notes: ${job.notes}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(summary);
  }

  function copyWorkOrder() {
    const workOrder = [
      `WORK ORDER: ${job.title}`,
      `Grower: ${job.client_name || "Client TBD"}`,
      `Farm/Field: ${job.farm_name || "Farm TBD"} / ${job.field_name || "Field TBD"}`,
      `Service: ${job.service_type}`,
      `Acres/Crop: ${formatNumber(job.acres)} acres / ${job.crop_type || "Crop TBD"}`,
      `Product: ${job.application_product || "Product TBD"}`,
      `Schedule: ${formatDate(job.scheduled_start)} - ${formatDate(job.scheduled_end)}`,
      `Operator: ${job.operator_name || "Unassigned"}`,
      `Staging: ${dispatchPacket.flightPlan.stagingArea}`,
      `Access: ${dispatchPacket.flightPlan.accessNotes}`,
      `Customer notes: ${job.notes || "-"}`,
      `Internal notes: ${job.internal_notes || "-"}`,
      `Estimate: ${estimate.subtotal ? formatCurrency(estimate.subtotal) : estimate.quoteStatus}`,
    ].join("\n");
    navigator.clipboard?.writeText(workOrder);
  }

  return (
    <div className="ops-stack">
      <OpsHeader
        title={job.title}
        actions={
          <>
            <button className="button button--secondary" type="button" onClick={copyWorkOrder}>Copy work order</button>
            <Link className="button button--secondary" to="/ops/jobs">Back to jobs</Link>
          </>
        }
      >
        {job.client_name || "Client TBD"} | {formatNumber(job.acres)} acres | {job.service_type}
      </OpsHeader>

      <section className="ops-work-order card">
        <div>
          <span className="ops-eyebrow">Work order</span>
          <h2>{formatFieldOpsStatus(job.status)}</h2>
          <p>{job.client_name || "Client TBD"} | {job.farm_name || "Farm TBD"} | {job.field_name || "Field TBD"}</p>
        </div>
        <div className="ops-work-order__facts">
          <div><span>Scheduled</span><strong>{formatDate(job.scheduled_start)}</strong></div>
          <div><span>Operator</span><strong>{job.operator_name || "Unassigned"}</strong></div>
          <div><span>Service total</span><strong>{estimate.subtotal ? formatCurrency(estimate.subtotal) : estimate.quoteStatus}</strong></div>
          <div><span>Progress</span><strong>{getJobProgress(job)}%</strong></div>
        </div>
        <div className="ops-progress" aria-label={`Job progress ${getJobProgress(job)} percent`}>
          <span style={{ width: `${getJobProgress(job)}%` }} />
        </div>
      </section>

      <section className="ops-two-col">
        <DetailBlock title="Launch readiness">
          <ReadinessPanel readiness={readiness} />
          <div className="ops-actions">
            {["assign_operator", "schedule_job", "complete_preflight", "flag_invoice", "capture_completion"].includes(readiness.nextAction.action) ? (
              <button className="button button--primary button--small" type="button" onClick={() => runNextAction(readiness.nextAction.action)}>{readiness.nextAction.label}</button>
            ) : null}
            <button className="button button--secondary button--small" type="button" onClick={() => quickUpdate({ status: "in_progress" }, "Job moved to in progress.")}>Start job</button>
            <button className="button button--secondary button--small" type="button" onClick={() => quickUpdate({ status: "completed" }, "Job marked complete.")}>Mark complete</button>
          </div>
        </DetailBlock>

        <DetailBlock title="Dispatch packet">
          <DispatchPacket packet={dispatchPacket} />
        </DetailBlock>
      </section>

      <section className="ops-detail-grid">
        <DetailBlock title="Map and boundary">
          <FieldMapPreview job={job} state={state} />
        </DetailBlock>

        <DetailBlock title="Drone location">
          <div className="ops-list">
            {relevantFleetAssets.length ? relevantFleetAssets.map((asset) => (
              <div className={`ops-row ${asset.stale ? "ops-row--warning" : ""}`} key={asset.id}>
                <div>
                  <strong>{asset.name}</strong>
                  <p>{asset.operatorName} | {asset.jobTitle} | {formatFleetAge(asset.lastSeenAt)}</p>
                </div>
                <FleetStatusBadge status={asset.status} />
              </div>
            )) : <p className="ops-muted">No drone is linked yet. Assign an operator, then the operator can check in from the field job view.</p>}
          </div>
          <Link className="button button--secondary button--small" to="/ops/fleet-map">Open fleet map</Link>
        </DetailBlock>

        <DetailBlock title="Overview">
          <div className="ops-detail-list">
            <div><span>Status</span><StatusBadge status={job.status} /></div>
            <div><span>Priority</span><PriorityBadge priority={job.priority} /></div>
            <div><span>Invoice needed</span><strong>{job.invoice_needed || job.status === "invoice_needed" ? "Yes" : "No"}</strong></div>
            <div><span>SOURCE interest</span><strong>{job.source_interest ? "Yes" : "No"}</strong></div>
          </div>
          <div className="ops-actions">
            <button className="button button--secondary button--small" type="button" onClick={copySummary}>Copy summary</button>
            <button className="button button--secondary button--small" type="button" onClick={() => quickUpdate({ status: "completed" }, "Job marked complete.")}>Mark complete</button>
            <button className="button button--primary button--small" type="button" onClick={() => quickUpdate({ status: "invoice_needed", invoice_needed: true }, "Invoice flag added.")}>Flag invoice needed</button>
          </div>
        </DetailBlock>

        <DetailBlock title="Field communication">
          <div className="ops-list">
            <button className="ops-row ops-copy-row" type="button" onClick={() => copyText(buildEtaMessage(job))}>
              <strong>Copy grower ETA text</strong>
              <span>Schedule, operator, and access-change reminder</span>
            </button>
            <button className="ops-row ops-copy-row" type="button" onClick={() => copyText(buildDispatchSummary(job, state))}>
              <strong>Copy operator dispatch summary</strong>
              <span>Contact, field, product, staging, access, weather, and loadout</span>
            </button>
            <button className="ops-row ops-copy-row" type="button" onClick={() => copyText(buildCompletionReport(job, state))}>
              <strong>Copy completion report</strong>
              <span>Closeout summary for internal/customer follow-up</span>
            </button>
          </div>
        </DetailBlock>

        <DetailBlock title="Client info">
          <div className="ops-detail-list">
            <div><span>Name</span><strong>{job.client?.name || "-"}</strong></div>
            <div><span>Email</span><strong>{job.client?.email || "-"}</strong></div>
            <div><span>Phone</span><strong>{job.client?.phone || "-"}</strong></div>
            <div><span>Jobber client</span><strong>{job.client?.jobber_client_id || "Not linked"}</strong></div>
          </div>
        </DetailBlock>

        <DetailBlock title="Estimate and billing">
          <div className="ops-detail-list">
            <div><span>Quote status</span><strong>{estimate.quoteStatus}</strong></div>
            <div><span>Rate</span><strong>{estimate.rate ? `${formatCurrency(estimate.rate)} / acre` : "Manual quote"}</strong></div>
            <div><span>Estimated total</span><strong>{estimate.subtotal ? formatCurrency(estimate.subtotal) : "Manual quote"}</strong></div>
            <div><span>Billing contact</span><strong>{estimate.billingContact || "-"}</strong></div>
            <div><span>Customer PO</span><strong>{estimate.customerPo || "-"}</strong></div>
            <div><span>Payment terms</span><p>{estimate.paymentTerms}</p></div>
          </div>
          <div className="ops-actions">
            <button className="button button--primary button--small" type="button" onClick={() => quickUpdate({ status: "invoice_needed", invoice_needed: true }, "Invoice flag added.")}>Flag invoice</button>
            <Link className="button button--secondary button--small" to="/ops/billing">Billing queue</Link>
          </div>
        </DetailBlock>

        <DetailBlock title="Farm / field">
          <div className="ops-detail-list">
            <div><span>Farm</span><strong>{job.farm_name || "-"}</strong></div>
            <div><span>Field</span><strong>{job.field_name || "-"}</strong></div>
            <div><span>Crop</span><strong>{job.crop_type || "-"}</strong></div>
            <div><span>Boundary</span><strong>{job.field?.boundary_geojson ? "GeoJSON saved" : "Map boundary placeholder"}</strong></div>
          </div>
        </DetailBlock>

        <DetailBlock title="Scheduling">
          <form className="ops-mini-form" onSubmit={handleSchedule}>
            <label className="field"><span>Start</span><input type="datetime-local" value={scheduleStart} onChange={(event) => setScheduleStart(event.target.value)} /></label>
            <label className="field"><span>End</span><input type="datetime-local" value={scheduleEnd} onChange={(event) => setScheduleEnd(event.target.value)} /></label>
            <button className="button button--secondary button--small" type="submit">Save schedule</button>
          </form>
        </DetailBlock>

        <DetailBlock title="Operator assignment">
          <label className="field">
            <span>Assigned operator</span>
            <select value={job.assigned_operator_id || ""} onChange={(event) => quickUpdate({
              assigned_operator_id: event.target.value || null,
              status: event.target.value && ["new_request", "qualified", "quoted", "scheduled"].includes(job.status) ? "operator_assigned" : job.status,
            }, "Operator assignment updated.")} disabled={!canDispatch}>
              <option value="">Unassigned</option>
              {state.operatorProfiles.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
            </select>
          </label>
        </DetailBlock>

        <DetailBlock title="Service details">
          <div className="ops-detail-list">
            <div><span>Service</span><strong>{job.service_type}</strong></div>
            <div><span>Product</span><strong>{job.application_product || "-"}</strong></div>
            <div><span>Customer preference</span><strong>{metadata.customer_preference || "-"}</strong></div>
            <div><span>Next contact</span><p>{metadata.next_contact || "-"}</p></div>
            <div><span>Rate</span><strong>{dispatchPacket.operation.applicationRate || "-"}</strong></div>
            <div><span>Spray volume</span><strong>{dispatchPacket.operation.sprayVolumeGpa ? `${dispatchPacket.operation.sprayVolumeGpa} GPA` : "-"}</strong></div>
            <div><span>Water source</span><strong>{dispatchPacket.operation.waterSource || "-"}</strong></div>
            <div><span>PPE</span><p>{dispatchPacket.operation.ppe || "-"}</p></div>
            <div><span>Requested</span><strong>{job.requested_date || "-"}</strong></div>
            <div><span>Internal notes</span><p>{job.internal_notes || "-"}</p></div>
          </div>
        </DetailBlock>
      </section>

      <section className="ops-detail-grid">
        <DetailBlock title="Notes">
          <form className="ops-mini-form" onSubmit={handleAddNote}>
            <label className="field"><span>Add note</span><textarea rows="3" value={noteText} onChange={(event) => setNoteText(event.target.value)} /></label>
            <button className="button button--secondary button--small" type="submit">Add note</button>
          </form>
          <div className="ops-list">
            {notes.length ? notes.map((note) => (
              <div className="ops-row" key={note.id}><p>{note.note}</p><span>{formatDate(note.created_at)}</span></div>
            )) : <p className="ops-muted">No notes yet.</p>}
          </div>
        </DetailBlock>

        <DetailBlock title="Checklist">
          <div className="ops-checklist-stack">
            {checklists.length ? checklists.map((checklist) => (
              <div className="ops-checklist" key={checklist.id}>
                <div className="ops-checklist__header">
                  <strong>{getChecklistTitle(checklist.checklist_type)}</strong>
                  <button className="button button--secondary button--small" type="button" onClick={() => handleChecklistComplete(checklist)}>Complete all</button>
                </div>
                {(checklist.items_json || []).map((item) => (
                  <label className="ops-checkline" key={item.id}>
                    <input type="checkbox" checked={Boolean(item.completed)} onChange={(event) => handleChecklistToggle(checklist, item.id, event.target.checked)} />
                    {item.label}
                  </label>
                ))}
              </div>
            )) : <p className="ops-muted">No checklist created for this job yet.</p>}
          </div>
        </DetailBlock>

        <DetailBlock title="Attachments">
          {attachments.length ? attachments.map((attachment) => (
            <a className="ops-row" key={attachment.id} href={attachment.file_url} target="_blank" rel="noreferrer">{attachment.file_name}</a>
          )) : <p className="ops-muted">Attachment support is ready; upload UI can be connected when storage is chosen.</p>}
        </DetailBlock>

        <DetailBlock title="Status history">
          <div className="ops-list">
            {history.length ? history.map((entry) => (
              <div className="ops-row" key={entry.id}>
                <strong>{formatFieldOpsStatus(entry.new_status)}</strong>
                <span>{formatDate(entry.changed_at)}</span>
              </div>
            )) : <p className="ops-muted">No status history yet.</p>}
          </div>
        </DetailBlock>

        <DetailBlock title="Relevant SOPs">
          <div className="ops-list">
            {getRelevantSops(job).map((sop) => (
              <a className="ops-row" key={sop.href} href={sop.href}>{sop.label}</a>
            ))}
          </div>
        </DetailBlock>

        <DetailBlock title="Jobber reference">
          <p className="ops-muted">Jobber Status: {job.jobber_job_id || job.jobber_request_id || jobberLink ? "Linked" : "Not Linked"}</p>
          <form className="ops-mini-form" onSubmit={handleJobberSave}>
            <label className="field"><span>Jobber Job ID</span><input value={jobberForm.jobber_job_id} onChange={(event) => setJobberForm((current) => ({ ...current, jobber_job_id: event.target.value }))} /></label>
            <label className="field"><span>Jobber Request ID</span><input value={jobberForm.jobber_request_id} onChange={(event) => setJobberForm((current) => ({ ...current, jobber_request_id: event.target.value }))} /></label>
            <label className="field"><span>External Jobber URL</span><input value={jobberForm.jobber_url} onChange={(event) => setJobberForm((current) => ({ ...current, jobber_url: event.target.value }))} /></label>
            <div className="ops-actions">
              <button className="button button--secondary button--small" type="submit">Save reference</button>
              {jobberForm.jobber_url ? <a className="button button--secondary button--small" href={jobberForm.jobber_url} target="_blank" rel="noreferrer">Open in Jobber</a> : <button className="button button--secondary button--small" type="button" disabled>Open in Jobber</button>}
              <button className="button button--secondary button--small" type="button" disabled>Send to Jobber</button>
              <button className="button button--secondary button--small" type="button" disabled>Sync from Jobber</button>
            </div>
          </form>
        </DetailBlock>
      </section>
    </div>
  );
}

function OpsLeadsView({ state, profile, runAction }) {
  const navigate = useNavigate();
  const [leadData, setLeadData] = useState({ leads: [], mode: "server" });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({ search: "", tier: "all", status: "all", state: "all" });
  const convertedLeadIds = useMemo(
    () => new Set((state.jobs || []).map((job) => job.created_from_lead_id).filter(Boolean)),
    [state.jobs],
  );

  useEffect(() => {
    let mounted = true;
    async function loadLeads() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const result = await getHarvestAdminData();
        if (mounted) setLeadData(result);
      } catch (error) {
        if (mounted) setErrorMessage(error.message || "Unable to load leads.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadLeads();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLeads = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    return (leadData.leads || []).filter((lead) => {
      const searchMatch = !searchText || [
        lead.first_name,
        lead.last_name,
        lead.email,
        lead.phone,
        lead.farm_name,
        lead.state,
        lead.county,
        lead.primary_goal,
        lead.notes,
      ].filter(Boolean).join(" ").toLowerCase().includes(searchText);
      return (
        searchMatch &&
        (filters.tier === "all" || lead.lead_tier === filters.tier) &&
        (filters.status === "all" || lead.status === filters.status) &&
        (filters.state === "all" || lead.state === filters.state)
      );
    });
  }, [filters, leadData.leads]);
  const revenueCommandCenter = useMemo(() => buildRevenueCommandCenter(filteredLeads), [filteredLeads]);
  const states = useMemo(
    () => [...new Set((leadData.leads || []).map((lead) => lead.state).filter(Boolean))].sort(),
    [leadData.leads],
  );
  const statuses = useMemo(
    () => [...new Set((leadData.leads || []).map((lead) => lead.status).filter(Boolean))].sort(),
    [leadData.leads],
  );
  const hotLeads = filteredLeads.filter((lead) => lead.lead_tier === "Hot");
  const unconvertedLeads = filteredLeads.filter((lead) => !convertedLeadIds.has(lead.id));

  async function convertLead(lead) {
    const result = await runAction(
      (currentState) => createOpsJobFromLead(lead, { state: currentState, profile }),
      "Lead converted into an ops job.",
    );
    if (result?.row?.id) {
      navigate(`/ops/jobs/${result.row.id}`);
    }
  }

  function leadName(lead) {
    return [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim() || lead.email || "Grower lead";
  }

  return (
    <div className="ops-stack">
      <OpsHeader
        title="Leads and demand"
        actions={
          <>
            <button className="button button--secondary" type="button" onClick={() => downloadHarvestLeadsCsv(filteredLeads)}>Export CSV</button>
            <Link className="button button--primary" to="/ops/jobs/new">New Job</Link>
          </>
        }
      >
        One intake queue for SOURCE interest, drone application demand, grower follow-up, and conversion into field work.
      </OpsHeader>

      <section className="ops-stat-grid">
        <StatTile label="Leads" value={filteredLeads.length} />
        <StatTile label="Hot leads" value={hotLeads.length} />
        <StatTile label="Unconverted" value={unconvertedLeads.length} />
        <StatTile label="Qualified acres" value={formatNumber(revenueCommandCenter.metrics.qualifiedAcres)} />
        <StatTile label="Pipeline value" value={revenueCommandCenter.metrics.pipelineValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} />
        <StatTile label="Mode" value={leadData.mode === "local" ? "Local" : "Live"} />
      </section>

      <section className="ops-filter-card card">
        <label className="field ops-search-field">
          <span>Search leads</span>
          <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Name, farm, crop, county, notes" />
        </label>
        <label className="field">
          <span>Tier</span>
          <select value={filters.tier} onChange={(event) => setFilters((current) => ({ ...current, tier: event.target.value }))}>
            <option value="all">All tiers</option>
            {["Hot", "Warm", "Nurture", "Low Fit"].map((tier) => <option key={tier} value={tier}>{tier}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="all">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="field">
          <span>State</span>
          <select value={filters.state} onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))}>
            <option value="all">All states</option>
            {states.map((stateOption) => <option key={stateOption} value={stateOption}>{stateOption}</option>)}
          </select>
        </label>
      </section>

      {errorMessage ? <div className="ops-message ops-message--error card">{errorMessage}</div> : null}
      {isLoading ? <div className="ops-loading card">Loading leads...</div> : null}

      {!isLoading ? (
        <section className="ops-two-col">
          <article className="ops-panel card">
            <div className="ops-panel__header">
              <div>
                <span className="ops-eyebrow">SLA</span>
                <h2>Hot leads needing action</h2>
              </div>
            </div>
            <div className="ops-list">
              {revenueCommandCenter.hotLeadSla.length ? revenueCommandCenter.hotLeadSla.slice(0, 6).map((lead) => (
                <Link className="ops-row ops-row--warning" to={`/admin/leads/${lead.id}`} key={lead.id}>
                  <div>
                    <strong>{lead.displayName}</strong>
                    <p>{lead.farmName} | {formatNumber(lead.estimatedAcres)} acres | {lead.hoursOpen}h open</p>
                  </div>
                </Link>
              )) : <EmptyState title="No hot SLA risk">Hot leads are inside the first-touch window.</EmptyState>}
            </div>
          </article>

          <article className="ops-panel card">
            <div className="ops-panel__header">
              <div>
                <span className="ops-eyebrow">Conversion</span>
                <h2>Ready for ops jobs</h2>
              </div>
            </div>
            <div className="ops-list">
              {unconvertedLeads.slice(0, 6).map((lead) => (
                <div className="ops-row" key={lead.id}>
                  <div>
                    <strong>{leadName(lead)}</strong>
                    <p>{lead.farm_name || "Farm TBD"} | {formatNumber(lead.estimated_acres)} acres | {formatCrops(lead.crops)}</p>
                  </div>
                  <button className="button button--primary button--small" type="button" onClick={() => convertLead(lead)}>Create Ops Job</button>
                </div>
              ))}
              {!unconvertedLeads.length ? <EmptyState title="All visible leads converted">New grower demand will appear here.</EmptyState> : null}
            </div>
          </article>
        </section>
      ) : null}

      {!isLoading ? (
        <section className="ops-card-grid">
          {filteredLeads.map((lead) => {
            const isConverted = convertedLeadIds.has(lead.id);
            return (
              <article className="ops-record-card card" key={lead.id}>
                <div className="ops-record-card__top">
                  <div>
                    <strong>{leadName(lead)}</strong>
                    <p>{lead.farm_name || "Farm TBD"} | {[lead.state, lead.county].filter(Boolean).join(" / ") || "Location TBD"}</p>
                  </div>
                  <span className={`ops-link-pill${isConverted ? "" : " ops-link-pill--muted"}`}>{isConverted ? "Ops job created" : "Lead"}</span>
                </div>
                <div className="ops-record-card__stats">
                  <span>{lead.lead_tier || "No tier"}</span>
                  <span>{lead.status || "No status"}</span>
                  <span>{formatNumber(lead.estimated_acres)} acres</span>
                  <span>{formatDateLabel(lead.created_at)}</span>
                </div>
                <p>{lead.primary_goal || lead.notes || "No notes captured yet."}</p>
                <div className="ops-actions">
                  <Link className="button button--secondary button--small" to={`/admin/leads/${lead.id}`}>Open lead</Link>
                  <button className="button button--primary button--small" type="button" disabled={isConverted} onClick={() => convertLead(lead)}>{isConverted ? "Converted" : "Create Ops Job"}</button>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

function ClientsView({ state, profile, runAction }) {
  const [form, setForm] = useState(blankClientForm);
  const [search, setSearch] = useState("");
  const clientRows = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    return state.clients
      .map((client) => {
        const farms = state.farms.filter((farm) => farm.client_id === client.id);
        const fields = state.fields.filter((field) => farms.some((farm) => farm.id === field.farm_id));
        const jobs = state.jobs.filter((job) => job.client_id === client.id).map((job) => enrichOpsJob(job, state));
        const rollup = getClientRollup(client.id, state);
        const nextJob = jobs
          .filter((job) => job.scheduled_start && !["closed", "cancelled"].includes(job.status))
          .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start))[0];
        const lastJob = jobs
          .filter((job) => ["completed", "invoice_needed", "closed"].includes(job.status))
          .sort((a, b) => new Date(b.scheduled_start || b.updated_at) - new Date(a.scheduled_start || a.updated_at))[0];
        return { client, farms, fields, jobs, rollup, nextJob, lastJob };
      })
      .filter((row) => {
        if (!searchText) return true;
        return [
          row.client.name,
          row.client.company_name,
          row.client.email,
          row.client.phone,
          row.client.city,
          row.client.state,
          row.farms.map((farm) => farm.name).join(" "),
          row.fields.map((field) => field.name).join(" "),
        ].filter(Boolean).join(" ").toLowerCase().includes(searchText);
      });
  }, [search, state]);
  const openClientCount = clientRows.filter((row) => row.rollup.openJobs > 0).length;
  const totalClientAcres = clientRows.reduce((sum, row) => sum + row.rollup.totalAcresServiced, 0);

  async function handleCreate(event) {
    event.preventDefault();
    const result = await runAction(
      (currentState) => createFieldOpsRecord("clients", { ...form }, { state: currentState, profile }),
      "Client created.",
    );
    if (result) setForm(blankClientForm);
  }

  return (
    <div className="ops-stack">
      <OpsHeader title="Client and grower records">Keep the grower relationship, farm context, open work, acres serviced, and Jobber reference in one place.</OpsHeader>
      <section className="ops-stat-grid">
        <StatTile label="Growers" value={clientRows.length} />
        <StatTile label="With open work" value={openClientCount} />
        <StatTile label="Serviced acres" value={formatNumber(totalClientAcres)} />
        <StatTile label="Jobber linked" value={clientRows.filter((row) => row.client.jobber_client_id).length} />
      </section>
      <section className="ops-filter-card card">
        <label className="field ops-search-field">
          <span>Find grower, farm, field, phone, or county</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients" />
        </label>
      </section>
      <form className="ops-form card" onSubmit={handleCreate}>
        <h2>Create client</h2>
        <div className="ops-form-grid">
          <label className="field"><span>Name</span><input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label className="field"><span>Company</span><input value={form.company_name} onChange={(event) => setForm((current) => ({ ...current, company_name: event.target.value }))} /></label>
          <label className="field"><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
          <label className="field"><span>Phone</span><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
          <label className="field"><span>City</span><input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} /></label>
          <label className="field"><span>State</span><input value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} /></label>
          <label className="field"><span>ZIP</span><input value={form.zip} onChange={(event) => setForm((current) => ({ ...current, zip: event.target.value }))} /></label>
          <label className="field"><span>Jobber client ID</span><input value={form.jobber_client_id} onChange={(event) => setForm((current) => ({ ...current, jobber_client_id: event.target.value }))} /></label>
          <label className="field field-span-2"><span>Notes</span><textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
        </div>
        <button className="button button--primary" type="submit">Create client</button>
      </form>

      <section className="ops-card-grid">
        {clientRows.map(({ client, farms, fields, rollup, nextJob, lastJob }) => {
          return (
            <Link className="ops-record-card card" to={`/ops/clients/${client.id}`} key={client.id}>
              <div className="ops-record-card__top">
                <div>
                  <strong>{client.name}</strong>
                  <p>{client.email || client.phone || "Contact info missing"}</p>
                </div>
                <span className={client.jobber_client_id ? "ops-link-pill" : "ops-link-pill ops-link-pill--muted"}>{client.jobber_client_id ? "Jobber linked" : "No Jobber"}</span>
              </div>
              <div className="ops-record-card__stats">
                <span>{rollup.openJobs} open</span>
                <span>{rollup.completedJobs} complete</span>
                <span>{farms.length} farms</span>
                <span>{fields.length} fields</span>
                <span>{formatNumber(rollup.totalAcresServiced)} acres</span>
              </div>
              <div className="ops-client-quicklook">
                <span>Next: {nextJob ? `${formatDate(nextJob.scheduled_start)} | ${nextJob.title}` : "No scheduled work"}</span>
                <span>Last: {lastJob ? `${formatDate(lastJob.scheduled_start)} | ${lastJob.service_type}` : "No completed work"}</span>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

function ClientDetailView({ state, client }) {
  const farms = state.farms.filter((farm) => farm.client_id === client.id);
  const fields = state.fields.filter((field) => farms.some((farm) => farm.id === field.farm_id));
  const jobs = state.jobs.filter((job) => job.client_id === client.id).map((job) => enrichOpsJob(job, state));
  const rollup = getClientRollup(client.id, state);

  return (
    <div className="ops-stack">
      <OpsHeader title={client.name} actions={<Link className="button button--secondary" to="/ops/clients">Back to clients</Link>}>
        {client.company_name || "Grower"} | {client.email || client.phone || "Contact info missing"}
      </OpsHeader>
      <section className="ops-stat-grid">
        <StatTile label="Open jobs" value={rollup.openJobs} />
        <StatTile label="Completed jobs" value={rollup.completedJobs} />
        <StatTile label="Acres serviced" value={formatNumber(rollup.totalAcresServiced)} />
        <StatTile label="SOURCE interest" value={rollup.sourceInterest ? "Yes" : "No"} />
      </section>
      <section className="ops-detail-grid">
        <DetailBlock title="Contact">
          <div className="ops-detail-list">
            <div><span>Email</span><strong>{client.email || "-"}</strong></div>
            <div><span>Phone</span><strong>{client.phone || "-"}</strong></div>
            <div><span>Location</span><strong>{[client.city, client.state, client.zip].filter(Boolean).join(", ") || "-"}</strong></div>
            <div><span>Jobber client</span><strong>{client.jobber_client_id || "Not linked"}</strong></div>
            <div><span>Notes</span><p>{client.notes || "-"}</p></div>
          </div>
        </DetailBlock>
        <DetailBlock title="Farms">
          <div className="ops-list">{farms.map((farm) => <div className="ops-row" key={farm.id}><strong>{farm.name}</strong><span>{[farm.city, farm.state].filter(Boolean).join(", ")}</span></div>)}</div>
        </DetailBlock>
        <DetailBlock title="Fields">
          <div className="ops-list">{fields.map((field) => <div className="ops-row" key={field.id}><strong>{field.name}</strong><span>{formatNumber(field.acres)} acres | {field.crop_type || field.crop || "Crop TBD"}</span></div>)}</div>
        </DetailBlock>
        <DetailBlock title="Jobs">
          <div className="ops-list">{jobs.map((job) => <Link className="ops-row" to={`/ops/jobs/${job.id}`} key={job.id}><strong>{job.title}</strong><StatusBadge status={job.status} /></Link>)}</div>
        </DetailBlock>
      </section>
    </div>
  );
}

function FarmsView({ state, profile, runAction }) {
  const [form, setForm] = useState(blankFarmFieldForm);

  async function handleSubmit(event) {
    event.preventDefault();
    await runAction(async (currentState) => {
      const boundary = parseBoundaryGeoJsonInput(form.boundary_geojson);
      const farmResult = await createFieldOpsRecord("farms", {
        client_id: form.client_id,
        name: form.farm_name,
        address_line_1: form.address_line_1 || null,
        city: form.city || null,
        state: form.state || null,
        zip: form.zip || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        notes: form.notes || null,
      }, { state: currentState, profile });
      const fieldResult = await createFieldOpsRecord("fields", {
        farm_id: farmResult.row.id,
        name: form.field_name,
        crop: form.crop_type || null,
        crop_type: form.crop_type || null,
        acres: form.acres ? Number(form.acres) : null,
        boundary_geojson: boundary,
        notes: form.notes || null,
      }, { state: farmResult.state, profile });
      return fieldResult;
    }, "Farm and field created.");
    setForm(blankFarmFieldForm);
  }

  return (
    <div className="ops-stack">
      <OpsHeader title="Farms and fields">Fields are the acreage unit Harvest Drone actually schedules, flies, and reports against.</OpsHeader>
      <form className="ops-form card" onSubmit={handleSubmit}>
        <h2>Create farm and field</h2>
        <div className="ops-form-grid">
          <label className="field">
            <span>Client</span>
            <select required value={form.client_id} onChange={(event) => setForm((current) => ({ ...current, client_id: event.target.value }))}>
              <option value="">Select client</option>
              {state.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Farm name</span><input required value={form.farm_name} onChange={(event) => setForm((current) => ({ ...current, farm_name: event.target.value }))} /></label>
          <label className="field"><span>Address</span><input value={form.address_line_1} onChange={(event) => setForm((current) => ({ ...current, address_line_1: event.target.value }))} /></label>
          <label className="field"><span>City</span><input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} /></label>
          <label className="field"><span>State</span><input value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} /></label>
          <label className="field"><span>ZIP</span><input value={form.zip} onChange={(event) => setForm((current) => ({ ...current, zip: event.target.value }))} /></label>
          <label className="field"><span>Latitude</span><input inputMode="decimal" value={form.latitude} onChange={(event) => setForm((current) => ({ ...current, latitude: event.target.value }))} placeholder="44.446" /></label>
          <label className="field"><span>Longitude</span><input inputMode="decimal" value={form.longitude} onChange={(event) => setForm((current) => ({ ...current, longitude: event.target.value }))} placeholder="-95.790" /></label>
          <label className="field"><span>Field name</span><input required value={form.field_name} onChange={(event) => setForm((current) => ({ ...current, field_name: event.target.value }))} /></label>
          <label className="field"><span>Crop</span><input value={form.crop_type} onChange={(event) => setForm((current) => ({ ...current, crop_type: event.target.value }))} /></label>
          <label className="field"><span>Acres</span><input inputMode="decimal" value={form.acres} onChange={(event) => setForm((current) => ({ ...current, acres: event.target.value }))} /></label>
          <label className="field field-span-2"><span>Boundary GeoJSON</span><textarea rows="4" value={form.boundary_geojson} onChange={(event) => setForm((current) => ({ ...current, boundary_geojson: event.target.value }))} placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[...]}}' /></label>
          <label className="field field-span-2"><span>Notes / access / hazards</span><textarea rows="3" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Gate, staging, trees, ditches, irrigation pivots, no-spray buffers." /></label>
        </div>
        <button className="button button--primary" type="submit">Create farm and field</button>
      </form>
      <section className="ops-card-grid">
        {state.farms.map((farm) => {
          const client = state.clients.find((item) => item.id === farm.client_id);
          const fields = state.fields.filter((field) => field.farm_id === farm.id);
          return (
            <article className="ops-record-card card" key={farm.id}>
              <strong>{farm.name}</strong>
              <p>{client?.name || "Client TBD"} | {[farm.city, farm.state].filter(Boolean).join(", ")}</p>
              <FieldMapPreview farm={farm} field={fields[0]} compact showActions={false} />
              <div className="ops-list">
                {fields.map((field) => <div className="ops-row" key={field.id}><span>{field.name}</span><strong>{formatNumber(field.acres)} acres</strong></div>)}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function ScheduleView({ state, jobs, profile, runAction }) {
  const commandCenter = useMemo(() => getDailyOpsCommandCenter({ ...state, jobs }), [jobs, state]);
  const today = new Date().toDateString();
  const todayJobs = jobs.filter((job) => job.scheduled_start && new Date(job.scheduled_start).toDateString() === today);
  const weekEnd = Date.now() + 7 * 86400000;
  const weekJobs = jobs.filter((job) => job.scheduled_start && new Date(job.scheduled_start).getTime() <= weekEnd && new Date(job.scheduled_start).getTime() >= Date.now() - 86400000);
  const unscheduled = jobs.filter((job) => !job.scheduled_start && !["completed", "invoice_needed", "closed", "cancelled"].includes(job.status));

  async function updateSchedule(job, updates) {
    await runAction(
      (currentState) => updateFieldOpsJob(job.id, updates, { state: currentState, profile }),
      "Schedule updated.",
    );
  }

  function ScheduleRow({ job }) {
    const [start, setStart] = useState(toInputDateTime(job.scheduled_start));
    const readiness = getJobReadiness(job, state);
    return (
      <div className="ops-schedule-row">
        <div>
          <strong>{job.title}</strong>
          <p>{job.client_name} | {formatNumber(job.acres)} acres | {job.operator_name || "Unassigned"}</p>
          <ReadinessBadge readiness={readiness} />
        </div>
        <input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
        <select value={job.assigned_operator_id || ""} onChange={(event) => updateSchedule(job, { assigned_operator_id: event.target.value || null, status: event.target.value ? "operator_assigned" : job.status })}>
          <option value="">Unassigned</option>
          {state.operatorProfiles.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
        </select>
        <select value={job.status} onChange={(event) => updateSchedule(job, { status: event.target.value })}>
          {FIELD_OPS_JOB_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
        </select>
        <button className="button button--secondary button--small" type="button" onClick={() => updateSchedule(job, { scheduled_start: fromInputDateTime(start), status: job.status === "new_request" ? "scheduled" : job.status })}>Save</button>
      </div>
    );
  }

  return (
    <div className="ops-stack">
      <OpsHeader title="Schedule">Today, this week, and unscheduled jobs without needing a heavy calendar.</OpsHeader>
      <section className="ops-command-grid">
        <article className="ops-panel card">
          <span className="ops-eyebrow">Today</span>
          <h2>{formatNumber(commandCenter.scheduledAcresToday)} acres scheduled</h2>
          <div className="ops-loadout">
            {commandCenter.loadoutItems.slice(0, 8).map((item) => <span key={item}>{item}</span>)}
          </div>
        </article>
        <article className="ops-panel card">
          <span className="ops-eyebrow">Weather windows</span>
          <div className="ops-list">
            {commandCenter.weatherCards.length ? commandCenter.weatherCards.map((weather) => (
              <div className="ops-row" key={weather.jobId}>
                <div>
                  <strong>{weather.label}</strong>
                  <p>{weather.jobTitle} | wind {weather.windMph || "-"} mph, gust {weather.gustMph || "-"} mph, limit {weather.windLimitMph || "-"} mph</p>
                </div>
                <span>{weather.rainWindow || "Rain window TBD"}</span>
              </div>
            )) : <p className="ops-muted">No weather-sensitive jobs scheduled today.</p>}
          </div>
        </article>
      </section>
      <section className="ops-schedule-grid">
        <article className="ops-panel card">
          <h2>Today</h2>
          <div className="ops-list">{todayJobs.length ? todayJobs.map((job) => <ScheduleRow key={job.id} job={job} />) : <EmptyState title="No jobs today" />}</div>
        </article>
        <article className="ops-panel card">
          <h2>This week</h2>
          <div className="ops-list">{weekJobs.length ? weekJobs.map((job) => <ScheduleRow key={job.id} job={job} />) : <EmptyState title="No jobs this week" />}</div>
        </article>
        <article className="ops-panel card">
          <h2>Unscheduled</h2>
          <div className="ops-list">{unscheduled.length ? unscheduled.map((job) => <ScheduleRow key={job.id} job={job} />) : <EmptyState title="No unscheduled active jobs" />}</div>
        </article>
      </section>
    </div>
  );
}

function BillingView({ state, jobs, profile, runAction }) {
  const billingJobs = jobs
    .filter((job) => job.invoice_needed || BILLING_OPEN_STATUSES.includes(job.status))
    .sort((a, b) => new Date(b.scheduled_start || b.updated_at || b.created_at) - new Date(a.scheduled_start || a.updated_at || a.created_at));
  const readyJobs = billingJobs.filter((job) => job.invoice_needed || job.status === "invoice_needed");
  const completedNeedsFlag = billingJobs.filter((job) => job.status === "completed" && !job.invoice_needed);
  const missingJobber = billingJobs.filter((job) => !job.jobber_job_id && !job.jobber_request_id);
  const estimatedTotal = billingJobs.reduce((sum, job) => sum + Number(getJobEstimate(job, state).subtotal || 0), 0);
  const serviceTotals = state.services.map((service) => {
    const serviceJobs = billingJobs.filter((job) => job.service_type === service.name);
    return {
      service,
      jobs: serviceJobs.length,
      acres: serviceJobs.reduce((sum, job) => sum + Number(job.acres || 0), 0),
      estimate: serviceJobs.reduce((sum, job) => sum + Number(getJobEstimate(job, state).subtotal || 0), 0),
    };
  }).filter((row) => row.jobs);

  async function updateBilling(job, updates, message) {
    await runAction(
      (currentState) => updateFieldOpsJob(job.id, updates, { state: currentState, profile }),
      message,
    );
  }

  return (
    <div className="ops-stack">
      <OpsHeader
        title="Billing handoff"
        actions={<Link className="button button--primary" to="/ops/jobs">Open job list</Link>}
      >
        A simple external-billing queue for completed work, invoice flags, Jobber references, and QuickBooks handoff.
      </OpsHeader>

      <section className="ops-stat-grid">
        <StatTile label="In billing queue" value={billingJobs.length} />
        <StatTile label="Ready to invoice" value={readyJobs.length} />
        <StatTile label="Needs invoice flag" value={completedNeedsFlag.length} />
        <StatTile label="Missing Jobber" value={missingJobber.length} />
        <StatTile label="Estimated total" value={formatCurrency(estimatedTotal)} />
        <StatTile label="Acres" value={formatNumber(billingJobs.reduce((sum, job) => sum + Number(job.acres || 0), 0))} />
      </section>

      <section className="ops-two-col">
        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Queue</span>
              <h2>External billing next actions</h2>
            </div>
          </div>
          <div className="ops-list">
            {billingJobs.length ? billingJobs.map((job) => {
              const estimate = getJobEstimate(job, state);
              return (
                <article className="ops-row" key={job.id}>
                  <div>
                    <strong>{job.title}</strong>
                    <p>{job.client_name || "Client TBD"} | {formatNumber(job.acres)} acres | {estimate.subtotal ? formatCurrency(estimate.subtotal) : estimate.quoteStatus}</p>
                    <span>{job.jobber_job_id || job.jobber_request_id ? `Jobber ${job.jobber_job_id || job.jobber_request_id}` : "No Jobber reference"}</span>
                  </div>
                  <div className="ops-actions">
                    <Link className="button button--secondary button--small" to={`/ops/jobs/${job.id}`}>Open</Link>
                    {job.status === "completed" && !job.invoice_needed ? (
                      <button className="button button--primary button--small" type="button" onClick={() => updateBilling(job, { status: "invoice_needed", invoice_needed: true }, "Invoice flag added.")}>Flag invoice</button>
                    ) : null}
                    {job.invoice_needed || job.status === "invoice_needed" ? (
                      <button className="button button--secondary button--small" type="button" onClick={() => updateBilling(job, { status: "closed", invoice_needed: false }, "Job closed after external billing handoff.")}>Close</button>
                    ) : null}
                  </div>
                </article>
              );
            }) : <EmptyState title="Billing queue clear">Completed and invoice-needed work will appear here.</EmptyState>}
          </div>
        </article>

        <article className="ops-panel card">
          <div className="ops-panel__header">
            <div>
              <span className="ops-eyebrow">Service totals</span>
              <h2>What needs handoff</h2>
            </div>
          </div>
          <div className="ops-list">
            {serviceTotals.length ? serviceTotals.map((row) => (
              <div className="ops-row" key={row.service.id}>
                <div>
                  <strong>{row.service.name}</strong>
                  <p>{row.jobs} jobs | {formatNumber(row.acres)} acres</p>
                </div>
                <span>{row.estimate ? formatCurrency(row.estimate) : "Manual quote"}</span>
              </div>
            )) : <EmptyState title="No service totals">Totals appear when completed work enters billing.</EmptyState>}
          </div>
        </article>
      </section>
    </div>
  );
}

function SettingsView({ state, profile, runAction }) {
  const [operatorForm, setOperatorForm] = useState({ name: "", email: "", phone: "", certification_status: "current", service_regions: "" });

  async function addOperator(event) {
    event.preventDefault();
    const result = await runAction(
      (currentState) => createFieldOpsRecord("operatorProfiles", {
        name: operatorForm.name,
        email: operatorForm.email || null,
        phone: operatorForm.phone || null,
        certification_status: operatorForm.certification_status,
        service_regions: operatorForm.service_regions.split(",").map((item) => item.trim()).filter(Boolean),
        active: true,
      }, { state: currentState, profile }),
      "Operator added.",
    );
    if (result) setOperatorForm({ name: "", email: "", phone: "", certification_status: "current", service_regions: "" });
  }

  return (
    <div className="ops-stack">
      <OpsHeader title="Field ops settings">Simple defaults and placeholders for the integrations that come after the daily workflow works.</OpsHeader>
      <section className="ops-detail-grid">
        <DetailBlock title="Default services">
          <div className="ops-list">
            {state.services.map((service) => (
              <div className="ops-row" key={service.id}>
                <div><strong>{service.name}</strong><p>{service.description}</p></div>
                <span>{service.default_rate_per_acre ? `$${service.default_rate_per_acre}/acre` : "No default rate"}</span>
              </div>
            ))}
          </div>
        </DetailBlock>
        <DetailBlock title="Default job statuses">
          <div className="ops-chip-list">{FIELD_OPS_JOB_STATUSES.map((status) => <StatusBadge key={status.id} status={status.id} />)}</div>
        </DetailBlock>
        <DetailBlock title="Operator management">
          <form className="ops-mini-form" onSubmit={addOperator}>
            <label className="field"><span>Name</span><input required value={operatorForm.name} onChange={(event) => setOperatorForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="field"><span>Email</span><input type="email" value={operatorForm.email} onChange={(event) => setOperatorForm((current) => ({ ...current, email: event.target.value }))} /></label>
            <label className="field"><span>Phone</span><input value={operatorForm.phone} onChange={(event) => setOperatorForm((current) => ({ ...current, phone: event.target.value }))} /></label>
            <label className="field"><span>Service regions</span><input value={operatorForm.service_regions} onChange={(event) => setOperatorForm((current) => ({ ...current, service_regions: event.target.value }))} placeholder="Lyon County, Redwood County" /></label>
            <button className="button button--secondary button--small" type="submit">Add operator</button>
          </form>
        </DetailBlock>
        <DetailBlock title="Checklist templates">
          <div className="ops-list">
            {Object.entries(DEFAULT_CHECKLIST_TEMPLATES).map(([type, items]) => (
              <div className="ops-row" key={type}><strong>{getChecklistTitle(type)}</strong><span>{items.length} items</span></div>
            ))}
          </div>
        </DetailBlock>
        <DetailBlock title="Jobber integration">
          <p className="ops-muted">Manual Jobber IDs are active. Send to Jobber, sync from Jobber, and OAuth remain placeholders for the next integration phase.</p>
        </DetailBlock>
        <DetailBlock title="System tools">
          <div className="ops-list">
            <Link className="ops-row" to="/admin/integrations"><strong>Integrations</strong><span>Google, Jobber, Twilio readiness</span></Link>
            <Link className="ops-row" to="/admin/integration-events"><strong>Integration event log</strong><span>Webhook and sync visibility</span></Link>
            <Link className="ops-row" to="/admin/open-loops"><strong>Open loops</strong><span>Follow-ups from connected tools</span></Link>
            <Link className="ops-row" to="/admin/academy"><strong>Academy admin</strong><span>Training content management</span></Link>
          </div>
        </DetailBlock>
        <DetailBlock title="Local demo data">
          <button className="button button--secondary button--small" type="button" onClick={() => runAction(() => ({ state: resetLocalFieldOpsState() }), "Local demo data reset.")}>Reset local demo data</button>
        </DetailBlock>
      </section>
    </div>
  );
}

function FieldOpsPage({ view = "dashboard" }) {
  const params = useParams();
  const data = useFieldOpsData();
  const { state, setState, isLoading, message, errorMessage, runAction, profile } = data;
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  usePageMeta({
    title: "Harvest Drone Field Ops",
    description: "Internal field operations workspace for Harvest Drone.",
  });

  const role = getFieldOpsRole(profile);
  const jobs = useMemo(
    () => (state?.jobs || []).map((job) => enrichOpsJob(job, state)),
    [state],
  );
  const selectedJob = jobs.find((job) => job.id === params.jobId);
  const selectedClient = state?.clients?.find((client) => client.id === params.clientId);

  async function handleStatusChange(job, status) {
    await runAction(
      (currentState) => updateFieldOpsJob(job.id, { status, invoice_needed: status === "invoice_needed" ? true : job.invoice_needed }, { state: currentState, profile }),
      "Job status updated.",
    );
  }

  async function handleAssign(job, operatorId) {
    await runAction(
      (currentState) => updateFieldOpsJob(job.id, {
        assigned_operator_id: operatorId,
        status: operatorId && ["new_request", "qualified", "quoted", "scheduled"].includes(job.status) ? "operator_assigned" : job.status,
      }, { state: currentState, profile }),
      "Operator assignment updated.",
    );
  }

  if (isLoading) {
    return (
      <Shell compact>
        <section className="field-ops"><div className="card ops-loading">Loading field operations...</div></section>
      </Shell>
    );
  }

  if (!state) {
    return (
      <Shell compact>
        <section className="field-ops"><div className="card ops-loading">{errorMessage || "Field operations could not load."}</div></section>
      </Shell>
    );
  }

  let content;
  if (view === "jobs") {
    content = <JobsView state={state} jobs={jobs} filters={filters} setFilters={setFilters} onStatusChange={handleStatusChange} onAssign={handleAssign} />;
  } else if (view === "today") {
    content = <TodayView state={state} jobs={jobs} profile={profile} runAction={runAction} />;
  } else if (view === "maps") {
    content = <MapsView state={state} jobs={jobs} />;
  } else if (view === "fleet-map") {
    content = <FleetMapView state={state} jobs={jobs} />;
  } else if (view === "guide") {
    content = <OpsGuideView />;
  } else if (view === "leads") {
    content = <OpsLeadsView state={state} profile={profile} runAction={runAction} />;
  } else if (view === "funnels") {
    content = <SalesFunnelsView />;
  } else if (view === "daily-agent") {
    content = <DailyAgentView />;
  } else if (view === "new-job") {
    content = <NewJobView state={state} profile={profile} runAction={runAction} />;
  } else if (view === "job-detail") {
    content = selectedJob
      ? <JobDetailView state={state} profile={profile} job={selectedJob} runAction={runAction} onStateChange={setState} />
      : <EmptyState title="Job not found">The job may have been removed or is outside your access.</EmptyState>;
  } else if (view === "clients") {
    content = <ClientsView state={state} profile={profile} runAction={runAction} />;
  } else if (view === "client-detail") {
    content = selectedClient
      ? <ClientDetailView state={state} client={selectedClient} />
      : <EmptyState title="Client not found">The client may have been removed or is outside your access.</EmptyState>;
  } else if (view === "farms") {
    content = <FarmsView state={state} profile={profile} runAction={runAction} />;
  } else if (view === "schedule") {
    content = <ScheduleView state={state} jobs={jobs} profile={profile} runAction={runAction} />;
  } else if (view === "billing") {
    content = <BillingView state={state} jobs={jobs} profile={profile} runAction={runAction} />;
  } else if (view === "settings") {
    content = <SettingsView state={state} profile={profile} runAction={runAction} />;
  } else {
    content = <DashboardView state={state} jobs={jobs} onStatusChange={handleStatusChange} role={role} />;
  }

  return (
    <Shell compact>
      <section className="field-ops">
        <div className="ops-shell">
          <aside className="ops-sidebar card">
            <div>
              <span className="ops-eyebrow">Harvest Drone</span>
              <h2>Ops</h2>
              <p>{role === "operator" ? "Assigned job workspace" : "Daily work, records, and training"}</p>
            </div>
            <OpsNav role={role} />
            <OpsQuickSearch state={state} />
          </aside>
          <main className="ops-main">
            {message ? <div className="ops-message card">{message}</div> : null}
            {errorMessage ? <div className="ops-message ops-message--error card">{errorMessage}</div> : null}
            {content}
          </main>
        </div>
      </section>
    </Shell>
  );
}

export default FieldOpsPage;
