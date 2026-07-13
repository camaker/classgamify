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
activity authoring/library workflow, source extraction lifecycle boundaries,
activity lifecycle governance, template roadmap capability alignment,
AI enhancement lifecycle review,
published assignment delivery, student runner play, student identity lifecycle,
validated attempts, scored attempt results, answer feedback lifecycle,
submitted-date continuity, accepted-answer continuity, and explanation
continuity, teacher result review, teacher result copy lifecycle, printable
worksheet review lifecycle, copy/export/print handoffs, dashboard status,
public discovery/indexing metadata, and privacy guards aligned with this
sequence.

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
`src/config/classroom-trust-communication-chain.ts` absorbs that
transactional mail lifecycle alongside public contact intake, auth workspace
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
Activity library filter parsing and search normalization should also live in
activity-domain helpers so URL state, dashboard controls, and list API queries
share the same activity status and template-family rules.
Teachers can soft-archive activities from the active library and restore them
later from an archived view. Archiving hides an activity from the default
library and prevents casual republishing, but it does not delete structured
content or alter existing assignment snapshots. Archived activities cannot be
published, duplicated, or remixed into another template until they are restored;
this rule is enforced by server functions, not only by dashboard buttons.
Activity lifecycle governance should flow through shared domain helpers across
library cards, edit access, publish dialogs, duplicate/remix draft creation, and
server functions, so UI affordances and backend enforcement keep the same
restore-before-derive contract.

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
Student progress counts, browser submission payloads, and incomplete-submit
decisions should be derived from shared assignment-domain helpers, not
per-template route math, so every runner counts answered items, submits frozen
runtime item ids, and prompts for partial attempts consistently.
The post-submit result boundary should also stay shared from scored-attempt
persistence through public feedback, assignment stats, teacher result analysis,
copy artifacts, CSV export, and printable review return links.
Student runner submission surfaces should expose those prepared progress,
payload, submit-readiness, identity, result, review-summary, feedback-scope,
and post-submit next-step views as stable semantic label/value/description
outputs, so students and assistive technology receive the same submission
state without exposing student names, answer text, anonymous tokens, or
teacher-only answers in the pre-submit payload summary.
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
Assignment attempt metrics such as completions, average accuracy, average
points, and average duration should be computed through shared assignment-domain
stats helpers before they reach assignment lists, result pages, classroom
briefs, or CSV exports.
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
- `src/activities/ai-enhancement-draft-output.ts` owns parsed AI enhancement draft output
  before editor application: provider/fallback/deterministic output source
  tracking, CreateActivityInput parsing, normalized output counts, template
  readiness previews, raw-output/source-material privacy guards,
  editor-application boundaries, snapshot protection, and result continuity.
- `src/activities/ai-enhancement-draft-application.ts` owns the editor-only draft application
  contract after execution planning: CreateActivityInput validation,
  field-target coverage, refreshed draft metadata, template readiness,
  source-provenance counts, teacher-review/save/publish boundaries, privacy
  guards, snapshot protection, and result-export continuity.
- `src/activities/ai-enhancement-editor-review.ts` owns the teacher review gate
  after draft application and before manual save: review checklist coverage,
  reviewed/missing check counts, manual-save readiness, editor-only boundaries,
  publish blocking, snapshot protection, public-payload guards, and private
  draft/source-material privacy.
- `src/activities/ai-enhancement-save-boundary.ts` owns the manual save boundary
  after teacher review: teacher save actions, create/edit save plans,
  activity-id gates, manual persistence boundaries, activity-record targets,
  publish blocking, snapshot protection, result continuity, and private
  draft/source-material privacy.
- `src/activities/ai-enhancement-publish-boundary.ts` owns the assignment publish boundary
  after a reviewed AI enhancement draft is saved: saved activity records,
  teacher publish actions, assignment publish preflight, share-link creation
  boundaries, snapshot freezing, public-payload guards, result continuity, and
  private draft/source-material privacy.
- `src/activities/ai-enhancement-lifecycle-chain.ts` owns the full AI enhancement lifecycle handoff
  from request policy through execution, parsed draft output, editor
  application, teacher review, manual save, saved activity records, assignment
  publish actions, share-link and snapshot boundaries, public-payload guards,
  privacy guards, and result-export continuity.
- `src/activities/ai-fallback-draft-chain.ts` owns the deterministic AI
  fallback draft chain for missing Workers AI credentials, invalid provider
  JSON, sanitized source-term planning, local classroom draft completion,
  teacher review, and save/publish boundaries.
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

- Wordwall-style: quiz, match-up, group sort, matching pairs, open box.
- Liveworksheets-style: fill blanks, worksheet layout, first listening prompts,
  drag/drop classification, line matching, teacher audio upload, printable
  follow-up, and worksheet extraction while preserving the activity-assignment
  data model.
- AI enhancements: source-to-activity drafts, template transforms, distractor
  generation, leveled variants, answer explanations, listening scripts, and
  worksheet extraction from teacher-uploaded material.
