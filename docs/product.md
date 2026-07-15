# ClassGamify Product Architecture

ClassGamify is a teacher-first activity and assignment platform inspired by
Wordwall and Liveworksheets. The core product is not a generic AI worksheet
demo: teachers create reusable activity content, render it through game-like
templates, publish assignments, and review student attempts.

## Product Loop

```txt
Activity -> Assignment -> Attempt -> Results
```

`src/config/classroom-product-loop-chain.ts` owns the cross-surface
product-loop handoff that keeps teacher-owned activities, reusable content,
assignment source activity context boundary, classroom data lifecycle and its
attempt persistence handoff boundary,
activity library page boundary,
activity authoring/library workflow,
source extraction lifecycle boundaries, activity lifecycle governance,
template roadmap capability alignment,
AI enhancement lifecycle review,
published assignment delivery, assignment publish preflight boundary,
assignment lifecycle governance boundary, assignment distribution lifecycle
boundary, public assignment rules boundary, student runner play and its submit
controls handoff boundary, student
identity lifecycle,
student runtime identity boundary, assignment submission validation boundary,
assignment attempt persistence boundary, scored attempt results, assignment
attempt stats boundary, answer feedback lifecycle and its answer feedback
handoff boundary, assignment attempt duration
boundary, submitted-date continuity,
accepted-answer continuity, and explanation continuity, teacher result review,
result review controls boundary, teacher result copy lifecycle and its copy
artifact handoff boundary,
worksheet-mode delivery boundary, printable worksheet review lifecycle,
copy/export/print handoffs, teacher workspace operations and its dashboard
overview boundary, public discovery/indexing metadata and its public metadata
handoff boundary, and privacy guards aligned with
this sequence.

Copied-template surfaces should be retired in narrow, verified waves. Public
navigation and homepage entry points should point at ClassGamify templates,
creation, assignment links, and results before legacy learning routes are
deleted, because those old routes still share generated route-tree and locale
infrastructure. Legacy learning URLs that remain mounted should behave as
ClassGamify migration entry points and carry noindex metadata, so they guide
humans toward the new product loop without competing with indexed product
pages. Once those routes no longer render the copied lesson UI, unmounted
Lang Study/Hanzi implementation modules should be deleted in narrow verified
waves instead of left as dormant product code.
Public roadmap and dashboard copy should describe the current usable
ClassGamify loop, not stale scaffold or skeleton milestones once those
capabilities are live.
The authenticated teacher dashboard should use owner-scoped activity and
assignment summaries for top metrics; starter/demo activities may appear as
preview content, but they must not be counted as the teacher's real library,
open links, or results.
The D1 schema should keep a 30-path classroom query index contract aligned with
the activity library, assignment lifecycle filters, attempt identity and result
queries, source-material library, and payment lookup surfaces. Owner columns
must lead teacher-scoped indexes, lifecycle and identity filters must follow
their actual query order, and stable time/id ordering must remain explicit so
larger classroom libraries do not fall back to avoidable table scans or
temporary sorting.
The list APIs should also keep a 30-stage classroom query execution contract:
independent D1 reads for activity lists, assignment summaries, published-link
context, file pages, and file summaries run behind one explicit barrier per
surface, while the dependent page-attempt query waits for the selected page's
assignment ids. Owner scope is prepared before each read group, domain filtering
and summaries run after the barrier, and these list paths remain read-only and
free of student answers, anonymous tokens, or source-material storage keys.
Teacher workspace operations should keep dashboard owner summaries, activity
library filters, assignment distribution, account governance, payment callback,
settings files/billing/notification, and active-surface copy boundaries aligned
without exposing private classroom data or mutating classroom records from
settings controls.
Public policy pages are also product surfaces: terms, privacy, and cookie copy
must describe ClassGamify's teacher activity, public assignment link, student
attempt, results, and AI-draft data model instead of the copied learning-site
model.
Legal provider examples should stay tied to configured classroom AI providers
and teacher-reviewed activity/worksheet workflows; do not describe unused
image-generation providers as part of the active ClassGamify data model.
Public editorial surfaces follow the same rule. Blog posts, release notes, and
their generated sitemap URLs should describe ClassGamify templates, assignments,
AI authoring, and teacher results instead of inherited course or handwriting
content.
Public indexing and install metadata should derive from shared product-route
helpers: sitemap URLs, localized alternates, robots disallow rules, and the web
app manifest must agree on which ClassGamify pages are public entry points and
which teacher, student-runner, print, or retired legacy paths stay out of
search indexing.
Public template directories, worksheet entry pages, marketing pages,
editorial surfaces, and legal pages may keep stable semantic contracts in
page-view or domain helpers, but should not render internal `data-handoff`
audit output into public DOM. Authenticated teacher workspace, student runner,
results, print, and authoring tool surfaces may still use hidden semantic
outputs where they support workflow QA and accessibility.
Developer-facing examples and active account/contact copy should follow the
same product boundary: visible surfaces may refer to legacy URLs only when they
are explicit migration entry points, while current forms, billing pages, and
configuration examples should speak in ClassGamify terms.
Account governance also covers the hosted billing return path: payment callback
status, polling, safe callback normalization, plan-cache refresh, provider
session privacy, and retry/timeout recovery should stay inside the teacher
workspace boundary without mutating activities, assignment links, snapshots,
attempts, results, or source-material records.
The account governance lifecycle should also carry the security workspace's 30
slices for authenticated access, credential controls, linked providers and
sessions, explicit account deletion, activity/source-material/assignment/result
protections, billing access, owner scope, secret guards, legacy-copy guards, and
privacy. Security handoffs must not expose passwords, teacher email, auth
secrets, provider errors, raw anonymous tokens, student identifiers, or storage
keys, and must not silently mutate or delete classroom records.
The active surface product boundary should absorb both the account governance
lifecycle and payment callback handoff contracts so current account, contact,
billing, mail, notification, and developer configuration surfaces stay aligned
with the same ClassGamify teacher-workspace model.
Transactional email surfaces follow the same lifecycle boundary: verification,
password reset, newsletter confirmation, and contact-message templates should
render the shared teacher workspace context before provider send while keeping
action URLs, recipient data, provider secrets, source-material storage keys,
student identifiers, learner notifications, and product mutations out of
handoff contracts.
The transactional mail lifecycle should explicitly carry the 30-slice teacher
notification update handoff across subscription status, pause controls,
template and worksheet updates, assignment review context, provider visibility,
and email-channel scope. It must not mutate activities, assignment snapshots,
attempts, result exports, or public links, read source-material files, expose
recipient or student data, or send learner assignment reminders.
`src/config/classroom-trust-communication-chain.ts` absorbs that
transactional mail lifecycle and its transactional mail workspace boundary
alongside public contact intake, auth workspace
entry, teacher notification settings, hosted billing, legal/provider copy,
developer configuration, storage, and public-DOM boundaries, so trust copy and
provider behavior stay aligned without adding public audit output.

- `Activity` is the teacher-owned reusable content object.
- `ActivityContent` is template-neutral lesson material: questions, pairs,
  groups, vocabulary, learning goal, answer explanations, teacher notes, and
  lightweight `sourceMaterials` references to teacher-uploaded classroom files.
