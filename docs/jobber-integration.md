# Jobber Integration Foundation

Jobber is the source of truth for Harvest Drone clients, requests, quotes, jobs, scheduling, and invoices.

Official Jobber docs describe the API as GraphQL and list the endpoint as `https://api.getjobber.com/api/graphql`: https://developer.getjobber.com/docs/using_jobbers_api/api_queries_and_mutations/

Official Jobber webhook docs describe app-level webhooks, HMAC verification with `X-Jobber-Hmac-SHA256`, at-least-once delivery, and a one-second response expectation: https://developer.getjobber.com/docs/using_jobbers_api/setting_up_webhooks/

## Implemented Foundation

- Server GraphQL client: `api/_lib/jobber.js`
- Webhook endpoint: `api/jobber/webhook.js`
- Manual sync endpoint foundation: `api/jobber/sync.js`
- Event logging: `integration_events`
- External ID mapping: `integration_external_links`
- Local Jobber ID fields on Harvest lead, CRM, opportunity, and application job tables
- Slack alerts for Jobber job and invoice webhook concepts

## Environment Variables

- `JOBBER_ACCESS_TOKEN`
- `JOBBER_CLIENT_SECRET`
- `JOBBER_WEBHOOK_SECRET`
- `JOBBER_GRAPHQL_URL`

Secret values are never returned to the admin UI. The UI only reports whether each variable is set.

## Webhook Topics

The code recognizes these topic concepts:

- `CLIENT_CREATE`
- `CLIENT_UPDATE`
- `REQUEST_CREATE`
- `QUOTE_CREATE`
- `QUOTE_UPDATE`
- `JOB_CREATE`
- `JOB_UPDATE`
- `INVOICE_CREATE`
- `INVOICE_UPDATE`

Jobber's docs say supported topics should be confirmed from `WebHookTopicEnum` in the current GraphQL schema. Before production enablement, confirm the exact available topics in the Jobber Developer Center and configure them to post to `/api/jobber/webhook`.

## Processing Model

Harvest OS should respond quickly, log the event, map the external ID, and do heavier enrichment asynchronously or in a follow-up job. Jobber webhooks are at-least-once, so downstream processing should stay idempotent around provider, resource type, and external ID.
