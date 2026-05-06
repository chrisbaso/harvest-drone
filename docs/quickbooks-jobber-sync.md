# QuickBooks and Jobber Sync Strategy

Harvest Drone should not build direct QuickBooks Online integration first.

## Near-Term Owner

Jobber should own the QuickBooks Online sync for:

- clients
- products and services
- quotes and invoices
- payments
- customer-facing job financial workflow

Harvest OS should read operational status from Jobber and treat QuickBooks as the accounting ledger downstream from Jobber.

## Harvest OS Role

Harvest OS should focus on operational intelligence around the work:

- which Jobber jobs are drone-ready
- whether operators, credentials, aircraft, labels, and weather gates are ready
- whether application records and support issues are complete
- whether RDO or enterprise rollout blockers exist
- performance reporting that combines acres, readiness, and operational outcomes

## Later Direct API Phase

Build a direct QuickBooks API integration only if Harvest Drone needs deeper financial analytics that Jobber cannot expose cleanly, such as:

- margin by crop, aircraft, operator, or territory
- cost allocation across enterprise drone divisions
- RDO financial reporting rollups
- reconciliation between operational acres and accounting revenue

Until then, Jobber remains the business-workflow source of truth and QuickBooks remains the accounting system reached through Jobber sync.
