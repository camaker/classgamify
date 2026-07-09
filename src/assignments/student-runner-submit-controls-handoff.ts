import type {
  StudentRunnerControlView,
  StudentRunnerSubmissionPayloadSummaryMetricKey,
  StudentRunnerSubmitHintId,
  StudentRunnerSubmitReadinessItemId,
} from '@/assignments/student-runner-state';
import { getLocale } from '@/locale/paraglide/runtime';

export const STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS = [
  'controls-region',
  'readiness-status',
  'readiness-items',
  'readiness-share-link',
  'readiness-runtime-items',
  'readiness-completion',
  'readiness-confirmation',
  'readiness-submission-state',
  'payload-summary',
  'payload-metrics',
  'payload-share-link',
  'payload-item-count',
  'payload-answer-count',
  'completion-counts',
  'unanswered-count',
  'button-label',
  'button-aria',
  'button-disabled',
  'disabled-policy',
  'button-describedby',
  'confirm-incomplete-state',
  'hint-count',
  'hint-order',
  'unanswered-hint',
  'confirm-incomplete-hint',
  'read-only-hint',
  'submit-action-boundary',
  'identity-privacy',
  'payload-privacy',
  'privacy-guard',
] as const;

export type StudentRunnerSubmitControlsHandoffItemId =
  (typeof STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS)[number];

export type StudentRunnerSubmitControlsHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: StudentRunnerSubmitControlsHandoffItemId;
  label: string;
  value: string;
};

export type StudentRunnerSubmitControlsHandoffPrivacyContract = {
  exposesAnonymousToken: false;
  exposesAnswerText: false;
  exposesRawSubmissionPayload: false;
  exposesRuntimeItemIds: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  exposesTeacherSourceMaterials: false;
  hintIds: StudentRunnerSubmitHintId[];
  itemIds: StudentRunnerSubmitControlsHandoffItemId[];
  payloadMetricKeys: StudentRunnerSubmissionPayloadSummaryMetricKey[];
  readinessItemIds: StudentRunnerSubmitReadinessItemId[];
  scope: 'public-student-runner-submit-controls';
};

export type StudentRunnerSubmitControlsHandoffView = {
  description: string;
  itemViews: StudentRunnerSubmitControlsHandoffItemView[];
  privacy: StudentRunnerSubmitControlsHandoffPrivacyContract;
  title: string;
};

type StudentRunnerSubmitControlsHandoffBuildContext = {
  answeredValue: string;
  controlView: StudentRunnerControlView;
  hasButtonDescriptions: boolean;
  hasConfirmIncompleteHint: boolean;
  hasReadOnlyHint: boolean;
  hasUnansweredHint: boolean;
  itemValue: string;
  readinessItemSummary: string;
  submitDisabledPolicy: string;
  submitHintOrder: string;
  unansweredValue: string;
};

type StudentRunnerSubmitControlsHandoffItemBuildContext =
  StudentRunnerSubmitControlsHandoffBuildContext & {
    id: StudentRunnerSubmitControlsHandoffItemId;
  };

