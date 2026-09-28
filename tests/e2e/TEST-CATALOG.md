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
attempt identity contracts, attempt metrics, duration formatting,
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
Public SEO and content gates also include
`pnpm exec tsx --test scripts/blog-locale-indexing.test.ts`,
`pnpm exec tsx --test scripts/static-locale-indexing.test.ts`,
`pnpm exec tsx --test scripts/legacy-public-redirects.test.ts`, and
`pnpm exec tsx --test scripts/markdown-ssr.test.ts`; run the matching gate
when changing blog translation coverage, static route locale eligibility,
historical public redirects, or Markdown rendering.
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
constants, or editor view helper visibility.
Public DOM handoff boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/public-dom-boundary.test.ts`; run it when
changing marketing, editorial, legal, contact, auth, root document, or shared
public layout route sources and shared public components that must keep internal
`data-handoff` audit DOM out of public pages while preserving source-level
handoff contracts.
Public discovery/indexing chain has a fast script-level gate via
`pnpm exec tsx --test scripts/public-discovery-indexing-chain.test.ts`;
run it when changing public metadata, public entry
routes, navigation, template/worksheet entries, public page copy,
sitemap/robots/manifest helpers, legacy route retirement, public DOM
boundaries, or privacy/indexing guards.
Classroom trust communication chain has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-trust-communication-chain.test.ts`;
run it when changing the 30-slice transactional mail workspace boundary, public
classroom contact intake, auth workspace entry, transactional mail lifecycle,
teacher notification settings, hosted billing, legal/provider copy, developer
configuration secrets, storage source-material boundaries, or public DOM
handoff boundaries.
Account governance lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/account-governance-lifecycle-chain.test.ts`;
run it when changing auth session and email verification, profile and security
settings, the security workspace summary, explicit account
deletion, admin user governance,
billing/payment callback/notification/files boundaries, storage owner checks,
provider-secret and student-data guards, or account lifecycle copy that should
stay tied to the ClassGamify teacher workspace.
Classroom product loop chain has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-product-loop-chain.test.ts`;
run it when changing the Activity -> Assignment -> Attempt -> Results contract,
assignment source activity context boundary, classroom data lifecycle and its
attempt persistence boundary,
activity library page boundary,
activity authoring/library workflow, source
extraction lifecycle, activity lifecycle governance, template roadmap
capability alignment, AI
enhancement lifecycle review, published assignment delivery, assignment publish
preflight boundary, assignment lifecycle governance boundary, assignment
distribution lifecycle boundary, public assignment rules boundary, student
runner play and its submit controls handoff boundary,
student identity lifecycle, student runtime identity boundary, assignment
submission validation boundary, assignment attempt persistence boundary, scored
attempt results, assignment attempt stats boundary, answer feedback lifecycle
and its answer feedback boundary,
assignment attempt duration
boundary, submitted-date continuity, accepted-answer continuity, explanation
continuity, teacher result review,
teacher result copy lifecycle and its copy artifact handoff boundary,
worksheet-mode delivery boundary,
printable worksheet review lifecycle, copy/export/print handoffs,
teacher workspace operations and its dashboard overview boundary, public
discovery and indexing alignment with its public metadata boundary, or
privacy guards.
Local persisted browser journey chain has a fast script-level gate via
`pnpm exec tsx --test scripts/local-persisted-browser-journey-chain.test.ts`;
run it when changing the local saved activity -> published assignment ->
student attempt -> result filters -> classroom brief -> CSV -> printable
worksheet -> answer key -> return-to-results journey, the persisted browser
spec that exercises it, or the result-material, result-review, copy-artifact,
CSV export, printable worksheet, browser-health, and private-data boundaries
that keep this real classroom loop connected.
Assignment publish-to-results continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-publish-results-continuity.test.ts`;
run it when changing the 30-stage source-level contract for delivery settings,
snapshot freezing, share-link distribution, sanitized runner play, submission
guards, attempt persistence, teacher result analysis, exports, or privacy.
Active surface product boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/active-surface-product-boundary.test.ts`; run it
when changing active account governance, contact, billing/payment callback,
mail, notification, or developer configuration sources that should speak in
current ClassGamify terms rather than copied learning-site, starter, or unused
provider copy.
Public product entry gates include
`pnpm exec tsx --test scripts/home-product-loop.test.ts`,
`pnpm exec tsx --test scripts/public-navigation.test.ts`,
`pnpm exec tsx --test scripts/public-template-entry.test.ts`,
`pnpm exec tsx --test scripts/teachers-public-page.test.ts`,
`pnpm exec tsx --test scripts/roadmap-public-page.test.ts`,
and
`pnpm exec tsx --test scripts/public-pricing-plan-boundary.test.ts`;
run the matching gate when changing homepage loops, navigation, template or
worksheet entry routes, teacher-facing public copy, roadmap status wording, or
pricing plan boundaries.
Public content, policy, and communication gates include
`pnpm exec tsx --test scripts/public-editorial-content.test.ts`,
`pnpm exec tsx --test scripts/legal-policy-view.test.ts`,
`pnpm exec tsx --test scripts/contact-classroom-intake.test.ts`,
`pnpm exec tsx --test scripts/auth-workspace-boundary.test.ts`,
`pnpm exec tsx --test scripts/mail-transactional-workspace.test.ts`,
and
`pnpm exec tsx --test scripts/developer-configuration.test.ts`;
run the matching gate when changing editorial, legal, contact, auth,
transactional mail, or developer-facing product-boundary copy.
Activity foundation gates include
`pnpm exec tsx --test scripts/activity-library-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/activity-template-scaffold-quality.test.ts`,
and
`pnpm exec tsx --test scripts/activity-ai-fallback.test.ts`;
run the matching gate when changing owner-scoped library summaries, reusable
template scaffold quality, or deterministic local AI fallback draft semantics.
Activity authoring-to-publish continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/activity-authoring-publish-continuity.test.ts`;
run it when changing the 30-stage source-level contract for template entry,
editor persistence, owner-scoped library filters, atomic lifecycle mutations,
guarded duplicate/remix drafts, assignment publishing, snapshot isolation, or
workflow privacy.
AI review-to-publish continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/activity-ai-review-publish-continuity.test.ts`;
run it when changing the 30-stage source-level contract for sanitized source,
draft generation, deterministic fallback, editor-only application, teacher
review, manual save, explicit publish, snapshot protection, or AI privacy.
Assignment shared-boundary gates include
`pnpm exec tsx --test scripts/assignment-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/assignment-delivery-policy.test.ts`,
`pnpm exec tsx --test scripts/assignment-identity.test.ts`,
`pnpm exec tsx --test scripts/assignment-answer-feedback.test.ts`,
`pnpm exec tsx --test scripts/public-assignment-access.test.ts`,
and
`pnpm exec tsx --test scripts/public-assignment-unavailable-access.test.ts`;
run the matching gate when changing shared assignment view models, delivery
policy propagation, identity normalization, answer feedback, public assignment
access, or unavailable-link boundaries.
Assignment attempt identity continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-attempt-identity-continuity.test.ts`;
run it when changing the source guards for name normalization,
anonymous browser tokens, assignment-scoped storage, submission identity,
attempt-limit counting, persistence, teacher result grouping and ordering, or
raw identity privacy guards.
Answer feedback lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/answer-feedback-lifecycle-chain.test.ts`;
run it when changing the answer feedback boundary,
accepted-answer parsing, answer normalization, runtime scoring, public
post-submit feedback, template feedback surfaces, teacher result analysis,
result answer text views, CSV answer columns, server review summaries, or
feedback privacy guards.
Published assignment delivery chain has a fast script-level gate via
`pnpm exec tsx --test scripts/published-assignment-delivery-chain.test.ts`;
run it when changing publish preflight, the 30-slice publish control handoff
boundary, frozen snapshots, share links, assignment list distribution, public
student rules, lifecycle access,
validated submissions, attempt persistence, timer duration policy, answer
feedback, result stats, or results export handoffs.
Assignment publish source writes have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-publish-source-write-guard-contract.test.ts`;
run it when changing owner-scoped activity lookup, archive/restore publish
gates, assignment and snapshot transactions, assignment insert triggers,
source-owner invariants, trigger error mapping, active visibility acceptance,
existing snapshot continuity, or publish-source privacy.
Assignment publish source continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-publish-source-continuity.test.ts`;
run it when changing the source guards for owner-scoped source
reads, restore-before-publish checks, assignment/snapshot transactions, D1 owner
and archive triggers, rollback, localized source errors, published delivery,
existing snapshots and results, or publish-source privacy.
Activity mutation concurrency has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-mutation-concurrency-contract.test.ts`;
run it when changing activity edit, archive, or restore writes, lifecycle gate
revisions, monotonic timestamps, compare-and-set predicates, zero-row conflict
recovery, direct returned activity rows, snapshot retention, or activity mutation
privacy.
Activity mutation continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/activity-mutation-continuity.test.ts`;
run it when changing the source guards for edit/archive/restore
owner scope, monotonic revisions, visibility compare-and-set predicates,
returning updates, conflict reloads, derivative and publish gates, assignment
snapshot retention, or activity mutation privacy.
Activity derivative source writes have a fast script-level gate via
`pnpm exec tsx --test scripts/activity-derivative-source-write-guard-contract.test.ts`;
run it when changing duplicate/remix source reads, derivative provenance,
activity insert triggers, owner/archive/revision guards, derivative error
mapping, active-source acceptance, independent-draft continuity, or derivative
source privacy.
Activity derivative source continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/activity-derivative-source-continuity.test.ts`;
run it when changing the source guards for duplicate/remix
source reads, provenance pairs, D1 owner/archive/revision triggers, safe error
mapping, independent derivative drafts, later source changes, future publishing,
or provenance privacy.
Activity source-material writes have a fast script-level gate via
`pnpm exec tsx --test scripts/activity-source-material-write-contract.test.ts`;
run it when changing create/edit material persistence, owner-scoped user-file
queries, authoritative metadata rebuilding, missing-reference handling, empty
reference bypass, source-material order/count rules, or storage/file privacy.
Activity source-material write continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/activity-source-material-write-continuity.test.ts`;
run it when changing the source guards for normalized material
references, owner-scoped batch reads, compact metadata selects, authoritative
rebuilds, all-or-nothing create/edit writes, downstream derivative/publish paths,
snapshot protection, or storage privacy.
Source-material deletion has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-source-material-delete-contract.test.ts`;
run it when changing file deletion, activity/snapshot JSON reference queries,
active or archived material retention, R2 delete ordering, in-use errors,
owner-scoped reference checks, or delete-path privacy.
Source-material deletion continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/source-material-delete-continuity.test.ts`;
run it when changing the source guards for owner-scoped file
lookup, active/archived activity references, frozen snapshot references,
parallel checks, metadata claim and R2 ordering, retained provenance, minimal
evidence, or deletion privacy.
Source-material write/delete races have a fast script-level gate via
`pnpm exec tsx --test scripts/source-material-integrity-guard-contract.test.ts`;
run it when changing activity or snapshot source-material writes, file metadata
deletion order, D1 integrity triggers, R2 delete recovery, nested trigger-error
mapping, or concurrent reference safety.
Source-material integrity continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/source-material-integrity-continuity.test.ts`;
run it when changing the source guards for activity/snapshot
write triggers, file metadata delete triggers, guarded metadata claims, R2
presence probes, metadata restoration, localized conflicts, single-writer
ordering, safe recovery failures, or integrity privacy.
Private file upload persistence has a fast script-level gate via
`pnpm exec tsx --test scripts/user-file-upload-persistence-contract.test.ts`;
run it when changing private R2 uploads, `user_files` metadata insertion,
ambiguous-commit probes, post-upload compensation, object-presence probes,
bounded cleanup retries, public-folder bypass, localized cleanup errors, or
upload-path privacy.
Ambiguous R2 upload writes have a fast script-level gate via
`pnpm exec tsx --test scripts/r2-upload-put-recovery-contract.test.ts`; run it
when changing R2 `put`, custom upload metadata, exact-key `head` recovery,
file-id/size/content-type evidence, original-error rethrows, no-second-put
behavior, provider metadata construction, or upload-recovery privacy.
Teacher file responses have a fast script-level gate via
`pnpm exec tsx --test scripts/user-file-response-boundary-contract.test.ts`;
run it when changing full file lists, private upload responses, public avatar
responses, safe file item fields, ID-based file links, server-side R2 key
resolution, settings table types, owner access decisions, or response privacy.
Private upload transaction continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/private-upload-transaction-continuity.test.ts`;
run it when changing the 30-stage source-level contract for single R2 writes,
same-key evidence recovery, D1 metadata commit probes, bounded compensation,
safe private file items, server-side object-key resolution, source-reference
continuity, or upload transaction privacy.
Source-material lifecycle continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/source-material-lifecycle-continuity.test.ts`;
run it when changing the 30-stage source-level contract from private upload and
compact references through guarded activity writes, assignment snapshot
freezing, protected deletion, R2 recovery, or lifecycle privacy.
Assignment lifecycle governance chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-lifecycle-governance-chain.test.ts`;
run it when changing open/closed/expired/draft status resolution,
close/reopen transition rules, expired reopen blocking, assignment list status
filters, share-link availability, public unavailable payloads, submit API
lifecycle gates, result retention, snapshot retention, the 30-slice public
unavailable-access boundary for lifecycle reasons, hidden runtime and answers,
blocked submissions, retained results, reopen guidance, indexing, and privacy,
or other lifecycle privacy guards.
Assignment lifecycle transition concurrency has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-status-transition-concurrency-contract.test.ts`;
run it when changing close/reopen server functions, owner-scoped status writes,
expected lifecycle revisions, same-millisecond transitions, reopen close-window
checks, compare-and-set updates, zero-row conflict recovery, returned lifecycle
rows, snapshot/result retention, or lifecycle transition privacy.
Assignment status transition continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-status-transition-continuity.test.ts`;
run it when changing the source guards for owner-scoped reads,
monotonic revisions, close/reopen compare-and-set predicates, single-statement
returning updates, conflict reloads, public access, snapshot and attempt
retention, teacher results, or transition privacy.
Classroom data lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-data-lifecycle-chain.test.ts`;
run it when changing the attempt persistence boundary, D1 app
schema, activity/assignment persistence helpers, owner-scoped activity or
assignment queries, assignment snapshot freezing, public assignment payload
sanitization, attempt persistence, scored-attempt queries, result
analysis/export/print consumers, or source-material/token privacy guards.
Classroom query index contract has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-query-index-contract.test.ts`; run it
when changing D1 activity, assignment, attempt, source-material, or payment
owner filters, lifecycle filters, identity lookups, stable ordering, named
indexes, or generated migrations for the 30-path classroom read contract.
Classroom query execution contract has a fast script-level gate via
`pnpm exec tsx --test scripts/classroom-query-execution-contract.test.ts`; run
it when changing activity, assignment, file, or material-picker list reads,
their `Promise.all` barriers, conditional published/created context reads,
dependent page-attempt statistics, owner scope, pagination, summaries, or the
30-stage read-only execution contract.
Workspace governance and utility gates include
`pnpm exec tsx --test scripts/admin-users-handoff-semantic-views.test.ts`,
`pnpm exec tsx --test scripts/billing-semantic-views.test.ts`, and
`pnpm exec tsx --test scripts/tabler-icons-proxy.test.ts`; run the matching
gate when changing admin user governance, billing workspace behavior, or the
icon proxy used by classroom controls.
Assignment attempt limits have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-limit.test.ts`;
run it when changing max-attempt parsing, per-student attempt counters,
retry availability, public rule summaries, result usage labels, delivery
summaries, CSV/export delivery-policy fields, attempt-limit privacy-scope
boundaries, or no-public-audit DOM boundaries.
Assignment attempt limit continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-attempt-limit-continuity.test.ts`;
run it when changing the source guards for normalized identity,
previous attempt counting, idempotent replay, concurrent identity slots, D1
uniqueness, server limit enforcement, student retry state, public rules,
teacher result policy, exports, or private slot-metadata guards.
Assignment submission validation has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-submission-validation.test.ts`;
run it when changing frozen runtime validation, partial-submission payloads,
runtime id normalization, unknown/duplicate/too-many rejection, API answer
limits, safe failure mapping, teacher-result/public-payload boundaries,
submission-validation privacy-scope boundaries, or no-public-audit DOM
boundaries.
Assignment submission validation continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-submission-validation-continuity.test.ts`;
run it when changing the source guards for frozen runtime ids,
partial payloads, shared answer limits, Unicode normalization, invalid-id
rejection, validate-before-scoring order, scored persistence, safe public
failures, teacher results, or private-content guards.
Assignment submission idempotency has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-submission-idempotency-contract.test.ts`;
run it when changing browser submission-key generation or reset behavior,
network retry recovery, normalized identity matching, attempt inserts,
assignment-scoped uniqueness, generated migrations, public retry responses,
attempt limits, lifecycle gates, teacher results, or submission-key privacy.
Assignment submission idempotency continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-submission-idempotency-continuity.test.ts`;
run it when changing the source guards for browser key
creation, retry reuse, replay-first recovery, new-attempt lifecycle and limit
gates, concurrent D1 uniqueness recovery, sanitized feedback, teacher result
continuity, or submission-key privacy.
Assignment attempt-limit concurrency has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-limit-concurrency-contract.test.ts`;
run it when changing normalized identity counting, limited-attempt slot
allocation, concurrent submission retries, attempt inserts, identity-slot
uniqueness, generated migrations, unlimited-attempt behavior, limit errors,
teacher result continuity, or private slot metadata.
Assignment submission lifecycle writes have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-submission-lifecycle-write-guard-contract.test.ts`;
run it when changing assignment close/reopen behavior, close-time enforcement,
attempt inserts, D1 triggers, write-error mapping, submission replay priority,
identity-slot conflict classification, bounded recounts, lifecycle messages,
teacher result continuity, or private database markers.
Assignment submission lifecycle continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-submission-lifecycle-continuity.test.ts`;
run it when changing the source guards for replay-first
handling, API lifecycle/validation/scoring order, D1 status and expiry triggers,
database-clock checks, localized write errors, slot conflict isolation, teacher
results, or internal write-boundary privacy.
Assignment attempt duration has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-duration.test.ts`;
run it when changing timer start plans, submission duration normalization,
student timer badges, result duration labels, result average duration, or CSV
duration fields.
Assignment attempt duration continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-attempt-duration-continuity.test.ts`;
run it when changing the source guards for playable runner
readiness, clock start or tick plans, browser elapsed time, server normalization,
timer caps, scored persistence, student/teacher duration displays, aggregate
statistics, CSV duration fields, or duration-only privacy guards.
Assignment item ordering has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-item-order.test.ts`;
run it when changing shuffle helper logic, share-slug normalization, public
payload ordering, student submit/review ordering, printable worksheet ordering,
delivery summaries, publish previews, public rule summaries, or CSV/export
delivery-policy fields.
Student and teacher control accessibility contracts have a fast script-level
gate via `pnpm exec tsx --test scripts/control-accessibility-contracts.test.ts`;
run it when changing aria-describedby wiring on the runner name field, submit
button, public rule chips, teacher filters, publish fields, or result review
controls, or before adding any hidden section to the root layout or the
student play surface. Visible runner behavior (start screen, rule chips,
identity, submit confirmation, template boards) is covered end to end in
`tests/e2e/specs/student-runner.spec.ts` and
`tests/e2e/specs/interactive-template-runners.spec.ts`.
Student runner submission chain has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-submission-chain.test.ts`;
run it when changing progress, payload summary, submit-readiness, identity
privacy, timer, attempt duration, result panel, review summary, feedback scope,
next steps, privacy guards, or the source-level student-runner-submission
chain.
Student identity lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/student-identity-lifecycle-chain.test.ts`;
run it when changing student-name normalization, anonymous browser tokens,
identity grouping, runtime item id normalization, attempt-limit
identity counting, student runner identity views, submission input identity,
attempt persistence identity fields, teacher
result identity labels/search/sort/review, result export privacy, or raw-token
guards.
Assignment results CSV export has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-results-csv-export.test.ts`;
run it when changing source-activity context columns, delivery-policy columns,
accepted-answer columns, submitted-date formatting, timer-aware duration
normalization, formula-injection guards, or CSV data URL boundaries.
Assignment result submitted-date continuity chain has a fast script-level gate
via
`pnpm exec tsx --test scripts/assignment-result-submitted-date-chain.test.ts`;
run it when changing result date formatting, attempt submitted labels, student
last-submitted labels, latest-attempt copy context, completed-at sorting, CSV
submitted-date columns, or submitted-date privacy guards.
Assignment result accepted-answer continuity chain has a fast script-level gate
via
`pnpm exec tsx --test scripts/assignment-result-accepted-answer-chain.test.ts`;
run it when changing the accepted-answer parser, primary-vs-alternatives
formatting, result cards, item performance columns, attempt review cards, CSV
accepted-answer columns, printable review alignment, or accepted-answer privacy
guards.
Assignment result explanation continuity chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-result-explanation-chain.test.ts`;
run it when changing result explanations, post-submit review visibility,
student feedback explanations, item review copy notes, CSV explanation columns,
printable answer-key explanations, or explanation privacy guards.
Assignment source-activity context chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-source-activity-context-chain.test.ts`;
run it when changing source-activity snapshot resolution, assignment-list
search, public student payloads, result headers, CSV source columns, printable
worksheet fields, source-context chain alignment, the 30-slice result-material
boundary for teacher copy, CSV preparation, print, current/full data scope,
snapshot source, and privacy, or other source-context privacy guards.
Assignment attempt stats has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-stats.test.ts`;
run it when changing completions, average accuracy, average points, average
duration, timer caps, result metric cards, assignment list summaries,
assignment cards, classroom briefs, copy artifacts, or CSV exports.
Assignment attempt stats continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-attempt-stats-continuity.test.ts`;
run it when changing the source guards for completed scored
attempts, timer or score normalization, assignment list/card summaries,
teacher result metrics, classroom briefs, copy artifacts, CSV export, or
aggregate-only privacy guards.
Legacy public route retirement has a fast script-level gate via
`pnpm exec tsx --test scripts/legacy-public-routes.test.ts`;
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
Dashboard overview owner loop has a fast script-level gate via
`pnpm exec tsx --test scripts/dashboard-overview.test.ts`;
run it when changing owner-scoped activity/assignment summaries,
starter-preview boundaries, independent loading states, top metrics, loop
status, next actions, or route targets.
Teacher workspace operations chain has a fast script-level gate via
`pnpm exec tsx --test scripts/teacher-workspace-operations-chain.test.ts`;
run it when changing the dashboard overview, dashboard owner
summaries, activity library filters/summaries/actions, assignment list
filters/distribution, account governance, teacher settings
security/files/billing/payment callback/notification boundaries, or the active
surface product boundary.
Settings security workspace boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-security-workspace.test.ts`;
run it when changing workspace security summary, credential-login gate,
password fields, password update action, password reset boundary, connected
provider boundary, account deletion gate, delete confirmation dialog, activity
and source-material protections, assignment link and snapshot protections,
student result protection, or raw auth/provider error guards.
Settings billing workspace has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-billing-workspace.test.ts`;
run it when changing plan access, current-plan card semantics, activity library
access, assignment workflow access, AI draft access, result export access,
source-material access, hosted checkout, customer portal, or payment callback.
Settings payment callback has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-payment-callback.test.ts`;
run it when changing hosted checkout confirmation, session-id privacy, polling
interval or timeout, server completion checks, current-plan cache refresh, safe
callback normalization, billing return, pricing retry, timeout recovery,
classroom access boundaries, provider-secret guards, or raw-session guards.
Settings notification updates have a fast script-level gate via
`pnpm exec tsx --test scripts/settings-notification-update.test.ts`;
run it when changing teacher-controlled product updates, template updates,
worksheet workflows, assignment review updates, newsletter subscription
controls, provider visibility, student-reminder boundaries, public-link
boundaries, learner-notification boundaries, or private-data guards.
Settings files source-material library has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-files-source-material.test.ts`;
run it when changing source-material library, activity attachments, AI draft
provenance, student payload privacy, full-library summaries, owner-scoped user
files, or the storage-key guard.
Referenced file delete feedback has a focused regression gate via
`pnpm exec tsx --test scripts/settings-files-delete-feedback.regression-1.test.ts`;
run it when changing Files delete mutations, referenced-material deletion
guards, or localized delete success and failure feedback.
Settings files material classification has a fast script-level gate via
`pnpm exec tsx --test scripts/settings-files-material-classification.test.ts`;
run it when changing content-type normalization, extension fallback,
audio/worksheet/spreadsheet/video/file detection, ActivityContent.sourceMaterials
references, AI draft provenance, student-payload guard,
file-byte/storage-key/filename/permission guards, or the full-library summary.
Activity source-material reference boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-source-material-reference-boundary.test.ts`;
run it when changing compact ActivityContent.sourceMaterials references,
user-file-to-activity reference mapping, selected-material normalization, safe
file id rules, safe filename basenames, content-type normalization,
material-kind fallback, size normalization, duplicate collapse, reference
limits, compact JSON shape, storage-key omission, or student-payload privacy.
Source-material privacy chain has a fast script-level gate via
`pnpm exec tsx --test scripts/source-material-privacy-chain.test.ts`;
run it when changing storage upload/access, ActivityContent.sourceMaterials
references, the 30-slice compact material reference handoff boundary, settings
files, source-material picker, AI draft source notes,
extraction readiness, public assignment payloads, or student runtime
source-material metadata guards.
Assignment result review helpers have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-result-review-helpers.test.ts`;
run it when changing result-page route state, student search normalization,
review status, matched review-scope counts, or result sorting.
Assignment result review controls has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-result-review-controls.test.ts`;
run it when changing result-page route parsing, default elision, or
invalid-route guards for student search, sorting, and answer-review filters.
Teacher results review chain has a fast script-level gate via
`pnpm exec tsx --test scripts/teacher-results-review-chain.test.ts`;
run it when changing owner-scoped result routes, frozen snapshots, attempt
stats, review controls, result review controls boundary, student search/sort
rules, item performance sorting,
copy artifacts, CSV exports, result-material privacy, empty-result guidance,
anonymous-token guards, or source-material guards.
Teacher result copy lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/teacher-result-copy-lifecycle-chain.test.ts`;
run it when changing classroom brief builders, reteach plan builders, item-review summaries, student follow-up
summaries, copy preview metadata, current-review copy data, the full-assignment
CSV boundary, action execution, or copy-artifact privacy guards.
Assignment attempt review card chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-review-card-chain.test.ts`;
run it when changing scored result persistence, answer review summaries, answer
text/status helpers, review filters, copy scope, CSV export, printable review
alignment, privacy guards, or the source-level attempt review card chain.
Assignment student follow-up priority has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-student-follow-up-priority.test.ts`;
run it when changing needs-review follow-up sorting, latest-accuracy or
display-label tie-breakers, classroom brief follow-up limits, reteach-plan
student lines, student follow-up summaries, copy-artifact ordering,
or anonymous-token guards.
Public indexing and install metadata have a fast source-level gate via
`pnpm exec tsx --test scripts/public-metadata.test.ts`;
run it when changing the public route registry, sitemap helpers, robots rules,
web app manifest metadata, manifest GET/HEAD route headers, retired legacy
path inventory, or public/private install entry boundaries.
Activity library overview and source-scope boundaries have a fast script-level
gate via
`pnpm exec tsx --test scripts/activity-library-page.test.ts`;
run it when changing activity library overview metrics, current-view scope,
source-material filters, starter-preview boundaries, or visible-card counts.
Activity library filter state has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-library-filter-state.test.ts`;
run it when changing activity library URL validation,
default route elision, search normalization, page reset, page preservation,
dashboard controls, list API owner scope, source-material post-filter behavior,
or privacy guards.
Activity library filter-state chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-library-filter-state-chain.test.ts`;
run it when changing URL validateSearch, NFKC search normalization,
status/template/source filters, page reset, created-activity context,
dashboard controls, list API owner scope, source-material post-filtering,
activity source-material summary-chain alignment, or activity-library filter
privacy guards.
Activity source-material summary chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-source-material-summary-chain.test.ts`;
run it when changing the card summary surface, attached count,
material-kind badges, extraction readiness, edit-return path, activity library
consumers, source extraction lifecycle alignment, AI-safe provenance,
source-material privacy guards, or student payload boundaries behind activity
card source-material summaries.
Activity editor workflow has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-editor-workflow.test.ts`;
run it when changing page layout, workflow navigation, form sections, AI draft
boundaries, source-material safety, readiness review, save gating,
CreateActivityInput contracts, template-readiness contracts, or publish
boundaries.
Activity lifecycle archive and restore boundaries have a fast script-level gate
via `pnpm exec tsx --test scripts/activity-lifecycle.test.ts`;
run it when changing owner-scoped archive and restore actions, active and
archived library visibility, edit/publish/duplicate/remix gates,
restore-before-derive policy, assignment snapshot protection, public assignment
continuity, or server archive/restore/derivative guards.
Activity lifecycle governance chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-lifecycle-governance-chain.test.ts`;
run it when changing owner-scoped archive and restore, edit, publish,
duplicate, and remix gates, server lifecycle enforcement, content and
source-material retention, assignment snapshot protection, public assignment
continuity, lifecycle mutation cache refresh, created-panel publish access, the
30-slice assignment publish boundary that returns restored activities to shared
publish access, validation, delivery settings, review, snapshot freeze, public
payload, result policy, and privacy contracts, or archive/restore privacy guards.
Assignment list filter and distribution boundaries have a fast script-level gate
via `pnpm exec tsx --test scripts/assignment-list-semantic-views.test.ts`; run
it when changing assignment list overview metrics, status/search filters,
published share context, visible-card counts, or the owner filter scope
boundary.
Assignment list filter state has a focused fast gate via
`pnpm exec tsx --test scripts/assignment-list-filter-state.test.ts`;
run it when changing assignment list URL validation, published context
normalization or preservation, search normalization, page reset, dashboard
controls, list API owner scope, search where clauses, status filters, full
filtered-result summaries, or privacy guards.
Assignment list filter-state chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-list-filter-state-chain.test.ts`;
run it when changing assignment list URL validateSearch, published context,
search normalization, lifecycle status filters, page reset, dashboard controls,
list API owner scope, full filtered summary, privacy guards, or the
source-level filter-state chain contract.
Assignment distribution lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-distribution-lifecycle-chain.test.ts`;
run it when changing post-publish route context, owner-scoped published lookup,
absolute student URLs, frozen source activity context,
copy/preview/print/results actions, assignment-list distribution steps,
visible share actions, the student-runner start screen, or
published-panel privacy guards.
Assignment lifecycle boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-lifecycle-status-actions.test.ts`;
run it when changing open/closed/expired/draft status resolution, close/reopen
actions, public-route access, submission gates, result retention,
or close-window policy.
Assignment share-link distribution boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-share-link.test.ts`;
run it when changing share-slug normalization, `/play/:shareId` path encoding,
absolute share URLs, copy/preview disabled gates, publish-success/list/result
surfaces, or share-link privacy guards.
AI source panel control boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-source-semantic-views.test.ts`; run it
when changing AI source textarea descriptions, source-readiness, safe/omitted
material provenance, attached-material capability summaries, sync-material
controls, or generate-button gating.
Transactional mail lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/transactional-mail-lifecycle-chain.test.ts`;
run it when changing the transactional template set, locale fallback,
HTML/plain-text rendering, shared workspace boundary, auth reset/verification,
newsletter confirmation, contact classroom inquiry, provider registry, mail
disabled/provider-secret guards, no-mutation guarantees, or mail privacy guards.
Activity AI authoring chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-authoring-chain.test.ts`;
run it when changing AI source safety, authenticated draft generation,
deterministic fallback, CreateActivityInput mapping, draft coverage,
template readiness, quiz-choice readiness, AI remix assist, editor review,
source-material privacy guards, or save/publish boundaries. The chain also
carries the 30-slice fallback draft lifecycle for missing credentials, invalid
provider JSON, sanitized term planning, complete classroom fields, editor
application, teacher review, persistence boundaries, provider secrets, and
privacy while its independent source file gate remains intact.
Activity AI fallback draft chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-fallback-draft-chain.test.ts`;
run it when changing missing Workers AI credentials, invalid provider JSON,
deterministic local draft generation, source-term planning, fallback padding,
CreateActivityInput mapping, teacher review, editor application,
save/publish boundaries, provider-secret guards, or fallback privacy guards.
The chain also carries the 30-slice authoring/library lifecycle for shared
create and edit contracts, persistence, teacher-owned library management,
readiness, lifecycle gates, publish access, snapshot protection, and privacy
while its independent source file gate remains intact.
Activity AI enhancement roadmap chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-roadmap-chain.test.ts`;
run it when changing template transforms, AI remix completion, distractor write
targets, leveled variants, answer explanations, listening scripts,
worksheet/audio/spreadsheet extraction, provider and fallback gates,
source-material privacy, editor-review/save/publish boundaries, snapshot
protection, public-payload guards, or result-export continuity. The roadmap
chain also carries the full 30-slice enhancement lifecycle across policy,
execution, parsed output, editor application, teacher review, manual save,
publish, snapshots, public payloads, privacy, and result exports while its
independent source file gate remains intact.
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
readiness, provider-call boundaries, fallback stability, auth gates, the
30-slice policy handoff, or privacy guards.
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
continuity, fallback/provider application modes, the 30-slice draft-output
handoff, or privacy guards.
Activity AI enhancement editor review has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-editor-review.test.ts`;
run it when changing teacher review checklists, reviewed/missing check counts,
manual-save readiness, editor-only boundaries, publish blocking, snapshot
protection, public-payload guards, source-material privacy, the 30-slice
draft-application handoff, or privacy guards.
Activity AI enhancement save boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-save-boundary.test.ts`;
run it when changing teacher save actions, create/edit save plans, activity-id
gates, manual persistence boundaries, activity-record targets, publish
blocking, snapshot protection, result continuity, source-material privacy, the
30-slice editor-review handoff, or privacy guards.
Activity AI enhancement publish boundary has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-publish-boundary.test.ts`;
run it when changing saved activity records, teacher publish actions,
assignment publish preflight, share-link creation boundaries, snapshot
freezing, public-payload guards, result continuity, source-material privacy, the
30-slice manual-save handoff, or privacy guards.
Activity AI enhancement lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-enhancement-lifecycle-chain.test.ts`;
run it when changing policy-to-publish ordering, draft output handoffs, editor
application, teacher review, manual save, saved activity records, assignment
publish actions, share-link/snapshot boundaries, public payload/privacy guards,
or result-export continuity.
Template roadmap capability chain has a fast script-level gate via
`pnpm exec tsx --test scripts/template-roadmap-capability-chain.test.ts`;
run it when changing roadmap template promises, Wordwall-style templates,
Liveworksheets-style modes, shared editor scaffolds, AI enhancements, source
extraction readiness, worksheet delivery, print follow-up, result export
continuity, or template capability privacy guards. The chain also carries the
30-slice authoring/library handoff for shared create and edit contracts,
persistence, owner-scoped library management, readiness, derivative drafts,
lifecycle gates, publish access, snapshot protection, and privacy while its
independent source file gate remains intact.
Activity authoring/library chain has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-authoring-library-chain.test.ts`;
run it when changing public template and worksheet entries, shared editor save,
the editor workflow, edit hydration, owner-scoped
library management, derivative drafts, lifecycle gates, publish snapshot
boundaries, or the end-to-end activity creation to library workflow contract.
Source extraction lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/source-extraction-lifecycle-chain.test.ts`;
run it when changing compact source-material references, material-kind
classification, extraction readiness action maps, audio/worksheet/spreadsheet
readiness, source summaries, AI source provenance, ActivityContent write
targets, editor-review/persistence/publish boundaries, assignment snapshot
protection, public payload privacy, or the 30-slice authoring/library boundary
that returns extraction output to shared create/edit, teacher save,
owner-scoped library, lifecycle, publish access, and snapshot contracts while
the independent 30-file source gate remains intact.
Assignment publish control boundaries have fast script-level gates via
`pnpm exec tsx --test scripts/assignment-publish-dialog.test.ts`
and `pnpm exec tsx --test scripts/control-accessibility-contracts.test.ts`;
run them when changing publish-setting input IDs, help text associations,
delivery toggles, frozen-link preview regions, delivery-rule stats, review
checklists, validation alerts, assignment publish privacy-scope boundaries, or
opaque control scope handling.
AI fallback source-term planning has a fast script-level gate via
`pnpm exec tsx --test scripts/activity-ai-fallback-source-term-plan.test.ts`;
run it when changing deterministic fallback source extraction, material-note
omission, source-term padding, or the fallback draft term consumers.
Attempt persistence boundaries have a fast script-level gate via
`pnpm exec tsx --test scripts/assignment-attempt-persistence.test.ts`;
run it when changing submit-attempt persistence, scored-attempt inserts,
answer/result JSON cloning, identity fields, score/maxScore mapping,
duration persistence, result-analysis consumers, stats consumers, or CSV export
consumers.
Attempt persistence continuity has a focused source-chain gate via
`pnpm exec tsx --test scripts/assignment-attempt-persistence-continuity.test.ts`;
run it when changing the source guards for submission gates,
scored-attempt row construction, identity/time fields, immutable answer/result
JSON, sanitized feedback, teacher analysis, statistics, CSV export, or private
persistence guards.
Scored attempt result lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/scored-attempt-result-chain.test.ts`;
run it when changing the post-submit scored-result boundary, sanitized public
feedback, attempt stats, teacher result review, the 30-slice attempt review card
handoff boundary, copy artifacts, CSV export, printable review return links,
duration display, accepted-answer formatting, or scored-result privacy guards.
Quiz choice generation has a fast script-level gate via
`pnpm exec tsx --test scripts/question-choice-generation.test.ts`;
run it when changing deterministic distractor generation, question option
normalization, editor quiz-choice readiness, runtime quiz choices, validation
of `ActivityQuestion.options`, future AI distractor write targets, or
quiz-choice generation privacy-scope boundaries.
Printable worksheet view has a fast script-level gate via
`pnpm exec tsx --test scripts/printable-worksheet-view.test.ts`;
run it when changing print-route search parsing, worksheet response policies,
frozen snapshot worksheet generation, source activity description fields,
delivery-policy printing, answer-key toggle behavior, privacy-scope boundaries,
accepted-answer/explanation rendering, or the print toolbar.
Printable worksheet review lifecycle chain has a fast script-level gate via
`pnpm exec tsx --test scripts/printable-worksheet-review-lifecycle-chain.test.ts`;
run it when changing result-page print actions, teacher-only print routes,
frozen snapshot handouts, answer-key hidden/included/unavailable states, source
activity description fields, toolbar toggles, print actions,
return-to-results links, printable handoff privacy, worksheet delivery chain
alignment, the 30-slice printable worksheet handoff boundary for handout
overview, response planning, delivery context, answer-key access, print
controls, route boundaries, and privacy, or CSV export alignment.
Worksheet-mode delivery chain has a fast script-level gate via
`pnpm exec tsx --test scripts/worksheet-mode-delivery-chain.test.ts`;
run it when changing `/worksheets` creation entry points, shared create editor
scaffolds, assignment snapshots, worksheet-style student runtimes, printable
handouts and their 30-slice printable worksheet handoff boundary, result
exports, worksheet extraction boundaries, or source-material
and student-identity privacy guards.
Student runner play chain has a fast script-level gate via
`pnpm exec tsx --test scripts/student-runner-play-chain.test.ts`;
run it when changing the visible submit controls, public
payload access, public rule summary, runner loading or start readiness, identity
and anonymous-token policy, attempt limits, timers/duration, template renderers,
progress counts, partial-submit controls, submission validation, attempt
persistence, or answer feedback.

