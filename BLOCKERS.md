# Blockers

## Supabase remote database push blocked

- `npx supabase db push --linked` reaches the linked project, but Supabase rejects the temporary database login with `FATAL: (ECIRCUITBREAKER) too many authentication failures`.
- The CLI reports: `Connect to your database by setting the env var correctly: SUPABASE_DB_PASSWORD`.
- `SUPABASE_DB_PASSWORD` is not set in this shell or in `.env`.
- Impact: remote trigger inspection, drip seed counts, migration application, and `cron.job` creation cannot be completed from this environment until the linked project's database password is provided.
- Completed despite this blocker: `npx supabase functions list` works through `npx`, and `enroll-lead`, `mark-paid`, and `process-drip-queue` were deployed successfully on 2026-05-01.
- Mitigation already committed in code: `20260501_priority1_stability_automation.sql` defines the missing expected drip tracking tables, seed data, CRM sync triggers, and 15-minute cron schedule idempotently.
