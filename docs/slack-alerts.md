# Slack Alerts

Slack is the internal alert surface for Harvest Drone operations. Webhook URLs must live in environment variables and must never be hardcoded.

## Implemented Foundation

- Slack client helper: `api/_lib/slack.js`
- Main function: `sendSlackAlert({ type, message, context })`
- Admin development test action from `/admin/integrations`
- Event logging for sent, skipped, and failed alerts

## Alert Types

The current formatter supports:

- `new_lead`
- `customer_sms_reply`
- `new_jobber_job`
- `quote_followup_due`
- `job_completed_not_invoiced`
- `maintenance_issue`
- `rdo_followup`
- `readiness_blocker`
- `integration_error`
- `integration_test`
- `daily_ops_brief`

## Environment Variables

- `SLACK_WEBHOOK_URL`
- `SLACK_DEFAULT_CHANNEL`
- `SLACK_DAILY_OPS_WEBHOOK_URL`
- `SLACK_DAILY_OPS_CHANNEL`
- `DAILY_OPS_ENABLE_SLACK`

The admin UI reports only whether these are configured. It never displays the webhook URL.

## Operational Pattern

Slack should alert humans when the stack needs judgment:

- a new Jobber job needs drone-readiness review
- a customer replies by SMS
- an invoice is created and accounting should remain in Jobber-to-QuickBooks flow
- maintenance/support issues block work
- RDO readiness blockers need escalation