export function buildStudentRunnerSubmitControlsHandoffView(
  controlView: StudentRunnerControlView
): StudentRunnerSubmitControlsHandoffView {
  const answeredValue = getPayloadMetricValue(controlView, 'answers');
  const itemValue = getPayloadMetricValue(controlView, 'items');
  const unansweredValue = getPayloadMetricValue(controlView, 'unanswered');
  const hasReadOnlyHint = hasSubmitHint(controlView, 'read-only');
  const context: StudentRunnerSubmitControlsHandoffBuildContext = {
    answeredValue,
    controlView,
    hasButtonDescriptions: true,
    hasConfirmIncompleteHint: hasSubmitHint(controlView, 'confirm-incomplete'),
    hasReadOnlyHint,
    hasUnansweredHint: hasSubmitHint(controlView, 'unanswered'),
    itemValue,
    readinessItemSummary: formatSubmitControlsIdSummary(
      controlView.submitReadinessView.items.map((item) => item.id)
    ),
    submitDisabledPolicy: formatSubmitDisabledPolicy({
      hasReadOnlyHint,
      submitDisabled: controlView.submitDisabled,
    }),
    submitHintOrder: formatSubmitHintOrder(controlView),
    unansweredValue,
  };
  const itemViews = STUDENT_RUNNER_SUBMIT_CONTROLS_HANDOFF_ITEM_IDS.map((id) =>
    buildStudentRunnerSubmitControlsHandoffItemView({
      ...context,
      id,
    })
  );

  return {
    description: submitControlsCopy({
      en: '30-slice safe submit-control handoff for progress, prepared payload metrics, incomplete confirmation, button state, hints, and privacy boundaries before the student runner submits.',
      zh: '学生 runner 提交前，覆盖进度、已准备载荷指标、未完成确认、按钮状态、提示和隐私边界的 30 切片安全提交控件交接。',
    }),
    itemViews,
    privacy: buildStudentRunnerSubmitControlsHandoffPrivacyContract({
      controlView,
      itemViews,
    }),
    title: submitControlsCopy({
      en: 'Runner submit controls handoff',
      zh: 'Runner 提交控件交接',
    }),
  };
}

function buildStudentRunnerSubmitControlsHandoffItemView(
  context: StudentRunnerSubmitControlsHandoffItemBuildContext
): StudentRunnerSubmitControlsHandoffItemView {
  const label = getSubmitControlsHandoffLabel(context.id);
  const description = getSubmitControlsHandoffDescription(context.id);
  const value = getSubmitControlsHandoffValue(context);

  return {
    ariaLabel: submitControlsCopy({
      en: `${label}: ${value}. ${description}`,
      zh: `${label}：${value}。${description}`,
    }),
    description,
    id: context.id,
    label,
    value,
  };
}

function buildStudentRunnerSubmitControlsHandoffPrivacyContract({
  controlView,
  itemViews,
}: {
  controlView: StudentRunnerControlView;
  itemViews: StudentRunnerSubmitControlsHandoffItemView[];
}): StudentRunnerSubmitControlsHandoffPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesAnswerText: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    exposesTeacherSourceMaterials: false,
    hintIds: controlView.submitHintViews.map((hint) => hint.id),
    itemIds: itemViews.map((item) => item.id),
    payloadMetricKeys: controlView.payloadSummaryView.metrics.map(
      (metric) => metric.key
    ),
    readinessItemIds: controlView.submitReadinessView.items.map(
      (item) => item.id
    ),
    scope: 'public-student-runner-submit-controls',
  };
}