## Test Harness

- Config: `playwright.config.ts`
- Specs: `tests/e2e/specs/`
- Fixtures: `tests/e2e/fixtures/`
- Test-only API: `src/routes/api/e2e/users.ts`

Fast infrastructure gates: `scripts/e2e-user-cleanup-contract.test.ts` keeps
dependent classroom records ahead of file and user cleanup, while
`scripts/e2e-runtime-safety-contract.test.ts` keeps server-function CSRF
protection and the local-only E2E mail bypass explicit.

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
| 1 | Public pages render successfully | Open `/`, `/templates`, `/create`, `/worksheets`, `/play/demo-food`, `/pricing`, `/teachers`, `/contact`, `/contact?subject=classroom`, `/roadmap`, `/blog`, `/cookie`, `/privacy`, `/terms`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, and `/auth/error?error=state_mismatch&error_description=raw-provider-text` for `en` and `zh`, in `dark` and `light` mode. Verify each returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. On `/contact?subject=classroom`, verify the public contact DOM keeps the useful classroom scope panel and structured fields but does not render internal intake handoff markup, imply that a contact form creates activities, assignment links, learner notifications, file reads, or public student records. On auth pages, verify the localized teacher workspace boundary explains account access, activity library, assignment links, student results, and source-material ownership before users sign in or reset access without rendering internal auth handoff markup in the public DOM. On the auth error page, verify the localized recovery panel explains the workspace sign-in issue, teacher sign-in retry, email-link check, protected workspace data, and does not render raw `error_description` text. With a banned-account fixture, verify the blocked teacher-workspace message is localized and does not fall back to Better Auth or starter-template English. |
| 1a | Home hero is a playable question | Open `/` at desktop and mobile widths and verify the hero preview region shows the real student quiz runner with the starter activity (one question, colored answer tiles, question dots) above the fold; picking an answer marks it selected and updates the answered count without submitting anything. |
| 2 | Home login modal opens | Open `/`, click the navbar login button, verify the login dialog and credential inputs are visible, and assert no browser errors. |
| 3 | Health check responds with pong | Call `/api/ping` and verify `{ "message": "pong" }`. |
| 4 | Classroom example is visible before scrolling | At desktop and narrow mobile viewports, open `/` and verify the real starter activity preview begins within the first viewport, the sample-play link opens the public student demo, and the template/delivery/result summary follows the preview. Open `/templates` and verify each template shows a distinct starter example without replacing its template-specific create action. In English, the quiz and matching-pairs cards also link to their dedicated classroom game guides. |

