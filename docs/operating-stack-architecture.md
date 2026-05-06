# Harvest Drone Operating Stack Architecture

Harvest Drone's near-term operating backbone is:

- Jobber: CRM, clients, requests, quotes, jobs, scheduling, invoices
- QuickBooks Online: accounting, reached through Jobber sync first
- Twilio: SMS autoresponse, reminders, customer replies, status callbacks
- Slack: internal alerts and operational escalation
- Harvest OS: drone/ag intelligence, enterprise readiness, RDO workspace, fleet, credentials, records, support, reporting

## Core Principle

Harvest OS should not duplicate generic Jobber features. It should attach drone-specific context to Jobber work.

Jobber answers: who is the customer, what was requested, what was quoted, what job is scheduled, what invoice exists?

Harvest OS answers: can this job safely and profitably happen with drones, who is credential-ready, which aircraft is ready, which records are required, what support issues block readiness, and what the enterprise rollout status looks like?

## Data Flow

1. Jobber emits webhooks for clients, requests, quotes, jobs, and invoices.
2. Harvest OS logs each webhook in `integration_events`.
3. Harvest OS maps Jobber IDs to local records through `integration_external_links` and Jobber ID columns on local tables.
4. Twilio logs inbound and outbound messages in `sms_message_logs`.
5. Customer SMS replies can alert Slack.
6. Slack receives operational alerts for leads, Jobber jobs, invoices, support issues, and readiness blockers.
7. QuickBooks receives accounting data from Jobber's built-in QuickBooks Online sync.

## RDO and Enterprise Fit

This foundation supports the larger roadmap without forcing the whole enterprise system into Jobber:

- enterprise drone division dashboard
- RDO workspace
- operator training
- credential readiness
- fleet readiness
- spray calendar
- application records
- support tickets
- performance reporting

The integration layer is deliberately thin: it logs, maps, alerts, and lets Harvest OS enrich operations.
