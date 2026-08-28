# Sprint 4.7 — Global discovery UX

Extends Sprint 4.6 / 4.6.1. Does **not** start Sprint 5.

## Ownership (unchanged)

- `/taskmatch` — generic opportunity search. Canonical ignores query strings.
- `/companies/{slug}` — company intent, including current openings
- No `/jobs`, `/ai-training-jobs`, `/taskmatch/brazil`, `/taskmatch/coding`

Filtered URLs are shareable UI state, not indexable landing pages.

## JobPosting

Still disabled.

## UX vs AITraining.jobs

Product behavior studied (country query, work-type chips, platform counts,
pay prominence). Visual design, copy, and derived pay badges were **not**
cloned. Happy Tasking keep listing facts + company intelligence + TaskPulse +
TaskScore + TaskMatch.

## Indexes / migrations

Additive `20260828120000_taskmatch_discovery_indexes` only.
