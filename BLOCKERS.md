# Blockers

## Supabase trigger SQL verification blocked

- The database password was reset on 2026-05-01 and `npx supabase db push --linked --yes` successfully connected to the linked database.
- The push applied all pending migrations, including `20260501100000_priority1_stability_automation.sql` and `20260501110000_training_operator_qualification_module.sql`.
- Migration files with duplicate date-only versions were renamed to unique timestamp versions so Supabase can track them safely.
- The drip automation migration was made compatible with existing remote drip tables by adding missing-column guards and seed body content for `body_html`.
- Verified `cron.job` contains `process-drip-queue-every-15-min` on schedule `*/15 * * * *`.
- Verified drip seed counts through the Supabase API: `grower-welcome` 7 emails, `operator-welcome` 5 emails, `source-order` 2 emails, and `source-post-purchase` 4 emails.
- Remaining blocker: direct SQL trigger inspection currently hits Supabase's temporary auth circuit breaker: `FATAL: (ECIRCUITBREAKER) too many authentication failures, new connections are temporarily blocked`.
- Retry after the lockout clears:
  `npx supabase db query --linked "select trigger_name from information_schema.triggers where trigger_name in ('trg_enroll_grower','trg_enroll_operator','trg_enroll_source','trg_sync_grower_to_crm','trg_sync_operator_to_crm') order by trigger_name;"`
