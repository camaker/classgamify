# MkFast Template

A full-stack web template built with **TanStack Start**, **React 19**, and **Vite**, deployable to **Cloudflare**. It includes authentication (Better Auth), content-driven pages (Content Collections), newsletter, contact form, and marketing blocks—ready to customize and ship.

---

## Features

- **TanStack Start** – File-based routing, SSR, API routes, server functions
- **Better Auth** – Email/password and social login (Google, GitHub), session management
- **Content Collections** – Markdown-based blog and static pages (About, Terms, Privacy, Cookie Policy)
- **Newsletter** – Resend/Beehiiv integration with subscribe API and welcome emails
- **Contact** – Contact form with email delivery via Resend
- **Marketing UI** – Hero, features, pricing, FAQ, testimonials, CTA, footer (configurable via `src/config/website.ts`)
- **Shadcn UI** – Base UI + Radix primitives, Tailwind CSS, dark/light theme
- **Icons** – Tabler Icons (`@tabler/icons-react`)
- **Database** – Drizzle ORM with Cloudflare D1 (optional)
- **Deploy** – `pnpm deploy` for Cloudflare Workers/Pages

---

## Tech Stack

| Layer        | Technology                    |
| ------------ | ----------------------------- |
| Framework   | TanStack Start (React 19, Vite 7) |
| Styling     | Tailwind CSS v4, tw-animate   |
| UI          | Shadcn, Base UI, Radix UI     |
| Auth        | Better Auth                   |
| Content     | Content Collections (Markdown)|
| Mail        | Resend                        |
| Newsletter  | Resend or Beehiiv             |
| Database    | Drizzle ORM, Cloudflare D1    |
| Lint/Format | Biome                        |
| Deploy      | Cloudflare (Wrangler)         |

---

## Project Structure

