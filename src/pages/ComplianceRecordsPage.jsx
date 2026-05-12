import { useEffect, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const DEMO_RECORDS = [
  {
    id: "demo-cr-1",
    record_number: "CR-20260508-001",
    field_name: "North 40",
    product_applied: "Fungicide - Chlorothalonil",
    pilot_name: "Jody Bjornson",
    drone_serial_number: "HY-AG272-0041",
    mission_completed: "2026-05-08T14:10:00Z",
    actual_acres_sprayed: 318,
    all_gates_passed: true,
    override_used: false,
  },
  {
    id: "demo-cr-2",
    record_number: "CR-20260507-002",
    field_name: "South 80",
    product_applied: "Insecticide - Imidacloprid",
    pilot_name: "Ada Miller",
    drone_serial_number: "HY-AG272-0042",
    mission_completed: "2026-05-07T11:45:00Z",
    actual_acres_sprayed: 642,
    all_gates_passed: true,
    override_used: false,
  },
];

const css = `
.records{--surface:#151A12;--border:rgba(255,255,255,.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text);display:grid;gap:18px}
.records h1,.records h2{font-family:'DM Serif Display',Georgia,serif;font-weight:400;margin:0;color:#fff}
.records p{margin:0;color:var(--text-muted)}
.records__hero,.records__panel{border:1px solid var(--border);border-radius:8px;background:var(--surface);padding:22px}
.records__hero h1{font-size:clamp(2.2rem,7vw,4rem)}
.records__wrap{overflow-x:auto}
.records table{width:100%;min-width:820px;border-collapse:collapse}
.records th,.records td{padding:12px;border-bottom:1px solid var(--border);text-align:left}
.records th{color:var(--text-muted);font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.records__pill{display:inline-flex;border:1px solid rgba(163,217,119,.3);border-radius:999px;background:rgba(163,217,119,.12);padding:4px 8px;color:#DDF7C7;font-size:12px;font-weight:800}
.records__pill.is-override{border-color:rgba(251,191,36,.32);background:rgba(251,191,36,.12);color:#FDE9A7}
`;

function formatDate(value) {
  return value ? new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "-";
}

function ComplianceRecordsPage() {
  const { isDemo } = useAuth();
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecords() {
      const { data, error } = await supabase.from("compliance_records").select("*").order("mission_completed", { ascending: false }).limit(100);
      if (!isMounted) return;
      const fallback = isDemo && (error || !data?.length);
      setRecords(fallback ? DEMO_RECORDS : data || []);
      if (error && !fallback) setMessage(error.message);
    }

    loadRecords();
    return () => {
      isMounted = false;
    };
  }, [isDemo]);

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="records">
        <header className="records__hero">
          <span className="eyebrow">Compliance</span>
          <h1>Mission compliance records</h1>
          <p>Immutable application records with pilot, aircraft, weather, checklist, and readiness audit fields.</p>
        </header>

        {message ? <p>{message}</p> : null}

        <article className="records__panel">
          <div className="records__wrap">
            <table>
              <thead>
                <tr><th>Record</th><th>Completed</th><th>Field</th><th>Product</th><th>Pilot</th><th>Drone</th><th>Acres</th><th>Status</th><th>Output</th></tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id || record.record_number}>
                    <td>{record.record_number}</td>
                    <td>{formatDate(record.mission_completed)}</td>
                    <td>{record.field_name}</td>
                    <td>{record.product_applied}</td>
                    <td>{record.pilot_name}</td>
                    <td>{record.drone_serial_number || "-"}</td>
                    <td>{Number(record.actual_acres_sprayed || 0).toLocaleString()}</td>
                    <td><span className={`records__pill ${record.override_used ? "is-override" : ""}`}>{record.override_used ? "Override" : record.all_gates_passed ? "All gates passed" : "Review"}</span></td>
                    <td><button className="button button--secondary button--small" type="button" onClick={() => window.print()}>Print</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default ComplianceRecordsPage;
