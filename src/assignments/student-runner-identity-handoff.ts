import type { StudentRunnerIdentityView } from '@/assignments/student-runner-state';
import type { AnonymousAttemptSummaryItemId } from '@/assignments/student-submission';
import { getLocale } from '@/locale/paraglide/runtime';

export const STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS = [
  'identity-region',
  'identity-mode',
  'collection-policy',
  'student-name-field',
  'student-name-label',
  'student-name-placeholder',
  'student-name-description',
  'student-name-disabled',
  'student-name-lock-policy',
  'student-name-value-guard',
  'anonymous-panel',
  'browser-label',
  'browser-label-caption',
  'browser-label-aria',
  'anonymous-summary-count',
  'anonymous-summary-ids',
  'browser-summary',
  'retry-summary',
  'token-privacy-summary',
  'retry-description',
  'submission-identity-source',
  'attempt-limit-identity-boundary',
  'result-review-identity-boundary',
  'browser-token-storage-boundary',
  'normalized-name-boundary',
  'anonymous-token-boundary',
  'answer-text-boundary',
  'teacher-answer-boundary',
  'source-material-boundary',
  'privacy-guard',
] as const;

export type StudentRunnerIdentityHandoffItemId =
  (typeof STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS)[number];

export type StudentRunnerIdentityHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerIdentityHandoffItemId;
  label: string;
  value: string;
};

export type StudentRunnerIdentityHandoffPrivacyContract = {
  exposesAnonymousBrowserLabel: boolean;
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesRawSubmissionPayload: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentName: false;
  exposesStudentNameInputValue: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: StudentRunnerIdentityHandoffItemId[];
  mode: StudentRunnerIdentityView['mode'];
  scope: 'public-student-runner-identity';
  summaryItemIds: AnonymousAttemptSummaryItemId[];
};

export type StudentRunnerIdentityHandoffView = {
  description: string;
  itemViews: StudentRunnerIdentityHandoffItemView[];
  privacy: StudentRunnerIdentityHandoffPrivacyContract;
  title: string;
};

type StudentRunnerIdentityHandoffBuildContext = {
  identityView: StudentRunnerIdentityView;
  summaryItemIds: AnonymousAttemptSummaryItemId[];
};

type StudentRunnerIdentityHandoffItemBuildContext =
  StudentRunnerIdentityHandoffBuildContext & {
    id: StudentRunnerIdentityHandoffItemId;
  };

export function buildStudentRunnerIdentityHandoffView(
  identityView: StudentRunnerIdentityView
): StudentRunnerIdentityHandoffView {
  const summaryItemIds =
    identityView.mode === 'anonymous'
      ? identityView.copy.summaryItems.map((summaryItem) => summaryItem.id)
      : [];
  const context: StudentRunnerIdentityHandoffBuildContext = {
    identityView,
    summaryItemIds,
  };
  const itemViews = STUDENT_RUNNER_IDENTITY_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRunnerIdentityHandoffItemView({ ...context, id })
  );

  return {
    description: identityCopy({
      en: '30-slice student identity handoff for named-student entry, anonymous browser labels, retry guidance, normalized attempt identity, and privacy boundaries before and after submission.',
      zh: '学生身份、匿名浏览器标签、重试说明、作答身份归一化和提交前后隐私边界的 30 切片学生身份交接。',
    }),
    itemViews,
    privacy: buildStudentRunnerIdentityHandoffPrivacyContract({
      identityView,
      itemViews,
      summaryItemIds,
    }),
    title: identityCopy({
      en: 'Runner identity handoff',
      zh: 'Runner 身份交接',
    }),
  };
}

function buildStudentRunnerIdentityHandoffItemView(
  context: StudentRunnerIdentityHandoffItemBuildContext
): StudentRunnerIdentityHandoffItemView {
  const label = getStudentRunnerIdentityHandoffLabel(context.id);
  const description = getStudentRunnerIdentityHandoffDescription(context.id);
  const value = getStudentRunnerIdentityHandoffValue(context);

  return {
    ariaLabel: identityCopy({
      en: `${label}: ${value}. ${description}`,
      zh: `${label}：${value}。${description}`,
    }),
    description,
    id: context.id,
    label,
    value,
  };
}

