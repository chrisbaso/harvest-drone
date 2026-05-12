export const academyLessonVerification = {
  "academy-start-here-1": {
    outcome: "Understand that Academy progress is tied to a pilot record and becomes an operating gate.",
    briefingBeats: [
      "Pilot record::Training belongs to the named operator, not the device.",
      "Evidence trail::Video, content review, and knowledge check are recorded.",
      "Readiness link::Training informs assignment review, but launch still checks all gates.",
    ],
    checks: [
      {
        question: "What does Academy completion prove?",
        options: [
          "The pilot can skip mission readiness checks.",
          "The pilot completed required training evidence for their record.",
          "The aircraft is automatically airworthy.",
        ],
        correctIndex: 1,
      },
    ],
  },
  "academy-start-here-2": {
    outcome: "Know the difference between In Progress, Ready for Field Review, and Certified.",
    briefingBeats: [
      "In Progress::Lessons are being completed but the pilot is not field-ready.",
      "Field Review::Required training is done and a reviewer must observe the pilot.",
      "Certified::Training and field review are complete, subject to mission gates.",
    ],
    checks: [
      {
        question: "When does a pilot become Ready for Field Review?",
        options: ["After logging in once.", "After completing required Academy lessons.", "After any one SOP is opened."],
        correctIndex: 1,
      },
    ],
  },
  "academy-operator-foundations-1": {
    outcome: "Explain Harvest Drone's operating model and the pilot's stop-work responsibility.",
    briefingBeats: [
      "Training gate::Operators complete assigned modules before field work.",
      "Stop-work authority::Unsafe or unclear conditions stop the job.",
      "Audit trail::Decisions are documented in the platform.",
    ],
    checks: [
      {
        question: "What should an operator do when a readiness condition is uncertain?",
        options: ["Continue and document later.", "Stop, verify, and escalate if needed.", "Ask the customer to decide."],
        correctIndex: 1,
      },
    ],
  },
  "academy-operator-foundations-2": {
    outcome: "Recognize aviation, pesticide, insurance, and evidence requirements before assignment.",
    briefingBeats: [
      "Credentials::Part 107 and pesticide licenses must be current when required.",
      "Aircraft evidence::Registration, Remote ID, and maintenance matter.",
      "Supervisor review::Credential proof must be visible before field work.",
    ],
    checks: [
      {
        question: "Which credential is required for commercial drone operations?",
        options: ["FAA Part 107", "Forklift certification", "A commercial driver license"],
        correctIndex: 0,
      },
    ],
  },
  "academy-operator-foundations-3": {
    outcome: "Understand aircraft handling expectations and why official Hylio references stay linked.",
    briefingBeats: [
      "Aircraft state::The drone must be in a known safe condition.",
      "GroundLink plan::Mission setup must match the field and product.",
      "Evidence boundary::Harvest tracks readiness while Hylio remains the hardware authority.",
    ],
    checks: [
      {
        question: "What should operators use for model-specific hardware procedures?",
        options: ["Unofficial field guesses", "Official Hylio materials and approved SOPs", "Last season's notes only"],
        correctIndex: 1,
      },
    ],
  },
  "academy-drone-safety-1": {
    outcome: "Identify the commercial drone rules that must be checked before agricultural work.",
    briefingBeats: [
      "Part 107::Commercial UAS work requires a current remote pilot certificate.",
      "Aircraft compliance::Registration and Remote ID status must be known.",
      "Site safety::Airspace, people, obstacles, and emergency areas are reviewed.",
    ],
    checks: [
      {
        question: "What should happen if a pilot's Part 107 is expired?",
        options: ["Allow flight if the customer approves.", "Block commercial flight assignment.", "Let the pilot fly only at night."],
        correctIndex: 1,
      },
    ],
  },
  "academy-drone-safety-2": {
    outcome: "Use the pre-flight checklist as a mission-specific launch control.",
    briefingBeats: [
      "Specific mission::A checklist must match this aircraft, field, payload, and day.",
      "Failure handling::Failed items are corrected, logged, or escalated.",
      "Launch block::No complete pre-flight checklist means no launch.",
    ],
    checks: [
      {
        question: "Which pre-flight checklist is valid for launch?",
        options: ["One completed for this specific mission.", "Any checklist from the same week.", "A checklist from another pilot."],
        correctIndex: 0,
      },
    ],
  },
  "academy-drone-safety-3": {
    outcome: "Know when to pause, land, isolate the area, and escalate.",
    briefingBeats: [
      "Stop triggers::People, weather, aircraft uncertainty, and product constraints can stop work.",
      "First response::Protect people, land safely, secure product, notify leadership.",
      "Recordkeeping::Logs, photos, weather, and notes become incident evidence.",
    ],
    checks: [
      {
        question: "What is the first priority during an emergency event?",
        options: ["Finish the field.", "Protect people and land safely when possible.", "Delete the flight log."],
        correctIndex: 1,
      },
    ],
  },
  "academy-field-ops-1": {
    outcome: "Build field maps that show where the drone should work and where it must not work.",
    briefingBeats: [
      "Boundary::Confirm acres, edges, and no-spray areas.",
      "Hazards::Mark obstacles, utilities, roads, water, people, and livestock.",
      "Buffers::Program sensitive areas and label-required setbacks.",
    ],
    checks: [
      {
        question: "What should an operator do if a field boundary is uncertain?",
        options: ["Spray the likely area.", "Pause and confirm before spraying.", "Ignore the uncertain edge."],
        correctIndex: 1,
      },
    ],
  },
  "academy-field-ops-2": {
    outcome: "Evaluate weather and drift before and during application.",
    briefingBeats: [
      "Weather values::Record wind, gusts, temperature, humidity, and precipitation.",
      "Sensitive direction::Wind direction can make an otherwise acceptable speed unsafe.",
      "Pause rule::Changing conditions can stop the mission mid-field.",
    ],
    checks: [
      {
        question: "Why does wind direction matter?",
        options: ["It determines where drift could move.", "It only affects battery life.", "It replaces the need to record wind speed."],
        correctIndex: 0,
      },
    ],
  },
  "academy-field-ops-3": {
    outcome: "Complete mission closeout with flight, weather, product, anomaly, and inspection evidence.",
    briefingBeats: [
      "Flight log::Record acres, duration, product, rate, and timing.",
      "Anomalies::Skipped areas, runout, mechanical issues, and complaints are logged.",
      "Post-flight::Inspect the aircraft before it returns to available status.",
    ],
    checks: [
      {
        question: "When is a mission truly complete?",
        options: ["When the aircraft lands.", "After closeout and post-flight evidence are recorded.", "When the tank is empty."],
        correctIndex: 1,
      },
    ],
  },
  "academy-source-1": {
    outcome: "Explain SOURCE fit without making unsupported agronomy claims.",
    briefingBeats: [
      "Product role::Understand field fit and timing.",
      "Claim discipline::Route technical agronomy questions to specialists.",
      "Workflow link::Education connects to acre review and application planning.",
    ],
    checks: [
      {
        question: "What should an operator avoid when discussing SOURCE?",
        options: ["Unsupported yield guarantees.", "Confirming application acres.", "Routing agronomy questions."],
        correctIndex: 0,
      },
    ],
  },
  "academy-source-2": {
    outcome: "Understand how acre reviews become clear next actions before field work.",
    briefingBeats: [
      "Inputs::Grower, acres, crop, timing, owner, and follow-up are captured.",
      "Routing::The request becomes educate, quote, schedule, apply, or follow up.",
      "Clarity::Ambiguous requests should not become missions.",
    ],
    checks: [
      {
        question: "What should a good acre review produce?",
        options: ["A clear next action.", "A vague note with no owner.", "An automatic launch approval."],
        correctIndex: 0,
      },
    ],
  },
  "academy-enterprise-1": {
    outcome: "Describe the operating lanes needed for an enterprise drone division.",
    briefingBeats: [
      "Fleet readiness::Aircraft status, maintenance, and insurance are visible.",
      "Pilot readiness::Training and credentials are tied to operators.",
      "Leadership view::Blocked work, exceptions, and records are reportable.",
    ],
    checks: [
      {
        question: "What should the platform show leadership?",
        options: ["Only total revenue.", "Pilot, fleet, mission, compliance, and support readiness.", "Only social media performance."],
        correctIndex: 1,
      },
    ],
  },
  "academy-enterprise-2": {
    outcome: "Run an enterprise pilot rollout in controlled stages.",
    briefingBeats: [
      "Before launch::Confirm pilots, aircraft, fields, product windows, and records.",
      "Pilot phase::Start small with daily review and logged blockers.",
      "Scale rule::Expand only after the workflow is repeatable.",
    ],
    checks: [
      {
        question: "When should an enterprise pilot expand?",
        options: ["After the first demo call.", "After repeatable assignment, launch, closeout, and reporting.", "Before compliance records exist."],
        correctIndex: 1,
      },
    ],
  },
  "academy-sop-1": {
    outcome: "Know which SOP controls each phase of field operations.",
    briefingBeats: [
      "Before launch::Pre-flight, weather, chemical, and battery SOPs apply.",
      "During work::Drift, emergency, and communication standards apply.",
      "After landing::Post-flight, maintenance, and compliance closeout apply.",
    ],
    checks: [
      {
        question: "How should operators use SOPs after onboarding?",
        options: ["As active operating standards.", "As optional reading only.", "As marketing material."],
        correctIndex: 0,
      },
    ],
  },
  "academy-certification-1": {
    outcome: "Understand what evidence is required before certification and mission readiness.",
    briefingBeats: [
      "Training evidence::Required lessons and checks must be complete.",
      "Credential evidence::Licenses and approvals must be current.",
      "Mission gates::Certification does not bypass aircraft, weather, or checklist gates.",
    ],
    checks: [
      {
        question: "Does certification automatically clear every mission?",
        options: ["Yes, always.", "No, every mission still runs readiness gates.", "Only if the aircraft is green."],
        correctIndex: 1,
      },
    ],
  },
};

