import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Instrument+Sans:wght@400;500;600;700&display=swap');
.network{--surface:#151A12;--border:rgba(255,255,255,0.06);--text:#E8E6E1;--text-muted:#727966;--accent:#A3D977;font-family:'Instrument Sans',system-ui,sans-serif;color:var(--text);display:grid;gap:18px}
.network h1,.network h2{font-family:'DM Serif Display',Georgia,serif;font-weight:400;line-height:1.1;margin:0;color:#fff}
.network p{color:var(--text-muted)}
.network__card,.network__hero{border:1px solid var(--border);border-radius:16px;background:var(--surface);padding:24px}
.network__grid{display:grid;gap:14px}
.network__kpi{border:1px solid var(--border);border-radius:12px;background:rgba(255,255,255,.04);padding:18px}
.network__kpi span{display:block;color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:.1em}
.network__kpi strong{display:block;margin-top:8px;font-size:1.5rem}
.network__wrap{overflow-x:auto}.network table{width:100%;border-collapse:collapse;min-width:760px}
.network__toolbar{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;margin-bottom:12px}
@media(min-width:840px){.network__grid{grid-template-columns:repeat(5,1fr)}}
`;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function NetworkDashboardPage() {
  const { profile, networkId } = useAuth();
  const network = profile?.dealer_networks;
  const [dealers, setDealers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [orders, setOrders] = useState([]);
  const [networkDrones, setNetworkDrones] = useState([]);
  const [networkSchedule, setNetworkSchedule] = useState([]);
  const [sortKey, setSortKey] = useState("acres");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!networkId) return;

      const [{ data: dealerRows }, { data: droneRows }, { data: scheduleRows }] = await Promise.all([
        supabase.from("dealers").select("*").eq("network_id", networkId).order("name"),
        supabase.from("fleet_drones").select("*").eq("network_id", networkId),
        supabase.from("application_schedule").select("*").eq("network_id", networkId),
      ]);
      const dealerIds = (dealerRows || []).map((dealer) => dealer.id);

      let leadRows = [];
      let orderRows = [];

      if (dealerIds.length) {
        const [{ data: fetchedLeads }, { data: fetchedOrders }] = await Promise.all([
          supabase.from("grower_leads").select("*, dealers(name, state)").in("dealer_id", dealerIds).order("created_at", { ascending: false }),
          supabase.from("source_orders").select("*").in("dealer_id", dealerIds).order("created_at", { ascending: false }),
        ]);
        leadRows = fetchedLeads || [];
        orderRows = fetchedOrders || [];
      }

      if (isMounted) {
        setDealers(dealerRows || []);
        setLeads(leadRows);
        setOrders(orderRows);
        setNetworkDrones(droneRows || []);
        setNetworkSchedule(scheduleRows || []);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [networkId]);

  const dealerRows = useMemo(() => {
    const rows = dealers.map((dealer) => {
      const dealerLeads = leads.filter((lead) => lead.dealer_id === dealer.id);
      const dealerOrders = orders.filter((order) => order.dealer_id === dealer.id);
      const acres = dealerLeads.reduce((sum, lead) => sum + Number(lead.acres || 0), 0);
      const revenue = dealerOrders.reduce((sum, order) => sum + Number(order.estimated_total || 0), 0);
      const training = dealer.training_status === "active" ? 100 : dealer.training_status === "qualified" ? 85 : dealer.training_status === "in_progress" ? 45 : 10;

      return { dealer, leads: dealerLeads.length, orders: dealerOrders.length, acres, revenue, training };
    });

    return rows.sort((a, b) => Number(b[sortKey] || 0) - Number(a[sortKey] || 0));
  }, [dealers, leads, orders, sortKey]);

  const totalAcres = dealerRows.reduce((sum, row) => sum + row.acres, 0);
  const totalRevenue = dealerRows.reduce((sum, row) => sum + row.revenue, 0);
  const averageTraining = dealerRows.length ? Math.round(dealerRows.reduce((sum, row) => sum + row.training, 0) / dealerRows.length) : 0;
  const availableDrones = networkDrones.filter((drone) => drone.status === "available").length;
  const maintenanceDrones = networkDrones.filter((drone) => drone.status === "maintenance" || drone.status === "grounded").length;
  const applicationsThisWeek = networkSchedule.filter((item) => {
    const opens = item.window_opens ? new Date(item.window_opens).getTime() : 0;
    return opens >= Date.now() && opens <= Date.now() + 7 * 86400000;
  }).length;
  const completedApps = networkSchedule.filter((item) => item.status === "completed").length;
  const seasonCompletionRate = networkSchedule.length ? Math.round((completedApps / networkSchedule.length) * 100) : 0;

  function exportCsv() {
    const rows = ["Dealer,State,Leads,Orders,Revenue,Acres,Training"];
    dealerRows.forEach((row) => {
      rows.push([row.dealer.name, row.dealer.state, row.leads, row.orders, row.revenue, row.acres, `${row.training}%`].join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "network-dealer-performance.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="network">
        <div className="network__hero">
          <span className="eyebrow">Network dashboard</span>
          <h1>{network?.name || "Dealer network"}</h1>
          <p>Aggregated dealer performance, training, acres, and revenue for network managers.</p>
        </div>

        <div className="network__grid">
          <div className="network__kpi"><span>Total dealers</span><strong>{dealers.length}</strong></div>
          <div className="network__kpi"><span>Total acres</span><strong>{totalAcres.toLocaleString()}</strong></div>
          <div className="network__kpi"><span>Pipeline value</span><strong>{formatCurrency(totalRevenue)}</strong></div>
          <div className="network__kpi"><span>Avg dealer revenue</span><strong>{formatCurrency(dealers.length ? totalRevenue / dealers.length : 0)}</strong></div>
          <div className="network__kpi"><span>Training</span><strong>{averageTraining}%</strong></div>
          <div className="network__kpi"><span>Total drones</span><strong>{networkDrones.length}</strong></div>
          <div className="network__kpi"><span>Available drones</span><strong>{availableDrones}</strong></div>
          <div className="network__kpi"><span>Maintenance</span><strong>{maintenanceDrones}</strong></div>
          <div className="network__kpi"><span>Apps this week</span><strong>{applicationsThisWeek}</strong></div>
          <div className="network__kpi"><span>Season complete</span><strong>{seasonCompletionRate}%</strong></div>
        </div>

        <article className="network__card">
          <div className="network__toolbar">
            <h2>Dealer leaderboard</h2>
            <div className="inline-actions">
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                <option value="acres">Sort by acres</option>
                <option value="revenue">Sort by revenue</option>
                <option value="leads">Sort by leads</option>
                <option value="training">Sort by training</option>
              </select>
              <button className="button button--secondary button--small" type="button" onClick={exportCsv}>Export CSV</button>
            </div>
          </div>
          <div className="network__wrap">
            <table>
              <thead><tr><th>Rank</th><th>Dealer</th><th>State</th><th>Leads</th><th>Orders</th><th>Revenue</th><th>Acres</th><th>Training</th><th>Status</th></tr></thead>
              <tbody>
                {dealerRows.map((row, index) => (
                  <tr key={row.dealer.id}>
                    <td>{index + 1}</td>
                    <td>{row.dealer.name}</td>
                    <td>{row.dealer.state || "-"}</td>
                    <td>{row.leads}</td>
                    <td>{row.orders}</td>
                    <td>{formatCurrency(row.revenue)}</td>
                    <td>{row.acres.toLocaleString()}</td>
                    <td>{row.training}%</td>
                    <td>{row.dealer.training_status}</td>
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

export default NetworkDashboardPage;