- `ActivityTemplate` is a runtime renderer and scoring strategy for that
  content, such as quiz, match-up, line match, group sort, fill blank,
  listening, matching pairs, or open box.
- `Assignment` is a shareable delivery instance of an activity.
- `AssignmentSnapshot` freezes the published title, template, and content so
  teacher edits do not silently change already shared homework links.
- `Attempt` records a student's submitted answers and scored result.

This shape keeps future templates from creating separate content tables for
each game. New templates should first ask whether the existing content model can
render and score the interaction. Only add new structured content when a mode
cannot be represented by questions, pairs, or groups.
Teacher-uploaded audio, worksheet images, worksheet documents, or spreadsheets
can be linked to `ActivityContent.sourceMaterials` as compact references to
the owner-scoped `userFiles` rows. Those references preserve draft provenance
for editing, AI extraction, and future worksheet/audio tooling, but public
student payloads still expose only sanitized runtime prompts and choices, not
the teacher's file list or storage keys.
Activity create and edit writes must resolve every normalized source-material
file id through one owner-scoped `userFiles` query before persistence. All
requested references must still exist for the current teacher; missing and
different-owner ids share the same localized unavailable response. Persisted
references are rebuilt from authoritative database filename, content-type, and
size metadata in the teacher's requested order rather than trusting client
metadata. Empty reference lists skip the query, duplicate ids stay collapsed,
and validation never selects R2 keys, permission metadata, URLs, or file bytes.
Source-material deletion must preserve the same reference lifecycle. Before
deleting an owner-scoped `userFiles` object, the server checks both saved activity
content and frozen assignment snapshots for the file id. Active and archived
activity references, plus historical snapshot references, block deletion before
R2 is touched and return one localized in-use message. The checks select only
minimal ids, never return activity or snapshot content, and do not inspect student
attempts. Teachers can remove ordinary saved-activity references before deleting
the underlying file, while published snapshot provenance remains retained and
continues to block deletion.
Source-material reference integrity must also hold when activity saves, assignment
publishes, and file deletion race. Database write guards recheck owner-scoped file
existence on activity and frozen-snapshot inserts or content updates, while file
metadata deletion is blocked atomically if either JSON document still references
the file. The delete path claims the metadata before touching R2 so a later
activity write cannot attach a disappearing object. If R2 reports a delete error,
the server probes object presence: an absent object completes deletion, a present
object attempts metadata restoration for retry, and an unknown or failed recovery
stays unavailable rather than allowing a broken classroom reference.
Private source-material uploads must also compensate across the R2 and D1
boundary. A successful private R2 write is not returned until its owner-scoped
`userFiles` metadata is persisted. If that insert reports failure, the server
first probes the exact owner, file id, and R2 key because a committed insert may
have lost its response. Confirmed persistence keeps the object and completes the
upload; confirmed absence starts compensation. A failed cleanup delete is checked
with one object-presence probe: confirmed absence completes cleanup, confirmed
presence receives one bounded delete retry, and retained or unknown results return
one localized cleanup error. An unknown D1 probe never deletes the object blindly.
Public avatar and product-asset folders keep their existing metadata-free path
and are not included in private upload compensation.
R2 upload providers must also resolve an ambiguous `put` response before the D1
metadata phase. Each new object stores the server-generated file id in R2 custom
metadata. If `put` throws, one `head` request against the exact key may recover
success only when that marker, byte size, and normalized content type all match
the current upload. A missing object, mismatched evidence, or failed probe keeps
the original upload error. The provider never issues a blind second `put`, reads
file bytes for recovery, exposes the marker, or constructs `userFiles` metadata
from partial evidence.
Teacher-facing file responses must keep private R2 keys server-only. The full
file list selects only safe display metadata and a stable file id; private upload
responses return the same safe item shape instead of provider `key` or
`metadata.r2Key`. File-table open actions use `/api/storage/file?id=...`; that
route validates the id, resolves the key in D1, and then applies the existing
owner/public access decision before fetching R2. Public shared-folder uploads
still return their public URL, while neither response exposes owner ids, private
descriptions, permission metadata, provider metadata, or storage keys.
The source-material privacy chain should explicitly carry the compact material
reference handoff's 30 slices for reference shape, safe file ids and filename
basenames, content-type, material kind and size normalization, duplicate
collapse, the 12-reference limit, editor and AI consumers, public-payload
guards, and privacy. Its aggregate summary must not expose file ids, original
filenames, file bytes, storage keys, permission metadata, private activity
content, or student payload file references.
The source extraction lifecycle should explicitly carry the 30-slice activity
authoring/library chain so future audio, worksheet, and spreadsheet extraction
output returns to the shared create and edit contracts, teacher save action,
owner-scoped library, lifecycle controls, publish access, and assignment
snapshot protection. Its independent 30-file gate should continue to verify
the product, activity, AI, storage, settings, assignment, and catalog surfaces
without becoming a substitute for that downstream product contract.

