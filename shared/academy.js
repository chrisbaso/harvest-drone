export const ACADEMY_CATEGORIES = [
  "Start Here",
  "Operator Training",
  "SOURCE Education",
  "Drone Safety",
  "Field Operations",
  "Enterprise Playbooks",
  "SOP Library",
  "Certification",
];

export const ACADEMY_CERTIFICATION_STATUSES = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  READY_FOR_FIELD_REVIEW: "Ready for Field Review",
  CERTIFIED: "Certified",
};

export const academySeedModules = [
  {
    id: "academy-start-here",
    slug: "start-here",
    title: "Start Here: Harvest Drone OS Academy",
    description: "Orientation for operators, managers, and enterprise stakeholders using Harvest Drone OS.",
    category: "Start Here",
    estimatedMinutes: 18,
    assignedRoles: ["operator", "dealer", "network_manager", "admin"],
    certificationRequired: true,
    sortOrder: 1,
    lessons: [
      {
        id: "academy-start-here-1",
        title: "How the Academy works",
        description: "Understand assigned modules, SOP evidence, completion tracking, and field review requirements.",
        estimatedMinutes: 8,
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        content:
          "Harvest Drone OS Academy is the operating training hub for safe, documented drone application work. Operators complete assigned modules, review SOPs, pass readiness gates, and move toward field review before certification.",
      },
      {
        id: "academy-start-here-2",
        title: "Your certification path",
        description: "See how training progress turns into certification readiness.",
        estimatedMinutes: 10,
        content:
          "Certification moves from Not Started to In Progress, then Ready for Field Review after training completion. A lead operator or admin moves the operator to Certified after field review.",
      },
    ],
    resources: [
      { id: "resource-academy-map", title: "Academy onboarding map", type: "PDF", category: "Field Guides", url: "/docs/rdo-pilot-readiness-checklist.md" },
    ],
    completionChecklist: ["Review dashboard", "Open assigned module", "Understand certification states"],
  },
  {
    id: "academy-operator-foundations",
    slug: "operator-foundations",
    title: "Hylio Operator Foundations",
    description: "Core operator onboarding linked to the Harvest-authored Hylio training content already in the repo.",
    category: "Operator Training",
    estimatedMinutes: 92,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 2,
    lessons: [
      {
        id: "academy-operator-foundations-1",
        title: "Harvest Drone operating model",
        description: "Training as an operating gate for safe, documented Hylio work.",
        estimatedMinutes: 18,
        videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
        contentPath: "content/training/hylio/00-orientation.mdx",
        content:
          "Harvest-qualified operators are expected to stop work when legal, aircraft, weather, chemical, or site conditions are not ready.",
      },
      {
        id: "academy-operator-foundations-2",
        title: "Compliance foundations",
        description: "Part 107, Part 137, 44807, Remote ID, pesticide licensing, and credential evidence.",
        estimatedMinutes: 40,
        contentPath: "content/training/hylio/01-compliance-foundations.mdx",
        content:
          "Operators must verify current federal, state, tribal, territorial, pesticide, insurance, and aircraft requirements before assignment.",
      },
      {
        id: "academy-operator-foundations-3",
        title: "Aircraft and GroundLink overview",
        description: "Hardware handling, official Hylio references, and Harvest evidence expectations.",
        estimatedMinutes: 34,
        contentPath: "content/training/hylio/02-hylio-hardware-groundlink.mdx",
        content:
          "Use official Hylio materials for hardware specifics while Harvest OS tracks readiness, evidence, and supervisor signoff.",
      },
    ],
    resources: [
      { id: "resource-hylio-course", title: "Full Hylio Operator Foundations course", type: "Course", category: "Operator Training", url: "/training/courses/hylio-operator-foundations" },
      { id: "resource-operator-qualification", title: "Operator Qualification Gate", type: "Review", category: "Certification", url: "/training/qualification" },
    ],
    completionChecklist: ["Operating model reviewed", "Compliance foundations reviewed", "Aircraft overview reviewed"],
  },
  {
    id: "academy-drone-safety",
    slug: "drone-safety-compliance",
    title: "Drone Safety & Compliance",
    description: "Part 107 readiness, aircraft registration, Remote ID, site safety, and pre-flight discipline.",
    category: "Drone Safety",
    estimatedMinutes: 55,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 3,
    lessons: [
      {
        id: "academy-drone-safety-1",
        title: "Commercial drone operating rules",
        description: "What operators must verify before commercial agricultural UAS work.",
        estimatedMinutes: 16,
        videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
        content:
          "Operators must keep Part 107 current, follow site-specific flight controls, document aircraft readiness, and stop work when weather, aircraft, product, or personnel conditions are not safe.",
      },
      {
        id: "academy-drone-safety-2",
        title: "Pre-flight checklist discipline",
        description: "The checklist is an operating control, not a paperwork step.",
        estimatedMinutes: 18,
        content:
          "Pre-flight review confirms aircraft condition, batteries, payload, field boundaries, obstacles, weather, emergency landing zones, and communication plan before launch.",
      },
      {
        id: "academy-drone-safety-3",
        title: "Emergency stop-work criteria",
        description: "When to pause, land, isolate the area, and escalate.",
        estimatedMinutes: 21,
        content:
          "Operators pause or abort when aircraft state is uncertain, wind exceeds limits, people enter the work area, product label constraints are not met, or equipment behaves abnormally.",
      },
    ],
    resources: [
      { id: "resource-preflight-sop", title: "Drone Pre-Flight SOP", type: "SOP", category: "SOPs & Procedures", url: "/training/checklists/hylio-preflight-checklist" },
      { id: "resource-emergency-sop", title: "Emergency Procedures", type: "SOP", category: "Safety Documents", url: "/training/checklists/emergency-response" },
    ],
    completionChecklist: ["Part 107 status reviewed", "Pre-flight SOP reviewed", "Emergency criteria acknowledged"],
  },
  {
    id: "academy-field-ops",
    slug: "field-operations-basics",
    title: "Field Operations Basics",
    description: "Field mapping, weather decisions, product application windows, and job closeout.",
    category: "Field Operations",
    estimatedMinutes: 64,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 4,
    lessons: [
      {
        id: "academy-field-ops-1",
        title: "Field mapping and boundaries",
        description: "Create accurate field maps for safe and effective coverage.",
        estimatedMinutes: 14,
        videoUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
        content:
          "Accurate field maps include boundary confirmation, obstacle marking, sensitive areas, buffer zones, product constraints, and safe access/staging locations.",
      },
      {
        id: "academy-field-ops-2",
        title: "Weather and drift review",
        description: "Evaluate wind, precipitation, inversion risk, and label restrictions.",
        estimatedMinutes: 18,
        content:
          "Weather review protects crop quality, neighbors, operators, and the customer relationship. Wind, gusts, precipitation, temperature, humidity, and inversion risk are recorded before application.",
      },
      {
        id: "academy-field-ops-3",
        title: "Application closeout",
        description: "Capture acres, product, weather, anomalies, and post-flight inspection.",
        estimatedMinutes: 16,
        content:
          "Closeout creates the audit trail: flight duration, actual acres sprayed, product applied, weather, anomalies, maintenance issues, and post-flight checklist completion.",
      },
    ],
    resources: [
      { id: "resource-weather-guide", title: "Weather Minimums Guide", type: "PDF", category: "Field Guides", url: "/training/checklists/drift-weather-review" },
      { id: "resource-postflight", title: "Post-Flight Checklist", type: "SOP", category: "SOPs & Procedures", url: "/training/checklists/hylio-postflight-checklist" },
    ],
    completionChecklist: ["Boundary workflow reviewed", "Weather gate reviewed", "Post-flight closeout reviewed"],
  },
  {
    id: "academy-source",
    slug: "source-education",
    title: "SOURCE Product Education",
    description: "How SOURCE fits into the Harvest Drone sales and education workflow.",
    category: "SOURCE Education",
    estimatedMinutes: 42,
    assignedRoles: ["operator", "dealer", "network_manager", "admin"],
    certificationRequired: false,
    sortOrder: 5,
    lessons: [
      {
        id: "academy-source-1",
        title: "SOURCE mode of action",
        description: "A practical explanation for operators and grower-facing teams.",
        estimatedMinutes: 15,
        content:
          "SOURCE education helps teams explain biological nutrient efficiency, field fit, expectations, and when to route questions to agronomy support.",
      },
      {
        id: "academy-source-2",
        title: "Sample and acre review workflow",
        description: "How SOURCE education connects to lead capture and follow-up.",
        estimatedMinutes: 13,
        content:
          "Harvest Drone OS connects SOURCE education to grower funnel activity, acre reviews, order readiness, and follow-up tasks.",
      },
    ],
    resources: [
      { id: "resource-source-mode", title: "SOURCE Mode of Action", type: "PDF", category: "SOURCE Education", url: "/source" },
      { id: "resource-source-tank", title: "SOURCE Tank Mix Guidelines", type: "PDF", category: "SOURCE Education", url: "/docs/source-acre-review-design-system.md" },
    ],
    completionChecklist: ["SOURCE positioning reviewed", "Grower workflow reviewed"],
  },
  {
    id: "academy-enterprise",
    slug: "enterprise-playbooks",
    title: "Enterprise Deployment Playbooks",
    description: "Operating model, RDO-style rollout, network reporting, and executive compliance views.",
    category: "Enterprise Playbooks",
    estimatedMinutes: 46,
    assignedRoles: ["dealer", "network_manager", "admin"],
    certificationRequired: false,
    sortOrder: 6,
    lessons: [
      {
        id: "academy-enterprise-1",
        title: "Enterprise drone division operating model",
        description: "How an enterprise team runs fleet, operators, schedule, records, and support.",
        estimatedMinutes: 20,
        content:
          "Enterprise drone programs need standardized training, aircraft readiness, field scheduling, compliance records, support workflows, and executive reporting.",
      },
      {
        id: "academy-enterprise-2",
        title: "RDO pilot rollout checklist",
        description: "A staged rollout from demo readiness to live pilot operations.",
        estimatedMinutes: 18,
        content:
          "A pilot rollout starts with qualified operators, ready aircraft, selected fields, confirmed product windows, compliance record workflow, and management reporting.",
      },
    ],
    resources: [
      { id: "resource-enterprise-demo", title: "RDO Enterprise Demo Runbook", type: "Guide", category: "Enterprise Deployment", url: "/docs/rdo-enterprise-demo-runbook.md" },
      { id: "resource-demo-script", title: "RDO Demo Script", type: "Guide", category: "Enterprise Deployment", url: "/docs/rdo-demo-script.md" },
    ],
    completionChecklist: ["Operating model reviewed", "Pilot rollout steps reviewed"],
  },
  {
    id: "academy-sop-library",
    slug: "sop-library",
    title: "SOP Library",
    description: "Pre-flight, post-flight, chemical handling, battery handling, emergency response, and drift management.",
    category: "SOP Library",
    estimatedMinutes: 38,
    assignedRoles: ["operator", "dealer", "network_manager", "admin"],
    certificationRequired: true,
    sortOrder: 7,
    lessons: [
      {
        id: "academy-sop-1",
        title: "Core SOP review",
        description: "The procedures every operator must know before field operations.",
        estimatedMinutes: 20,
        content:
          "Core SOPs define how operators inspect aircraft, handle batteries, mix/load products, manage drift, respond to emergencies, and close out jobs.",
      },
    ],
    resources: [
      { id: "resource-chemical-sop", title: "Chemical Handling & Mixing SOP", type: "SOP", category: "SOPs & Procedures", url: "/training/checklists/chemical-mixing-loading" },
      { id: "resource-battery-sop", title: "Battery Maintenance Guide", type: "SOP", category: "Maintenance", url: "/training/checklists/battery-handling" },
      { id: "resource-drift-sop", title: "Drift Management Best Practices", type: "SOP", category: "Field Guides", url: "/training/checklists/drift-weather-review" },
    ],
    completionChecklist: ["All core SOPs opened", "Stop-work criteria acknowledged"],
  },
  {
    id: "academy-certification",
    slug: "operator-certification",
    title: "Operator Certification",
    description: "Final knowledge check, field review scheduling, and certification status tracking.",
    category: "Certification",
    estimatedMinutes: 35,
    assignedRoles: ["operator", "dealer", "admin"],
    certificationRequired: true,
    sortOrder: 8,
    lessons: [
      {
        id: "academy-certification-1",
        title: "Certification readiness review",
        description: "Confirm completion, credentials, SOPs, and field review readiness.",
        estimatedMinutes: 18,
        content:
          "Operators become Ready for Field Review when assigned certification-required modules are complete. Certification is granted after field review by authorized leadership.",
      },
    ],
    resources: [
      { id: "resource-certification-checklist", title: "Pilot Readiness Checklist", type: "Checklist", category: "Certification", url: "/docs/rdo-pilot-readiness-checklist.md" },
    ],
    completionChecklist: ["Assigned modules complete", "Credentials checked", "Field review requested"],
  },
];

