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
| 1 | Teacher can save a structured activity | Sign in as a verified teacher, open `/create`, change the title/template/content fields, save the activity, expect redirect to `/dashboard/activities`, verify the activity title appears, reload, and verify it still appears from persisted D1 data. |
| 2 | Template requirements are enforced | Sign in, open `/create`, choose a match-based template, clear match pairs, submit, and verify a validation error explains the missing content requirement. |
| 3 | Teacher can publish a student share link | Sign in, create or open a saved activity, click publish assignment, expect redirect to `/dashboard/assignments`, open the generated `/play/:shareId` link, and verify the student activity shell loads the persisted title and questions. |
| 4 | Student can submit an attempt | Open a persisted `/play/:shareId`, enter a student name and answers, submit, verify the score panel appears, reload `/dashboard/assignments` as the teacher, and verify completions/average score update. |
| 5 | Student runner adapts to template content | Create quiz, match-up, and group-sort activities, publish each one, open each `/play/:shareId`, verify the runner renders question, pair, and group-selection items respectively, submit answers, and verify scoring reflects the template-specific expected answers. |
| 6 | Teacher can review assignment results | After at least one student attempt, open `/dashboard/assignments/:assignmentId`, verify completions, average accuracy, share link, and the attempt table show student name, score, accuracy, answered count, and submitted time. |

## Deferred Coverage

These flows should be added after their dependencies are made deterministic:

| Area | Reason |
|---|---|
| Payment checkout and portal | Requires Stripe or Creem test fixtures, webhook simulation, and provider-specific env. |
| R2 file uploads | Requires deterministic local storage assertions and small fixture files. |
| Transactional email | Requires a fake mail provider or captured verification links. |
| Interactive template runners | Requires deterministic runner fixtures and attempt submission assertions. |
| AI activity creation | Requires provider mocks or stable fake responses to avoid cost and flake. |