Teachers must be able to reopen and edit saved activities from the activity
library. Editing uses the same `CreateActivityInput` contract as creation, with
`ActivityContent` converted back into the structured editor text fields before
submission. Published assignments score against their snapshot; editing an
activity only affects future assignments.
Teachers should also be able to duplicate an activity into a draft before
making a variant, because copying protects the original activity and any
published assignment snapshots while preserving the same structured content.
The activity library should stay usable as a teacher's collection grows.
Teachers can search their own activities by title, description, or template
type from `/dashboard/activities`; the same authenticated list contract powers
the dashboard cards so search never broadens beyond the current owner. They can
also apply an exact template-family filter, such as quiz, match-up, group sort,
fill-blank, listening, matching pairs, line match, or open box, while preserving
the filter state in the URL for reloads and shared teacher workflows. The
library is paginated from the same owner-scoped list API, so large classroom
collections load in bounded pages while search, status, and template filters
reset to a predictable first page. Activity library overview cards summarize
the full current filter result, not only the visible page, including matching
activities, template-family coverage, activities ready to remix into another
template, and total ready template modes. The summary logic belongs in the
activity domain layer so dashboard surfaces and server functions reuse the same
template-readiness calculation instead of duplicating UI-only math. Overview
cards, current-view scope items, card readiness summaries, and content stats
should expose the prepared activity-domain labels, values, and descriptions
through stable semantic outputs so teachers can audit filtered library state
without relying on visual card layout alone.
Individual activity cards should also summarize attached source materials by
count and material kind, so teachers can see which reusable activities have
audio, worksheet images, documents, or spreadsheet provenance before reopening
the editor.
The activity-card source-material summary chain should explicitly carry 30
slices for the card summary surface, attached count, material-kind counts,
extraction-readiness actions, edit-return path, ActivityContent reference, and
privacy guards. Its aggregate summary may expose safe counts and material kinds,
but must not expose filenames, file ids, content types, per-file sizes, file
bytes, storage keys, permission metadata, or student payload file references.
`src/activities/activity-source-material-summary-chain.ts` owns this
source-level contract so activity-library cards, source-material filters,
source-extraction readiness, AI provenance, editor return paths, and student
payload privacy stay aligned without adding a new visible card surface.
Activity library filter parsing and search normalization should also live in
activity-domain helpers so URL state, dashboard controls, and list API queries
share the same activity status and template-family rules.
The activity-library filter-state chain should explicitly carry 30 slices for
URL validation, default-route elision, NFKC search normalization, whitespace
collapse, empty-search defaults, owner-scoped search fields, status parsing,
active and archived lifecycle filters, template parsing, all-template defaults,
exact template families, source-material filter parsing, all/audio/extractable/
spreadsheet/worksheet source filters, page parsing, page-size bounds, page reset
on filter changes, filter preservation on page changes, created-activity return
context, clear-search and clear-filter controls, dashboard control options, list
API owner scope, source-material post-filtering, and privacy guards. Its summary
may expose route state, option labels, safe aggregate match counts, and helper
contract status, but must not expose activity ids, answer text, private activity
content, source-material filenames, file ids, storage keys, or student data.
`src/activities/activity-library-filter-state-chain.ts` owns this source-level
contract so route validation, dashboard controls, list API owner scope,
source-material readiness filters, created-activity return context, and hidden
filter handoffs stay aligned.
Teachers can soft-archive activities from the active library and restore them
later from an archived view. Archiving hides an activity from the default
library and prevents casual republishing, but it does not delete structured
content or alter existing assignment snapshots. Archived activities cannot be
published, duplicated, or remixed into another template until they are restored;
this rule is enforced by server functions, not only by dashboard buttons.
Assignment publishing should additionally keep a source-activity write guard.
The API performs an owner-scoped source read and restore-before-publish check,
while D1 checks source owner equality and archived visibility again immediately
before the assignment insert. If the activity is archived during publish, the
assignment/snapshot transaction rolls back and returns the existing localized
restore guidance. Owner mismatches use the same safe activity-not-found response
as the initial lookup. Active draft, private, public, and unlisted activities
remain publishable, existing assignment snapshots remain unchanged, and trigger
markers, source content, teacher identity, and material metadata stay private.
The assignment publish source continuity chain should carry this write guard as
30 source-level slices across authenticated teacher scope, owner-scoped source
reads, restore-before-publish checks, publish validation and delivery settings,
the assignment/snapshot transaction, D1 `BEFORE INSERT` owner and archive
guards, rollback, localized error mapping, published delivery, existing snapshot
retention, results, and privacy. Its aggregate summary must not expose activity
content, assignment ids, teacher owner ids, source-material metadata, or internal
trigger markers.
`src/assignments/publish-source-continuity-chain.ts` owns this source contract
without rendering source race metadata in teacher or student interfaces.
Activity lifecycle governance should flow through shared domain helpers across
library cards, edit access, publish dialogs, duplicate/remix draft creation, and
server functions, so UI affordances and backend enforcement keep the same
restore-before-derive contract.
Activity edit, archive, and restore writes should also use an atomic lifecycle
revision boundary. Each write matches the current owner, activity id, expected
visibility, and expected `updatedAt` revision in the same database statement,
then returns the updated row directly. A stale edit must not modify content after
another request archives the activity, and stale archive/restore actions must not
overwrite a newer content or lifecycle change. Zero-row updates reload the current
owner-scoped lifecycle state so specific restore/archive guidance remains intact;
otherwise teachers receive a localized reload-before-retry conflict. These writes
do not mutate existing assignment snapshots, attempts, or public student links.
The activity mutation continuity chain should carry this edit/archive/restore
contract as 30 source-level slices across owner-scoped reads, lifecycle checks,
monotonic `updatedAt` allocation, activity/owner/visibility/revision
compare-and-set predicates, guarded content and visibility updates,
single-statement `UPDATE ... RETURNING`, zero-row conflict reloads, derivative
and publish gates, assignment snapshot retention, and privacy. Its aggregate
summary must not expose activity ids, teacher owner ids, activity content,
source-material metadata, or assignment records.
`src/activities/activity-mutation-continuity-chain.ts` owns this source contract
without rendering internal revisions in teacher or student interfaces.
Activity duplicate and template-remix inserts should keep the same write-time
source discipline. A derivative draft stores only an internal source activity id
and expected source revision; D1 checks the provenance pair, owner equality,
archived state, and exact source revision immediately before inserting the draft.
If the source is archived or edited after the initial read, the stale request is
blocked with existing restore guidance or localized reload guidance instead of
copying stale content. Normal activity creation has no source provenance, active
draft/private/public/unlisted sources remain derivable, and later source changes
do not mutate an already-created independent draft. Provenance ids, revisions,
source content, teacher identity, and material metadata remain private.
The activity derivative source continuity chain should carry this duplicate and
template-remix write guard as 30 source-level slices across owner-scoped source
reads, lifecycle and readiness checks, source id/revision provenance, D1
`BEFORE INSERT` pair, owner, archive, and exact revision guards, safe error
mapping, independent draft persistence, later source changes, future publishing,
and privacy. Its aggregate summary must not expose provenance ids or revisions,
activity content, teacher owner ids, source-material metadata, or internal
trigger markers.
`src/activities/derivative-source-continuity-chain.ts` owns this source contract
without rendering provenance metadata in teacher or student interfaces.
The activity lifecycle governance chain should explicitly carry the 30-slice
assignment publish handoff so restored activities return to the shared publish
access, field validation, delivery settings, review checklist, snapshot freeze,
public-payload, result-policy, and privacy contracts. Its independent 30-file
gate should continue to verify archive, restore, edit, duplicate, remix,
retention, and snapshot surfaces without replacing that downstream product
boundary.

The activity editor should make the selected template legible. When teachers
choose quiz, match-up, line-match, group sort, fill-blank, listening, matching
pairs, or open-box, the editor shows the required content type and can load a
template-specific scaffold that fills the matching structured fields. Scaffolds
are examples, not hidden templates; teachers still review and edit before
saving. Each scaffold should provide a coherent classroom lesson with
questions, match pairs, groups, vocabulary, and teacher notes wherever possible,
so loading a quiz, match-up, line-match, group-sort, fill-blank, listening,
matching-pairs, or open-box scaffold immediately demonstrates the "one activity,
many playable modes" model instead of only satisfying the selected template's
minimum fields. The editor should also preview template readiness from the
current structured text fields before save, using the same parser and
deterministic remix model as persisted activities.
The authoring/library chain should explicitly carry the editor workflow's 30
prepared slices for workflow order, create and edit surfaces, templates,
scaffolds, AI draft source, structured content, source materials, review
readiness, save controls, authentication, publish boundaries, and privacy. Its
handoff summary must not expose raw editor input, prompts, answers, teacher
notes, filenames, file ids, or storage keys.
The public template directory should act as a real creation entry point:
teachers can start from any template card and land in `/create` with that
primary template selected and its template-specific scaffold loaded, while the
editor still uses the shared structured activity input contract.
The public `/worksheets` route is the Liveworksheets-style entry point for the
same model rather than a separate legacy worksheet product. It should introduce
fill-blank, line-match, listening, and group-sort/classification modes, then
send teachers into `/create?template=...` so the matching scaffold loads inside
the normal activity editor. Printable follow-up and teacher-uploaded worksheet
extraction should extend the same assignment snapshot, scoring, accepted-answer,
and result-export model instead of creating a parallel worksheet data shape.

