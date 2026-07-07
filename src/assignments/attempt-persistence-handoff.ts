import type { ActivityTemplateType } from '@/activities/types';
import type { ScoredAttemptInsert } from '@/assignments/attempt-persistence';
import { getLocale } from '@/locale/paraglide/runtime';

export const ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS = [
  'persistence-scope',
  'api-lifecycle-gate',
  'api-identity-gate',
  'attempt-limit-gate',
  'runtime-validation-gate',
  'scoring-source',
  'insert-builder',
  'assignment-id',
  'attempt-id',
  'started-at',
  'completed-at',
  'student-name-identity',
  'anonymous-token-identity',
  'answers-json',
  'template-type',
  'answer-correctness',
  'result-json',
  'score-source',
  'max-score-source',
  'duration-source',
  'immutable-answer-copy',
  'immutable-result-copy',
  'public-result-boundary',
  'review-summary-boundary',
  'result-analysis-boundary',
  'attempt-stats-boundary',
  'csv-export-boundary',
  'source-material-guard',
  'raw-payload-guard',
  'privacy-guard',
] as const;

export type AssignmentAttemptPersistenceHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptPersistenceIdentityMode =
  | 'anonymous'
  | 'none'
  | 'student-name';

export type AssignmentAttemptPersistenceHandoffSourceChecks = {
  apiIdentityGate: boolean;
  apiLifecycleGate: boolean;
  apiUsesPersistenceHelper: boolean;
  attemptLimitGate: boolean;
  attemptStatsUsesResultJson: boolean;
  csvExportUsesStoredAttempts: boolean;
  publicResultUsesSanitizedResult: boolean;
  resultAnalysisUsesStoredAnswers: boolean;
  reviewSummaryUsesEvaluation: boolean;
  runtimeValidationGate: boolean;
};

export type AssignmentAttemptPersistenceHandoffEvidence = {
  answerCorrectCount: number;
  answerRowCount: number;
  answersJsonCloned: boolean;
  assignmentIdStored: boolean;
  attemptIdStored: boolean;
  completedAtStored: boolean;
  durationSeconds?: number;
  identityMode: AssignmentAttemptPersistenceIdentityMode;
  maxScore: number;
  resultAccuracy: number;
  resultJsonCloned: boolean;
  resultTotalPoints: number;
  score: number;
  sourceChecks: AssignmentAttemptPersistenceHandoffSourceChecks;
  startedAtStored: boolean;
  templateType: ActivityTemplateType;
};

export type AssignmentAttemptPersistenceHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptPersistenceHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptPersistenceHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesRawAnonymousToken: false;
  exposesRawSubmissionPayload: false;
  exposesRuntimeItemIds: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswers: false;
  itemIds: AssignmentAttemptPersistenceHandoffItemId[];
  mutatesEvaluationAfterInsert: false;
  scope: 'assignment-attempt-persistence-boundary';
  storesScoredAttemptRows: true;
  usesScoredAttemptInsertHelper: true;
};

export type AssignmentAttemptPersistenceHandoffView = {
  description: string;
  itemViews: AssignmentAttemptPersistenceHandoffItemView[];
  privacy: AssignmentAttemptPersistenceHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentAttemptPersistenceHandoffEvidence({
  answersJsonCloned,
  insert,
  resultJsonCloned,
  sourceChecks,
}: {
  answersJsonCloned: boolean;
  insert: ScoredAttemptInsert;
  resultJsonCloned: boolean;
  sourceChecks: AssignmentAttemptPersistenceHandoffSourceChecks;
}): AssignmentAttemptPersistenceHandoffEvidence {
  return {
    answerCorrectCount: normalizePersistenceCount(
      insert.answersJson.answers.filter((answer) => answer.correct).length
    ),
    answerRowCount: normalizePersistenceCount(
      insert.answersJson.answers.length
    ),
    answersJsonCloned,
    assignmentIdStored: Boolean(insert.assignmentId),
    attemptIdStored: Boolean(insert.id),
    completedAtStored: insert.completedAt instanceof Date,
    durationSeconds: normalizeOptionalPersistenceCount(
      insert.resultJson.durationSeconds
    ),
    identityMode: getPersistenceIdentityMode(insert),
    maxScore: normalizePersistenceCount(insert.maxScore),
    resultAccuracy: normalizePersistencePercent(insert.resultJson.accuracy),
    resultJsonCloned,
    resultTotalPoints: normalizePersistenceCount(insert.resultJson.totalPoints),
    score: normalizePersistenceCount(insert.score, {
      max: insert.maxScore,
    }),
    sourceChecks,
    startedAtStored: insert.startedAt instanceof Date,
    templateType: insert.answersJson.templateType,
  };
}

export function buildAssignmentAttemptPersistenceHandoffView(
  evidence: AssignmentAttemptPersistenceHandoffEvidence
): AssignmentAttemptPersistenceHandoffView {
  const itemViews = ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentAttemptPersistenceHandoffItemView({ evidence, id })
  );

  return {
    description: t({
      en: '30-slice scored-attempt persistence contract for keeping submission gates, scoring output, immutable attempt JSON, public feedback, result analysis, stats, and CSV export on the same helper boundary.',
      zh: '30 切片已评分作答持久化契约，确保提交门禁、评分输出、不可变作答 JSON、公开反馈、结果分析、统计和 CSV 导出共用同一 helper 边界。',
    }),
    itemViews,
    privacy: buildAssignmentAttemptPersistencePrivacyContract(itemViews),
    title: t({
      en: 'Attempt persistence handoff',
      zh: '作答持久化交接',
    }),
  };
}

