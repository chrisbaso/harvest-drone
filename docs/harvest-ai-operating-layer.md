# Harvest AI Operating Layer

Last updated: 2026-05-06

## Purpose

Harvest OS is the AI-enabled drone/ag operating layer around Harvest Drone's current business stack. It should make the business more organized, scalable, and enterprise-ready without replacing systems that already own generic business workflows.

The operating layer exists to answer practical questions:

- What needs attention today?
- Which customer replies, quotes, jobs, invoices, or enterprise follow-ups are open loops?
- Which integrations are configured, connected, or failing?
- Which RDO/enterprise readiness blockers need action?
- Which profit-center modules deserve build time next?
- What should leadership review weekly?

## System Boundaries

Harvest OS does not replace Jobber, QuickBooks, Gmail, Slack, Twilio, Hylio AgroSol, or broad farm-management platforms.

Harvest OS owns the drone/ag-specific intelligence layer:

- Daily Ops Brief
- open-loop detection and resolution
- integration event telemetry
- Slack alert routing
- Twilio customer reply handling and SMS dry-run safety
- Google Workspace read-only Gmail/Calendar signals
- Jobber webhook/sync foundation
- operator training and readiness
- credential readiness
- fleet readiness
- spray/application workflows
- support and maintenance tickets
- proposal and knowledge-base foundations
- weekly leadership briefing
- profit-center scoreboard

## AI Workflow Pattern

The near-term AI layer should be conservative:

1. Gather signals from approved systems.
2. Log integration events without exposing secrets.
3. Summarize customer and operational context.
4. Create suggested next actions and draft responses.
5. Require human approval before sending customer communications.
6. Escalate internal alerts only when env flags and routing are configured.
7. Keep all live sends disabled by default in development.

## Current P0 Surfaces

- `/admin/integrations`: status cards for Jobber, QuickBooks, Twilio, Slack, Google Workspace, and Harvest OS modules.
- `/admin/integration-events`: webhook, sync, SMS, Slack, Google, and internal event log.
- `/admin/daily-ops`: Daily Ops Brief with calendar, email, Jobber, SMS, RDO, recommended action, and placeholder states.
- `/admin/open-loops`: loop queue with filters and resolve/ignore/assign actions.
- `/admin/weekly-brief`: weekly leadership operating review.
- `/admin/profit-centers`: scoreboard for current and future Harvest profit-center modules.

## Safety Rules

- Do not print or expose secrets, tokens, API keys, webhook URLs, or `.env` values.
- Do not send real SMS unless `ENABLE_REAL_SMS=true` and required Twilio credentials exist.
- Do not post Daily Ops Slack alerts unless `DAILY_OPS_ENABLE_SLACK=true` and a webhook is configured.
- Do not run production migrations without approval.
- Do not use this OS to rebuild Jobber CRM, QuickBooks accounting, Hylio ground-control, or a full farm-management platform.
