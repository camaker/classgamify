# ClassGamify

ClassGamify is a teacher-facing, game-based classroom activity platform built
with TanStack Start and Cloudflare Workers.

The product direction is Wordwall-core: teachers create reusable activities,
render them through focused game templates, publish assignment links for
students, and review completion/results. AI-assisted activity creation will
build on top of this activity/assignment foundation.

This project is based on the
[TanStarter](https://tanstarter.dev) SaaS template.

For the current product architecture and AI authoring boundaries, see
[docs/product.md](docs/product.md).

## Core Product Model

- `Activity`: teacher-owned reusable activity definition.
- `ActivityTemplate`: rendering/game type such as quiz, match-up, group sort,
  fill-blank, matching pairs, or open-box.
- `ActivityContent`: template-neutral structured lesson content.
- `Assignment`: shareable classroom delivery instance.
- `Attempt`: student completion/submission session.
- `AttemptResult`: score, accuracy, completion, and duration summary.

## Development

```bash
pnpm dev
```

The development server runs on <http://localhost:3000>.

Useful checks:

```bash
pnpm locale:check
pnpm check
pnpm build
pnpm e2e
```

## Deployment

Pushes to `main` deploy through GitHub Actions via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). The workflow runs
locale checks, Biome checks, a production build, and then `wrangler deploy`.

Configure these GitHub Actions secrets before the first deploy:

- `VITE_BASE_URL`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_DATABASE_ID`

Create ClassGamify Cloudflare resources before production deployment, then
update `wrangler.jsonc` with the real D1 database ID and any final custom
domains. The old copied-project domain is intentionally not bound here.

Runtime secrets such as `BETTER_AUTH_SECRET`, OAuth keys, mail keys, payment
keys, webhook secrets, and AI provider keys belong in Cloudflare Worker secrets.
Copy [.env.production.example](.env.production.example) to `.env.production`,
fill in the real values, then run `pnpm sync-worker-secrets` after the Worker
exists. Use `pnpm sync-github-secrets` only after installing and logging into the
GitHub CLI.

## License

For template license details, see [LICENSE](LICENSE).
