# Google Workspace Integration

Harvest Daily Ops uses Google OAuth for read-only Gmail and Calendar access.

## Required Scopes

- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/calendar.readonly`

These scopes let the agent read recent Gmail metadata/snippets and primary calendar events. They do not allow sending email or modifying calendar events.

## Environment Variables

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_TOKEN_ENCRYPTION_KEY`
- `DAILY_OPS_TIMEZONE`

Set `GOOGLE_REDIRECT_URI` to:

```text
https://yourdomain.com/api/admin/google-oauth?action=callback
```

For local development, use the matching local Vercel or Vite proxy URL if Google OAuth is configured to allow it.

## Token Storage

OAuth tokens are encrypted in `integration_account` with AES-256-GCM before storage. The browser only receives account email, scopes, status, and timestamps. Token ciphertext, IVs, and auth tags are never returned by the public admin status endpoint.

Rotate `GOOGLE_TOKEN_ENCRYPTION_KEY` carefully. Existing stored tokens cannot be decrypted after rotation unless they are reconnected.

## Setup Flow

1. Create an OAuth client in Google Cloud.
2. Add the redirect URI above.
3. Set the environment variables.
4. Visit `/admin/integrations/google`.
5. Click `Connect Google`.
6. Approve the read-only Gmail and Calendar scopes.
7. Return to `/ops/daily-agent` and regenerate the brief.

## Later Enterprise Option

Domain-wide delegation can be added later for a managed Google Workspace domain. That should use a dedicated service account, a narrowly scoped admin consent process, and a clear mapping of which mailbox/calendar identities Harvest OS is allowed to read.

## Security Notes

- Do not log token payloads.
- Do not expose refresh tokens to client-side code.
- Keep Gmail and Calendar scopes read-only.
- Use `CRON_SECRET` for cron routes.
- Keep outbound email/SMS approval manual in v1.
