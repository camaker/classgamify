# E2E Test Catalog

This catalog is the acceptance checklist for Playwright E2E coverage. Update it
before or alongside feature work, then use the implemented spec files to lock in
the verified behavior.

## Workflow

Use the local feature flow:

```txt
Spec -> Code -> Verify -> Test -> Green
```

1. Spec: add or update the relevant journey in this catalog.
2. Code: implement the feature.
3. Verify: run the app and walk the real UI in a browser.
4. Test: add or update the matching Playwright spec.
5. Green: run the related spec locally; run full E2E before releases or large
   refactors.

E2E tests are intentionally local-first. CI should continue to prefer fast
checks such as `pnpm check` and `pnpm build` unless a separate E2E environment is
explicitly provisioned.

## Test Harness

- Config: `playwright.config.ts`
- Specs: `tests/e2e/specs/`
- Fixtures: `tests/e2e/fixtures/`
- Test-only API: `src/routes/api/e2e/users.ts`

The test-only API is disabled unless Vite is running locally with
`import.meta.env.DEV === true`, `MODE=e2e`, and the request includes the
configured `x-e2e-secret` header. Test accounts must use the
`e2e-*@example.test` email pattern so cleanup stays scoped.

## 1. Public Page Smoke Test

**File:** `specs/public-pages.spec.ts` | **Priority:** P0

Verifies that public pages render in English/Chinese and dark/light mode without
browser console errors or page errors.

