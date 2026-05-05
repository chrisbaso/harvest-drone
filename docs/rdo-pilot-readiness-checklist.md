# RDO Pilot Readiness Checklist

## Data And Access

- [x] Canonical enterprise account model selected.
- [ ] RDO pilot tenant created in approved environment.
- [x] Organization-scoped RLS policies implemented.
- [ ] RDO users mapped to roles.
- [ ] Harvest support/admin role separated from RDO roles.

## Operators And Training

- [x] Operators can be created in local pilot demo mode.
- [ ] Operators can be created and edited in approved persistent storage.
- [ ] Training enrollment/progress persists for each operator.
- [ ] Practical signoff workflow persists evaluator, evidence, status, and date.
- [x] Domain role rules prevent ordinary users from signing their own practical qualification.
- [x] Domain role rules prevent ordinary users from verifying their own credentials.
- [ ] Persistent workflow enforces role rules server-side.
- [ ] Operator qualification scope is persisted by aircraft, payload, state, and operation type.

## Credentials

- [x] Credential records can be created.
- [x] Credential evidence can be uploaded or linked.
- [ ] Credential verification status can be reviewed by authorized roles only.
- [ ] Expiration logic blocks expired credentials.
- [ ] State/category pesticide requirements are configurable.

## Fleet And Readiness

- [x] Aircraft can be created in local pilot demo mode.
- [ ] Aircraft can be created and edited in approved persistent storage.
- [ ] Aircraft registration and Remote ID status are tracked.
- [ ] Calibration and battery checklist status are tracked.
- [ ] Maintenance blockers prevent assignment.

## Jobs And Records

- [x] Application jobs can be created in local pilot demo mode.
- [ ] Application jobs can be created in approved persistent storage.
- [ ] Jobs can be assigned only when readiness gates pass or authorized override is recorded.
- [ ] Required checklists attach to a job.
- [ ] Required documents attach to a job.
- [x] Application records can be created in local pilot demo mode.
- [ ] Application records can be created from completed jobs in approved persistent storage.
- [ ] Application records preserve operator, aircraft, field, weather/document, and attachment context.

## Support And Reporting

- [x] Support tickets can be created in local pilot demo mode.
- [ ] Support/maintenance tickets can be created and tracked in approved persistent storage.
- [ ] Dashboard metrics derive from persisted records.
- [ ] Pilot reports can be exported or reviewed.
- [ ] Audit trail exists for readiness checks, credential review, signoffs, and overrides.

## Verification

- [x] Unit tests cover readiness logic.
- [ ] Integration tests cover core persistence flows.
- [x] RLS tests prove tenant isolation.
- [ ] Browser smoke tests cover core RDO pages.
- [ ] Build passes in staging.
