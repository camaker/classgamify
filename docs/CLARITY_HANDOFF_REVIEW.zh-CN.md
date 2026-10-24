# Clarity 中断任务接续核验（2026-10-24）

## 基线与最终行为

在 `fix/clarity-findings-2026-10` / `9cce0396` 上保存并接续 Claude 的未提交改动。所有修改与测试均在本地，没有 push、部署、真实付款或第三方生成请求。

- 分组题支持先点分类再点词语，原来的先点词语再选分类流程继续可用。空分类区域整体可点击，选中提示通过 aria-live 宣告；不存在的 pending 分类不会进入状态。
- 学生姓名说明使用关联 label，手机点击说明即可聚焦输入框，主要无障碍名称保持为 Student name。
- 首页原本已有可答题样例；本次补齐公开 starter 的正确性与解释反馈，并让反馈保留至手动翻题。只有内置公开 starter 使用本地答案，教师自建作业继续使用服务端反馈。
- 四个功能卡片可导航至相应入口，路由由页面 view model 统一提供。首页与工作区标题复用已有本地化文案。
- 分析脚本只允许正式 production 域名，并排除 webdriver/E2E。Clarity 始终关闭：本产品直接服务学生，Microsoft 官方 FAQ 明确不适用于面向 18 岁以下用户的产品，遮罩或无 Cookie 模式不能替代该适用限制。依据：https://learn.microsoft.com/en-us/clarity/faq#are-there-any-restrictions-on-using-clarity

## 浏览器测试底座修复

原配置忽略指定 PORT，注册请求的 Origin 仍固定为 3000；修复为测试端口一致并严格绑定端口。新增 hydration 标记及导航夹具，避免在 SSR 控件尚未可交互时操作。E2E 使用独立 Vite 缓存、关闭热更新并预优化 React / Base UI，消除本地测试启动时的重复 React 实例问题。生产构建仍使用原有 Cloudflare 路径。

新增交互曾遇到两项定位歧义：分类计数改变后旧定位不再匹配、屏幕阅读器提示与可见提示文案相同。已分别改用更新后的计数和明确的移动提示栏 test id；最终整组通过。

## 验证结果

| 检查 | 结果 |
| --- | --- |
| `pnpm test:unit` | 633 / 633 通过 |
| `pnpm test:domain` | 通过，覆盖公开样例正确/错误反馈、分类先选状态及非法分类 |
| `pnpm locale:check` | 通过，10 语言共 3193 key |
| `pnpm check`、`pnpm knip` | 通过 |
| `pnpm build` | production 构建通过 |
| `PORT=3321 pnpm exec playwright test tests/e2e/specs/clarity-regressions.spec.ts tests/e2e/specs/student-submit-feedback.spec.ts --workers=1` | 5 / 5 通过 |
| Chrome 手动核验 production 本地预览 | 点 apple 后保留 Correct、答案与解释，上一题/下一题可用 |

仓库没有现成的 typecheck 脚本。额外运行 `pnpm exec tsc --noEmit --pretty false` **未通过**：在同一依赖和生成文件下，干净 HEAD 基线有 1594 条诊断，当前为 1593 条。排除行号后比较，新增的 3 条均为新标题引用的既有 Paraglide messages 无声明文件问题；其余新增隐式类型问题已修正。基线还存在大量领域类型及测试类型错误。本次未声称整个仓库类型检查通过，也未通过放宽 tsconfig 隐藏这些问题。

## 本地性能采样

production 预览、1440×900、CPU 4 倍降速、阻断外部请求，各 3 次；比较接手时未提交版本与最终版本。首页执行选答案、切题、改答案等实际点击。

| 指标 | 接手版本 | 最终版本 |
| --- | --- | --- |
| LCP（ms） | 536 / 264 / 368 | 672 / 152 / 160 |
| 每次最大交互耗时（ms） | 88 / 64 / 64 | 72 / 40 / 40 |
| CLS | 0.00163 | 0.00163 |

采样受并发构建与本地缓存影响，仅说明这些本地交互没有出现明显卡顿。它不是线上 INP，也不能证明真实用户流量或转化改善；线上效果需要发布后另行复核。
