import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');
.dealer{--bg:#0C0F0A;--surface:#151A12;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text);display:grid;gap:18px}
.dealer h1,.dealer h2{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.1;margin:0;color:#fff}
.dealer p{color:var(--text-muted)}
.dealer__hero,.dealer__card{border:1px solid var(--border);border-radius:16px;background:var(--surface);padding:24px}
.dealer__hero{display:grid;gap:18px}
.dealer__url{display:grid;gap:8px;padding:12px;border-radius:10px;border:1px solid var(--border);background:#0C0F0A;word-break:break-all}
.dealer__grid{display:grid;gap:14px}
.dealer__kpi{border:1px solid var(--border);border-radius:12px;background:rgba(255,255,255,.04);padding:18px}
.dealer__kpi span{display:block;color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:.1em}
.dealer__kpi strong{display:block;margin-top:8px;font-size:1.6rem}
.dealer__table{width:100%;border-collapse:collapse;min-width:720px}
.dealer__wrap{overflow-x:auto}
.dealer__empty{color:var(--text-muted);margin:0}
.dealer__progress{height:10px;border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden}
.dealer__progress span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#d5d19a)}
.dealer__mini-list{display:grid;gap:10px}
.dealer__mini-card{display:grid;gap:8px;padding:12px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,.035)}
.dealer__mini-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.dealer__status{display:inline-flex;border-radius:999px;border:1px solid rgba(163,217,119,.24);background:rgba(163,217,119,.1);padding:4px 8px;color:#fff;font-size:12px;font-weight:800;text-transform:capitalize}
.dealer__status--urgent{border-color:rgba(248,113,113,.32);background:rgba(248,113,113,.12)}
@media(min-width:820px){.dealer__hero{grid-template-columns:1fr 360px}.dealer__grid{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}.dealer__split{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}}
`;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function DealerDashboardPage() {
  const { profile, dealerId } = useAuth();
  const dealer = profile?.dealers;
  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [drones, setDrones] = useState([]);
  const [upcomingApps, setUpcomingApps] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!dealerId) return;

      const [{ data: leadRows }, { data: orderRows }, { data: activityRows }, { data: droneRows }, { data: appRows }] = await Promise.all([
        supabase.from("grower_leads").select("*").eq("dealer_id", dealerId).order("created_at", { ascending: false }),
        supabase.from("source_orders").select("*").eq("dealer_id", dealerId).order("created_at", { ascending: false }),
        supabase.from("lead_activities").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("fleet_drones").select("*").eq("dealer_id", dealerId),
        supabase.from("application_schedule").select("*").eq("dealer_id", dealerId).in("status", ["scheduled", "assigned"]).order("window_opens").limit(10),
      ]);

      if (isMounted) {
        setLeads(leadRows || []);
        setOrders(orderRows || []);
        setActivities(activityRows || []);
        setDrones(droneRows || []);
        setUpcomingApps(appRows || []);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [dealerId]);

  const kpis = useMemo(() => {
    const acres = leads.reduce((sum, lead) => sum + Number(lead.acres || 0), 0);
    const value = orders.reduce((sum, order) => sum + Number(order.estimated_total || 0), 0);
    const training = dealer?.training_status === "active" ? 100 : dealer?.training_status === "qualified" ? 85 : dealer?.training_status === "in_progress" ? 45 : 10;
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
    const leadsThisMonth = leads.filter((lead) => {
      const created = lead.created_at ? new Date(lead.created_at) : null;
      return created && created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    }).length;
    const leadsLastMonth = leads.filter((lead) => {
      const created = lead.created_at ? new Date(lead.created_at) : null;
      return created && created.getMonth() === lastMonthDate.getMonth() && created.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    return { acres, value, training, leadsThisMonth, leadsLastMonth };
  }, [dealer?.training_status, leads, orders]);

  const leadUrl = `${window.location.origin}/d/${dealer?.slug || "dealer-slug"}`;

  async function copyLeadUrl() {
    await navigator.clipboard.writeText(leadUrl);
    setMessage("Lead capture URL copied.");
  }

  async function markPaid(orderId) {
    const { error } = await supabase.from("source_orders").update({ status: "paid" }).eq("id", orderId).eq("dealer_id", dealerId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: "paid" } : order)));
    setMessage("Order marked as paid.");
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="dealer">
        <div className="dealer__hero">
          <div>
            <span className="eyebrow">Dealer portal</span>
            <h1>{dealer?.name || "My Dealer Dashboard"}</h1>
            <p>{dealer?.territory_description || [dealer?.state, dealer?.counties_served?.join(", ")].filter(Boolean).join(" | ") || "Your assigned dealer territory."}</p>
          </div>
          <div className="dealer__url">
            <strong>Your lead capture URL</strong>
            <span>{leadUrl}</span>
            <button className="button button--secondary button--small" type="button" onClick={copyLeadUrl}>Copy URL</button>
            {message ? <p className="dealer__empty">{message}</p> : null}
          </div>
        </div>

        <div className="dealer__grid">
          <div className="dealer__kpi"><span>My leads</span><strong>{leads.length}</strong></div>
          <div className="dealer__kpi"><span>Pipeline value</span><strong>{formatCurrency(kpis.value)}</strong></div>
          <div className="dealer__kpi"><span>My acres</span><strong>{kpis.acres.toLocaleString()}</strong></div>
          <div className="dealer__kpi"><span>Training</span><strong>{kpis.training}%</strong></div>
          <div className="dealer__kpi"><span>Lead trend</span><strong>{kpis.leadsThisMonth} {kpis.leadsThisMonth >= kpis.leadsLastMonth ? "up" : "down"}</strong><p>{kpis.leadsLastMonth} last month</p></div>
        </div>

        <div className="dealer__split">
          <article className="dealer__card">
            <h2>Fleet status</h2>
            <div className="dealer__mini-list">
              {drones.length ? drones.slice(0, 6).map((drone) => {
                const due = Number(drone.maintenance_due_hours || 50);
                const since = Number(drone.hours_since_maintenance || 0);
                const percent = Math.min(100, due ? (since / due) * 100 : 0);
                return (
                  <div className="dealer__mini-card" key={drone.id}>
                    <div className="dealer__mini-top">
                      <strong>{drone.nickname || drone.serial_number}</strong>
                      <span className="dealer__status">{String(drone.status || "available").replaceAll("_", " ")}</span>
                    </div>
                    <p>{drone.serial_number} | {drone.assigned_pilot_name || "Unassigned"}</p>
                    <div className="dealer__progress"><span style={{ width: `${percent}%` }} /></div>
                    <p>{since.toFixed(1)} of {due.toFixed(0)} service hours used</p>
                  </div>
                );
              }) : <p className="dealer__empty">No fleet assigned — contact Harvest Drone to get started.</p>}
            </div>
          </article>

          <article className="dealer__card">
            <h2>Upcoming applications</h2>
            <div className="dealer__mini-list">
              {upcomingApps.length ? upcomingApps.slice(0, 10).map((app) => (
                <div className="dealer__mini-card" key={app.id}>
                  <div className="dealer__mini-top">
                    <strong>{app.field_name}</strong>
                    <span className={`dealer__status ${app.priority === "urgent" ? "dealer__status--urgent" : ""}`}>{app.priority}</span>
                  </div>
                  <p>{app.product_to_apply} | {Number(app.field_acres || 0).toLocaleString()} acres</p>
                  <p>{app.window_opens ? new Date(app.window_opens).toLocaleDateString() : "-"} - {app.window_closes ? new Date(app.window_closes).toLocaleDateString() : "-"}</p>
                </div>
              )) : <p className="dealer__empty">No scheduled applications yet.</p>}
            </div>
          </article>
        </div>

        <div className="dealer__split">
          <article className="dealer__card">
            <h2>Lead pipeline</h2>
            <div className="dealer__wrap">
              <table className="dealer__table">
                <thead><tr><th>Name</th><th>State</th><th>Acres</th><th>Crop</th><th>Status</th><th>Created</th></tr></thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{[lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.email}</td>
                      <td>{lead.state}</td>
                      <td>{lead.acres || "-"}</td>
                      <td>{lead.crop_type || "-"}</td>
                      <td>{lead.status}</td>
                      <td>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!leads.length ? <p className="dealer__empty">No dealer-attributed leads yet.</p> : null}
          </article>

          <article className="dealer__card">
            <h2>Training status</h2>
            <p>{dealer?.training_status || "pending"}</p>
            <div className="dealer__progress"><span style={{ width: `${kpis.training}%` }} /></div>
            <p>Continue assigned training from the Training link in your navigation.</p>
          </article>
        </div>

        <div className="dealer__split">
          <article className="dealer__card">
            <h2>SOURCE orders</h2>
            {orders.map((order) => (
              <div className="dealer__url" key={order.id}>
                <strong>{order.product || "SOURCE order"} | {formatCurrency(order.estimated_total)}</strong>
                <span>{order.status || "pending"} | {order.acres || "-"} acres</span>
                <button className="button button--secondary button--small" type="button" onClick={() => markPaid(order.id)}>Mark as Paid</button>
              </div>
            ))}
            {!orders.length ? <p className="dealer__empty">No dealer-attributed SOURCE orders yet.</p> : null}
          </article>
          <article className="dealer__card">
            <h2>Recent activity</h2>
            {activities.map((activity) => (
              <p key={activity.id}>{activity.activity_type} | {activity.created_at ? new Date(activity.created_at).toLocaleString() : ""}</p>
            ))}
            {!activities.length ? <p className="dealer__empty">No recent activity yet.</p> : null}
          </article>
        </div>
      </section>
    </Shell>
  );
}

export default DealerDashboardPage;