function getSubmitControlsHandoffLabel(
  id: StudentRunnerSubmitControlsHandoffItemId
) {
  switch (id) {
    case 'controls-region':
      return submitControlsCopy({ en: 'Controls region', zh: '控件区域' });
    case 'readiness-status':
      return submitControlsCopy({ en: 'Readiness status', zh: '就绪状态' });
    case 'readiness-items':
      return submitControlsCopy({ en: 'Readiness checks', zh: '就绪检查' });
    case 'readiness-share-link':
      return submitControlsCopy({
        en: 'Share-link readiness',
        zh: '分享链接就绪',
      });
    case 'readiness-runtime-items':
      return submitControlsCopy({
        en: 'Runtime-item readiness',
        zh: '运行题目就绪',
      });
    case 'readiness-completion':
      return submitControlsCopy({
        en: 'Completion readiness',
        zh: '完成状态就绪',
      });
    case 'readiness-confirmation':
      return submitControlsCopy({
        en: 'Confirmation readiness',
        zh: '确认状态就绪',
      });
    case 'readiness-submission-state':
      return submitControlsCopy({
        en: 'Submission-state readiness',
        zh: '提交状态就绪',
      });
    case 'payload-summary':
      return submitControlsCopy({ en: 'Payload summary', zh: '载荷摘要' });
    case 'payload-metrics':
      return submitControlsCopy({ en: 'Payload metrics', zh: '载荷指标' });
    case 'payload-share-link':
      return submitControlsCopy({
        en: 'Payload share-link',
        zh: '载荷分享链接',
      });
    case 'payload-item-count':
      return submitControlsCopy({
        en: 'Payload item count',
        zh: '载荷题目计数',
      });
    case 'payload-answer-count':
      return submitControlsCopy({
        en: 'Payload answer count',
        zh: '载荷答案计数',
      });
    case 'completion-counts':
      return submitControlsCopy({ en: 'Completion counts', zh: '完成计数' });
    case 'unanswered-count':
      return submitControlsCopy({ en: 'Unanswered count', zh: '未答计数' });
    case 'button-label':
      return submitControlsCopy({ en: 'Button label', zh: '按钮标签' });
    case 'button-aria':
      return submitControlsCopy({ en: 'Button aria', zh: '按钮 aria' });
    case 'button-disabled':
      return submitControlsCopy({ en: 'Button disabled', zh: '按钮禁用' });
    case 'disabled-policy':
      return submitControlsCopy({ en: 'Disabled policy', zh: '禁用策略' });
    case 'button-describedby':
      return submitControlsCopy({
        en: 'Button descriptions',
        zh: '按钮描述',
      });
    case 'confirm-incomplete-state':
      return submitControlsCopy({
        en: 'Incomplete confirmation',
        zh: '未完成确认',
      });
    case 'hint-count':
      return submitControlsCopy({ en: 'Hint count', zh: '提示数量' });
    case 'hint-order':
      return submitControlsCopy({ en: 'Hint order', zh: '提示顺序' });
    case 'unanswered-hint':
      return submitControlsCopy({ en: 'Unanswered hint', zh: '未答提示' });
    case 'confirm-incomplete-hint':
      return submitControlsCopy({
        en: 'Confirm incomplete hint',
        zh: '确认未完成提示',
      });
    case 'read-only-hint':
      return submitControlsCopy({ en: 'Read-only hint', zh: '只读提示' });
    case 'submit-action-boundary':
      return submitControlsCopy({
        en: 'Submit action boundary',
        zh: '提交动作边界',
      });
    case 'identity-privacy':
      return submitControlsCopy({ en: 'Identity privacy', zh: '身份隐私' });
    case 'payload-privacy':
      return submitControlsCopy({ en: 'Payload privacy', zh: '载荷隐私' });
    case 'privacy-guard':
      return submitControlsCopy({ en: 'Privacy guard', zh: '隐私防护' });
  }
}

