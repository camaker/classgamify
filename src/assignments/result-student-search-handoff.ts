import {
  type AssignmentResultReviewScopeSummary,
  normalizeResultSearch,
} from '@/assignments/result-filters';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import { getLocale } from '@/locale/paraglide/runtime';

export const ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS = [
  'search-scope',
  'route-parser',
  'route-update-helper',
  'query-normalization',
  'width-normalization',
  'whitespace-collapse',
  'route-default-elision',
  'invalid-route-guard',
  'control-status',
  'control-description',
  'resolved-search',
  'total-students',
  'matched-students',
  'matched-attempt-rows',
  'matched-answer-reviews',
  'matched-copy-students',
  'matched-copy-attempts',
  'student-empty-state',
  'attempt-empty-state',
  'answer-review-empty-state',
  'anonymous-label-search',
  'named-label-search',
  'student-table-consumer',
  'attempt-table-consumer',
  'answer-review-consumer',
  'review-scope-consumer',
  'copy-artifact-consumer',
  'raw-query-guard',
  'student-answer-guard',
  'privacy-guard',
] as const;

export type AssignmentResultStudentSearchHandoffItemId =
  (typeof ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS)[number];

export type AssignmentResultStudentSearchHandoffEvidence = {
  answerReviewEmptyState: AssignmentResultStudentSearchEmptyState;
  copyAttemptCount: number;
  copyStudentCount: number;
  hasNormalizedSearch: boolean;
  matchedAnswerReviewCount: number;
  matchedAttemptRowCount: number;
  matchedStudentCount: number;
  normalizedSearchHidden: boolean;
  rawQueryHidden: boolean;
  totalAnswerReviewCount: number;
  totalAttemptRowCount: number;
  totalStudentCount: number;
  attemptEmptyState: AssignmentResultStudentSearchEmptyState;
  studentEmptyState: AssignmentResultStudentSearchEmptyState;
};

export type AssignmentResultStudentSearchHandoffInput = {
  search: string;
  searchDescription: string;
  searchStatusDescription: string;
  searchStatusLabel: string;
  summary: AssignmentResultReviewScopeSummary;
};

export type AssignmentResultStudentSearchEmptyState =
  | 'no-data'
  | 'ready'
  | 'search-no-matches';

export type AssignmentResultStudentSearchHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentResultStudentSearchHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type AssignmentResultStudentSearchHandoffPrivacyContract = {
  exposesAnswerReviewText: false;
  exposesCopyArtifactText: false;
  exposesRawAnonymousToken: false;
  exposesRawRouteQuery: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabels: false;
  exposesStudentKeys: false;
  exposesTeacherAnswerKey: false;
  itemIds: AssignmentResultStudentSearchHandoffItemId[];
  mutatesResultData: false;
  scope: 'teacher-result-student-search';
  usesAssignmentDomainHelpers: true;
  usesCurrentReviewScope: true;
};

