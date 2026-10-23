# Plan value design

Status: implemented on `seo/gsc-audit-2026-10`. Limits live in
`src/payment/plan-entitlements.ts` (`PLAN_LIMITS`); every number in pricing,
FAQ, billing, and usage copy is filled from that constant.

## Problem

Before this change every signed-in teacher could do everything, whatever
their plan. Teacher Pro and Early Supporter charged money for nothing that the
code enforced, and the public copy had to be rewritten to say so.

## Who pays and why

Teachers (individual classroom teachers and tutors) arrive with one job:
turn this week's lesson content into a game, send one link, and see who
struggled. Jobs to be done, in order of frequency:

1. Try a template with real content before committing (first session).
2. Run a handful of activities for one or two classes each week.
3. Build a reusable library across units, classes, and terms.
4. Draft activities quickly from lesson notes (AI drafts).

Free must do jobs 1 and 2 well. Jobs 3 and 4 scale with how much the teacher
relies on ClassGamify, which is what is worth paying for.

## Principles

- **The full loop is free.** Every template, publishing, student play,
  results, item analysis, CSV export, and printing work on the free plan.
- **Never hold student data hostage.** Results, attempts, exports, and
  printing are never limited and never depend on the plan.
- **Never block students.** Limits only apply when a teacher creates new
  work. Submitting to an assignment that is already open always works.
- **Never delete on downgrade.** When a paid plan ends, everything stays:
  activities, open links, results. The free limits apply only to new
  creation beyond the cap.
- **Gate what already exists and is cheap to count.** No invented features.
  Each limit is a single owner-scoped count that the server checks before
  writing.

## Packaging

| | Free | Teacher Pro | Early Supporter |
|---|---|---|---|
| Templates, results, CSV export, printing | All | All | All |
| Active activities (not archived) | 15 | Unlimited | Unlimited |
| Open assignment links at a time | 3 | Unlimited | Unlimited |
| AI drafts per calendar month (UTC) | 10 | 300 (fair use) | 300 (fair use) |
| Billing | Free | Monthly or yearly | One-time payment |

Prices and Creem/Stripe products are unchanged.

### Why these numbers

- **15 active activities** covers a few weeks of real classes and the whole
  template catalog twice, so a teacher can judge the product honestly.
  Archiving frees a slot, so the limit rewards tidy libraries rather than
  forcing deletion.
- **3 open links** lets a teacher run one assignment per class for up to three
  classes at once. Closing a link (or letting it expire) frees a slot, and
  closed links keep their results.
- **10 AI drafts a month** is enough to feel the speed-up, while AI is the
  only feature with a real per-use cost. Paid plans get 300 a month as a
  fair-use ceiling that protects the Workers AI budget.

### What counts

- Activities: rows owned by the teacher whose visibility is not `archived`.
  Creating, duplicating, remixing, and restoring from the archive each add
  one and are checked. Editing never is.
- Open assignment links: assignments with status `published` whose close
  time is empty or in the future. Publishing and reopening are checked.
  Closing, expiry, and student submissions are never checked.
- AI drafts: one row in `ai_draft_usage` per successful draft request
  (including the offline fallback draft), counted since the start of the
  current UTC month.

Checks run on the server inside the server functions
(`src/api/activities.ts`, `src/api/assignments.ts`, `src/api/activity-ai.ts`)
before any write. Two simultaneous requests can exceed a cap by one; that is
accepted as a soft limit rather than adding locking to every write.

## Subscription states

Resolved from the existing `payment` table (`resolveEntitlementPlan`):

| Payment record | Plan |
|---|---|
| Completed one-time lifetime payment | Early Supporter (never expires) |
| Subscription `active` or `trialing` (including cancel at period end) | Teacher Pro |
| Subscription `past_due` | Teacher Pro until 7 days after the period end, then free |
| Subscription `canceled` with a future period end | Teacher Pro until the period end |
| Anything else, or no payment | Free |

A paid subscription whose price id is not in the current config still counts
as Teacher Pro, so a price rotation can never silently downgrade a payer.

## Migration policy (grandfathering)

- No data changes. Existing activities, assignments, attempts, and exports
  stay readable, editable, closable, and exportable on every plan.
- A free teacher who is already above a cap keeps everything; only new
  creation of that kind is blocked until usage drops below the cap.
- A teacher whose subscription ends keeps every open link open. They cannot
  publish or reopen more until they are under 3 open links.
- The only schema change is the new `ai_draft_usage` table (migration
  `0016`), which must be applied to the remote D1 database before deploy.

## UI and copy principles

- Show usage before the wall: the dashboard and activity library show
  "used of limit" for each counted resource on the free plan.
- When a limit is reached, say what happened, what still works, and the two
  ways forward (free up a slot, or upgrade), with a "View plans" action.
- Sentence case, no urgency tricks, no countdowns, all 10 locales.
- Pricing, plan cards, pricing FAQ (visible and JSON-LD), home FAQ, and
  billing settings describe exactly the enforced limits, using the same
  numbers from `PLAN_LIMITS`.

## Owner sign-off needed

- Apply migration `0016_ai_draft_usage` to remote D1 before deploying.
- Update the Teacher Pro and Early Supporter product descriptions in the
  Creem dashboard to match the new plan cards (no price or product id change).
- Confirm the numbers (15 / 3 / 10, and 300 for paid AI drafts).
