# ClassGamify Product Architecture

ClassGamify is a teacher-first activity and assignment platform inspired by
Wordwall and Liveworksheets. The core product is not a generic AI worksheet
demo: teachers create reusable activity content, render it through game-like
templates, publish assignments, and review student attempts.

## Product Loop

```txt
Activity -> Assignment -> Attempt -> Results
```

Copied-template surfaces should be retired in narrow, verified waves. Public
navigation and homepage entry points should point at ClassGamify templates,
creation, assignment links, and results before legacy learning routes are
deleted, because those old routes still share generated route-tree and locale
infrastructure.
Public roadmap and dashboard copy should describe the current usable
ClassGamify loop, not stale scaffold or skeleton milestones once those
capabilities are live.
The authenticated teacher dashboard should use owner-scoped activity and
assignment summaries for top metrics; starter/demo activities may appear as
preview content, but they must not be counted as the teacher's real library,
open links, or results.
Public policy pages are also product surfaces: terms, privacy, and cookie copy
must describe ClassGamify's teacher activity, public assignment link, student
attempt, results, and AI-draft data model instead of the copied learning-site
model.
Public editorial surfaces follow the same rule. Blog posts, release notes, and
their generated sitemap URLs should describe ClassGamify templates, assignments,
AI authoring, and teacher results instead of inherited course or handwriting
content.

- `Activity` is the teacher-owned reusable content object.
- `ActivityContent` is template-neutral lesson material: questions, pairs,
  groups, vocabulary, learning goal, answer explanations, and teacher notes.
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
template-readiness calculation instead of duplicating UI-only math.
Teachers can soft-archive activities from the active library and restore them
later from an archived view. Archiving hides an activity from the default
library and prevents casual republishing, but it does not delete structured
content or alter existing assignment snapshots. Archived activities cannot be
published, duplicated, or remixed into another template until they are restored;
this rule is enforced by server functions, not only by dashboard buttons.

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
the close-after time window lives on `Assignment`. Teacher-facing assignment
cards and result pages should summarize the full delivery policy: attempts,
timer, close time, student identity mode, answer reveal behavior, and item
order, so a teacher can verify a link's rules without reopening the publish
dialog. The publish dialog should show the same delivery preview before the
teacher creates the share link, so configuration mistakes are visible before an
assignment is frozen.
Teacher assignment pages should support the real distribution workflow:
teachers can open a student link for preview or copy the absolute `/play/:id`
URL from the assignment list and results page before sending it through a class
chat, LMS, or email. The assignment list should remain searchable as teachers
reuse the product across classes: teachers can filter their own assignments by
title, share id, source activity text, or assignment status without broadening
outside the current owner. It should also paginate from the same authenticated
list API so teachers with many class links can move through bounded result
pages without losing search or status filter state. Assignment list overview
cards summarize the full current filter result, not only the visible page, so
teachers can trust open-link counts, total completions, and average accuracy
while paging through a large class archive.
Teachers can close and reopen published assignment links without changing the
frozen snapshot, so public student access and submissions respect the assignment
lifecycle while existing attempts remain available for review. Assignment
status and expiry checks should flow through shared lifecycle helpers so
student access, teacher lists, and result pages agree on open, closed, and
expired states.

Public student links must return a sanitized assignment payload only while the
assignment is open. Closed or expired links do not expose runtime content, and
submissions against closed or expired links are rejected. The browser receives
runtime prompts and choices, not `ActivityContent` with embedded answers.
Correct answers are returned only after an attempt is scored and only when the
assignment allows answer reveal. Anonymous assignments use a browser token so
max-attempt limits still work without collecting student names.
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
Listening uses a browser-spoken track flow that hides the transcript until
review, then records the student's selected or typed answer against the same
question item. Group-sort uses a dedicated category board where students select
an item and place it into a group. Matching-pairs uses a dedicated left/right
card board so students can select a prompt and attach a choice without seeing
the answer map.
The submission contract remains template-neutral: every renderer stores
`{ itemId, answer }` so scoring and result analysis stay shared.
Student runners should surface completion progress before submission. If a
student tries to submit with unanswered items, the app asks for an explicit
second confirmation instead of silently submitting blanks; this preserves
teacher flexibility for partial attempts while reducing accidental empty
homework.
Timed assignments should start the student attempt clock only after the
assignment payload and playable runtime items are available in the runner, so
page loading time does not consume the student's timer or inflate submitted
duration.
Answer scoring is centralized and tolerant of case, spacing, and common
punctuation differences. Teachers can use `/` or `;` inside an answer field to
define acceptable alternatives without changing the student submission
contract. Accepted alternatives are revealed only in the post-submit review when
the assignment allows correct-answer reveal. Quiz runtime can deterministically
fill missing multiple-choice distractors from sibling answers and vocabulary so
teacher-entered questions remain playable before AI distractor generation is
connected.

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
and any accepted alternatives. This keeps the results loop useful for deciding
what to explain again after homework.
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
review need, best score, student name, or attempt volume so teachers can choose
the scan order that matches grading, reteaching, or participation follow-up.
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
families from the deterministic remix plan. The editor should keep draft
provenance visible, including provider, model, and fallback notice, so teachers
can review generated content with the right level of trust. This helps teachers
judge whether a draft is ready for Wordwall-style remixes before they publish
anything.

Current flow:

```txt
Teacher source notes -> AI draft service -> CreateActivityInput -> Editor -> Save Activity
```

Implementation boundaries:

- `src/ai/` owns provider helpers such as Cloudflare Workers AI REST calls.
- `src/activities/ai-draft.ts` owns classroom-specific prompt, schema, parsing,
  fallback, and mapping into `CreateActivityInput`.
- `src/activities/template-remix.ts` owns deterministic template readiness and
  remix suggestions. AI remixing should build on this module instead of
  duplicating template requirement logic in UI code.
- `src/activities/distractors.ts` owns deterministic quiz choice completion.
  AI distractor generation should write into the same question option structure
  instead of changing the student submission contract.
- `src/api/activity-ai.ts` exposes the authenticated server function.
- `src/components/activities/activity-create-form.tsx` only collects draft
  inputs and fills the existing form.

If Workers AI credentials are missing or model output is not valid JSON, the
service returns a deterministic local draft so local development and CI remain
stable. Production should still configure `CLOUDFLARE_ACCOUNT_ID` and
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
