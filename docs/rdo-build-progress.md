# RDO Build Progress

## Active Goal
Make Harvest Drone OS demo-ready and pilot-ready for the RDO Enterprise Drone Division Launch Program.

## Current Phase
Phase F - Tests, polish, and docs; continuing into pilot-readiness hardening.

## Completion Standard
The goal is not complete until the demo-readiness and pilot-readiness checklists are complete or blocked.

## P0 Demo-Ready Backlog
- [x] Enterprise dashboard
- [x] RDO demo data
- [x] Operator readiness
- [x] Credential status
- [x] Fleet readiness
- [x] Spray calendar
- [x] Job readiness blockers
- [x] Application record example
- [x] Support ticket example
- [x] Demo script

## P1 Pilot-Ready Backlog
- [ ] Real org/account structure
- [x] Operator CRUD or management
- [x] Aircraft/fleet CRUD or management
- [x] Credential upload/tracking
- [x] Training progress tracking
- [x] Practical signoff tracking
- [x] Application job creation
- [x] Readiness engine
- [x] Checklist attachment
- [x] Application records
- [x] Support tickets
- [x] Role permissions
- [x] Tests/smoke checks

## Completed
| Date | Item | Files | Tests |
|---|---|---|---|
| 2026-05-05 | Built RDO Enterprise Drone Division dashboard, route set, demo fixture, and readiness logic. | `src/pages/EnterprisePage.jsx`, `shared/enterpriseDivision.js`, `src/App.jsx`, `src/components/Shell.jsx` | `npm test`, `npm run build` |
| 2026-05-05 | Added RDO guided demo path, fixture labeling, demo script, and demo/pilot readiness docs. | `docs/rdo-demo-script.md`, `docs/rdo-demo-readiness-checklist.md`, `docs/rdo-pilot-readiness-checklist.md`, `docs/rdo-os-audit.md` | `npm test`, browser smoke check |
| 2026-05-05 | Added repeatable RDO seed export package. | `shared/enterpriseSeed.js`, `scripts/export-rdo-enterprise-seed.mjs`, `output/rdo-enterprise-demo-seed.json`, `docs/rdo-demo-seed-setup.md` | `npm run export:rdo-seed`, `tests/enterpriseSeed.test.js` |
| 2026-05-05 | Added local editable pilot workspace for operators, aircraft, application jobs, records, and support tickets. | `shared/enterpriseWorkspace.js`, `src/lib/enterpriseLocalStore.js`, `src/pages/EnterprisePage.jsx`, `src/components/enterprise/EnterpriseStyles.jsx` | `tests/enterpriseWorkspace.test.js`, browser interaction smoke |
| 2026-05-05 | Added role-rule guards for credential verification and practical signoff. | `shared/trainingProgram.js`, `tests/trainingProgram.test.js` | `npm test` |
| 2026-05-05 | Drafted org-scoped enterprise RLS hardening migration without applying it. | `supabase/migrations/20260505130000_enterprise_org_scoped_rls.sql`, `tests/enterpriseRlsMigration.test.js` | `tests/enterpriseRlsMigration.test.js` |
| 2026-05-05 | Added local pilot readiness actions for training completion, practical signoff, tracked credential evidence, aircraft service clearance, and job checklist/document evidence. | `shared/enterpriseWorkspace.js`, `src/pages/EnterprisePage.jsx`, `src/components/enterprise/EnterpriseStyles.jsx`, `tests/enterpriseWorkspace.test.js` | `npm test`, `npm run build`; Playwright shell smoke blocked by local `spawn EPERM` |
| 2026-05-05 | Resolved repo-side pilot blockers for legacy training table compatibility, enterprise-scoped credential evidence storage, and storage upload path generation. | `supabase/migrations/20260505140000_enterprise_pilot_schema_storage.sql`, `shared/enterpriseEvidence.js`, `src/lib/enterpriseEvidenceStorage.js`, `tests/enterpriseEvidence.test.js`, `tests/enterpriseRlsMigration.test.js`, `package.json` | `npm test`, `npm run build` |
| 2026-05-05 | Applied pending Supabase migrations to the linked remote database after fixing migration compatibility and timestamp collision. | `supabase/migrations/20260505090000_enterprise_drone_division.sql`, `supabase/migrations/20260505091000_generic_demo_dealer_seed.sql` | `npx supabase db push --dry-run`, `npx supabase db push --yes`, `npx supabase migration list`, `npm test`, `npm run build` |

## Blockers
| Date | Blocker | Needed from human |
|---|---|---|
| 2026-05-05 | Headless Playwright browser smoke could not launch in this Windows sandbox (`spawn EPERM`). | Run local browser smoke manually or allow a browser-capable environment for automated UI verification. |

## Next Actions
1. Run a database smoke that creates an RDO organization member, uploads credential evidence to `enterprise-credential-evidence`, and verifies tenant-scoped reads.
2. Replace local pilot workspace persistence with Supabase-backed reads/writes now that migrations are present remotely.
3. Run browser verification in an environment where Playwright/Chromium can launch.