export const academySeedComments = [
  {
    id: "comment-wind-speed",
    moduleId: "academy-field-ops",
    author: "John D.",
    role: "Operator",
    text: "What wind speed is considered too high for safe application?",
    replies: [
      {
        id: "reply-wind-speed",
        author: "Sarah M.",
        role: "Lead Operator",
        text: "Use the mission/product limit. For most demo spray missions we stop at 10 mph sustained or if gusts create drift risk.",
      },
    ],
    pinned: true,
  },
  {
    id: "comment-preflight-evidence",
    moduleId: "academy-drone-safety",
    author: "Tom K.",
    role: "Dealer Manager",
    text: "Do we need a separate checklist for every launch?",
    replies: [
      {
        id: "reply-preflight-evidence",
        author: "Harvest Ops",
        role: "Admin",
        text: "Yes. The readiness gate expects pre-flight confirmation for the specific mission being launched.",
      },
    ],
    pinned: false,
  },
];

export function getAssignedAcademyModules({ role = "operator", modules = academySeedModules } = {}) {
  return modules
    .filter((module) => !module.assignedRoles?.length || module.assignedRoles.includes(role) || role === "admin")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export function getAcademyModuleProgress(module, progress = {}) {
  const completedLessonIds = new Set(progress.completedLessonIds || []);
  const totalLessons = module?.lessons?.length || 0;
  const completedLessons = (module?.lessons || []).filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const percentage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const nextLesson = (module?.lessons || []).find((lesson) => !completedLessonIds.has(lesson.id)) || null;

  return {
    completedLessons,
    totalLessons,
    percentage,
    nextLesson,
    complete: totalLessons > 0 && completedLessons === totalLessons,
  };
}

export function computeAcademyCertification({ modules = academySeedModules, completedLessonIds = [], fieldReviewPassed = false } = {}) {
  const requiredModules = modules.filter((module) => module.certificationRequired);
  const requiredLessonIds = requiredModules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const completed = requiredLessonIds.filter((id) => completedLessonIds.includes(id)).length;
  const percentage = requiredLessonIds.length ? Math.round((completed / requiredLessonIds.length) * 100) : 0;

  let status = ACADEMY_CERTIFICATION_STATUSES.NOT_STARTED;
  if (fieldReviewPassed) {
    status = ACADEMY_CERTIFICATION_STATUSES.CERTIFIED;
  } else if (requiredLessonIds.length > 0 && completed === requiredLessonIds.length) {
    status = ACADEMY_CERTIFICATION_STATUSES.READY_FOR_FIELD_REVIEW;
  } else if (completed > 0) {
    status = ACADEMY_CERTIFICATION_STATUSES.IN_PROGRESS;
  }

  return {
    status,
    percentage,
    completedSteps: completed,
    totalSteps: requiredLessonIds.length,
    readyForFieldReview: status === ACADEMY_CERTIFICATION_STATUSES.READY_FOR_FIELD_REVIEW,
    certified: status === ACADEMY_CERTIFICATION_STATUSES.CERTIFIED,
  };
}

export function getAcademyCategoryCounts(modules = academySeedModules) {
  return modules.reduce((counts, module) => {
    counts[module.category] = (counts[module.category] || 0) + 1;
    return counts;
  }, {});
}

export function getAcademyResources(modules = academySeedModules) {
  return modules
    .flatMap((module) => module.resources.map((resource) => ({ ...resource, moduleTitle: module.title, moduleId: module.id })))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
}
