import {
  buildDemoAccessPublicConfig,
  verifyDemoAccessCredentials,
} from "./_lib/demoAccess.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(buildDemoAccessPublicConfig(process.env));
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const result = verifyDemoAccessCredentials({
    email: req.body?.email,
    password: req.body?.password,
    env: process.env,
  });

  if (!result.ok) {
    return res.status(401).json({ error: result.reason });
  }

  return res.status(200).json({
    user: result.user,
    profile: result.profile,
  });
}
