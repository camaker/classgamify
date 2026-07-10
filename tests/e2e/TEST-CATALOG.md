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
attempt identity handoff contracts, attempt metrics, duration formatting,
assignment delivery summaries, activity lifecycle derivation rules,
publish-setting input parsing, share-link helpers, student submit decisions,
result-summary helpers, result formatting, result copy artifacts,
activity/assignment list filters, item review priority, student follow-up
priority, question option normalization, or result-view search, sort,
review-filter rules, template remix readiness, AI draft source selection,
AI draft metadata,
template scaffold validity, template runtime ids, assignment item ordering, or
exclusive runtime choice assignment, or deterministic AI draft fallback result
behavior.
Fast-gate inventory has a script-level gate via
`pnpm exec tsx --test scripts/test-catalog-fast-gate-inventory.test.ts`; run it
when changing TEST-CATALOG script references, adding or removing local
product-gate scripts, or renaming focused script-level checks.
Handoff item inventory has a script-level gate via
`pnpm exec tsx --test scripts/handoff-item-inventory.test.ts`; run it when
adding, renaming, splitting, or trimming exported `*_HANDOFF_ITEM_IDS`
contracts, changing 30-item handoff arrays, or editing semantic item id
boundaries that should remain unique kebab-case item ids and keep focused
script-level coverage.
Product-domain export surface has a source-level gate via
`pnpm exec tsx --test scripts/product-domain-export-surface.test.ts`; run it
when changing product-domain helper exports, public indexing helpers, dashboard
overview view helpers, public-page handoff builders, result copy/view helper
internals, assignment delivery formatting helpers, activity library filter
constants, or editor template handoff builder visibility.
Public DOM handoff boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/public-dom-handoff-boundary.test.ts`; run it when
changing marketing, editorial, legal, contact, auth, root document, or shared
public layout route sources and shared public components that must keep internal
`data-handoff` audit DOM out of public pages while preserving source-level
handoff contracts.
Public discovery/indexing chain has a fast script-level gate via
`pnpm exec tsx --test scripts/public-discovery-indexing-chain-handoff.test.ts`;
run it when changing public entry routes, navigation, template/worksheet
entries, public page copy, sitemap/robots/manifest helpers, legacy route
retirement, public DOM handoff boundaries, or privacy/indexing guards.
Classroom trust communication chain has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-trust-communication-chain-handoff.test.ts`;
run it when changing public classroom contact intake, auth workspace entry,
transactional mail lifecycle, teacher notification settings, hosted billing,
legal/provider copy, developer configuration secrets, storage source-material
boundaries, or public DOM handoff boundaries.
Account governance lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/account-governance-lifecycle-chain-handoff.test.ts`;
run it when changing auth session and email verification, profile and security
settings, explicit account deletion, admin user governance,
billing/payment callback/notification/files boundaries, storage owner checks,
provider-secret and student-data guards, or account lifecycle copy that should
stay tied to the ClassGamify teacher workspace.
Classroom product loop chain has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-product-loop-chain-handoff.test.ts`;
run it when changing the Activity -> Assignment -> Attempt -> Results contract,
activity authoring, template roadmap capability alignment, AI enhancement
lifecycle review, assignment publish, student runner, scored attempts,
submitted-date continuity, accepted-answer continuity, explanation continuity,
teacher result review, copy/export/print handoffs, dashboard/public discovery
and indexing alignment, or privacy guards.
Active surface product boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/active-surface-product-boundary.test.ts`; run it
when changing active account governance, contact, billing/payment callback,
mail, notification, or developer configuration sources that should speak in
current ClassGamify terms rather than copied learning-site, starter, or unused
provider copy.
Public product entry gates include
`pnpm exec tsx --test scripts/home-product-loop-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/public-navigation-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/public-template-entry-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/teachers-public-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/roadmap-public-handoff-semantic-views.test.ts`,
and
`pnpm exec tsx --test scripts/public-pricing-plan-boundary-handoff-semantic-views.test.ts`;
run the matching gate when changing homepage loops, navigation, template or
worksheet entry routes, teacher-facing public copy, roadmap status wording, or
pricing plan boundaries.
Public content, policy, and communication gates include
`pnpm exec tsx --test scripts/public-editorial-content-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/legal-policy-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/contact-classroom-intake-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/auth-workspace-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/mail-transactional-workspace-handoff-semantic-views.test.ts`,
and
`pnpm exec tsx --test scripts/developer-configuration-handoff-semantic-views.test.ts`;
run the matching gate when changing editorial, legal, contact, auth,
transactional mail, or developer-facing product-boundary copy.
Activity foundation gates include
`pnpm exec tsx --test scripts/activity-library-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/activity-template-scaffold-quality-handoff-semantic-views.test.ts`,
and
`pnpm exec tsx --test scripts/activity-ai-fallback-handoff-semantic-views.test.ts`;
run the matching gate when changing owner-scoped library summaries, reusable
template scaffold quality, or deterministic local AI fallback draft semantics.
Assignment shared-boundary gates include
`pnpm exec tsx --test scripts/assignment-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/assignment-delivery-policy-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/assignment-identity-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/assignment-answer-feedback-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/assignment-result-empty-state-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/assignment-result-material-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/public-assignment-access-semantic-views.test.ts`,
and
`pnpm exec tsx --test scripts/public-assignment-unavailable-access-handoff-semantic-views.test.ts`;
run the matching gate when changing shared assignment view models, delivery
policy propagation, identity normalization, answer feedback, result empty
states, result materials, public assignment access, or unavailable-link
boundaries.
Answer feedback lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/answer-feedback-lifecycle-chain-handoff.test.ts`;
run it when changing accepted-answer parsing, answer normalization, runtime
scoring, public post-submit feedback, template feedback surfaces, teacher
result analysis, result answer text views, CSV answer columns, server review
summaries, or feedback privacy guards.
Published assignment delivery chain has a fast script-level gate via
`pnpm exec tsx --test scripts/published-assignment-delivery-chain-handoff.test.ts`;
run it when changing publish preflight, frozen snapshots, share links,
assignment list distribution, public student rules, lifecycle access,
validated submissions, attempt persistence, timer duration policy, answer
feedback, result stats, or results export handoffs.
Assignment lifecycle governance chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-lifecycle-governance-chain-handoff.test.ts`;
run it when changing open/closed/expired/draft status resolution,
close/reopen transition rules, expired reopen blocking, assignment list status
filters, share-link availability, public unavailable payloads, submit API
lifecycle gates, result retention, snapshot retention, or lifecycle privacy
guards.
Classroom data lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-data-lifecycle-chain-handoff.test.ts`;
run it when changing D1 app schema, activity/assignment persistence helpers,
owner-scoped activity or assignment queries, assignment snapshot freezing,
public assignment payload sanitization, attempt persistence, scored-attempt
queries, result analysis/export/print consumers, or source-material/token
privacy guards.
Workspace governance and utility gates include
`pnpm exec tsx --test scripts/admin-users-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/billing-semantic-views.test.ts`, and
`pnpm exec tsx --test scripts/tabler-icons-proxy.test.ts`; run the matching
gate when changing admin user governance, billing workspace behavior, or the
icon proxy used by classroom controls.
Assignment attempt limits have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-limit-handoff-semantic-views.test.ts`;
run it when changing max-attempt parsing, per-student attempt counters,
retry availability, public rule summaries, result usage labels, delivery
summaries, CSV/export delivery-policy fields, attempt-limit privacy-scope
boundaries, or no-public-audit DOM boundaries.
Assignment submission validation has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-submission-validation-handoff-semantic-views.test.ts`;
run it when changing frozen runtime validation, partial-submission payloads,
runtime id normalization, unknown/duplicate/too-many rejection, API answer
limits, safe failure mapping, teacher-result/public-payload boundaries,
submission-validation privacy-scope boundaries, or no-public-audit DOM
boundaries.
Assignment attempt duration has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-duration-handoff-semantic-views.test.ts`;
run it when changing timer start plans, submission duration normalization,
student timer badges, result duration labels, result average duration, or CSV
duration fields.
Assignment item ordering has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-item-order-handoff-semantic-views.test.ts`;
run it when changing shuffle helper logic, share-slug normalization, public
payload ordering, student submit/review ordering, printable worksheet ordering,
delivery summaries, publish previews, public rule summaries, or CSV/export
delivery-policy fields.
Student runner loading readiness has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-loading-handoff-semantic-views.test.ts`;
run it when changing public assignment lookup loading, sanitized payload
preparation, timer-start boundaries, attempt-clock start plans, submit blocking,
identity preparation, starter-preview fallback timing, public runner noindex
policy, loading privacy-scope boundaries, or the hidden student-runner-loading
handoff.
Student runner safe start has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-start-handoff-semantic-views.test.ts`;
run it when changing public rule summaries, before-start guidance, identity or
timer prepare steps, submit availability, public runner start privacy-scope
boundaries, or the hidden student-runner-start handoff.
Public assignment rules have a fast script-level gate via
`pnpm exec tsx --test scripts/public-assignment-rules-handoff-semantic-views.test.ts`;
run it when changing the 30-slice public rule panel handoff, status badge,
public rule order, item count, attempt limit, timer and identity boundaries,
answer-review behavior, item-order policy, settings resolution, status
derivation, public-payload boundary, answer-key guard, runtime-content guard,
raw settings guard, or the hidden public-assignment-rules handoff.
Student runner safe submission has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-submission-handoff-semantic-views.test.ts`;
run it when changing progress counts, payload summaries, submit-readiness,
partial-submit confirmation, identity or timer state, post-submit review,
feedback scope, next steps, public runner submission privacy-scope boundaries,
or the hidden student-runner-submission handoff.
Student runner submit controls have a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-submit-controls-handoff-semantic-views.test.ts`;
run it when changing the 30-slice submit-control readiness details, safe
payload counters, share-link presence boundary, button disabled or confirmation
state, hint ordering, aria descriptions, persistent submit hints,
submit-control privacy-scope boundaries, or the hidden
student-runner-submit-controls handoff.
Student runner identity has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-identity-handoff-semantic-views.test.ts`;
run it when changing named-student input state, anonymous browser labels,
anonymous retry guidance, student identity normalization boundaries,
student-runner identity privacy-scope boundaries, or the hidden
student-runner-identity handoff.
Student identity lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/student-identity-lifecycle-chain-handoff.test.ts`;
run it when changing student-name normalization, anonymous browser tokens,
identity grouping, attempt-limit identity counting, student runner identity
views, submission input identity, attempt persistence identity fields, teacher
result identity labels/search/sort/review, result export privacy, or raw-token
guards.
Student runtime interaction has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runtime-interaction-handoff-semantic-views.test.ts`;
run it when changing template renderer dispatch, runner surface selection,
runtime item or kind counts, choice counts, listening language, answer-change
contracts, selection scope, review feedback, public runtime interaction
privacy-scope boundaries, or the hidden student-runtime-interaction handoff.
Student runtime choice assignment has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runtime-choice-assignment-handoff-semantic-views.test.ts`;
run it when changing exclusive pairing, group placement, choice-list behavior,
choice-key normalization, selected item validity, occupied/unassigned choice
counts, answer-change contracts, disabled action policies, runtime choice
assignment privacy-scope boundaries, or the hidden
student-runtime-choice-assignment handoff.
Student runtime identity has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runtime-identity-handoff-semantic-views.test.ts`;
run it when changing runtime id normalization, multilingual collision guards,
runtime item kind counts, submission validation boundaries, browser-answer or
scoring lookup boundaries, public payload or frozen snapshot identity,
runtime identity privacy-scope boundaries, or the hidden
student-runtime-identity handoff.
Student runtime semantic bundle has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runtime-semantic-bundle-handoff-semantic-views.test.ts`;
run it when changing the student-runtime interaction, choice-assignment, or
identity handoff composition, sourced item mappings, semantic bundle
privacy-scope boundaries, or the hidden student-runtime-semantic-bundle
handoff.
Assignment results CSV export preparation has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-results-export-preparation-handoff-semantic-views.test.ts`;
run it when changing source-activity context columns, delivery-policy columns,
accepted-answer columns, submitted-date formatting, timer-aware duration
normalization, formula-injection guards, CSV data URL boundaries, or the export
coverage handoff.
Assignment result submitted-date continuity chain has a fast script-level gate
via
`pnpm exec tsx --test scripts/assignment-result-submitted-date-chain-handoff.test.ts`;
run it when changing result date formatting, attempt submitted labels, student
last-submitted labels, latest-attempt copy context, completed-at sorting, CSV
submitted-date columns, or submitted-date privacy guards.
Assignment result accepted-answer continuity chain has a fast script-level gate
via
`pnpm exec tsx --test scripts/assignment-result-accepted-answer-chain-handoff.test.ts`;
run it when changing the accepted-answer parser, primary-vs-alternatives
formatting, result cards, item performance columns, attempt review cards, CSV
accepted-answer columns, printable review alignment, or accepted-answer privacy
guards.
Assignment result explanation continuity chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-result-explanation-chain-handoff.test.ts`;
run it when changing result explanations, post-submit review visibility,
student feedback explanations, item review copy notes, CSV explanation columns,
printable answer-key explanations, or explanation privacy guards.
Assignment source-activity context chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-source-activity-context-chain-handoff.test.ts`;
run it when changing source-activity snapshot resolution, assignment-list
search, public student payloads, result headers, CSV source columns, printable
worksheet fields, source-context chain alignment, or source-context privacy
guards.
Assignment attempt stats has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-stats-handoff-semantic-views.test.ts`;
run it when changing completions, average accuracy, average points, average
duration, timer caps, result metric cards, assignment list summaries,
assignment cards, classroom briefs, copy artifacts, CSV exports, or the
assignment-attempt-stats handoff.
Legacy public route retirement has a fast script-level gate via
`pnpm exec tsx --test scripts/legacy-public-route-handoff-semantic-views.test.ts`;
run it when changing retired copied-learning routes, route-tree cleanup,
noindex migration entrypoints, sitemap exclusion, localized sitemap exclusion,
navigation exclusion, robots protected-surface rules, legacy-copy guards, or
the legacy-public-route handoff.
Storage upload readiness has a fast script-level gate via
`pnpm exec tsx --test scripts/storage-upload-readiness.test.ts`; run it when
changing classroom source-material upload validation, filename sanitization,
content-type/extension normalization and safety, owner/public folder planning,
R2 key planning, same-origin file proxy URLs, provider helper reuse, or the
20-slice storage-upload readiness contract.
Storage file access boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/storage-file-access-boundary.test.ts`; run it
when changing same-origin file proxy access, key validation, public folder
access, private `userFiles` owner checks, missing-object handling, safe inline
content types, attachment filename headers, public/private cache headers,
`nosniff`, or the 30-slice storage-file access contract.
Dashboard overview owner-loop handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/dashboard-overview-handoff-semantic-views.test.ts`;
run it when changing owner-scoped activity/assignment summaries,
starter-preview boundaries, independent loading states, top metrics, loop
status, next actions, readiness rows, action cards, route targets, or the
dashboard-overview handoff.
Teacher workspace operations chain has a fast script-level gate via
`pnpm exec tsx --test scripts/teacher-workspace-operations-chain-handoff.test.ts`;
run it when changing dashboard owner summaries, activity library
filters/summaries/actions, assignment list filters/distribution, account
governance, teacher settings security/files/billing/payment callback/notification
boundaries, or the active surface product boundary.
Settings account workspace handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-account-workspace-handoff-semantic-views.test.ts`;
run it when changing teacher identity scope, account access, profile display
name or avatar boundaries, assignment handoff identity, student recognition,
result-review identity, credential-login gates, account deletion gates,
source-material boundaries, anonymous-token guards, storage-key guards, or the
settings-account-workspace handoff.
Settings security workspace boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-security-workspace-handoff-semantic-views.test.ts`;
run it when changing workspace security summary, credential-login gate,
password fields, password update action, password reset boundary, connected
provider boundary, account deletion gate, delete confirmation dialog, activity
and source-material protections, assignment link and snapshot protections,
student result protection, raw auth/provider error guards, or the hidden
settings-security-workspace handoff.
Settings billing workspace handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-billing-workspace-handoff-semantic-views.test.ts`;
run it when changing plan access, current-plan card semantics, activity library
access, assignment workflow access, AI draft access, result export access,
source-material access, hosted checkout, customer portal, payment callback, or
the settings-billing-workspace handoff.
Settings payment callback handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-billing-workspace-handoff-semantic-views.test.ts`;
run it when changing hosted checkout confirmation, session-id privacy, polling
interval or timeout, server completion checks, current-plan cache refresh, safe
callback normalization, billing return, pricing retry, timeout recovery,
classroom access boundaries, provider-secret guards, raw-session guards, or the
settings-payment-callback handoff.
Settings notification update handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-notification-update-handoff-semantic-views.test.ts`;
run it when changing teacher-controlled product updates, template updates,
worksheet workflows, assignment review updates, newsletter subscription
controls, provider visibility, student-reminder boundaries, public-link
boundaries, learner-notification boundaries, private-data guards, or the
settings-notification-update handoff.
Settings files source-material library has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-files-source-material-handoff-semantic-views.test.ts`;
run it when changing source-material library, activity attachments, AI draft
provenance, student payload privacy, full-library summaries, owner-scoped user
files, storage-key guard, settings-files source-material privacy-scope
boundaries, or the settings-files-source-material handoff.
Settings files material classification has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-files-material-classification-handoff-semantic-views.test.ts`;
run it when changing content-type normalization, extension fallback,
audio/worksheet/spreadsheet/video/file detection, ActivityContent.sourceMaterials
references, AI draft provenance, student-payload guard,
file-byte/storage-key/filename/permission guards, full-library summary, settings
files material-classification privacy-scope boundaries, or the hidden
settings-files-material-classification handoff.
Activity source-material picker has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-source-material-picker-handoff-semantic-views.test.ts`;
run it when changing owner scope, storage load gate, picker status, selected
count, available count, attachment limit, attached summary, attach/remove
actions, upload entry, material kind metadata, content-type metadata, size
metadata, ActivityContent.sourceMaterials reference, AI extraction readiness,
student payload guard, file-id guard, filename display boundary, storage-key
guard, source material picker privacy-scope boundaries, or the hidden
activity-source-material-picker handoff.
Activity source-material reference boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-source-material-reference-boundary.test.ts`;
run it when changing compact ActivityContent.sourceMaterials references,
user-file-to-activity reference mapping, selected-material normalization, safe
file id rules, safe filename basenames, content-type normalization,
material-kind fallback, size normalization, duplicate collapse, reference
limits, compact JSON shape, storage-key omission, or student-payload privacy.
Source-material privacy chain has a fast script-level gate via
`pnpm exec tsx --test scripts/source-material-privacy-chain-handoff.test.ts`;
run it when changing storage upload/access, ActivityContent.sourceMaterials
references, settings files, source-material picker, AI draft source notes,
extraction readiness, public assignment payloads, or student runtime
source-material metadata guards.
Assignment result student search has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-result-student-search-handoff-semantic-views.test.ts`;
run it when changing result-page student search route parsing, query
normalization, student/attempt/review filtering, copy-scope alignment, search
empty states, anonymous-label search, raw-query guards, or the
assignment-result-student-search handoff.
Assignment result review handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-result-review-handoff-semantic-views.test.ts`;
run it when changing review status, review next step, result-page controls,
matched counts, copy-scope alignment, result actions, copy preview readiness,
route state, current-review/full-export boundaries, privacy guards, or the
assignment-result-review handoff.
Assignment result review controls has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-result-review-controls-handoff-semantic-views.test.ts`;
run it when changing result-page student search, student summary sorting,
item-performance sorting, answer-review filtering, route default elision,
invalid-route guards, review-scope summaries, copy-scope alignment, result
tables, answer review cards, copy artifacts, anonymous-label search, or the
assignment-result-review-controls handoff.
Teacher results review chain has a fast script-level gate via
`pnpm exec tsx --test scripts/teacher-results-review-chain-handoff.test.ts`;
run it when changing owner-scoped result routes, frozen snapshots, attempt
stats, review controls, student search/sort rules, item performance sorting,
copy artifacts, CSV exports, result-material privacy, empty-result guidance,
anonymous-token guards, source-material guards, or the hidden
teacher-results-review-chain handoff.
Teacher result copy lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/teacher-result-copy-lifecycle-chain-handoff.test.ts`;
run it when changing classroom brief builders, reteach plan builders,
item-review summaries, student follow-up summaries, copy preview metadata,
current-review copy data, the full-assignment CSV boundary, action execution,
hidden copy-artifact DOM handoff, or copy-artifact privacy guards.
Assignment item performance sort has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-item-performance-sort-handoff-semantic-views.test.ts`;
run it when changing snapshot order, lowest accuracy, most answered, or item
type sort modes, route default elision, invalid-route guards, review-scope
alignment, copy-scope row counts, result tables, copy artifacts, CSV export
boundaries, prompt/answer guards, or the assignment-item-performance-sort
handoff.
Assignment student summary sort has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-student-summary-sort-handoff-semantic-views.test.ts`;
run it when changing needs review, best score, student name, attempt count, or
last-submitted student summary ordering, route default elision, invalid-route
guards, review-scope alignment, copy-scope row counts, result tables, copy
artifacts, anonymous-label guards, or the assignment-student-summary-sort
handoff.
Assignment attempt review cards has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-review-card-handoff-semantic-views.test.ts`;
run it when changing answer review cards, review filters, submitted, correct,
needs-review, or unanswered counts, answer text/status/summary helpers,
accepted alternatives, explanations, copy-scope boundaries, CSV export
boundaries, anonymous-token guards, or the assignment-attempt-review-card
handoff.
Assignment student follow-up priority has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-student-follow-up-priority-handoff-semantic-views.test.ts`;
run it when changing needs-review follow-up sorting, latest-accuracy or
display-label tie-breakers, classroom brief follow-up limits, reteach-plan
student lines, student follow-up summaries, copy-artifact ordering,
anonymous-token guards, or the assignment-student-follow-up-priority handoff.
Assignment copy artifacts have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-copy-artifact-handoff-semantic-views.test.ts`;
run it when changing classroom brief copy text, reteach-plan text, item-review
summary text, student follow-up summary text, copy-scope appending,
normalized copy-line formatting, preview scope summaries, prompt/answer/student
privacy guards, shared copy artifact helpers, or the assignment-copy-artifact
handoff.
Public indexing and install metadata have a fast source-level gate via
`pnpm exec tsx --test scripts/public-metadata-handoff-semantic-views.test.ts`;
run it when changing the public route registry, sitemap helpers, robots rules,
web app manifest metadata, manifest GET/HEAD route headers, retired legacy
path inventory, or public/private install entry boundaries.
Activity library overview and source-scope boundaries have a fast script-level
gate via
`pnpm exec tsx --test scripts/activity-library-handoff-semantic-views.test.ts`;
run it when changing activity library overview metrics, current-view scope,
source-material filters, starter-preview boundaries, visible-card counts,
activity library privacy-scope boundaries, or the hidden activity-library
handoff.
Activity edit route hydration has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-edit-route-handoff-semantic-views.test.ts`;
run it when changing saved-activity loading, owner-scoped edit access,
archived restore gates, editor mode selection, CreateActivityInput hydration,
title/description/template/visibility/learning-goal fields, structured content
row counts, source-material reference hydration, readiness after load, future
assignment boundaries, snapshot protection, save targets, activity edit-route
privacy-scope boundaries, or the hidden activity edit-route handoff.
Activity editor workflow has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-editor-workflow-handoff-semantic-views.test.ts`;
run it when changing page layout, workflow navigation, form sections, AI draft
boundaries, source-material safety, readiness review, save gating,
CreateActivityInput contracts, template-readiness contracts, publish boundaries,
activity-editor-workflow privacy-scope boundaries, or the hidden
activity-editor-workflow handoff.
Activity editor template handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-editor-template-handoff-semantic-views.test.ts`;
run it when changing selected-template badges, required content, current template
readiness, ready/locked template options, suggested remixes, quiz-choice
readiness, scaffold action, scaffold runtime items, scaffold ready modes,
reusable coverage, scaffold field counts, scaffold review steps, shared editor
contract, parsed content status, save-before-publish boundaries,
activity-editor-template privacy-scope boundaries, or the hidden
activity-editor-template handoff.
Activity duplicate safety has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-duplicate-handoff-semantic-views.test.ts`;
run it when changing owner-scoped duplicate availability, persisted-source
requirements, archived restore gates, draft visibility reset, duplicate title
strategy/limit, template preservation, structured content cloning, source
material reference normalization, assignment snapshot protection, original
activity protection, activity duplicate privacy-scope boundaries, or the hidden
activity duplicate handoff.
Activity lifecycle archive and restore boundaries have a fast script-level gate
via `pnpm exec tsx --test scripts/activity-lifecycle-handoff-semantic-views.test.ts`;
run it when changing owner-scoped archive and restore actions, active and
archived library visibility, edit/publish/duplicate/remix gates,
restore-before-derive policy, assignment snapshot protection, public assignment
continuity, server archive/restore/derivative guards,
activity lifecycle privacy-scope boundaries, or the hidden activity-lifecycle
handoff.
Activity lifecycle governance chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-lifecycle-governance-chain-handoff.test.ts`;
run it when changing owner-scoped archive and restore, edit, publish,
duplicate, and remix gates, server lifecycle enforcement, content and
source-material retention, assignment snapshot protection, public assignment
continuity, lifecycle mutation cache refresh, created-panel publish access, or
archive/restore privacy guards.
Deterministic template remix safety has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-template-remix-handoff-semantic-views.test.ts`;
run it when changing template readiness, suggested Copy as actions,
ready-target-only gating, archived restore gates, remixed draft title
strategy/limit, content and source-material clone counts, assignment snapshot
protection, original-activity protection, template remix privacy-scope
boundaries, or the activity-card compatibility handoff.
AI remix assist boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-remix-assist-handoff-semantic-views.test.ts`;
run it when changing source/target template diagnosis, target readiness,
missing structured requirements, deterministic-remix versus AI-completion
paths, editor-review gates, draft/persist/publish boundaries, source-material
provenance guards, content coverage counts, AI remix assist privacy-scope
boundaries, or the hidden AI remix assist handoff.
Assignment list filter and distribution boundaries have a fast script-level gate
via `pnpm exec tsx --test scripts/assignment-list-semantic-views.test.ts`; run
it when changing assignment list overview metrics, status/search filters,
published share context, visible-card counts, assignment list privacy-scope
boundaries, or the hidden assignment-list handoff.
Assignment distribution lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-distribution-lifecycle-chain-handoff.test.ts`;
run it when changing post-publish route context, owner-scoped published lookup,
absolute student URLs, frozen source activity context,
copy/preview/print/results actions, assignment-list distribution steps,
share-link handoff surfaces, or published-panel privacy guards.
Assignment lifecycle boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-lifecycle-handoff-semantic-views.test.ts`;
run it when changing open/closed/expired/draft status resolution, close/reopen
actions, public-route access, submission gates, result retention,
close-window policy, assignment lifecycle privacy-scope boundaries, or the
hidden assignment-lifecycle handoff.
Assignment share-link distribution boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-share-link-handoff-semantic-views.test.ts`;
run it when changing share-slug normalization, `/play/:shareId` path encoding,
absolute share URLs, copy/preview disabled gates, publish-success/list/result
surfaces, assignment share-link privacy-scope boundaries, or the hidden
assignment-share-link handoff.
AI source panel control boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-source-semantic-views.test.ts`; run it
when changing AI source textarea descriptions, source-readiness, safe/omitted
material provenance, attached-material capability summaries, sync-material
controls, generate-button gating, or the hidden AI source handoff.
AI draft boundary handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-draft-boundary-handoff-semantic-views.test.ts`;
run it when changing AI generation gates, authenticated server-function input
schemas, provider/model/notice provenance, fallback handling, source
sanitization, safe material provenance, CreateActivityInput mapping, editor
application, teacher-review requirements,
AI draft boundary privacy-scope boundaries, or persistence/publish boundaries.
AI draft metadata summary has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-draft-meta-handoff-semantic-views.test.ts`;
run it when changing draft coverage counts, provider/model/notice trust
provenance, structured review checklists, ready/locked template diagnostics,
quiz-choice readiness, AI draft metadata privacy-scope boundaries,
safe/omitted source provenance, or save/publish boundaries before teacher
review.
Transactional mail lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/transactional-mail-lifecycle-chain-handoff.test.ts`;
run it when changing the transactional template set, locale fallback,
HTML/plain-text rendering, shared workspace boundary, auth reset/verification,
newsletter confirmation, contact classroom inquiry, provider registry, mail
disabled/provider-secret guards, no-mutation guarantees, or mail privacy guards.
Activity AI authoring chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-authoring-chain-handoff.test.ts`;
run it when changing AI source safety, authenticated draft generation,
deterministic fallback, CreateActivityInput mapping, draft coverage,
template readiness, quiz-choice readiness, AI remix assist, editor review,
source-material privacy guards, or save/publish boundaries.
Activity AI fallback draft chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-fallback-draft-chain-handoff.test.ts`;
run it when changing missing Workers AI credentials, invalid provider JSON,
deterministic local draft generation, source-term planning, fallback padding,
CreateActivityInput mapping, teacher review, editor application,
save/publish boundaries, provider-secret guards, or fallback privacy guards.
Activity AI enhancement roadmap chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-roadmap-chain-handoff.test.ts`;
run it when changing template transforms, AI remix completion, distractor write
targets, leveled variants, answer explanations, listening scripts,
worksheet/audio/spreadsheet extraction, provider and fallback gates,
source-material privacy, editor-review/save/publish boundaries, snapshot
protection, public-payload guards, or result-export continuity.
Activity AI enhancement policy has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-policy.test.ts`;
run it when changing teacher-auth gates, deterministic readiness, structured
draft targets, source-material capability counts, provider/fallback posture,
editor-review/save/publish boundaries, snapshot protection, public-payload
guards, or result-export continuity.
Activity AI enhancement execution has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-execution.test.ts`;
run it when changing provider-ready, local-fallback, deterministic-draft, or
blocked-reason execution states, editor-only draft targets, source-material
readiness, provider-call boundaries, fallback stability, auth gates, or privacy
guards.
Activity AI enhancement draft output has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-draft-output.test.ts`;
run it when changing provider/fallback/deterministic output, parsed draft
source modes, CreateActivityInput parsing, normalized output counts, template
readiness previews, editor-application boundaries, save/publish boundaries,
snapshot/result continuity, or privacy guards.
Activity AI enhancement draft application has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-draft-application.test.ts`;
run it when changing execution plans, CreateActivityInput validation,
editor-only application, field-target coverage, coverage/readiness refresh,
teacher-review/save/publish boundaries, snapshot protection, public-payload
continuity, fallback/provider application modes, or privacy guards.
Activity AI enhancement editor review has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-editor-review.test.ts`;
run it when changing teacher review checklists, reviewed/missing check counts,
manual-save readiness, editor-only boundaries, publish blocking, snapshot
protection, public-payload guards, source-material privacy, or privacy guards.
Activity AI enhancement save boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-save-boundary.test.ts`;
run it when changing teacher save actions, create/edit save plans, activity-id
gates, manual persistence boundaries, activity-record targets, publish
blocking, snapshot protection, result continuity, source-material privacy, or
privacy guards.
Activity AI enhancement publish boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-publish-boundary.test.ts`;
run it when changing saved activity records, teacher publish actions,
assignment publish preflight, share-link creation boundaries, snapshot
freezing, public-payload guards, result continuity, source-material privacy, or
privacy guards.
Activity AI enhancement lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-lifecycle-chain.test.ts`;
run it when changing policy-to-publish ordering, draft output handoffs, editor
application, teacher review, manual save, saved activity records, assignment
publish actions, share-link/snapshot boundaries, public payload/privacy guards,
or result-export continuity.
Template roadmap capability chain has a fast script-level gate via
`pnpm exec tsx --test scripts/template-roadmap-capability-chain-handoff.test.ts`;
run it when changing roadmap template promises, Wordwall-style templates,
Liveworksheets-style modes, shared editor scaffolds, AI enhancements, source
extraction readiness, worksheet delivery, print follow-up, result export
continuity, or template capability privacy guards.
Activity authoring/library chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-authoring-library-chain-handoff.test.ts`;
run it when changing public template and worksheet entries, shared editor save,
edit hydration, owner-scoped library management, derivative drafts, lifecycle
gates, publish snapshot boundaries, or the end-to-end activity creation to
library workflow contract.
Source extraction assist has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-source-extraction-assist-handoff-semantic-views.test.ts`;
run it when changing attached-material extraction readiness, audio draft paths,
worksheet extraction paths, spreadsheet import paths, ActivityContent write
targets, editor-review gates, source-material privacy guards, or parallel
worksheet-model boundaries.
Source extraction lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/source-extraction-lifecycle-chain-handoff.test.ts`;
run it when changing compact source-material references, material-kind
classification, extraction readiness action maps, audio/worksheet/spreadsheet
readiness, source summary handoffs, AI source provenance, ActivityContent write
targets, editor-review/persistence/publish boundaries, assignment snapshot
protection, public payload privacy, or source-extraction lifecycle guards.
Assignment publish control boundaries have fast script-level gates via
`pnpm exec tsx --test scripts/assignment-publish-handoff-semantic-views.test.ts`
and `pnpm exec tsx --test scripts/classroom-control-semantics-handoff.test.ts`;
run them when changing publish-setting input IDs, help text associations,
delivery toggles, frozen-link preview regions, delivery-rule stats, review
checklists, validation alerts, assignment publish privacy-scope boundaries, or
opaque control scope handling.
AI fallback source-term planning has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-fallback-source-term-plan.test.ts`;
run it when changing deterministic fallback source extraction, material-note
omission, source-term padding, or the fallback draft term consumers.
Attempt persistence boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-persistence-handoff-semantic-views.test.ts`;
run it when changing submit-attempt persistence, scored-attempt inserts,
answer/result JSON cloning, identity fields, score/maxScore mapping,
duration persistence, result-analysis consumers, stats consumers, or CSV export
consumers.
Scored attempt result lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/scored-attempt-result-chain-handoff.test.ts`;
run it when changing the post-submit scored-result boundary, sanitized public
feedback, attempt stats, teacher result review, copy artifacts, CSV export,
printable review return links, duration display, accepted-answer formatting, or
scored-result privacy guards.
Quiz choice generation has a fast script-level gate via
`pnpm exec tsx --test scripts/question-choice-generation-handoff-semantic-views.test.ts`;
run it when changing deterministic distractor generation, question option
normalization, editor quiz-choice readiness, runtime quiz choices, validation
of `ActivityQuestion.options`, future AI distractor write targets, or
quiz-choice generation privacy-scope boundaries.
Printable worksheet handoff has a fast script-level gate via
`pnpm exec tsx --test scripts/printable-worksheet-handoff-semantic-views.test.ts`;
run it when changing print-route search parsing, worksheet response policies,
frozen snapshot worksheet generation, source activity description fields,
delivery-policy printing, answer-key toggle behavior, privacy-scope boundaries,
accepted-answer/explanation rendering, or the print toolbar.
Printable worksheet review lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/printable-worksheet-review-lifecycle-chain-handoff.test.ts`;
run it when changing result-page print actions, teacher-only print routes,
frozen snapshot handouts, answer-key hidden/included/unavailable states, source
activity description fields, toolbar toggles, print actions,
return-to-results links, printable handoff privacy, worksheet delivery chain
alignment, or CSV export alignment.
Worksheet-mode delivery chain has a fast script-level gate via
`pnpm exec tsx --test scripts/worksheet-mode-delivery-chain-handoff.test.ts`;
run it when changing `/worksheets` creation entry points, shared create editor
scaffolds, assignment snapshots, worksheet-style student runtimes, printable
handouts, result exports, worksheet extraction boundaries, or source-material
and student-identity privacy guards.
Student runner play chain has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-play-chain-handoff.test.ts`;
run it when changing public payload access, public rule summary, runner loading
or start readiness, identity and anonymous-token policy, attempt limits,
timers/duration, template renderers, progress counts, partial-submit controls,
submission validation, attempt persistence, or answer feedback.
Fill-blank worksheet runtime has a fast script-level gate via
`pnpm exec tsx --test scripts/fill-blank-worksheet-handoff-semantic-views.test.ts`;
run it when changing the 30-slice worksheet handoff, inline blank coverage,
standalone fallback coverage, word-bank coverage, answer-row scope,
partial-submit boundaries, answer-input state, review visibility,
accepted-answer or explanation visibility, fill-blank worksheet privacy-scope
boundaries, runtime-id/prompt/answer/word-bank/student/source-material guards,
or the hidden fill-blank-worksheet handoff.
Line-match board runtime has a fast script-level gate via
`pnpm exec tsx --test scripts/line-match-board-handoff-semantic-views.test.ts`;
run it when changing prompt and choice card counts, selected prompt state,
choice target readiness, available/used/unused choice counts, exclusive choice
and reassignment policy, review feedback, line-match board privacy-scope
boundaries, runtime-id/prompt/choice/answer/student/source-material guards, or
the hidden line-match-board handoff.
Group-sort board runtime has a fast script-level gate via
`pnpm exec tsx --test scripts/group-sort-board-handoff-semantic-views.test.ts`;
run it when changing category and item counts, selected item state, category
target readiness, unplaced/placed item counts, placement actions, review
feedback, group-sort board privacy-scope boundaries, runtime-id/prompt/answer
or student/source-material guards, or the hidden group-sort-board handoff.
Open-box reveal-card runtime has a fast script-level gate via
`pnpm exec tsx --test scripts/open-box-reveal-handoff-semantic-views.test.ts`;
run it when changing reveal-card state, box and prompt counts, navigation
actions, answer-input state, review feedback, open-box reveal-card
privacy-scope boundaries, prompt/item-id/answer/student/source-material guards,
or the hidden open-box-reveal-card handoff.
Listening speech runtime has a fast script-level gate via
`pnpm exec tsx --test scripts/listening-speech-handoff-semantic-views.test.ts`;
run it when changing speech language source, browser voice language, speech
support, transcript visibility, answer input, review feedback,
listening speech privacy-scope boundaries, prompt/runtime-id/student/source-material
guards, or the hidden listening-speech handoff.
Matching-pairs board runtime has a fast script-level gate via
`pnpm exec tsx --test scripts/matching-pairs-board-handoff-semantic-views.test.ts`;
run it when changing prompt and choice card counts, selected prompt state,
choice target readiness, exclusive choice and reassignment policy, review
feedback, matching-pairs board privacy-scope boundaries,
runtime-id/prompt/choice/answer/student/source-material guards, or the hidden
matching-pairs-board handoff.

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
| 1 | Public pages render successfully | Open `/`, `/templates`, `/create`, `/worksheets`, `/play/demo-food`, `/pricing`, `/teachers`, `/contact`, `/contact?subject=classroom`, `/roadmap`, `/blog`, `/cookie`, `/privacy`, `/terms`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/error?error=state_mismatch&error_description=raw-provider-text` for `en` and `zh`, in `dark` and `light` mode. Verify each returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. On `/templates` and `/worksheets`, verify the localized 30-slice public template entry handoff covers entry surface, routes, template and worksheet counts, default template, create and preview actions, source query parameters, scaffold loading, shared editor contract, content requirements, card entry steps, worksheet delivery loop, workflow steps, assignment snapshot boundary, results/export boundary, printable extension, indexing scope, legacy guard, and privacy guard without exposing teacher activity content, answer keys, assignment attempts, raw student identity, source-material storage keys, or private workspace data. On `/teachers`, verify the localized 30-slice teachers-page product-loop handoff covers teacher audience, shared route actions, workflow steps, use cases, template catalog count, classroom-mode labels, individual template modes, school CTA route, activity-assignment-attempt-results loop, legacy-copy guard, and privacy guard without creating assignment links or exposing teacher activity content, answer keys, student attempt records, raw anonymous tokens, source-material storage keys, or private workspace data. On public pages with the shared footer, verify the localized 30-slice public navigation handoff covers desktop navigation, mobile navigation, footer entrypoints, templates/worksheets/create/student-preview/pricing/blog routes, footer product/platform/support/legal sections, footer CTA, activity-assignment-attempt-results loop metrics, shared route constants, legacy-copy guard, and privacy guard without creating assignment links, mutating teacher workspaces, or exposing teacher activity content, answer keys, student attempt records, raw anonymous tokens, source-material storage keys, or private workspace data. On `/contact?subject=classroom`, verify the localized 30-slice classroom inquiry intake contract remains covered by source-level semantic tests for classroom intent, subject routing, message template, learners, grade, material, routine, need, message body, requester name, reply email, field normalization, field limits, structured payload, API intent normalization, mail context, locale forwarding, safe-context boundary, private-data guard, no-activity mutation, no-student notification, and legacy-copy guard, while the public contact DOM keeps the useful classroom scope panel and structured fields but does not render internal intake handoff markup, imply that a contact form creates activities, assignment links, learner notifications, file reads, or public student records. On auth pages, verify the localized teacher workspace boundary explains account access, activity library, assignment links, student results, and source-material ownership before users sign in or reset access, while the localized 30-slice auth workspace entry contract remains covered by source-level semantic tests for auth surface, provider gates, callback safety, forms, workspace access, public runner boundary, answer-key guard, anonymous-token guard, legacy-copy guard, and privacy guard without rendering internal auth handoff markup in the public DOM. On the auth error page, verify the localized recovery panel explains the workspace sign-in issue, teacher sign-in retry, email-link check, protected workspace data, and does not render raw `error_description` text. With a banned-account fixture, verify the blocked teacher-workspace message is localized and does not fall back to Better Auth or starter-template English. |
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
| 1 | Protected pages render successfully | Sign in as an admin E2E user, then open `/dashboard`, `/dashboard/activities`, `/dashboard/assignments`, `/admin/users`, `/settings/profile`, `/settings/security`, `/settings/notifications`, `/settings/files`, and when `VITE_PAYMENT_PROVIDER` is configured, `/settings/billing` and `/settings/payment` for `en` and `zh`, in `dark` and `light` mode. Verify each active product page returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. On auth-adjacent and settings surfaces, verify localized copy describes the ClassGamify teacher workspace, activities, source materials, assignment links, student attempts, result records, or billing access rather than generic account or copied learning-site language. On `/settings/profile`, verify the teacher identity scope summary explains where the display name and avatar are used across activities, assignment handoff, student recognition, and result review. On `/settings/security`, verify the workspace security boundary and available security controls explain account access, activities/source materials, assignment links, and student result records. On `/settings/notifications`, verify the classroom update boundary explains teacher-controlled product update emails, template and worksheet updates, assignment review, teacher control, email channel, subscription status source, update frequency, activity/library/content boundaries, assignment snapshots, attempt records, result exports, source-material read boundaries, student reminders, public links, learner notifications, mutation payloads, private data, and legacy-copy guard as a localized 30-slice handoff without sending student reminders, changing public links, notifying learners, reading source files, exposing teacher email, raw provider errors, raw mutation payloads, source-material storage keys, student identifiers, or copied learning-site language. On `/settings/files`, verify the classroom material boundary explains the source material library, activity attachments, AI draft provenance, and student payload privacy before the file table, and verify the localized 30-slice source-material handoff covers owner scope, storage gate, upload controls, total/storage/worksheet/audio/private/public summaries, visible rows, pagination, name/material/access table columns, open/delete actions, ActivityContent.sourceMaterials references, activity attachment boundary, AI provenance, safe filename provenance, file-byte guard, storage-key guard, permission guard, student payload guard, worksheet extraction boundary, and privacy guard without exposing teacher filenames, file bytes, storage keys, permission metadata, private activity content, or raw student identity. When payment is configured, verify `/settings/billing` exposes the localized billing workspace boundary for plan access, activity library, assignment workflow, results and AI, hosted checkout, customer portal, provider secret boundaries, student-data boundaries, and privacy guard; verify `/settings/payment` exposes the localized 30-slice payment callback handoff for hosted checkout confirmation, session-id privacy, polling interval and timeout, server completion check, current-plan cache refresh, safe callback normalization, billing return, pricing retry, timeout recovery, activity/assignment/AI/result/source-material access, assignment snapshot/link boundaries, student-attempt and student-data boundaries, provider-secret and raw-session guards, without exposing raw checkout sessions, teacher emails, student answers, anonymous tokens, source-material storage keys, provider secrets, or mutating classroom data. |
| 2 | Settings files classify classroom materials | With storage enabled, open the dashboard sidebar, follow the settings Files entry, and verify `/settings/files` loads for `en` and `zh`. Seed saved file rows for audio, worksheet image, worksheet document, spreadsheet, and unknown classroom materials, then verify the Material column shows localized teacher-facing labels while preserving the raw content type as secondary detail for troubleshooting. Verify the hidden localized 30-slice material-classification handoff covers classification source, content-type normalization, extension fallback, audio, worksheet image/document, spreadsheet, archive, data, video, unknown-file fallback, table primary/secondary values, total/storage/worksheet/audio summaries, owner scope, ActivityContent.sourceMaterials references, AI provenance, student-payload guard, file-byte guard, storage-key guard, filename/path guard, permission guard, public/private access split, upload validation, visible-row classification, full-library summary, and privacy guard without exposing original filenames, file bytes, storage keys, permission metadata, source-material file metadata in public payloads, or private activity content. Verify the summary strip shows total materials, storage used, worksheet material count, and audio material count from the full file library rather than only the visible page. |