function getSubmitControlsHandoffDescription(
  id: StudentRunnerSubmitControlsHandoffItemId
) {
  switch (id) {
    case 'controls-region':
      return submitControlsCopy({
        en: 'The submit section keeps readiness, payload summary, action button, and hints in one labelled region.',
        zh: '提交区域把就绪状态、载荷摘要、动作按钮和提示放在同一个有标签区域。',
      });
    case 'readiness-status':
      return submitControlsCopy({
        en: 'The readiness status is prepared before the button decides whether the next click submits or asks for confirmation.',
        zh: '按钮判断下一次点击是提交还是要求确认之前，会先准备就绪状态。',
      });
    case 'readiness-items':
      return submitControlsCopy({
        en: 'The handoff records readiness check ids, not runtime item ids or prompt text.',
        zh: '交接记录就绪检查 ID，而不是运行题目 ID 或题干文本。',
      });
    case 'readiness-share-link':
      return submitControlsCopy({
        en: 'The share-link check exposes only prepared status, not the share slug.',
        zh: '分享链接检查只暴露已准备状态，不暴露分享 slug。',
      });
    case 'readiness-runtime-items':
      return submitControlsCopy({
        en: 'Runtime-item readiness exposes only status so item ids and prompts stay hidden.',
        zh: '运行题目就绪只暴露状态，题目 ID 和题干保持隐藏。',
      });
    case 'readiness-completion':
      return submitControlsCopy({
        en: 'Completion readiness mirrors the prepared answered/unanswered status.',
        zh: '完成状态就绪镜像已准备的已答/未答状态。',
      });
    case 'readiness-confirmation':
      return submitControlsCopy({
        en: 'Confirmation readiness records whether partial-submit confirmation is armed.',
        zh: '确认状态就绪记录部分提交确认是否已进入准备状态。',
      });
    case 'readiness-submission-state':
      return submitControlsCopy({
        en: 'Submission-state readiness mirrors whether the prepared action is available or blocked.',
        zh: '提交状态就绪镜像已准备动作是否可用或被阻止。',
      });
    case 'payload-summary':
      return submitControlsCopy({
        en: 'The payload summary is reduced to safe counts and omits answer rows.',
        zh: '载荷摘要被收敛为安全计数，并省略答案行。',
      });
    case 'payload-metrics':
      return submitControlsCopy({
        en: 'Metric keys identify which safe payload counters are visible beside the submit button.',
        zh: '指标键说明提交按钮旁展示了哪些安全载荷计数。',
      });
    case 'payload-share-link':
      return submitControlsCopy({
        en: 'The share-link metric is reduced to present or missing without serializing the slug.',
        zh: '分享链接指标收敛为存在或缺失，不序列化 slug。',
      });
    case 'payload-item-count':
      return submitControlsCopy({
        en: 'The item counter mirrors the safe total runtime item count.',
        zh: '题目计数镜像安全的运行题目总数。',
      });
    case 'payload-answer-count':
      return submitControlsCopy({
        en: 'The answer counter mirrors the safe submitted-answer count.',
        zh: '答案计数镜像安全的已提交答案数量。',
      });
    case 'completion-counts':
      return submitControlsCopy({
        en: 'Answered and total counts come from the prepared payload summary.',
        zh: '已答和总数来自已准备的载荷摘要。',
      });
    case 'unanswered-count':
      return submitControlsCopy({
        en: 'The unanswered count drives the partial-submission confirmation flow.',
        zh: '未答数量会驱动部分提交确认流程。',
      });
    case 'button-label':
      return submitControlsCopy({
        en: 'The button label switches to the prepared confirmation copy when incomplete submission is armed.',
        zh: '未完成提交进入确认态时，按钮标签切换为已准备的确认文案。',
      });
    case 'button-aria':
      return submitControlsCopy({
        en: 'The button aria label describes the action and current progress without including answer text.',
        zh: '按钮 aria 标签描述动作和当前进度，不包含答案文本。',
      });
    case 'button-disabled':
      return submitControlsCopy({
        en: 'Disabled state is exposed as a boolean boundary for read-only or blocked submissions.',
        zh: '禁用状态作为只读或阻止提交的布尔边界暴露。',
      });
    case 'disabled-policy':
      return submitControlsCopy({
        en: 'The disabled policy separates enabled, blocked, and read-only submit boundaries.',
        zh: '禁用策略区分可提交、已阻止和只读提交边界。',
      });
    case 'button-describedby':
      return submitControlsCopy({
        en: 'The submit button is described by readiness, payload summary, and any active hint notes.',
        zh: '提交按钮由就绪状态、载荷摘要和任何激活提示说明。',
      });
    case 'confirm-incomplete-state':
      return submitControlsCopy({
        en: 'The confirmation flag records whether the next submit click is an explicit partial-attempt confirmation.',
        zh: '确认标记记录下一次提交点击是否是明确的部分作答确认。',
      });
    case 'hint-count':
      return submitControlsCopy({
        en: 'Hint count summarizes persistent submit guidance beside the action.',
        zh: '提示数量概括动作旁持续展示的提交指导。',
      });
    case 'hint-order':
      return submitControlsCopy({
        en: 'Hint order preserves the prepared guidance sequence using safe hint ids.',
        zh: '提示顺序使用安全提示 ID 保留已准备的指导顺序。',
      });
    case 'unanswered-hint':
      return submitControlsCopy({
        en: 'The unanswered hint is present when students have unanswered runtime items.',
        zh: '学生仍有未答运行题目时会出现未答提示。',
      });
    case 'confirm-incomplete-hint':
      return submitControlsCopy({
        en: 'The confirm-incomplete hint is present only after the first partial-submit click arms confirmation.',
        zh: '确认未完成提示只会在第一次部分提交点击进入确认态后出现。',
      });
    case 'read-only-hint':
      return submitControlsCopy({
        en: 'Read-only guidance appears when submission is blocked by result, limit, or expired timer state.',
        zh: '结果、次数限制或计时结束阻止提交时，会出现只读指导。',
      });
    case 'submit-action-boundary':
      return submitControlsCopy({
        en: 'The handoff describes button state only; it does not execute or mutate submissions.',
        zh: '交接只描述按钮状态，不执行或改变提交。',
      });
    case 'identity-privacy':
      return submitControlsCopy({
        en: 'Student names and anonymous browser tokens are excluded from submit-control metadata.',
        zh: '学生姓名和匿名浏览器令牌不会进入提交控件元数据。',
      });
    case 'payload-privacy':
      return submitControlsCopy({
        en: 'Raw answer payload rows, answer text, and runtime item ids stay out of the submit-control handoff.',
        zh: '原始答案载荷行、答案文本和运行题目 ID 不进入提交控件交接。',
      });
    case 'privacy-guard':
      return submitControlsCopy({
        en: 'The handoff omits share text, student identity, answer text, raw payload rows, runtime item ids, teacher answers, and source materials.',
        zh: '交接省略分享文本、学生身份、答案文本、原始载荷行、运行题目 ID、教师答案和来源素材。',
      });
  }
}

