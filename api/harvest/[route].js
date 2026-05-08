import adminLeadsHandler from "../_routes/harvest/admin-leads.js";
import leadHandler from "../_routes/harvest/lead.js";
import submitLeadHandler from "../_routes/harvest/submit-lead.js";
import trackEventHandler from "../_routes/harvest/track-event.js";

const handlers = {
  "admin-leads": adminLeadsHandler,
  lead: leadHandler,
  "submit-lead": submitLeadHandler,
  "track-event": trackEventHandler,
};

function getRoute(req) {
  const route = req.query?.route;
  return Array.isArray(route) ? route[0] : route;
}

export default function handler(req, res) {
  const route = getRoute(req);
  const routeHandler = handlers[route];

  if (!routeHandler) {
    return res.status(404).json({ error: "Harvest API route not found." });
  }

  return routeHandler(req, res);
}