## 4. Profile Settings

**File:** `specs/settings-profile.spec.ts` | **Priority:** P1

Verifies the signed-in profile update flow.

| # | Test name | Flow |
|---|---|---|
| 1 | User can update display name | Sign in, open `/settings/profile`, verify the localized teacher identity scope summary is visible, change the name, save, verify success toast, and reload to verify persistence. Open `/zh/settings/profile` and verify the same teacher identity scope summary is localized. |

## 5. Activity Authoring

**File:** `specs/activity-authoring.spec.ts` | **Priority:** P1

Verifies the core teacher loop for creating reusable activities before
assignment publishing is enabled.

| # | Test name | Flow |
|---|---|---|
| 1 | Teacher can save a structured activity | Sign in as a verified teacher, open `/create`, choose a template, verify its required content badges and template readiness panel appear, load its scaffold, verify the scaffold fills a coherent lesson with questions, match pairs, groups, vocabulary, and teacher notes where the shared content model supports them, verify ready template badges update from the structured text fields, verify the hidden localized 30-slice activity-editor-workflow handoff covers workflow source, five-step order, create/edit page surfaces, workflow nav, form sections, side preview, frame fields, template handoff, scaffold panel, AI draft/source/sync boundaries, content fields, source-material picker, review/readiness panel, save footer, auth gate, CreateActivityInput contract, template-readiness contract, AI editor boundary, source privacy boundary, publish boundary, and privacy guard without creating assignment links, publishing assignments, saving without teacher action, or exposing prompts, answers, teacher notes, raw editor input, source-material file ids, or storage keys, verify the hidden localized 30-slice activity-editor-template handoff covers selected template, template badge, classroom mode, required content, selected-template readiness, ready template count/options, suggested remixes, locked template count/options, quiz-choice readiness, scaffold action, scaffold runtime items, scaffold ready modes, reusable scaffold coverage, scaffold question/pair/group/vocabulary/teacher-note counts, shared editor contract, parsed content status, current question/pair/group/vocabulary/teacher-note counts, scaffold review steps, save-before-publish boundary, and privacy guard without exposing prompts, answers, choices, teacher notes, raw editor input, raw scaffold content, source-material file ids, or source-material storage keys, change the title/content fields, save the activity, expect redirect to `/dashboard/activities`, verify the activity title appears, reload, verify it still appears from persisted D1 data, open the saved activity edit route, and verify the hidden localized 30-slice activity-edit-route handoff covers route status, activity source, owner scope, persisted source, edit access, lifecycle gate, archived restore action, editor mode, shared CreateActivityInput contract, title/description/template/visibility/learning-goal hydration, question/option/explanation/pair/group/vocabulary/teacher-note counts, source-summary privacy, source-material counts and reference hydration, readiness after load, future-assignment boundary, snapshot protection, save target, and privacy guard without exposing activity ids, prompts, answers, choices, explanations, teacher notes, source summary text, source-material filenames, file ids, or storage keys. |
| 2 | Template requirements are enforced | Sign in, open `/create`, choose a match-based template, clear match pairs, submit, and verify a validation error explains the missing content requirement. |
| 2a | Assignment publish controls use prepared semantic boundaries | Open the publish dialog from a saved activity and verify the source-level `assignment-publish-control-semantics` boundary exposes 30 stable control slices for publish title, instructions, attempt limit, timer, close time, delivery toggles, preview region, frozen-link status, delivery-rule stats, review checklist, validation alert, field limits, publish action, privacy guard, prepared control IDs, and opaque control scope. Verify title, instructions, max attempts, timer, close time, and toggles are associated with prepared help or description IDs through `aria-describedby`, preview and checklist regions are labelled by prepared IDs, and DOM control IDs do not include internal activity ids, assignment title text, student instructions, share slugs, raw settings JSON, student names, source-material storage keys, student answers, or answer keys. |
| 3 | Teacher can publish and copy a configured student share link | Sign in, save a structured activity, verify the saved-activity panel appears, click the panel publish assignment action, set the assignment title, student instructions, name collection, answer reveal, shuffle, max attempts, and optional time limit, verify invalid title, max-attempt, time-limit, or close-after values show a pre-publish validation hint before submission, verify the publish dialog delivery preview updates for attempts, timer, close time, student identity mode, answer reveal behavior, and item order, exposes labelled semantic regions for the preview status, delivery-rule stats, and review checklist, verify the hidden localized 30-slice assignment-publish handoff covers publish access, activity lifecycle gate, publish action/button state, validation status/message, title presence, draft field count, field limits, frozen-link status, delivery rule count, settings-summary status, student-instruction presence, timer and close-time status, review-checklist count, delivery-default resolution, attempts policy/parser, identity, answer reveal, item order, timer parser, settings JSON boundary, close-time parser, snapshot freeze, student-link rules, public-payload boundary, results policy, and privacy guard without exposing raw activity content, assignment title text, student instructions, share slugs, raw settings JSON, student names, source-material storage keys, student answers, or answer keys, verify the hidden localized 30-slice assignment-delivery-policy handoff covers settings resolution, publish preview, assignment card, result header, public student rules, item count, attempts, timer, close time, identity, answer reveal, item order, instructions, public/settings rule counts, default/unlimited attempts, timer/close-time normalization, policy text/export, snapshot/public-payload/result-export boundaries, legacy-copy guard, and privacy guard without creating assignment links or exposing answer keys, raw settings JSON, share slugs, student names, student answers, or source-material storage keys, clear the max-attempt input and verify the preview, persisted assignment card, student runner rules, submission usage, results, printable worksheet, and CSV export all preserve unlimited attempts instead of falling back to the default cap, expect redirect to `/dashboard/assignments?published=:shareId`, verify the published-assignment panel resolves the share slug through the assignment list data, shows both the localized full student URL and the labeled `/play/:shareId` student path from the shared share-link view, exposes localized next-step guidance for copying, previewing, and reviewing results, shows copy-student-link, student preview, print, and results actions for the new share link, and keeps the source-level `owner-assignment-list-filter-scope` boundary aligned across full filtered assignment count, overview count, visible-page count, owner-scoped status/search filters, and published share context, verify the assignment card summarizes the same settings and also shows the same full student URL plus labeled student path, copy the generated student link, verify the copied URL matches the displayed full student URL and ends with `/play/:shareId`, open the generated `/play/:shareId` link, verify the student runner labels, shows the teacher's student instructions, and displays before-start guidance for reviewing rules, identity mode, timer behavior, and submitting answers, verify the runner shows a public rule summary with a localized rules heading, status badge, item count, attempts, timer, close time, identity mode, and review behavior without exposing answers, verify the hidden localized `data-handoff="student-runner-start"` handoff renders 30 safe start slices in the student runner DOM while the public-assignment-access 30-slice domain contract remains covered by source-level semantic tests and the public `/play/:shareId` DOM does not render `data-handoff="public-assignment-access"` audit markers, verify the visible public rule summary and before-start guidance expose localized rules, identity mode, timer behavior, review behavior, sanitized payload boundaries, and student-safe submission expectations without exposing prompt text, choice text, answer keys, accepted alternatives, raw item ids, raw anonymous tokens, student names, student answers, teacher-only answers, ActivityContent JSON, settings JSON, snapshot content, source-material metadata, or unavailable-link content, and verify the runner honors the settings. Exercise a partial-settings fixture and verify assignment cards, student payloads, submission limits, results, and CSV exports all resolve the same default delivery settings while explicit unlimited-attempt settings stay unlimited. |
| 4 | Student can submit an attempt | Open a persisted `/play/:shareId`, enter a student name with extra whitespace and some answers, verify the runner shows a localized attempt workspace region, attempt status region, identity region, answered/unanswered progress derived from the frozen runtime item ids, and submit controls whose accessible descriptions reference the current submit hints, with progress, submit-readiness checks, and browser payload metrics exposed as labelled semantic outputs and the submit button described by the same localized readiness and hint views, try to submit with an unanswered item and verify the first click asks for confirmation both in the toast and as a persistent warning-toned submit hint next to the `Submit anyway` button, submit anyway or complete the missing answer, verify the prepared browser payload summary is visible as a localized semantic label/value output group that reflects the frozen share slug, runtime item count, submitted answer count, and unanswered count before the mutation runs without exposing the student name, answer text, or raw anonymous browser token, verify the named-student identity cannot be edited while submission is in flight, verify the score panel appears with the server-derived remaining-attempts message, localized result region label, score aria label, result score/time/attempt-usage outputs, review-summary and feedback-scope regions with semantic label/value/description metric outputs, and next-step region for reviewing score/time, feedback availability, teacher review, or starting another attempt, verify the submitted named-student identity is locked while the score panel is visible and displays the same normalized name stored with the attempt, and verify post-submit feedback shows the student's submitted answer before the correct answer when answer reveal is enabled. For partial submissions with answer reveal enabled, verify unanswered items are marked as unanswered and still show the correct answer, accepted alternatives, and explanation after submission. Use the start-another-attempt action when the assignment still has attempts remaining, and verify it clears answers while preserving the same normalized student identity for the next submission. Reload `/dashboard/assignments` as the teacher and verify completions/average score update. Direct submission with partial answers is accepted, while duplicate item ids, unknown item ids, or more answer rows than frozen runtime items are rejected. |
| 4a | Student submission exposes a hidden 30-slice safe handoff | Open a persisted `/play/:shareId`, prepare a partial browser answer set, and verify visible progress, prepared payload summary, submit-readiness checks, partial-confirmation state, identity mode, timer and attempt-clock state, result status, score, accuracy, attempt usage, retry availability, review submitted/needs-review/unanswered counts, feedback visibility, feedback item count, accepted-answer/explanation evidence, and next steps stay exposed through labelled public runner regions. Verify the hidden localized `data-handoff="student-runner-submission"` handoff exposes 30 stable semantic label/value/description outputs for those slices in the student runner DOM. Verify the contract and public UI do not expose raw anonymous tokens, student names, answer text, raw submission payload rows, runtime item ids, teacher-only answers, or teacher source-material metadata before or after submission. |
| 4b | Student runtime interaction exposes a 30-slice handoff | Open persisted `/play/:shareId` assignments for quiz, line-match, fill-blank, listening, group-sort, matching-pairs, and open-box templates, and verify the hidden localized student-runtime-interaction handoff exposes 30 stable semantic label/value/description output relationships for template type, runner surface, supported renderer count, renderer dispatch boundary, runner title, runtime item and kind counts, choice count, each renderer activation state, listening language, shared answer contract, answer-change contract, submission payload boundary, selection scope, review-feedback visibility, review item count, feedback-data boundary, disabled state, public-payload boundary, runtime-id boundary, prompt/choice/answer text boundaries, and privacy guard. Verify the handoff follows the same renderer surface selected by the visible runner, counts review items after submission without exposing submitted answers, and does not expose prompt text, choice text, answer text, runtime item ids, student names, teacher-only answers, raw anonymous tokens, ActivityContent JSON, or source-material metadata. |
| 4c | Student runtime identity exposes a 30-slice handoff | Open persisted `/play/:shareId` assignments for quiz, line-match, fill-blank, listening, group-sort, matching-pairs, and open-box templates, including a group-sort assignment whose Chinese items normalize to colliding slugs, and verify the hidden localized student-runtime-identity handoff exposes 30 stable semantic label/value/description output relationships for template type, runner surface, runtime item count, normalized runtime id count, unique-id status, duplicate-id count, blank-id count, question/pair/group-item counts, choice count, runtime id normalization source, multilingual id collision guard, shared submission contract, submission validation boundary, unknown answer id policy, duplicate answer id policy, answer list length policy, browser-answer boundary, scoring lookup boundary, teacher-results boundary, public-payload boundary, assignment snapshot boundary, ActivityContent boundary, prompt/choice boundary, answer-text boundary, student-name boundary, anonymous-token boundary, source-material boundary, and privacy guard. Verify duplicate or blank normalized runtime ids are reported as blocked before submissions are accepted, while the handoff does not expose raw runtime ids, prompts, choices, answers, student names, anonymous tokens, ActivityContent JSON, or source-material metadata. |
| 4d | Student runtime choice assignment exposes a 30-slice handoff | Open persisted `/play/:shareId` assignments for line-match, matching-pairs, group-sort, and quiz templates, select prompts/items and choices, and verify the hidden localized runtime-choice-assignment handoff exposes 30 stable semantic label/value/description output relationships for template type, runner surface, exclusive pairing state, group placement state, choice-list state, normalized and duplicate choice counts, shared choice-key normalization, selected item state and validity, selected choice ownership, occupied and unassigned choice counts, answer-change contract, exclusive clear/set changes, disabled action policy, no-selected and stale-selection policies, prompt/item selection toggles, choice/group action boundaries, group clear boundary, normalized answer scope, shared submission contract, public-payload boundary, and prompt/choice/item-id/answer/privacy guards. Verify line-match and matching-pairs move an occupied right-side choice by clearing the previous prompt before setting the new prompt, group-sort waits for a selected item before placing it into a group, quiz choices remain scoped per card, disabled runners do not mutate answers, stale selected ids are cleared when runtime items change, and the handoff does not expose raw prompts, choice text, item ids, student answers, anonymous tokens, teacher-only answers, ActivityContent JSON, or source-material metadata. |
| 4d.1 | Student runtime semantic bundle mirrors 30 safe child handoff slices | Open persisted `/play/:shareId` assignments for quiz, line-match, fill-blank, listening, group-sort, matching-pairs, and open-box templates, and verify the hidden localized student-runtime-semantic-bundle handoff exposes 30 stable semantic label/value/description output relationships sourced from the existing student-runtime-interaction, student-runtime-choice-assignment, and student-runtime-identity handoffs. Verify each bundle item includes stable source-scope and source-item markers for interaction template/surface/renderer/runtime/answer/review/privacy slices, choice-assignment surface/exclusive/group/choice/answer/public-payload/privacy slices, and identity template/surface/count/id/submission/public-payload/snapshot/privacy slices. Verify the bundle mirrors child handoff values instead of recalculating prompt, choice, answer, student identity, anonymous token, runtime id, ActivityContent, or source-material data, and does not expose raw prompts, choice text, runtime item ids, student names, anonymous tokens, teacher-only answers, ActivityContent JSON, or source-material metadata. |
| 4e | Assignment attempt limits keep a 30-slice domain contract without public audit DOM | Open a persisted `/play/:shareId` assignment with a finite max-attempt limit, submit until the server returns remaining-attempt usage, and verify the visible public rules, submit gate, result usage label, retry button state, delivery summary, result page, and export boundary all agree on previous/used/remaining attempts and limit-reached blocking. Verify the source-level assignment-attempt-limit contract still exposes 30 stable semantic label/value/description outputs for per-student limit scope, max-attempt normalization, previous/used/remaining attempts, unlimited-attempt propagation, limit-reached blocking, retry availability, result usage label, named-student identity normalization, anonymous-token identity normalization, identity mode, attempt-counter source, max-attempt parser, previous-count query, server enforcement, scored-attempt write gate, runner result usage, retry button boundary, submission gate reuse, delivery summary alignment, public rule alignment, result-page alignment, result export alignment, negative/fractional/non-finite/zero guard values, raw-token guard, and privacy guard while the public student DOM does not render `data-handoff="assignment-attempt-limit"` audit markers. Repeat with an unlimited-attempt assignment and verify the max-attempt and remaining-attempt values stay unlimited across the runner, result usage, delivery summary, result page, and export boundary while the contract and public UI omit raw anonymous tokens, student names, answer text, raw identity keys, raw submission payload rows, and teacher-only answers. |
| 4f | Assignment submission validation keeps a 30-slice domain contract without public audit DOM | Open a persisted `/play/:shareId`, prepare a partial browser answer set, and verify visible public submit readiness, payload summary, progress, partial-submit confirmation, safe failure mapping, and result feedback align with frozen runtime validation. Verify the source-level assignment-submission-validation contract still exposes 30 stable semantic label/value/description outputs for frozen runtime validation scope, runtime source, runtime and submitted-answer counts, partial submission allowance, empty-answer omission, runtime and submitted id normalization, runtime id uniqueness, blank/unknown/duplicate/too-many/duplicate-runtime rejection, fullwidth id normalization, API answer/item/text/max-answer limits, API normalization, validate-before-scoring order, scoring and persistence with normalized answers, client payload and progress sources, safe failure mapping, teacher-result/public-payload boundaries, raw-payload guard, and privacy guard while the public student DOM does not render `data-handoff="assignment-submission-validation"` audit markers. Verify partial submissions remain accepted after confirmation while duplicate item ids, unknown item ids, blank item ids, duplicate normalized runtime ids, and answer lists longer than frozen runtime items are rejected before scoring; the contract and public UI must not expose runtime item ids, prompt text, choice text, answer text, raw submission payload rows, student names, anonymous tokens, teacher-only answers, ActivityContent JSON, settings JSON, or source-material metadata. |
| 4g | Assignment attempt persistence keeps a 30-slice source-level contract without public audit DOM | Open a persisted `/play/:shareId`, submit a scored attempt, and verify the source-level assignment-attempt-persistence contract still exposes 30 stable semantic label/value/description outputs for lifecycle gate, identity gate, attempt-limit gate, runtime-validation gate, scoring source, insert helper, assignment id, attempt id, started/completed timestamps, student-name and anonymous-token identities, answers JSON, template type, answer correctness, result JSON, score, max score, duration, immutable answer/result copies, public result boundary, review summary boundary, result-analysis boundary, attempt-stats boundary, CSV export boundary, source-material guard, raw-payload guard, and privacy guard. Verify scored-attempt insert rows are built through `buildScoredAttemptInsert`, answer/result JSON are cloned before persistence, score/maxScore come from evaluation result points, and result analysis, attempt stats, and CSV export consume stored attempt records while the public student DOM does not render `data-handoff="assignment-attempt-persistence"` audit markers or expose student names, anonymous tokens, submitted answers, teacher-only answers, raw submission payload rows, runtime item ids, ActivityContent JSON, settings JSON, or source-material metadata. |
| 5 | Student runner adapts to template content | Create quiz, match-up, line-match, fill-blank, listening, open-box, matching-pairs, and group-sort activities, publish each one, open each `/play/:shareId`, verify quiz and match-up render clickable choices, verify line-match renders a two-column connection board without exposing the answer map, verify the hidden localized 30-slice line-match-board handoff exposes stable semantic label/value/description output relationships for template/surface, board state, left prompt and right choice counts, selected prompt state and validity, prompt selection toggle, choice target readiness, available/used/unused choice counts, exclusive choice and reassignment policy, answered/unanswered connection progress, disabled policy, review feedback, accepted-answer/explanation post-submit boundaries, sanitized public payload, shared submission contract, runtime-id/prompt/choice/answer/student/source-material guards, and no prompt text, choice text, answer text, runtime ids, source-material metadata, or student identity, verify fill-blank renders worksheet-style inline blanks instead of multiple-choice cards, verify listening renders track buttons, an audio play control, localized readiness status for browser speech support, activity voice language, and transcript visibility, hidden transcripts before submission, and answer input or choices whose accessible descriptions reference the listening status, verify the hidden localized 30-slice listening-speech handoff covers template/surface, speech-language source, normalized browser voice language, speech support, playback action, speech-text boundary, transcript visibility and review policy, active track, track counts, progress, sequential navigation, answer input, answer mode, review feedback, accepted-answer/explanation post-submit boundaries, sanitized public payload, runtime-id/prompt/student-identity privacy guards, and no speech text, prompt text, answer text, runtime ids, source-material metadata, or student identity, verify open-box renders selectable boxes with one revealed prompt and answer field, verify group-sort renders a category board where items move into selected groups, verify the hidden localized 30-slice group-sort-board handoff exposes stable semantic label/value/description output relationships for template/surface, board state, category and item counts, unplaced/placed item counts, selected item state and validity, clear action, category target readiness, available category count, placement action, item selection toggle, answered/unanswered progress, disabled policy, review feedback, accepted-answer/explanation post-submit boundaries, sanitized public payload, shared submission contract, runtime-id/prompt/answer/student/source-material guards, and no category text, prompt text, answer text, runtime ids, source-material metadata, or student identity, verify matching-pairs renders a left/right card board that records selected choices without exposing correct answers, verify the hidden localized 30-slice matching-pairs-board handoff covers template/surface, board state, left prompt card and right choice card counts, selected prompt state and validity, prompt selection toggle, choice target readiness, available/used/unused choice counts, exclusive choice and reassignment policy, answered/unanswered progress, disabled policy, review feedback, accepted-answer/explanation post-submit boundaries, sanitized public payload, shared submission contract, runtime-id/prompt/choice/answer/student/source-material guards, and no prompt text, choice text, answer text, runtime ids, source-material metadata, or student identity, submit answers, and verify scoring reflects the template-specific expected answers. |
| 5b | Fill-blank worksheet exposes a 30-slice handoff | Open a persisted fill-blank `/play/:shareId`, verify the visible runner renders worksheet-style inline blanks when a prompt contains `___`, `[blank]`, or `(blank)`, falls back to a standalone answer input when no blank marker exists, and shows word-bank text only as visible student support. Verify the hidden localized fill-blank-worksheet handoff exposes 30 stable semantic label/value/description outputs for template type, runner surface, worksheet state, runtime item count, inline blank count and coverage, standalone prompt count and fallback coverage, word-bank row count and coverage, answered and unanswered counts, answer-row scope, partial-submit boundary, completion progress, input placement policy, answer-input state, disabled policy, review feedback state and visibility policy, review item count, accepted-answer and explanation boundaries plus visibility policy, public payload boundary, shared submission contract, runtime-id boundary, prompt/word-bank boundary, and privacy guard. Verify it changes to locked when the runner is disabled, exposes review feedback only after submission and answer reveal, keeps teacher results unchanged, and does not expose prompt text, word-bank text, runtime item ids, student answers, student names, anonymous tokens, answer keys, explanations, ActivityContent JSON, or source-material metadata. |
| 5a | Open-box reveal cards expose a 30-slice handoff | Open a persisted open-box `/play/:shareId`, verify the visible runner shows selectable boxes, exactly one revealed prompt panel, previous/next navigation, and an answer input, then verify the hidden localized open-box-reveal-card handoff exposes 30 stable semantic label/value/description outputs for template type, runner surface, reveal-card state, box count, visible prompt count, active-box state and validity, selected/answered/unanswered box counts, completion progress, navigation state, previous/next/direct selection actions, answer-input state, disabled policy, review-feedback state, review item count, accepted-answer and explanation boundaries, prompt/item-id/answer/student/source-material guards, public payload boundary, shared submission contract, result review boundary, and privacy guard. Verify the handoff changes to locked when the runner is disabled, exposes review feedback only after submission and answer reveal, keeps teacher results unchanged, and does not expose prompt text, runtime item ids, student answers, student names, anonymous tokens, answer keys, explanations, ActivityContent JSON, or source-material metadata. |
| 6 | Teacher can review, filter, copy, export, and print assignment results | After at least one student attempt, open `/dashboard/assignments/:assignmentId`, verify completions, average accuracy, localized full student URL, labeled share path, copyable student link using the same displayed URL, localized metric descriptions and accessible metric labels explaining completions, accuracy, points, time, and close time, with each result metric card exposing stable label/value/description output relationships. Verify localized result action descriptions for the classroom brief, reteach plan, item review, student follow-up, and CSV export, and verify each result action also exposes a localized data-scope label and action-status label so copy actions are marked as current-review artifacts while CSV export is marked as full-assignment results, with disabled actions announcing their prepared blocked reason. Verify the classroom brief, the student summary table, the attempt table, reteach priorities, the full item performance table, per-item correct rates, answer explanations, accepted answer alternatives, and answer review details show scored student answers from the assignment snapshot. Verify the current review-status panel summarizes whether the teacher is waiting for attempts, reviewing the full class, using a focused scope, reviewing needs-review answers, or has no matches, with a localized next-step label and matched student, attempt, item, and answer-review counts from the same assignment-domain scope used by visible tables and copy artifacts, and with status and summary counts exposed through stable semantic outputs. Verify the current review-scope panel explains the active student search, student scan sort, item sort, answer-review filter, and matched student, attempt, item, and answer-review counts from the same assignment-domain scope used by visible tables and copy artifacts, with scope values, control status badges, and matched-count summaries exposed as stable semantic label/value/description items. Verify the student search, student sort, item-performance sort, and answer-review filter controls each expose localized Default or Adjusted status badges with accessible labels and hidden descriptions tied to the same control description so teachers can distinguish the baseline view from an adjusted review scope before copying materials. Verify the classroom brief lists its current coverage for reviewed attempts, follow-up students, focus items, and analyzed items, then shows assignment-level metrics, the lowest-performing submitted items, and students needing follow-up as stable semantic label/value/description groups without exposing raw anonymous tokens, and verify the hidden localized 30-slice student-follow-up-priority handoff covers priority source, input/eligible/selected student counts, selection limit, review-needed filter and sort, latest-accuracy and display-label tie-breakers, positive-review gate, classroom brief/reteach/follow-up summary scopes, student summary sort, copy-artifact order, latest-attempt/last-submitted/attempt-count/average/best/latest-accuracy/review-count contexts, recommendation policy, empty state, normalization rules, shared domain helper, result-view consumer, anonymous-token guard, and privacy guard without exposing student display labels, student keys, raw anonymous tokens, student answers, or teacher answer keys. Copy the brief and verify the copied text includes the same metrics, review focus, follow-up sections, and current copy-scope block, and that the visible copy-scope preview and per-preview copy-scope snapshot show the same matched-record summary through stable semantic outputs with accessible labels before copying. Open the printable worksheet action, verify `/print/assignments/:assignmentId` loads without public marketing navigation, renders the frozen assignment title, template, localized before-printing preparation summary for handout fields, student practice response plan, hidden-by-default answer-key access state, student-name, date, and score lines, delivery policy, instructions, share path, printable items, response hints, and choice banks, verify the hidden localized 30-slice printable worksheet handoff covers handout overview, preparation metric count, assignment field count, answer-key access and toggle boundary, printable item count, response modes, choice-bank item and choice counts, writing-area and answer-line counts, item response help, student/date/score fields, delivery policy, answer-key item/detail counts, result-return action, print action, print-route boundary, public-runner boundary, and privacy guard without exposing prompt text, choice text, answer-key text, or student response text, and does not show answers by default. Toggle the answer-key control, verify `answerKey=true` remains in the URL, the toolbar, header overview, preparation summary, handoff, and answer-key section switch to the teacher-only key included state, the teacher-only answer key shows expected answers, accepted alternatives, and explanations through stable answer-key access, item, and detail outputs, and an assignment with no printable answer-key items reports the no-answer-key-available state without rendering answers before returning to results. Sort item performance by snapshot order, lowest accuracy, submitted count, and item type, verifying each selected sort shows its teacher-facing explanation, non-default sorts keep `itemSort` in the URL, and the default clears it. Search by a student name or anonymous student label and verify the summary rows, attempt rows, and answer review cards filter together without exposing raw anonymous tokens, switch answer review between all submissions and needs-review submissions, verify each selected review filter explains the current answer-review scope, only attempts with at least one missed or unanswered item remain, and non-default review mode keeps `review=needs-review` in the URL, switch the student summary sort between needs-review, best score, name, and attempts, verify each selected student sort shows its classroom scan explanation and treats missed and unanswered items as follow-up needs, non-default sorts keep `sort` in the URL, and the default clears it, copy the item review summary and verify it includes prompts, item types, correct rates, expected answers, accepted answers, explanations, and the current copy-scope block, verify the student follow-up copy preview shows localized student count, students needing review, next-step, latest-attempt, attempt-time, and last-submitted coverage, then copy the student follow-up summary and verify it includes normalized student labels, latest/average/best accuracy, attempts, review counts that include unanswered items, the current copy-scope block, and latest-attempt details only from the current review scope, copy the reteach plan and verify it includes low-performing prompts plus student follow-up lines and the same current copy-scope block, verify the CSV export coverage panel shows localized full-export scope for attempts, students, student privacy, delivery fields, raw publish settings, answer rows, and columns as semantic labelled coverage items with accessible value labels independent of the current search or review filter, then download the CSV export and verify it still includes full assignment results with a formatted delivery-policy column, raw assignment delivery settings as dedicated `_raw` columns, student summary, attempt, expected-answer, accepted-answer, and item-level answer columns without exposing raw anonymous tokens. |
| 6a | Result materials expose a 30-slice handoff | After at least one attempt, open `/dashboard/assignments/:assignmentId` and verify the result-material handoff exposes a localized `assignment-result-material` result-page marker with a hidden `dl/dt/dd` structure, 30 stable semantic label/value/description outputs, and a stable `data-handoff-item` for each slice covering current review scope, matched records, copy actions, copy previews, CSV preparation, printable worksheet handoff, data-scope boundaries, snapshot source, normalized student labels, and privacy guards. Verify the handoff privacy contract does not expose copy artifact text, CSV data URLs, public runner content, raw anonymous tokens, student answer text, or teacher answer keys. |
| 6b | Result review scope exposes a 30-slice handoff | After at least one attempt, open `/dashboard/assignments/:assignmentId`, search by a student label, set student sort, item sort, and answer-review filter to non-default values, then verify the result-review handoff exposes a localized `assignment-result-review` result-page marker with a hidden `dl/dt/dd` structure, 30 stable semantic label/value/description outputs, and a stable `data-handoff-item` for each slice covering review status, next step, search state, control default/adjusted state, matched records, copy scope, copy actions, preview readiness, route state, current-review copy boundary, full-export boundary, and privacy guard. Verify the handoff follows the same assignment-domain search, sort, and review-filter rules as the visible tables and copy previews, keeps copy actions scoped to current review while CSV remains full-assignment results, and does not expose copy artifact text, CSV data URLs, raw anonymous tokens, student answer text, or teacher answer keys. |
| 6c | Result copy artifacts expose a 30-slice handoff | After at least one attempt, verify the copy-artifact handoff exposes a localized `assignment-copy-artifact` result-page marker with a hidden `dl/dt/dd` structure, 30 stable semantic label/value/description outputs, and a stable `data-handoff-item` for each slice covering classroom brief readiness, reteach plan readiness, item review readiness, student follow-up readiness, preview counts, normalized copy-line formatting, title normalization, appended copy-scope blocks, scope summaries, classroom metrics, brief coverage, reteach priority items/students, item-review answer coverage, follow-up coverage, latest-attempt details, last-submitted and duration context, priority ordering, current-review data scope, preview scope, and prompt/answer/privacy guards. Verify the handoff consumes the same assignment-domain copy artifact builders and preview helpers used by visible copy actions, while the handoff privacy contract does not expose artifact text, prompt text, expected or accepted answers, student answer text, student labels, raw anonymous tokens, or teacher notes. |
| 6d | Result review controls expose a 30-slice handoff | After at least one attempt, open `/dashboard/assignments/:assignmentId`, search by a student label or anonymous student label, set student sort, item sort, and answer-review filter to non-default values, then verify the hidden localized result-review-controls handoff exposes 30 stable semantic label/value/description outputs for route parser, route update helper, default elision, invalid-route guard, search normalization, resolved student-search state, student-search status and match count, student-sort option/status/default, item-sort option/status/default, answer-review filter/status/default, filtered students, filtered attempt rows, filtered answer reviews, sorted performance items, review-scope summary, copy-scope students/items/review, table consumer, review-card consumer, copy-artifact consumer, anonymous-label search, and privacy guard. Verify the handoff is generated from the same assignment-domain review scope used by visible tables, answer review cards, and copy artifacts, and does not expose raw route queries, student display labels, copy artifact text, raw anonymous tokens, student answers, or teacher answer keys. |
| 6e | Result item performance sort exposes a 30-slice handoff | After at least one attempt, open `/dashboard/assignments/:assignmentId`, switch item performance sort between snapshot order, lowest accuracy, most answered, and item type, then verify the hidden localized item-performance-sort handoff exposes 30 stable semantic label/value/description outputs for sort scope, selected sort, default sort, sort option count, the four supported order modes, route parser, default route elision, invalid-route guard, control status, control description, table row count, matched item count, copy-scope row count, stable-order/submitted-count/accuracy/type tie-breakers, zero-count and non-finite accuracy guards, table consumer, review-scope consumer, copy-artifact consumer, CSV export boundary, prompt-text guard, answer-key guard, student-answer guard, and privacy guard. Verify the visible table rows and copy-ready item review data use the same sorted item-performance array from assignment-domain helpers, while CSV remains a full-export boundary and the handoff does not expose prompt text, expected or accepted answers, explanations, student answer text, student labels, raw anonymous tokens, share slugs, copy artifact text, or CSV data URLs. |
| 6f | Result attempt stats expose a 30-slice handoff | After at least one completed and one unscored attempt, open `/dashboard/assignments/:assignmentId` and verify the hidden localized assignment-attempt-stats handoff exposes 30 stable semantic label/value/description outputs for stats scope, source attempt count, completed attempt count, scored-result filtering, average accuracy, average points, average duration, duration normalization and timer capping, stored-score source, earned-points fallback, percent/points/completion boundaries, empty-state averages, non-finite/negative/fractional guards, result metric, assignment-list summary, assignment-card, classroom-brief, copy-artifact, CSV-export, duration-display, settings timer, by-assignment grouping, normalization helper, student-data guard, and privacy guard. Verify the visible result metric cards, assignment list summaries, assignment cards, classroom brief, copy artifacts, and CSV export all consume shared assignment-domain stats views for completions, average accuracy, average points, and average duration, and verify the handoff does not expose student display labels, student names, raw anonymous tokens, prompt text, runtime item ids, expected or accepted answers, student answer text, share slugs, copy artifact text, or CSV data URLs. |
| 6g | Result student summary sort exposes a 30-slice handoff | After at least one attempt from multiple named and anonymous students, open `/dashboard/assignments/:assignmentId`, switch the student summary sort between needs review, best score, student name, attempts, and last submitted, then verify the hidden localized student-summary-sort handoff exposes 30 stable semantic label/value/description outputs for sort scope, selected sort, default sort, option count, the five supported order modes, route parser, default route elision, invalid-route guard, control status, control description, table row count, matched student count, copy-scope row count, follow-up-priority/best-score/attempt-count/last-submitted/display-label tie-breakers, missing-date and non-finite-count guards, table consumer, review-scope consumer, copy-artifact consumer, anonymous-label guard, student-answer guard, and privacy guard. Verify the visible student summary table rows and current-review copy data use the same sorted student array from assignment-domain helpers, while the handoff does not expose student display labels, student keys, raw anonymous tokens, student answer text, teacher answer keys, raw route queries, or copy artifact text. |
| 6h | Result attempt review cards expose a 30-slice handoff | After at least one completed attempt with correct, missed, and unanswered items, open `/dashboard/assignments/:assignmentId`, focus the answer-review section, and verify each rendered attempt review card includes a hidden localized attempt-review-card handoff with 30 stable semantic label/value/description outputs for card scope, student-display boundary, submitted time, score badge, summary metric count, submitted/correct/needs-review/unanswered counts, answer-card count, snapshot answer sequence, prompt labels, status labels, correct/review/unanswered status counts, student-answer/expected-answer/accepted-alternative/explanation line counts, unsubmitted-answer guard, shared answer-text/status/summary helpers, review-card and review-filter consumers, copy-scope and CSV-export boundaries, anonymous-token guard, and privacy guard. Verify the visible card still shows student, submitted time, score, answer rows, accepted alternatives, and explanations for teacher review, while the hidden handoff does not expose student labels, attempt ids, prompt text, student answers, accepted-answer text, teacher answers, raw anonymous tokens, copy artifact text, CSV data URLs, or share slugs. |
| 6i | Result CSV export preparation exposes a 30-slice handoff | After at least one completed attempt, open `/dashboard/assignments/:assignmentId`, find the CSV export coverage panel, and verify it exposes a localized `assignment-results-export-preparation` handoff with 30 stable semantic label/value/description outputs for full-assignment export scope, assignment context, activity snapshot, attempt and student counts, student privacy, delivery identity, answer reveal, item order, attempt limit, timer, close time, instructions, raw settings, result metrics, item performance, answer rows, expected answer, accepted alternatives, export filename, CSV data URL boundary, formula-injection guard, submitted-date format, duration normalization, empty answer rows, prompt/student-answer/correctness/explanation columns, and total columns. Verify each item has a stable `data-handoff-item`, uses the full-assignment export scope rather than the current review filter, and does not expose assignment title text, student instructions, prompt text, student answers, teacher answer text, raw anonymous tokens, CSV filenames, CSV data URLs, or copy artifact text. |
| 6j | Result empty states expose a 30-slice handoff | Open `/dashboard/assignments/:assignmentId` before submissions, with a student search that matches no rows, and with the answer-review filter set to needs-review when all shown answers are correct. Verify the hidden localized `assignment-result-empty-state` handoff exposes 30 stable `data-handoff-item` outputs for empty surface, empty reason, visible title, visible description, student-summary section, attempt-table section, answer-review section, total students, total attempts, total answer reviews, search state, search normalization, review filter, waiting next step, no-match next step, copy brief gate, reteach gate, item-review gate, follow-up gate, CSV export gate, review-status boundary, review-scope boundary, table boundary, copy-artifact boundary, CSV boundary, printable worksheet boundary, public-runner boundary, anonymous-token guard, student-answer guard, and teacher-answer guard. Verify waiting states point teachers back to sharing the student link, search no-match states point to clearing search without exposing the raw search text, needs-review no-match states point to all answers, copy gates remain current-review artifacts, CSV export remains full-assignment results, and the handoff does not expose student display labels, raw anonymous tokens, student answer text, public runtime content, or teacher answer keys. |
| 7 | Teacher can generate an AI draft before saving | Sign in, open `/create`, verify the AI source panel starts with a localized source-readiness status, character count, and safe-source explanation, replace the starter source notes with classroom text and verify the readiness changes from starter source to source ready, attach classroom source materials such as audio, worksheet, or spreadsheet files, verify the hidden localized 30-slice source-material-picker handoff covers owner scope, storage load gate, picker status, selected count, available count, visible available limit, attachment limit, limit gate, attached summary, attached and available items, selected state, attach action, disabled attach reasons, remove action, upload entry, loading/error/empty/signed-out states, material-kind/content-type/size metadata, ActivityContent.sourceMaterials reference, AI extraction readiness, student-payload guard, file-id guard, filename display boundary, storage-key guard, and privacy guard without exposing file bytes, file ids, storage keys, permission metadata, student payload file references, or raw private filenames, verify the source-readiness status explains that material sync is available before generation and the source-level `activity-ai-draft-source-controls` boundary aligns the textarea, sync action, generate action, source readiness, safety/material provenance, and prepared control IDs, verify the hidden localized 30-slice activity-ai-draft-boundary handoff exposes 30 stable semantic label/value/description output relationships covering source panel, generation gate, auth boundary, server function, input schema, item count, draft focus, template preservation, source sanitization, safe and omitted material provenance, file-byte and storage-key guards, provider/model selection, fallback path, JSON response boundary, local completion, CreateActivityInput contract, editor-review gate, not-persisted boundary, teacher-review requirement, editor application, save and publish boundaries, coverage summary, template readiness, quiz choice readiness, notice boundary, and privacy guard without exposing source text, draft text, prompts, choices, answers, teacher notes, file ids, storage keys, file bytes, omitted note payloads, or raw provider output, verify the attached-source-material summary also exposes the same localized sync action and can sync materials into the AI source notes, verify the hidden localized 30-slice source-extraction-assist handoff covers source-material count, extractable and reference-only counts, audio/worksheet/spreadsheet source counts, available capability count, draft/extraction/import paths, ActivityContent write targets for questions, pairs, groups, vocabulary, teacher notes, accepted answers, and template readiness, editor-review/draft/persistence/publish boundaries, owner scope, assignment-snapshot protection, file-byte, filename, file-id, storage-key, parallel-model, and privacy guards without exposing filenames, file ids, storage keys, file bytes, raw extraction output, activity text, accepted answers, or publishing without teacher action, verify the AI source panel shows localized attached-material AI readiness for audio listening drafts, worksheet extraction, and spreadsheet import without claiming extraction has already run, sync attached materials into the AI source notes, manually add unsafe or duplicate source-material lines such as storage keys, URLs, path segments, or repeated basenames, verify the AI source panel exposes localized safe-source and omitted-source counts as semantic label/value/description outputs before generation, verify the AI source panel and generated-summary provenance show only safe material kind and safe filename without file ids, storage keys, URLs, path segments, query tokens, permissions, or owner metadata, verify the generated-summary source-material safety section exposes localized safe-source and omitted-source counts as semantic label/value/description outputs without showing omitted note payloads, verify the generated-summary source-material AI readiness also shows audio listening draft, worksheet extraction, and spreadsheet import readiness inferred only from safe provenance and still describes extraction as future teacher-reviewed work, choose a template and item count, click generate draft, verify the deterministic fallback source-term plan exposes 30 safe source-planning slices for source sanitization, material-note detection/omission, phrase and word extraction, subject fallback, unique normalization, item target, source-term selection, fallback padding, output consumers, and privacy guards without exposing source text, file ids, storage keys, file names, or raw material notes, verify the activity-ai-draft-boundary handoff switches provider/model/fallback, editor application, coverage, readiness, quiz-choice, and notice slices from pending to the generated result while still reporting no persistence or publish action, verify the title/content fields are filled with reviewable activity content, verify the draft coverage summary shows the applied-to-editor state, next save/review step, a localized draft-trust panel for provider, model, teacher-review gate, safe-source count, and fallback/completion notice, structured review checklist items with status labels and teacher-facing explanations, question, pair, group, vocabulary, note, ready-template count, locked-template count, provider, model, any fallback notice, suggested remixes, per-template ready/locked status with missing-requirement counts, and quiz choice readiness showing explicit choices, locally completed distractors, or questions that still need teacher-approved distractors, save the activity, and verify it appears in `/dashboard/activities`. |
| 8 | Teacher can edit a saved activity | Sign in, open `/dashboard/activities`, choose a persisted activity, click edit, update the title/content/template fields, save, return to the library, and verify the updated activity metadata and compatible template counts persist after reload. Attach an uploaded audio or worksheet classroom material from the activity editor, save, verify the activity library card summarizes the attached source-material count and material type, reopen the edit page, and verify the compact source-material reference is still attached without exposing storage keys in the editor. Publish before editing and verify the existing student share link still uses its original assignment snapshot. |
| 9 | Teacher sees template remix readiness | Sign in, create one activity with questions, pairs, and groups and another with only questions, verify `/create` shows the same deterministic ready and locked template families before save, open `/dashboard/activities`, verify the complete activity shows ready remix badges for all compatible templates, verify the question-only activity names missing match pairs or groups for locked templates, and verify the current template is visually distinct from suggested remix targets. |
| 10 | Teacher can close and reopen assignment links | Sign in, publish an assignment, open `/dashboard/assignments`, close the assignment link, open `/play/:shareId` and verify the student runner is unavailable, shows a localized closed-link state with link status, hidden activity content, blocked submissions, private browser identity, and contact-teacher next step, renders the unavailable-link safety panel covering hidden runtime content, hidden answers and explanations, private browser identity, hidden source materials, and blocked submissions, and does not expose runtime items, answer keys, answer explanations, source materials, browser labels, or raw anonymous tokens. Reopen the assignment from the dashboard, open `/play/:shareId` again, and verify the runner loads without exposing correct answers before submission. Verify direct status updates cannot close an already closed link, reopen an already open link, or publish a draft assignment without going through the publish-and-snapshot flow. |
| 11 | Assignment close-after time blocks late submissions | Sign in, publish an assignment with a future close-after time, verify the assignment list and results page show the close time, then exercise an expired fixture or time-controlled test case to verify `/play/:shareId` shows a localized expired-link state with link status, hidden activity content, blocked submissions, private browser identity, and contact-teacher next step, renders the unavailable-link safety panel as labelled `dl`/`output` scope and safety relationships covering hidden runtime content, hidden answers and explanations, private browser identity, hidden source materials, and blocked submissions, verify the public-assignment-unavailable-access 30-slice domain contract remains covered by source-level semantic tests while the unavailable public DOM does not render `data-handoff="public-assignment-unavailable-access"` or `data-handoff="public-assignment-access"` audit markers, verify the visible missing-link state and unavailable safety panel still connect unavailable access status, reason, share-link boundary, missing route state, student message, missing-page scope items, unavailable safety panel and item count, runtime/answer/explanation/material/identity/submission policies, policy-only payload, shared lifecycle helper, submission error, direct-submit guard, teacher-list/result-page alignment, result retention, reopen guidance, noindex route policy, and privacy guard without exposing the actual share slug, assignment title, runtime prompt or choice text, runtime item ids, answer keys, explanations, browser labels, raw anonymous tokens, student answer text, or teacher materials, does not expose runtime items, answer explanations, source materials, browser labels, or raw anonymous tokens, direct submission returns an expired-assignment error, and direct status update cannot reopen the expired assignment. |
| 12 | Answer explanations survive authoring, submission, and review | Create or edit a question activity with `prompt | answer | choices | explanation`, publish it with answer reveal enabled, open the public student link and verify the sanitized runtime payload and UI do not expose the explanation before submission, submit an attempt, verify the student review shows the explanation only after submission, and verify the teacher results page shows the same explanation from the assignment snapshot. |
| 13 | Teacher can copy an activity into a ready template | Sign in, create an activity whose content satisfies multiple template requirements, open `/dashboard/activities`, click a ready `Copy as ...` remix action, verify a new draft activity opens with the target template selected, verify the remixed draft title includes the target template short name without exceeding the activity title limit even from a long source title, and verify the original activity and any existing assignments remain unchanged. |
| 14 | Answer matching accepts teacher-defined alternatives | Create a fill-blank or listening activity whose answer field contains alternatives separated by `/` or `;`, publish it, submit an answer with different casing or punctuation, and verify scoring treats the accepted alternative as correct while preserving the original review answer and showing the accepted alternatives only after submission. Verify quiz, fill-blank, listening, line-match, matching-pairs, group-sort, and open-box student review feedback all use the shared correct/needs-review presentation so the student's submitted answer, accepted alternatives, and explanations appear whenever answer reveal is enabled, with the feedback exposed as a localized semantic region, status label/value/description relationship, and labelled detail output relationships rather than template-specific text fragments. Verify the teacher results page, copied item review summary, and CSV export also show the accepted alternatives from the assignment snapshot. |
| 15 | Time-limited assignments show attempt duration | Publish an assignment with a short time limit, verify `/dashboard/assignments` and `/dashboard/assignments/:assignmentId` show the shared settings summary with timer, attempt limit, close time, identity mode, answer reveal, item order, and instructions, open `/play/:shareId`, verify the countdown starts after the playable assignment loads, verify the timer badge has a localized accessible label and description from the same timer state used by the visible countdown, submit an attempt, verify the score panel exposes elapsed time as a localized labelled output with a normalization description, verify direct submissions store duration as whole non-negative seconds capped to the timer, and verify the result page average-time metric, per-attempt duration cells, assignment-list summary stats, and CSV average/duration seconds all use the same normalized duration contract. |
| 16 | Quiz choices are completed from lesson content | Create or edit a quiz activity with question answers but sparse or missing choices plus vocabulary terms, verify the editor template-readiness panel shows which questions already have explicit choices, which are completed locally from sibling answers or vocabulary, and which still need more candidates before publishing. Verify the same panel exposes a localized 30-slice quiz-choice generation handoff with stable semantic label/value/description output relationships for generation scope, target count, question readiness counts, explicit/local/missing choice counts, sibling/vocabulary candidate counts, candidate source count, answer coverage, missing answers, shared `ActivityQuestionOption[]` write target, deterministic-now/AI-later mode, teacher-review boundary, save-before-publish boundary, completed choice count, explicit answer coverage, local candidate question count, candidate deduplication, candidate normalization, stable choice order, runtime choice source, answer inclusion guard, empty-content guard, and privacy guard before future AI distractor generation is connected, without exposing question prompts, option text, answer text, vocabulary text, raw AI output, or stable ordering seeds. Publish it, open `/play/:shareId`, and verify the quiz renders deterministic multiple-choice options without exposing which option is correct before submission. |
| 17 | Homepage and template routes enter ClassGamify product loops | Open `/`, verify the hero preview and primary actions point to templates or activity creation rather than legacy Hanzi, HSK, worksheet, or skeleton-only routes, verify the 30-slice home-product-loop page-view/domain contract covers product loop, homepage surface, hero create/templates/worksheet routes, canonical create/templates/worksheets routes, starter preview source/activity/assignment/submit boundary, feature section and four classroom features, signal panel and template/delivery/result signals, ActivityContent model, AssignmentSnapshot boundary, student runner, result review, worksheet extension, AI draft, legacy entrypoint guard, indexing scope, and privacy guard while the public homepage DOM does not render internal handoff markers, audit text, or pageView.handoffView output, without creating assignment links, mutating teacher data, exposing answer keys, student attempt records, raw anonymous tokens, source-material storage keys, or teacher-private activity content, then follow the primary CTA and verify the activity creation page loads. Open `/templates`, verify the template cards describe real classroom modes and content requirements, click a template-specific start action, and verify `/create?template=...&source=templates` loads with that primary template selected, the matching template scaffold already filling the structured fields, and the create page's localized template-entry summary showing the template-directory source, loaded example, playable item count, reusable mode count, and next save/review step. Open `/worksheets`, verify it is a Liveworksheets-style entry page for fill-blank, line-match, listening, and group-sort modes rather than a legacy reset page, click the worksheet-mode actions, and verify they route to `/create?template=fill-blank&source=worksheets`, `/create?template=line-match&source=worksheets`, `/create?template=listening&source=worksheets`, or `/create?template=group-sort&source=worksheets` with the matching scaffold selected and a localized worksheet-entry source explanation. Verify the 30-slice public-template-entry page-view/domain contract covers template and worksheet entry surfaces, routes, template counts, worksheet mode counts, scaffold loading, shared editor contract, workflow, assignment snapshot, results export, printable extension, indexing, and privacy guard while the `/templates` and `/worksheets` public DOM does not render internal handoff markers, audit text, or pageView.handoffView output. Open `/learn`, `/hsk/1`, and a `/hanzi/:character` URL, verify retired legacy learning routes are not mounted as copied lesson UI, remain excluded from active navigation and sitemap targets, and are no longer preserved as legacy product crawler rules in `robots.txt` while active ClassGamify product routes continue to load. Verify sitemap URLs, localized alternates, robots disallow rules, and manifest metadata derive from the shared public product-route registry so active ClassGamify entry points stay indexed while teacher dashboard, student runner, print, and retired legacy paths stay out of public indexing. Open `/roadmap` and `/dashboard`, verify they describe the current usable create-publish-play-results loop rather than stale skeleton-only milestones, verify the roadmap lists teacher-reviewed AI drafts as an available capability instead of a backlog item, verify every roadmap item exposes a localized status badge, teacher-value label, teacher-value text, what-improves-next label, and classroom-direction next step from prepared page-view data rather than internal classroom-evidence or task-board wording, verify the authenticated dashboard top metrics come from the teacher's real activity and assignment summaries while starter/demo content remains only a preview, verify activity and assignment metrics can resolve independently when one query is still loading, verify the dashboard loop-status panel recommends the next teacher action for empty library, publish-needed, distribution, collecting-attempts, and review-ready states with localized status labels and real route targets, and verify every dashboard readiness row includes localized next-step guidance derived from the teacher's real activity, open-link, submitted-attempt, and result-review state. |
| 17a | Dashboard overview exposes a 30-slice owner-loop handoff | Sign in and open `/dashboard`, then verify the dashboard loop handoff exposes 30 stable semantic label/value/description outputs for owner activity scope, owner assignment scope, starter-preview boundary, independent activity/assignment loading state, top metrics, loop status, next actions, readiness rows, action cards, preview source, route targets, loading independence, and privacy guard. Verify the dashboard domain exposes a `teacher-dashboard-query-boundary` with separate activity/assignment resolved states, both-ready, both-loading, activity-loading, and assignment-loading branches, and owner counts derived only from resolved owner summaries. Verify starter preview activity and assignment text are not counted as owner metrics and the handoff does not expose student answers, raw anonymous tokens, private activity content, source-material storage keys, or attempt details. |
| 18 | Legal pages describe ClassGamify data surfaces | Open `/terms`, `/privacy`, and `/cookie` for `en` and `zh`, verify the pages mention ClassGamify classroom activities, frozen assignment snapshots or assignment links, student attempts, anonymous browser tokens or local runner state where relevant, teacher result summaries or CSV exports where relevant, and AI drafts or source materials where relevant. Verify configured AI-provider examples stay scoped to teacher-reviewed activity drafts, template remixing, distractors, listening scripts, worksheet extraction, and source-material provenance, and do not mention copied Lang Study, getlangstudy, HSK, Hanzi, AI demo product surfaces, unused `fal.ai` image-generation providers, or generic image-generation features. |
| 19 | Blog and release notes describe ClassGamify | Open `/blog`, each visible `/blog/:slug`, and the generated sitemap, verify public post slugs and cards reference ClassGamify templates, assignment links, AI authoring, teacher results, safe source-material provenance, public runner rule summaries, frozen assignment snapshots, CSV exports, or copied teacher review artifacts as appropriate. Verify old HSK, Hanzi, getlangstudy, copied starter, and handwriting editorial URLs or topics are absent. |
| 20 | Attempt limits use normalized student identity | Publish an assignment with student names and a max-attempt limit, submit as `Alice`, then try again as ` alice ` or `ALICE` and verify the limit still applies. Publish another assignment with the max-attempt field cleared, submit more than the default cap from the same normalized student identity, and verify the runner, attempt usage message, teacher settings summary, and CSV export continue to show additional attempts allowed. Publish an anonymous assignment, verify the student runner explains that the current browser is the anonymous identity and shows a short anonymous browser label, submit from two browser contexts, and verify the two browser tokens are summarized as separate anonymous students in teacher results without exposing raw tokens. |
| 21 | Teacher can duplicate an activity safely | Sign in, create a saved activity, click `Duplicate` in `/dashboard/activities`, verify a draft copy opens with the same structured content and `Copy of ...` title, edit the copy, and verify the original activity and its published assignments remain unchanged. |
| 22 | Teacher can search, filter, and page the activity library | Sign in, create enough saved activities to exceed one library page with distinct titles, descriptions, template types, active and archived visibility, and attached classroom source materials such as audio, spreadsheet, worksheet document, worksheet image, and reference-only video/file references, open `/dashboard/activities`, verify overview cards summarize the full current status-filtered result for matching activities, template-family coverage, activities ready to remix, and source materials ready for extraction rather than only the visible page, verify each overview card exposes a localized description and accessible label for the metric value with a stable label/value/description output relationship, verify the source-extraction overview explains how many matching activities have extractable material, verify the source-material filter explains the selected material type and shows prepared audio-ready, worksheet-ready, and spreadsheet-ready capability count labels from the filtered result, verify the activity-status control explains the selected status and shows prepared active/archived matching count labels from the same owner-scoped search/template/source filters without mixing in starter activities or other teachers' rows, verify the current-view panel summarizes visible activity range, current page, selected lifecycle status, exact template-family scope, source-material scope, and active search scope from the same filtered result with stable semantic scope items, verify the activity-library view model exposes an `owner-activity-library-source-scope` boundary that separates full filtered activity count, overview activity count, and visible page activity count while preserving the normalized search, lifecycle status, template, and source-material filters, verify the hidden localized 30-slice activity-library handoff exposes a stable `activity-library` marker with `data-handoff-item` outputs and covers owner scope, overview totals, current-view scope, source capability counts, active/archived status counts, filter summary, visible rows, publish/duplicate/remix ready and blocked counts, archive/restore ready counts, source-material and extraction-ready visible card counts, pagination, starter-preview boundary, private-content guard, derivative-draft guard, file-id guard, filename guard, visible-page separation guard, owner-scoped source-filter guard, and storage-key guard, verify activity cards expose prepared card, detail, content-count, source-material, compatibility, and action-region labels while card stats, readiness summaries, and the localized 30-slice deterministic template-remix safety handoff render as stable semantic label/value/description items covering current and ready template counts, suggested Copy as actions, locked diagnostics, owner scope, source status, lifecycle gate, ready-target-only target gating, current-template exclusion, visible action limit, draft output, title strategy and limit, template switch, content-clone counts, source-material count/kind/privacy, assignment-snapshot protection, original-activity protection, and privacy guard without exposing prompts, answers, choices, teacher notes, source summaries, filenames, file ids, or storage keys, verify the hidden localized 30-slice AI remix assist handoff covers source template, target template, target readiness, missing requirement count/list, deterministic remix path, AI completion path, editor review gate, draft output, persistence and publish boundaries, lifecycle gate, owner scope, prompt source, source-material provenance, file-byte guard, storage-key guard, content coverage counts, ready and locked target counts, review checklist, title strategy, template switch, assignment-snapshot protection, original-activity protection, and privacy guard without exposing prompts, answers, teacher notes, filenames, file ids, storage keys, source text, raw AI output, or publishing without teacher action, verify activity cards show localized source-material readiness states for no materials, reference-only materials, and extraction-ready material counts alongside source-material count, material type badges, extraction readiness hints, and localized next-step guidance for audio listening draft input, spreadsheet structured import input, or worksheet extraction input without exposing file ids, storage keys, paths, URLs, permissions, owner metadata, or private file identifiers, verify the result range and next/previous controls, move to page 2 and verify the URL keeps `page`, search by a title keyword and verify the list resets to page 1 with `q`, search by a description or template keyword, verify matching cards and overview cards update, filter by an exact template family such as quiz or group sort and verify the URL keeps `template`, filter by source material such as any extractable source, audio, spreadsheet, or worksheet and verify the URL keeps `source`, verify the overview extraction count, source-filter explanation, status counts, capability counts, current-view panel, cards, pagination, empty state, and clear-filters action all reflect the source-material filtered result, combine source filtering with search, template, or archived status, clear filters, and verify the full library returns. |
| 23 | Teacher can filter and page the assignment list | Sign in, publish enough assignments to exceed one list page with distinct titles, statuses, and attempts, open `/dashboard/assignments`, verify overview cards summarize the full current filter result for matching assignments, open links, completions, and attempt accuracy rather than only the visible page, verify the open-link, completion, average, and matching-assignment cards expose localized descriptions and accessible labels for the metric value with stable label/value/description output relationships, verify the status filter explains the selected status with localized copy and shows prepared open, closed, expired, and draft count labels from the filtered result, verify the current-view panel summarizes visible assignment range, current page, selected lifecycle status, and active search scope from the same filtered result with stable semantic scope items, verify the hidden localized 30-slice assignment-list handoff exposes a stable `assignment-list` marker with `data-handoff-item` outputs and covers owner scope, overview totals, current-view scope, status counts, filter summary, visible rows, visible open/closed/expired/draft link counts, copy-ready and copy-blocked counts, preview-ready count, printable-card count, result-page-ready count, submitted-result evidence count, pagination, published-share context, copy/preview/review distribution steps, starter-preview boundary, internal-id guard, public-runtime-content guard, result-export-row guard, raw-token guard, source-storage-key guard, student-answer guard, and teacher-answer guard, verify assignment cards expose prepared card, settings-summary, result-stats, distribution-step, and action-region labels while card stats and distribution steps render as stable semantic label/value/description items, verify the result range and next/previous controls, move to page 2 and verify the URL keeps `page`, search by assignment title, source activity text, or share id and verify the list resets to page 1 with `q`, filter by published, expired, closed, or draft status, verify overview counts, status-filter explanation, status counts, current-view panel, and cards update for the filtered result, clear filters, and verify the full assignment list returns. |
| 24 | Teacher can archive and restore activities | Sign in, create a saved activity, publish an assignment from it, archive the activity from `/dashboard/activities`, verify it disappears from the active library but the existing assignment and student link still use the frozen snapshot, switch to the archived activity view, verify the status count moves from active to archived under the same search/template/source filters, verify the archived card still exposes prepared card, compatibility, action-region, and restore-required labels, verify activity card actions expose localized action-status labels, verify the compatibility panel exposes the prepared remix action status, verify it still shows its ready and locked template-mode summary while explaining that publishing, duplicating, and template remixing require restore first and does not show those derivative actions, verify any attempted publish-dialog open for the archived activity is blocked by the prepared publish-access status and cannot submit, restore the activity, and verify it returns to the active library as a draft with available publish, duplicate, archive, and ready remix action statuses. |
| 25 | Contact classroom inquiry uses ClassGamify language | Open `/contact?subject=classroom` for `en` and `zh`, verify the classroom form fields, default message, and inquiry-scope panel ask about learners, class or grade, activity material, assignment routine, template or worksheet needs, and result-review needs. Verify the scope panel also warns teachers to send safe classroom context rather than storage keys, private file URLs, raw student identifiers, or unnecessary personal data. Verify the classroom fields remain separate structured inquiry data for the contact API and email template instead of being folded into a free-text message, verify the contact email subject and template describe ClassGamify classroom/product inquiries, and verify the page and developer-facing mail/env examples do not show copied HSK, Hanzi, Lang Study, getlangstudy, GitHub Actions deploy ownership, fal.ai, or Chinese-level/language-scope wording. |
| 26 | Billing settings use ClassGamify plan language | Sign in, open `/settings/billing` for `en` and `zh`, verify the page-level workspace billing boundary describes plan access, activity libraries/source-material workflows, assignment rules, result exports, and AI drafting before the current-plan card. Verify the current-plan card describes ClassGamify plans, activity access, classroom routines, saved activity sets, assignment workflow limits, AI drafts, source-material workflows, result exports, hosted billing status, included classroom access, upgrade-path or plan-limit items, and the localized next step for free, paid, lifetime, or no-plan states, and verify it does not mention copied Lang Study, HSK, Hanzi, Chinese-character, or saved-character-list plan copy. Open the hosted payment status return page states where possible and verify the payment page title/description plus processing, success, failed, and timeout copy point back to teacher workspace access with a localized next-step section rather than generic SaaS checkout language. |
| 27 | Core classroom controls expose accessible descriptions | Sign in and walk `/create`, `/dashboard/activities`, `/dashboard/assignments`, `/dashboard/assignments/:assignmentId`, `/play/:shareId`, and `/print/assignments/:assignmentId`; verify the hidden localized 30-slice classroom-control-semantics handoff covers AI source textarea, safe-source note, source readiness, material safety, source capabilities, synced provenance, draft focus, generate action, draft summary, activity source filter, assignment status filter, publish title, instructions, attempt limit, timer, close time, delivery toggles, publish preview, result student search, student sort, item sort, answer-review filter, review scope, copy scope, CSV coverage, printable answer-key toggle, print action, student identity input, submit button, and privacy guard without exposing prompts, answers, student names, raw anonymous tokens, CSV data URLs, assignment title text, or private activity content, verify the AI source textarea is described by the safe-source note, source-readiness state, attached-material safety context, source-capability summary, and synced material-note region, verify the AI draft focus and generate controls stay associated with their prepared help text and source-readiness state, verify the AI draft summary exposes a localized save handoff with stable semantic label/value/description output relationships for provider, model, generation notice, teacher-review gate, review-gate status, action/review/ready counts, ready/locked template counts, suggested remix count, content coverage counts, quiz-choice readiness, safe/omitted source counts, and save boundary before the teacher saves the activity, and verify activity source/status filters, assignment status filters, result student search, result student sort, item-performance sort, answer-review filter, current review-scope panel, result metric cards, classroom-brief coverage and stat groups, copy-scope previews, CSV export coverage panel, publish-setting inputs and toggles, printable answer-key toggle, student identity input, and submit button are associated with their prepared help text, descriptions, scope summaries, or submit hints through semantic grouping, labelled regions, or `aria-describedby` while continuing to use localized runtime copy. |
| 28 | Transactional emails describe teacher workspace boundaries | Render or capture verify-email, forgot-password, subscribe-newsletter, and contact-message emails in a fake mail provider or email preview environment. Verify subjects and bodies describe the ClassGamify teacher workspace, saved activities, source materials, assignment links, student attempts, result records, teacher-reviewed AI drafts, worksheet workflows, and classroom update scope where relevant. Verify every transactional template renders the shared localized workspace-boundary panel for activities/templates, assignment links, student attempts/results, and AI drafts/source materials. Verify the transactional-mail handoff exposes a localized 30-slice preflight contract for template set, verify-email, forgot-password, newsletter, contact-message, localized subjects, HTML language, locale fallback, HTML/plain-text rendering, render-before-send, shared layout, provider registry boundary, boundary panel, activity scope, assignment scope, attempt/result scope, AI draft scope, source-material safety, no file-byte reads, worksheet workflow scope, structured classroom contact fields, action-link placement, no activity mutation, no assignment-link mutation, no attempt mutation, no result export, no learner notification, provider-secret guard, legacy-copy guard, and private-data guard. Verify the handoff privacy contract does not expose recipient names, recipient emails, action URLs, contact message text, raw errors, raw student identifiers, source-material storage keys, provider API tokens, file bytes, learner notifications, product mutations, or result exports. Verify the templates use localized message keys rather than hardcoded copy and do not use generic SaaS, copied starter, Lang Study, HSK, Hanzi, or Website Contact wording. |
| 29 | Notification settings use classroom update boundaries | With newsletter settings enabled, sign in and open `/settings/notifications` for `en` and `zh`; verify the page-level classroom update boundary describes template updates, worksheet workflows, assignment review, and teacher control before the newsletter card. Verify the localized 30-slice classroom update handoff covers update scope, template updates, worksheet workflows, assignment review, teacher control, newsletter card, subscription form, subscription switch, email requirement, pending state, subscribe action, unsubscribe action, error feedback, scope note, provider visibility, email channel, subscription status source, update frequency, activity library boundary, activity content boundary, assignment snapshot boundary, attempt record boundary, result export boundary, source-material read boundary, mutation payload guard, student-reminder boundary, public-link boundary, learner-notification boundary, private-data guard, and legacy-copy guard. Verify the newsletter card still uses localized ClassGamify update copy and does not imply student assignment reminders, public link behavior changes, learner notifications, source-material reads, activity or assignment mutations, attempt/result changes, raw mutation payloads, raw private data exposure, or generic SaaS announcements. |