The guest `/create` flow should explain above the editor that work entered before
sign-in is not restored after login, with direct register and sign-in actions.
Legacy crawl paths `/(pages)/about`, `/(pages)/contact/contact`, the literal
`/blog/$slug`, and `/blog/%24slug` should redirect to `/about`, `/contact`,
and `/blog` respectively instead of serving 404 pages.
| 5 | English classroom game guides lead to real templates | Open `/classroom-quiz-game` and `/classroom-matching-game` in English. Verify distinct H1s and useful, server-rendered classroom examples; confirm each page describes the actual teacher create, publish, student attempt, and results path. Follow each create CTA and verify the editor receives `source=templates` with the correct `quiz` or `matching-pairs` template. Verify the quiz guide links to the public food quiz demo, the matching guide does not present the quiz demo as a matching demo, and both guides have self canonicals without fabricated non-English hreflang links. Visit `/zh/` and `/es/` variants of each guide and verify they return 404 rather than serving indexable English content. |

## 2. Authentication And Protected Routes

**File:** `specs/auth.spec.ts` | **Priority:** P0

Verifies login and route protection with real Better Auth endpoints and seeded
verified users.

| # | Test name | Flow |
|---|---|---|
| 1 | Guests are redirected from dashboard | Open `/dashboard` while signed out, expect redirect to `/auth/login`, and verify the email input is visible. |
| 2 | Verified user can sign in | Create an E2E user, mark it verified, sign in through `/auth/login`, and verify the Teacher dashboard heading, the Create activity and Open activity library actions, and the empty-workspace "Start by creating a reusable activity." next step. |
| 3 | User can register from UI | Fill `/auth/register`, verify the "Check your email to verify your teacher workspace" success status, mark the test account verified, sign in through `/auth/login`, and verify dashboard content. |
| 4 | Non-admin cannot view admin pages | Sign in as a non-admin user, open `/admin/users`, and expect redirect to `/dashboard`. |
| 5 | Admin can view users dashboard | Sign in as an admin E2E user, open `/admin/users`, and verify the users dashboard shows the admin email. |

