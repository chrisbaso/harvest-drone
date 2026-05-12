# Harvest Drone OS Academy

Harvest Drone OS Academy is the operator onboarding, SOP, resource, and certification hub inside `/training`.

## Routes

- `/training` - learner Academy dashboard with assigned modules, lesson progress, SOP resources, Q&A, and certification status.
- `/admin/academy` - admin module editor for creating, editing, and reordering Academy modules and lessons.
- `/training/courses/:slug` - existing classic course reader for detailed course content.
- `/training/qualification` - existing qualification gate and readiness review.

## Data Model

The Academy migration is `supabase/migrations/20260508170000_harvest_drone_os_academy.sql`.

It creates:

- `academy_modules`
- `academy_lessons`
- `academy_resources`
- `academy_progress`
- `academy_certifications`
- `academy_comments`

Authenticated users can read published Academy content. Operators can manage their own progress. Admin, network manager, and dealer roles can manage Academy content and certification records.

## Seed Content

Shared demo seed content lives in `shared/academy.js` so the UI works locally before Supabase rows are connected.

Seeded sections include:

- Start Here
- Operator Training
- SOURCE Education
- Drone Safety
- Field Operations
- Enterprise Playbooks
- SOP Library
- Certification

The Operator Training module links existing Hylio content files from `content/training/hylio`. SOP resources link to existing checklist routes under `/training/checklists/...`.

## Adding A Module

For local/demo content:

1. Add a module object to `academySeedModules` in `shared/academy.js`.
2. Set `slug`, `title`, `description`, `category`, `estimatedMinutes`, `assignedRoles`, `certificationRequired`, and `sortOrder`.
3. Add lessons with `id`, `title`, `description`, `estimatedMinutes`, optional `videoUrl`, optional `contentPath`, and fallback `content`.
4. Add resources with `title`, `type`, `category`, and `url`.
5. Add checklist items in `completionChecklist`.
6. Run `node tests/academy.test.js`.

For database-backed content:

1. Insert into `academy_modules`.
2. Insert lessons into `academy_lessons` with `module_id`.
3. Insert SOPs, guides, and downloads into `academy_resources`.
4. Assign `assigned_roles` and `certification_required` so the tracker computes correctly.

## Progress And Certification

Progress is computed from completed lesson IDs. Certification moves through:

- Not Started
- In Progress
- Ready for Field Review
- Certified

An operator becomes `Ready for Field Review` after completing every certification-required lesson assigned to their role. An admin, dealer, or network manager marks the operator `Certified` after field review.
