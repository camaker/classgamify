import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { getLocale } from '@/locale/paraglide/runtime';

export const STUDENT_RUNNER_LOADING_HANDOFF_ITEM_IDS = [
  'route-status',
  'share-link',
  'lookup-state',
  'query-source',
  'loading-message',
  'public-payload-status',
  'runtime-items-status',
  'item-order-status',
  'timer-start-boundary',
  'attempt-clock-status',
  'submit-gate',
  'submission-policy',
  'identity-policy',
  'browser-token-policy',
  'student-name-policy',
  'rule-summary-status',
  'unavailable-check',
  'starter-preview-fallback',
  'sanitized-payload-boundary',
  'activity-content-boundary',
  'answer-key-boundary',
  'explanation-boundary',
  'source-material-boundary',
  'runtime-prompt-boundary',
  'runtime-choice-boundary',
  'runtime-id-boundary',
  'student-answer-boundary',
  'result-boundary',
  'indexing-policy',
  'privacy-guard',
] as const;

export type StudentRunnerLoadingHandoffItemId =
  (typeof STUDENT_RUNNER_LOADING_HANDOFF_ITEM_IDS)[number];

export type StudentRunnerLoadingHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerLoadingHandoffItemId;
  label: string;
  value: string;
};

export type StudentRunnerLoadingHandoffPrivacyContract = {
  allowsSubmission: false;
  exposesActivityContent: false;
  exposesActualShareSlug: false;
  exposesAnonymousToken: false;
  exposesAnswerKeys: false;
  exposesAssignmentTitle: false;
  exposesBrowserLabel: false;
  exposesExplanations: false;
  exposesRawSettingsJson: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentAnswerText: false;
  exposesStudentName: false;
  itemIds: StudentRunnerLoadingHandoffItemId[];
  scope: 'public-student-runner-loading';
  startsAttemptClock: false;
};

export type StudentRunnerLoadingHandoffView = {
  description: string;
  itemViews: StudentRunnerLoadingHandoffItemView[];
  privacy: StudentRunnerLoadingHandoffPrivacyContract;
  title: string;
};

export function buildStudentRunnerLoadingHandoffView({
  message,
  shareId,
}: {
  message: string;
  shareId: string;
}): StudentRunnerLoadingHandoffView {
  const context: StudentRunnerLoadingHandoffBuildContext = {
    hasShareId: Boolean(normalizeAssignmentShareSlug(shareId)),
    message,
  };
  const itemViews = STUDENT_RUNNER_LOADING_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRunnerLoadingHandoffItemView({ ...context, id })
  );

  return {
    description: loadingCopy({
      en: '30-slice loading handoff for public assignment lookup, safe payload preparation, timer start, submission blocking, and privacy boundaries before the student runner is playable.',
      zh: '公开作业查询、净化载荷准备、计时开始、提交阻止和隐私边界的 30 切片加载交接，适用于学生 runner 可作答之前。',
    }),
    itemViews,
    privacy: buildStudentRunnerLoadingHandoffPrivacyContract(itemViews),
    title: loadingCopy({
      en: 'Runner loading handoff',
      zh: 'Runner 加载交接',
    }),
  };
}

type StudentRunnerLoadingHandoffBuildContext = {
  hasShareId: boolean;
  message: string;
};

type StudentRunnerLoadingHandoffItemBuildContext =
  StudentRunnerLoadingHandoffBuildContext & {
    id: StudentRunnerLoadingHandoffItemId;
  };

function buildStudentRunnerLoadingHandoffItemView(
  context: StudentRunnerLoadingHandoffItemBuildContext
): StudentRunnerLoadingHandoffItemView {
  const label = getStudentRunnerLoadingHandoffLabel(context.id);
  const description = getStudentRunnerLoadingHandoffDescription(context.id);
  const value = getStudentRunnerLoadingHandoffValue(context);

  return {
    ariaLabel: loadingCopy({
      en: `${label}: ${value}. ${description}`,
      zh: `${label}：${value}。${description}`,
    }),
    description,
    id: context.id,
    label,
    value,
  };
}

function buildStudentRunnerLoadingHandoffPrivacyContract(
  itemViews: StudentRunnerLoadingHandoffItemView[]
): StudentRunnerLoadingHandoffPrivacyContract {
  return {
    allowsSubmission: false,
    exposesActivityContent: false,
    exposesActualShareSlug: false,
    exposesAnonymousToken: false,
    exposesAnswerKeys: false,
    exposesAssignmentTitle: false,
    exposesBrowserLabel: false,
    exposesExplanations: false,
    exposesRawSettingsJson: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentAnswerText: false,
    exposesStudentName: false,
    itemIds: itemViews.map((item) => item.id),
    scope: 'public-student-runner-loading',
    startsAttemptClock: false,
  };
}

