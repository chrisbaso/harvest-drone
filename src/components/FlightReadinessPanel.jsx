const GROUPS = [
  { id: "pilot", label: "Pilot" },
  { id: "aircraft", label: "Aircraft" },
  { id: "mission", label: "Mission" },
  { id: "weather", label: "Weather" },
];

const STATUS_LABELS = {
  pass: "Pass",
  warning: "Warning",
  fail: "Blocker",
};

const css = `
.flight-ready{display:grid;gap:10px;color:#E8E6E1}
.flight-ready__summary{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;border:1px solid rgba(255,255,255,.08);border-radius:999px;background:rgba(255,255,255,.045);padding:9px 12px}
.flight-ready__summary strong{color:#fff}
.flight-ready__banner{border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:11px 12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
.flight-ready__banner.is-cleared{border-color:rgba(163,217,119,.36);background:rgba(163,217,119,.14);color:#DDF7C7}
.flight-ready__banner.is-blocked{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.14);color:#FFD7D7}
.flight-ready__group{display:grid;gap:7px}
.flight-ready__group-title{color:#727966;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
.flight-ready__gate{display:grid;grid-template-columns:auto 1fr;gap:10px;border:1px solid rgba(255,255,255,.06);border-left:4px solid var(--gate-color);border-radius:8px;background:rgba(255,255,255,.035);padding:10px}
.flight-ready__gate.is-pass{--gate-color:#A3D977}
.flight-ready__gate.is-warning{--gate-color:#FBBF24;background:rgba(251,191,36,.08)}
.flight-ready__gate.is-fail{--gate-color:#F87171;background:rgba(248,113,113,.12);font-weight:800}
.flight-ready__icon{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--gate-color);color:#0C0F0A;font-size:12px;font-weight:900}
.flight-ready__copy{display:grid;gap:3px;min-width:0}
.flight-ready__copy strong{color:#fff}
.flight-ready__copy p{margin:0;color:#AEB6A6;font-size:12px;line-height:1.35}
.flight-ready__compact-list{display:grid;gap:7px}
`;

function statusMark(status) {
  if (status === "pass") return "OK";
  if (status === "warning") return "!";
  return "X";
}

function groupForGate(gate) {
  return GROUPS.find((group) => gate.id?.startsWith(group.id))?.id || "mission";
}

function GateRow({ gate }) {
  return (
    <div className={`flight-ready__gate is-${gate.status}`}>
      <span className="flight-ready__icon" aria-label={STATUS_LABELS[gate.status]}>{statusMark(gate.status)}</span>
      <div className="flight-ready__copy">
        <strong>{gate.label}</strong>
        <p>{gate.detail}</p>
      </div>
    </div>
  );
}

function FlightReadinessPanel({ readiness, compact = false }) {
  if (!readiness) {
    return null;
  }

  const blockerGates = readiness.gates.filter((gate) => gate.status === "fail");
  const warningGates = readiness.gates.filter((gate) => gate.status === "warning");
  const compactGates = blockerGates.length ? blockerGates : warningGates;

  return (
    <section className="flight-ready" aria-label="Flight readiness">
      <style>{css}</style>
      <div className="flight-ready__summary">
        <strong>{readiness.passCount} of {readiness.gateCount} gates passed</strong>
        <span>{readiness.blockerCount} blockers | {readiness.warningCount} warnings</span>
      </div>
      <div className={`flight-ready__banner ${readiness.cleared ? "is-cleared" : "is-blocked"}`}>
        {readiness.cleared ? "Cleared for flight" : `Not cleared - ${readiness.blockerCount} blockers`}
      </div>

      {compact ? (
        compactGates.length ? (
          <div className="flight-ready__compact-list">
            {compactGates.map((gate) => <GateRow key={gate.id} gate={gate} />)}
          </div>
        ) : null
      ) : (
        GROUPS.map((group) => {
          const gates = readiness.gates.filter((gate) => groupForGate(gate) === group.id);
          if (!gates.length) return null;
          return (
            <div className="flight-ready__group" key={group.id}>
              <span className="flight-ready__group-title">{group.label}</span>
              {gates.map((gate) => <GateRow key={gate.id} gate={gate} />)}
            </div>
          );
        })
      )}
    </section>
  );
}

export default FlightReadinessPanel;
