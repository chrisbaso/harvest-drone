/**
 * Evaluate flight readiness for a mission assignment.
 * Returns { cleared: boolean, gates: [...], blockers: [...] }
 *
 * Each gate has: { id, label, status: 'pass'|'fail'|'warning', detail }
 * Blockers are gates with status 'fail'. Warnings are advisory.
 */
export function evaluateFlightReadiness({ pilot = {}, aircraft = {}, mission = {}, weather, now = new Date() } = {}) {
  const gates = [];
  const blockers = [];
  const warnings = [];
  const currentTime = new Date(now);

  const addGate = (gate) => {
    gates.push(gate);
    if (gate.status === "fail") blockers.push(gate.id);
    if (gate.status === "warning") warnings.push(gate.id);
  };

  const part107Expiry = pick(pilot, "part107ExpiryDate", "part107_expiry_date", "part107_expiry", "part_107_expiry");
  addExpiryGate({
    addGate,
    id: "pilot-part107",
    label: "FAA Part 107",
    expiryValue: part107Expiry,
    now: currentTime,
    missingDetail: "No Part 107 on file.",
    expiredDetail: (expiry) => `Expired ${formatDate(expiry)}. Pilot cannot fly commercially.`,
    warningDetail: (expiry) => `Expires ${formatDate(expiry)}. Schedule renewal.`,
    passDetail: (expiry) => `Current through ${formatDate(expiry)}`,
  });

  if (pick(mission, "requiresPesticideLicense", "requires_pesticide_license") !== false) {
    const pesticideExpiry = pick(pilot, "pesticideLicenseExpiryDate", "pesticide_license_expiry_date", "pesticide_license_expiry");
    addExpiryGate({
      addGate,
      id: "pilot-pesticide",
      label: "Pesticide applicator license",
      expiryValue: pesticideExpiry,
      now: currentTime,
      missingDetail: "No pesticide license on file. Required for this product.",
      expiredDetail: (expiry) => `Expired ${formatDate(expiry)}. Cannot apply restricted-use products.`,
      warningDetail: (expiry) => `Expires ${formatDate(expiry)}. Schedule renewal.`,
      passDetail: (expiry) => `Current through ${formatDate(expiry)}`,
    });
  }

  if (Boolean(pick(pilot, "trainingComplete", "training_complete"))) {
    addGate({ id: "pilot-training", label: "Operator training", status: "pass", detail: "Hylio Operator Foundations complete" });
  } else {
    const pct = Number(pick(pilot, "trainingProgressPct", "training_progress_pct") || 0);
    addGate({ id: "pilot-training", label: "Operator training", status: "fail", detail: `Training ${pct}% complete. Must be 100% before field operations.` });
  }

  const pilotInsuranceExpiry = pick(pilot, "insuranceExpiryDate", "insurance_expiry_date", "insurance_expiry");
  if (pilotInsuranceExpiry) {
    addExpiryGate({
      addGate,
      id: "pilot-insurance",
      label: "Liability insurance",
      expiryValue: pilotInsuranceExpiry,
      now: currentTime,
      missingDetail: "No insurance on file.",
      expiredDetail: (expiry) => `Expired ${formatDate(expiry)}.`,
      passDetail: (expiry) => `Current through ${formatDate(expiry)}`,
      failOnMissing: false,
      warnWithinDays: 0,
    });
  } else {
    addGate({ id: "pilot-insurance", label: "Liability insurance", status: "warning", detail: "No insurance on file. Recommended before field operations." });
  }

  const hoursSinceMaintenance = pickNumber(aircraft, "hoursSinceMaintenance", "hours_since_maintenance");
  const maintenanceDueHours = pickNumber(aircraft, "maintenanceDueHours", "maintenance_due_hours");
  if (hoursSinceMaintenance != null && maintenanceDueHours != null) {
    const hoursRemaining = maintenanceDueHours - hoursSinceMaintenance;
    if (hoursRemaining <= 0) {
      addGate({ id: "aircraft-maintenance", label: "Maintenance status", status: "fail", detail: `Overdue by ${Math.abs(hoursRemaining).toFixed(1)} hours. Maintenance required before flight.` });
    } else if (hoursRemaining <= 5) {
      addGate({ id: "aircraft-maintenance", label: "Maintenance status", status: "warning", detail: `${hoursRemaining.toFixed(1)} hours until maintenance. Schedule soon.` });
    } else {
      addGate({ id: "aircraft-maintenance", label: "Maintenance status", status: "pass", detail: `${hoursRemaining.toFixed(1)} hours until next maintenance` });
    }
  }

  const aircraftStatus = pick(aircraft, "status") || "unknown";
  if (aircraftStatus === "grounded") {
    addGate({ id: "aircraft-status", label: "Aircraft status", status: "fail", detail: "Aircraft is grounded. Cannot be assigned to missions." });
  } else if (aircraftStatus === "maintenance") {
    addGate({ id: "aircraft-status", label: "Aircraft status", status: "fail", detail: "Aircraft is in maintenance." });
  } else {
    addGate({ id: "aircraft-status", label: "Aircraft status", status: "pass", detail: `Status: ${String(aircraftStatus).replaceAll("_", " ")}` });
  }

  const faaRegistration = pick(aircraft, "faaRegistration", "faa_registration");
  if (faaRegistration) {
    addGate({ id: "aircraft-faa", label: "FAA registration", status: "pass", detail: `Registration: ${faaRegistration}` });
  } else {
    addGate({ id: "aircraft-faa", label: "FAA registration", status: "fail", detail: "No FAA registration on file." });
  }

  const aircraftInsuranceExpiry = pick(aircraft, "insuranceExpiry", "insurance_expiry", "insurance_expiry_date");
  if (aircraftInsuranceExpiry) {
    addExpiryGate({
      addGate,
      id: "aircraft-insurance",
      label: "Aircraft insurance",
      expiryValue: aircraftInsuranceExpiry,
      now: currentTime,
      missingDetail: "No aircraft insurance on file.",
      expiredDetail: (expiry) => `Expired ${formatDate(expiry)}.`,
      passDetail: (expiry) => `Current through ${formatDate(expiry)}`,
      failOnMissing: false,
      warnWithinDays: 0,
    });
  }

  if (Boolean(pick(mission, "requirePreflightNow", "require_preflight_now"))) {
    if (Boolean(pick(mission, "preflightCompleted", "preflight_completed"))) {
      addGate({ id: "aircraft-preflight", label: "Pre-flight checklist", status: "pass", detail: "Completed for this mission" });
    } else {
      addGate({ id: "aircraft-preflight", label: "Pre-flight checklist", status: "fail", detail: "Pre-flight checklist must be completed before launch." });
    }
  }

  const windowOpens = pick(mission, "windowOpens", "window_opens");
  const windowCloses = pick(mission, "windowCloses", "window_closes");
  if (windowOpens && windowCloses) {
    const opens = new Date(windowOpens);
    const closes = new Date(windowCloses);
    if (currentTime < opens) {
      addGate({ id: "mission-window", label: "Spray window", status: "warning", detail: `Window opens ${formatDate(opens)}. Not yet active.` });
    } else if (currentTime > closes) {
      addGate({ id: "mission-window", label: "Spray window", status: "fail", detail: `Window closed ${formatDate(closes)}. Mission may be expired.` });
    } else {
      addGate({ id: "mission-window", label: "Spray window", status: "pass", detail: `Active through ${formatDate(closes)}` });
    }
  }

  if (weather) {
    const windLimit = Number(pick(mission, "maxWindMph", "max_wind_mph", "wind_max_mph") || 10);
    const windSpeed = pickNumber(weather, "windSpeedMph", "wind_speed_mph");
    if (windSpeed != null) {
      if (windSpeed > windLimit) {
        addGate({ id: "weather-wind", label: "Wind speed", status: "fail", detail: `${windSpeed} mph exceeds ${windLimit} mph limit. Drift risk too high.` });
      } else if (windSpeed > windLimit * 0.8) {
        addGate({ id: "weather-wind", label: "Wind speed", status: "warning", detail: `${windSpeed} mph approaching limit of ${windLimit} mph.` });
      } else {
        addGate({ id: "weather-wind", label: "Wind speed", status: "pass", detail: `${windSpeed} mph (limit: ${windLimit} mph)` });
      }
    }

    if (Boolean(pick(weather, "isRaining", "is_raining"))) {
      addGate({ id: "weather-rain", label: "Precipitation", status: "fail", detail: "Active precipitation. Cannot spray." });
    } else {
      addGate({ id: "weather-rain", label: "Precipitation", status: "pass", detail: "No precipitation" });
    }

    const temperature = pickNumber(weather, "temperatureF", "temperature_f");
    const minTemp = pickNumber(mission, "minTempF", "min_temp_f");
    if (temperature != null && minTemp != null) {
      if (temperature < minTemp) {
        addGate({ id: "weather-temp", label: "Temperature", status: "fail", detail: `${temperature} F below minimum ${minTemp} F for this product.` });
      } else {
        addGate({ id: "weather-temp", label: "Temperature", status: "pass", detail: `${temperature} F (min: ${minTemp} F)` });
      }
    }
  }

  return {
    cleared: blockers.length === 0,
    gateCount: gates.length,
    passCount: gates.filter((gate) => gate.status === "pass").length,
    warningCount: warnings.length,
    blockerCount: blockers.length,
    gates,
    blockers,
    warnings,
  };
}