Template remixing should be treated as a content-readiness problem before it is
treated as an AI feature. The app can inspect an activity's questions, pairs,
and groups to show which templates are immediately usable and which templates
need more structured content. AI transformations can then fill the missing
fields, but the same readiness model should guide the editor, dashboard, and
publish flow. When an activity is already ready for another template, teachers
can create a draft copy with the same content and a new `templateType`; this
deterministic remix path is the foundation that later AI transformations should
extend rather than replace. Remix draft titles should normalize whitespace and
stay within the activity title length limit even when the source title is long.

Publishing an assignment is an explicit configuration step. Teachers choose the
assignment title, whether to collect student names, whether students see correct
answers after submission, whether items are shuffled, and the per-student
attempt limit. They can also set assignment-specific instructions, an optional
student timer, and close-after time for homework windows. These settings live on
`Assignment.settingsJson`; immutable content lives on `AssignmentSnapshot`, and
the close-after time window lives on `Assignment`. Assignment settings should
resolve through shared domain logic before reaching teacher pages, public
student payloads, submission enforcement, results, or exports, so older or
partial rows receive the same defaults everywhere. Teacher-facing assignment
cards and result pages should summarize the full delivery policy: attempts,
timer, close time, student identity mode, answer reveal behavior, and item
order, so a teacher can verify a link's rules without reopening the publish
dialog. The publish dialog should show the same delivery preview before the
teacher creates the share link, so configuration mistakes are visible before an
assignment is frozen. Delivery summary labels, order, and fallback values should
come from assignment-domain helpers before they are rendered in publish dialogs,
assignment cards, result pages, or public student rule cards.
Publish-dialog previews should expose the frozen-link status, delivery-rule
stats, and review checklist as labelled semantic regions, so screen-reader and
keyboard users can verify the same assignment policy before publishing.
Publish-dialog timer and close-time parsing should also live in assignment
domain helpers so preview values and submitted settings use the same input
rules.
The published-assignment delivery chain should carry the publish dialog's 30
control slices for title, instructions, attempt limit, timer, close time,
delivery toggles, preview state, frozen-link status, rule stats, settings
summary, review checklist, validation, field limits, and publish action state.
Prepared field/help and preview/checklist relationships should use an opaque
control scope, while aggregate handoffs omit generated control ids, assignment
copy, raw settings, student data, answers, and source-material storage keys.
Assignment item ordering is also delivery policy. Shuffle behavior should use a
stable assignment-domain helper keyed by the share link so the same frozen
assignment loads in a predictable order while preserving the original snapshot
order when shuffle is off.
Teacher assignment pages should support the real distribution workflow:
teachers can open a student link for preview or copy the absolute `/play/:id`
URL from the assignment list and results page before sending it through a class
chat, LMS, or email. After a publish action redirects into the assignment list,
the page should surface the newly published share link with copy, student
preview, printable worksheet, and results actions so distribution is the
immediate next step. The published share-slug context should be resolved through
assignment-domain logic,
not ad hoc route code, because pagination and filters may change how much of the
list is visible. Absolute share-link URL construction and `/play/:id` path
encoding should also live in assignment-domain helpers so copied links are
consistent across publish success panels, list cards, and result pages. The
assignment distribution lifecycle chain should explicitly carry the 30-slice
student-runner-start handoff so copied and previewed links enter the shared
sanitized source, runtime availability, delivery rules, attempt limit, timer,
identity, item order, instructions, submission preparation, and privacy
contracts. Its independent 30-file gate should continue to verify post-publish
context, owner lookup, share actions, print, and result surfaces without
substituting for that student-facing start boundary. The
assignment list should remain searchable as teachers reuse
the product across classes: teachers can filter their own assignments by title,
share id, source activity text, or assignment status without broadening outside
the current owner. It should also paginate from the same authenticated list API
so teachers with many class links can move through bounded result pages without
losing search or status filter state. Assignment list overview cards summarize
the full current filter result, not only the visible page, so teachers can trust
open-link counts, total completions, and average accuracy while paging through a
large class archive. Assignment overview cards, current-view scope items, card
stats, and distribution steps should expose prepared assignment-domain labels,
values, and descriptions through stable semantic outputs so teachers can verify
list state, delivery readiness, and result activity without relying on visual
card layout alone.
Assignment list filter parsing and search normalization should live in
assignment-domain helpers so route URLs, list API filters, and dashboard filter
controls stay aligned.
The assignment-list filter-state chain should expose a hidden, localized
30-slice contract covering URL validation, default route elision,
published-share context normalization and preservation, search normalization,
assignment-title/share-id/source-activity search fields, status parsing and
published-to-open aliasing, page parsing, page-size boundaries, filter-change
page reset, page-change filter preservation, clear controls, dashboard controls,
list API owner scope, search/status SQL boundaries, full-result summaries, and
privacy guards. Its fast gate should verify that these outputs come from
assignment-domain helpers and never expose assignment ids, owner ids, public
runtime content, raw tokens, result export rows, source storage keys, student
answers, or teacher-only answers.
`src/assignments/assignment-list-filter-state-chain.ts` owns the source-level
contract for this chain, keeping URL validation, published share context,
search/status filters, dashboard controls, list API owner scope, full filtered
summaries, and privacy aligned with the visible handoff.
The assignment source activity context chain should explicitly carry the
30-slice result-material handoff so frozen source title, description, template,
and snapshot provenance remain connected to teacher copy artifacts, CSV
preparation, printable worksheets, current-review and full-assignment scopes,
snapshot-source evidence, and privacy guards. Its independent 30-file gate
should continue to verify list search, public summaries, result headers, export,
and print surfaces without replacing that teacher-material output contract.
Teachers can close and reopen published assignment links without changing the
frozen snapshot, so public student access and submissions respect the assignment
lifecycle while existing attempts remain available for review. Assignment
status and expiry checks should flow through shared lifecycle helpers so
student access, teacher lists, and result pages agree on open, closed, and
expired states. Server functions enforce the same lifecycle rules as the
teacher UI: only published links can be closed, only closed links can be
reopened, draft assignments cannot bypass the publish-and-snapshot flow, and
expired assignments cannot be reopened without a future product action that
changes the close window.
Teacher close and reopen writes should also use an atomic lifecycle transition
contract. The server validates the initially loaded state, then updates only
when owner, assignment id, expected status, and expected `updatedAt` revision
still match. Reopen updates include the future close-window condition in that
same database statement. A stale or expired transition updates zero rows,
reloads the current lifecycle state for a specific error when possible, and
never overwrites a newer teacher action. Successful transitions advance the
revision monotonically even when requests share the same millisecond, while
snapshots, attempts, results, share links, and assignment settings remain
unchanged.
The assignment status transition continuity chain should carry this atomic
close/reopen contract as 30 source-level slices across owner-scoped reads,
lifecycle validation, monotonic `updatedAt` allocation, assignment/owner/status/
revision compare-and-set predicates, reopen expiry conditions, single-statement
`UPDATE ... RETURNING`, zero-row conflict reloads, public access, retained
snapshots and attempts, teacher results, and privacy. Its aggregate summary must
not expose assignment ids, teacher owner ids, share slugs, activity content,
student identity, or answer text.
`src/assignments/status-transition-continuity-chain.ts` owns this source contract
without rendering concurrency revisions in teacher or student interfaces.
The assignment lifecycle governance chain should explicitly carry the 30-slice
public unavailable-access handoff so closed, expired, draft, and missing links
share lifecycle reasons, student-safe messages, hidden runtime content and
answers, blocked submissions, retained teacher results, reopen guidance,
noindex policy, and privacy guards. Its independent 30-file gate should continue
to verify status, list, public lookup, submission, snapshot, result, and export
surfaces without substituting for that unavailable-state product contract.

