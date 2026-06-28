# ClassGamify

ClassGamify is a teacher-facing, game-based classroom activity platform built
with TanStack Start and Cloudflare Workers.

The product direction is Wordwall and Liveworksheets for classroom workflows:
teachers create reusable structured activities, render them through focused
game or worksheet templates, publish assignment links for students, and review
attempt results. AI-assisted activity creation builds on top of this
activity-to-assignment foundation rather than bypassing teacher review.

The codebase began from a SaaS starter template, so inherited surfaces should
be retired in narrow, verified waves. Current product behavior is defined by
[docs/product.md](docs/product.md), and UI/product decisions should also follow
[docs/design.md](docs/design.md).

```txt
Activity -> Assignment -> Attempt -> Results
```

## Core Product Model

- `Activity`: teacher-owned reusable activity definition.
- `ActivityTemplate`: rendering/game type such as quiz, match-up, group sort,
  line-match, fill-blank, listening, matching pairs, or open-box.
- `ActivityContent`: template-neutral structured lesson content.
- `Assignment`: shareable classroom delivery instance.
- `AssignmentSnapshot`: frozen activity content for an already shared link.
- `Attempt`: student completion/submission session.
- `AttemptResult`: score, accuracy, completion, and duration summary.

## Key Source Areas

- `src/activities`: template catalog, validation, runtime item generation,
  scaffolds, remix readiness, and AI draft mapping.
- `src/assignments`: assignment settings, share links, lifecycle, public
  payloads, submission rules, scoring/results, exports, and review summaries.
- `src/routes`: TanStack Router routes for public pages, teacher dashboards,
  public student runners, and API endpoints.
- `src/db`: Drizzle schemas and migrations for auth, activities, assignments,
  snapshots, attempts, files, and payments.
- `tests/e2e`: local-first Playwright acceptance journeys.
- `scripts/test-domain.ts`: fast domain contract checks for activity and
  assignment helpers.

## Development

```bash
pnpm dev
```

The development server runs on <http://localhost:3000>.

Useful checks:

```bash
pnpm test:domain
pnpm locale:check
pnpm check
pnpm build
pnpm e2e
```

For user-facing changes, update `tests/e2e/TEST-CATALOG.md` with the journey,
implement the feature, walk the UI locally when the Workers runtime is
available, then add or update the matching Playwright spec. Keep fast domain
logic covered in `scripts/test-domain.ts`.

## Deployment

Cloudflare Workers is the production build and deploy system. Pushes to `main`
are built by the connected Cloudflare project, and this repository intentionally
does not include a GitHub Actions deploy workflow so GitHub does not run a
second install/build/deploy path.

Run `pnpm predeploy` locally before pushing release-ready changes. It covers
locale checks, Biome checks, and the production build.

Create ClassGamify Cloudflare resources before production deployment, then
update `wrangler.jsonc` with the real D1 database ID and any final custom
domains. The old copied-project domain is intentionally not bound here.

Runtime secrets such as `BETTER_AUTH_SECRET`, OAuth keys, mail keys, payment
keys, webhook secrets, and AI provider keys belong in Cloudflare Worker secrets.
Copy [.env.production.example](.env.production.example) to `.env.production`,
fill in the real values, then run `pnpm sync-worker-secrets` after the Worker
exists.

## License

See [LICENSE](LICENSE).
