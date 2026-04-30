# Harvest Drone Lead Engine

This repo runs a behind-the-scenes qualified lead engine for Harvest Drone's SOURCE offer.

It is not a SaaS product. The public experience is a SOURCE fit-check funnel for growers. The internal experience is an admin workspace that helps Harvest Drone see who is worth calling first, why they matter, and what to say next.

## What the system does

- Upgrades the public SOURCE page into a conversion-focused qualification funnel
- Replaces the simple form with a multi-step fit check
- Scores every lead from `0-100`
- Assigns a lead tier: `Hot`, `Warm`, `Nurture`, or `Low Fit`
- Stores leads and events in Supabase when server env vars are configured
- Falls back to browser-local mock mode when Supabase is not configured
- Sends hot-lead alerts and lead confirmations if Resend is configured
- Captures SMS consent language and timestamp for future compliant text automation
- Captures UTM and campaign data across the funnel
- Provides an internal `/admin` dashboard with filters, CSV export, and lead detail actions
- Generates an AI-ready lead summary with OpenAI when configured, or rule-based copy when not

## Funnel flow

`Traffic -> Landing Page -> Multi-Step Qualification Flow -> Dynamic Results Page -> Lead Score -> CRM/Database -> Alerts -> Follow-Up -> Admin Dashboard -> Revenue Tracking`

## Canonical routes

- `/` -> primary Harvest Drone SOURCE fit-check landing page
- `/source` -> same SOURCE fit-check landing page
- `/source-acre-review` -> same SOURCE fit-check landing page
- `/source-acre-review/results` -> dynamic result page
- `/admin` -> Harvest Drone admin dashboard
- `/admin/leads/:leadId` -> lead detail view

Legacy grower, operator, Hylio, and older CRM surfaces are still preserved in the repo under `/legacy/*`, but the active Harvest workflow now centers on the routes above.

## Required environment variables for live lead capture

Frontend:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server:

```bash
SUPABASE_SERVICE_ROLE_KEY=
```

Optional server alias:

```bash
SUPABASE_URL=
```

The server helper accepts `SUPABASE_URL` or `VITE_SUPABASE_URL`. The frontend still requires the `VITE_` variables because this is a Vite app.

## Optional environment variables for alerts, AI, and tracking

```bash
RESEND_API_KEY=
FROM_EMAIL=
REPLY_TO_EMAIL=
ALERT_EMAIL=
ADMIN_EMAIL=
INTERNAL_NOTIFICATION_EMAIL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
APP_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_META_PIXEL_ID=
VITE_META_PIXEL_ID=
```

Legacy optional vars that still exist elsewhere in the repo:

```bash
MAILCHIMP_API_KEY=
MAILCHIMP_SERVER_PREFIX=
MAILCHIMP_LIST_ID=
CRON_SECRET=
```

Notes:

- `ALERT_EMAIL` is the preferred internal hot-lead recipient.
- `ADMIN_EMAIL` and `INTERNAL_NOTIFICATION_EMAIL` still work as fallbacks.
- `REPLY_TO_EMAIL` is optional and lets replies route to a real inbox even if Resend has to use a fallback sender.
- `FROM_EMAIL` is only required if you want Resend alerts or confirmation emails.
- Meta Pixel helpers are safe no-ops if no pixel ID is set.
- OpenAI is optional. If the key is missing or the request fails, the app uses rule-based lead summaries.

## Supabase setup

1. Create or use an existing Supabase project.
2. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Run the Harvest migrations:

```text
supabase/migrations/20260424_harvest_drone_lead_engine.sql
supabase/migrations/20260424_harvest_drone_offer_path.sql
```

4. If the original Harvest migration was already applied in an existing project, the `20260424_harvest_drone_offer_path.sql` migration adds the missing `offer_path` column safely.
5. If you prefer a full schema bootstrap, `supabase/schema.sql` includes the same `harvest_drone_leads` and `harvest_drone_events` tables.

### New tables

`harvest_drone_leads`

- Stores grower fit-check answers
- Stores score, tier, recommended action, offer path, reason codes, UTM data, internal notes, revenue tracking, generated lead summary, and SMS consent metadata

`harvest_drone_events`

- Stores funnel and admin timeline events such as:
  - `landing_page_view`
  - `quiz_started`
  - `quiz_step_completed`
  - `quiz_submitted`
  - `result_viewed`
  - `cta_clicked`
  - `admin_status_changed`
  - `lead_contacted`
  - `lead_qualified`
  - `lead_disqualified`
  - `sale_won`
  - `sale_lost`

### Security notes

