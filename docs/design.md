## Design Context

### Product

Lang Study is a writing-practice product for language learners. The first
public track focuses on HSK1 Chinese characters: stroke order, guided tracing,
missed-stroke review, printable worksheets, and repeatable practice plans.

The product should feel useful today while leaving room for more languages and
writing systems later. Avoid copy, navigation, and UI structures that make the
site feel like a generic SaaS template or a single-purpose Chinese-only toy.

### Users

**Primary learners:** Adult beginners and self-study learners who want a clear
10-minute loop: watch the stroke order, trace the character, notice mistakes,
and know what to practice next.

**Teaching helpers:** Tutors, classroom teachers, and parents who need
printable assignments, repeatable handoff notes, and quick progress signals
without building their own worksheets every time.

**Buyers:** Learners, families, tutors, and small classroom operators deciding
whether the full HSK1 pack, saved lists, review history, and worksheet volume
are worth paying for.

### Product Principles

1. **Practice First**
   The first screen of core pages should lead to doing the work: trace,
   review, print, copy a plan, or choose the next character. Avoid marketing
   pages that explain the product while delaying the actual learning loop.

2. **Clear Next Step**
   Every learning surface should answer "what should I do next?" The answer
   may be online practice, missed-stroke review, paper practice, or course
   review. Avoid ambiguous dashboards and decorative metrics.

3. **Paper Is Part Of The Product**
   Worksheets are not a side export. Printed output must be clean,
   brand-attributed, useful across common paper sizes, and free of website
   chrome. On-screen worksheet controls can be dense, but print preview must
   look like a prepared teaching handout.

4. **Teacher And Parent Handoff**
   Copyable plans, assignment notes, and printed footers should make it easy
   for a tutor, parent, or student to continue later. The domain
   `getlangstudy.com` should appear where it creates useful attribution and
   referral value, especially in printable materials.

5. **Expandable, Not Generic**
   Keep language generality in the information architecture and copy where it
   matters, but make the current Chinese character experience specific and
   polished. Do not hide the actual launch product behind vague "learn any
   language" claims.

### Brand Personality

**Three words:** Calm, precise, encouraging.

**Voice and tone:**

- Direct and practical for controls, errors, pricing, and account surfaces.
- Warm but not childish for learning guidance.
- Specific about Chinese characters, HSK1, worksheets, and review when those
  are the actual product surfaces.
- Honest about what is live, what is paid, and what is planned.

### Visual Direction

**Overall feel:** Quiet learning workspace, not a decorative education landing
page. The UI should feel trustworthy enough for parents and teachers, but light
enough for a learner to use daily.

**Layout density:** Compact and scannable in operational tools such as
dashboard, worksheets, settings, and pricing. Marketing and roadmap pages can
use more breathing room, but should still expose real product workflows early.

**Shape language:** Use the existing 8px-ish radius system. Avoid nested cards,
large pill-shaped blocks, and decorative floating sections.

**Color:** Use neutral surfaces as the base with restrained functional color.
Do not let the interface collapse into a single purple, beige, blue-slate, or
brown/orange theme. Color should clarify state, selection, review urgency, or
print settings rather than decorate empty space.

**Typography:** Use the existing Bricolage Grotesque setup. Keep dashboard,
worksheet, and control text smaller and tighter than hero text. Do not scale
font size with viewport width.

**Icons:** Use Tabler icons for tool actions, worksheet controls, account
navigation, and dashboard steps. Prefer icons plus short labels for concrete
actions such as print, copy, review, practice, and settings.

### Page Standards

**Home**

- Show the actual learning loop above the fold.
- Avoid template screenshots and abstract product claims.
- Make the current HSK1 character workflow obvious, while mentioning future
  language expansion only as a supporting point.

**Learn and HSK pages**

- The primary action should be practice, review, or continue.
- Missed-stroke feedback should be visually close to the next action.
- Upgrade prompts should connect to concrete unlocked value: full HSK1,
  review history, saved lists, worksheets, and handoff workflows.

**Worksheets**

- Controls should be ergonomic for repeated use: character set, paper size,
  trace mode, feedback area, copy/share, and print.
- Print output must exclude navigation, footer, sidebars, buttons, and other
  website chrome.
- Printed footer/domain attribution should be useful and unobtrusive.

**Dashboard**

- Focus on today's plan, not vanity analytics.
- Surface review queue, next character, worksheet creation, and course path.
- Support copyable handoff text for teachers, parents, tutors, and learners.

**Pricing**

- Clearly distinguish free starter, Pro, and lifetime access.
- Tie each paid feature to a real learning or teaching workflow.
- Payment state should be calm and transparent: sign-in requirement, hosted
  checkout, plan limits, and billing management.

**Legal and Trust**

- Privacy, terms, and cookie pages should read like a live product, not a
  template.
- Be explicit about local progress, accounts, payment providers, email,
  storage, and future AI/provider integrations.

### Responsive And QA Standards

- Every public page should be checked at mobile, tablet, and desktop widths.
- No page may horizontally overflow at 375px wide.
- Long English strings such as "Review missed strokes" must wrap gracefully in
  cards and controls.
- Fixed-format UI elements such as practice canvases, worksheet previews,
  toolbars, and metrics need stable dimensions so hover states and dynamic text
  do not resize the layout.
- After visual changes, verify rendered pages with browser screenshots or
  equivalent layout checks, including console errors and obvious network
  failures.