function buildAssignmentAttemptPersistenceHandoffItemView({
  evidence,
  id,
}: {
  evidence: AssignmentAttemptPersistenceHandoffEvidence;
  id: AssignmentAttemptPersistenceHandoffItemId;
}): AssignmentAttemptPersistenceHandoffItemView {
  const copy = getAssignmentAttemptPersistenceItemCopy(id);
  const value = getAssignmentAttemptPersistenceItemValue(id, evidence);

  return {
    ariaLabel: t({
      en: `${copy.label}: ${value}. ${copy.description}`,
      zh: `${copy.label}：${value}。${copy.description}`,
    }),
    description: copy.description,
    id,
    label: copy.label,
    value,
  };
}

function getAssignmentAttemptPersistenceItemValue(
  id: AssignmentAttemptPersistenceHandoffItemId,
  evidence: AssignmentAttemptPersistenceHandoffEvidence
) {
  switch (id) {
    case 'persistence-scope':
      return t({ en: 'Scored attempt insert', zh: '已评分作答写入' });
    case 'api-lifecycle-gate':
      return formatPersistenceReady(evidence.sourceChecks.apiLifecycleGate);
    case 'api-identity-gate':
      return formatPersistenceReady(evidence.sourceChecks.apiIdentityGate);
    case 'attempt-limit-gate':
      return formatPersistenceReady(evidence.sourceChecks.attemptLimitGate);
    case 'runtime-validation-gate':
      return formatPersistenceReady(
        evidence.sourceChecks.runtimeValidationGate
      );
    case 'scoring-source':
      return t({ en: 'Runtime evaluation', zh: '运行评分结果' });
    case 'insert-builder':
      return evidence.sourceChecks.apiUsesPersistenceHelper
        ? 'buildScoredAttemptInsert'
        : formatPersistenceNeedsReview();
    case 'assignment-id':
      return formatPersistenceStored(evidence.assignmentIdStored);
    case 'attempt-id':
      return formatPersistenceStored(evidence.attemptIdStored);
    case 'started-at':
      return formatPersistenceStored(evidence.startedAtStored);
    case 'completed-at':
      return formatPersistenceStored(evidence.completedAtStored);
    case 'student-name-identity':
      return evidence.identityMode === 'student-name'
        ? formatPersistenceStored(true)
        : formatPersistenceNotUsed();
    case 'anonymous-token-identity':
      return evidence.identityMode === 'anonymous'
        ? formatPersistenceStored(true)
        : formatPersistenceNotUsed();
    case 'answers-json':
      return t({
        en: `${evidence.answerRowCount} answer rows`,
        zh: `${evidence.answerRowCount} 条答案`,
      });
    case 'template-type':
      return evidence.templateType;
    case 'answer-correctness':
      return t({
        en: `${evidence.answerCorrectCount} correct`,
        zh: `${evidence.answerCorrectCount} 条正确`,
      });
    case 'result-json':
      return t({
        en: `${evidence.resultTotalPoints} total points`,
        zh: `${evidence.resultTotalPoints} 总分`,
      });
    case 'score-source':
      return t({
        en: `${evidence.score} earned`,
        zh: `${evidence.score} 得分`,
      });
    case 'max-score-source':
      return t({
        en: `${evidence.maxScore} max`,
        zh: `${evidence.maxScore} 最高分`,
      });
    case 'duration-source':
      return evidence.durationSeconds === undefined
        ? t({ en: 'Not recorded', zh: '未记录' })
        : t({
            en: `${evidence.durationSeconds}s`,
            zh: `${evidence.durationSeconds} 秒`,
          });
    case 'immutable-answer-copy':
      return formatPersistenceCloned(evidence.answersJsonCloned);
    case 'immutable-result-copy':
      return formatPersistenceCloned(evidence.resultJsonCloned);
    case 'public-result-boundary':
      return formatPersistenceReady(
        evidence.sourceChecks.publicResultUsesSanitizedResult
      );
    case 'review-summary-boundary':
      return evidence.sourceChecks.reviewSummaryUsesEvaluation
        ? t({ en: 'Evaluation summary', zh: '评分摘要' })
        : formatPersistenceNeedsReview();
    case 'result-analysis-boundary':
      return evidence.sourceChecks.resultAnalysisUsesStoredAnswers
        ? t({ en: 'Stored attempts', zh: '已存作答' })
        : formatPersistenceNeedsReview();
    case 'attempt-stats-boundary':
      return evidence.sourceChecks.attemptStatsUsesResultJson
        ? t({ en: 'Result JSON', zh: '结果 JSON' })
        : formatPersistenceNeedsReview();
    case 'csv-export-boundary':
      return evidence.sourceChecks.csvExportUsesStoredAttempts
        ? t({ en: 'Full assignment results', zh: '完整作业结果' })
        : formatPersistenceNeedsReview();
    case 'source-material-guard':
      return t({ en: 'Not persisted', zh: '不写入' });
    case 'raw-payload-guard':
      return t({ en: 'Raw payload hidden', zh: 'Raw payload 已隐藏' });
    case 'privacy-guard':
      return t({ en: 'Private data hidden', zh: '私密数据已隐藏' });
  }
}