function getStudentRunnerLoadingHandoffLabel(
  id: StudentRunnerLoadingHandoffItemId
) {
  switch (id) {
    case 'route-status':
      return loadingCopy({ en: 'Route status', zh: '路由状态' });
    case 'share-link':
      return loadingCopy({ en: 'Share link', zh: '分享链接' });
    case 'lookup-state':
      return loadingCopy({ en: 'Lookup state', zh: '查询状态' });
    case 'query-source':
      return loadingCopy({ en: 'Query source', zh: '查询来源' });
    case 'loading-message':
      return loadingCopy({ en: 'Loading message', zh: '加载消息' });
    case 'public-payload-status':
      return loadingCopy({ en: 'Public payload', zh: '公开载荷' });
    case 'runtime-items-status':
      return loadingCopy({ en: 'Runtime items', zh: '运行题目' });
    case 'item-order-status':
      return loadingCopy({ en: 'Item order', zh: '题目顺序' });
    case 'timer-start-boundary':
      return loadingCopy({ en: 'Timer start', zh: '计时开始' });
    case 'attempt-clock-status':
      return loadingCopy({ en: 'Attempt clock', zh: '作答计时' });
    case 'submit-gate':
      return loadingCopy({ en: 'Submit gate', zh: '提交闸门' });
    case 'submission-policy':
      return loadingCopy({ en: 'Submission policy', zh: '提交策略' });
    case 'identity-policy':
      return loadingCopy({ en: 'Identity policy', zh: '身份策略' });
    case 'browser-token-policy':
      return loadingCopy({ en: 'Browser token', zh: '浏览器令牌' });
    case 'student-name-policy':
      return loadingCopy({ en: 'Student name', zh: '学生姓名' });
    case 'rule-summary-status':
      return loadingCopy({ en: 'Rule summary', zh: '规则摘要' });
    case 'unavailable-check':
      return loadingCopy({ en: 'Unavailable check', zh: '不可用检查' });
    case 'starter-preview-fallback':
      return loadingCopy({ en: 'Starter preview', zh: 'Starter 预览' });
    case 'sanitized-payload-boundary':
      return loadingCopy({ en: 'Sanitized payload', zh: '净化载荷' });
    case 'activity-content-boundary':
      return loadingCopy({ en: 'Activity content', zh: '活动内容' });
    case 'answer-key-boundary':
      return loadingCopy({ en: 'Answer keys', zh: '答案键' });
    case 'explanation-boundary':
      return loadingCopy({ en: 'Explanations', zh: '解释' });
    case 'source-material-boundary':
      return loadingCopy({ en: 'Source materials', zh: '来源素材' });
    case 'runtime-prompt-boundary':
      return loadingCopy({ en: 'Runtime prompts', zh: '运行题干' });
    case 'runtime-choice-boundary':
      return loadingCopy({ en: 'Runtime choices', zh: '运行选项' });
    case 'runtime-id-boundary':
      return loadingCopy({ en: 'Runtime ids', zh: '运行 ID' });
    case 'student-answer-boundary':
      return loadingCopy({ en: 'Student answers', zh: '学生答案' });
    case 'result-boundary':
      return loadingCopy({ en: 'Result boundary', zh: '结果边界' });
    case 'indexing-policy':
      return loadingCopy({ en: 'Indexing policy', zh: '索引策略' });
    case 'privacy-guard':
      return loadingCopy({ en: 'Privacy guard', zh: '隐私防护' });
  }
}

