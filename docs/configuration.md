# ClassGamify Configuration Boundary

ClassGamify configuration should describe the current classroom product loop:
teachers create activities, publish assignments, students complete attempts,
and teachers review results. Configuration examples should not drift back to
copied SaaS-starter, course-site, or generic AI demo language.

Use this page as the index for environment ownership, Cloudflare bindings,
runtime secrets, and provider setup before a production launch.

```txt
Activity -> Assignment -> Attempt -> Results
```

## Deployment Ownership

Cloudflare Git integration owns production builds and deploys. The connected
Cloudflare Workers project builds pushes to `main`, then deploys the Worker.
This repository intentionally does not contain a GitHub Actions deploy workflow,
and production configuration should not require GitHub repository secrets.

Run `pnpm predeploy` locally before release pushes. That gate covers locale
checks, Biome checks, and the production build. Use `pnpm deploy` only for a
manual Cloudflare Workers deployment when the project owner explicitly chooses
that path.

## Build-Time Values

`VITE_*` values are build-time inputs. They are read by Vite during
`pnpm dev`, `pnpm build`, or the Cloudflare build, then inlined into the client
bundle. They should cover public configuration only:

- `VITE_BASE_URL` for the ClassGamify site origin and assignment links.
- `VITE_PAYMENT_PROVIDER` plus Stripe price IDs or Creem product IDs for
  pricing and checkout surfaces.
- Analytics, support chat, and other browser-visible integration IDs.

Do not put secrets in `VITE_*` variables, and do not expect `VITE_*` values to
become Worker runtime secrets after deployment.

## Runtime Secrets

Worker runtime secrets belong in Cloudflare Worker secrets. They protect server
functions that create teacher activities, publish assignment links, score
student attempts, render result exports, send mail, process payments, and create
teacher-reviewed AI drafts.

Required or optional runtime secrets include:

- `BETTER_AUTH_SECRET` for teacher workspace sessions.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google OAuth.
- `RESEND_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_API_TOKEN` for
  mail or Cloudflare Email Service.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CREEM_API_KEY`, and
  `CREEM_WEBHOOK_SECRET` for payment providers.
- Provider credentials used by AI drafting, notifications, and newsletter
  integrations when those features are enabled.

Cloudflare owns these production secrets. Keep `.env.local` and
`.env.production` local or build-only, and never commit real credentials.

## Data Bindings

ClassGamify data storage is provided by Cloudflare bindings, not generic
environment variables.

- D1 uses the `DB` binding. It stores Better Auth rows, teacher-owned
  activities, assignment snapshots, attempts, payment records, and result
  review data.
- R2 uses the `BUCKET` binding. It stores teacher-managed source materials such
  as audio, worksheet images, worksheet documents, spreadsheets, and avatar
  files.

Student assignment payloads should expose sanitized runtime prompts, choices,
timers, and submission rules. They should not expose teacher source-material
lists, R2 keys, storage URLs, payment metadata, OAuth metadata, or server-only
provider settings.

## Auth And Workspace Access

Authentication gates the teacher workspace. Better Auth uses the D1 `DB`
binding and runtime secrets to protect saved activities, assignment links,
source materials, attempts, and results.

Google OAuth callback examples should use the ClassGamify domain, for example
`https://classgamify.example/api/auth/callback/google`. Login and recovery copy
should describe teacher workspace access, not a starter-template account shell.

## Mail And Newsletter

Mail configuration supports verification email, password reset, contact form
delivery, newsletter subscription, and classroom-product updates. Sender
examples should use ClassGamify addresses and subjects should describe teacher
workspace actions such as saved activities, assignment links, student
attempts/results, and teacher-reviewed AI drafts.

Newsletter provider credentials should be treated as runtime secrets when the
provider requires private API keys.

## Payment Providers

Payment configuration controls plan access for ClassGamify capabilities:
activity creation, assignment publishing, AI draft assistance, file-backed
source materials, and teacher result-review workflows.

Stripe and Creem both require build-time product identifiers for public pricing
surfaces and runtime secrets for checkout, portals, and webhooks. Webhooks must
update the owner-scoped payment state without broadening access to another
teacher's activities, assignments, attempts, or results.

## AI Drafting

AI-assisted activity creation is a teacher-reviewed draft workflow. Provider
credentials are runtime-only. Prompts should receive sanitized classroom
content and safe source-material provenance, not raw R2 keys, signed URLs,
private file paths, OAuth identifiers, or payment metadata.

The AI path should end in an editable activity draft. It should not publish an
assignment or expose student-facing runtime items without teacher review.

## E2E And Local Accounts

E2E helpers are local-first and disabled outside the guarded local test mode.
Use accounts scoped to `e2e-*@example.test`. Test setup should create only the
teacher, activity, assignment, attempt, and result data needed for the journey.

Before release or larger refactors, update `tests/e2e/TEST-CATALOG.md`, walk the
real UI locally when available, and run the relevant Playwright specs.

## Configuration Checklist

- `README.md` points deploy owners to this configuration boundary.
- `docs/env.md` explains build-time values versus Worker runtime secrets.
- `docs/auth.md` ties auth secrets to teacher workspace protection.
- `docs/mail.md` keeps transactional examples in ClassGamify classroom terms.
- `docs/payment.md` ties checkout setup to activity, assignment, AI, and result
  capabilities.
- `docs/storage.md` documents the R2 source-material boundary.
- `.env.example` and `.env.production.example` use ClassGamify placeholders.
- `wrangler.jsonc` owns D1 and R2 bindings for the Worker.