export function getAcademyLessonVerification(lesson = {}, module = {}) {
  const configured = academyLessonVerification[lesson.id] || {};
  return {
    outcome: configured.outcome || lesson.description || "Complete the lesson and record evidence before advancing.",
    briefingBeats: configured.briefingBeats || [
      "Watch::Review the lesson briefing.",
      "Read::Study the written operating standard.",
      "Verify::Pass the knowledge check.",
    ],
    checks: configured.checks || [
      {
        question: `What is the correct completion standard for ${lesson.title || "this lesson"}?`,
        options: ["Watch, read, verify, then complete.", "Click complete without review.", "Skip to the next module."],
        correctIndex: 0,
      },
    ],
    evidenceChecklist: [
      "Briefing watched",
      "Written content reviewed",
      `${module.title || "Module"} knowledge check passed`,
    ],
  };
}

export function getAcademyBriefingUrl({ lesson = {}, module = {}, verification } = {}) {
  const details = verification || getAcademyLessonVerification(lesson, module);
  if (lesson.videoUrl?.startsWith("/training-videos/academy/")) {
    return lesson.videoUrl;
  }

  const params = new URLSearchParams({
    category: module.category || "Academy",
    title: lesson.title || "Academy lesson",
    outcome: details.outcome,
    minutes: String(lesson.estimatedMinutes || 8),
    beats: details.briefingBeats.join("|"),
  });

  return `/training-videos/academy/lesson-briefing/index.html?${params.toString()}`;
}