```
├── content/                    # Markdown content (Content Collections)
│   ├── blog/                   # Blog posts
│   └── pages/                  # Static pages (about, terms, privacy, cookie)
├── content-collections.ts      # Content Collections config (blog + pages)
├── src/
│   ├── api/                    # Server functions (TanStack Start)
│   │   ├── users.ts            # listUsers (admin), user management
│   │   └── newsletter.ts       # getNewsletterStatus, subscribe, unsubscribe
│   ├── auth/                   # Better Auth
│   │   ├── auth.ts             # Server: betterAuth instance (DB, email, social, plugins)
│   │   ├── client.ts           # Client: createAuthClient + plugins (admin, apiKey)
│   │   └── types.ts            # Session, SessionUser inferred from auth
│   ├── config/                 # App configuration
│   │   ├── website.ts          # Main site config (features, mail, newsletter, auth, storage)
│   │   ├── navbar-config.ts    # Navbar links
│   │   ├── footer-config.ts   # Footer links
│   │   ├── sidebar-config.ts  # Dashboard sidebar links
│   │   ├── price-config.ts    # Pricing plans
│   │   └── avatar-config.ts   # Avatar provider config
│   ├── routes/                 # File-based routes (TanStack Router)
│   │   ├── __root.tsx          # Root layout
│   │   ├── index.tsx           # Home
│   │   ├── auth.tsx            # Auth layout
│   │   ├── auth/               # login, register, forgot-password, reset-password, error
│   │   ├── blog/               # Blog list + post by slug
│   │   ├── (pages)/            # about, contact, waitlist, changelog, roadmap
│   │   ├── (legals)/           # terms, privacy, cookie (Markdown)
│   │   ├── dashboard.tsx      # Dashboard layout
│   │   ├── dashboard/          # Dashboard index, data
│   │   ├── settings.tsx        # Settings layout
│   │   ├── settings/           # profile, security, notifications, apikeys, files
│   │   ├── admin.tsx           # Admin layout
│   │   ├── admin/              # users, index
│   │   └── api/                # auth/$, storage (upload, file)
│   ├── components/
│   │   ├── layout/             # Navbar, footer, container, sidebar, dashboard, theme
│   │   ├── blocks/             # Marketing sections (hero, features, pricing, newsletter, etc.)
│   │   ├── blog/               # BlogCard, BlogGrid, pagination
│   │   ├── page/               # MarkdownPage (legal/content pages)
│   │   ├── contact/            # ContactFormCard
│   │   ├── waitlist/           # WaitlistFormCard
│   │   ├── auth/               # Login/register forms, auth card, error card
│   │   ├── admin/              # Users table, user detail viewer
│   │   ├── settings/           # Profile, security, notifications, apikeys, files
│   │   ├── ui/                 # Shadcn UI primitives
│   │   ├── shared/             # UserButton, UserAvatar, logo, etc.
│   │   ├── data-table/         # DataTable components
│   │   └── ...
│   ├── db/                     # Drizzle ORM + D1
│   │   ├── index.ts            # getDb(), re-exports schema
│   │   ├── schema.ts           # Merged schema (auth + app)
│   │   ├── auth.schema.ts      # Better Auth tables (user, session, account, verification, apikey)
│   │   ├── app.schema.ts       # App tables (e.g. userFiles)
│   │   ├── types.ts            # User, ApiKey, UserFiles ($inferSelect)
│   │   └── migrations/         # Drizzle migrations
│   ├── env/                    # Type-safe env (T3 Env)
│   │   ├── client.ts           # clientEnv (VITE_* build-time)
│   │   └── server.ts           # serverEnv (runtime secrets)
│   ├── lib/                    # Utilities and data helpers
│   │   ├── blog.ts             # getPostBySlug, getPaginatedPosts
│   │   ├── pages.ts            # getPageBySlug
│   │   ├── urls.ts             # getBaseUrl, getCanonicalUrl
│   │   ├── routes.ts           # Central route constants (Routes.*)
│   │   ├── formatter.ts        # formatDate, etc.
│   │   └── utils.ts            # cn, etc.
│   ├── mail/                   # Email templates (Resend) and render
│   ├── middleware/             # auth-middleware, admin-middleware
│   ├── newsletter/             # Newsletter providers (Resend, Beehiiv)
│   ├── storage/                # R2 upload, delete, client helpers
│   ├── types/                  # index.d.ts (WebsiteConfig, etc.)
│   ├── messages/              # i18n (en.ts, etc.)
│   └── hooks/                  # use-auth, use-users, use-apikeys, use-newsletter, etc.
├── public/
├── .env.local.example
├── .env.production.example
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Install and run

```bash
pnpm install
cp .env.local.example .env.local   # then set BETTER_AUTH_SECRET, etc.
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build and preview

```bash
pnpm build
pnpm preview
```

### Deploy to Cloudflare

```bash
pnpm deploy
```

Uses `wrangler` and the Cloudflare Vite plugin; ensure Cloudflare account and `wrangler.toml` / env are set.

---

## Configuration

### Website config

Main config lives in `src/config/website.ts`. You can toggle:

- **Blog** – `blog.enable`, `blog.paginationSize`
- **Newsletter** – `newsletter.enable`, `newsletter.provider` (resend | beehiiv)
- **Mail** – `mail.provider`, `mail.fromEmail`, `mail.supportEmail`
- **Auth** – `auth.enableGoogleLogin`, `auth.enableCredentialLogin`
- **UI** – `ui.mode.defaultMode` (dark/light), theme switch
- **Metadata** – `metadata.images`, `metadata.social` (links for footer/navbar)

Navbar and footer links are driven by `src/config/navbar-config.ts` and `src/config/footer-config.ts` (they respect `blog.enable`, `docs.enable`, etc.).

### Environment variables

- Copy `.env.local.example` to `.env.local` and set:
  - `BETTER_AUTH_SECRET` – required for auth (e.g. `npx @better-auth/cli secret`)
  - `RESEND_API_KEY` – for mail and newsletter (if using Resend)
  - Database and other provider keys as needed (see examples).

Production: use `.env.production.example` as a reference and set vars in your Cloudflare project (e.g. Secrets).

---

## Content Collections

Content is defined in `content-collections.ts` and consumed via the generated `content-collections` module.

### Collections

- **blog** – `content/blog/*.md` (title, description, date, category, content, image, author, avatar)
- **pages** – `content/pages/*.md` (title, description, date?, content) for About and legal pages

### Usage in code