Public student links must return a sanitized assignment payload only while the
assignment is open. Closed or expired links do not expose runtime content, and
submissions against closed or expired links are rejected. The browser receives
runtime prompts and choices, not `ActivityContent` with embedded answers.
Teacher-only answer data, accepted alternatives, and explanations stay out of
the public runtime payload. Correct answers and explanations are returned only
after an attempt is scored and only when the assignment allows answer reveal.
Anonymous assignments use a browser token so max-attempt limits still work
without collecting student names.
Student runners should show a compact public rule summary before the activity
starts: item count, attempt limit, timer, close time, identity mode, and review
behavior. This summary comes from sanitized assignment settings and must not
include answer keys or teacher-only content.
Student runners explain that anonymous work is tied to the current browser and
show a short browser label for the student, while teacher result views continue
to use normalized anonymous student labels instead of exposing raw tokens.
Attempt identity must be normalized through shared helpers before enforcing
limits or aggregating results. Whitespace and case differences in a typed
student name should not create a new attempt identity, while anonymous browser
tokens should remain separate students in teacher summaries without exposing the
raw token.
The attempt identity continuity chain should carry the existing identity
handoff as a 30-slice source-level contract across name normalization,
assignment-scoped anonymous browser tokens, storage reuse, safe browser labels,
submission strategies, previous-attempt counting, concurrent identity slots,
scored persistence, teacher result grouping and ordering, and privacy. Its
aggregate summary must not expose student names, raw anonymous tokens, browser
storage keys, grouping keys, or result student keys.
`src/assignments/attempt-identity-continuity-chain.ts` owns this source contract
without reading browser storage or mutating attempts while building its summary.
The student identity lifecycle should also carry the runtime identity handoff's
30 slices for template/runtime scope, item-kind counts, normalized and unique
runtime ids, collision and blank-id guards, submission validation, browser
answers, scoring lookups, teacher results, public payload, and frozen snapshot
boundaries. Its aggregate identity summary must not expose runtime item ids,
prompts, choices, answer text, student names, raw browser tokens, teacher-only
answers, or source-material metadata.

