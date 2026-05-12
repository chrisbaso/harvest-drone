import dailyOpsHandler from "../_routes/admin/daily-ops.js";
import googleOauthHandler from "../_routes/admin/google-oauth.js";
import integrationEventsHandler from "../_routes/admin/integration-events.js";
import integrationsHandler from "../_routes/admin/integrations.js";
import openLoopsHandler from "../_routes/admin/open-loops.js";

const handlers = {
  "daily-ops": dailyOpsHandler,
  "google-oauth": googleOauthHandler,
  "integration-events": integrationEventsHandler,
  integrations: integrationsHandler,
  "open-loops": openLoopsHandler,
};

function getRoute(req) {
  const route = req.query?.route;
  return Array.isArray(route) ? route[0] : route;
}

export default function handler(req, res) {
  const route = getRoute(req);
  const routeHandler = handlers[route];

  if (!routeHandler) {
    return res.status(404).json({ error: "Admin API route not found." });
  }

  return routeHandler(req, res);
}