| # | Test name | Flow |
|---|---|---|
| 1 | Public pages render successfully | Open `/`, `/templates`, `/create`, `/play/demo-food`, `/pricing`, `/teachers`, `/contact`, `/roadmap`, `/blog`, `/cookie`, `/privacy`, `/terms`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` for `en` and `zh`, in `dark` and `light` mode. Verify each returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. |
| 2 | Home login modal opens | Open `/`, click the navbar login button, verify the login dialog and credential inputs are visible, and assert no browser errors. |
| 3 | Health check responds with pong | Call `/api/ping` and verify `{ "message": "pong" }`. |

## 2. Authentication And Protected Routes

**File:** `specs/auth.spec.ts` | **Priority:** P0

Verifies login and route protection with real Better Auth endpoints and seeded
verified users.

| # | Test name | Flow |
|---|---|---|
| 1 | Guests are redirected from dashboard | Open `/dashboard` while signed out, expect redirect to `/auth/login`, and verify the email input is visible. |
| 2 | Verified user can sign in | Create an E2E user, mark it verified, sign in through `/auth/login`, and verify dashboard content. |
| 3 | User can register from UI | Fill `/auth/register`, verify the registration success message, mark the test account verified, sign in through `/auth/login`, and verify dashboard content. |
| 4 | Non-admin cannot view admin pages | Sign in as a non-admin user, open `/admin/users`, and expect redirect to `/dashboard`. |
| 5 | Admin can view users dashboard | Sign in as an admin E2E user, open `/admin/users`, and verify the users dashboard shows the admin email. |

## 3. Protected Page Smoke Test

**File:** `specs/protected-pages.spec.ts` | **Priority:** P0

Verifies authenticated app pages render in English/Chinese and dark/light mode
without browser console errors or page errors.

| # | Test name | Flow |
|---|---|---|
| 1 | Protected pages render successfully | Sign in as an admin E2E user, then open `/dashboard`, `/dashboard/activities`, `/dashboard/assignments`, `/admin/users`, `/settings/profile`, `/settings/security`, `/settings/apikeys`, `/settings/files`, `/settings/billing`, `/settings/payment`, `/settings/notifications` for `en` and `zh`, in `dark` and `light` mode. Verify each returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. |

## 4. Profile Settings

**File:** `specs/settings-profile.spec.ts` | **Priority:** P1

Verifies the signed-in profile update flow.

| # | Test name | Flow |
|---|---|---|
| 1 | User can update display name | Sign in, open `/settings/profile`, change the name, save, verify success toast, and reload to verify persistence. |

## 5. Activity Authoring

**File:** `specs/activity-authoring.spec.ts` | **Priority:** P1

Verifies the core teacher loop for creating reusable activities before
assignment publishing is enabled.

| # | Test name | Flow |
|---|---|---|
| 1 | Teacher can save a structured activity | Sign in as a verified teacher, open `/create`, choose a template, verify its required content badges appear, load its scaffold, change the title/content fields, save the activity, expect redirect to `/dashboard/activities`, verify the activity title appears, reload, and verify it still appears from persisted D1 data. |
| 2 | Template requirements are enforced | Sign in, open `/create`, choose a match-based template, clear match pairs, submit, and verify a validation error explains the missing content requirement. |
| 3 | Teacher can publish a configured student share link | Sign in, create or open a saved activity, click publish assignment, set the assignment title, student instructions, name collection, answer reveal, shuffle, max attempts, and optional time limit, expect redirect to `/dashboard/assignments`, open the generated `/play/:shareId` link, and verify the student runner honors the settings. |
| 4 | Student can submit an attempt | Open a persisted `/play/:shareId`, enter a student name and answers, submit, verify the score panel appears, reload `/dashboard/assignments` as the teacher, and verify completions/average score update. |
| 5 | Student runner adapts to template content | Create quiz, match-up, line-match, fill-blank, listening, open-box, matching-pairs, and group-sort activities, publish each one, open each `/play/:shareId`, verify quiz and match-up render clickable choices, verify line-match renders a two-column connection board without exposing the answer map, verify fill-blank renders worksheet-style inline blanks instead of multiple-choice cards, verify listening renders track buttons, an audio play control, hidden transcripts before submission, and answer input or choices, verify open-box renders selectable boxes with one revealed prompt and answer field, verify group-sort renders a category board where items move into selected groups, verify matching-pairs renders a left/right card board that records selected choices without exposing correct answers, submit answers, and verify scoring reflects the template-specific expected answers. |
| 6 | Teacher can review and export assignment results | After at least one student attempt, open `/dashboard/assignments/:assignmentId`, verify completions, average accuracy, share link, the attempt table, reteach priorities, the full item performance table, per-item correct rates, answer explanations, and answer review details show scored student answers from the assignment snapshot, then download the CSV export and verify it includes summary, attempt, and item-level answer columns. |
| 7 | Teacher can generate an AI draft before saving | Sign in, open `/create`, add source notes, choose a template and item count, click generate draft, verify the title/content fields are filled with reviewable activity content, save the activity, and verify it appears in `/dashboard/activities`. |
| 8 | Teacher can edit a saved activity | Sign in, open `/dashboard/activities`, choose a persisted activity, click edit, update the title/content/template fields, save, return to the library, and verify the updated activity metadata and compatible template counts persist after reload. Publish before editing and verify the existing student share link still uses its original assignment snapshot. |
| 9 | Teacher sees template remix readiness | Sign in, create one activity with questions, pairs, and groups and another with only questions, open `/dashboard/activities`, verify the complete activity shows ready remix badges for all compatible templates, verify the question-only activity names missing match pairs or groups for locked templates, and verify the current template is visually distinct from suggested remix targets. |
| 10 | Teacher can close and reopen assignment links | Sign in, publish an assignment, open `/dashboard/assignments`, close the assignment link, open `/play/:shareId` and verify the student runner is unavailable, reopen the assignment from the dashboard, open `/play/:shareId` again, and verify the runner loads without exposing correct answers before submission. |
| 11 | Assignment close-after time blocks late submissions | Sign in, publish an assignment with a future close-after time, verify the assignment list and results page show the close time, then exercise an expired fixture or time-controlled test case to verify `/play/:shareId` does not expose runtime items and direct submission returns an expired-assignment error. |
| 12 | Answer explanations survive authoring, submission, and review | Create or edit a question activity with `prompt | answer | choices | explanation`, publish it with answer reveal enabled, submit an attempt, verify the student review shows the explanation only after submission, and verify the teacher results page shows the same explanation from the assignment snapshot. |
| 13 | Teacher can copy an activity into a ready template | Sign in, create an activity whose content satisfies multiple template requirements, open `/dashboard/activities`, click a ready `Copy as ...` remix action, verify a new draft activity opens with the target template selected, and verify the original activity and any existing assignments remain unchanged. |
| 14 | Answer matching accepts teacher-defined alternatives | Create a fill-blank or listening activity whose answer field contains alternatives separated by `/` or `;`, publish it, submit an answer with different casing or punctuation, and verify scoring treats the accepted alternative as correct while preserving the original review answer and showing the accepted alternatives only after submission. |
| 15 | Time-limited assignments show attempt duration | Publish an assignment with a short time limit, verify `/dashboard/assignments` and `/dashboard/assignments/:assignmentId` show the shared settings summary with timer, attempt limit, close time, and instructions, open `/play/:shareId`, verify the countdown appears, submit an attempt, verify the score panel shows elapsed time, and verify the result page shows average time plus per-attempt duration. |
| 16 | Quiz choices are completed from lesson content | Create or edit a quiz activity with question answers but sparse or missing choices plus vocabulary terms, publish it, open `/play/:shareId`, and verify the quiz renders deterministic multiple-choice options without exposing which option is correct before submission. |

## Deferred Coverage

These flows should be added after their dependencies are made deterministic:

| Area | Reason |
|---|---|
| Payment checkout and portal | Requires Stripe or Creem test fixtures, webhook simulation, and provider-specific env. |
| R2 file uploads | Requires deterministic local storage assertions and small fixture files. |
| Transactional email | Requires a fake mail provider or captured verification links. |
| Interactive template runners | Requires deterministic runner fixtures and attempt submission assertions. |
| AI provider quality checks | Requires provider mocks or stable fake responses to avoid cost and flake. |
