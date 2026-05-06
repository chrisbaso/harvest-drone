# Harvest OS Build Backlog

Last updated: 2026-05-06

## P0: Immediate Organization / Internal Ops

1. Admin Integration Dashboard: built at `/admin/integrations`; continue by adding live provider health checks as credentials become available.
2. Integration Event Log: built at `/admin/integration-events`; continue by expanding event filtering and payload drill-down.
3. Daily Ops Agent: built at `/admin/daily-ops` with graceful placeholders and service foundation.
4. Open Loops Dashboard: built at `/admin/open-loops`; continue by adding real owner assignment once the user system is finalized.
5. Slack Alerts: foundation built with safe disabled-by-default Daily Ops and alert helpers.
6. Twilio SMS Foundation: inbound/outbound logging, opt-out detection, status callback, and dry-run send foundation built.
7. Google Workspace Foundation: OAuth, encrypted token storage, Gmail, and Calendar abstractions built; needs account authorization.
8. Jobber Integration Foundation: GraphQL client, webhook endpoint, external ID mapping, and sync stubs built; needs Jobber account config.
9. Weekly Leadership Brief: built at `/admin/weekly-brief`.
10. Profit Center Scoreboard: built at `/admin/profit-centers`.

## P1: RDO / Enterprise Demo

1. RDO Enterprise Drone Division dashboard: built at `/enterprise/rdo/division`.
2. RDO demo data: built through local enterprise workspace seed/demo data.
3. RDO blueprint workflow: built at `/enterprise/rdo/blueprint`.
4. Operator readiness view: built at `/enterprise/rdo/operators` and `/enterprise/rdo/readiness`.
5. Credential tracking view: partially built through operator readiness/training; needs real upload/expiration logic.
6. Fleet readiness view: built at `/enterprise/rdo/fleet`.
7. Spray calendar/application window view: built at `/enterprise/rdo/spray-calendar`.
8. Job readiness blockers: built at `/enterprise/rdo/readiness`.
9. Application record examples: built at `/enterprise/rdo/application-records`.
10. RDO demo script: existing docs include RDO demo script/runbook; keep aligned with current routes.

## P2: Pilot Readiness

1. Real organization/account structure.
2. Operator management.
3. Aircraft/fleet management.
4. Training progress tracking.
5. Practical signoff tracking.
6. Credential upload and expiration logic.
7. Job/application workflow.
8. Real readiness engine.
9. Preflight/postflight checklist attachment.
10. Support/maintenance tickets.
11. Role permissions.
12. Tests and smoke checks.

## P3: Future Profit-Center Modules

1. SOURCE/Input ROI deployment module.
2. Dealer Drone Success module.
3. Drone Program Rescue module.
4. Custom Applicator Add-On module.
5. Aerial Scouting/Issue Detection module.
6. Claims/Damage Documentation module.
7. Sustainability/Practice Verification module.
8. Proposal Generator.
9. Harvest Knowledge Base.
10. Customer/Prospect Intelligence Briefing Agent.

## Next Implementation Priority

The next best build phase is P2 readiness hardening:

1. Create real org/account structure that can support Harvest internal ops, RDO demo, and future enterprise customers.
2. Move local RDO demo state toward Supabase-backed operator, fleet, credential, job, support, and application-record tables.
3. Add role-specific permissions and smoke tests around admin/enterprise flows.
4. Add real Jobber/Google/Twilio integration setup only after credentials and account authorization are approved.