## 3. Protected Page Smoke Test

**File:** `specs/protected-pages.spec.ts` | **Priority:** P0

Verifies authenticated app pages render in English/Chinese and dark/light mode
without browser console errors or page errors.

| # | Test name | Flow |
|---|---|---|
| 1 | Protected pages render successfully | Sign in as an admin E2E user, then open `/dashboard`, `/dashboard/activities`, `/dashboard/assignments`, `/admin/users`, `/settings/profile`, `/settings/security`, `/settings/notifications`, `/settings/files`, and when `VITE_PAYMENT_PROVIDER` is configured, `/settings/billing` and `/settings/payment` for `en` and `zh`, in `dark` and `light` mode.Verify each active product page returns 2xx, renders a visible body, applies the requested theme, and emits no browser errors. On auth-adjacent and settings surfaces, verify localized copy describes the ClassGamify teacher workspace, activities, source materials, assignment links, student attempts, result records, or billing access rather than generic account or copied learning-site language. On `/settings/profile`, verify the teacher identity scope summary explains where the display name and avatar are used across activities, assignment handoff, student recognition, and result review. On `/settings/security`, verify the workspace security boundary and available security controls explain account access, activities/source materials, assignment links, and student result records. On `/settings/notifications`, verify the classroom update boundary explains teacher-controlled product update emails, template and worksheet updates, assignment review, teacher control, email channel, subscription status source, update frequency, activity/library/content boundaries, assignment snapshots, attempt records, result exports, source-material read boundaries, student reminders, public links, learner notifications, mutation payloads, private data, and legacy-copy guard without sending student reminders, changing public links, notifying learners, reading source files, exposing teacher email, raw provider errors, raw mutation payloads, source-material storage keys, student identifiers, or copied learning-site language. On `/settings/files`, verify the classroom material boundary explains the source material library, activity attachments, AI draft provenance, and student payload privacy before the file table. When payment is configured, verify `/settings/billing` shows the billing workspace summary for plan access, activity library, assignment workflow, and results and AI; verify `/settings/payment` shows the hosted checkout status and next step without exposing raw checkout sessions, teacher emails, student answers, anonymous tokens, source-material storage keys, provider secrets, or mutating classroom data. |
| 1a | Teacher workspace pages lead with actions | On `/dashboard`, verify the Create activity and Open activity library actions, a compact metric row, the create → publish → share → review progress panel, and a recent assignments list with View results links, with no product-roadmap hero, readiness card, or demo activity card. On `/dashboard/activities` and `/dashboard/assignments`, verify filters show only their controls (help text and counts are screen-reader descriptions), there is no "Current view" recap panel, activity cards show one inline content line, collapse "Template compatibility" and assignment settings behind disclosures, and keep Edit, Duplicate, Archive, and Publish reachable without overflowing the card. |
| 2 | Settings files classify classroom materials | With storage enabled, open the dashboard sidebar, follow the settings Files entry, and verify `/settings/files` loads for `en` and `zh`. Seed saved file rows for audio, worksheet image, worksheet document, spreadsheet, and unknown classroom materials, then verify the Material column shows localized teacher-facing labels while preserving the raw content type as secondary detail for troubleshooting. Verify the summary strip shows total materials, storage used, worksheet material count, and audio material count from the full file library rather than only the visible page. |

