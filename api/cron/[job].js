import dailyOpsHandler from "../_routes/cron/daily-ops.js";
import generateBlogPostsHandler from "../_routes/cron/generate-blog-posts.js";
import processDripsHandler from "../_routes/cron/process-drips.js";

const handlers = {
  "daily-ops": dailyOpsHandler,
  "generate-blog-posts": generateBlogPostsHandler,
  "process-drips": processDripsHandler,
};

function getJob(req) {
  const job = req.query?.job;
  return Array.isArray(job) ? job[0] : job;
}

export default function handler(req, res) {
  const job = getJob(req);
  const routeHandler = handlers[job];

  if (!routeHandler) {
    return res.status(404).json({ error: "Cron job route not found." });
  }

  return routeHandler(req, res);
}