Student runners should use the runtime item kind and template type to choose the
interaction. Multiple-choice questions and match-up pairs render as tap/click
choices. Line-match uses the same pair content but gives students a
worksheet-style two-column connection flow. Fill-blank uses a worksheet-style
renderer that places the answer input into the sentence blank when possible.
Open-box uses a reveal-card flow where students choose a box, answer the prompt,
and move between boxes.
Line-match board state should expose the same prepared connection counts,
selection readiness, exclusive-choice policy, review-feedback visibility, and
privacy guards as stable hidden semantic outputs, without copying prompt text,
choice text, answer text, runtime item ids, student identity, or source
material metadata into the handoff summary.
Listening uses a browser-spoken track flow that hides the transcript until
review, then records the student's selected or typed answer against the same
question item. The spoken track should set the browser speech language from the
activity content language so English and Chinese listening practice do not fall
back to an arbitrary device voice. Group-sort uses a dedicated category board
where students select an item and place it into a group. Matching-pairs uses a
dedicated left/right card board so students can select a prompt and attach a
choice without seeing the answer map.
Group-sort runtime item ids must remain unique for multilingual classroom text,
including Chinese labels and items whose punctuation normalizes to the same
slug, because the same frozen ids drive browser answers, scoring, and teacher
results.
The submission contract remains template-neutral: every renderer stores
`{ itemId, answer }` so scoring and result analysis stay shared. Public
submission still allows partial attempts, but the server rejects answers for
unknown item ids, duplicate item ids, or answer lists longer than the frozen
runtime item count.
The submission validation continuity chain should carry the existing validation
handoff as a 30-slice source-level contract across frozen runtime ids, partial
browser payloads, empty-answer omission, shared API limits, Unicode id
normalization, blank/unknown/duplicate/too-many rejection,
validate-before-scoring order, scored persistence, safe public failures,
teacher results, and privacy. Its aggregate summary must not expose runtime ids,
raw payload rows, student names, anonymous tokens, answer text, teacher answers,
ActivityContent JSON, settings JSON, or source-material metadata.
`src/assignments/submission-validation-continuity-chain.ts` owns this source
contract without rendering validation audit markers in the public runner.
Each real browser submission should also carry a submission idempotency contract:
the runner creates one opaque key only after submission gates pass, reuses it for
a network retry, and clears it when the assignment changes or the student starts
a new attempt. The server returns the same persisted attempt for a matching key
and normalized identity, including after a concurrent duplicate reaches the
database unique boundary. Retry recovery must happen before new-attempt lifecycle
and attempt-limit gates, while a genuinely new attempt still receives a new key
and follows the normal lifecycle, limit, validation, scoring, and persistence
flow. Submission keys remain private persistence metadata and never appear in
public result payloads or teacher exports.
The submission idempotency continuity chain should carry this contract as 30
source-level slices across browser key creation, retry reuse, assignment and
new-attempt resets, normalized identity matching, replay-first server recovery,
new-submit lifecycle and attempt-limit gates, deterministic scoring, D1
uniqueness, concurrent conflict recovery, sanitized feedback, teacher results,
and privacy. Its aggregate summary must not expose submission keys, attempt ids,
student names, anonymous tokens, payload rows, answer text, or teacher answers.
`src/assignments/submission-idempotency-continuity-chain.ts` owns this source
contract without rendering retry keys or internal replay state in the runner.
Finite assignments should additionally keep a finite attempt concurrency
contract. Each new scored attempt reserves the next normalized identity attempt
slot, and D1 uniquely scopes that slot by assignment, identity, and attempt
number. If different submission keys race for the same slot, the losing request
rechecks idempotent replay first, confirms the occupied slot, and recounts before
trying the next slot. Once the configured limit is full, all remaining requests
receive the normal attempt-limit error. Unlimited assignments keep identity and
attempt-number slots nullable so they do not create artificial write contention.
Identity keys and attempt numbers are private persistence metadata and do not
change public feedback, teacher result labels, or exports.
The attempt limit continuity chain should carry the existing attempt-limit
handoff as a 30-slice source-level contract across normalized student identity,
previous scored-attempt counts, idempotent replay priority, concurrent identity
slots, D1 uniqueness, server enforcement, student retry state, public delivery
rules, teacher result policy, exports, and privacy. Its aggregate summary must
not expose identity keys, attempt numbers, submission keys, student names, raw
anonymous tokens, submission payloads, answer text, teacher answers, or CSV data
URLs. `src/assignments/attempt-limit-continuity-chain.ts` owns this source
contract without replacing the localized handoff or the independent SQLite
concurrency gate.
New attempt writes should also keep a submission lifecycle write guard. The API
checks lifecycle before validation and scoring, while D1 checks assignment
status and expiry again in a `BEFORE INSERT` boundary so a teacher closing a
link or the close time arriving during submission cannot persist a new attempt.
Same-key replay recovery remains first: a retry for an already persisted
attempt returns that result, while a genuinely new key is rejected at write
time. Only confirmed identity-slot unique conflicts may enter the bounded
recount loop; lifecycle and unrelated database errors must not be mistaken for
slot contention. Internal trigger markers, identity slots, answers, and student
identity remain outside public responses and teacher exports.
The submission lifecycle continuity chain should carry this write guard as 30
source-level slices across replay-first recovery, initial lifecycle validation,
runtime answer checks, deterministic scoring, attempt-slot reservation, D1
`BEFORE INSERT` status and expiry guards, database-clock evaluation, error cause
classification, localized closed/expired responses, bounded slot recounts,
teacher results, and privacy. Its aggregate summary must not expose internal
trigger markers, identity keys, attempt numbers, submission keys, student names,
anonymous tokens, or answer text.
`src/assignments/submission-lifecycle-continuity-chain.ts` owns this source
contract without rendering database race metadata in public runner responses.
Student progress counts, browser submission payloads, and incomplete-submit
decisions should be derived from shared assignment-domain helpers, not
per-template route math, so every runner counts answered items, submits frozen
runtime item ids, and prompts for partial attempts consistently.
The post-submit result boundary should also stay shared from scored-attempt
persistence through public feedback, assignment stats, teacher result analysis,
a 30-slice attempt review card handoff, copy artifacts, CSV export, and printable
review return links. The attempt review card handoff keeps prepared slices for
student display, submitted time, score and answer summaries, snapshot-ordered
answers, statuses, accepted alternatives, explanations, filters, copy/export
scope, and privacy guards connected without exposing answer text or teacher-only
answers in the scored-result chain summary.
The attempt persistence continuity chain should carry the existing persistence
handoff as a 30-slice source-level contract across submission gates, normalized
identity, frozen runtime validation, scoring, assignment/attempt/time fields,
immutable answer and result JSON, sanitized public feedback, teacher analysis,
statistics, CSV export, and privacy. Its aggregate summary must not expose
attempt ids, student names, anonymous tokens, runtime ids, answer text, teacher
answers, raw submission payloads, source-material metadata, or CSV data URLs.
`src/assignments/attempt-persistence-continuity-chain.ts` owns this source
contract while `buildScoredAttemptInsert` remains the sole attempt-row shape
builder.
`src/assignments/attempt-review-card-chain.ts` owns the
attempt-review-card chain as a 30-slice source-level contract from
scored-attempt persistence and answer review summaries through prepared card
rows, review filters, copy scope, CSV export boundaries, printable review
alignment, and privacy guards.
Student runner submission surfaces should expose those prepared progress,
payload, submit-readiness, identity, result, review-summary, feedback-scope,
and post-submit next-step views as stable semantic label/value/description
outputs, so students and assistive technology receive the same submission
state without exposing student names, answer text, anonymous tokens, or
teacher-only answers in the pre-submit payload summary.
`src/assignments/student-runner-submission-chain.ts` owns the
student-runner-submission chain as a 30-slice source-level contract for
progress, payload, submit-readiness, identity, timer, result, review-summary,
feedback-scope, next-step, and privacy alignment.
Pure assignment-domain helpers should have fast script-level coverage so core
submission semantics can be verified without depending on the local Workers
E2E runtime.
Student runners should surface completion progress before submission. If a
student tries to submit with unanswered items, the app asks for an explicit
second confirmation instead of silently submitting blanks; this preserves
teacher flexibility for partial attempts while reducing accidental empty
homework.
Timed assignments should start the student attempt clock only after the
assignment payload and playable runtime items are available in the runner, so
page loading time does not consume the student's timer or inflate submitted
duration. Attempt duration is still submitted by the browser, but the server
normalizes it before scoring and persistence: negative or fractional values are
rounded into whole non-negative seconds, and timed assignments cap stored
duration at the assignment timer so teacher averages and CSV exports are not
distorted by abnormal client clocks. Student timer badges, submitted attempt
times, result-page averages, and per-attempt rows should format durations
through assignment-domain helpers so time displays stay consistent.
The attempt duration continuity chain should carry the existing duration
handoff as a 30-slice source-level contract across playable runner readiness,
clock start and tick plans, browser elapsed time, server normalization, timer
caps, scored-attempt persistence, student result feedback, teacher result rows,
aggregate statistics, and CSV export. Its aggregate summary must not expose
clock-origin timestamps, student labels, anonymous tokens, prompts, runtime item
ids, answer text, teacher answer keys, or CSV data URLs.
`src/assignments/attempt-duration-continuity-chain.ts` owns this source
contract without replacing the localized duration handoff or the shared
`src/attempts/duration.ts` core.
Answer scoring is centralized and tolerant of case, spacing, and common
punctuation differences. Teachers can use `/` or `;` inside an answer field to
define acceptable alternatives without changing the student submission
contract. Accepted alternatives are revealed only in the post-submit review when
the assignment allows correct-answer reveal. Student review feedback should use
the same shared presentation across quiz, fill-blank, listening, line-match,
matching-pairs, group-sort, and open-box templates so accepted alternatives and
answer explanations do not disappear in template-specific runners. Quiz runtime
can deterministically fill missing multiple-choice distractors from sibling
answers and vocabulary so teacher-entered questions remain playable before AI
distractor generation is connected.

