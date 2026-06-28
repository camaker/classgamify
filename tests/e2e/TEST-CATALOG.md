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
Pure assignment-domain helpers also have a fast local gate via
`pnpm test:domain`; run it when changing scoring, submission payload, identity,
attempt metrics, duration formatting, assignment delivery summaries, activity
lifecycle derivation rules, publish-setting input parsing, share-link helpers,
student submit decisions, result-summary helpers, result formatting,
activity/assignment list filters, item review priority, student follow-up
priority, question option normalization, or result-view search, sort,
review-filter rules, template remix readiness, AI draft source selection,
AI draft metadata,
template scaffold validity, template runtime ids, assignment item ordering, or
exclusive runtime choice assignment, or deterministic AI draft fallback result
behavior.

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
| 1 | Public pages render successfully | Open `/`, `/templates`, `/create`, `/worksheets`, `/play/demo-food`, `/pricing`, `/teachers`, `/contact`, `/contact?subject=classroom`, `/roadmap`, `/blog`, `/cookie`, `/privacy`, `/terms`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` for `en` and `zh`, in `dark` and `light` mode. Verify each returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. |
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
| 1 | Protected pages render successfully | Sign in as an admin E2E user, then open `/dashboard`, `/dashboard/activities`, `/dashboard/assignments`, `/admin/users`, `/settings/profile`, `/settings/security`, and `/settings/files` for `en` and `zh`, in `dark` and `light` mode. Verify each active product page returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. |
| 2 | Settings files classify classroom materials | With storage enabled, open the dashboard sidebar, follow the settings Files entry, and verify `/settings/files` loads for `en` and `zh`. Seed saved file rows for audio, worksheet image, worksheet document, spreadsheet, and unknown classroom materials, then verify the Material column shows localized teacher-facing labels while preserving the raw content type as secondary detail for troubleshooting. Verify the summary strip shows total materials, storage used, worksheet material count, and audio material count from the full file library rather than only the visible page. |

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
| 1 | Teacher can save a structured activity | Sign in as a verified teacher, open `/create`, choose a template, verify its required content badges and template readiness panel appear, load its scaffold, verify the scaffold fills a coherent lesson with questions, match pairs, groups, vocabulary, and teacher notes where the shared content model supports them, verify ready template badges update from the structured text fields, change the title/content fields, save the activity, expect redirect to `/dashboard/activities`, verify the activity title appears, reload, and verify it still appears from persisted D1 data. |
| 2 | Template requirements are enforced | Sign in, open `/create`, choose a match-based template, clear match pairs, submit, and verify a validation error explains the missing content requirement. |
| 3 | Teacher can publish and copy a configured student share link | Sign in, save a structured activity, verify the saved-activity panel appears, click the panel publish assignment action, set the assignment title, student instructions, name collection, answer reveal, shuffle, max attempts, and optional time limit, verify invalid title, max-attempt, time-limit, or close-after values show a pre-publish validation hint before submission, verify the publish dialog delivery preview updates for attempts, timer, close time, student identity mode, answer reveal behavior, and item order, clear the max-attempt input and verify the preview, persisted assignment card, student runner rules, submission usage, results, printable worksheet, and CSV export all preserve unlimited attempts instead of falling back to the default cap, expect redirect to `/dashboard/assignments?published=:shareId`, verify the published-assignment panel resolves the share slug through the assignment list data and shows copy, student preview, and results actions for the new share link, verify the assignment card summarizes the same settings, copy the generated student link, verify the copied URL ends with `/play/:shareId`, open the generated `/play/:shareId` link, verify the student runner labels and shows the teacher's student instructions, verify the runner shows a public rule summary for item count, attempts, timer, close time, identity mode, and review behavior without exposing answers, and verify the runner honors the settings. Exercise a partial-settings fixture and verify assignment cards, student payloads, submission limits, results, and CSV exports all resolve the same default delivery settings while explicit unlimited-attempt settings stay unlimited. |
| 4 | Student can submit an attempt | Open a persisted `/play/:shareId`, enter a student name and some answers, verify the runner shows answered/unanswered progress derived from the frozen runtime item ids, try to submit with an unanswered item and verify the first click asks for confirmation both in the toast and as a persistent submit hint next to the `Submit anyway` button, submit anyway or complete the missing answer, verify the score panel appears with the server-derived remaining-attempts message, use the start-another-attempt action when the assignment still has attempts remaining, and verify it clears answers while preserving the same student identity for the next submission. Reload `/dashboard/assignments` as the teacher and verify completions/average score update. Direct submission with partial answers is accepted, while duplicate item ids, unknown item ids, or more answer rows than frozen runtime items are rejected. |
| 5 | Student runner adapts to template content | Create quiz, match-up, line-match, fill-blank, listening, open-box, matching-pairs, and group-sort activities, publish each one, open each `/play/:shareId`, verify quiz and match-up render clickable choices, verify line-match renders a two-column connection board without exposing the answer map, verify fill-blank renders worksheet-style inline blanks instead of multiple-choice cards, verify listening renders track buttons, an audio play control, hidden transcripts before submission, and answer input or choices, verify open-box renders selectable boxes with one revealed prompt and answer field, verify group-sort renders a category board where items move into selected groups, verify matching-pairs renders a left/right card board that records selected choices without exposing correct answers, submit answers, and verify scoring reflects the template-specific expected answers. |
| 6 | Teacher can review, filter, copy, export, and print assignment results | After at least one student attempt, open `/dashboard/assignments/:assignmentId`, verify completions, average accuracy, share link, copyable student link, localized result action descriptions for the classroom brief, reteach plan, item review, student follow-up, and CSV export, the classroom brief, the student summary table, the attempt table, reteach priorities, the full item performance table, per-item correct rates, answer explanations, accepted answer alternatives, and answer review details show scored student answers from the assignment snapshot. Verify the classroom brief lists assignment-level metrics, the lowest-performing submitted items, and students needing follow-up without exposing raw anonymous tokens, then copy it and verify the copied text includes the same metrics, review focus, and follow-up sections. Open the printable worksheet action, verify `/print/assignments/:assignmentId` loads without public marketing navigation, renders the frozen assignment title, template, student-name, date, and score lines, delivery policy, instructions, share path, printable items, response hints, and choice banks, and does not show answers by default. Toggle the answer-key control, verify `answerKey=true` remains in the URL, the teacher-only answer key shows expected answers, accepted alternatives, and explanations, then return to results. Sort item performance by snapshot order, lowest accuracy, submitted count, and item type, verifying non-default sorts keep `itemSort` in the URL and the default clears it. Search by a student name or anonymous student label and verify the summary rows, attempt rows, and answer review cards filter together without exposing raw anonymous tokens, switch answer review between all submissions and needs-review submissions, verify only attempts with at least one missed item remain and non-default review mode keeps `review=needs-review` in the URL, switch the student summary sort between needs-review, best score, name, and attempts, verify non-default sorts keep `sort` in the URL and the default clears it, copy the item review summary and verify it includes prompts, item types, correct rates, expected answers, accepted answers, and explanations, copy the student follow-up summary and verify it includes normalized student labels, latest/average/best accuracy, attempts, and review counts, copy the reteach plan and verify it includes low-performing prompts plus student follow-up lines, then download the CSV export and verify it includes a formatted delivery-policy column, raw assignment delivery settings, student summary, attempt, expected-answer, accepted-answer, and item-level answer columns. |
| 7 | Teacher can generate an AI draft before saving | Sign in, open `/create`, add source notes, attach classroom source materials such as audio, worksheet, or spreadsheet files, sync attached materials into the AI source notes, verify the AI source panel and generated-summary provenance show only safe material kind and original filename without file ids, storage keys, permissions, or owner metadata, choose a template and item count, click generate draft, verify the title/content fields are filled with reviewable activity content, verify the draft coverage summary shows the applied-to-editor state, next save/review step, question, pair, group, vocabulary, note, ready-template count, locked-template count, provider, model, any fallback notice, suggested remixes, and per-template ready/locked status with missing-requirement counts, save the activity, and verify it appears in `/dashboard/activities`. |
| 8 | Teacher can edit a saved activity | Sign in, open `/dashboard/activities`, choose a persisted activity, click edit, update the title/content/template fields, save, return to the library, and verify the updated activity metadata and compatible template counts persist after reload. Attach an uploaded audio or worksheet classroom material from the activity editor, save, verify the activity library card summarizes the attached source-material count and material type, reopen the edit page, and verify the compact source-material reference is still attached without exposing storage keys in the editor. Publish before editing and verify the existing student share link still uses its original assignment snapshot. |
| 9 | Teacher sees template remix readiness | Sign in, create one activity with questions, pairs, and groups and another with only questions, verify `/create` shows the same deterministic ready and locked template families before save, open `/dashboard/activities`, verify the complete activity shows ready remix badges for all compatible templates, verify the question-only activity names missing match pairs or groups for locked templates, and verify the current template is visually distinct from suggested remix targets. |
| 10 | Teacher can close and reopen assignment links | Sign in, publish an assignment, open `/dashboard/assignments`, close the assignment link, open `/play/:shareId` and verify the student runner is unavailable, reopen the assignment from the dashboard, open `/play/:shareId` again, and verify the runner loads without exposing correct answers before submission. Verify direct status updates cannot close an already closed link, reopen an already open link, or publish a draft assignment without going through the publish-and-snapshot flow. |
| 11 | Assignment close-after time blocks late submissions | Sign in, publish an assignment with a future close-after time, verify the assignment list and results page show the close time, then exercise an expired fixture or time-controlled test case to verify `/play/:shareId` does not expose runtime items, direct submission returns an expired-assignment error, and direct status update cannot reopen the expired assignment. |
| 12 | Answer explanations survive authoring, submission, and review | Create or edit a question activity with `prompt | answer | choices | explanation`, publish it with answer reveal enabled, open the public student link and verify the sanitized runtime payload and UI do not expose the explanation before submission, submit an attempt, verify the student review shows the explanation only after submission, and verify the teacher results page shows the same explanation from the assignment snapshot. |
| 13 | Teacher can copy an activity into a ready template | Sign in, create an activity whose content satisfies multiple template requirements, open `/dashboard/activities`, click a ready `Copy as ...` remix action, verify a new draft activity opens with the target template selected, verify the remixed draft title includes the target template short name without exceeding the activity title limit even from a long source title, and verify the original activity and any existing assignments remain unchanged. |
| 14 | Answer matching accepts teacher-defined alternatives | Create a fill-blank or listening activity whose answer field contains alternatives separated by `/` or `;`, publish it, submit an answer with different casing or punctuation, and verify scoring treats the accepted alternative as correct while preserving the original review answer and showing the accepted alternatives only after submission. Verify quiz, fill-blank, listening, line-match, matching-pairs, group-sort, and open-box student review feedback all use the shared correct/needs-review presentation so accepted alternatives and explanations appear whenever answer reveal is enabled. Verify the teacher results page, copied item review summary, and CSV export also show the accepted alternatives from the assignment snapshot. |
| 15 | Time-limited assignments show attempt duration | Publish an assignment with a short time limit, verify `/dashboard/assignments` and `/dashboard/assignments/:assignmentId` show the shared settings summary with timer, attempt limit, close time, identity mode, answer reveal, item order, and instructions, open `/play/:shareId`, verify the countdown starts after the playable assignment loads, submit an attempt, verify the score panel shows elapsed time, verify direct submissions store duration as whole non-negative seconds capped to the timer, and verify the result page shows average time plus per-attempt duration. |
| 16 | Quiz choices are completed from lesson content | Create or edit a quiz activity with question answers but sparse or missing choices plus vocabulary terms, publish it, open `/play/:shareId`, and verify the quiz renders deterministic multiple-choice options without exposing which option is correct before submission. |
| 17 | Homepage and template routes enter ClassGamify product loops | Open `/`, verify the hero preview and primary actions point to templates or activity creation rather than legacy Hanzi, HSK, worksheet, or skeleton-only routes, then follow the primary CTA and verify the activity creation page loads. Open `/templates`, verify the template cards describe real classroom modes and content requirements, click a template-specific start action, and verify `/create?template=...` loads with that primary template selected and the matching template scaffold already filling the structured fields. Open `/worksheets`, verify it is a Liveworksheets-style entry page for fill-blank, line-match, listening, and group-sort modes rather than a legacy reset page, click the worksheet-mode actions, and verify they route to `/create?template=fill-blank`, `/create?template=line-match`, `/create?template=listening`, or `/create?template=group-sort` with the matching scaffold selected. Open `/learn`, `/hsk/1`, and a `/hanzi/:character` URL, verify retired legacy learning routes are not mounted as copied lesson UI, remain excluded from active navigation and sitemap targets, and are no longer preserved as legacy product crawler rules in `robots.txt` while active ClassGamify product routes continue to load. Open `/roadmap` and `/dashboard`, verify they describe the current usable create-publish-play-results loop rather than stale skeleton-only milestones, and verify the authenticated dashboard top metrics come from the teacher's real activity and assignment summaries while starter/demo content remains only a preview. |
| 18 | Legal pages describe ClassGamify data surfaces | Open `/terms`, `/privacy`, and `/cookie` for `en` and `zh`, verify the pages mention ClassGamify classroom activities, assignment links, student attempts or cookies where relevant, and verify they do not mention the copied Lang Study, getlangstudy, HSK, or Hanzi product surfaces. |
| 19 | Blog and release notes describe ClassGamify | Open `/blog`, each visible `/blog/:slug`, and the generated sitemap, verify public post slugs and cards reference ClassGamify templates, assignment links, AI authoring, or teacher results, and verify old HSK, Hanzi, and getlangstudy editorial URLs are absent. |
| 20 | Attempt limits use normalized student identity | Publish an assignment with student names and a max-attempt limit, submit as `Alice`, then try again as ` alice ` or `ALICE` and verify the limit still applies. Publish another assignment with the max-attempt field cleared, submit more than the default cap from the same normalized student identity, and verify the runner, attempt usage message, teacher settings summary, and CSV export continue to show additional attempts allowed. Publish an anonymous assignment, verify the student runner explains that the current browser is the anonymous identity and shows a short anonymous browser label, submit from two browser contexts, and verify the two browser tokens are summarized as separate anonymous students in teacher results without exposing raw tokens. |
| 21 | Teacher can duplicate an activity safely | Sign in, create a saved activity, click `Duplicate` in `/dashboard/activities`, verify a draft copy opens with the same structured content and `Copy of ...` title, edit the copy, and verify the original activity and its published assignments remain unchanged. |
| 22 | Teacher can search, filter, and page the activity library | Sign in, create enough saved activities to exceed one library page with distinct titles, descriptions, template types, and attached classroom source materials such as audio, spreadsheet, worksheet document, and worksheet image references, open `/dashboard/activities`, verify overview cards summarize the full current filter result for matching activities, template-family coverage, activities ready to remix, and source materials ready for extraction rather than only the visible page, verify activity cards show source-material count, material type badges, and extraction readiness hints for attached audio, spreadsheet, or worksheet materials, verify the result range and next/previous controls, move to page 2 and verify the URL keeps `page`, search by a title keyword and verify the list resets to page 1 with `q`, search by a description or template keyword, verify matching cards and overview cards update, filter by an exact template family such as quiz or group sort and verify the URL keeps `template`, filter by source material such as any extractable source, audio, spreadsheet, or worksheet and verify the URL keeps `source`, verify the overview extraction count, cards, pagination, empty state, and clear-filters action all reflect the source-material filtered result, combine source filtering with search, template, or archived status, clear filters, and verify the full library returns. |
| 23 | Teacher can filter and page the assignment list | Sign in, publish enough assignments to exceed one list page with distinct titles, statuses, and attempts, open `/dashboard/assignments`, verify overview cards summarize the full current filter result for matching assignments, open links, completions, and attempt accuracy rather than only the visible page, verify the result range and next/previous controls, move to page 2 and verify the URL keeps `page`, search by assignment title, source activity text, or share id and verify the list resets to page 1 with `q`, filter by published or closed status, verify overview counts and cards update for the filtered result, clear filters, and verify the full assignment list returns. |
| 24 | Teacher can archive and restore activities | Sign in, create a saved activity, publish an assignment from it, archive the activity from `/dashboard/activities`, verify it disappears from the active library but the existing assignment and student link still use the frozen snapshot, switch to the archived activity view, verify the archived card explains that publishing, duplicating, and template remixing require restore first and does not show those derivative actions, restore the activity, and verify it returns to the active library as a draft with publish, duplicate, and ready remix actions available again. |
| 25 | Contact classroom inquiry uses ClassGamify language | Open `/contact?subject=classroom` for `en` and `zh`, verify the classroom form fields and default message ask about learners, class or grade, activity material, routine, template or worksheet needs, and result-review needs, and verify the page does not show copied HSK, Hanzi, Lang Study, getlangstudy, or Chinese-level/language-scope wording. |
| 26 | Billing settings use ClassGamify plan language | Sign in, open `/settings/billing` for `en` and `zh`, verify the current-plan card describes ClassGamify plans, activity access, classroom routines, saved activity sets, assignment workflows, and hosted billing status, and verify it does not mention copied Lang Study, HSK, Hanzi, Chinese-character, or saved-character-list plan copy. |

## Deferred Coverage

These flows should be added after their dependencies are made deterministic:

| Area | Reason |
|---|---|
| Payment checkout and portal | Requires Stripe or Creem test fixtures, webhook simulation, and provider-specific env. |
| R2 file uploads | Requires deterministic local storage assertions and small fixture files. Include audio, worksheet image, document, spreadsheet, and unknown-material fixtures so upload behavior and material labels can be verified together. |
| Transactional email | Requires a fake mail provider or captured verification links. |
| Interactive template runners | Requires deterministic runner fixtures and attempt submission assertions. |
| AI provider quality checks | Requires provider mocks or stable fake responses to avoid cost and flake. |
