# Harvest Drone Ops Internal Guide

This guide explains how internal Harvest Drone team members should use the Ops area day to day. The goal is simple: keep leads, growers, fields, jobs, schedules, operators, checklists, completion notes, and external billing handoff in one place.

## Daily Start

1. Open `/ops`.
2. Review Today's Operations.
3. Check Next best actions and Readiness.
4. Open `/ops/leads` for new requests before creating jobs manually.
5. Open `/ops/schedule` to confirm operator assignments and loadout.
6. End the day in `/ops/billing` to flag completed work for Jobber or QuickBooks.

## Workflow 1: Lead To Ops Job

Use this when a SOURCE, grower, or partner request comes in through a funnel.

1. Open `/ops/leads`.
2. Review contact, farm, acres, crop, timing, SOURCE interest, and notes.
3. Use `Create Ops Job` when the request is qualified enough for a real next step.
4. Open the new job detail page.
5. Confirm client, farm, field, acres, service, product, and notes.
6. Leave the job unscheduled if timing, product, or field details are not ready.

Suggested video: `ops-01-lead-to-job`

## Workflow 2: Create A Job From A Phone Call

Use this when someone calls or texts with work that is not already in the lead queue.

1. Open `/ops/jobs/new`.
2. Add or select the grower.
3. Add or select farm and field details.
4. Capture acres, crop, service type, product notes, and requested timing.
5. Add staging, access, weather window, water source, and application details when known.
6. Add quote or billing handoff details if known.
7. Create the job.

Suggested video: `ops-02-new-job-from-call`

## Workflow 3: Schedule And Assign Work

Use this during dispatch planning.

1. Open `/ops/schedule`.
2. Review Today, This Week, and Unscheduled.
3. Pick a scheduled start time.
4. Assign an operator.
5. Review readiness warnings before confirming the job.
6. Check loadout and weather cards for the day.

Suggested video: `ops-03-schedule-and-assign`

## Workflow 4: Operator Field Execution

Use this from the operator workspace.

1. Open `/operator/jobs`.
2. Choose the assigned job.
3. Review grower contact, farm, field, staging, access, product, weather, and loadout.
4. Complete checklist items before launch.
5. Update status as work starts.
6. Mark the job complete after completion notes are captured.

Suggested video: `ops-04-operator-field-work`

## Workflow 5: Billing Handoff

Use this after field work or consultation work is complete.

1. Open `/ops/billing`.
2. Review completed and invoice-needed jobs.
3. Confirm acres, estimated total, Jobber reference, and missing handoff details.
4. Flag invoice needed when completed work is ready for external billing.
5. Close the job after Jobber or QuickBooks handoff is finished.

Suggested video: `ops-05-billing-handoff`

## Workflow 6: Daily Ops Agent

Use this during morning admin review.

1. Open `/ops/daily-agent`.
2. Review priority items and recommended moves.
3. Check Jobber loops, email follow-ups, SMS replies, and calendar items.
4. Open loops when a follow-up needs tracking.
5. Regenerate the brief after integrations or open loops change.

Suggested video: `ops-06-daily-agent`

## Video Assets

First-pass silent workflow videos have been generated under `/public/training-videos/ops/generated/` and are linked from `/ops/guide`:

- `/training-videos/ops/generated/ops-01-lead-to-job.webm`
- `/training-videos/ops/generated/ops-02-new-job-from-call.webm`
- `/training-videos/ops/generated/ops-03-schedule-and-assign.webm`
- `/training-videos/ops/generated/ops-04-operator-field-work.webm`
- `/training-videos/ops/generated/ops-05-billing-handoff.webm`
- `/training-videos/ops/generated/ops-06-daily-agent.webm`

Regenerate them with:

```text
python scripts/generate-ops-videos.py
```

## Video Production Plan

Keep each video short and practical.

- Length: 3-5 minutes.
- Format: screen recording with voiceover.
- Scope: one workflow per video.
- Audience: non-technical internal team members.
- Storage: place finished files in the Academy or under `/public/training-videos/ops/`.
- Naming: use the suggested slugs above.

Each video should show the exact clicks, what information to enter, and what a good finished record looks like. Avoid explaining future roadmap features unless the workflow depends on them.

## What Not To Do In Ops

- Do not create accounting records here.
- Do not treat the billing queue as QuickBooks.
- Do not schedule application work before field, product, acres, operator, and weather details are credible.
- Do not use Jobber sync buttons until the integration phase is built.
- Do not put sensitive customer-facing promises into internal notes.
