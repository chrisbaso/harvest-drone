# Open-Loop Detection

Open loops are normalized internal follow-up records in `ops_loops`. The goal is to surface work that might otherwise be missed, not to automate customer-facing action.

## Sources

- `gmail`: recent Gmail messages matching action language.
- `calendar`: calendar-related brief items.
- `jobber`: logged Jobber request, quote, job, and invoice events.
- `twilio`: inbound customer SMS replies.
- `slack`: reserved for future internal Slack signals.
- `internal`: Harvest OS loops and manual/internal items.

## Classification Types

- `customer_reply_needed`
- `quote_needed`
- `job_scheduling_needed`
- `invoice_followup`
- `calendar_followup`
- `rdo_followup`
- `maintenance_issue`
- `support_issue`
- `internal_admin_task`
- `unknown_review_needed`

## Signal Language

The first classifier is intentionally transparent and rule-based. It looks for phrases such as:

- `can you`
- `please send`
- `following up`
- `quote`
- `invoice`
- `schedule`
- `reschedule`
- `call me`
- `interested`
- `RDO`
- `Hylio`
- `SOURCE`

Maintenance terms and invoice/quote/scheduling terms take priority over broad enterprise terms so a SOURCE quote request is still treated as `quote_needed`.

## Draft Recommendations

`draft_response` is stored on open loops for email/SMS review. It begins with a draft-only approval warning and is never sent by the system.

## De-Duplication

The agent upserts loops by `(source, source_external_id)`. A Gmail message, Twilio message SID, Jobber external ID, or integration event ID should be used as the external ID whenever possible.

## Status Flow

- `open`: detected and waiting for review.
- `assigned`: owned by an admin or team member.
- `resolved`: completed.
- `ignored`: intentionally dismissed.

Resolved and ignored loops are excluded from the default Daily Ops Brief.

## Tests

`tests/dailyOps.test.js` covers:

- Classification logic.
- Open-loop candidate normalization.
- Brief count grouping.
- Draft-only response language.
- Migration coverage for the ops tables and encrypted token fields.
