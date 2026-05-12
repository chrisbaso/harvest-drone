# Current Stack Architecture

Last updated: 2026-05-06

## Ownership Map

Jobber owns CRM, jobs, scheduling, quotes, and invoices.

QuickBooks owns accounting.

Twilio owns SMS transport.

Slack owns internal alerts.

Google Workspace owns email and calendar.

Harvest OS owns drone/ag-specific workflows and AI operating intelligence.

## Practical Architecture

Harvest OS should sit above the current stack as an operating and intelligence layer.

Jobber remains the source of truth for:

- customers and contacts
- requests
- quotes
- jobs
- scheduling
- invoices

QuickBooks remains the source of truth for:

- accounting records
- bookkeeping workflows
- financial reconciliation
- tax/accounting reporting

Twilio remains the transport layer for:

- inbound SMS webhooks
- outbound SMS delivery
- message status callbacks
- opt-out/opt-in handling

Slack remains the internal alert layer for:

- Daily Ops brief alerts
- customer SMS reply alerts
- lead and Jobber event alerts
- readiness blockers
- integration errors

Google Workspace remains the business communication layer for:

- Gmail
- Calendar
- account authorization
- daily loop-closing signals

Harvest OS owns:

- integration event logging
- open-loop tracking
- Daily Ops Brief
- weekly leadership brief
- RDO/enterprise division workflow
- operator readiness
- credential readiness
- fleet readiness
- spray/application readiness
- support and maintenance tracking
- application records
- proposal and knowledge-base foundations
- profit-center strategy scoreboard

## Data Flow

1. Jobber emits webhooks or is queried by the Jobber GraphQL foundation.
2. Twilio sends inbound SMS and status callbacks to Harvest API endpoints.
3. Google Workspace provides read-only Calendar and Gmail signals after OAuth authorization.
4. Slack receives internal alerts when configured and explicitly enabled.
5. Harvest OS logs all meaningful signals to `integration_events`.
6. Harvest OS converts actionable signals into `ops_loops`.
7. The Daily Ops Agent summarizes `ops_loops`, calendar events, email follow-ups, SMS replies, Jobber follow-ups, and RDO/enterprise items.
8. Weekly leadership review rolls up revenue, jobs, quotes, open loops, enterprise progress, SOURCE/input opportunities, maintenance, invoices, priorities, and decisions.

## What Harvest OS Should Not Own

- Generic CRM replacement
- Accounting replacement
- Hylio AgroSol ground control
- General farm-management platform
- Automatic customer sends without approval
- Secret/token display in admin UI
