import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";

const css = `
.roi{--bg:#0C0F0A;--surface:#151A12;--card:#1A2015;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text);display:grid;gap:18px}
.roi h1,.roi h2,.roi h3{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.04;margin:0;color:#fff;letter-spacing:0}
.roi p{margin:0;color:var(--text-muted)}
.roi__hero,.roi__panel,.roi__result-card,.roi__benefit,.roi__cta{border:1px solid var(--border);border-radius:8px;background:var(--surface)}
.roi__hero{padding:28px;display:grid;gap:14px}
.roi__hero h1{font-size:clamp(2.8rem,8vw,5.6rem);max-width:11ch}
.roi__layout,.roi__inputs,.roi__results,.roi__benefits,.roi__compare,.roi__table{display:grid;gap:14px}
.roi__layout{align-items:start}
.roi__panel{padding:20px}
.roi__input{display:grid;gap:10px;padding:14px;border:1px solid var(--border);border-radius:8px;background:var(--card)}
.roi__input-top{display:flex;align-items:baseline;justify-content:space-between;gap:12px}
.roi__input label{font-weight:800;color:#fff}
.roi__input strong{color:var(--accent)}
.roi__input-control{display:grid;grid-template-columns:minmax(0,1fr) 112px;gap:10px;align-items:center}
.roi input[type='range']{width:100%;accent-color:var(--accent)}
.roi input[type='number']{width:100%;min-height:42px;border-radius:8px;border:1px solid var(--border);background:rgba(255,255,255,.055);color:var(--text);padding:8px 10px;font-size:16px}
.roi__results{position:sticky;top:14px}
.roi__result-card{padding:20px;background:linear-gradient(145deg,rgba(31,46,25,.96),rgba(13,18,12,.98));box-shadow:0 24px 60px rgba(0,0,0,.28)}
.roi__result-card--hero strong{display:block;margin-top:10px;font-family:'DM Serif Display',Georgia,serif;font-size:clamp(3rem,8vw,5rem);font-weight:400;line-height:.95;color:var(--accent)}
.roi__metric-grid{display:grid;gap:12px}
.roi__metric{padding:15px;border:1px solid var(--border);border-radius:8px;background:rgba(255,255,255,.04)}
.roi__metric span,.roi__table-row span{display:block;color:var(--text-muted);font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
.roi__metric strong{display:block;margin-top:6px;color:#fff;font-size:1.35rem}
.roi__timeline{height:10px;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,.07);overflow:hidden;margin-top:12px}
.roi__timeline span{display:block;height:100%;background:var(--accent);width:var(--fill)}
.roi__compare{grid-template-columns:repeat(2,minmax(0,1fr))}
.roi__table-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--border)}
.roi__table-row:last-child{border-bottom:0}
.roi__benefits{grid-template-columns:1fr}
.roi__benefit{padding:16px;background:var(--card)}
.roi__cta{padding:22px;display:flex;flex-direction:column;gap:14px;align-items:flex-start;background:linear-gradient(135deg,rgba(163,217,119,.12),rgba(21,26,18,1))}
@media(max-width:520px){.roi__input-control{grid-template-columns:1fr}.roi__compare{grid-template-columns:1fr}}
@media(min-width:860px){.roi__layout{grid-template-columns:.92fr 1.08fr}.roi__metric-grid{grid-template-columns:repeat(2,1fr)}.roi__benefits{grid-template-columns:repeat(3,1fr)}}
`;

const inputDefs = [
  ["totalAcres", "Total acres", 500, 800000, 500, ""],
  ["applicationsPerSeason", "Applications per season", 1, 14, 1, ""],
  ["currentCostPerApp", "Current cost per app", 4, 30, 1, "$/acre"],
  ["numberOfDrones", "Number of drones", 1, 30, 1, ""],
  ["costPerDrone", "Cost per drone", 25000, 85000, 1000, "$"],
  ["pilotsNeeded", "Pilots needed", 1, 20, 1, ""],
  ["pilotAnnualSalary", "Pilot annual salary", 35000, 95000, 2500, "$"],
  ["maintenancePerDrone", "Maintenance per drone", 1000, 12000, 500, "$/yr"],
  ["insurancePerDrone", "Insurance per drone", 500, 8000, 250, "$/yr"],
  ["trainingPerPilot", "Training per pilot", 500, 6000, 250, "$"],
  ["platformFee", "Harvest Drone OS", 3000, 50000, 500, "$/yr"],
  ["consumablesPerAcre", "Consumables per acre", 1, 10, 0.25, "$/acre/app"],
];

function currency(value, digits = 0) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits }).format(value || 0);
}

