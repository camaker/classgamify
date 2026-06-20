# Locale

This project uses Paraglide JS for runtime locale support.

## Locales

- Base locale: `en`
- Additional locale: `zh`
- Default English URLs are unprefixed: `/about`
- Chinese URLs use a prefix: `/zh/about`

## Files

- Source messages: `project.inlang/messages/en.json` and `zh.json`
- Paraglide settings: `project.inlang/settings.json`
- Generated runtime: `src/locale/paraglide/`
- Project locale helpers: `src/lib/locale.ts`
- Server middleware wrapper: `src/locale/middleware.ts`

Markdown content stays in the same collection directory. English content uses
the base filename, while localized variants add the locale before `.md`:

```txt
content/blog/wordwall-style-activity-loop.md
content/blog/wordwall-style-activity-loop.zh.md
content/blog/assignment-links-without-lms.md
content/blog/assignment-links-without-lms.zh.md
content/changelog/v1.0.0.md
content/changelog/v1.0.0.zh.md
content/pages/privacy.md
content/pages/privacy.zh.md
```

`content-collections.ts` strips the `.zh` suffix from the route slug, so
`wordwall-style-activity-loop.md` and
`wordwall-style-activity-loop.zh.md` both map to
`/blog/wordwall-style-activity-loop` under their respective URL locale.

`src/locale/paraglide/` is generated code and is ignored by git.

## Commands

```bash
pnpm locale:sort      # sort message keys by prefix/name in all locale JSON files
pnpm locale:check     # verify en/zh key parity and JSON leaf values
pnpm locale:compile   # compile Paraglide runtime manually
```

`pnpm dev` and `pnpm build` also compile the Paraglide runtime via Vite.

## Message Access

Application code reads messages directly from the generated Paraglide module:

```ts
import { m } from '@/locale/paraglide/messages';

m.auth_login_email();
```

`project.inlang/messages/*.json` is the single source of UI and email message
truth. Do not add parallel TS message source files or nested compatibility
layers.

When a server-side workflow must always render in English, pass an explicit
locale option:

```ts
m.mail_verify_email_subject(undefined, { locale: 'en' });
```

Small arrays and record-like values, such as pricing feature lists, are stored
as JSON strings in Paraglide messages and parsed through `parseMessageJson()`
in `src/lib/locale.ts`.

Structured UI content, such as homepage, template directory, activity creation,
assignment list, result review, AI draft, and roadmap copy, should use
individual message keys in `project.inlang/messages/*.json` when it is part of
the localized UI contract. Do not store a whole page or block tree as one
JSON-string message. Components should call the generated flat `m.key()`
functions directly. If a component needs a list, define that list in the
component and use `m.key()` for the translatable fields.

## Adding Copy

- Short UI copy: add the same key to `project.inlang/messages/en.json` and
  `project.inlang/messages/zh.json`, run `pnpm locale:sort`, then call the
  generated `m.key()`.
- Email copy: add the key to the JSON files and read it through
  `m.key(undefined, { locale: 'en' })`.
- Homepage, template, activity, assignment, result, AI draft, or roadmap
  structured copy: add or update individual message keys in the JSON files,
  then call the generated `m.key()` functions directly from the component.
- Long-form content: add Markdown files, for example `post.md` and
  `post.zh.md`.

## Current Scope

The current implementation supports:

- Runtime UI messages through `@/locale/paraglide/messages`
- Homepage blocks through direct `m.key()` calls
- ClassGamify auth, dashboard shell, public navigation, and shared components
  through direct `m.key()` calls
- ClassGamify product routes may still contain transitional hard-coded copy;
  when touching those surfaces, move durable UI strings into Paraglide message
  keys instead of adding new parallel localization systems
- AI draft and roadmap UI through direct `m.key()` calls where localized
  messages already exist
- Blog Markdown content with locale-aware content collections
- Changelog Markdown content with locale-aware content collections
- Legal Markdown pages with locale-aware content collections
- Locale-aware canonical, hreflang, and sitemap output

The current implementation intentionally does not handle:

- User profile locale storage
- Email locale