function buildStudentRunnerIdentityHandoffPrivacyContract({
  identityView,
  itemViews,
  summaryItemIds,
}: {
  identityView: StudentRunnerIdentityView;
  itemViews: StudentRunnerIdentityHandoffItemView[];
  summaryItemIds: AnonymousAttemptSummaryItemId[];
}): StudentRunnerIdentityHandoffPrivacyContract {
  return {
    exposesAnonymousBrowserLabel: identityView.mode === 'anonymous',
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentName: false,
    exposesStudentNameInputValue: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
    mode: identityView.mode,
    scope: 'public-student-runner-identity',
    summaryItemIds,
  };
}

function getStudentRunnerIdentityHandoffLabel(
  id: StudentRunnerIdentityHandoffItemId
) {
  switch (id) {
    case 'identity-region':
      return identityCopy({ en: 'Identity region', zh: '身份区域' });
    case 'identity-mode':
      return identityCopy({ en: 'Identity mode', zh: '身份模式' });
    case 'collection-policy':
      return identityCopy({ en: 'Collection policy', zh: '收集策略' });
    case 'student-name-field':
      return identityCopy({ en: 'Student name field', zh: '学生姓名字段' });
    case 'student-name-label':
      return identityCopy({ en: 'Student name label', zh: '学生姓名标签' });
    case 'student-name-placeholder':
      return identityCopy({
        en: 'Student name placeholder',
        zh: '学生姓名占位',
      });
    case 'student-name-description':
      return identityCopy({
        en: 'Student name description',
        zh: '学生姓名说明',
      });
    case 'student-name-disabled':
      return identityCopy({ en: 'Student name disabled', zh: '姓名禁用' });
    case 'student-name-lock-policy':
      return identityCopy({ en: 'Student name lock', zh: '姓名锁定' });
    case 'student-name-value-guard':
      return identityCopy({ en: 'Student name value', zh: '姓名输入值' });
    case 'anonymous-panel':
      return identityCopy({ en: 'Anonymous panel', zh: '匿名面板' });
    case 'browser-label':
      return identityCopy({ en: 'Browser label', zh: '浏览器标签' });
    case 'browser-label-caption':
      return identityCopy({
        en: 'Browser label caption',
        zh: '浏览器标签说明',
      });
    case 'browser-label-aria':
      return identityCopy({ en: 'Browser label aria', zh: '浏览器标签 aria' });
    case 'anonymous-summary-count':
      return identityCopy({ en: 'Summary count', zh: '摘要数量' });
    case 'anonymous-summary-ids':
      return identityCopy({ en: 'Summary ids', zh: '摘要 ID' });
    case 'browser-summary':
      return identityCopy({ en: 'Browser summary', zh: '浏览器摘要' });
    case 'retry-summary':
      return identityCopy({ en: 'Retry summary', zh: '重试摘要' });
    case 'token-privacy-summary':
      return identityCopy({ en: 'Token privacy summary', zh: '令牌隐私摘要' });
    case 'retry-description':
      return identityCopy({ en: 'Retry description', zh: '重试说明' });
    case 'submission-identity-source':
      return identityCopy({ en: 'Submission identity', zh: '提交身份' });
    case 'attempt-limit-identity-boundary':
      return identityCopy({
        en: 'Attempt-limit identity',
        zh: '次数限制身份',
      });
    case 'result-review-identity-boundary':
      return identityCopy({
        en: 'Result-review identity',
        zh: '结果复盘身份',
      });
    case 'browser-token-storage-boundary':
      return identityCopy({
        en: 'Browser-token storage',
        zh: '浏览器令牌存储',
      });
    case 'normalized-name-boundary':
      return identityCopy({ en: 'Name normalization', zh: '姓名归一化' });
    case 'anonymous-token-boundary':
      return identityCopy({ en: 'Anonymous token', zh: '匿名令牌' });
    case 'answer-text-boundary':
      return identityCopy({ en: 'Answer text', zh: '答案文本' });
    case 'teacher-answer-boundary':
      return identityCopy({ en: 'Teacher answers', zh: '教师答案' });
    case 'source-material-boundary':
      return identityCopy({ en: 'Source materials', zh: '来源素材' });
    case 'privacy-guard':
      return identityCopy({ en: 'Privacy guard', zh: '隐私防护' });
  }
}

