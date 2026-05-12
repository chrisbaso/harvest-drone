import assert from "node:assert/strict";
import { evaluateFlightReadiness, generateComplianceRecord } from "../shared/flightReadiness.js";

function run(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const basePilot = {
  id: "pilot-1",
  name: "Jody Bjornson",
  part107Number: "RP-107-1122",
  part107ExpiryDate: "2027-05-01",
  pesticideLicenseNumber: "MN-POTATO-44",
  pesticideLicenseExpiryDate: "2027-03-01",
  trainingComplete: true,
  trainingProgressPct: 100,
  insuranceExpiryDate: "2027-01-01",
};

const baseAircraft = {
  id: "drone-1",
  serialNumber: "HY-AG272-0041",
  model: "HYL-300 Atlas",
  status: "available",
  faaRegistration: "FA3XXHD041",
  insuranceExpiry: "2027-02-01",
  totalFlightHours: 127.5,
  hoursSinceMaintenance: 20,
  maintenanceDueHours: 50,
};

const baseMission = {
  id: "mission-1",
  fieldName: "North 40",
  fieldLocation: "Lyon County, MN",
  fieldAcres: 320,
  cropType: "Potatoes",
  productToApply: "Fungicide - Chlorothalonil",
  applicationNumber: 7,
  totalApplications: 12,
  requiresPesticideLicense: true,
  windowOpens: "2026-05-07T00:00:00Z",
  windowCloses: "2026-05-11T00:00:00Z",
  maxWindMph: 10,
};

run("blocks flight when pilot Part 107 is expired", () => {
  const readiness = evaluateFlightReadiness({
    pilot: { ...basePilot, part107ExpiryDate: "2026-04-01" },
    aircraft: baseAircraft,
    mission: baseMission,
    weather: { windSpeedMph: 5, isRaining: false, temperatureF: 65 },
    now: new Date("2026-05-08T12:00:00Z"),
  });

  assert.equal(readiness.cleared, false);
  assert.equal(readiness.blockers.includes("pilot-part107"), true);
  assert.equal(readiness.gates.find((gate) => gate.id === "pilot-part107").status, "fail");
});

run("blocks pesticide missions when applicator license is expired", () => {
  const readiness = evaluateFlightReadiness({
    pilot: { ...basePilot, pesticideLicenseExpiryDate: "2026-05-01" },
    aircraft: baseAircraft,
    mission: baseMission,
    weather: { windSpeedMph: 5, isRaining: false },
    now: new Date("2026-05-08T12:00:00Z"),
  });

  assert.equal(readiness.cleared, false);
  assert.equal(readiness.blockers.includes("pilot-pesticide"), true);
});

run("blocks aircraft that is in maintenance or overdue for maintenance", () => {
  const readiness = evaluateFlightReadiness({
    pilot: basePilot,
    aircraft: { ...baseAircraft, status: "maintenance", hoursSinceMaintenance: 52, maintenanceDueHours: 50 },
    mission: baseMission,
    weather: { windSpeedMph: 4, isRaining: false },
    now: new Date("2026-05-08T12:00:00Z"),
  });

  assert.equal(readiness.cleared, false);
  assert.equal(readiness.blockers.includes("aircraft-status"), true);
  assert.equal(readiness.blockers.includes("aircraft-maintenance"), true);
});

run("blocks launch when wind exceeds mission limit", () => {
  const readiness = evaluateFlightReadiness({
    pilot: basePilot,
    aircraft: baseAircraft,
    mission: baseMission,
    weather: { windSpeedMph: 14, isRaining: false },
    now: new Date("2026-05-08T12:00:00Z"),
  });

  assert.equal(readiness.cleared, false);
  assert.equal(readiness.blockers.includes("weather-wind"), true);
});

run("clears a qualified pilot, airworthy aircraft, authorized mission, and safe weather", () => {
  const readiness = evaluateFlightReadiness({
    pilot: basePilot,
    aircraft: baseAircraft,
    mission: { ...baseMission, requirePreflightNow: true, preflightCompleted: true },
    weather: { windSpeedMph: 6, isRaining: false, temperatureF: 65 },
    now: new Date("2026-05-08T12:00:00Z"),
  });

  assert.equal(readiness.cleared, true);
  assert.equal(readiness.blockerCount, 0);
  assert.equal(readiness.gates.find((gate) => gate.id === "aircraft-preflight").status, "pass");
});

run("generates an auditor-readable compliance record", () => {
  const record = generateComplianceRecord({
    pilot: basePilot,
    aircraft: baseAircraft,
    mission: baseMission,
    flightLog: {
      acresSprayed: 318,
      preflightChecklistCompleted: true,
      postflightInspectionCompleted: true,
      startedAt: "2026-05-08T13:00:00Z",
      completedAt: "2026-05-08T14:10:00Z",
      flightDurationMinutes: 70,
      readinessEvaluatedAt: "2026-05-08T12:55:00Z",
    },
    weather: { conditions: "Clear", windSpeedMph: 6, temperatureF: 65, humidityPct: 52 },
    now: new Date("2026-05-08T14:15:00Z"),
  });

  assert.match(record.recordId, /^CR-/);
  assert.equal(record.missionId, "mission-1");
  assert.equal(record.productApplied, "Fungicide - Chlorothalonil");
  assert.equal(record.actualAcresSprayed, 318);
  assert.equal(record.preflightChecklistCompleted, true);
  assert.equal(record.postflightInspectionCompleted, true);
});
