# RDO Demo Seed Setup

The Enterprise Drone Division demo currently uses a guided fixture in code. The next step toward pilot readiness is making that fixture exportable as a repeatable seed package.

## Generate The Seed Package

Run:

```bash
npm run export:rdo-seed
```

This writes:

```text
output/rdo-enterprise-demo-seed.json
```

The export includes deterministic UUIDs, source slugs, linked enterprise rows, and readiness snapshots for each RDO application job.

## Included Row Groups

- organizations
- enterpriseDivisions
- divisionBlueprints
- farmLocations
- fields
- cropSeasons
- sprayPrograms
- sprayWindows
- enterpriseOperators
- operatorCredentials
- aircraft
- applicationJobs
- applicationRecords
- maintenanceRecords
- supportTickets
- performanceMetrics

## Important Guardrail

The seed package is a demo/pilot fixture, not live RDO production data.

Before loading into Supabase for a customer pilot, resolve the current schema split between the earlier training/operator tables and the newer enterprise tables. In particular, confirm the canonical tables for:

- operators
- operator credentials
- training enrollments
- practical evaluations
- readiness checks

Do not load this fixture into a production customer workspace until organization-scoped RLS policies replace the broad authenticated policies in the enterprise migration.

## Why This Exists

The guided UI remains useful for sales/demo conversations, while this JSON seed creates a bridge toward a real pilot tenant. It lets Harvest inspect the exact rows needed for the RDO pilot workflow before committing to a final migration or loader.