## 4. Profile Settings

**File:** `specs/settings-profile.spec.ts` | **Priority:** P1

Verifies the signed-in profile update flow.

| # | Test name | Flow |
|---|---|---|
| 1 | User can update display name | Sign in, open `/settings/profile`, verify the localized teacher identity scope summary is visible, change the name, save, verify success toast, and reload to verify persistence. Open `/zh/settings/profile` and verify the same teacher identity scope summary is localized. |

## 5. Activity Authoring

**File:** `specs/activity-authoring.spec.ts` | **Priority:** P1

Verifies the core teacher loop from reusable activity creation through
assignment publishing, student submission, teacher result review, and the
printable worksheet return path. The persisted browser journey exercises the
30-slice result-material, result-review, copy-artifact, and printable-worksheet
handoffs rather than relying only on source-level contract tests.

| # | Test name | Flow |
|---|---|---|
| 1 | Teacher can save a structured activity | Sign in as a verified teacher, open `/create`, choose a template, verify its required content badges and template readiness panel appear, load its scaffold, verify the scaffold fills a coherent lesson with questions, match pairs, groups, vocabulary, and teacher notes where the shared content model supports them, verify ready template badges update from the structured text fields, verify the activity title appears, reload, verify it still appears from persisted D1 data, open the saved activity edit route, and verify it loads the saved title, template, and structured content into the same editor. |
| 1a | Teacher edits questions, pairs, and groups row by row | Open `/create`, verify Questions, Match pairs, and Groups render as labeled per-row editors (question, correct answer, answer choices, optional explanation; term and match; group name and items) with Add and Remove buttons, add a question and verify the collapsed "Edit as text" textarea (`name="questionsText"`) holds the same `prompt | answer | choices` line the validator parses, and verify loading a starter or an AI draft refills the rows. The page shows no separate step bar or pipe-syntax helper panel, and the Save activity bar stays reachable while scrolling. |
| 2 | Template requirements are enforced | Sign in, open `/create`, choose a match-based template, clear match pairs, submit, and verify a validation error explains the missing content requirement. |
| 2a | Assignment publish controls use prepared semantic boundaries | Open the publish dialog from a saved activity and verify the source-level `assignment-publish-control-semantics` boundary exposes 30 stable control slices for publish title, instructions, attempt limit, timer, close time, delivery toggles, preview region, frozen-link status, delivery-rule stats, review checklist, validation alert, field limits, publish action, privacy guard, prepared control IDs, and opaque control scope. Verify title, instructions, max attempts, timer, close time, and toggles are associated with prepared help or description IDs through `aria-describedby`, preview and checklist regions are labelled by prepared IDs, and DOM control IDs do not include internal activity ids, assignment title text, student instructions, share slugs, raw settings JSON, student names, source-material storage keys, student answers, or answer keys. |
| 3 | Teacher can publish and copy a configured student share link | Sign in, save a structured activity, verify the saved-activity panel appears, click the panel publish assignment action, set the assignment title, student instructions, name collection, answer reveal, shuffle, max attempts, and optional time limit, verify invalid title, max-attempt, time-limit, or close-after values show a pre-publish validation hint before submission, verify the publish dialog delivery preview updates for attempts, timer, close time, student identity mode, answer reveal behavior, and item order, exposes labelled semantic regions for the preview status, delivery-rule stats, and review checklist, verify the published-assignment panel resolves the share slug through the assignment list data, shows both the localized full student URL and the labeled `/play/:shareId` student path from the shared share-link view, exposes localized next-step guidance for copying, previewing, and reviewing results, shows copy-student-link, student preview, print, and results actions for the new share link, and keeps the source-level `owner-assignment-list-filter-scope` boundary aligned across full filtered assignment count, overview count, visible-page count, owner-scoped status/search filters, and published share context, verify the assignment card summarizes the same settings and also shows the same full student URL plus labeled student path, copy the generated student link, verify the copied URL matches the displayed full student URL and ends with `/play/:shareId`, open the generated `/play/:shareId` link, verify the student runner labels, shows the teacher's student instructions, and displays before-start guidance for reviewing rules, identity mode, timer behavior, and submitting answers, verify the runner shows a public rule summary with a localized rules heading, status badge, item count, attempts, timer, close time, identity mode, and review behavior without exposing answers, verify the student runner renders no hidden `data-handoff` sections and the public `/play/:shareId` DOM does not render `data-handoff="public-assignment-access"` audit markers, verify the visible public rule summary and before-start guidance expose localized rules, identity mode, timer behavior, review behavior, sanitized payload boundaries, and student-safe submission expectations without exposing prompt text, choice text, answer keys, accepted alternatives, raw item ids, raw anonymous tokens, student names, student answers, teacher-only answers, ActivityContent JSON, settings JSON, snapshot content, source-material metadata, or unavailable-link content, and verify the runner honors the settings. Exercise a partial-settings fixture and verify assignment cards, student payloads, submission limits, results, and CSV exports all resolve the same default delivery settings while explicit unlimited-attempt settings stay unlimited. |
| 4 | Student can submit an attempt | Open a persisted `/play/:shareId`, enter a student name with extra whitespace and some answers, verify the runner shows a localized attempt workspace region, attempt status region, identity region, answered/unanswered progress derived from the frozen runtime item ids, and submit controls whose accessible descriptions reference the current submit hints, with progress, submit-readiness checks, and browser payload metrics exposed as labelled semantic outputs and the submit button described by the same localized readiness and hint views, try to submit with an unanswered item and verify the first click asks for confirmation both in the toast and as a persistent warning-toned submit hint next to the `Submit anyway` button, submit anyway or complete the missing answer, verify the prepared browser payload summary is visible as a localized semantic label/value output group that reflects the frozen share slug, runtime item count, submitted answer count, and unanswered count before the mutation runs without exposing the student name, answer text, or raw anonymous browser token, verify the named-student identity cannot be edited while submission is in flight, verify the score panel appears with the server-derived remaining-attempts message, localized result region label, score aria label, result score/time/attempt-usage outputs, review-summary and feedback-scope regions with semantic label/value/description metric outputs, and next-step region for reviewing score/time, feedback availability, teacher review, or starting another attempt, verify the submitted named-student identity is locked while the score panel is visible and displays the same normalized name stored with the attempt, and verify post-submit feedback shows the student's submitted answer before the correct answer when answer reveal is enabled. For partial submissions with answer reveal enabled, verify unanswered items are marked as unanswered and still show the correct answer, accepted alternatives, and explanation after submission. Use the start-another-attempt action when the assignment still has attempts remaining, and verify it clears answers while preserving the same normalized student identity for the next submission. Reload `/dashboard/assignments` as the teacher and verify completions/average score update. Direct submission with partial answers is accepted, while duplicate item ids, unknown item ids, or more answer rows than frozen runtime items are rejected. |
| 4a | Student submission keeps visible progress and results private | Open a persisted `/play/:shareId`, prepare a partial browser answer set, and verify visible progress, partial-confirmation state, identity mode, timer state, result status, score, accuracy, attempt usage, retry availability, review counts, feedback visibility, and next steps stay exposed through labelled public runner regions. Verify the public UI renders no hidden `data-handoff` sections and does not expose raw anonymous tokens, student names, answer text, raw submission payload rows, runtime item ids, teacher-only answers, or teacher source-material metadata before or after submission. |
| 4e | Assignment attempt limits keep domain guards without public audit DOM | Open a persisted `/play/:shareId` assignment with a finite max-attempt limit, submit until the server returns remaining-attempt usage, and verify the visible public rules, submit gate, result usage label, retry button state, delivery summary, result page, and export boundary all agree on previous/used/remaining attempts and limit-reached blocking. Verify the source-level assignment-attempt-limit guards cover per-student limit scope, max-attempt normalization, previous/used/remaining attempts, unlimited-attempt propagation, limit-reached blocking, retry availability, result usage label, named-student identity normalization, anonymous-token identity normalization, identity mode, attempt-counter source, max-attempt parser, previous-count query, server enforcement, scored-attempt write gate, runner result usage, retry button boundary, submission gate reuse, delivery summary alignment, public rule alignment, result-page alignment, result export alignment, negative/fractional/non-finite/zero guard values, raw-token guard, and privacy guard while the public student DOM does not render `data-handoff="assignment-attempt-limit"` audit markers. Repeat with an unlimited-attempt assignment and verify the max-attempt and remaining-attempt values stay unlimited across the runner, result usage, delivery summary, result page, and export boundary while the contract and public UI omit raw anonymous tokens, student names, answer text, raw identity keys, raw submission payload rows, and teacher-only answers. |
| 4f | Assignment submission validation keeps domain guards without public audit DOM | Open a persisted `/play/:shareId`, prepare a partial browser answer set, and verify visible public submit readiness, payload summary, progress, partial-submit confirmation, safe failure mapping, and result feedback align with frozen runtime validation. Verify the source-level assignment-submission-validation guards cover frozen runtime validation scope, runtime source, runtime and submitted-answer counts, partial submission allowance, empty-answer omission, runtime and submitted id normalization, runtime id uniqueness, blank/unknown/duplicate/too-many/duplicate-runtime rejection, fullwidth id normalization, API answer/item/text/max-answer limits, API normalization, validate-before-scoring order, scoring and persistence with normalized answers, client payload and progress sources, safe failure mapping, teacher-result/public-payload boundaries, raw-payload guard, and privacy guard while the public student DOM does not render `data-handoff="assignment-submission-validation"` audit markers. Verify partial submissions remain accepted after confirmation while duplicate item ids, unknown item ids, blank item ids, duplicate normalized runtime ids, and answer lists longer than frozen runtime items are rejected before scoring; the contract and public UI must not expose runtime item ids, prompt text, choice text, answer text, raw submission payload rows, student names, anonymous tokens, teacher-only answers, ActivityContent JSON, settings JSON, or source-material metadata. |
| 4g | Assignment attempt persistence keeps source-level guards without public audit DOM | Open a persisted `/play/:shareId`, submit a scored attempt, and verify the source-level assignment-attempt-persistence guards cover lifecycle gate, identity gate, attempt-limit gate, runtime-validation gate, scoring source, insert helper, assignment id, attempt id, started/completed timestamps, student-name and anonymous-token identities, answers JSON, template type, answer correctness, result JSON, score, max score, duration, immutable answer/result copies, public result boundary, review summary boundary, result-analysis boundary, attempt-stats boundary, CSV export boundary, source-material guard, raw-payload guard, and privacy guard. Verify scored-attempt insert rows are built through `buildScoredAttemptInsert`, answer/result JSON are cloned before persistence, score/maxScore come from evaluation result points, and result analysis, attempt stats, and CSV export consume stored attempt records while the public student DOM does not render `data-handoff="assignment-attempt-persistence"` audit markers or expose student names, anonymous tokens, submitted answers, teacher-only answers, raw submission payload rows, runtime item ids, ActivityContent JSON, settings JSON, or source-material metadata. |
| 5 | Student runner adapts to template content | Create quiz, match-up, line-match, fill-blank, listening, open-box, matching-pairs, and group-sort activities, publish each one, open each `/play/:shareId`, verify quiz and match-up render clickable choices, verify line-match renders a two-column connection board without exposing the answer map, verify fill-blank renders worksheet-style inline blanks instead of multiple-choice cards, verify listening renders track buttons, an audio play control, localized readiness status for browser speech support, activity voice language, and transcript visibility, hidden transcripts before submission, and answer input or choices whose accessible descriptions reference the listening status, verify open-box renders selectable boxes with one revealed prompt and answer field, verify group-sort renders a category board where items move into selected groups, verify matching-pairs renders a left/right card board that records selected choices without exposing correct answers, submit answers, and verify scoring reflects the template-specific expected answers. |
| 5b | Fill-blank worksheet renders inline blanks | Open a persisted fill-blank `/play/:shareId`, verify the visible runner renders worksheet-style inline blanks when a prompt contains `___`, `[blank]`, or `(blank)`, falls back to a standalone answer input when no blank marker exists, and shows word-bank text only as visible student support. Verify inputs lock when the runner is disabled, review feedback appears only after submission and answer reveal, teacher results stay unchanged, and the page does not expose runtime item ids, student names, anonymous tokens, answer keys, ActivityContent JSON, or source-material metadata. |
| 5a | Open-box reveal cards reveal one prompt at a time | Open a persisted open-box `/play/:shareId`, verify the visible runner shows selectable boxes, exactly one revealed prompt panel, previous/next navigation, and an answer input. Verify inputs lock when the runner is disabled, review feedback appears only after submission and answer reveal, teacher results stay unchanged, and the page does not expose runtime item ids, student names, anonymous tokens, answer keys, ActivityContent JSON, or source-material metadata. |
| 6 | Teacher can review, filter, copy, export, and print assignment results | After at least one student attempt, open `/dashboard/assignments/:assignmentId` and verify the first screen shows the share toolbar (copy link, open link, print, and a "Copy & export" menu), a completions / accuracy / time summary, a collapsed "Assignment settings" section, "Reteach priorities" ordered by lowest correct rate, and "Student follow-up"; with no attempts the page shows only the share toolbar, settings, and one empty state. Then verify completions, average accuracy, localized full student URL, labeled share path, copyable student link using the same displayed URL, localized metric descriptions and accessible metric labels explaining completions, accuracy, points, time, and close time, with each result metric card showing its label, value, and description. Verify localized result action descriptions for the classroom brief, reteach plan, item review, student follow-up, and CSV export, and verify each result action also exposes a localized data-scope label and action-status label so copy actions are marked as current-review artifacts while CSV export is marked as full-assignment results, with disabled actions announcing their prepared blocked reason. Verify the classroom brief, the student summary table, the attempt table, reteach priorities, the full item performance table, per-item correct rates, answer explanations, accepted answer alternatives, and answer review details show scored student answers from the assignment snapshot. Verify the student search, student sort, item-performance sort, and answer-review filter controls each expose localized Default or Adjusted status badges with accessible labels and hidden descriptions tied to the same control description so teachers can distinguish the baseline view from an adjusted review scope before copying materials. Verify the classroom brief lists its current coverage for reviewed attempts, follow-up students, focus items, and analyzed items, then shows assignment-level metrics, the lowest-performing submitted items, and students needing follow-up as stable semantic label/value/description groups without exposing raw anonymous tokens. Copy the brief and verify the copied text includes the same metrics, review focus, follow-up sections, and current copy-scope block, and that the visible copy-scope preview and per-preview copy-scope snapshot show the same matched-record summary through stable semantic outputs with accessible labels before copying. Open the printable worksheet action, verify `/print/assignments/:assignmentId` loads without public marketing navigation, renders the frozen assignment title, template, localized before-printing preparation summary for handout fields, student practice response plan, hidden-by-default answer-key access state, student-name, date, and score lines, delivery policy, instructions, share path, printable items, response hints, and choice banks, and verify it does not show answers by default. Toggle the answer-key control, verify `answerKey=true` remains in the URL, the toolbar, header overview, preparation summary, and answer-key section switch to the teacher-only key included state, the teacher-only answer key shows expected answers, accepted alternatives, and explanations through stable answer-key access, item, and detail outputs, and an assignment with no printable answer-key items reports the no-answer-key-available state without rendering answers before returning to results. Sort item performance by snapshot order, lowest accuracy, submitted count, and item type, verifying each selected sort shows its teacher-facing explanation, non-default sorts keep `itemSort` in the URL, and the default clears it. Search by a student name or anonymous student label and verify the summary rows, attempt rows, and answer review cards filter together without exposing raw anonymous tokens, switch answer review between all submissions and needs-review submissions, verify each selected review filter explains the current answer-review scope, only attempts with at least one missed or unanswered item remain, and non-default review mode keeps `review=needs-review` in the URL, switch the student summary sort between needs-review, best score, name, and attempts, verify each selected student sort shows its classroom scan explanation and treats missed and unanswered items as follow-up needs, non-default sorts keep `sort` in the URL, and the default clears it, copy the item review summary and verify it includes prompts, item types, correct rates, expected answers, accepted answers, explanations, and the current copy-scope block, verify the student follow-up copy preview shows localized student count, students needing review, next-step, latest-attempt, attempt-time, and last-submitted coverage, then copy the student follow-up summary and verify it includes normalized student labels, latest/average/best accuracy, attempts, review counts that include unanswered items, the current copy-scope block, and latest-attempt details only from the current review scope, copy the reteach plan and verify it includes low-performing prompts plus student follow-up lines and the same current copy-scope block, then download the CSV export and verify it still includes full assignment results with a formatted delivery-policy column, raw assignment delivery settings as dedicated `_raw` columns, student summary, attempt, expected-answer, accepted-answer, and item-level answer columns without exposing raw anonymous tokens. |
| 7 | Teacher can generate an AI draft before saving | Sign in, open `/create`, verify the AI source panel starts with a localized source-readiness status, character count, and safe-source explanation, replace the starter source notes with classroom text and verify the readiness changes from starter source to source ready, attach classroom source materials such as audio, worksheet, or spreadsheet files, verify the source-readiness status explains that material sync is available before generation and the source-level `activity-ai-draft-source-controls` boundary aligns the textarea, sync action, generate action, source readiness, safety/material provenance, and prepared control IDs, verify the attached-source-material summary also exposes the same localized sync action and can sync materials into the AI source notes, verify the AI source panel shows localized attached-material AI readiness for audio listening drafts, worksheet extraction, and spreadsheet import without claiming extraction has already run, sync attached materials into the AI source notes, manually add unsafe or duplicate source-material lines such as storage keys, URLs, path segments, or repeated basenames, verify the AI source panel exposes localized safe-source and omitted-source counts as semantic label/value/description outputs before generation, verify the AI source panel and generated-summary provenance show only safe material kind and safe filename without file ids, storage keys, URLs, path segments, query tokens, permissions, or owner metadata, verify the generated-summary source-material safety section exposes localized safe-source and omitted-source counts as semantic label/value/description outputs without showing omitted note payloads, verify the generated-summary source-material AI readiness also shows audio listening draft, worksheet extraction, and spreadsheet import readiness inferred only from safe provenance and still describes extraction as future teacher-reviewed work, choose a template and item count, click generate draft, verify the deterministic fallback source-term plan exposes 30 safe source-planning slices for source sanitization, material-note detection/omission, phrase and word extraction, subject fallback, unique normalization, item target, source-term selection, fallback padding, output consumers, and privacy guards without exposing source text, file ids, storage keys, file names, or raw material notes, verify the activity-ai-draft-boundary handoff switches provider/model/fallback, editor application, coverage, readiness, quiz-choice, and notice slices from pending to the generated result while still reporting no persistence or publish action, verify the title/content fields are filled with reviewable activity content, verify the draft coverage summary shows the applied-to-editor state, next save/review step, a localized draft-trust panel for provider, model, teacher-review gate, safe-source count, and fallback/completion notice, structured review checklist items with status labels and teacher-facing explanations, question, pair, group, vocabulary, note, ready-template count, locked-template count, provider, model, any fallback notice, suggested remixes, per-template ready/locked status with missing-requirement counts, and quiz choice readiness showing explicit choices, locally completed distractors, or questions that still need teacher-approved distractors, save the activity, and verify it appears in `/dashboard/activities`. |
| 8 | Teacher can edit a saved activity | Sign in, open `/dashboard/activities`, choose a persisted activity, click edit, update the title/content/template fields, save, return to the library, and verify the updated activity metadata and compatible template counts persist after reload. Attach an uploaded audio or worksheet classroom material from the activity editor, save, verify the activity library card summarizes the attached source-material count and material type, reopen the edit page, and verify the compact source-material reference is still attached without exposing storage keys in the editor. Publish before editing and verify the existing student share link still uses its original assignment snapshot. |
| 9 | Teacher sees template remix readiness | Sign in, create one activity with questions, pairs, and groups and another with only questions, verify `/create` shows the same deterministic ready and locked template families before save, open `/dashboard/activities`, verify the complete activity shows ready remix badges for all compatible templates, verify the question-only activity names missing match pairs or groups for locked templates, and verify the current template is visually distinct from suggested remix targets. |
| 10 | Teacher can close and reopen assignment links | Sign in, publish an assignment, open `/dashboard/assignments`, close the assignment link, open `/play/:shareId` and verify the student runner is unavailable, shows a localized closed-link state with link status, hidden activity content, blocked submissions, private browser identity, and contact-teacher next step, renders the unavailable-link safety panel covering hidden runtime content, hidden answers and explanations, private browser identity, hidden source materials, and blocked submissions, and does not expose runtime items, answer keys, answer explanations, source materials, browser labels, or raw anonymous tokens. Reopen the assignment from the dashboard, open `/play/:shareId` again, and verify the runner loads without exposing correct answers before submission. Verify direct status updates cannot close an already closed link, reopen an already open link, or publish a draft assignment without going through the publish-and-snapshot flow. |
| 11 | Assignment close-after time blocks late submissions | Sign in, publish an assignment with a future close-after time, verify the assignment list and results page show the close time, then exercise an expired fixture or time-controlled test case to verify `/play/:shareId` shows a localized expired-link state with link status, hidden activity content, blocked submissions, private browser identity, and contact-teacher next step, renders the unavailable-link safety panel as labelled `dl`/`output` scope and safety relationships covering hidden runtime content, hidden answers and explanations, private browser identity, hidden source materials, and blocked submissions, verify the unavailable public DOM does not render `data-handoff="public-assignment-unavailable-access"` or `data-handoff="public-assignment-access"` audit markers, verify the visible missing-link state and unavailable safety panel still connect unavailable access status, reason, share-link boundary, missing route state, student message, missing-page scope items, unavailable safety panel and item count, runtime/answer/explanation/material/identity/submission policies, policy-only payload, shared lifecycle helper, submission error, direct-submit guard, teacher-list/result-page alignment, result retention, reopen guidance, noindex route policy, and privacy guard without exposing the actual share slug, assignment title, runtime prompt or choice text, runtime item ids, answer keys, explanations, browser labels, raw anonymous tokens, student answer text, or teacher materials, does not expose runtime items, answer explanations, source materials, browser labels, or raw anonymous tokens, direct submission returns an expired-assignment error, and direct status update cannot reopen the expired assignment. |
| 12 | Answer explanations survive authoring, submission, and review | Create or edit a question activity with `prompt | answer | choices | explanation`, publish it with answer reveal enabled, open the public student link and verify the sanitized runtime payload and UI do not expose the explanation before submission, submit an attempt, verify the student review shows the explanation only after submission, and verify the teacher results page shows the same explanation from the assignment snapshot. |
| 13 | Teacher can copy an activity into a ready template | Sign in, create an activity whose content satisfies multiple template requirements, open `/dashboard/activities`, click a ready `Copy as ...` remix action, verify a new draft activity opens with the target template selected, verify the remixed draft title includes the target template short name without exceeding the activity title limit even from a long source title, and verify the original activity and any existing assignments remain unchanged. |
| 14 | Answer matching accepts teacher-defined alternatives | Create a fill-blank or listening activity whose answer field contains alternatives separated by `/` or `;`, publish it, submit an answer with different casing or punctuation, and verify scoring treats the accepted alternative as correct while preserving the original review answer and showing the accepted alternatives only after submission. Verify quiz, fill-blank, listening, line-match, matching-pairs, group-sort, and open-box student review feedback all use the shared correct/needs-review presentation so the student's submitted answer, accepted alternatives, and explanations appear whenever answer reveal is enabled, with the feedback exposed as a localized semantic region, status label/value/description relationship, and labelled detail output relationships rather than template-specific text fragments. Verify the teacher results page, copied item review summary, and CSV export also show the accepted alternatives from the assignment snapshot. |
| 15 | Time-limited assignments show attempt duration | Publish an assignment with a short time limit, verify `/dashboard/assignments` and `/dashboard/assignments/:assignmentId` show the shared settings summary with timer, attempt limit, close time, identity mode, answer reveal, item order, and instructions, open `/play/:shareId`, verify the countdown starts after the playable assignment loads, verify the timer badge has a localized accessible label and description from the same timer state used by the visible countdown, submit an attempt, verify the score panel exposes elapsed time as a localized labelled output with a normalization description, verify direct submissions store duration as whole non-negative seconds capped to the timer, and verify the result page average-time metric, per-attempt duration cells, assignment-list summary stats, and CSV average/duration seconds all use the same normalized duration contract. |
| 16 | Quiz choices are completed from lesson content | Create or edit a quiz activity with question answers but sparse or missing choices plus vocabulary terms, verify the editor template-readiness panel shows which questions already have explicit choices, which are completed locally from sibling answers or vocabulary, and which still need more candidates before publishing. Verify the same panel exposes a localized 30-slice quiz-choice generation handoff with stable semantic label/value/description output relationships for generation scope, target count, question readiness counts, explicit/local/missing choice counts, sibling/vocabulary candidate counts, candidate source count, answer coverage, missing answers, shared `ActivityQuestionOption[]` write target, deterministic-now/AI-later mode, teacher-review boundary, save-before-publish boundary, completed choice count, explicit answer coverage, local candidate question count, candidate deduplication, candidate normalization, stable choice order, runtime choice source, answer inclusion guard, empty-content guard, and privacy guard before future AI distractor generation is connected, without exposing question prompts, option text, answer text, vocabulary text, raw AI output, or stable ordering seeds. Publish it, open `/play/:shareId`, and verify the quiz renders deterministic multiple-choice options without exposing which option is correct before submission. |
| 17 | Homepage and template routes enter ClassGamify product loops | Open `/`, verify the hero preview and primary actions point to templates or activity creation rather than legacy Hanzi, HSK, worksheet, or skeleton-only routes, verify the public homepage DOM does not render internal handoff markers, audit text, or pageView.handoffView output, without creating assignment links, mutating teacher data, exposing answer keys, student attempt records, raw anonymous tokens, source-material storage keys, or teacher-private activity content, then follow the primary CTA and verify the activity creation page loads. Open `/templates`, verify the template cards describe real classroom modes and content requirements, click a template-specific start action, and verify `/create?template=...&source=templates` loads with that primary template selected, the matching template scaffold already filling the structured fields, and the create page's localized template-entry summary showing the template-directory source, loaded example, playable item count, reusable mode count, and next save/review step. Open `/worksheets`, verify it is a Liveworksheets-style entry page for fill-blank, line-match, listening, and group-sort modes rather than a legacy reset page, click the worksheet-mode actions, and verify they route to `/create?template=fill-blank&source=worksheets`, `/create?template=line-match&source=worksheets`, `/create?template=listening&source=worksheets`, or `/create?template=group-sort&source=worksheets` with the matching scaffold selected and a localized worksheet-entry source explanation. Verify the `/templates` and `/worksheets` public DOM does not render internal handoff markers, audit text, or pageView.handoffView output. Open `/learn`, `/hsk/1`, and a `/hanzi/:character` URL, verify retired legacy learning routes are not mounted as copied lesson UI, remain excluded from active navigation and sitemap targets, and are no longer preserved as legacy product crawler rules in `robots.txt` while active ClassGamify product routes continue to load. Verify sitemap URLs, localized alternates, robots disallow rules, and manifest metadata derive from the shared public product-route registry so active ClassGamify entry points stay indexed while teacher dashboard, student runner, print, and retired legacy paths stay out of public indexing. Open `/roadmap` and `/dashboard`, verify they describe the current usable create-publish-play-results loop rather than stale skeleton-only milestones, verify the roadmap lists teacher-reviewed AI drafts as an available capability instead of a backlog item, verify every roadmap item exposes a localized status badge, teacher-value label, teacher-value text, what-improves-next label, and classroom-direction next step from prepared page-view data rather than internal classroom-evidence or task-board wording, verify the authenticated dashboard top metrics come from the teacher's real activity and assignment summaries while starter/demo content remains only a preview, verify activity and assignment metrics can resolve independently when one query is still loading, verify the dashboard loop-status panel recommends the next teacher action for empty library, publish-needed, distribution, collecting-attempts, and review-ready states with localized status labels and real route targets, and verify every dashboard readiness row includes localized next-step guidance derived from the teacher's real activity, open-link, submitted-attempt, and result-review state. |
| 17a | Dashboard overview keeps owner metrics separate from the starter preview | Sign in and open `/dashboard`. Verify the dashboard domain exposes a `teacher-dashboard-query-boundary` with separate activity/assignment resolved states, both-ready, both-loading, activity-loading, and assignment-loading branches, and owner counts derived only from resolved owner summaries. Verify starter preview activity and assignment text are not counted as owner metrics and the page renders no hidden `data-handoff` sections. |
| 18 | Legal pages describe ClassGamify data surfaces | Open `/terms`, `/privacy`, and `/cookie` for `en` and `zh`, verify the pages mention ClassGamify classroom activities, frozen assignment snapshots or assignment links, student attempts, anonymous browser tokens or local runner state where relevant, teacher result summaries or CSV exports where relevant, and AI drafts or source materials where relevant. Verify configured AI-provider examples stay scoped to teacher-reviewed activity drafts, template remixing, distractors, listening scripts, worksheet extraction, and source-material provenance, and do not mention copied Lang Study, getlangstudy, HSK, Hanzi, AI demo product surfaces, unused `fal.ai` image-generation providers, or generic image-generation features. |
| 19 | Blog and release notes describe ClassGamify | Open `/blog`, each visible `/blog/:slug`, and the generated sitemap, verify public post slugs and cards reference ClassGamify templates, assignment links, AI authoring, teacher results, safe source-material provenance, public runner rule summaries, frozen assignment snapshots, CSV exports, or copied teacher review artifacts as appropriate. Verify old HSK, Hanzi, getlangstudy, copied starter, and handwriting editorial URLs or topics are absent. |
| 20 | Attempt limits use normalized student identity | Publish an assignment with student names and a max-attempt limit, submit as `Alice`, then try again as ` alice ` or `ALICE` and verify the limit still applies. Publish another assignment with the max-attempt field cleared, submit more than the default cap from the same normalized student identity, and verify the runner, attempt usage message, teacher settings summary, and CSV export continue to show additional attempts allowed. Publish an anonymous assignment, verify the student runner explains that the current browser is the anonymous identity and shows a short anonymous browser label, submit from two browser contexts, and verify the two browser tokens are summarized as separate anonymous students in teacher results without exposing raw tokens. |
| 21 | Teacher can duplicate an activity safely | Sign in, create a saved activity, click `Duplicate` in `/dashboard/activities`, verify a draft copy opens with the same structured content and `Copy of ...` title, edit the copy, and verify the original activity and its published assignments remain unchanged. |
| 22 | Teacher can search, filter, and page the activity library | Sign in, create enough saved activities to exceed one library page with distinct titles, descriptions, template types, active and archived visibility, and attached classroom source materials such as audio, spreadsheet, worksheet document, worksheet image, and reference-only video/file references, open `/dashboard/activities`, verify overview cards summarize the full current status-filtered result for matching activities, template-family coverage, activities ready to remix, and source materials ready for extraction rather than only the visible page, verify each overview card exposes a localized description and accessible label for the metric value with a stable label/value/description output relationship, verify the source-extraction overview explains how many matching activities have extractable material, verify the source-material filter explains the selected material type and shows prepared audio-ready, worksheet-ready, and spreadsheet-ready capability count labels from the filtered result, verify the activity-status control explains the selected status and shows prepared active/archived matching count labels from the same owner-scoped search/template/source filters without mixing in starter activities or other teachers' rows, verify the current-view panel summarizes visible activity range, current page, selected lifecycle status, exact template-family scope, source-material scope, and active search scope from the same filtered result with stable semantic scope items, verify the activity-library view model exposes an `owner-activity-library-source-scope` boundary that separates full filtered activity count, overview activity count, and visible page activity count while preserving the normalized search, lifecycle status, template, and source-material filters, verify activity cards expose prepared card, detail, content-count, source-material, compatibility, and action-region labels while card stats, readiness summaries, and the localized 30-slice deterministic template-remix safety handoff render as stable semantic label/value/description items covering current and ready template counts, suggested Copy as actions, locked diagnostics, owner scope, source status, lifecycle gate, ready-target-only target gating, current-template exclusion, visible action limit, draft output, title strategy and limit, template switch, content-clone counts, source-material count/kind/privacy, assignment-snapshot protection, original-activity protection, and privacy guard without exposing prompts, answers, choices, teacher notes, source summaries, filenames, file ids, or storage keys, verify activity cards show localized source-material readiness states for no materials, reference-only materials, and extraction-ready material counts alongside source-material count, material type badges, extraction readiness hints, and localized next-step guidance for audio listening draft input, spreadsheet structured import input, or worksheet extraction input without exposing file ids, storage keys, paths, URLs, permissions, owner metadata, or private file identifiers, verify the result range and next/previous controls, move to page 2 and verify the URL keeps `page`, search by a title keyword and verify the list resets to page 1 with `q`, search by a description or template keyword, verify matching cards and overview cards update, filter by an exact template family such as quiz or group sort and verify the URL keeps `template`, filter by source material such as any extractable source, audio, spreadsheet, or worksheet and verify the URL keeps `source`, verify the overview extraction count, source-filter explanation, status counts, capability counts, current-view panel, cards, pagination, empty state, and clear-filters action all reflect the source-material filtered result, combine source filtering with search, template, or archived status, clear filters, and verify the full library returns. |
| 23 | Teacher can filter and page the assignment list | Sign in, publish enough assignments to exceed one list page with distinct titles, statuses, and attempts, open `/dashboard/assignments`, verify overview cards summarize the full current filter result for matching assignments, open links, completions, and attempt accuracy rather than only the visible page, verify the open-link, completion, average, and matching-assignment cards expose localized descriptions and accessible labels for the metric value with stable label/value/description output relationships, verify the status filter explains the selected status with localized copy and shows prepared open, closed, expired, and draft count labels from the filtered result, verify the current-view panel summarizes visible assignment range, current page, selected lifecycle status, and active search scope from the same filtered result with stable semantic scope items, verify assignment cards expose prepared card, settings-summary, result-stats, distribution-step, and action-region labels while card stats and distribution steps render as stable semantic label/value/description items, verify the result range and next/previous controls, move to page 2 and verify the URL keeps `page`, search by assignment title, source activity text, or share id and verify the list resets to page 1 with `q`, filter by published, expired, closed, or draft status, verify overview counts, status-filter explanation, status counts, current-view panel, and cards update for the filtered result, clear filters, and verify the full assignment list returns. |
| 24 | Teacher can archive and restore activities | Sign in, create a saved activity, publish an assignment from it, archive the activity from `/dashboard/activities`, verify it disappears from the active library but the existing assignment and student link still use the frozen snapshot, switch to the archived activity view, verify the status count moves from active to archived under the same search/template/source filters, verify the archived card still exposes prepared card, compatibility, action-region, and restore-required labels, verify activity card actions expose localized action-status labels, verify the compatibility panel exposes the prepared remix action status, verify it still shows its ready and locked template-mode summary while explaining that publishing, duplicating, and template remixing require restore first and does not show those derivative actions, verify any attempted publish-dialog open for the archived activity is blocked by the prepared publish-access status and cannot submit, restore the activity, and verify it returns to the active library as a draft with available publish, duplicate, archive, and ready remix action statuses. |
| 25 | Contact classroom inquiry uses ClassGamify language | Open `/contact?subject=classroom` for `en` and `zh`, verify the classroom form fields, default message, and inquiry-scope panel ask about learners, class or grade, activity material, assignment routine, template or worksheet needs, and result-review needs. Verify the scope panel also warns teachers to send safe classroom context rather than storage keys, private file URLs, raw student identifiers, or unnecessary personal data. Verify the classroom fields remain separate structured inquiry data for the contact API and email template instead of being folded into a free-text message, verify the contact email subject and template describe ClassGamify classroom/product inquiries, and verify the page and developer-facing mail/env examples do not show copied HSK, Hanzi, Lang Study, getlangstudy, GitHub Actions deploy ownership, fal.ai, or Chinese-level/language-scope wording. |
| 26 | Billing settings use ClassGamify plan language | Sign in, open `/settings/billing` for `en` and `zh`, verify the page-level workspace billing boundary describes plan access, activity libraries/source-material workflows, assignment rules, result exports, and AI drafting before the current-plan card. Verify the current-plan card describes ClassGamify plans, activity access, classroom routines, saved activity sets, assignment workflow limits, AI drafts, source-material workflows, result exports, hosted billing status, included classroom access, upgrade-path or plan-limit items, and the localized next step for free, paid, lifetime, or no-plan states, and verify it does not mention copied Lang Study, HSK, Hanzi, Chinese-character, or saved-character-list plan copy. Open the hosted payment status return page states where possible and verify the payment page title/description plus processing, success, failed, and timeout copy point back to teacher workspace access with a localized next-step section rather than generic SaaS checkout language. |
| 27 | Core classroom controls expose accessible descriptions | Sign in and walk `/create`, `/dashboard/activities`, `/dashboard/assignments`, `/dashboard/assignments/:assignmentId`, `/play/:shareId`, and `/print/assignments/:assignmentId`; verify the AI source textarea is described by the safe-source note, source-readiness state, attached-material safety context, source-capability summary, and synced material-note region, verify the AI draft focus and generate controls stay associated with their prepared help text and source-readiness state, and verify activity source/status filters, assignment status filters, result student search, result student sort, item-performance sort, answer-review filter, result metric cards, copy-scope previews, publish-setting inputs and toggles, printable answer-key toggle, student identity input, and submit button are associated with their prepared help text, descriptions, scope summaries, or submit hints through semantic grouping, labelled regions, or `aria-describedby` while continuing to use localized runtime copy. No page renders hidden `data-handoff` audit sections. |
| 28 | Transactional emails describe teacher workspace boundaries | Render or capture verify-email, forgot-password, subscribe-newsletter, and contact-message emails in a fake mail provider or email preview environment. Verify subjects and bodies describe the ClassGamify teacher workspace, saved activities, source materials, assignment links, student attempts, result records, teacher-reviewed AI drafts, worksheet workflows, and classroom update scope where relevant. Verify every transactional template renders the shared localized workspace-boundary panel for activities/templates, assignment links, student attempts/results, and AI drafts/source materials. Verify the transactional-mail handoff exposes a localized 30-slice preflight contract for template set, verify-email, forgot-password, newsletter, contact-message, localized subjects, HTML language, locale fallback, HTML/plain-text rendering, render-before-send, shared layout, provider registry boundary, boundary panel, activity scope, assignment scope, attempt/result scope, AI draft scope, source-material safety, no file-byte reads, worksheet workflow scope, structured classroom contact fields, action-link placement, no activity mutation, no assignment-link mutation, no attempt mutation, no result export, no learner notification, provider-secret guard, legacy-copy guard, and private-data guard. Verify the handoff privacy contract does not expose recipient names, recipient emails, action URLs, contact message text, raw errors, raw student identifiers, source-material storage keys, provider API tokens, file bytes, learner notifications, product mutations, or result exports. Verify the templates use localized message keys rather than hardcoded copy and do not use generic SaaS, copied starter, Lang Study, HSK, Hanzi, or Website Contact wording. |
| 29 | Notification settings use classroom update boundaries | With newsletter settings enabled, sign in and open `/settings/notifications` for `en` and `zh`; verify the page-level classroom update boundary describes template updates, worksheet workflows, assignment review, and teacher control before the newsletter card. Verify the newsletter card still uses localized ClassGamify update copy and does not imply student assignment reminders, public link behavior changes, learner notifications, source-material reads, activity or assignment mutations, attempt/result changes, raw mutation payloads, raw private data exposure, or generic SaaS announcements. |
| 30 | Audit-only semantic handoffs stay out of the visible product layout | Sign in and walk `/dashboard`, `/create`, `/dashboard/activities`, `/dashboard/assignments/:assignmentId`, `/settings/profile`, `/settings/security`, `/settings/notifications`, `/settings/files`, and `/settings/billing`. For every `[data-handoff]` audit section, verify the element remains available to semantic automation but uses the shared `sr-only` visual boundary and a one-pixel off-screen layout footprint. Verify dashboard metrics and next actions, activity template badges and remix buttons, assignment result copy/download actions, file upload/table controls, current-plan/upgrade controls, profile/security actions, notification preferences, and AI draft review controls remain visible and operable. Reject any audit panel that consumes page height, exposes internal contract terminology, or displaces the teacher's primary classroom workflow. |