function getAssignmentAttemptPersistenceItemCopy(
  id: AssignmentAttemptPersistenceHandoffItemId
) {
  return ATTEMPT_PERSISTENCE_ITEM_COPY[id];
}

const ATTEMPT_PERSISTENCE_ITEM_COPY = {
  'persistence-scope': {
    label: t({ en: 'Persistence scope', zh: '持久化范围' }),
    description: t({
      en: 'Only a scored attempt row is prepared after submission gates, runtime validation, and scoring pass.',
      zh: '只有在提交门禁、运行题目校验和评分通过后，才准备已评分作答行。',
    }),
  },
  'api-lifecycle-gate': {
    label: t({ en: 'Lifecycle gate', zh: '生命周期门禁' }),
    description: t({
      en: 'The submit API verifies the assignment is open before any scored attempt row can be inserted.',
      zh: '提交 API 会先确认作业可作答，再允许写入已评分作答行。',
    }),
  },
  'api-identity-gate': {
    label: t({ en: 'Identity gate', zh: '身份门禁' }),
    description: t({
      en: 'Named-student or anonymous-browser identity is resolved before attempt limits and persistence.',
      zh: '具名学生或匿名浏览器身份会在作答次数限制和持久化前先解析。',
    }),
  },
  'attempt-limit-gate': {
    label: t({ en: 'Attempt limit gate', zh: '次数门禁' }),
    description: t({
      en: 'Max-attempt enforcement runs before the insert helper receives scored evaluation data.',
      zh: '最大作答次数 enforcement 会在 insert helper 收到评分结果前执行。',
    }),
  },
  'runtime-validation-gate': {
    label: t({ en: 'Runtime validation', zh: '运行题目校验' }),
    description: t({
      en: 'Submitted answer item ids are normalized and checked against the frozen runtime item list before scoring.',
      zh: '提交答案 item id 会先规范化并对照冻结运行题目列表，再进入评分。',
    }),
  },
  'scoring-source': {
    label: t({ en: 'Scoring source', zh: '评分来源' }),
    description: t({
      en: 'The insert helper consumes the runtime evaluation produced from normalized submitted answers.',
      zh: '写入 helper 消费由规范化提交答案生成的运行评分结果。',
    }),
  },
  'insert-builder': {
    label: t({ en: 'Insert helper', zh: '写入 helper' }),
    description: t({
      en: 'The API delegates attempt-row shape to buildScoredAttemptInsert instead of rebuilding JSON columns inline.',
      zh: 'API 把作答行结构委托给 buildScoredAttemptInsert，而不是内联重建 JSON 列。',
    }),
  },
  'assignment-id': {
    label: t({ en: 'Assignment id', zh: '作业 id' }),
    description: t({
      en: 'The stored attempt keeps the owner-created assignment id for result review and export queries.',
      zh: '已存作答保留老师创建的作业 id，用于结果复盘和导出查询。',
    }),
  },
  'attempt-id': {
    label: t({ en: 'Attempt id', zh: '作答 id' }),
    description: t({
      en: 'The generated attempt id is stored as the row identity without appearing in safe handoff values.',
      zh: '生成的作答 id 会作为行身份写入，但不会出现在安全交接值中。',
    }),
  },
  'started-at': {
    label: t({ en: 'Started at', zh: '开始时间' }),
    description: t({
      en: 'Started-at is derived from completion time and normalized duration, preserving timer-aware review data.',
      zh: '开始时间由完成时间和规范化用时推导，保留支持计时的复盘数据。',
    }),
  },
  'completed-at': {
    label: t({ en: 'Completed at', zh: '完成时间' }),
    description: t({
      en: 'Completion time is stored with the scored attempt for result ordering and student follow-up.',
      zh: '完成时间随已评分作答写入，用于结果排序和学生跟进。',
    }),
  },
  'student-name-identity': {
    label: t({ en: 'Student-name identity', zh: '具名身份' }),
    description: t({
      en: 'When the assignment collects names, only the normalized stored identity participates in result review.',
      zh: '当作业收集姓名时，只有规范化后的存储身份参与结果复盘。',
    }),
  },
  'anonymous-token-identity': {
    label: t({ en: 'Anonymous identity', zh: '匿名身份' }),
    description: t({
      en: 'Anonymous links store the normalized browser token while safe handoffs omit the raw token text.',
      zh: '匿名链接会存储规范化浏览器 token，而安全交接省略原始 token 文本。',
    }),
  },
  'answers-json': {
    label: t({ en: 'Answers JSON', zh: '答案 JSON' }),
    description: t({
      en: 'Answers JSON stores normalized scored answer rows plus the template type used for the frozen attempt.',
      zh: '答案 JSON 存储规范化评分答案行，以及该冻结作答使用的模板类型。',
    }),
  },
  'template-type': {
    label: t({ en: 'Template type', zh: '模板类型' }),
    description: t({
      en: 'Template type is persisted beside answer rows so future result review can interpret the attempt shape.',
      zh: '模板类型随答案行写入，让未来结果复盘能解释作答形态。',
    }),
  },
  'answer-correctness': {
    label: t({ en: 'Answer correctness', zh: '答案正确性' }),
    description: t({
      en: 'Each persisted answer row carries only the scored correctness flag needed by result analysis.',
      zh: '每条已存答案只携带结果分析需要的评分正确性标记。',
    }),
  },
  'result-json': {
    label: t({ en: 'Result JSON', zh: '结果 JSON' }),
    description: t({
      en: 'Result JSON stores earned points, total points, accuracy, completed count, correct count, and duration.',
      zh: '结果 JSON 存储得分、总分、正确率、完成数、正确数和用时。',
    }),
  },
  'score-source': {
    label: t({ en: 'Stored score', zh: '已存得分' }),
    description: t({
      en: 'The score column is derived from evaluation.result.earnedPoints to stay aligned with result JSON.',
      zh: 'score 列来自 evaluation.result.earnedPoints，以保持和结果 JSON 对齐。',
    }),
  },
  'max-score-source': {
    label: t({ en: 'Max score', zh: '最高分' }),
    description: t({
      en: 'The maxScore column is derived from evaluation.result.totalPoints for result table and export labels.',
      zh: 'maxScore 列来自 evaluation.result.totalPoints，用于结果表和导出标签。',
    }),
  },
  'duration-source': {
    label: t({ en: 'Duration source', zh: '用时来源' }),
    description: t({
      en: 'Persisted duration comes from the timer-normalized result, not raw page-load time or unbounded client clocks.',
      zh: '已存用时来自计时规范化结果，而不是原始页面加载时间或未限制的客户端时钟。',
    }),
  },
  'immutable-answer-copy': {
    label: t({ en: 'Answer copy', zh: '答案复制' }),
    description: t({
      en: 'Answer rows are copied into the insert payload so later mutation of the evaluation object cannot alter prepared persistence data.',
      zh: '答案行会复制进写入 payload，避免后续修改 evaluation 对象影响已准备的持久化数据。',
    }),
  },
  'immutable-result-copy': {
    label: t({ en: 'Result copy', zh: '结果复制' }),
    description: t({
      en: 'Result JSON is copied into the insert payload, preserving the scored attempt as a frozen record.',
      zh: '结果 JSON 会复制进写入 payload，把已评分作答保留为冻结记录。',
    }),
  },
  'public-result-boundary': {
    label: t({ en: 'Public result', zh: '公开结果' }),
    description: t({
      en: 'The student response returns a sanitized public result view derived from the same scored result JSON.',
      zh: '学生响应返回由同一评分结果 JSON 派生的安全公开结果视图。',
    }),
  },
  'review-summary-boundary': {
    label: t({ en: 'Review summary', zh: '复盘摘要' }),
    description: t({
      en: 'Post-submit review summaries are built from the evaluation and frozen runtime items without reading private source materials.',
      zh: '提交后的复盘摘要由评分结果和冻结运行题目生成，不读取私有来源素材。',
    }),
  },
  'result-analysis-boundary': {
    label: t({ en: 'Result analysis', zh: '结果分析' }),
    description: t({
      en: 'Teacher result analysis reads stored attempt answers and result JSON rather than public runner internals.',
      zh: '教师结果分析读取已存答案和结果 JSON，而不是公开 runner 内部细节。',
    }),
  },
  'attempt-stats-boundary': {
    label: t({ en: 'Attempt stats', zh: '作答统计' }),
    description: t({
      en: 'Assignment metrics derive completions, accuracy, points, and duration from scored result records.',
      zh: '作业指标从已评分结果记录推导完成数、正确率、分数和用时。',
    }),
  },
  'csv-export-boundary': {
    label: t({ en: 'CSV export', zh: 'CSV 导出' }),
    description: t({
      en: 'CSV export remains a teacher-only full-results boundary over stored attempts.',
      zh: 'CSV 导出保持为基于已存作答的教师专属完整结果边界。',
    }),
  },
  'source-material-guard': {
    label: t({ en: 'Source materials', zh: '来源素材' }),
    description: t({
      en: 'Attempt persistence stores scored answer data, not teacher source-material filenames, file ids, or storage metadata.',
      zh: '作答持久化只存评分答案数据，不存教师来源素材文件名、文件 id 或存储元数据。',
    }),
  },
  'raw-payload-guard': {
    label: t({ en: 'Raw payload guard', zh: 'Raw payload 防护' }),
    description: t({
      en: 'Safe handoff values report counts and boundaries, never raw submitted answer rows.',
      zh: '安全交接值只报告数量和边界，绝不展示原始提交答案行。',
    }),
  },
  'privacy-guard': {
    label: t({ en: 'Privacy guard', zh: '隐私防护' }),
    description: t({
      en: 'Persistence handoffs omit answer text, student names, raw anonymous tokens, runtime item ids, teacher-only answers, and source-material metadata.',
      zh: '持久化交接省略答案文本、学生姓名、原始匿名 token、运行题目 id、教师专属答案和来源素材元数据。',
    }),
  },
} as const satisfies Record<
  AssignmentAttemptPersistenceHandoffItemId,
  {
    description: string;
    label: string;
  }
