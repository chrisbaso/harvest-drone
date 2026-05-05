# Readiness Gates

Harvest readiness gates prevent an operator and aircraft from being assigned to an application job until the configured rules pass.

## Hard Gates

For the RDO demo, an assignment is blocked when any of these fail:

- Hylio Operator Foundations training is incomplete.
- Required assessments are not passed.
- Practical signoff is incomplete.
- Required credentials are missing, pending, rejected, or expired.
- State/category pesticide applicator credential is not verified when pesticide application is involved.
- Operator is not qualified for the aircraft model.
- Operator is not qualified for the payload type.
- Aircraft is inactive.
- Aircraft registration or Remote ID readiness is not verified.
- Aircraft has an open maintenance blocker.
- Aircraft calibration is overdue.
- Battery inspection checklist is incomplete.
- Required SOP checklists are incomplete.
- Required job documents are not attached.
- Weather/drift precheck is not acknowledged.
- Prior application records are overdue.

## Configurability

Readiness requirements vary by state, aircraft, payload, operation type, crop, product label, insurance profile, and customer policy. Harvest OS should store rule configuration and snapshots rather than assuming one fixed national rule.

## Example Blocker Copy

Use direct operational copy:

Cannot assign this job:

- Operator has not completed Hylio practical signoff.
- Pesticide applicator license for this state is missing.
- Aircraft calibration is overdue.
- Battery inspection checklist is incomplete.

Harvest should not claim to issue FAA, state, pesticide, manufacturer, or insurance certifications.
