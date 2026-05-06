# RDO Enterprise Drone Division OS Audit

Date: 2026-05-05

## Overall Classification

Harvest Drone OS is demo-ready for a guided RDO Enterprise Drone Division conversation. It is partially pilot-ready for workflow prototyping, but not yet enterprise-ready because live enterprise persistence, organization-scoped RLS, evidence storage, and server-side readiness enforcement still need hardening.

## Area Classification

| Area | Status | Audit note |
|---|---|---|
| Authentication and roles | Risky | Supabase Auth and frontend route guards exist, but some protected routes are broad and enterprise RLS is not org-scoped. |
| Organization/account model | Partially ready | Dealer/network/user profile model exists; enterprise organization tables and seed fixture exist, but the app still uses fixture data. |
| Enterprise/RDO account workspace | Partially ready | RDO workspace routes and guided demo path exist; needs live workspace data loading and account-scoped permissions. |
| Operator records | Partially ready | RDO operators exist in fixture data and seed export; pilot needs create/edit/manage workflows and persistence. |
| Operator training | Partially ready | Curriculum, lessons, assessments, local progress, and readiness logic exist; live operator progress is not fully persisted. |
| Credential tracking | Risky | Credential model and readiness checks exist, but schema has competing table shapes and no evidence upload/review flow. |
| Practical qualification/signoff | Partially ready | Practical templates and role rules exist; live signoff workflow and audit events are incomplete. |
| Fleet/aircraft records | Partially ready | Fleet fixture, aircraft readiness, and seed export exist; create/edit/manage workflows are needed. |
| Aircraft readiness | Partially ready | Calibration, battery checklist, maintenance blocker logic exists in fixture/readiness logic; needs persistent inspection records. |
| Spray calendar/application windows | Partially ready | RDO spray calendar exists with readiness status; no live scheduling workflow yet. |
| Job/application workflow | Partially ready | Demo jobs and blocked readiness gate exist; live job creation/assignment is not enforced server-side. |
| Readiness checks/blockers | Partially ready | Deterministic engine and tests exist; readiness snapshots export to seed; needs persisted checks and server-side enforcement. |
| Application records | Partially ready | Completed records view exists; create/edit/attachment workflow is missing. |
| Maintenance/support tickets | Partially ready | Demo ticket view exists; creation/tracking workflow and assignee history are missing. |
| Dashboards/reporting | Partially ready | Dashboard KPIs and performance cards exist; reporting is fixture-based. |
| Mobile usability | Partially ready | Browser smoke checks pass for RDO routes after table overflow fix; broader device QA remains. |
| Supabase schema/migrations | Risky | Enterprise tables exist, but RLS policies are broad and some migrations define overlapping credential/readiness/training table shapes. |
| Tests | Partially ready | Unit/domain tests cover readiness, demo path, seed export, and lead logic; no persistent integration or RLS tests yet. |
| Deployment readiness | Partially ready | Vite/Vercel build passes; production data setup and migration sequence need hardening before pilot. |
| Security/data handling | Risky | Demo data is clearly labeled, but real pilot requires org isolation, evidence storage policy, audit logs, and role-based approvals. |

## Key Risks Before A Real RDO Pilot

- Broad `authenticated` RLS policies on new enterprise tables are not acceptable for customer data.
- Enterprise UI still reads from fixture/local state, not canonical Supabase workspace tables.
- Training and enterprise operators are split between `operator_leads` and `enterprise_operators` concepts.
- Credential and readiness tables have overlapping versions across migrations.
- Readiness is computed client-side for demo; assignment blocking must be enforced server-side before pilot use.
- File evidence upload, audit history, and immutable application record snapshots are missing.

## Current Demo Strengths

- RDO Enterprise Drone Division dashboard and route sequence exist.
- Operators, credentials, training, practical signoffs, aircraft readiness, spray windows, application jobs, blockers, support, records, and performance data are visible.
- A blocked job clearly explains why it cannot be assigned.
- The demo fixture is labeled as not live RDO production data.
- A deterministic seed JSON export exists for pilot data review.
