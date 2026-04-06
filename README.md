# Harvest Drone MVP Funnel

This project is now a working MVP version of the Harvest Drone funnel. It keeps the original premium front-end experience, while grower and operator submissions persist to Supabase in separate tables, a jobs table is ready for assignment workflows, and the dashboard reads live data directly with no login gate.

## What this MVP does

- Captures grower leads for drone spraying and acreage optimization
- Captures operator leads for network recruitment and drone sales conversations
- Stores grower submissions in `grower_leads`
- Stores operator submissions in `operator_leads`
- Includes a `jobs` table for future grower-to-operator assignment workflows
- Stores every record with:
  - `created_at`
  - `lead_source`
  - `status`
- Reads live grower/operator data from Supabase on `/dashboard`
- Filters live dashboard results by lead type and status
- Lets admins create jobs from grower leads and assign operators from the dashboard
- Keeps the existing public routes and Vercel-friendly SPA structure

## Tech stack

- React
- Vite
- React Router
- Supabase JavaScript client
- Resend
- Plain CSS with the existing custom design system

## Environment variables

Create a local `.env` file based on `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=Harvest Drone <no-reply@yourdomain.com>
ADMIN_EMAIL=ops@yourdomain.com
CRON_SECRET=replace-with-a-long-random-string
```