- The frontend does not use the service role key.
- Harvest lead inserts, admin reads, and admin updates happen through server routes.
- The Harvest tables are intended for server-side access. They do not expose public insert or update policies.
- The repo still contains older legacy tables and older public policies for previous flows. Those are preserved for backward compatibility but are no longer the canonical Harvest lead engine.

## Email notification setup

If `RESEND_API_KEY`, `FROM_EMAIL`, and `ALERT_EMAIL` are set:

- Hot leads send an internal alert email
- All submitted leads receive a confirmation email

If Resend is not configured:

- The app still works
- Alerts and confirmations are skipped cleanly
- The admin workflow remains usable

## SMS consent readiness

The active Harvest contact step now captures SMS consent with explicit disclosure language and stores:

- `sms_consent`
- `sms_consent_at`
- `sms_consent_language`

Operational note:

- If a grower chooses `Text` as the preferred contact method, the form now requires SMS consent before submission.
- This helps keep the current lead engine ready for later SMS automation without changing the funnel shape again.

## Meta Pixel setup

Set either:

```bash
NEXT_PUBLIC_META_PIXEL_ID=
```

or:

```bash
VITE_META_PIXEL_ID=
```

Tracked safely when configured:

- `PageView`
- `Lead`
- `CompleteRegistration`
- `QualifiedLead`
- `HotLead`

## OpenAI setup

Set:

```bash
OPENAI_API_KEY=
```

Optional:

```bash
OPENAI_MODEL=gpt-4.1-mini
```

When configured, the server attempts to generate:

- Plain-English lead summary
- Why the lead matters
- Suggested follow-up angle
- Suggested first call script
- Suggested email reply

If the API is unavailable or returns an error, the system falls back to a deterministic rule-based summary.

## Local development

Install dependencies:

```bash
npm install
```

Run the frontend only:

```bash
npm run dev
```

Run the frontend plus Vercel API routes:

```bash
npm run vercel-dev
```

## Mock mode

If Supabase or the local API routes are unavailable:

- public submissions fall back to browser-local storage
- the result page still works
- the `/admin` dashboard reads local mock leads
- updates and event logging work locally in the same browser

This makes the funnel testable even before backend setup is complete.

## How to test the funnel

1. Open `/`.
2. Click `Check My Acres`.
3. Complete the full multi-step quiz.
4. Confirm the result page changes by lead tier.
5. Open `/admin`.
6. Confirm the lead appears with the correct score and tier.
7. Open the lead detail page.
8. Update status, notes, revenue fields, and follow-up stage.
9. Export filtered leads as CSV.

## Pre-Ad Launch Test Checklist

1. Add live Vercel env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run the Harvest migrations so `harvest_drone_leads` and `harvest_drone_events` exist and `offer_path` is present.
3. Open `/source-acre-review?utm_source=meta&utm_medium=paid-social&utm_campaign=test-launch&utm_content=creative-a&utm_term=source-fit`
4. Complete the quiz with a real email address and phone number.
5. Confirm the submit redirects to `/source-acre-review/results?lead=...`
6. Confirm the results page shows a tier, score, offer path, reason codes, and recommended next step.
7. Open `/admin` and verify the new lead appears there.
8. Open `/admin/leads/:leadId` and verify:
   - qualification answers
   - score and tier
   - offer path
   - UTM fields
   - lead summary
   - follow-up sequence
9. Change status or notes in admin and verify the update saves.
10. If using Resend, submit a Hot lead and confirm:
   - internal alert email arrives
   - lead confirmation email arrives
11. If using Meta Pixel, verify:
   - `PageView`
   - `CompleteRegistration`
   - `Lead`
   - `QualifiedLead`
   - `HotLead`
12. Only start Meta ads after all checks above are confirmed in the live environment.

## How to view leads in admin

- Visit `/admin`
- Use filters for tier, status, state, crop, acreage range, date range, and campaign/UTM
- Open a lead for full detail, summary, notes, follow-up sequence, and timeline events

## How to export leads

- Open `/admin`
- Apply any filters you want
- Click `Export CSV`

The export respects the current filtered lead set in the dashboard.

## Follow-up templates

Follow-up templates are defined centrally in:

```text
shared/harvestLeadEngine.js
```

They are grouped by lead tier:

- Hot
- Warm
- Nurture
- Low Fit

## Internal playbook

The internal Harvest Drone sales playbook is here:

```text
docs/harvest-drone-sales-playbook.md
```

## Deployment

This repo deploys as a Vite app with Vercel functions.

- Build command: `npm run build`
- Output directory: `dist`
- API routes live under `api/`

Make sure the server env vars are added in Vercel before relying on live Supabase writes, Resend alerts, or OpenAI summaries.

## Commands used for verification

```bash
npm run build
npm test
```
