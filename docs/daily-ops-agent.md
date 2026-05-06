# Harvest Daily Ops Agent

The Harvest Daily Ops Agent is an internal, read-first operations assistant. Version 1 generates a weekday morning brief and keeps an open-loop tracker for admin follow-up across Google Workspace, Jobber, Twilio, Slack, and Harvest OS.

## What It Reads

- Google Calendar events for today and tomorrow.
- Recent Gmail messages that match reply, quote, invoice, scheduling, RDO, Hylio, or SOURCE signals.
- Jobber integration events already logged in Harvest OS.
- Twilio inbound SMS logs already logged in Harvest OS.
- Existing `ops_loops` rows that are still open or assigned.

## What It Does Not Do

- It does not send customer emails.
- It does not send SMS replies.
- It does not create invoices.
- It does not automatically approve customer-facing communications.
- It does not expose OAuth tokens, webhook URLs, service role keys, or SMS auth secrets to the browser.

## Human Approval

Email and SMS items can include `draft_response` text in the admin UI. The text is explicitly marked as draft-only. An admin must review, copy, edit, and send it manually until a future approval workflow is built.

## Admin Routes

- `/admin/daily-ops`: Generates and displays the current Daily Ops Brief.
- `/admin/open-loops`: Shows open or assigned loops and supports assign, resolve, and ignore actions.
- `/admin/integrations/google`: Connects Google Workspace with Gmail and Calendar read-only scopes.

## Scheduled Run

`/api/cron/daily-ops` is registered in `vercel.json` at `0 12 * * 1-5`, which is around 7:00 AM Central during daylight saving time. The route checks `DAILY_OPS_TIMEZONE` and skips weekends. Set `CRON_SECRET` to protect manual cron invocations.

## Slack Brief

Slack posting is internal-only. The cron route calls the Slack sender, but posting is skipped unless `DAILY_OPS_ENABLE_SLACK=true`.

Environment variables:

- `SLACK_DAILY_OPS_WEBHOOK_URL`
- `SLACK_DAILY_OPS_CHANNEL`
- `DAILY_OPS_ENABLE_SLACK`

If `SLACK_DAILY_OPS_WEBHOOK_URL` is missing, the code falls back to `SLACK_WEBHOOK_URL`.

## Data Model

The migration `supabase/migrations/20260506100000_daily_ops_agent.sql` adds:

- `ops_loops`
- `ops_daily_brief`
- `ops_brief_item`
- `integration_account`

The existing `integration_events` provider check is expanded for Google-derived events.

## Adding More Sources

New sources should produce normalized `ops_loops` candidates with:

- `source`
- `source_external_id`
- `loop_type`
- `priority`
- `title`
- `summary`
- `suggested_next_action`
- `draft_response` only when a human-facing draft is useful

Use the shared classifier in `shared/dailyOps.js` unless the source has a stronger domain-specific signal.
