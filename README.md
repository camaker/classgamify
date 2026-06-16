# Lang Study

A language learning application built with TanStack Start and Cloudflare
Workers. The production domain is <https://getlangstudy.com>.

The first learning track focuses on Chinese characters. The product is
structured to grow into additional languages over time.

This project is based on the
[TanStarter](https://tanstarter.dev) SaaS template.

## Documentation

The template documentation is available at
[docs.tanstarter.dev](https://docs.tanstarter.dev/docs).

## Development

```bash
pnpm dev
```

The development server runs on <http://localhost:3000>.

## Deployment

Pushes to `main` deploy through GitHub Actions via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). The workflow runs
locale checks, Biome checks, a production build, and then `wrangler deploy`.

Configure these GitHub Actions secrets before the first deploy:

- `VITE_BASE_URL`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_DATABASE_ID`

The Cloudflare token must be able to deploy Workers, read/write Workers Assets,
read D1, read R2, and manage the custom domains in `wrangler.jsonc`.

Runtime secrets such as `BETTER_AUTH_SECRET`, OAuth keys, mail keys, payment
keys, and webhook secrets belong in Cloudflare Worker secrets. Copy
[.env.production.example](.env.production.example) to `.env.production`, fill in
the real values, then run `pnpm sync-worker-secrets` after the Worker exists.
Use `pnpm sync-github-secrets` only after installing and logging into the GitHub
CLI.

## License

For template license details, see [LICENSE](LICENSE).
