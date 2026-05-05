# RDO Drone Division Demo

The RDO demo shows Harvest Drone OS as the command center for R.D. Offutt Farms building an internal Hylio drone application division for potatoes.

## Scenario

RDO is evaluating Harvest to help stand up an internal drone application capability. The demo follows repeated in-season potato application windows where the team must identify a spray window, confirm operator readiness, confirm aircraft readiness, block unsafe assignments, complete checklists, record the application, track support, and review performance.

## Demo Path

1. Open `/enterprise/rdo/division` for the command center.
2. Open `/enterprise/rdo/blueprint` to show the division buildout workflow.
3. Open `/enterprise/rdo/spray-calendar` to show upcoming potato spray windows.
4. Open `/enterprise/rdo/readiness` and select `GF Potato 18 rescue pass`.
5. Confirm that the assignment is blocked because the operator, credentials, aircraft calibration, battery checklist, documents, and SOP checklists are not ready.
6. Open `/enterprise/rdo/operators` and `/enterprise/rdo/fleet` to show the people and equipment sources behind the gate.
7. Open `/enterprise/rdo/application-records` for completed application evidence.
8. Open `/enterprise/rdo/support` for maintenance and support tickets.
9. Open `/enterprise/rdo/performance` for ROI and utilization reporting.

## Demo Data

The mock data lives in `shared/enterpriseDivision.js`.

It includes:

- Organization: R.D. Offutt Farms
- Crop: potatoes
- Locations: Grand Forks Valley Unit and Park Rapids Unit
- Operators with mixed readiness states
- Hylio aircraft examples with ready and blocked equipment states
- Spray windows with ready, blocked, and watching statuses
- Completed application records
- Maintenance records and support tickets
- Performance metrics for acres, readiness, utilization, and avoided outsource cost
