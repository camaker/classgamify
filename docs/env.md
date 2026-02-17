# Environment Variables

本项目使用 **T3 Environment**（`@t3-oss/env-core`）做构建时与运行时的类型安全校验：

- **`clientEnv`**（`src/env/client.ts`）：仅客户端/构建时变量，前缀 `VITE_`，来源 `import.meta.env`。
- **`serverEnv`**（`src/env/server.ts`）：仅服务端变量，来源 `process.env`（Worker 的 vars/secrets 会注入其中）。

约定：**构建时** 用 `clientEnv`，**运行时** 用 `serverEnv`。部署目标为 Cloudflare Workers，且已开启 `nodejs_compat_populate_process_env`。

---

## 1. 构建时（clientEnv / `import.meta.env`）

在 **执行 `vite dev` 或 `vite build` 时** 由 Vite 从 `.env*` 读取并**替换**进代码，值会打进 bundle，**不会**在 Worker 运行时再读环境变量。

### 如何设置

| 场景 | 设置方式 |
|------|----------|
| 本地开发 `pnpm dev` | 在 **`.env.local`** 中定义（或使用代码中的默认值） |
| 生产构建 `pnpm build` | 在 **`.env.production`** 中定义，或在 **执行 build 的环境**（本机 / CI）里设置同名环境变量 |

只有以 **`VITE_`** 开头的变量会暴露给应用代码，其他变量仅在 Vite 配置中可用。

### 构建时变量列表

| 变量 | 用途 | 必填 | 说明 |
|------|------|------|------|
| `VITE_BASE_URL` | 站点 origin（如 `getBaseUrl()`） | 建议设置 | 未设置时使用 `clientEnv` 默认 `http://localhost:8888` |

**不要**把 `VITE_*` 放在 `wrangler.jsonc` 的 `vars` 或 `wrangler secret` 里——它们是构建时用的，不是 Worker 运行时环境变量。

---

## 2. 运行时（serverEnv / `process.env`）

在 **Worker 每次请求执行时** 才读取，用于密钥、API Key、业务配置等。

### 如何设置

| 场景 | 设置方式 |
|------|----------|
| 本地开发 `pnpm dev` | 在 **`.env.local`** 中定义，由 dev 进程加载到 `process.env` |
| Cloudflare Workers 部署 | 使用 **`wrangler secret put <NAME>`**（密钥类）或 **`wrangler.jsonc` 的 `vars`**（非敏感配置） |

开启 `nodejs_compat_populate_process_env` 后，Worker 的 vars 和 secrets 会自动出现在 `process.env` 中。D1、R2 等 **binding** 仍通过 `env.DB`、`env.FILES` 等访问，不会进 `process.env`。

### 运行时变量列表（按功能）

| 变量 | 用途 | 本地 | Workers |
|------|------|------|---------|
| `BETTER_AUTH_SECRET` | Better Auth 会话签名 | .env.local | `wrangler secret put BETTER_AUTH_SECRET` |
| `GOOGLE_CLIENT_ID` | Google 登录 | .env.local | `wrangler secret put GOOGLE_CLIENT_ID` |
| `GOOGLE_CLIENT_SECRET` | Google 登录 | .env.local | `wrangler secret put GOOGLE_CLIENT_SECRET` |
| `RESEND_API_KEY` | 发邮件 (Resend) | .env.local | `wrangler secret put RESEND_API_KEY` |
| `STORAGE_PUBLIC_URL` | R2 公网访问 URL（可选） | .env.local | vars 或 secret |
| `BEEHIIV_API_KEY` / `BEEHIIV_PUBLICATION_ID` | Beehiiv 邮件（可选） | .env.local | secret / vars |

---

## 3. 关于 `VITE_BASE_URL` 和 `getBaseUrl()`

当前实现：`getBaseUrl()` 通过 `clientEnv.VITE_BASE_URL` 读取（由 T3 校验并带默认值），即**构建时**变量。

- **本地开发**：在 **`.env.local`** 中定义 `VITE_BASE_URL=http://localhost:8888`（也可不定义，用 `clientEnv` 默认值）。
- **生产部署**：在**执行 `pnpm build` 的环境**里提供 `VITE_BASE_URL`：
  - 若在本机 build：在 **`.env.production`** 中写 `VITE_BASE_URL=https://你的域名`（不要提交到 Git）。
  - 若在 CI/Cloudflare Pages 等 build：在对应流水线的 **构建环境变量** 里添加 `VITE_BASE_URL`。

**不需要**在 Cloudflare Workers 的 **运行时** vars/secrets 里配置 `VITE_BASE_URL`——它只在 build 时被 Vite 打进 bundle，部署后 Worker 不再读取该环境变量。

---

## 4. 文件与配置一览

| 文件 | 何时生效 | 说明 |
|------|----------|------|
| `.env.local` | `pnpm dev` 且存在时 | 本地构建时 + 本地运行时的变量，Git 忽略 |
| `.env.production` | `pnpm build` 时 | 生产构建用（如 `VITE_BASE_URL`），不要提交密钥 |
| `wrangler.jsonc` `vars` | Worker 运行时 | 非敏感配置，会进 `process.env`（需开启 nodejs_compat_populate_process_env） |
| `wrangler secret put <NAME>` | Worker 运行时 | 密钥类，会进 `process.env` |

---

## 5. Storage (R2)

R2 使用 `wrangler.jsonc` 中的 **binding**（如 `FILES`），不是环境变量。若使用 R2 自定义域名，可把该 URL 放在 **运行时** 变量 `STORAGE_PUBLIC_URL`（`.env.local` / Worker vars 或 secret）中，代码通过 `serverEnv.STORAGE_PUBLIC_URL` 读取。