function RoiCalculatorPage() {
  const [inputs, setInputs] = useState({
    totalAcres: 5000,
    applicationsPerSeason: 10,
    currentCostPerApp: 12,
    numberOfDrones: 3,
    costPerDrone: 46000,
    pilotsNeeded: 2,
    pilotAnnualSalary: 55000,
    maintenancePerDrone: 4000,
    insurancePerDrone: 2000,
    trainingPerPilot: 1500,
    platformFee: 12000,
    consumablesPerAcre: 3,
  });

  const results = useMemo(() => {
    const totalApplications = inputs.totalAcres * inputs.applicationsPerSeason;
    const currentAnnualCost = totalApplications * inputs.currentCostPerApp;
    const equipmentCost = inputs.numberOfDrones * inputs.costPerDrone;
    const annualLabor = inputs.pilotsNeeded * inputs.pilotAnnualSalary;
    const annualMaintenance = inputs.numberOfDrones * inputs.maintenancePerDrone;
    const annualInsurance = inputs.numberOfDrones * inputs.insurancePerDrone;
    const trainingCost = inputs.pilotsNeeded * inputs.trainingPerPilot;
    const annualConsumables = totalApplications * inputs.consumablesPerAcre;
    const year1Total = equipmentCost + annualLabor + annualMaintenance + annualInsurance + trainingCost + inputs.platformFee + annualConsumables;
    const year2Total = annualLabor + annualMaintenance + annualInsurance + inputs.platformFee + annualConsumables;
    const annualSavings = currentAnnualCost - year2Total;
    const breakEvenMonths = annualSavings > 0 ? (equipmentCost + trainingCost) / (annualSavings / 12) : null;
    const threeYearSavings = (currentAnnualCost * 3) - (year1Total + year2Total * 2);
    const fiveYearSavings = (currentAnnualCost * 5) - (year1Total + year2Total * 4);
    const costPerAcreOwn = totalApplications ? year2Total / totalApplications : 0;
    return {
      totalApplications,
      currentAnnualCost,
      equipmentCost,
      annualLabor,
      annualMaintenance,
      annualInsurance,
      trainingCost,
      annualConsumables,
      year1Total,
      year2Total,
      annualSavings,
      breakEvenMonths,
      threeYearSavings,
      fiveYearSavings,
      costPerAcreOwn,
      costPerAcreHire: inputs.currentCostPerApp,
    };
  }, [inputs]);

  function setValue(key, value) {
    setInputs((current) => ({ ...current, [key]: Number(value) }));
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="roi">
        <header className="roi__hero">
          <span className="eyebrow">Drone division economics</span>
          <h1>Own the capability. See the math.</h1>
          <p>Input your operation's numbers. See how a drone division compares to hiring third-party applicators.</p>
        </header>

        <div className="roi__layout">
          <section className="roi__panel roi__inputs">
            <h2>Inputs</h2>
            {inputDefs.map(([key, label, min, max, step, suffix]) => (
              <div className="roi__input" key={key}>
                <div className="roi__input-top">
                  <label htmlFor={key}>{label}</label>
                  <strong>{suffix?.startsWith("$") ? currency(inputs[key], step < 1 ? 2 : 0) : inputs[key].toLocaleString()} {suffix && !suffix.startsWith("$") ? suffix : ""}</strong>
                </div>
                <div className="roi__input-control">
                  <input id={key} type="range" min={min} max={max} step={step} value={inputs[key]} onChange={(event) => setValue(key, event.target.value)} />
                  <input type="number" min={min} max={max} step={step} value={inputs[key]} onChange={(event) => setValue(key, event.target.value)} />
                </div>
              </div>
            ))}
          </section>

          <aside className="roi__results">
            <div className="roi__result-card roi__result-card--hero">
              <span className="eyebrow">Annual savings</span>
              <strong>{currency(results.annualSavings)}</strong>
              <p>Based on year-two operating cost after equipment purchase.</p>
            </div>

            <div className="roi__metric-grid">
              <div className="roi__metric">
                <span>Break-even</span>
                <strong>{results.breakEvenMonths ? `${results.breakEvenMonths.toFixed(1)} months` : "Not reached"}</strong>
                <div className="roi__timeline"><span style={{ "--fill": `${Math.min(100, results.breakEvenMonths ? (results.breakEvenMonths / 36) * 100 : 100)}%` }} /></div>
              </div>
              <div className="roi__metric">
                <span>Cost per acre</span>
                <div className="roi__compare">
                  <strong>{currency(results.costPerAcreOwn, 2)} own</strong>
                  <strong>{currency(results.costPerAcreHire, 2)} hire</strong>
                </div>
              </div>
              <div className="roi__metric"><span>3-year net savings</span><strong>{currency(results.threeYearSavings)}</strong></div>
              <div className="roi__metric"><span>5-year net savings</span><strong>{currency(results.fiveYearSavings)}</strong></div>
            </div>

            <div className="roi__result-card">
              <h2>Cost breakdown</h2>
              <div className="roi__table">
                {[
                  ["Current annual hire-out cost", results.currentAnnualCost],
                  ["Equipment purchase", results.equipmentCost],
                  ["Annual labor", results.annualLabor],
                  ["Annual maintenance", results.annualMaintenance],
                  ["Annual insurance", results.annualInsurance],
                  ["Year-one training", results.trainingCost],
                  ["Harvest Drone OS", inputs.platformFee],
                  ["Annual consumables", results.annualConsumables],
                  ["Year 1 total", results.year1Total],
                  ["Year 2+ annual total", results.year2Total],
                ].map(([label, value]) => (
                  <div className="roi__table-row" key={label}><span>{label}</span><strong>{currency(value)}</strong></div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section className="roi__panel">
          <span className="eyebrow">Additional benefits not in the math</span>
          <div className="roi__benefits">
            {[
              "Eliminate missed spray windows because you control the timing.",
              "Zero crop damage from ground compaction.",
              "Reduce labor dependency: 2 pilots replace 6+ ground rig operators.",
              "2027-compliant equipment from day one.",
              "Full operational software: scheduling, compliance, training, fleet tracking.",
            ].map((benefit) => <div className="roi__benefit" key={benefit}><strong>{benefit}</strong></div>)}
          </div>
        </section>

        <section className="roi__cta">
          <h2>Ready to explore this for your operation?</h2>
          <p>Bring your acre count, spray program, labor constraints, and timing pain. We will size the division with you.</p>
          <Link className="button button--primary button--small" to="/enterprise">Contact Jake</Link>
        </section>
      </section>
    </Shell>
  );
}

export default RoiCalculatorPage;
