# Twilio SMS Integration Foundation

Twilio supports Harvest Drone SMS workflows while Jobber remains the CRM and job system.

## Implemented Foundation

- SMS client: `api/_lib/twilio.js`
- Inbound webhook endpoint: `api/twilio/inbound-sms.js`
- Status callback endpoint: `api/twilio/status-callback.js`
- Outbound send helper: `sendSmsMessage`
- SMS log table: `sms_message_logs`
- Opt-out table: `sms_opt_outs`
- Customer reply Slack routing

## Use Cases

- new lead autoresponse
- job confirmation
- appointment reminder
- customer reply routed to Slack
- internal alert when customer replies

## Development Safety

Real SMS sends are disabled unless this env var is explicitly set:

```bash
TWILIO_ENABLE_REAL_SEND=true
```

If credentials are set but real sends are disabled, `sendSmsMessage` returns `dry_run` and logs a dry-run message when Supabase is configured.

## Opt-Out Handling

Inbound messages are checked for STOP-style commands:

- `STOP`
- `STOPALL`
- `UNSUBSCRIBE`
- `CANCEL`
- `END`
- `QUIT`

`START`, `YES`, and `UNSTOP` opt the number back in.
