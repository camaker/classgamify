# Localization expansion

## Target locales

The supported target is `en`, `zh`, `fr`, `de`, `ja`, `ko`, `it`, `es`,
`pt-BR`, and `ar`. Traditional Chinese is intentionally excluded. Use France
French, standard German, Japanese for Japan, Korean for Korea, neutral
international Spanish, Brazilian Portuguese, and Modern Standard Arabic.

Arabic pages must render right-to-left while activity content, class codes,
URLs, numbers, CSV fields, and other direction-sensitive data remain readable.

Privacy, terms, cookie, consent, billing, checkout, payment, subscription,
refund, child/student identity, recording, upload, notification, and
cross-device data commitments remain in English. The legal Markdown authority
is `content/pages/privacy.md`, `terms.md`, and `cookie.md`; do not create
localized legal Markdown files.

## Product voice and terminology

ClassGamify is a teacher-facing classroom activity platform. Translate complete
teacher and student workflows rather than isolated labels. The voice is calm,
practical, and classroom-specific.

- Keep `ClassGamify` in English as the product name.
- An `activity` is reusable teacher-authored content; an `assignment` is its
  published delivery to students. Do not collapse both into one generic task.
- An `attempt` is one student submission; `results` are what the teacher
  reviews. Preserve that distinction in every locale.
- A `template` controls how activity content is rendered. `Remix` creates a
  teacher-reviewable derivative; it does not silently replace the source.
- `Publish`, `share link`, `archive`, `restore`, `draft`, and `save` describe
  different lifecycle actions and must remain distinct.
- AI output is a draft that requires teacher review. Never translate it as an
  automatically published or authoritative answer.
- Do not expose private prompts, answers, teacher notes, filenames, file IDs,
  storage keys, or hidden audit terminology through localized public copy.

## Quality gates

Every enabled locale must match the complete English key set, preserve source
placeholders, keep JSON-valued messages valid, and contain no empty values.
Review complete namespaces in their real teacher or student page context before
enablement. Do not copy English values into target files to satisfy key counts.

Do not add a locale to Inlang or the locale switcher until the complete catalog
passes `pnpm locale:check`. After enablement, run `pnpm predeploy` and browser QA
for create, assignment publishing, the student runner, results, long-string
wrapping, and Arabic directionality.

Work-in-progress translations live under
`project.inlang/drafts/<locale>/<namespace>.json`. Each draft contains only a
complete product namespace, must preserve the English key set and placeholders
for that namespace, and must respect the English-only boundary patterns in
`project.inlang/localization-policy.json`. Drafts are promoted into
`project.inlang/messages/<locale>.json` only after every namespace is complete.
