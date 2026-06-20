## Design Context

### Product

ClassGamify is a teacher-first classroom activity platform inspired by
Wordwall and Liveworksheets. Teachers create reusable structured activity
content, render it through game-like templates, publish student assignment
links, and use scored attempts to decide what to reteach next.

The product should feel useful today as an operational teaching tool, not like
a generic SaaS landing page or an AI worksheet demo. Template depth, student
playability, assignment delivery settings, and result review are the core
experience.

### Users

**Primary teachers:** Classroom teachers, tutors, and homeschooling parents who
need to turn lesson content into fast, repeatable activities and homework links
without rebuilding the same material in separate tools.

**Students:** Children and learners who should understand the activity, answer
quickly, see progress, and review feedback without seeing answer keys before
submission.

**School operators and buyers:** Teachers, tutoring studios, families, and
small learning teams deciding whether reusable templates, assignment links,
AI-assisted drafting, and results exports save enough preparation time to pay
for.

### Product Principles

1. **Teacher Loop First**
   Core screens should lead to creating, editing, publishing, previewing, or
   reviewing an activity. Avoid marketing-first screens that explain the idea
   while delaying the actual create-publish-play-results loop.

2. **One Content Model, Many Templates**
   UI copy and controls should reinforce that a teacher's activity can become a
   quiz, match-up, line match, group sort, fill-blank worksheet, listening
   prompt, matching-pairs board, or open-box game. Template-specific UI is
   welcome, but it should not imply separate content silos.

3. **Delivery Rules Must Be Visible**
   Assignment settings are part of the product contract. Attempts, timer, close
   time, student identity mode, answer reveal, shuffle, and instructions should
   be visible before publishing and easy to verify after a link is created.

4. **Student Runners Protect Answers**
   Public play pages should feel focused and friendly, but never expose teacher
   content internals or answer keys before submission. Review states can show
   correct answers and explanations only when the assignment allows it.

5. **Results Drive Reteaching**
   Teacher result pages should answer "what should I explain again?" before
   showing raw data. Reteach priorities, item performance, student follow-up,
   classroom briefs, and exports are teaching workflows, not decorative
   analytics.

6. **AI Is A Reviewable Assistant**
   AI-generated content should land in the same editor contract as manual
   creation. Draft provenance, coverage, and template readiness must stay
   visible so teachers trust, revise, and own the material before saving.

### Brand Personality

**Three words:** Practical, energetic, trustworthy.

**Voice and tone:**

- Direct and work-focused for dashboards, settings, validation, and exports.
- Encouraging but not childish for student runners and completion states.
- Specific about activities, templates, assignment links, attempts, and
  reteaching when those are the real product surfaces.
- Honest about what is playable now, what is AI-assisted, and what still needs
  teacher review.

### Visual Direction

**Overall feel:** A polished teaching workspace with moments of classroom
energy. The teacher dashboard should be dense and scannable; student runners can
be more playful, tactile, and obvious.

**Layout density:** Operational surfaces such as activity libraries,
assignment lists, publish dialogs, and result pages should prioritize compact
comparison and repeated action. Public product pages can breathe more, but must
surface real product workflows early.

**Shape language:** Use the existing 8px-ish radius system. Avoid nested cards,
large pill-shaped blocks, and decorative floating sections. Cards are for
individual repeated items, modals, and framed tools, not for every page section.

**Color:** Use neutral surfaces as the base with functional accent colors for
template families, status, correctness, selection, and review urgency. Avoid a
one-note purple, beige, blue-slate, or brown/orange product theme.

**Typography:** Use the existing Bricolage Grotesque setup. Keep dashboards,
tables, cards, dialogs, and runner controls tighter than hero copy. Do not
scale font size with viewport width.

**Icons:** Use Tabler icons for concrete tools and actions: create, copy,
publish, preview, shuffle, timer, close, export, sort, filter, archive, restore,
and review. Prefer icon-plus-label buttons where the command matters.

### Page Standards

**Home**

- Show the Wordwall-style loop: choose a template, edit activity content,
  publish a link, students play, teacher reviews results.
- Primary actions should route to templates or activity creation.
- Avoid inherited language-learning, handwriting, or skeleton-only positioning.

**Templates**

- Each template card should explain the classroom mode and required structured
  content.
- Template starts should route into `/create?template=...` with that template
  selected.
- Locked or not-ready template states should name the missing content type, not
  use vague disabled labels.

**Create and Activity Editor**

- The selected template, required content, scaffold option, readiness preview,
  and AI draft provenance should be visible near the editor flow.
- Validation should tell the teacher what content is missing and why that
  matters for the selected template.
- Editing and duplication should feel like protecting the original activity and
  any published assignment snapshots.

**Activity Library**

- Support scanning, search, template filtering, status filtering, pagination,
  archive/restore, duplicate, publish, and ready remix actions.
- Archived activities should clearly explain that publishing, duplication, and
  remixes require restore first.
- Template readiness badges should distinguish the current template from
  compatible remix targets.

**Publish Assignment**

- The publish dialog must make delivery settings legible before the assignment
  snapshot is frozen.
- Summaries should include attempts, timer, close time, identity mode, answer
  reveal, shuffle, and instructions.
- Copy/open link actions should be obvious and safe for real classroom
  distribution.

**Student Runner**

- The runner should adapt to template content: choices for quiz/match-up,
  columns for line match, inline blanks for fill-blank, track controls for
  listening, boxes for open-box, category placement for group sort, and
  left/right cards for matching pairs.
- Progress and unanswered-item confirmation should reduce accidental empty
  submissions.
- Anonymous assignments should explain that work is tied to the current browser
  and show a short browser label, without exposing raw tokens.

**Results**

- Lead with classroom interpretation: completions, accuracy, average time,
  reteach priorities, and students needing follow-up.
- Item performance, answer review, student summaries, copyable briefs, reteach
  plans, and CSV export should all use the same frozen assignment snapshot.
- Filters and sorts should preserve teacher intent in the URL when useful.

**Worksheets**

- Treat worksheet-style fill-in, line matching, listening, and printable
  practice as activity templates within the assignment model.
- On-screen controls may be dense; printable output should be clean,
  classroom-ready, and free of navigation or app chrome.

**Pricing**

- Tie paid value to concrete teacher workflows: reusable activities, more
  templates, AI draft volume, assignment links, results exports, and team or
  classroom scale.
- Payment state should be calm and transparent: sign-in requirement, hosted
  checkout, plan limits, and billing management.

**Legal and Trust**

- Privacy, terms, and cookie pages should describe live ClassGamify data
  surfaces: activities, assignment links, student attempts, browser identity,
  AI drafts, uploaded worksheet material, exports, accounts, payments, and
  support.
- Avoid copied references to unrelated learning products or inherited domains.

### Responsive And QA Standards

- Every public and authenticated product surface should be checked at mobile,
  tablet, and desktop widths.
- No page may horizontally overflow at 375px wide.
- Long labels such as "Student follow-up summary" and "Matching pairs" must
  wrap gracefully in cards, filters, dialogs, and buttons.
- Fixed-format UI elements such as template boards, student runners, toolbars,
  counters, timers, cards, and tables need stable dimensions so hover states and
  dynamic text do not resize the layout.
- Public student links must be inspected for accidental answer exposure before
  submission whenever runner UI changes.
- After meaningful visual changes, verify rendered pages with browser
  screenshots or equivalent layout checks, including console errors and obvious
  network failures.