function getStudentRunnerIdentityHandoffDescription(
  id: StudentRunnerIdentityHandoffItemId
) {
  switch (id) {
    case 'identity-region':
      return identityCopy({
        en: 'The runner identity panel is labelled from the prepared identity view.',
        zh: 'runner 身份面板由已准备的身份视图提供标签。',
      });
    case 'identity-mode':
      return identityCopy({
        en: 'The active identity mode comes from assignment settings before submission.',
        zh: '当前身份模式来自提交前的作业设置。',
      });
    case 'collection-policy':
      return identityCopy({
        en: 'The panel either collects a typed student name or uses the current browser identity.',
        zh: '面板要么收集学生姓名，要么使用当前浏览器身份。',
      });
    case 'student-name-field':
      return identityCopy({
        en: 'The student-name input exists only when the assignment asks for names.',
        zh: '只有作业要求姓名时才会出现学生姓名输入框。',
      });
    case 'student-name-label':
      return identityCopy({
        en: 'The input label is metadata only and never contains the typed name.',
        zh: '输入框标签只是元数据，绝不包含学生输入姓名。',
      });
    case 'student-name-placeholder':
      return identityCopy({
        en: 'The placeholder guides entry without storing any student name value.',
        zh: '占位文案只指导输入，不存储任何学生姓名值。',
      });
    case 'student-name-description':
      return identityCopy({
        en: 'The description explains editable or locked state without copying the entered name.',
        zh: '说明文案解释可编辑或锁定状态，不复制已输入姓名。',
      });
    case 'student-name-disabled':
      return identityCopy({
        en: 'Disabled state prevents changing the submitted or in-flight student identity.',
        zh: '禁用状态防止修改已提交或正在提交的学生身份。',
      });
    case 'student-name-lock-policy':
      return identityCopy({
        en: 'The lock policy follows submission progress and previous-attempt state.',
        zh: '锁定策略跟随提交进度和已有尝试状态。',
      });
    case 'student-name-value-guard':
      return identityCopy({
        en: 'The handoff never receives the student-name input value.',
        zh: '交接永远不会接收学生姓名输入值。',
      });
    case 'anonymous-panel':
      return identityCopy({
        en: 'Anonymous assignments show browser identity guidance instead of a name field.',
        zh: '匿名作业显示浏览器身份说明，而不是姓名字段。',
      });
    case 'browser-label':
      return identityCopy({
        en: 'The visible short browser label may be shown, but the raw browser token is omitted.',
        zh: '可以显示可见的短浏览器标签，但原始浏览器令牌会被省略。',
      });
    case 'browser-label-caption':
      return identityCopy({
        en: 'The browser label caption explains the visible anonymous identity output.',
        zh: '浏览器标签说明解释可见的匿名身份输出。',
      });
    case 'browser-label-aria':
      return identityCopy({
        en: 'The browser label aria text describes the same safe visible label.',
        zh: '浏览器标签 aria 文本描述同一个安全可见标签。',
      });
    case 'anonymous-summary-count':
      return identityCopy({
        en: 'Summary count tracks prepared anonymous guidance items.',
        zh: '摘要数量跟踪已准备的匿名身份指导项。',
      });
    case 'anonymous-summary-ids':
      return identityCopy({
        en: 'Summary ids identify guidance items without revealing tokens.',
        zh: '摘要 ID 标识指导项，不泄露令牌。',
      });
    case 'browser-summary':
      return identityCopy({
        en: 'Browser summary repeats the safe visible label for assistive technology.',
        zh: '浏览器摘要为辅助技术重复安全可见标签。',
      });
    case 'retry-summary':
      return identityCopy({
        en: 'Retry summary reminds students to keep attempts in the same browser.',
        zh: '重试摘要提醒学生在同一浏览器中保持作答归属。',
      });
    case 'token-privacy-summary':
      return identityCopy({
        en: 'Token privacy summary states that raw browser tokens stay hidden.',
        zh: '令牌隐私摘要说明原始浏览器令牌保持隐藏。',
      });
    case 'retry-description':
      return identityCopy({
        en: 'Retry description is safe guidance and does not include the browser token.',
        zh: '重试说明是安全指导，不包含浏览器令牌。',
      });
    case 'submission-identity-source':
      return identityCopy({
        en: 'Submission identity is normalized later by shared assignment helpers.',
        zh: '提交身份稍后由共享作业 helper 归一化。',
      });
    case 'attempt-limit-identity-boundary':
      return identityCopy({
        en: 'Attempt limits use normalized identity rather than visible panel text.',
        zh: '作答次数限制使用归一化身份，而不是可见面板文本。',
      });
    case 'result-review-identity-boundary':
      return identityCopy({
        en: 'Teacher results use normalized display labels instead of raw anonymous tokens.',
        zh: '教师结果使用归一化显示标签，而不是原始匿名令牌。',
      });
    case 'browser-token-storage-boundary':
      return identityCopy({
        en: 'Browser token creation and storage stay outside the rendered handoff.',
        zh: '浏览器令牌创建和存储保持在渲染交接之外。',
      });
    case 'normalized-name-boundary':
      return identityCopy({
        en: 'Typed names are normalized for submission without exposing the input value here.',
        zh: '输入姓名会在提交时归一化，但这里不暴露输入值。',
      });
    case 'anonymous-token-boundary':
      return identityCopy({
        en: 'Raw anonymous browser tokens are never copied into the identity handoff.',
        zh: '原始匿名浏览器令牌永远不会复制进身份交接。',
      });
    case 'answer-text-boundary':
      return identityCopy({
        en: 'Student answer text is unrelated to identity metadata and stays omitted.',
        zh: '学生答案文本与身份元数据无关，并保持省略。',
      });
    case 'teacher-answer-boundary':
      return identityCopy({
        en: 'Teacher-only answers and explanations stay outside the identity panel.',
        zh: '教师专属答案和解释不进入身份面板。',
      });
    case 'source-material-boundary':
      return identityCopy({
        en: 'Teacher source material metadata is not part of student identity.',
        zh: '教师来源素材元数据不属于学生身份。',
      });
    case 'privacy-guard':
      return identityCopy({
        en: 'The identity handoff omits raw tokens, typed names, answers, payload rows, teacher-only answers, and source materials.',
        zh: '身份交接省略原始令牌、输入姓名、答案、载荷行、教师专属答案和来源素材。',
      });
  }
}