export function generateComplianceRecord({ pilot = {}, aircraft = {}, mission = {}, flightLog = {}, weather = {}, override = {}, now = new Date() } = {}) {
  const recordNumber = `CR-${new Date(now).getTime()}`;

  return {
    recordId: recordNumber,
    recordNumber,
    generatedAt: new Date(now).toISOString(),
    missionId: pick(mission, "id"),
    droneId: pick(aircraft, "id"),
    fieldName: pick(mission, "fieldName", "field_name"),
    fieldLocation: pick(mission, "fieldLocation", "field_location"),
    fieldAcres: pick(mission, "fieldAcres", "field_acres"),
    cropType: pick(mission, "cropType", "crop_type"),
    applicationNumber: pick(mission, "applicationNumber", "application_number"),
    totalApplications: pick(mission, "totalApplications", "total_applications"),
    productApplied: pick(mission, "productToApply", "product_to_apply"),
    applicationRate: pick(mission, "applicationRate", "application_rate") || "Per label",
    actualAcresSprayed: pick(flightLog, "acresSprayed", "acres_sprayed") || pick(mission, "fieldAcres", "field_acres"),
    pilotName: pick(pilot, "name", "full_name") || pick(mission, "assignedPilotName", "assigned_pilot_name"),
    part107Number: pick(pilot, "part107Number", "part107_number") || "On file",
    part107Expiry: pick(pilot, "part107ExpiryDate", "part107_expiry_date"),
    pesticideLicenseNumber: pick(pilot, "pesticideLicenseNumber", "pesticide_license_number") || "On file",
    pesticideLicenseExpiry: pick(pilot, "pesticideLicenseExpiryDate", "pesticide_license_expiry_date"),
    pilotTrainingComplete: Boolean(pick(pilot, "trainingComplete", "training_complete")),
    droneSerialNumber: pick(aircraft, "serialNumber", "serial_number"),
    droneModel: pick(aircraft, "model"),
    faaRegistration: pick(aircraft, "faaRegistration", "faa_registration"),
    flightHoursAtMission: pick(aircraft, "totalFlightHours", "total_flight_hours"),
    maintenanceCurrent: (pickNumber(aircraft, "hoursSinceMaintenance", "hours_since_maintenance") || 0) < (pickNumber(aircraft, "maintenanceDueHours", "maintenance_due_hours") || 50),
    preflightChecklistCompleted: Boolean(pick(flightLog, "preflightChecklistCompleted", "preflight_checklist_completed")),
    postflightInspectionCompleted: Boolean(pick(flightLog, "postflightInspectionCompleted", "postflight_inspection_completed")),
    weatherConditions: pick(weather, "conditions", "weather_conditions") || "Not recorded",
    windSpeedMph: pick(weather, "windSpeedMph", "wind_speed_mph"),
    temperatureF: pick(weather, "temperatureF", "temperature_f"),
    humidityPct: pick(weather, "humidityPct", "humidity_pct"),
    missionStarted: pick(flightLog, "startedAt", "started_at"),
    missionCompleted: pick(flightLog, "completedAt", "completed_at"),
    flightDurationMinutes: pick(flightLog, "flightDurationMinutes", "flight_duration_minutes"),
    readinessGatesPassed: !override.used,
    readinessEvaluatedAt: pick(flightLog, "readinessEvaluatedAt", "readiness_evaluated_at") || new Date(now).toISOString(),
    overrideUsed: Boolean(override.used),
    overrideReason: override.reason || null,
    overrideAuthorizedBy: override.authorizedBy || null,
  };
}

function addExpiryGate({
  addGate,
  id,
  label,
  expiryValue,
  now,
  missingDetail,
  expiredDetail,
  warningDetail,
  passDetail,
  failOnMissing = true,
  warnWithinDays = 30,
}) {
  if (!expiryValue) {
    addGate({ id, label, status: failOnMissing ? "fail" : "warning", detail: missingDetail });
    return;
  }

  const expiry = new Date(expiryValue);
  if (expiry < now) {
    addGate({ id, label, status: "fail", detail: expiredDetail(expiry) });
  } else if (warnWithinDays > 0 && expiry < addDays(now, warnWithinDays)) {
    addGate({ id, label, status: "warning", detail: warningDetail(expiry) });
  } else {
    addGate({ id, label, status: "pass", detail: passDetail(expiry) });
  }
}

function pick(source, ...keys) {
  for (const key of keys) {
    if (source?.[key] != null && source[key] !== "") return source[key];
  }
  return undefined;
}

function pickNumber(source, ...keys) {
  const value = pick(source, ...keys);
  if (value == null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
