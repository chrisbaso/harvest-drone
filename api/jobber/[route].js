import syncHandler from "../_routes/jobber/sync.js";
import webhookHandler from "../_routes/jobber/webhook.js";

const handlers = {
  sync: syncHandler,
  webhook: webhookHandler,
};

function getRoute(req) {
  const route = req.query?.route;
  return Array.isArray(route) ? route[0] : route;
}

export default function handler(req, res) {
  const route = getRoute(req);
  const routeHandler = handlers[route];

  if (!routeHandler) {
    return res.status(404).json({ error: "Jobber API route not found." });
  }

  return routeHandler(req, res);
}
