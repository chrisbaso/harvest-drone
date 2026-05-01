# Blockers

## Supabase remote database push blocked

- The database password was reset on 2026-05-01 and `npx supabase db push --linked --yes` successfully connected to the linked database.
- The push applied migrations through `20260501090000_dealer_multitenant_platform.sql`.
- Migration files with duplicate date-only versions were renamed to unique timestamp versions so Supabase can track them safely.
- The next pending migration, `20260501100000_priority1_stability_automation.sql`, initially failed because the remote `drip_emails` table already existed without newer columns such as `slug`. The migration now includes `add column if not exists` compatibility guards for existing drip tables.
- The immediate retry hit Supabase's temporary auth circuit breaker: `FATAL: (ECIRCUITBREAKER) too many authentication failures, new connections are temporarily blocked`.
- Impact: remote trigger inspection, drip seed counts, remaining migration application, and `cron.job` verification should be retried after the Supabase database auth lockout clears.
- Completed despite this blocker: `npx supabase functions list` works through `npx`, and `enroll-lead`, `mark-paid`, and `process-drip-queue` were deployed successfully on 2026-05-01.
- Mitigation already committed in code: `20260501100000_priority1_stability_automation.sql` defines the missing expected drip tracking tables, seed data, CRM sync triggers, and 15-minute cron schedule idempotently.