## 6. Student Runner Smoke

**File:** `specs/student-runner.spec.ts` | **Priority:** P1

Verifies the public student runner can be opened and interacted with from a
stable starter link before release.

| # | Test name | Flow |
|---|---|---|
| 1 | Starter play link stays interactive while read-only | Open `/play/demo-food`, verify the starter assignment heading and progress render, answer the first quiz question, verify the runner moves on to the next question by itself, answer it, verify progress advances, verify the submit button stays disabled because starter preview assignments are read-only, verify the read-only hint is visible and associated with the submit control, and assert no browser errors. |
| 2 | Play links use the focused student layout | Open `/play/demo-food` and verify there is no marketing navbar or footer (no Pricing or Sign up links), only one quiz question is on screen with a "Question 1 of 3" position label, the Previous button is disabled on the first question, question dots jump between questions, and the full assignment rules sit behind the "All assignment rules" disclosure. |

## 7. Storage Source Materials

**File:** `specs/storage-source-materials.spec.ts` | **Priority:** P1

Verifies the real local browser-to-R2 path and its activity-authoring handoff.

| # | Test name | Flow |
|---|---|---|
| 1 | Teacher uploads and attaches private classroom files | Sign in, open `/settings/files`, upload small audio, worksheet image, worksheet document, spreadsheet, and unknown-file fixtures through the real file dialog, and verify each upload closes successfully, creates owner-scoped D1 metadata, remains private, and renders the expected material classification. Open one uploaded file through its id-based private proxy and verify authenticated access returns the original bytes, MIME type, attachment filename, and `nosniff` header without exposing an R2 key. Open `/create`, verify all five uploaded files are available, attach them, save the activity, and verify the activity source-material summary keeps all five references while reporting four extraction-ready files across audio, spreadsheet, worksheet-document, and worksheet-image coverage and leaving the unknown file reference-only, with clean browser health monitoring. |

