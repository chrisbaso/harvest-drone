import inboundSmsHandler from "../_routes/twilio/inbound-sms.js";
import statusCallbackHandler from "../_routes/twilio/status-callback.js";

const handlers = {
  "inbound-sms": inboundSmsHandler,
  "status-callback": statusCallbackHandler,
};

function getRoute(req) {
  const route = req.query?.route;
  return Array.isArray(route) ? route[0] : route;
}

export default function handler(req, res) {
  const route = getRoute(req);
  const routeHandler = handlers[route];

  if (!routeHandler) {
    return res.status(404).json({ error: "Twilio API route not found." });
  }

  return routeHandler(req, res);
}