function getStudentRunnerLoadingHandoffDescription(
  id: StudentRunnerLoadingHandoffItemId
) {
  switch (id) {
    case 'route-status':
      return loadingCopy({
        en: 'The public runner route is mounted, but assignment lookup has not resolved to playable content.',
        zh: '公开 runner 路由已挂载，但作业查询还没有解析到可作答内容。',
      });
    case 'share-link':
      return loadingCopy({
        en: 'The loading handoff records only whether a normalized share id exists, not the id text.',
        zh: '加载交接只记录是否存在规范化分享 ID，不记录 ID 文本。',
      });
    case 'lookup-state':
      return loadingCopy({
        en: 'The public assignment query is still pending before available or unavailable state is known.',
        zh: '公开作业查询仍在等待，还没有确定可用或不可用状态。',
      });
    case 'query-source':
      return loadingCopy({
        en: 'The runner waits for the public assignment lookup before choosing assignment content or fallback preview.',
        zh: 'runner 会等待公开作业查询，再选择作业内容或预览兜底。',
      });
    case 'loading-message':
      return loadingCopy({
        en: 'Visible loading copy is safe and does not include assignment details.',
        zh: '可见加载文案是安全文案，不包含作业细节。',
      });
    case 'public-payload-status':
      return loadingCopy({
        en: 'No sanitized public assignment payload has been accepted into the runner yet.',
        zh: 'runner 尚未接收任何净化后的公开作业载荷。',
      });
    case 'runtime-items-status':
      return loadingCopy({
        en: 'Playable runtime items are not available while the query is loading.',
        zh: '查询加载期间还没有可作答运行题目。',
      });
    case 'item-order-status':
      return loadingCopy({
        en: 'Shuffle and stable item order are deferred until runtime items exist.',
        zh: '随机和稳定题目顺序会等运行题目存在后再处理。',
      });
    case 'timer-start-boundary':
      return loadingCopy({
        en: 'Timed assignments must wait for loaded runtime items before starting the student clock.',
        zh: '有计时的作业必须等运行题目加载完成后才启动学生计时。',
      });
    case 'attempt-clock-status':
      return loadingCopy({
        en: 'The attempt clock start plan stays skipped while the runner cannot submit.',
        zh: 'runner 不可提交时，作答计时启动计划保持跳过。',
      });
    case 'submit-gate':
      return loadingCopy({
        en: 'The submit button and submit execution remain blocked until playable content is ready.',
        zh: '提交按钮和提交执行会保持阻止，直到可作答内容准备好。',
      });
    case 'submission-policy':
      return loadingCopy({
        en: 'No browser submission payload is formed while assignment lookup is pending.',
        zh: '作业查询等待期间不会形成浏览器提交载荷。',
      });
    case 'identity-policy':
      return loadingCopy({
        en: 'Student identity mode is not requested until the resolved assignment settings are known.',
        zh: '解析出作业设置前，不会请求学生身份模式。',
      });
    case 'browser-token-policy':
      return loadingCopy({
        en: 'Anonymous browser tokens are not created or exposed during lookup loading.',
        zh: '查询加载期间不会创建或暴露匿名浏览器令牌。',
      });
    case 'student-name-policy':
      return loadingCopy({
        en: 'Typed student names are not read into the loading handoff.',
        zh: '加载交接不会读取学生输入姓名。',
      });
    case 'rule-summary-status':
      return loadingCopy({
        en: 'Public rule summaries wait for resolved assignment settings and item counts.',
        zh: '公开规则摘要会等待解析后的作业设置和题目数量。',
      });
    case 'unavailable-check':
      return loadingCopy({
        en: 'Closed, draft, expired, or missing states are not rendered until lookup resolves.',
        zh: '已关闭、草稿、已过期或缺失状态会等查询完成后再渲染。',
      });
    case 'starter-preview-fallback':
      return loadingCopy({
        en: 'Starter preview fallback is not selected until the real lookup is no longer loading.',
        zh: '真实查询不再加载前，不会选择 starter 预览兜底。',
      });
    case 'sanitized-payload-boundary':
      return loadingCopy({
        en: 'Only a resolved available assignment may provide sanitized runtime payload data.',
        zh: '只有解析为可用的作业才能提供净化运行载荷数据。',
      });
    case 'activity-content-boundary':
      return loadingCopy({
        en: 'Teacher ActivityContent JSON is never exposed in the loading state.',
        zh: '加载状态永远不会暴露老师的 ActivityContent JSON。',
      });
    case 'answer-key-boundary':
      return loadingCopy({
        en: 'Teacher-only answer keys are absent before and during loading.',
        zh: '加载前和加载期间都不会出现教师专属答案键。',
      });
    case 'explanation-boundary':
      return loadingCopy({
        en: 'Answer explanations stay unavailable until after a scored review allows them.',
        zh: '答案解释会保持不可用，直到评分复盘允许展示。',
      });
    case 'source-material-boundary':
      return loadingCopy({
        en: 'Source material file names, ids, storage keys, and metadata stay private.',
        zh: '来源素材文件名、ID、存储键和元数据保持私密。',
      });
    case 'runtime-prompt-boundary':
      return loadingCopy({
        en: 'Runtime prompt text is omitted from the loading handoff.',
        zh: '运行题干文本不会进入加载交接。',
      });
    case 'runtime-choice-boundary':
      return loadingCopy({
        en: 'Runtime choice text is omitted from the loading handoff.',
        zh: '运行选项文本不会进入加载交接。',
      });
    case 'runtime-id-boundary':
      return loadingCopy({
        en: 'Runtime item ids are not listed before a playable payload exists.',
        zh: '可作答载荷存在前，不会列出运行题目 ID。',
      });
    case 'student-answer-boundary':
      return loadingCopy({
        en: 'No student answer text belongs to the pre-load state.',
        zh: '预加载状态不包含任何学生答案文本。',
      });
    case 'result-boundary':
      return loadingCopy({
        en: 'Scored result and post-submit review panels are unavailable while loading.',
        zh: '加载期间没有评分结果或提交后复盘面板。',
      });
    case 'indexing-policy':
      return loadingCopy({
        en: 'The public runner remains noindex while lookup state changes.',
        zh: '公开 runner 在查询状态变化期间仍保持 noindex。',
      });
    case 'privacy-guard':
      return loadingCopy({
        en: 'The loading handoff omits share text, assignment titles, prompts, choices, answers, identities, tokens, results, source materials, and raw settings.',
        zh: '加载交接会省略分享文本、作业标题、题干、选项、答案、身份、令牌、结果、来源素材和原始设置。',
      });
  }
}