function getSubmitControlsHandoffValue(
  context: StudentRunnerSubmitControlsHandoffItemBuildContext
) {
  switch (context.id) {
    case 'controls-region':
      return context.controlView.submitControlsLabel;
    case 'readiness-status':
      return context.controlView.submitReadinessView.statusLabel;
    case 'readiness-items':
      return context.readinessItemSummary;
    case 'readiness-share-link':
      return getReadinessItemStatusLabel(context.controlView, 'share-link');
    case 'readiness-runtime-items':
      return getReadinessItemStatusLabel(context.controlView, 'runtime-items');
    case 'readiness-completion':
      return getReadinessItemStatusLabel(context.controlView, 'completion');
    case 'readiness-confirmation':
      return getReadinessItemStatusLabel(
        context.controlView,
        'incomplete-confirmation'
      );
    case 'readiness-submission-state':
      return getReadinessItemStatusLabel(
        context.controlView,
        'submission-state'
      );
    case 'payload-summary':
      return context.controlView.payloadSummaryView.title;
    case 'payload-metrics':
      return formatSubmitControlsIdSummary(
        context.controlView.payloadSummaryView.metrics.map(
          (metric) => metric.key
        )
      );
    case 'payload-share-link':
      return formatPayloadShareLinkPresence(context.controlView);
    case 'payload-item-count':
      return context.itemValue;
    case 'payload-answer-count':
      return context.answeredValue;
    case 'completion-counts':
      return submitControlsCopy({
        en: `${context.answeredValue}/${context.itemValue}`,
        zh: `${context.answeredValue}/${context.itemValue}`,
      });
    case 'unanswered-count':
      return context.unansweredValue;
    case 'button-label':
      return context.controlView.submitButtonLabel;
    case 'button-aria':
      return context.controlView.submitButtonAriaLabel;
    case 'button-disabled':
      return formatSubmitControlsBoolean(context.controlView.submitDisabled);
    case 'disabled-policy':
      return context.submitDisabledPolicy;
    case 'button-describedby':
      return context.hasButtonDescriptions
        ? submitControlsCopy({ en: 'Ready', zh: '已准备' })
        : submitControlsCopy({ en: 'Missing', zh: '缺失' });
    case 'confirm-incomplete-state':
      return formatSubmitControlsBoolean(
        context.controlView.requiresIncompleteSubmitConfirmation
      );
    case 'hint-count':
      return String(context.controlView.submitHintViews.length);
    case 'hint-order':
      return context.submitHintOrder;
    case 'unanswered-hint':
      return formatSubmitControlsBoolean(context.hasUnansweredHint);
    case 'confirm-incomplete-hint':
      return formatSubmitControlsBoolean(context.hasConfirmIncompleteHint);
    case 'read-only-hint':
      return formatSubmitControlsBoolean(context.hasReadOnlyHint);
    case 'submit-action-boundary':
      return submitControlsCopy({ en: 'No mutation', zh: '不变更数据' });
    case 'identity-privacy':
      return submitControlsCopy({ en: 'Identity hidden', zh: '身份已隐藏' });
    case 'payload-privacy':
      return submitControlsCopy({ en: 'Payload summarized', zh: '载荷已摘要' });
    case 'privacy-guard':
      return submitControlsCopy({
        en: 'Private data omitted',
        zh: '已省略私密数据',
      });
  }
}

