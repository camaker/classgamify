# ClassGamify 全仓 TypeScript 基线修复（2026-10-24）

基线为本地 `fix/clarity-findings-2026-10` 分支的 `3973f43c`。延续此前 Claude / Codex 的本地修复；没有 push、部署、远程数据库或真实付费服务操作。

## 根因与修复边界

此前完整 TypeScript 检查有 1,593 条诊断。不是 1,593 个独立业务缺陷：

1. Paraglide 的 CLI / Vite 编译配置没有共同生成声明。抽出共享配置，开启 `emitTsDeclarations`，保留 URL / cookie / baseLocale 策略以及 API、robots、sitemap、manifest 排除规则。Vite 开发仍用 locale-modules，生产仍用 message-modules。
2. `scripts/test-domain.ts` 有 7,173 条顶层语句，触发 TS2563 控制流上限，继而让大量本来有上下文类型的 React / Playwright 回调报隐式 any。隔离实验曾验证移除该模块会显著减少报错，但最终没有排除它。立即执行的函数仍被 TypeScript 内联分析，不能解决问题；最终将相邻断言分成 445 个通过普通函数同步调用的块，保持源码顺序。AST 清点原来 6,160 个断言调用全部保留，额外加入一个素材引用非空断言，现为 6,161 个。
3. 修复剩余真实类型问题：缺失的领域类型导入、宽化的字面量、Zod 输入/输出默认值、ServerFn 可序列化素材引用、可空聚合值、路由可选查询字段、联合状态收窄、UI 组件库 API、SQLite 测试驱动与 Drizzle 传输类型，以及落后的测试夹具。

`tsconfig.json` 未修改；仍检查全部应用、脚本、配置和 E2E 的 `.ts` / `.tsx`，保留 strict、noUnusedLocals、noUnusedParameters 等选项。没有通过新增 any、ts-ignore、ts-nocheck 或排除脚本来清零。

## 主要实现

- `pnpm typecheck` 先生成本地化与 Content Collections，再执行全仓 `tsc --noEmit`；`pnpm predeploy` 在构建前执行该门禁。新增内容编译器遇到 collection validation event 时抛错，避免部分输出被误判为成功。
- 草稿返回边界将 `sourceMaterials` 从输入的未知数组规范化为现有安全素材引用，维持缺失字段的原有行为。历史 JSON 的素材筛选边界接收未知素材数组，再交由已有规范化器处理。
- 作业排序/筛选只要求实际读取的字段，并保留调用方的泛型字段；接受原来已处理的 Date / 序列化日期。完整结果领域模型不因此放宽。
- 订阅额度服务依赖带真实 schema 的通用异步 SQLite 类型；本地迁移测试使用真实 Drizzle proxy，移除把整个数据库断言为 never 的做法，参数逐个验证为 Node SQLite 支持的值。生产仍使用原 D1 数据库。
- 归档编辑页使用 Base UI 的 `render` / `nativeButton={false}` 组合导航，避免旧 `asChild` API 及控制台错误。归档活动仍先在访问状态中阻断编辑，恢复后才可编辑原内容。
- 更新类型过时的夹具，同时保留故意携带私有字段的隐私挑战数据。精确源码断言适配合法的类型标注/收窄，业务行为断言继续运行。

## 收尾发现的运行时响应边界

开发服务器日志中还出现配额 UI 读取 `undefined.activities` 的异常。ServerFn 的鉴权中间件可能返回错误体，静态成功类型并不能保证该错误体包含 `meters`。在共享 `usePlanUsage` 查询入口加入完整响应校验，只有三个合法计量器、套餐和状态齐备时才进入成功缓存；错误体作为查询失败处理，不伪造免费套餐或无限配额，也不修改服务器额度执行规则。

新增两项单元用例覆盖正确响应、鉴权错误体、缺失计量器、错位 kind 和 NaN；浏览器注入错误响应验证编辑器仍可使用。浏览器模拟 TanStack `x-tss-raw` Response 传输；普通 `{error}` JSON 会被框架本身拒绝，不能作为此缺陷的有效探针。撤去查询入口校验后，raw Response 用例已实际失败（编辑器消失）；finally 恢复校验。正确校验下的独立用例通过，最终再运行全量。

## 回归证据

- 完整 `pnpm typecheck` 已通过；临时放入 E2E 目录的 `number = 'must fail'` 探针被唯一 TS2322 正确拒绝，随后移除。
- `pnpm test:domain` 通过；`pnpm test:unit` 639 / 639 通过。新增测试实际运行 Paraglide 编译器，验证声明与服务路由排除；内容编译器覆盖新输出替换旧输出及无效内容必须失败。
- `pnpm knip`、`pnpm check`、`pnpm locale:check` 已通过。Knip 与 TypeScript 范围没有降低。
- 手工浏览器验证：保存活动、卡片编辑回填；归档后直接编辑被阻断，按钮打开归档库，恢复后标题与内容仍在。新增归档恢复 E2E 单独运行 1 / 1 通过，并检查浏览器错误。
- 首次完整 E2E：83 通过、matching-pairs 加载等待失败、后续 open-box 因串行组失败未执行。保留该记录；matching-pairs 带 trace 的独立复现 1 / 1 通过，尚不能据此认定首次失败原因。未放宽等待时间、增加重试或跳过测试。
- 在配额响应边界修复前，第二次完整 E2E 通过 86 / 86。加入响应边界后的最终 `pnpm e2e --trace retain-on-failure` 在单次完整运行中以零重试通过 **87 / 87**，退出码 0（4.5 分钟）。
- 停止本地预览，将 `src/locale/paraglide` 和 `.content-collections` 移到工作区备份后，执行完整 `pnpm predeploy`。声明、内容产物均从空输出重新生成，locale、Biome、全仓 TypeScript、production build 全部退出码 0（29 秒）；构建仍提示部分 chunk 超过 500 kB，未提高阈值来隐藏警告。
- 最终本地预览已停止。未提交生成产物、临时探针、浏览器测试账户或本地数据库文件。

以上是本地代码、测试、构建证据，不代表线上部署或 GSC 流量变化。前次诊断中的基线失败记录作为历史证据保留，本记录说明本轮修复。