function getStudentRunnerLoadingHandoffValue(
  context: StudentRunnerLoadingHandoffItemBuildContext
) {
  switch (context.id) {
    case 'route-status':
      return loadingCopy({ en: 'Loading', zh: '加载中' });
    case 'share-link':
      return context.hasShareId
        ? loadingCopy({ en: 'Share id hidden', zh: '分享 ID 已隐藏' })
        : loadingCopy({ en: 'No share id', zh: '无分享 ID' });
    case 'lookup-state':
      return loadingCopy({ en: 'Pending', zh: '等待中' });
    case 'query-source':
      return loadingCopy({ en: 'Public assignment query', zh: '公开作业查询' });
    case 'loading-message':
      return context.message;
    case 'public-payload-status':
      return loadingCopy({ en: 'Not ready', zh: '未就绪' });
    case 'runtime-items-status':
      return loadingCopy({ en: 'No items yet', zh: '暂无题目' });
    case 'item-order-status':
      return loadingCopy({ en: 'Deferred', zh: '延后处理' });
    case 'timer-start-boundary':
      return loadingCopy({ en: 'After runtime load', zh: '运行内容加载后' });
    case 'attempt-clock-status':
      return loadingCopy({ en: 'Not started', zh: '未启动' });
    case 'submit-gate':
      return loadingCopy({ en: 'Blocked', zh: '已阻止' });
    case 'submission-policy':
      return loadingCopy({ en: 'No payload', zh: '无提交载荷' });
    case 'identity-policy':
      return loadingCopy({ en: 'Deferred', zh: '延后处理' });
    case 'browser-token-policy':
      return loadingCopy({ en: 'Not created', zh: '未创建' });
    case 'student-name-policy':
      return loadingCopy({ en: 'Not collected', zh: '未收集' });
    case 'rule-summary-status':
      return loadingCopy({ en: 'Pending settings', zh: '等待设置' });
    case 'unavailable-check':
      return loadingCopy({ en: 'Pending lookup', zh: '等待查询' });
    case 'starter-preview-fallback':
      return loadingCopy({ en: 'Deferred', zh: '延后处理' });
    case 'sanitized-payload-boundary':
      return loadingCopy({
        en: 'Pending available assignment',
        zh: '等待可用作业',
      });
    case 'activity-content-boundary':
      return loadingCopy({ en: 'Hidden', zh: '已隐藏' });
    case 'answer-key-boundary':
      return loadingCopy({ en: 'Hidden', zh: '已隐藏' });
    case 'explanation-boundary':
      return loadingCopy({ en: 'Hidden', zh: '已隐藏' });
    case 'source-material-boundary':
      return loadingCopy({ en: 'Private', zh: '保持私密' });
    case 'runtime-prompt-boundary':
      return loadingCopy({ en: 'Omitted', zh: '已省略' });
    case 'runtime-choice-boundary':
      return loadingCopy({ en: 'Omitted', zh: '已省略' });
    case 'runtime-id-boundary':
      return loadingCopy({ en: 'Omitted', zh: '已省略' });
    case 'student-answer-boundary':
      return loadingCopy({ en: 'None', zh: '无' });
    case 'result-boundary':
      return loadingCopy({ en: 'Unavailable', zh: '不可用' });
    case 'indexing-policy':
      return loadingCopy({ en: 'noindex', zh: 'noindex' });
    case 'privacy-guard':
      return loadingCopy({ en: 'Private data omitted', zh: '已省略私密数据' });
  }
}

function loadingCopy(copy: { en: string; zh: string }) {
  return getLocale() === 'zh' ? copy.zh : copy.en;
}