function getPayloadMetricValue(
  controlView: StudentRunnerControlView,
  key: StudentRunnerSubmissionPayloadSummaryMetricKey
) {
  return (
    controlView.payloadSummaryView.metrics.find((metric) => metric.key === key)
      ?.value ?? '0'
  );
}

function getReadinessItemStatusLabel(
  controlView: StudentRunnerControlView,
  id: StudentRunnerSubmitReadinessItemId
) {
  return (
    controlView.submitReadinessView.items.find((item) => item.id === id)
      ?.statusLabel ?? submitControlsCopy({ en: 'Missing', zh: '缺失' })
  );
}

function formatPayloadShareLinkPresence(controlView: StudentRunnerControlView) {
  const shareLinkValue = controlView.payloadSummaryView.metrics.find(
    (metric) => metric.key === 'share-link'
  )?.value;

  return shareLinkValue
    ? submitControlsCopy({ en: 'Present', zh: '存在' })
    : submitControlsCopy({ en: 'Missing', zh: '缺失' });
}

function hasSubmitHint(
  controlView: StudentRunnerControlView,
  id: StudentRunnerSubmitHintId
) {
  return controlView.submitHintViews.some((hint) => hint.id === id);
}

function formatSubmitControlsBoolean(value: boolean) {
  return value
    ? submitControlsCopy({ en: 'Yes', zh: '是' })
    : submitControlsCopy({ en: 'No', zh: '否' });
}

function formatSubmitDisabledPolicy({
  hasReadOnlyHint,
  submitDisabled,
}: {
  hasReadOnlyHint: boolean;
  submitDisabled: boolean;
}) {
  if (hasReadOnlyHint) {
    return submitControlsCopy({
      en: 'Read-only blocked',
      zh: '只读阻止',
    });
  }

  if (submitDisabled) {
    return submitControlsCopy({ en: 'Blocked', zh: '已阻止' });
  }

  return submitControlsCopy({ en: 'Enabled', zh: '可提交' });
}

function formatSubmitHintOrder(controlView: StudentRunnerControlView) {
  return formatSubmitControlsIdSummary(
    controlView.submitHintViews.map((hint) => hint.id)
  );
}

function formatSubmitControlsIdSummary(ids: string[]) {
  if (ids.length === 0) {
    return submitControlsCopy({ en: 'None', zh: '无' });
  }

  return ids.join(' · ');
}

function submitControlsCopy(copy: { en: string; zh: string }) {
  return getLocale() === 'zh' ? copy.zh : copy.en;
}
