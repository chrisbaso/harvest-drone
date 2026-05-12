# Harvest Drone Field Operations

## Overview

Harvest Drone Field Ops is the internal operations module for managing grower work from lead qualification through scheduling, operator assignment, flight execution, completion notes, and billing handoff.

It is not a Jobber clone. Jobber remains available as the external fallback and billing reference system while Harvest Drone OS becomes the day-to-day field workflow.

The internal product shape is intentionally simple for non-technical users:

- Ops is the daily work area.
- Academy is the training/SOP area.
- Ops links to Academy wherever training or checklists matter.

Primary routes:

- `/ops` operations dashboard
- `/ops/today` field-ready daily launch board
- `/ops/maps` job maps, field boundaries, hazards, and directions
- `/ops/fleet-map` last-known drone locations and fleet check-in board
- `/ops/guide` internal how-to guide and workflow video slots
- `/ops/leads` unified SOURCE/grower lead queue and conversion workspace
- `/ops/funnels` public sales funnels that feed the lead queue
- `/ops/daily-agent` admin-only Daily Ops Agent and morning brief
- `/ops/jobs` job board and list
- `/ops/jobs/new` fast job creation
- `/ops/jobs/:jobId` job detail
- `/ops/clients` grower/client records
- `/ops/farms` farm and field records
- `/ops/schedule` today/week/unscheduled schedule view
- `/ops/billing` completed-work and external invoice handoff queue
- `/ops/settings` services, statuses, operators, checklist templates, Jobber placeholder
- `/operator/jobs` simplified assigned-job view for operators
- `/training` Academy and training resources

Legacy internal starting points now resolve into this set:

- `/dashboard` -> `/ops`
- `/crm` -> `/ops/leads`
- `/dealer` -> `/ops`
- `/network` -> `/ops`
- `/scheduler` -> `/ops/schedule`
- `/admin/daily-ops` -> `/ops/daily-agent`

Admin-only integration, event-log, academy, compliance, and training pages still exist, but they are no longer competing daily CRM/dashboard entry points.

Sales funnel pages still exist as public demand-capture pages. Ops now has a single Sales Funnels tab that links to SOURCE acre review, grower services, operator recruiting, dealer signup, Hylio equipment, and ROI calculator funnels, with New Requests as the handoff point.

## Core Workflow

Lead comes in, gets qualified, then becomes an operations job. The conversion creates or links:

- client/grower
- farm/property
- field/acres
- job
- internal note copied from the lead

The job then moves through:

`new_request -> qualified -> quoted -> scheduled -> operator_assigned -> pre_flight -> in_progress -> completed -> invoice_needed -> closed`

`needs_review` and `cancelled` are also supported.

## Database Tables

New field ops tables:

- `clients`
- `farms`
- `services`
- `operator_profiles`
- `ops_jobs`
- `job_status_history`
- `job_notes`
- `job_checklists`
- `job_attachments`
- `activity_log`
- `jobber_links`
- `fleet_assets`
- `fleet_location_events`

Existing `public.fields` is extended with `farm_id`, `crop_type`, `notes`, and `updated_at`.

`ops_jobs.metadata_json` stores drone-operation details that are useful before a full map/router/product module exists:

- staging area
- field access notes
- weather window
- wind limit
- product rate and spray volume
- water source
- PPE and loadout notes
- forecast snapshot
- field map notes, hazards, and boundary readiness

Farm records can store latitude/longitude. Field records can store boundary GeoJSON. The current UI renders a lightweight field map preview, flight-lane sketch, hazard markers, copyable map packet, and external map/directions links. It does not require a paid map provider for the MVP.

Fleet tracking is check-in based for this phase. `fleet_assets` stores each drone, assigned operator, current job, and last-known position. `fleet_location_events` stores operator check-ins from the field app, including status, coordinates, accuracy, source, and timestamp. The `/ops/fleet-map` view shows drones as at yard, in transit, on site, flying, complete, or offline. This is intentionally clear about being last-known position tracking, not true vendor telemetry yet.

The module intentionally uses `ops_jobs` instead of the legacy `jobs` table because the existing `jobs.assigned_operator_id` is already tied to lead-routing operators. This avoids breaking the current fallback/routing workflow.

## Roles

Existing auth is preserved. The module maps current roles into field ops behavior:

- `admin` -> Admin / Owner
- `network_manager` -> Dispatcher / Ops Manager
- `dealer` -> Sales / Lead Manager
- `operator` -> Operator

The migration adds optional `user_profiles.ops_role` for future explicit ops roles:

- `admin`
- `owner`
- `dispatcher`
- `ops_manager`
- `sales`
- `lead_manager`
- `operator`

RLS protects organization-scoped data. Operators can read/update assigned jobs and related notes/checklists; managers can manage organization field ops records.

## Lead Conversion

The unified `/ops/leads` page and Harvest lead detail both include `Create Ops Job`.

Conversion copies:

- contact details
- farm name and location
- estimated acres / acreage range
- crops
- SOURCE interest
- timing and goal
- notes
- `created_from_lead_id`

If Supabase field ops tables are unavailable locally, the UI uses local demo storage so the workflow can still be exercised.

## Jobber Coexistence

Manual Jobber references are supported:

- `clients.jobber_client_id`
- `ops_jobs.jobber_job_id`
- `ops_jobs.jobber_request_id`
- `jobber_links.jobber_url`

Job detail shows linked/not-linked status and supports manual Jobber ID/URL entry.

The `/ops/billing` queue is intentionally a handoff tool, not an accounting system. It shows completed work, invoice-needed jobs, missing Jobber references, estimated service totals, acres, and quick close actions after billing is handled externally.

Placeholders are intentionally disabled for:

- Send to Jobber
- Sync from Jobber
- Jobber OAuth

## Checklists

Checklists are JSON-backed in `job_checklists.items_json`.

Default templates:

- Pre-flight checklist
- Chemical/product checklist
- Weather check
- Completion checklist

Operators can complete checklist items from `/operator/jobs/:jobId`.

Operators can also send drone check-ins from the job detail page. The check-in uses phone GPS when the browser allows it and falls back to the job/farm location when GPS is unavailable.

## Dispatch Readiness

The dashboard, job cards, job detail, schedule, and operator view all use the same shared readiness rules. A job can be:

- `ready`
- `attention`
- `blocked`
- `review`
- `closed`

Readiness checks look for missing grower contact, field/acres/product details, field boundary, schedule, operator assignment, weather risk, pre-flight completion, completion notes, invoice handoff, and Jobber reference gaps.

## What Is Not Built Yet

This phase intentionally does not include:

- full invoicing
- payroll
- advanced routing
- native mobile apps
- two-way Jobber sync
- Jobber OAuth
- QuickBooks sync
- full map drawing/editing
- live drone telemetry/vendor flight feed
- customer portal

## Future Roadmap

- Jobber OAuth integration
- QuickBooks integration
- Stripe payment links
- map drawing and boundary import tools
- live drone telemetry integrations
- route optimization
- automated SMS/email notifications
- AI-generated job summaries
- operator mobile app
- customer portal
