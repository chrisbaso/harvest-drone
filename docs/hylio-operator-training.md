# Hylio Operator Training

Seed curriculum lives in `content/training/hylio` and runtime seed data lives in `shared/trainingProgram.js`.

## Courses

- Hylio Operator Foundations
- Hylio Practical Qualification
- Hylio Recurrent Training

## Adding a Lesson

Add concise Harvest-authored content under `content/training/hylio`, then add or update the matching lesson object in `shared/trainingProgram.js`. Use `officialMaterialRequired` and `officialLink` when operators need official Hylio material.

## Adding a Quiz

Add a JSON metadata file under `content/training/hylio/quizzes` and add the assessment questions to `shared/trainingProgram.js`. Keep questions general and avoid legal advice beyond requiring verification from current FAA/state sources.

## Adding a Practical Rubric

Add a template to `practicalEvaluationTemplates` in `shared/trainingProgram.js`. Rubric items should support pass/fail, notes, evaluator, evidence, timestamp, required/optional flags, and retest flags in the database schema.

## Qualification Levels

- Observer: can watch jobs and complete online training.
- Trainee: can assist under direct supervision.
- Qualified Operator: can operate assigned Hylio missions under Harvest SOPs.
- Lead Operator: can supervise trainees and sign practical rubrics.
- Chief Pilot / Compliance Admin: owns final qualification, Part 137/AAOC readiness, and recurrent review.
