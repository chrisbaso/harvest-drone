import {
  buildGoogleOAuthUrl,
  exchangeGoogleAuthorizationCode,
  getConnectedGoogleAccount,
  getGoogleUserInfo,
  GOOGLE_WORKSPACE_SCOPES,
  upsertGoogleIntegrationAccount,
} from "../../_lib/googleWorkspace.js";
import { getSupabaseServerClient } from "../../_lib/serverSupabase.js";

function getAppBaseUrl(req) {
  return (
    process.env.APP_BASE_URL ||
    `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`
  );
}

function publicAccount(account) {
  if (!account) return null;

  return {
    id: account.id,
    provider: account.provider,
    account_email: account.account_email,
    scopes: account.scopes,
    status: account.status,
    last_connected_at: account.last_connected_at,
    updated_at: account.updated_at,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const action = req.query?.action || "status";
    const supabase = getSupabaseServerClient();

    if (action === "start") {
      const url = buildGoogleOAuthUrl({
        state: "harvest_daily_ops",
      });

      res.writeHead(302, { Location: url });
      return res.end();
    }

    if (action === "callback") {
      const code = req.query?.code;
      const token = await exchangeGoogleAuthorizationCode({ code });
      const userInfo = await getGoogleUserInfo({ accessToken: token.access_token });
      await upsertGoogleIntegrationAccount({
        supabase,
        token,
        accountEmail: userInfo?.email || null,
        scopes: token.scope ? token.scope.split(" ") : GOOGLE_WORKSPACE_SCOPES,
      });

      res.writeHead(302, { Location: `${getAppBaseUrl(req)}/admin/integrations/google?connected=1` });
      return res.end();
    }

    const account = await getConnectedGoogleAccount({ supabase });
    return res.status(200).json({
      account: publicAccount(account),
      requiredScopes: GOOGLE_WORKSPACE_SCOPES,
      mode: "supabase",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to manage Google Workspace connection." });
  }
}