Teacher results should answer the classroom question, not just report a score.
The results API analyzes frozen runtime items and stored attempt answers to
produce per-item correct rates, reteach priorities, item-level attempt reviews,
student-level follow-up summaries, answer explanations from the assignment
snapshot, accepted answer alternatives, and attempt duration metrics. Accepted
alternatives must use the same parser as scoring and student post-submit
review, especially for fill-blank, listening, and future open-answer templates.
Teachers can export the same private result data to CSV for gradebooks, parent
follow-up, or offline analysis. CSV exports should include the assignment
delivery policy, including identity mode, answer reveal, shuffle, attempts,
timer, close time, and instructions, so offline records preserve the rules
behind each result. Item rows should include both the primary expected answer
and any accepted alternatives. Result pages and CSV exports should share
assignment-domain formatting for submitted dates and accepted-answer
alternatives so teacher-facing tables, review cards, and offline records stay
consistent. This keeps the results loop useful for deciding what to explain
again after homework.
The submitted-date continuity chain should explicitly carry the copy artifact
handoff as 30 slices spanning classroom and review scope, four teacher copy
artifacts, latest-attempt details, last-submitted and duration context, priority
ordering, artifact previews, normalized copy lines, and privacy. Its aggregate
summary must not expose raw completed-at values, student labels or names,
anonymous tokens, student answers, copy artifact text, or CSV data URLs.
The accepted-answer continuity chain should explicitly carry the result review
handoff as 30 slices spanning review status and next steps, search and sort
controls, answer-review filters, matched and copy scope, copy previews, CSV
actions, route state, current-review and full-export boundaries, and privacy.
Its aggregate summary must not expose prompts, runtime item ids, student
answers, student names, teacher answers, or CSV data URLs.
The explanation continuity chain should explicitly carry the result material
handoff as 30 slices spanning current review scope, matched result counts, copy
actions and previews, CSV preparation and answer columns, worksheet and answer
key printing, current-review and full-assignment data scopes, snapshot sources,
and privacy. Its aggregate summary must not expose prompts, runtime item ids,
student answers, student names, teacher explanation text, or CSV data URLs.
Assignment attempt metrics such as completions, average accuracy, average
points, and average duration should be computed through shared assignment-domain
stats helpers before they reach assignment lists, result pages, classroom
briefs, or CSV exports.
The attempt statistics continuity chain should carry the existing attempt-stats
handoff as a 30-slice source-level contract across completed scored attempts,
timer-aware duration normalization, score and earned-points fallbacks, numeric
guards, assignment lists, result pages, classroom briefs, copy artifacts, CSV
exports, and privacy. Its aggregate summary must not expose student labels,
anonymous tokens, prompts, runtime item ids, answer text, accepted answers,
teacher answer keys, share slugs, copy artifact text, or CSV data URLs.
`src/assignments/attempt-stats-continuity-chain.ts` owns this source contract
without replacing the localized hidden semantic attempt-stats handoff.
Result metric cards, current review-status summaries, review-scope summaries,
classroom-brief coverage, and copy-scope previews should expose the same
prepared result-domain labels, values, descriptions, and accessible labels as
stable semantic outputs so teachers can verify the current review evidence
before copying reteach artifacts or exporting results.
Printable worksheet pages should do the same for handout overview chips,
student/date/score and delivery fields, answer-key access state, item response
help, choice banks, writing areas, teacher-only answer-key details,
return-to-results links, and print controls, so paper handoffs remain
reviewable without depending on visual badges alone.
The worksheet-mode delivery chain should explicitly carry this printable
worksheet handoff as 30 slices spanning handout overview, student fields,
response planning, choice-bank and writing-area coverage, answer lines,
assignment and delivery context, answer-key access and details, results return,
print action, route/public-runner boundaries, and privacy. Its aggregate summary
must not expose prompt, choice, answer-key, student-response, student-identity,
or source-material storage-key text.
The printable worksheet review lifecycle chain should explicitly carry the
30-slice printable worksheet handoff so handout overview, response planning,
assignment and delivery context, answer-key access, results return, print
controls, route boundaries, and privacy remain connected to teacher result
review. Its independent 30-file gate should continue to verify result actions,
teacher-only print routes, frozen snapshot rendering, answer-key states,
navigation, and export alignment without replacing that paper handoff contract.
The local persisted browser journey should complete this same teacher loop in
one data set: save an activity, publish an assignment, submit a student attempt,
review and filter the result, copy a classroom brief, download the full CSV,
open the printable worksheet, explicitly include the teacher answer key, and
return to results. It should verify the result-material, result-review,
copy-artifact, and printable-worksheet 30-slice handoffs in the rendered DOM so
the source contracts remain connected to the real Activity -> Assignment ->
Attempt -> Results workflow.
`src/config/local-persisted-browser-journey-chain.ts` keeps that real browser
loop as a 30-slice source-level contract across local e2e account isolation,
teacher auth, activity save, assignment publish, student runner submission,
result filters, copy/CSV actions, printable worksheet answer-key state,
return-to-results navigation, browser health, and privacy guards.
The teacher result page should show the student summary, the top reteach
priorities, and the full item performance table so a teacher can scan the
class before opening individual student answers. The full item performance
table can keep snapshot order or sort by lowest accuracy, submitted count, or
item type for different review passes. Teachers can search result
views by normalized student display label, including anonymous student labels,
so summary rows, attempt rows, and answer review cards stay aligned without
exposing raw anonymous tokens. Answer review cards can also switch between all
submissions and submissions with at least one missed item, with the focused view
stored in the URL for repeat review passes. Student summaries can be sorted by
review need, best score, student name, attempt volume, or most recent
submission so teachers can choose the scan order that matches grading,
reteaching, participation follow-up, or the newest homework handoff.
Result-page search, sort, and review-filter rules belong in assignment-domain
helpers so teacher tables, copied artifacts, and future API views do not drift
from the same normalized student labels, submission timing, and item
performance ordering.
Teachers can also view and copy a compact classroom brief that combines
assignment-level metrics, the three lowest-performing submitted items, and the
students who most need follow-up. The brief is teacher-only result data
generated from the frozen assignment snapshot and stored attempts; it does not
change the public student runner or expose raw anonymous tokens. Teachers can
copy a text reteach plan built from the lowest-correct-rate items and student
follow-up summaries, giving them a quick classroom script without exporting a
spreadsheet. They can copy the full item review summary separately when they
need a prompt-by-prompt artifact for lesson planning, team review, or parent
follow-up. They can also copy a student follow-up summary sorted by review need
so individual support lists can move into teacher notes without exposing raw
anonymous tokens.

## AI Authoring

AI-assisted creation drafts teacher-reviewable `CreateActivityInput` payloads.
The AI layer must not bypass the activity editor or persist content directly.
The AI authoring chain should explicitly carry the 30-slice deterministic
fallback draft chain across missing credentials, invalid provider JSON, source
sanitization, material-note omission, safe provenance, term planning, complete
classroom fields, CreateActivityInput mapping, metadata and readiness previews,
editor application, teacher review, save and publish boundaries, and provider
secret guards. Its aggregate summary must not expose raw source text, material
notes, file ids, storage keys, provider output, answer text, or API tokens.
Teachers should always see and edit the generated title, learning goal,
vocabulary, questions, answer explanations, pairs, groups, and notes before
saving. AI draft responses should also expose a lightweight coverage summary:
question, pair, group, vocabulary, and teacher-note counts plus ready template
families from the deterministic remix plan. They should also expose the same
per-template ready/locked diagnosis used by the editor and activity library, so
teachers can see which game modes are immediately playable and which missing
structured fields block a remix before saving. The editor should keep draft
provenance visible, including provider, model, and fallback notice, so teachers
can review generated content with the right level of trust. This helps teachers
judge whether a draft is ready for Wordwall-style remixes before they publish
anything.
When teachers attach source materials to an activity draft, AI draft source
notes may include only safe material provenance such as material kind and safe
filename basenames. The AI draft flow must not read file bytes, storage keys,
URLs, path segments, query tokens, or permission metadata until a dedicated
extraction pipeline is designed.
The AI source panel should also expose its safety note, source readiness,
attached-material extraction readiness, and synced material provenance as
semantic descriptions of the source textarea and generate action, so teachers
using assistive technology receive the same review-before-save context as
visual users.

Current flow:

```txt
Teacher source notes -> AI draft service -> CreateActivityInput -> Editor -> Save Activity
```

Future AI enhancement work follows the same execution boundary: template
transforms, distractor generation, leveled variants, answer explanations,
listening scripts, and worksheet extraction may propose `CreateActivityInput`
or `ActivityContent` edits, but they remain draft/editor-reviewed work. They
must not create assignment links, mutate existing assignment snapshots, read
source-material file bytes or storage keys, expose raw provider output, or add
answer keys to public student payloads.

