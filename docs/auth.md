# Auth module

Authentication is built on [Better Auth](https://www.better-auth.com/). The server uses D1 (Drizzle) with email verification and password reset via the Mail module. The client uses `better-auth/react`'s `createAuthClient`, integrated with TanStack Start via `tanstackStartCookies`.

---

## Directory structure

```
src/auth/
├── auth.ts        # Server: betterAuth instance (DB, email, social, plugins)
├── auth-client.ts # Client: createAuthClient + plugins (admin, apiKey, inferAdditionalFields)
└── auth-types.ts  # Session / User types inferred from auth
```

**Related (outside `src/auth/`):**

- **API route**: `src/routes/api/auth/$.ts` — forwards GET/POST to `auth.handler(request)`.
- **Session helpers**: `src/lib/session.ts` — `requireSession(request)`, `unauthorizedResponse(message)`.
- **Middleware**: `src/middleware/auth-middleware.ts`, `src/middleware/admin-middleware.ts`.
- **Routes**: `src/routes/auth.tsx` (layout), `src/routes/auth/login.tsx`, `src/routes/auth/register.tsx`; error redirect uses `/auth/error`.
- **Components**: `src/components/auth/` (login-form, register-form, forgot-password-form, auth-card, error-card, login-wrapper, etc.).
- **Hooks**: `src/hooks/use-auth.ts` — `useUserAccounts`, `useHasCredentialProvider`.

---

## Server (auth.ts)

- **baseURL**: From `getBaseUrl()` (build-time `VITE_BASE_URL`).
- **database**: `drizzleAdapter(getDb(), { provider: 'sqlite' })`. `getDb()` (from `@/db`) uses the Worker's **`env.DB`** D1 binding.
- **session**: Cookie cache enabled; `expiresIn` / `updateAge` / `freshAge` configured; freshness check disabled to allow user deletion.
- **emailAndPassword**:
  - Enabled when `websiteConfig.auth.enableCredentialLogin` is true.
  - `requireEmailVerification: true`.
  - `sendResetPassword`: calls Mail module `sendEmail({ template: 'forgotPassword', ... })`.
- **emailVerification**:
  - `sendVerificationEmail`: calls `sendEmail({ template: 'verifyEmail', ... })`.
  - `autoSignInAfterVerification: true`.
- **socialProviders**: Google when `websiteConfig.auth.enableGoogleLogin` and `serverEnv.GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set.
- **account**: Account linking enabled when Google login is enabled; trusted provider `google`.
- **user**: `deleteUser.enabled: true`.
- **plugins**:
  - `tanstackStartCookies()` — cookies/session with TanStack Start on Cloudflare.
  - `admin()` — user management, ban/unban, roles; `bannedUserMessage` and optional `defaultBanExpiresIn`.
  - `apiKey()` — API key management for users.
  - `emailHarmony()` — email normalization/validation; `allowNormalizedSignin: false`.
- **onAPIError**: `errorURL: '/auth/error'`; optional `onError` logging.

All email sending goes through the Mail module (no direct Resend dependency).

---

## Client (auth-client.ts)

- `createAuthClient({ baseURL: getBaseUrl(), plugins: [adminClient(), apiKeyClient(), inferAdditionalFields<typeof auth>()] })` exported as **`authClient`**.
- Typical usage:
  - `authClient.useSession()` — current session (includes user with role when admin plugin is used).
  - `authClient.signIn.email()`, `authClient.signUp.email()`, `authClient.signOut()`.
  - `authClient.updateUser({ name, image })` — e.g. profile/avatar.
  - `authClient.listAccounts()` — used by `useUserAccounts` in `use-auth.ts`.

Requests go to `baseURL + /api/auth/*` and are handled by `auth.handler`.

---

## Session checks for protected APIs

- **`src/lib/session.ts`**:
  - **`requireSession(request)`**: calls `auth.api.getSession({ headers: request.headers })`, returns session or `null`.
  - **`unauthorizedResponse(message?)`**: returns 401 JSON `{ error: message }` (default `"Unauthorized"`).

APIs that require a logged-in user (e.g. `/api/storage/upload`, `/api/admin/users`) call `const session = await requireSession(request)` and return `unauthorizedResponse()` when `session` is null.

---

## Route protection (middleware)

- **authMiddleware** (`src/middleware/auth-middleware.ts`): Requires an authenticated user; redirects to `Routes.Login` when there is no session. Use in route definitions via `server: { middleware: [authMiddleware] }` (e.g. dashboard, settings).
- **adminMiddleware** (`src/middleware/admin-middleware.ts`): Requires `session.user.role === 'admin'`; redirects to login if not signed in, otherwise to dashboard if not admin. Use on admin routes (e.g. `/admin/users`).

---

## Configuration and environment

- **websiteConfig.auth** (`src/config/website.ts`): `enable`, `enableGoogleLogin`, `enableCredentialLogin`.
- **D1**: Configure `d1_databases` in `wrangler.jsonc` with binding name **`DB`**; `getDb()` uses `env.DB`.
- **Mail**: Verification and password reset depend on the Mail module; configure `RESEND_API_KEY`, `mail.fromEmail`, etc. (see [Mail](./mail.md)).
- **Google OAuth**: Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in server env (see [Env](./env.md)).

---

## Database tables

Better Auth tables are defined in **`src/db/auth.schema.ts`**: `user` (with `role`, `banned`, `banReason`, `banExpires`, `normalizedEmail`), `session`, `account`, `verification`, `apikey`. Schema is re-exported from `src/db/schema.ts`. Migrations and Drizzle usage are described in the [DB module](./db.md).