export type AssignmentResultStudentSearchHandoffView = {
  description: string;
  itemViews: AssignmentResultStudentSearchHandoffItemView[];
  privacy: AssignmentResultStudentSearchHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentResultStudentSearchHandoffEvidence({
  search,
  summary,
}: Pick<
  AssignmentResultStudentSearchHandoffInput,
  'search' | 'summary'
>): AssignmentResultStudentSearchHandoffEvidence {
  const hasNormalizedSearch = Boolean(normalizeResultSearch(search));
  const totalStudentCount = normalizeStudentSearchHandoffCount(
    summary.students.total
  );
  const matchedStudentCount = normalizeStudentSearchHandoffCount(
    summary.students.matched
  );
  const totalAttemptRowCount = normalizeStudentSearchHandoffCount(
    summary.attemptRows.total
  );
  const matchedAttemptRowCount = normalizeStudentSearchHandoffCount(
    summary.attemptRows.matched
  );
  const totalAnswerReviewCount = normalizeStudentSearchHandoffCount(
    summary.attemptReviews.total
  );
  const matchedAnswerReviewCount = normalizeStudentSearchHandoffCount(
    summary.attemptReviews.matched
  );

  return {
    answerReviewEmptyState: resolveSearchEmptyState({
      hasNormalizedSearch,
      matched: matchedAnswerReviewCount,
      total: totalAnswerReviewCount,
    }),
    attemptEmptyState: resolveSearchEmptyState({
      hasNormalizedSearch,
      matched: matchedAttemptRowCount,
      total: totalAttemptRowCount,
    }),
    copyAttemptCount: matchedAnswerReviewCount,
    copyStudentCount: matchedStudentCount,
    hasNormalizedSearch,
    matchedAnswerReviewCount,
    matchedAttemptRowCount,
    matchedStudentCount,
    normalizedSearchHidden: true,
    rawQueryHidden: true,
    studentEmptyState: resolveSearchEmptyState({
      hasNormalizedSearch,
      matched: matchedStudentCount,
      total: totalStudentCount,
    }),
    totalAnswerReviewCount,
    totalAttemptRowCount,
    totalStudentCount,
  };
}

export function buildAssignmentResultStudentSearchHandoffView(
  input: AssignmentResultStudentSearchHandoffInput
): AssignmentResultStudentSearchHandoffView {
  const evidence = buildAssignmentResultStudentSearchHandoffEvidence(input);
  const itemViews = ASSIGNMENT_RESULT_STUDENT_SEARCH_HANDOFF_ITEM_IDS.map(
    (id) =>
      buildAssignmentResultStudentSearchHandoffItemView(id, input, evidence)
  );

  return {
    description: t({
      en: 'Thirty-slice student-search contract for route state, query normalization, matched result scopes, empty states, copy scope, table consumers, and privacy guards.',
      zh: '学生搜索三十切片契约，用于交接路由状态、查询规范化、匹配结果范围、空状态、复制范围、表格消费者和隐私防护。',
    }),
    itemViews,
    privacy:
      buildAssignmentResultStudentSearchHandoffPrivacyContract(itemViews),
    title: t({
      en: 'Student search handoff',
      zh: '学生搜索交接',
    }),
  };
}

function buildAssignmentResultStudentSearchHandoffItemView(
  id: AssignmentResultStudentSearchHandoffItemId,
  input: AssignmentResultStudentSearchHandoffInput,
  evidence: AssignmentResultStudentSearchHandoffEvidence
): AssignmentResultStudentSearchHandoffItemView {
  const copy = getAssignmentResultStudentSearchHandoffItemCopy(id);
  const value = getAssignmentResultStudentSearchHandoffItemValue({
    evidence,
    id,
    input,
  });
  const statusLabel =
    id === 'control-status' || id === 'resolved-search'
      ? input.searchStatusLabel
      : undefined;

  return {
    ariaLabel: formatStudentSearchHandoffAriaLabel({
      description: copy.description,
      label: copy.label,
      statusLabel,
      value,
    }),
    description: copy.description,
    id,
    label: copy.label,
    ...(statusLabel ? { statusLabel } : {}),
    value,
  };
}

function getAssignmentResultStudentSearchHandoffItemValue({
  evidence,
  id,
  input,
}: {
  evidence: AssignmentResultStudentSearchHandoffEvidence;
  id: AssignmentResultStudentSearchHandoffItemId;
  input: AssignmentResultStudentSearchHandoffInput;
}) {
  switch (id) {
    case 'search-scope':
      return t({
        en: 'Teacher result student search',
        zh: '教师结果学生搜索',
      });
    case 'route-parser':
      return 'parseResultStudentSearch';
    case 'route-update-helper':
      return 'buildAssignmentResultControlSearchState';
    case 'query-normalization':
      return 'normalizeResultSearchQuery';
    case 'width-normalization':
      return 'NFKC';
    case 'whitespace-collapse':
      return t({ en: 'Whitespace collapsed', zh: '空白已折叠' });
    case 'route-default-elision':
      return t({ en: 'Defaults omitted', zh: '默认值已省略' });
    case 'invalid-route-guard':
      return t({ en: 'Invalid values cleared', zh: '非法值已清除' });
    case 'control-status':
      return input.searchStatusLabel;
    case 'control-description':
      return input.searchDescription;
    case 'resolved-search':
      return evidence.hasNormalizedSearch
        ? t({ en: 'Search applied', zh: '已应用搜索' })
        : t({ en: 'All students', zh: '全部学生' });
    case 'total-students':
      return formatStudentSearchHandoffNumber(evidence.totalStudentCount);
    case 'matched-students':
      return formatStudentSearchHandoffRatio({
        matched: evidence.matchedStudentCount,
        total: evidence.totalStudentCount,
      });
    case 'matched-attempt-rows':
      return formatStudentSearchHandoffRatio({
        matched: evidence.matchedAttemptRowCount,
        total: evidence.totalAttemptRowCount,
      });
    case 'matched-answer-reviews':
      return formatStudentSearchHandoffRatio({
        matched: evidence.matchedAnswerReviewCount,
        total: evidence.totalAnswerReviewCount,
      });
    case 'matched-copy-students':
      return formatStudentSearchHandoffNumber(evidence.copyStudentCount);
    case 'matched-copy-attempts':
      return formatStudentSearchHandoffNumber(evidence.copyAttemptCount);
    case 'student-empty-state':
      return formatStudentSearchEmptyState(evidence.studentEmptyState);
    case 'attempt-empty-state':
      return formatStudentSearchEmptyState(evidence.attemptEmptyState);
    case 'answer-review-empty-state':
      return formatStudentSearchEmptyState(evidence.answerReviewEmptyState);
    case 'anonymous-label-search':
      return t({ en: 'Normalized labels only', zh: '仅规范化标签' });
    case 'named-label-search':
      return t({ en: 'Normalized labels', zh: '规范化标签' });
    case 'student-table-consumer':
      return t({ en: 'Student summary table', zh: '学生汇总表' });
    case 'attempt-table-consumer':
      return t({ en: 'Attempt rows', zh: '作答行' });
    case 'answer-review-consumer':
      return t({ en: 'Answer review cards', zh: '答案复盘卡片' });
    case 'review-scope-consumer':
      return t({ en: 'Current review scope', zh: '当前复盘范围' });
    case 'copy-artifact-consumer':
      return t({ en: 'Current copy scope', zh: '当前复制范围' });
    case 'raw-query-guard':
      return evidence.rawQueryHidden
        ? t({ en: 'Hidden', zh: '已隐藏' })
        : t({ en: 'Exposed', zh: '已暴露' });
    case 'student-answer-guard':
    case 'privacy-guard':
      return t({ en: 'Hidden', zh: '已隐藏' });
  }
}

function getAssignmentResultStudentSearchHandoffItemCopy(
  id: AssignmentResultStudentSearchHandoffItemId
) {
  const copies = {
    'anonymous-label-search': {
      description: t({
        en: 'Anonymous student rows remain searchable through safe display labels without exposing browser tokens.',
        zh: '匿名学生行只能通过安全显示标签被搜索，不会暴露浏览器令牌。',
      }),
      label: t({ en: 'Anonymous label search', zh: '匿名标签搜索' }),
    },
    'answer-review-consumer': {
      description: t({
        en: 'Answer review cards consume the same searched review list prepared by the result scope.',
        zh: '答案复盘卡片使用结果范围准备好的同一组搜索后复盘列表。',
      }),
      label: t({ en: 'Answer-review consumer', zh: '答案复盘消费者' }),
    },
    'answer-review-empty-state': {
      description: t({
        en: 'The answer-review empty state is derived from the searched review count instead of local card math.',
        zh: '答案复盘空状态来自搜索后的复盘数量，而不是卡片本地计算。',
      }),
      label: t({ en: 'Answer-review empty state', zh: '答案复盘空状态' }),
    },
    'attempt-empty-state': {
      description: t({
        en: 'The attempt-table empty state follows the searched attempt-row count.',
        zh: '作答表空状态跟随搜索后的作答行数量。',
      }),
      label: t({ en: 'Attempt empty state', zh: '作答空状态' }),
    },
    'attempt-table-consumer': {
      description: t({
        en: 'The visible attempt table renders the same searched attempt rows prepared by assignment-domain helpers.',
        zh: '可见作答表渲染 assignment-domain helper 准备的同一组搜索后作答行。',
      }),
      label: t({ en: 'Attempt-table consumer', zh: '作答表消费者' }),
    },
    'control-description': {
      description: t({
        en: 'The hidden contract reuses the visible search-control description.',
        zh: '隐藏契约复用可见搜索控件说明。',
      }),
      label: t({ en: 'Control description', zh: '控件说明' }),
    },
    'control-status': {
      description: t({
        en: 'Search status reports default versus adjusted scope without exposing the query text.',
        zh: '搜索状态只说明默认或已调整范围，不暴露查询文本。',
      }),
      label: t({ en: 'Control status', zh: '控件状态' }),
    },
    'copy-artifact-consumer': {
      description: t({
        en: 'Copy artifacts receive the same searched student and attempt scope used by the current review.',
        zh: '复制材料使用当前复盘中同一组搜索后的学生和作答范围。',
      }),
      label: t({ en: 'Copy artifact consumer', zh: '复制材料消费者' }),
    },
    'invalid-route-guard': {
      description: t({
        en: 'Non-string student search route values are cleared before the result page resolves state.',
        zh: '非字符串学生搜索路由值会在结果页解析状态前被清除。',
      }),
      label: t({ en: 'Invalid route guard', zh: '非法路由守卫' }),
    },
    'matched-answer-reviews': {
      description: t({
        en: 'Matched answer-review cards come from the searched review scope and current review filter.',
        zh: '匹配答案复盘卡片来自搜索后复盘范围和当前复盘筛选。',
      }),
      label: t({ en: 'Matched answer reviews', zh: '匹配答案复盘' }),
    },
    'matched-attempt-rows': {
      description: t({
        en: 'Matched attempt rows come from the shared attempt-row search helper.',
        zh: '匹配作答行来自共享作答行搜索 helper。',
      }),
      label: t({ en: 'Matched attempts', zh: '匹配作答' }),
    },
    'matched-copy-attempts': {
      description: t({
        en: 'Copy-ready attempt count follows the current searched answer-review scope used by copy artifacts.',
        zh: '可复制作答数量跟随复制材料使用的当前搜索后答案复盘范围。',
      }),
      label: t({ en: 'Copy attempts', zh: '复制作答' }),
    },
    'matched-copy-students': {
      description: t({
        en: 'Copy-ready student count follows the current searched student summary scope.',
        zh: '可复制学生数量跟随当前搜索后的学生汇总范围。',
      }),
      label: t({ en: 'Copy students', zh: '复制学生' }),
    },
    'matched-students': {
      description: t({
        en: 'Matched students are counted from the same filtered summary list used by the table.',
        zh: '匹配学生来自学生汇总表共用的同一组筛选列表。',
      }),
      label: t({ en: 'Matched students', zh: '匹配学生' }),
    },
    'named-label-search': {
      description: t({
        en: 'Named student search uses normalized display labels so whitespace and width differences do not split a student.',
        zh: '实名学生搜索使用规范化显示标签，避免空白和全半角差异拆分同一学生。',
      }),
      label: t({ en: 'Named label search', zh: '实名标签搜索' }),
    },
    'privacy-guard': {
      description: t({
        en: 'This handoff exposes helper names, state, and counts without raw queries, labels, keys, tokens, answers, answer keys, or copy text.',
        zh: '此交接只暴露 helper 名、状态和数量，不包含原始查询、标签、key、令牌、答案、答案键或复制正文。',
      }),
      label: t({ en: 'Privacy guard', zh: '隐私防护' }),
    },
    'query-normalization': {
      description: t({
        en: 'Route search text is normalized before display matching and route persistence.',
        zh: '路由搜索文本会先规范化，再用于显示匹配和路由持久化。',
      }),
      label: t({ en: 'Query normalization', zh: '查询规范化' }),
    },
    'raw-query-guard': {
      description: t({
        en: 'Raw query text is not copied into the hidden handoff values.',
        zh: '原始查询文本不会复制到隐藏交接值中。',
      }),
      label: t({ en: 'Raw query guard', zh: '原始查询防护' }),
    },
    'resolved-search': {
      description: t({
        en: 'Resolved search reports whether a search is applied without echoing the student label.',
        zh: '已解析搜索只说明是否应用搜索，不回显学生标签。',
      }),
      label: t({ en: 'Resolved search', zh: '已解析搜索' }),
    },
    'review-scope-consumer': {
      description: t({
        en: 'The review scope is the shared owner of searched students, attempts, reviews, and copy counts.',
        zh: '复盘范围统一拥有搜索后的学生、作答、复盘和复制数量。',
      }),
      label: t({ en: 'Review-scope consumer', zh: '复盘范围消费者' }),
    },
    'route-default-elision': {
      description: t({
        en: 'Blank or default student search is omitted from route search state.',
        zh: '空白或默认学生搜索会从路由 search 状态中省略。',
      }),
      label: t({ en: 'Route default elision', zh: '路由默认值省略' }),
    },
    'route-parser': {
      description: t({
        en: 'Student search route state is parsed by the assignment-domain helper before rendering.',
        zh: '学生搜索路由状态会先经过 assignment-domain helper 解析再渲染。',
      }),
      label: t({ en: 'Route parser', zh: '路由解析器' }),
    },
    'route-update-helper': {
      description: t({
        en: 'Search-control changes write route state through the shared result control helper.',
        zh: '搜索控件变化通过共享结果控件 helper 写回路由状态。',
      }),
      label: t({ en: 'Route update helper', zh: '路由更新 helper' }),
    },
    'search-scope': {
      description: t({
        en: 'The handoff is scoped to teacher result views filtered by student display label.',
        zh: '此交接限定在按学生显示标签筛选的教师结果视图。',
      }),
      label: t({ en: 'Search scope', zh: '搜索范围' }),
    },
    'student-answer-guard': {
      description: t({
        en: 'Student answer text remains in teacher review data, not in the search handoff.',
        zh: '学生答案文本保留在教师复盘数据中，不进入搜索交接。',
      }),
      label: t({ en: 'Student-answer guard', zh: '学生答案防护' }),
    },
    'student-empty-state': {
      description: t({
        en: 'The student-summary empty state follows the searched student count.',
        zh: '学生汇总空状态跟随搜索后的学生数量。',
      }),
      label: t({ en: 'Student empty state', zh: '学生空状态' }),
    },
    'student-table-consumer': {
      description: t({
        en: 'The visible student summary table renders searched rows from the result page view model.',
        zh: '可见学生汇总表渲染结果页 view model 准备的搜索后行。',
      }),
      label: t({ en: 'Student-table consumer', zh: '学生表消费者' }),
    },
    'total-students': {
      description: t({
        en: 'Total students come from the unfiltered result analysis before student search is applied.',
        zh: '学生总数来自应用学生搜索前的完整结果分析。',
      }),
      label: t({ en: 'Total students', zh: '学生总数' }),
    },
    'whitespace-collapse': {
      description: t({
        en: 'Repeated whitespace collapses before matching student labels.',
        zh: '重复空白会在匹配学生标签前折叠。',
      }),
      label: t({ en: 'Whitespace collapse', zh: '空白折叠' }),
    },
    'width-normalization': {
      description: t({
        en: 'Full-width and half-width text normalize through NFKC before matching.',
        zh: '全角和半角文本在匹配前通过 NFKC 规范化。',
      }),
      label: t({ en: 'Width normalization', zh: '宽度规范化' }),
    },
  } satisfies Record<
    AssignmentResultStudentSearchHandoffItemId,
    {
      description: string;
      label: string;
    }
  >;

  return copies[id];
}

function buildAssignmentResultStudentSearchHandoffPrivacyContract(
  itemViews: AssignmentResultStudentSearchHandoffItemView[]
): AssignmentResultStudentSearchHandoffPrivacyContract {
  return {
    exposesAnswerReviewText: false,
    exposesCopyArtifactText: false,
    exposesRawAnonymousToken: false,
    exposesRawRouteQuery: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesStudentKeys: false,
    exposesTeacherAnswerKey: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesResultData: false,
    scope: 'teacher-result-student-search',
    usesAssignmentDomainHelpers: true,
    usesCurrentReviewScope: true,
  };
}

function resolveSearchEmptyState({
  hasNormalizedSearch,
  matched,
  total,
}: {
  hasNormalizedSearch: boolean;
  matched: number;
  total: number;
}): AssignmentResultStudentSearchEmptyState {
  if (total === 0) return 'no-data';
  if (hasNormalizedSearch && matched === 0) return 'search-no-matches';
  return 'ready';
}

function formatStudentSearchEmptyState(
  state: AssignmentResultStudentSearchEmptyState
) {
  if (state === 'no-data') {
    return t({ en: 'No data', zh: '暂无数据' });
  }
  if (state === 'search-no-matches') {
    return t({ en: 'Search empty', zh: '搜索为空' });
  }
  return t({ en: 'Ready', zh: '就绪' });
}

function formatStudentSearchHandoffRatio({
  matched,
  total,
}: {
  matched: number;
  total: number;
}) {
  return `${formatStudentSearchHandoffNumber(
    matched
  )}/${formatStudentSearchHandoffNumber(total)}`;
}

function formatStudentSearchHandoffNumber(value: number) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

function normalizeStudentSearchHandoffCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function formatStudentSearchHandoffAriaLabel({
  description,
  label,
  statusLabel,
  value,
}: {
  description: string;
  label: string;
  statusLabel?: string;
  value: string;
}) {
  if (statusLabel) {
    return t({
      en: `${label}: ${value}. Status ${statusLabel}. ${description}`,
      zh: `${label}：${value}。状态：${statusLabel}。${description}`,
    });
  }

  return t({
    en: `${label}: ${value}. ${description}`,
    zh: `${label}：${value}。${description}`,
  });
}

function t(copy: { en: string; zh: string }) {
  return getLocale() === 'zh' ? copy.zh : copy.en;
}
