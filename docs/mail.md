# Mail module

Transactional email (verification, password reset, contact form, subscription welcome). **Resend** and **Cloudflare Email Service** are the built-in providers. Design allows adding other providers via a provider registry without changing callers.

**Consumers:** Auth (`sendVerificationEmail`, `sendResetPassword`), contact form (`sendContactMessage` in `src/api/contact.ts`), newsletter subscribe — all use `sendEmail(...)` only.

For production secret ownership and the ClassGamify classroom configuration
boundary around transactional mail, see [Configuration](./configuration.md).

---

## Directory structure

```
src/mail/
├── index.ts           # sendEmail, getMailProvider, getTemplate; providerRegistry
├── types.ts           # EmailTemplate, MailProviderName, Send*Params, MailProvider
├── locale.ts          # mail locale normalization and message options
├── render.ts          # getTemplate, renderEmailHtml, toPlainText; getEmailSubject
├── provider/
│   ├── resend.ts      # ResendProvider implements MailProvider
│   └── cloudflare.ts  # CloudflareProvider implements MailProvider
├── templates/
│   ├── verify-email.tsx
│   ├── forgot-password.tsx
│   ├── subscribe-newsletter.tsx
│   └── contact-message.tsx
├── components/
│   ├── email-layout.tsx
│   ├── email-workspace-boundary.tsx
│   └── email-button.tsx
└── workspace-boundary.ts # shared teacher-workspace boundary view
```

---

## Configuration

| Source | Key | Description |
|--------|-----|-------------|
| `websiteConfig.mail` | `provider` | `'resend'` or `'cloudflare'`. Extend in `src/types/index.d.ts` when adding providers. |
| | `fromEmail` | Sender address (required for sending). |
| | `supportEmail` | Used by contact form target. |
| Env var | `RESEND_API_KEY` | Required when using the Resend provider. |
| Env var | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID; required when using Cloudflare Email provider. |
| Env var | `CLOUDFLARE_API_TOKEN` | Cloudflare API token; required when using Cloudflare provider. |

---

## Providers

### Resend

Uses the [Resend](https://resend.com/docs) SDK. Requires `RESEND_API_KEY` env var.

```ts
// src/config/website.ts
mail: {
  enable: true,
  provider: 'resend',
  fromEmail: 'ClassGamify <support@classgamify.com>',
  supportEmail: 'ClassGamify <support@classgamify.com>',
}
```

### Cloudflare Email Service

Uses the [Cloudflare Email Service REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/). Works in any Node.js environment (Workers, CI/CD, scheduled scripts) — no Workers binding required.

**Prerequisites:**
1. Your domain must be using Cloudflare DNS.
2. Onboard your domain in the Cloudflare dashboard under **Email Sending**.
3. Create an API token with `com.cloudflare.api.token.Email.Send` permission in the Cloudflare dashboard.

**Environment variables:**

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

**Usage:**

```ts
// src/config/website.ts
mail: {
  enable: true,
  provider: 'cloudflare',
  fromEmail: 'ClassGamify <support@classgamify.com>',
  supportEmail: 'ClassGamify <support@classgamify.com>',
}
```

> **Note:** The `fromEmail` address must be on a verified domain in your Cloudflare account.

---

## API

| Export | Description |
|--------|-------------|
| **sendEmail(params)** | `SendTemplateParams` → render template + send; `SendRawEmailParams` → send raw. Returns `Promise<SendEmailResult>`. |
| **getMailProvider()** | Lazy-initialized provider from `websiteConfig.mail.provider`. |
| **getTemplate({ template, context })** | Normalizes optional `context.locale`, renders `{ html, text, subject }`, and passes the same locale into the template component and subject resolver. Used by providers internally. |

`context.locale` accepts the configured Paraglide locale values (`en`, `zh`).
Missing or unsupported values fall back to the base locale before rendering.

**Types (re-exported):** `EmailTemplate`, `MailProviderName`, `SendTemplateParams`, `SendRawEmailParams`.

---

## Templates

| Template | Context | Subject source |
|----------|---------|----------------|
| forgotPassword | `{ url, name, locale? }` | `mail_forgot_password_subject` |
| verifyEmail | `{ url, name, locale? }` | `mail_verify_email_subject` |
| subscribeNewsletter | `{ email?, locale? }` | `mail_subscribe_newsletter_subject` |
| contactMessage | `{ name, email, message, intent?, classroomInquiry?, locale? }` | `mail_contact_message_subject` |

Each transactional template renders the shared workspace boundary panel from
`src/mail/workspace-boundary.ts`, covering saved activities, assignment links,
student attempts/results, teacher-reviewed AI drafts, and safe source-material
provenance.

**Adding a template:** extend `EmailTemplate` in `types.ts` → add to `EmailTemplates` and `getEmailSubject` in `render.ts` → add React component under `templates/`. Any new visible subject, heading, body, or button copy must be added to the locale message files before it is used by the template.

---

## Adding a new mail provider

The module uses a **provider registry** (`providerRegistry` in `index.ts`). To add a new provider:

1. **Types** — In `src/types/index.d.ts`, extend `MailConfig.provider` union (e.g. `'resend' | 'cloudflare' | 'newprovider'`).
2. **Implementation** — Add `src/mail/provider/<name>.ts` implementing `MailProvider` (`sendTemplate`, `sendRawEmail`, `getProviderName`). Use `getTemplate` from `../render` for template-based sends.
3. **Registration** — In `src/mail/index.ts`, add a factory to `providerRegistry`: `newprovider: () => new NewProvider(...)`, reading provider-specific env/bindings inside.

Callers continue using `sendEmail(...)` only.

---

## Dependencies

- **resend** — Resend SDK (when using Resend provider).
- **React / react-dom/server** — Template rendering (`renderToReadableStream` or `renderToStaticMarkup`).