>;

function buildAssignmentAttemptPersistencePrivacyContract(
  itemViews: AssignmentAttemptPersistenceHandoffItemView[]
): AssignmentAttemptPersistenceHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesRawAnonymousToken: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesEvaluationAfterInsert: false,
    scope: 'assignment-attempt-persistence-boundary',
    storesScoredAttemptRows: true,
    usesScoredAttemptInsertHelper: true,
  };
}

function getPersistenceIdentityMode(
  insert: Pick<ScoredAttemptInsert, 'anonymousToken' | 'studentName'>
): AssignmentAttemptPersistenceIdentityMode {
  if (insert.studentName) return 'student-name';
  if (insert.anonymousToken) return 'anonymous';
  return 'none';
}

function formatPersistenceReady(ready: boolean) {
  return ready
    ? t({ en: 'Ready', zh: '已就绪' })
    : formatPersistenceNeedsReview();
}

function formatPersistenceStored(stored: boolean) {
  return stored
    ? t({ en: 'Stored', zh: '已存储' })
    : formatPersistenceNeedsReview();
}

function formatPersistenceCloned(cloned: boolean) {
  return cloned
    ? t({ en: 'Cloned', zh: '已复制' })
    : formatPersistenceNeedsReview();
}

function formatPersistenceNeedsReview() {
  return t({ en: 'Needs review', zh: '需要检查' });
}

function formatPersistenceNotUsed() {
  return t({ en: 'Not used', zh: '未使用' });
}

function normalizePersistenceCount(
  value: number,
  options?: {
    max?: number;
  }
) {
  const normalized = Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;
  if (options?.max === undefined || !Number.isFinite(options.max)) {
    return normalized;
  }

  return Math.min(normalized, Math.max(0, Math.floor(options.max)));
}

function normalizeOptionalPersistenceCount(value: number | undefined) {
  return value === undefined ? undefined : normalizePersistenceCount(value);
}

function normalizePersistencePercent(value: number) {
  return normalizePersistenceCount(value, { max: 100 });
}

function t(copy: { en: string; zh: string }) {
  return getLocale() === 'zh' ? copy.zh : copy.en;
}