function getStudentRunnerIdentityHandoffValue(
  context: StudentRunnerIdentityHandoffItemBuildContext
) {
  const identityView = context.identityView;
  const anonymous = identityView.mode === 'anonymous' ? identityView : null;
  const named = identityView.mode === 'student-name' ? identityView : null;

  switch (context.id) {
    case 'identity-region':
      return identityView.ariaLabel;
    case 'identity-mode':
      return identityView.mode === 'anonymous'
        ? identityCopy({ en: 'Anonymous', zh: '匿名' })
        : identityCopy({ en: 'Student name', zh: '学生姓名' });
    case 'collection-policy':
      return named
        ? identityCopy({ en: 'Collect student name', zh: '收集学生姓名' })
        : identityCopy({ en: 'Use current browser', zh: '使用当前浏览器' });
    case 'student-name-field':
      return named
        ? identityCopy({ en: 'Available', zh: '可用' })
        : identityCopy({ en: 'Not requested', zh: '未请求' });
    case 'student-name-label':
      return (
        named?.label ?? identityCopy({ en: 'Not requested', zh: '未请求' })
      );
    case 'student-name-placeholder':
      return (
        named?.placeholder ??
        identityCopy({ en: 'Not requested', zh: '未请求' })
      );
    case 'student-name-description':
      return (
        named?.description ??
        identityCopy({ en: 'Not requested', zh: '未请求' })
      );
    case 'student-name-disabled':
      return formatIdentityBoolean(Boolean(named?.disabled));
    case 'student-name-lock-policy':
      if (!named) return identityCopy({ en: 'Not collected', zh: '未收集' });
      return named.disabled
        ? identityCopy({ en: 'Locked', zh: '已锁定' })
        : identityCopy({ en: 'Editable', zh: '可编辑' });
    case 'student-name-value-guard':
      return identityCopy({ en: 'Input value omitted', zh: '已省略输入值' });
    case 'anonymous-panel':
      return anonymous
        ? identityCopy({ en: 'Visible', zh: '可见' })
        : identityCopy({ en: 'Hidden', zh: '已隐藏' });
    case 'browser-label':
      return (
        anonymous?.copy.browserLabel ??
        identityCopy({ en: 'Not used', zh: '未使用' })
      );
    case 'browser-label-caption':
      return (
        anonymous?.copy.browserLabelCaption ??
        identityCopy({ en: 'Not used', zh: '未使用' })
      );
    case 'browser-label-aria':
      return (
        anonymous?.copy.browserLabelAriaLabel ??
        identityCopy({ en: 'Not used', zh: '未使用' })
      );
    case 'anonymous-summary-count':
      return String(anonymous?.copy.summary.itemCount ?? 0);
    case 'anonymous-summary-ids':
      return formatIdentityIdSummary(context.summaryItemIds);
    case 'browser-summary':
      return getAnonymousSummaryItemValue(anonymous, 'browser-label');
    case 'retry-summary':
      return getAnonymousSummaryItemValue(anonymous, 'retry-browser');
    case 'token-privacy-summary':
      return getAnonymousSummaryItemValue(anonymous, 'token-privacy');
    case 'retry-description':
      return (
        anonymous?.copy.retryDescription ??
        identityCopy({ en: 'Not needed', zh: '不需要' })
      );
    case 'submission-identity-source':
      return named
        ? identityCopy({ en: 'Typed name normalized', zh: '输入姓名归一化' })
        : identityCopy({
            en: 'Browser token normalized',
            zh: '浏览器令牌归一化',
          });
    case 'attempt-limit-identity-boundary':
      return identityCopy({
        en: 'Shared identity helper',
        zh: '共享身份 helper',
      });
    case 'result-review-identity-boundary':
      return identityCopy({
        en: 'Normalized display label',
        zh: '归一化显示标签',
      });
    case 'browser-token-storage-boundary':
      return identityCopy({ en: 'Storage outside DOM', zh: '存储在 DOM 外' });
    case 'normalized-name-boundary':
      return identityCopy({
        en: 'Whitespace and case normalized',
        zh: '空白和大小写归一化',
      });
    case 'anonymous-token-boundary':
      return identityCopy({ en: 'Raw token omitted', zh: '原始令牌已省略' });
    case 'answer-text-boundary':
      return identityCopy({ en: 'Answer text omitted', zh: '答案文本已省略' });
    case 'teacher-answer-boundary':
      return identityCopy({
        en: 'Teacher answers omitted',
        zh: '教师答案已省略',
      });
    case 'source-material-boundary':
      return identityCopy({
        en: 'Source materials omitted',
        zh: '来源素材已省略',
      });
    case 'privacy-guard':
      return identityCopy({ en: 'Private data omitted', zh: '已省略私密数据' });
  }
}

function getAnonymousSummaryItemValue(
  identityView: Extract<
    StudentRunnerIdentityView,
    { mode: 'anonymous' }
  > | null,
  id: AnonymousAttemptSummaryItemId
) {
  return (
    identityView?.copy.summaryItems.find((summaryItem) => summaryItem.id === id)
      ?.value ?? identityCopy({ en: 'Not used', zh: '未使用' })
  );
}

function formatIdentityBoolean(value: boolean) {
  return value
    ? identityCopy({ en: 'Yes', zh: '是' })
    : identityCopy({ en: 'No', zh: '否' });
}

function formatIdentityIdSummary(ids: readonly string[]) {
  if (ids.length === 0) {
    return identityCopy({ en: 'None', zh: '无' });
  }

  return ids.join(' · ');
}

function identityCopy(copy: { en: string; zh: string }) {
  return getLocale() === 'zh' ? copy.zh : copy.en;
}
