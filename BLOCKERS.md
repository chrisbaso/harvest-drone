# Blockers

## Live browser route verification blocked

- `npm run dev -- --host 127.0.0.1 --port 5173` fails while Vite loads config with `Error: spawn EPERM` from esbuild startup.
- Impact: route verification is limited to `npm run build` module compilation in this environment; live browser console checks still need to be run once local process spawning is allowed.

## Supabase CLI and remote database verification blocked

- `supabase functions list` fails because `supabase` is not installed on PATH in this environment.
- Impact: function deployment, live trigger inspection, drip seed counts, and `cron.job` verification cannot be confirmed remotely here.
- Mitigation added in code: `20260501_priority1_stability_automation.sql` defines the missing expected drip tracking tables, seed data, CRM sync triggers, and 15-minute cron schedule idempotently.