## 8. Interactive Template Runners

**File:** `specs/interactive-template-runners.spec.ts` | **Priority:** P0

Verifies every published template reaches its real public interaction surface
and persists a scored attempt through the production submission path.

| # | Test name | Flow |
|---|---|---|
| 1 | All eight templates accept scored partial attempts | Create deterministic local published assignments for quiz, match-up, line-match, group-sort, fill-blank, listening, matching-pairs, and open-box from shared structured starter content. Open each public link without teacher authentication, verify its expected choice-list or specialized runtime surface, enter a student identity, answer one item through the real template control, verify incomplete-submit confirmation, submit the partial attempt through the production API, and verify the scored result appears without browser console or page errors. Fixture creation remains restricted to local E2E mode and the E2E secret; public lookup, interaction, validation, scoring, attempt persistence, and result rendering use production paths. Group-sort, line-match, matching-pairs, fill-blank, listening, and open-box boards render inside one shared board frame with a one-line instruction, large tap targets, a visible selected state, and no hidden audit output; progress lives only in the sticky submit bar. |

## 9. Transactional Authentication Mail

**File:** `specs/transactional-auth-mail.spec.ts` | **Priority:** P0

Verifies real authentication mail rendering and action links without contacting
an external mail provider.

| # | Test name | Flow |
|---|---|---|
| 1 | Registration renders verification mail and verifies the teacher | Register through the real browser form, capture the rendered `verifyEmail` message through the secret-gated local E2E outbox, verify the localized subject plus ClassGamify HTML/plain-text workspace copy, open the real Better Auth verification URL, and verify automatic sign-in reaches the teacher dashboard. |
| 2 | Password recovery renders reset mail | Create a verified local teacher, submit the real forgot-password browser form, capture the rendered `forgotPassword` message, and verify its localized subject, ClassGamify HTML/plain-text workspace copy, and Better Auth reset URL. The in-memory outbox supports only secret-gated read and clear operations in local E2E mode; production and normal development return 404 and continue using the configured provider. |

## 10. Deterministic AI Draft Fallback

**File:** `specs/ai-draft-fallback.spec.ts` | **Priority:** P0

Verifies that AI-assisted authoring remains usable and teacher-controlled when
Workers AI credentials are unavailable, without claiming provider quality.

| # | Test name | Flow |
|---|---|---|
| 1 | Teacher generates, reviews, and explicitly saves a local fallback draft | Register and sign in as a verified teacher, replace the starter source notes with classroom content, choose the draft item count and question focus, invoke the production AI-draft server function, verify the deterministic fallback fills reviewable title and structured-question fields, exposes fallback provenance and the missing-credentials notice, and remains on the create page without persisting. Click the real save action, verify redirect to the activity library, and verify the generated title is persisted without browser console or page errors. |

## Deferred Coverage

These flows should be added after their dependencies are made deterministic:

| Area | Reason |
|---|---|
| Payment checkout and portal | Requires Stripe or Creem test fixtures, webhook simulation, and provider-specific env. |
| AI provider quality checks | Requires provider mocks or stable fake responses to avoid cost and flake. |
