import crypto from "node:crypto";

export const GOOGLE_WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
];

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getGoogleConfig(env = process.env) {
  return {
    clientId: String(env.GOOGLE_CLIENT_ID || "").trim(),
    clientSecret: String(env.GOOGLE_CLIENT_SECRET || "").trim(),
    redirectUri: String(env.GOOGLE_REDIRECT_URI || "").trim(),
    tokenEncryptionKey: String(env.GOOGLE_TOKEN_ENCRYPTION_KEY || "").trim(),
  };
}

function requireGoogleOAuthConfig(env = process.env) {
  const config = getGoogleConfig(env);

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    throw new Error("Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.");
  }

  return config;
}

function getEncryptionKey(secret) {
  if (!secret) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is required before storing Google OAuth tokens.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptGoogleTokenPayload(payload, env = process.env) {
  const key = getEncryptionKey(getGoogleConfig(env).tokenEncryptionKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const serialized = JSON.stringify(payload || {});
  const ciphertext = Buffer.concat([cipher.update(serialized, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    token_ciphertext: ciphertext.toString("base64"),
    token_iv: iv.toString("base64"),
    token_auth_tag: authTag.toString("base64"),
  };
}

export function decryptGoogleTokenPayload(row, env = process.env) {
  if (!row?.token_ciphertext || !row?.token_iv || !row?.token_auth_tag) {
    return null;
  }

  const key = getEncryptionKey(getGoogleConfig(env).tokenEncryptionKey);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(row.token_iv, "base64"));
  decipher.setAuthTag(Buffer.from(row.token_auth_tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(row.token_ciphertext, "base64")),
    decipher.final(),
  ]);

  return JSON.parse(plaintext.toString("utf8"));
}

export function buildGoogleOAuthUrl({ state, env = process.env } = {}) {
  const config = requireGoogleOAuthConfig(env);
  const url = new URL(GOOGLE_AUTH_URL);

  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", GOOGLE_WORKSPACE_SCOPES.join(" "));

  if (state) {
    url.searchParams.set("state", state);
  }

  return url.toString();
}

export async function exchangeGoogleAuthorizationCode({ code, env = process.env, fetchImpl = fetch } = {}) {
  const config = requireGoogleOAuthConfig(env);

  if (!code) {
    throw new Error("Google authorization code is required.");
  }

  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const token = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(token?.error_description || token?.error || "Google OAuth token exchange failed.");
  }

  return {
    ...token,
    expires_at: token.expires_in ? Date.now() + Number(token.expires_in) * 1000 : null,
  };
}

export async function refreshGoogleAccessToken({ refreshToken, env = process.env, fetchImpl = fetch } = {}) {
  const config = requireGoogleOAuthConfig(env);

  if (!refreshToken) {
    throw new Error("Google refresh token is required.");
  }

  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const token = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(token?.error_description || token?.error || "Google OAuth refresh failed.");
  }

  return {
    ...token,
    refresh_token: refreshToken,
    expires_at: token.expires_in ? Date.now() + Number(token.expires_in) * 1000 : null,
  };
}

async function googleApiRequest({ url, accessToken, fetchImpl = fetch }) {
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error?.message || `Google API request failed with ${response.status}.`);
  }

  return result;
}

export async function getGoogleUserInfo({ accessToken, fetchImpl = fetch } = {}) {
  return googleApiRequest({ url: GOOGLE_USERINFO_URL, accessToken, fetchImpl });
}

export async function upsertGoogleIntegrationAccount({
  supabase,
  token,
  accountEmail,
  scopes = GOOGLE_WORKSPACE_SCOPES,
  env = process.env,
} = {}) {
  if (!supabase || !token) {
    throw new Error("Supabase client and Google token are required.");
  }

  const encrypted = encryptGoogleTokenPayload(token, env);
  const { data, error } = await supabase
    .from("integration_account")
    .upsert(
      {
        provider: "google",
        account_email: accountEmail || null,
        scopes,
        ...encrypted,
        status: "connected",
        last_connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider,account_email" },
    )
    .select("id, provider, account_email, scopes, status, last_connected_at, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getConnectedGoogleAccount({ supabase } = {}) {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("integration_account")
    .select("*")
    .eq("provider", "google")
    .eq("status", "connected")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
}

export async function getGoogleAccessToken({ supabase, env = process.env, fetchImpl = fetch } = {}) {
  const account = await getConnectedGoogleAccount({ supabase });

  if (!account) {
    return null;
  }

  const token = decryptGoogleTokenPayload(account, env);

  if (!token?.access_token) {
    return null;
  }

  if (token.expires_at && Number(token.expires_at) - Date.now() < 2 * 60 * 1000 && token.refresh_token) {
    const refreshed = await refreshGoogleAccessToken({
      refreshToken: token.refresh_token,
      env,
      fetchImpl,
    });

    await upsertGoogleIntegrationAccount({
      supabase,
      token: refreshed,
      accountEmail: account.account_email,
      scopes: account.scopes,
      env,
    });

    return refreshed.access_token;
  }

  return token.access_token;
}

function parseGoogleHeaders(headers = []) {
  return headers.reduce((result, header) => {
    result[String(header.name || "").toLowerCase()] = header.value || "";
    return result;
  }, {});
}

export async function fetchRecentGmailMessages({
  accessToken,
  maxResults = 10,
  query = 'newer_than:7d (is:unread OR "can you" OR "following up" OR quote OR invoice OR schedule OR reschedule OR "call me" OR interested OR RDO OR Hylio OR SOURCE)',
  fetchImpl = fetch,
} = {}) {
  if (!accessToken) {
    return [];
  }

  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("maxResults", String(maxResults));
  listUrl.searchParams.set("q", query);

  const list = await googleApiRequest({ url: listUrl.toString(), accessToken, fetchImpl });
  const messages = list.messages || [];

  return Promise.all(
    messages.map(async (message) => {
      const detailUrl = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`);
      detailUrl.searchParams.set("format", "metadata");
      detailUrl.searchParams.set("metadataHeaders", "From");
      detailUrl.searchParams.append("metadataHeaders", "Subject");
      detailUrl.searchParams.append("metadataHeaders", "Date");

      const detail = await googleApiRequest({ url: detailUrl.toString(), accessToken, fetchImpl });
      const headers = parseGoogleHeaders(detail.payload?.headers || []);

      return {
        id: detail.id,
        threadId: detail.threadId,
        from: headers.from || "",
        subject: headers.subject || "(no subject)",
        date: headers.date || "",
        snippet: detail.snippet || "",
      };
    }),
  );
}

export async function fetchCalendarEvents({
  accessToken,
  timeMin,
  timeMax,
  maxResults = 20,
  fetchImpl = fetch,
} = {}) {
  if (!accessToken || !timeMin || !timeMax) {
    return [];
  }

  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", String(maxResults));

  const result = await googleApiRequest({ url: url.toString(), accessToken, fetchImpl });

  return (result.items || []).map((event) => ({
    id: event.id,
    summary: event.summary || "(untitled event)",
    description: event.description || "",
    location: event.location || "",
    start: event.start?.dateTime || event.start?.date || null,
    end: event.end?.dateTime || event.end?.date || null,
    htmlLink: event.htmlLink || "",
  }));
}