```ts
import { allBlogs } from 'content-collections';
import { getPostBySlug, getPaginatedPosts } from '@/lib/blog';
import { getPageBySlug } from '@/lib/pages';
```

Routes:

- `/blog` – list of posts (with pagination)
- `/blog/:slug` – single post
- `/about` – custom About layout (no Markdown)
- `/terms`, `/privacy`, `/cookie` – rendered from `content/pages/*.md` with `PageMarkdown`

### Adding a blog post

Create `content/blog/your-post.md` with frontmatter:

```yaml
---
title: Your Title
description: Short description
date: 2025-01-15
category: General
author: Your Name
avatar: https://...
image: https://...   # optional
---

Your markdown body...
```

### Adding or editing legal pages

Edit or add Markdown under `content/pages/` (e.g. `terms-of-service.md`, `privacy-policy.md`, `cookie-policy.md`). The route slug is derived from the filename (e.g. `terms-of-service` → `/terms`, `cookie-policy` → `/cookie` via `getPageBySlug('cookie-policy')`).

---

## Scripts

| Script            | Description                    |
| ----------------- | ------------------------------ |
| `pnpm dev`        | Start dev server (port 3000)   |
| `pnpm build`      | Production build               |
| `pnpm preview`    | Preview production build       |
| `pnpm deploy`     | Build and deploy (Cloudflare)  |
| `pnpm test`       | Run Vitest tests               |
| `pnpm check`      | Biome check                    |
| `pnpm lint`       | Biome check --write            |
| `pnpm format`     | Biome format --write           |
| `pnpm db:generate`| Drizzle: generate migrations   |
| `pnpm db:push`    | Drizzle: push schema            |
| `pnpm db:studio:local` | Drizzle Studio (local)    |
| `pnpm db:migrate:local` | D1 migrations (local)     |
| `pnpm db:migrate:remote`| D1 migrations (remote)   |
| `pnpm cf-typegen` | Wrangler types for Env         |

---

## Auth (Better Auth)

1. Set `BETTER_AUTH_SECRET` in `.env.local` (e.g. `npx @better-auth/cli secret`).
2. Database: D1 is configured in `src/auth/auth.ts` via `drizzleAdapter(getDb(), { provider: 'sqlite' })`. Run migrations with `pnpm db:generate` and `pnpm db:migrate:local` or `pnpm db:migrate:remote`.

Auth routes: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/error`.  
API proxy: `src/routes/api/auth/$.ts` (forwards to Better Auth handler).  
Session/types: `src/auth/client.ts` (authClient), `src/auth/types.ts` (Session, SessionUser). See [docs/auth.md](docs/auth.md).

---

## Mail and contact

- **Mail** – Resend in `src/mail/` (templates: contact, newsletter welcome, forgot password, verify email).
- **Contact form** – `sendContactMessage` server function in `src/api/contact.ts`. Sends to `websiteConfig.mail.supportEmail` using the contact template.

---

## Newsletter

- **Server functions** – `src/api/newsletter.ts`: `getNewsletterStatus`, `subscribeNewsletter`, `unsubscribeNewsletter`. Uses Resend or Beehiiv per `websiteConfig.newsletter`.
- **Hooks** – `use-newsletter.ts`: `useNewsletterStatus`, `useSubscribeNewsletter`, `useUnsubscribeNewsletter`.
- **UI** – Homepage and Waitlist use `NewsletterCard`; Settings → Notifications uses `NewsletterFormCard` (logged-in users). See [docs/newsletter.md](docs/newsletter.md).

---

## Shadcn UI

Add new components with:

```bash
pnpm dlx shadcn@latest add <component>
```

Config: `components.json`. Path alias: `@/*` → `src/*`.

---

## Linting and formatting

Biome is used for lint and format:

```bash
pnpm check    # check only
pnpm lint     # check and apply fixes
pnpm format   # format code
```

---

## Demo pages

The `src/routes/demo/` folder contains example pages (TanStack Table, Store, TanStack Query). They are optional; you can remove the demo route files and any references in your layout/nav if you don’t need them.

---

## Learn more

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [Better Auth](https://www.better-auth.com)
- [Content Collections](https://content-collections.dev)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
