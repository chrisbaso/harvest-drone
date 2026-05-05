# RDO Enterprise Drone Division Pilot Leave-Behind

## Purpose

This pilot is designed to prove that R.D. Offutt Farms can operate an internal drone application division with clear readiness gates, application records, support workflow, and performance reporting.

RDO owns the capability: aircraft, operators, crop priorities, field decisions, and operating accountability. Harvest provides the implementation playbook, Harvest OS, training workflow, readiness gate configuration, support process, maintenance coordination, and operating rhythm.

## Proposed Pilot Scope

- Crop: potatoes.
- Locations: two representative operating locations.
- Operators: three mixed-readiness operators.
- Aircraft: three Hylio aircraft examples, including one maintenance-blocked aircraft.
- Jobs: repeated in-season application windows with ready, watching, and blocked assignments.
- Operating result: RDO can see whether a job is ready, blocked, or needs review before dispatch.

## Workshop Inputs

- Initial field/location list.
- Operator roster and role expectations.
- Aircraft roster, payload configurations, batteries, and maintenance status.
- Credential matrix by state, category, aircraft, payload, and operation type.
- Required SOP/checklist list.
- Application record requirements and attachment expectations.
- Support escalation contacts.
- First spray-calendar assumptions.

## Readiness Decisions To Configure

- Which credentials are tracked for each state and operation type.
- Which credential evidence must be verified before assignment.
- Which practical signoffs are required for each aircraft and payload.
- Which aircraft readiness checks are hard blockers.
- Which checklists and documents are mandatory before dispatch.
- Which users can approve, remediate, or override readiness findings.
- Which application records are required before a job is considered closed.

## Pilot Success Criteria

- RDO can identify an upcoming spray window in Harvest OS.
- RDO can see whether the proposed operator and aircraft are ready under Harvest rules.
- Unsafe or non-compliant assignments are blocked before dispatch.
- Required checklists and documents are visible before launch.
- Completed application records can be reviewed after the job.
- Maintenance and support tickets are visible beside aircraft readiness.
- Pilot reporting shows acres, ready jobs, blocked jobs, utilization, and support load.

## What This Pilot Does Not Claim

Harvest OS does not issue FAA, state, pesticide, medical, insurance, or manufacturer certifications. It tracks credential evidence, review status, expiration dates, internal qualification, and readiness under configured Harvest rules.

## First Two-Week Build Path

1. Stabilize the guided RDO demo path.
2. Add demo fixture labeling so RDO understands what is live workflow versus sample data.
3. Add smoke coverage for the demo sequence and blocked rescue-pass assignment.
4. Polish authentication and route access for the guided demo.
5. Prepare a workshop-ready leave-behind and presenter guide.
6. Export a repeatable RDO demo seed package for pilot data review.
7. Run mobile and desktop QA on the RDO route sequence.

## Pilot Build Path After Demo

1. Normalize enterprise data models and remove schema conflicts.
2. Replace broad authenticated policies with organization-scoped RLS.
3. Persist enterprise operators, aircraft, jobs, credentials, support tickets, and application records.
4. Enforce readiness server-side before assignment.
5. Add file evidence upload and audit history.
6. Add pilot reporting exports for RDO operators, compliance, and operations leaders.