Implementation boundaries:

- `src/ai/` owns provider helpers such as Cloudflare Workers AI REST calls.
- `src/activities/ai-draft.ts` owns classroom-specific prompt, schema, parsing,
  fallback, and mapping into `CreateActivityInput`.
- `src/activities/draft-meta.ts` owns AI draft coverage, review checklist, and
  template readiness metadata derived from teacher-reviewable activity input.
- `src/activities/draft-source.ts` owns the source-text priority used when the
  editor seeds or refreshes AI draft notes from existing structured content.
- `src/activities/template-remix.ts` owns deterministic template readiness and
  remix suggestions. AI remixing should build on this module instead of
  duplicating template requirement logic in UI code.
- `src/activities/distractors.ts` owns deterministic quiz choice completion.
  AI distractor generation should write into the same question option structure
  instead of changing the student submission contract.
- `src/activities/ai-enhancement-policy.ts` owns the shared request policy
  for future AI enhancements before they enter the editor-reviewed draft flow:
  teacher-auth gates, deterministic readiness, structured draft targets,
  source-material capability counts, provider/fallback posture, save/publish
  boundaries, snapshot protection, public-payload guards, and result-export
  continuity.
- `src/activities/ai-enhancement-execution.ts` owns the structured execution
  plan that turns the shared policy decision into provider-ready,
  local-fallback, deterministic-draft, or blocked states while preserving
  editor-only draft targets, structured blocked reasons, provider-call
  boundaries, privacy guards, save/publish boundaries, and snapshot protection.
  Its final boundary explicitly carries the 30-slice request-policy handoff so
  teacher authentication, source readiness, deterministic prechecks, structured
  targets, provider posture, editor review, save/publish isolation, snapshot
  protection, and public-payload privacy cannot be skipped during execution.
- `src/activities/ai-enhancement-draft-output.ts` owns parsed AI enhancement draft output
  before editor application: provider/fallback/deterministic output source
  tracking, CreateActivityInput parsing, normalized output counts, template
  readiness previews, raw-output/source-material privacy guards,
  editor-application boundaries, snapshot protection, and result continuity.
- `src/activities/ai-enhancement-draft-application.ts` owns the editor-only draft application
  contract after execution planning: CreateActivityInput validation,
  field-target coverage, refreshed draft metadata, template readiness,
  source-provenance counts, teacher-review/save/publish boundaries, privacy
  guards, snapshot protection, and result-export continuity. Its final boundary
  explicitly carries the 30-slice parsed draft-output handoff so provider,
  fallback, and deterministic outputs cannot skip parsing, schema validation,
  normalized coverage, readiness previews, editor-only targeting, or private
  output and source-material guards before application.
- `src/activities/ai-enhancement-editor-review.ts` owns the teacher review gate
  after draft application and before manual save: review checklist coverage,
  reviewed/missing check counts, manual-save readiness, editor-only boundaries,
  publish blocking, snapshot protection, public-payload guards, and private
  draft/source-material privacy. Its final boundary explicitly carries the
  30-slice editor-only draft-application handoff so invalid or incomplete
  application plans cannot bypass CreateActivityInput validation, field-target
  coverage, refreshed readiness, source privacy, or save/publish isolation when
  entering teacher review.
- `src/activities/ai-enhancement-save-boundary.ts` owns the manual save boundary
  after teacher review: teacher save actions, create/edit save plans,
  activity-id gates, manual persistence boundaries, activity-record targets,
  publish blocking, snapshot protection, result continuity, and private
  draft/source-material privacy. Its final boundary explicitly carries the
  30-slice teacher editor-review handoff so incomplete checklists, invalid draft
  applications, hidden source details, or missing teacher confirmation cannot
  reach create/edit persistence, assignment publishing, or snapshot mutation.
- `src/activities/ai-enhancement-publish-boundary.ts` owns the assignment publish boundary
  after a reviewed AI enhancement draft is saved: saved activity records,
  teacher publish actions, assignment publish preflight, share-link creation
  boundaries, snapshot freezing, public-payload guards, result continuity, and
  private draft/source-material privacy. Its final boundary explicitly carries
  the 30-slice manual-save handoff so review completion alone cannot publish:
  a persisted activity record, saved activity id, valid assignment preflight,
  and explicit teacher publish action remain required before creating a link or
  freezing a new snapshot.
- `src/activities/ai-enhancement-lifecycle-chain.ts` owns the full AI enhancement lifecycle handoff
  from request policy through execution, parsed draft output, editor
  application, teacher review, manual save, saved activity records, assignment
  publish actions, share-link and snapshot boundaries, public-payload guards,
  privacy guards, and result-export continuity. The AI enhancement roadmap
  explicitly carries these 30 lifecycle slices so future transforms,
  distractors, variants, explanations, listening scripts, and extraction paths
  cannot bypass blocked reasons, editor-only draft targets, teacher review,
  manual save, explicit publish, frozen snapshots, sanitized public payloads,
  or result exports. Its final boundary explicitly carries the 30-slice core
  assignment-publish handoff so AI-enhanced activities return to the shared
  publish access, validation, delivery settings, review checklist, snapshot
  freeze, public-payload, result-policy, and privacy contracts instead of
  creating an AI-specific assignment path.
- `src/activities/ai-fallback-draft-chain.ts` owns the deterministic AI
  fallback draft chain for missing Workers AI credentials, invalid provider
  JSON, sanitized source-term planning, local classroom draft completion,
  teacher review, and save/publish boundaries. It explicitly carries the
  30-slice authoring/library chain so fallback drafts remain inside shared
  create and edit contracts, teacher-owned persistence and library management,
  lifecycle gates, publish access, and assignment snapshot protection without
  exposing raw editor input, answers, teacher notes, filenames, file ids, or
  storage keys.
- `src/api/activity-ai.ts` exposes the authenticated server function.
- `src/components/activities/activity-create-form.tsx` only collects draft
  inputs and fills the existing form.

If Workers AI credentials are missing or model output is not valid JSON, the
service returns a deterministic local draft so local development and CI remain
stable. The fallback draft generator is a product-domain contract, not throwaway
demo code: it should still produce teacher-reviewable questions, pairs, groups,
vocabulary, notes, and remix readiness from the teacher's source material.
Production should still configure `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` as Worker secrets.

## Near-Term Template Roadmap

The template roadmap capability chain should explicitly carry the 30-slice
authoring/library chain across public template entries, the shared create and
edit contract, persistence, owner-scoped library search and filters, readiness
summaries, derivative drafts, archive and restore gates, publish access, and
assignment snapshot protection. Its aggregate summary must not expose prompts,
answers, teacher notes, raw editor input, source-material filenames, file ids,
or storage keys, and it must not create assignment links without teacher action.

- Wordwall-style: quiz, match-up, group sort, matching pairs, open box.
- Liveworksheets-style: fill blanks, worksheet layout, first listening prompts,
  drag/drop classification, line matching, teacher audio upload, printable
  follow-up, and worksheet extraction while preserving the activity-assignment
  data model.
- AI enhancements: source-to-activity drafts, template transforms, distractor
  generation, leveled variants, answer explanations, listening scripts, and
  worksheet extraction from teacher-uploaded material.
