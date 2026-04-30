# Compliance Readiness

Harvest OS should track credential status and readiness blockers without claiming to grant legal certification.

## Credential Types

- FAA Part 107
- FAA Part 107 recency
- Part 137 / AAOC
- Section 44807 exemption
- Drone registration
- Remote ID
- Pesticide applicator license
- Medical certificate where required
- Insurance
- Hylio onboarding/training completion
- Harvest internal qualification
- Other configurable requirements

## Readiness Gates

For Hylio jobs, the readiness service checks the operator, aircraft, payload, state/category, checklist status, documents, weather acknowledgement, and overdue records.

Hard blockers should be used for missing legal or safety-critical requirements. Warnings can be used for administrative items if Harvest policy allows a chief pilot or admin override.

## Versioning

Training content should be versioned with code. A content version change can trigger recurrent training for affected operators, especially after Hylio firmware/software/SOP updates or incident learnings.
