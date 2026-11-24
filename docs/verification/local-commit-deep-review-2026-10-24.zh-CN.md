# ClassGamify 本地提交深度复核（2026-10-24）

复核对象：`81e5b4ea80c62a1e4855a2c34c686b6a605beb3f`，父提交 `3973f43c1eaba34184870d184462182516f7fcba`。仅在 `fix/clarity-findings-2026-10` 本地修改和提交。

## 检查范围核验

- 与原类型修复前的父提交对比，`tsconfig.json`、`biome.json`、`knip.json` 均没有变化。strict、noUnusedLocals、noUnusedParameters、脚本与 E2E 全仓包含规则仍在；没有新增 ts-ignore、ts-nocheck、noCheck、skip 或排除目录。已有 skipLibCheck 和 Biome 对巨型领域脚本的排除是原有基线，不把它们称作新增严格性；领域脚本仍由 TypeScript 检查。
- 在业务源码、`scripts/test-domain.ts` 和真实 E2E 文件中各注入一个 `number = string`：三处均被全仓 tsc 报 TS2322、exit 2。finally 恢复后重新检查通过。
- AST 解开同步断言包装后核验：原 6,160 个 assert 调用按原顺序保留，现为 6,161 个；额外一个是素材引用非空检查。445 个包装回调均非 async，普通辅助函数直接调用回调，没有延迟、catch、条件跳过或 test.only。
- 逐项核对解包后的差异：可选链/空字符串适配仍有具体非空期望值，错误数据不会因此通过断言。排序与筛选泛型只缩减消费者的字段要求，完整领域模型继续保留必需字段；没有以全局 any 或任意字段字典代替模型。

## 发现并继续修复

### 错误消息行为回归

原提交把 `error?.message` 改成 `instanceof Error`，普通序列化对象以及其他原型上的字符串消息会被替换成默认提示。共享 `getCatchBoundaryMessage` 现在对 unknown 做结构化字符串校验，保留合法消息及空字符串，对非字符串消息使用本地化兜底，避免把对象交给 React 渲染。

### 归档编辑输入被静默重分类

`activityContentToEditorInput` 为满足 CreateActivityInput 类型，把 archived 映射成 draft。正常编辑页已有归档访问门禁，本次没有发现用户界面能绕过该门禁或自动恢复数据库记录；问题位于共享转换函数的边界：不应靠改写状态消除类型错误。

现在先执行共享 `assertActivityCanEdit`。该函数的断言签名精确排除 archived，使 TypeScript 与运行时采用同一个判断；所有四种合法活动可见性原样保留，archived 明确抛错。恢复流程仍通过既有显式操作完成。

### 测试夹具通过展开绕过多余属性诊断

原提交在若干挑战数据中使用 `...{ privateField }`，并在三个兼容性视图调用中用展开携带已经不再接受的 content/sourceTitle。这些写法虽不修改 tsconfig，却绕开了对象字面量的多余属性检查。

删除六个失效调用字段；五组隐私挑战数据改为独立命名对象，用 `satisfies 基础类型 & 明确私有字段类型` 检查完整形状。带私有 explanation 的 pair 也使用明确交叉类型。保留全部原始私有值和输出剥离断言，没有删除隐私挑战数据或把领域模型放宽。

## 验证

- 负向复现：临时恢复旧的 instanceof 消息分支和 archived→draft 转换，三个新增运行时断言测试全部失败；finally 恢复修复。探针故意失败与正式通过记录分开保留。
- 完整单元测试 **642 / 642**，领域测试通过；Knip 通过。
- 全仓类型检查通过，完整 `pnpm predeploy` 通过；没有提高 chunk 警告阈值。将已忽略的本地化与内容生成目录移到备份后，从空输出重新生成 runtime.d.ts、messages.d.ts 与内容 index.d.ts，最终同一完整门禁再次 exit 0。
- 单次完整 Playwright：**87 / 87**，零重试、零跳过、零 flaky，exit 0（约 3 分钟）。包括创建、编辑、归档恢复、配额错误响应、AI 草稿、素材、学生交互与结果审阅。
- 手动浏览器：模板页点击 Start Quiz，确认真实编辑器载入 Food words quick check、原始问题和 Draft 可见性；浏览器 error 日志为空。归档恢复的完整交互由该次 E2E 验证。
- 新增测试已登记 TEST-CATALOG。前两次单元运行因新增测试尚未登记目录而失败，现已补齐目录并完整重跑；没有关闭清单完整性测试。

本地浏览器服务随测试结束停止。生成目录有工作区备份，生成产物、临时探针、测试账号与本地数据库均不提交。构建 chunk 和开发服务器既有 Better Auth 插件顺序 warning 保留；本次未改变认证配置，不把 warning 当作已复现的本次回归。

没有 push、部署、远程 D1/R2 或真实支付/provider 调用。本地验证不代表线上状态或 GSC 指标改善。