## 6. Student Runner Smoke

**File:** `specs/student-runner.spec.ts` | **Priority:** P1

Verifies the public student runner can be opened and interacted with from a
stable starter link before release.

| # | Test name | Flow |
|---|---|---|
| 1 | Starter play link stays interactive while read-only | Open `/play/demo-food`, verify the starter assignment heading and progress badge render, answer two visible quiz choices, verify progress advances, verify the submit button stays disabled because starter preview assignments are read-only, verify the read-only hint is visible and associated with the submit control, and assert no browser errors. |

## Deferred Coverage

These flows should be added after their dependencies are made deterministic:

| Area | Reason |
|---|---|
| Payment checkout and portal | Requires Stripe or Creem test fixtures, webhook simulation, and provider-specific env. |
| R2 file uploads | Real browser-to-R2 upload E2E still requires deterministic local storage assertions and small fixture files. The script-level storage upload readiness gate already covers the 20-slice upload contract: validation, filename/folder sanitization, content-type/extension normalization and safety, owner/public folder planning, R2 key planning, same-origin proxy URLs, privacy guards, and provider helper reuse. The storage file access boundary gate covers same-origin proxy key validation, owner checks, missing-object behavior, cache headers, attachment filenames, and `nosniff`. The activity source-material reference boundary gate covers compact `ActivityContent.sourceMaterials` references, safe file ids, safe filename basenames, duplicate collapse, storage-key omission, and student-payload privacy; future E2E should add audio, worksheet image, document, spreadsheet, and unknown-material fixtures so browser upload/download behavior, activity attachment, and material labels are verified together. |
| Transactional email | Requires a fake mail provider or captured verification links. |
| Interactive template runners | Requires deterministic runner fixtures and attempt submission assertions. |
| AI provider quality checks | Requires provider mocks or stable fake responses to avoid cost and flake. |
