# ClassGamify Product Architecture

ClassGamify is a teacher-first activity and assignment platform inspired by
Wordwall and Liveworksheets. The core product is not a generic AI worksheet
demo: teachers create reusable activity content, render it through game-like
templates, publish assignments, and review student attempts.

## Product Loop

```txt
Activity -> Assignment -> Attempt -> Results
```

- `Activity` is the teacher-owned reusable content object.
- `ActivityContent` is template-neutral lesson material: questions, pairs,
  groups, vocabulary, learning goal, and teacher notes.
- `ActivityTemplate` is a runtime renderer and scoring strategy for that
  content, such as quiz, match-up, group sort, fill blank, matching pairs, or
  open box.
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

The activity editor should make the selected template legible. When teachers
choose quiz, match-up, group sort, matching pairs, fill-blank, or open-box, the
editor shows the required content type and can load a template-specific scaffold
that fills the matching structured fields. Scaffolds are examples, not hidden
templates; teachers still review and edit before saving.

Publishing an assignment is an explicit configuration step. Teachers choose the
assignment title, whether to collect student names, whether students see correct
answers after submission, whether items are shuffled, and the per-student
attempt limit. These settings live on `Assignment.settingsJson`; immutable
content lives on `AssignmentSnapshot`.

Public student links must return a sanitized assignment payload. The browser
receives runtime prompts and choices, not `ActivityContent` with embedded
answers. Correct answers are returned only after an attempt is scored and only
when the assignment allows answer reveal. Anonymous assignments use a browser
token so max-attempt limits still work without collecting student names.

Student runners should use the runtime item kind to choose the interaction:
multiple-choice questions, match-up pairs, and group-sort items render as
tap/click choices, while fill-blank and open-box prompts can still accept typed
answers. The submission contract remains template-neutral: every renderer
stores `{ itemId, answer }` so scoring and result analysis stay shared.

Teacher results should answer the classroom question, not just report a score.
The results API analyzes frozen runtime items and stored attempt answers to
produce per-item correct rates, reteach priorities, and item-level attempt
reviews. This keeps the results loop useful for deciding what to explain again
after homework.

## AI Authoring

AI-assisted creation drafts teacher-reviewable `CreateActivityInput` payloads.
The AI layer must not bypass the activity editor or persist content directly.
Teachers should always see and edit the generated title, learning goal,
vocabulary, questions, pairs, groups, and notes before saving.

Current flow:

```txt
Teacher source notes -> AI draft service -> CreateActivityInput -> Editor -> Save Activity
```

Implementation boundaries:

- `src/ai/` owns provider helpers such as Cloudflare Workers AI REST calls.
- `src/activities/ai-draft.ts` owns classroom-specific prompt, schema, parsing,
  fallback, and mapping into `CreateActivityInput`.
- `src/api/activity-ai.ts` exposes the authenticated server function.
- `src/components/activities/activity-create-form.tsx` only collects draft
  inputs and fills the existing form.

If Workers AI credentials are missing or model output is not valid JSON, the
service returns a deterministic local draft so local development and CI remain
stable. Production should still configure `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` as Worker secrets.

## Near-Term Template Roadmap

- Wordwall-style: quiz, match-up, group sort, matching pairs, open box.
- Liveworksheets-style: fill blanks, worksheet layout, listening prompts,
  drag/drop classification, line matching.
- AI enhancements: source-to-activity drafts, template transforms, distractor
  generation, leveled variants, answer explanations, listening scripts, and
  worksheet extraction from teacher-uploaded material.