For Vercel, add the same variables in the Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`
- `ADMIN_EMAIL`
- `CRON_SECRET`

If either variable is missing or incorrect, the forms will fail before submission with a Supabase configuration error instead of a generic fetch failure.

## Supabase setup

1. Create a new Supabase project.
2. In Supabase SQL Editor, run [supabase/schema.sql](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\supabase\schema.sql).
3. Copy the project URL and anon key into `.env` locally and into Vercel env vars for deployment.

The SQL file creates:

- `grower_leads`
- `operator_leads`
- `jobs`
- `lead_activities`
- `created_at`, `lead_source`, and `status` fields on each core record type
- `sequence_state`, `last_contacted_at`, and `next_follow_up_at` on grower and operator leads
- indexes for status and recency-based reads
- row level security policies so:
  - anonymous users can submit grower and operator leads
  - anonymous users can read lead and job records in the dashboard
  - anonymous users can manage jobs in the current no-login dashboard flow

## Submission flow

- Grower form writes to `grower_leads`
- Operator form writes to `operator_leads`
- Each insert returns a success state with `created_at` and `status`
- The thank-you state only renders after a successful server-side submission
- The browser posts to [api/submit-lead.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\submit-lead.js), which:
  - saves the lead to Supabase
  - sends the lead confirmation and the internal alert from the server
- Grower submissions send:
  - a confirmation email to the grower
  - an internal alert to `ADMIN_EMAIL`
- Operator submissions send:
  - a confirmation email to the operator
  - an internal alert to `ADMIN_EMAIL`
- If email delivery fails after the save, the server returns an error so the issue is visible instead of silently failing.
- Every send and automation event is logged to `lead_activities`
- Submission helpers live in [src/lib/submissions.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\src\lib\submissions.js)

## Drip automation

The app includes server-side drip campaigns for growers and operators.

Grower schedule:

- Day 0: confirmation email
- Day 1: timing and speed follow-up
- Day 3: fit and use-case follow-up
- Day 5: acreage review CTA
- Day 10: final check-in

Operator schedule:

- Day 0: confirmation email
- Day 1: operator-fit follow-up
- Day 3: equipment and capacity follow-up
- Day 5: routing CTA
- Day 10: final check-in

Stop rules:

- Growers stop when status becomes `qualified`, `quoted`, `scheduled`, `closed`, or `do_not_contact`
- Operators stop when status becomes `approved`, `active`, `inactive`, or `do_not_contact`

Scheduled processing:

- [api/cron/process-drips.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\cron\process-drips.js)
- Vercel cron runs once daily at `14:00 UTC` via [vercel.json](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\vercel.json)
- The cron endpoint checks due leads, sends eligible follow-ups, stops sequences when status rules are hit, and logs results to `lead_activities`

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. For the full local flow including the server-side email function, run:

```bash
npm run vercel-dev
```

This uses the local Vercel CLI so the `/api/lead-email` route is available during development.
It also makes the `/api/submit-lead` and `/api/cron/process-drips` routes available locally.
The script includes `--yes` so the CLI can start without an extra confirmation prompt.

If you only run `npm run dev`, the Vite frontend will work, but the local `/api/lead-email` route will not be available unless you proxy it separately.

3. If you only need to work on the frontend, you can still start Vite directly:

```bash
npm run dev
```

4. Open the local URL shown in the terminal.

## How to deploy to Vercel

1. Push this project to GitHub, GitLab, or Bitbucket.
2. Import the repository into Vercel.
3. Set these environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `ADMIN_EMAIL`
   - `CRON_SECRET`
4. Keep the default Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

The included `vercel.json` rewrite keeps React Router routes working on direct loads, and the `api/` directory is ready for Vercel Functions.

## Where future CRM, SMS, and automation integrations connect

Primary insertion point:

- [src/components/FunnelForm.jsx](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\src\components\FunnelForm.jsx)

Database submission points:

- [src/pages/GrowerPage.jsx](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\src\pages\GrowerPage.jsx)
- [src/pages/OperatorPage.jsx](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\src\pages\OperatorPage.jsx)
- [src/lib/submissions.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\src\lib\submissions.js)

Server-side email point:

- [api/lead-email.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\lead-email.js)
- [api/submit-lead.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\submit-lead.js)
- [api/cron/process-drips.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\cron\process-drips.js)
- [api/_lib/dripCampaigns.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\_lib\dripCampaigns.js)
- [api/_lib/leadActivity.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\_lib\leadActivity.js)
- [api/_lib/serverSupabase.js](C:\Users\c_bas\OneDrive\Email attachments\Documents\New folder\api\_lib\serverSupabase.js)

Recommended next integrations:

- Send each successful lead to HubSpot or Salesforce after Supabase insert succeeds
- Trigger SMS sequences after the database write completes
- Create jobs automatically when a grower lead becomes qualified
- Assign operators to jobs when territory, status, and capacity are a fit
- Add a server-side admin API later if you want protected lead mutations

## Key files

```text
.
|-- .env.example
|-- api
|   |-- _lib
|   |   |-- dripCampaigns.js
|   |   |-- leadActivity.js
|   |   `-- serverSupabase.js
|   |-- cron
|   |   `-- process-drips.js
|   `-- lead-email.js
|   `-- submit-lead.js
|-- index.html
|-- package.json
|-- vercel.json
|-- supabase
|   `-- schema.sql
|-- src
|   |-- App.jsx
|   |-- main.jsx
|   |-- components
|   |   |-- DashboardFilters.jsx
|   |   |-- FormField.jsx
|   |   |-- FunnelForm.jsx
|   |   |-- LeadTable.jsx
|   |   |-- SectionHeading.jsx
|   |   |-- Shell.jsx
|   |   `-- StatCard.jsx
|   |-- context
|   |   `-- AuthContext.jsx
|   |-- lib
|   |   |-- leadTransforms.js
|   |   `-- supabase.js
|   |-- pages
|   |   |-- DashboardPage.jsx
|   |   |-- GrowerPage.jsx
|   |   |-- LandingPage.jsx
|   |   `-- OperatorPage.jsx
|   `-- styles
|       `-- global.css
`-- README.md
```

## Notes

- The dashboard is now directly accessible with no login gate.
- The current dashboard combines live rows from `grower_leads` and `operator_leads` into one filtered admin view.
- The dashboard can now create a job from a grower lead and assign it to an operator.
- Email secrets stay server-side in the Vercel function and are never exposed to the React client.
- The drip engine uses the Supabase service role key server-side so automation and activity logging do not depend on client-side RLS access.
- Verified build command: `npm run build`
