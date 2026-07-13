export const TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS = [
  'product-copy-artifact-policy',
  'review-scope-source',
  'copy-action-scope',
  'classroom-brief-builder',
  'classroom-brief-metrics',
  'classroom-brief-focus-items',
  'classroom-brief-follow-up-students',
  'reteach-plan-builder',
  'reteach-plan-review-items',
  'reteach-plan-student-follow-up',
  'item-review-summary-builder',
  'item-review-answer-coverage',
  'student-follow-up-summary-builder',
  'student-follow-up-priority-order',
  'latest-attempt-context',
  'copy-title-normalization',
  'copy-line-normalization',
  'copy-scope-appended',
  'copy-preview-builder',
  'copy-preview-meta',
  'copy-action-buttons',
  'copy-action-gates',
  'copy-action-execution-plan',
  'current-review-data-set',
  'result-view-assembly',
  'result-page-card-consumer',
  'copy-handoff-hidden-dom',
  'teacher-results-chain-alignment',
  'privacy-guards',
  'copy-artifact-handoff-boundary',
] as const;

export const TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/assignments/result-actions.ts',
  'src/assignments/result-view.ts',
  'src/assignments/copy-artifact-handoff.ts',
  'src/assignments/classroom-brief.ts',
  'src/assignments/reteach-plan.ts',
  'src/assignments/item-review-summary.ts',
  'src/assignments/student-follow-up-summary.ts',
  'src/assignments/student-follow-up-priority.ts',
  'src/assignments/review-priority.ts',
  'src/assignments/result-copy-format.ts',
  'src/assignments/result-display.ts',
  'src/assignments/result-format.ts',
  'src/assignments/result-summary-format.ts',
  'src/assignments/result-review-summary.ts',
  'src/assignments/result-filters.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-stats.ts',
  'src/assignments/results.ts',
  'src/assignments/results-export.ts',
  'src/assignments/attempt-review-card-handoff.ts',
  'src/assignments/item-performance-sort-handoff.ts',
  'src/assignments/student-summary-sort-handoff.ts',
  'src/assignments/result-student-search-handoff.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/components/assignments/assignment-results-classroom-brief-card.tsx',
  'src/components/assignments/assignment-results-review-handoff-panel.tsx',
  'src/routes/dashboard/assignments/$assignmentId.tsx',
  'scripts/assignment-copy-artifact-handoff-semantic-views.test.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type TeacherResultCopyLifecycleChainHandoffItemId =
  (typeof TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS)[number];

export type TeacherResultCopyLifecycleChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: TeacherResultCopyLifecycleChainHandoffItemId;
  label: string;
  value: string;
};

export type TeacherResultCopyLifecycleChainPrivacyContract = {
  appendsCopyScopeToArtifacts: true;
  chainSourceFileCount: number;
  exposesAcceptedAnswerTextInHandoff: false;
  exposesArtifactTextInHandoff: false;
  exposesCsvDataUrlInHandoff: false;
  exposesExpectedAnswerTextInHandoff: false;
  exposesPromptTextInHandoff: false;
  exposesRawAnonymousTokensInHandoff: false;
  exposesRawCopyArtifactTextInHandoff: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentLabelsInHandoff: false;
  exposesTeacherNotesTextInHandoff: false;
  itemIds: TeacherResultCopyLifecycleChainHandoffItemId[];
  keepsCsvExportFullAssignment: true;
  mutatesPublicRunner: false;
  mutatesResultArtifacts: false;
  sourceFiles: string[];
  usesCurrentReviewScopeForCopyActions: true;
  usesCopyArtifactHandoff: true;
  usesSharedCopyArtifactBuilders: true;
  usesSharedCopyArtifactHelpers: true;
};

export type TeacherResultCopyLifecycleChainHandoffView = {
  description: string;
  itemViews: TeacherResultCopyLifecycleChainHandoffItemView[];
  privacy: TeacherResultCopyLifecycleChainPrivacyContract;
  title: string;
};

export function buildTeacherResultCopyLifecycleChainHandoffView(): TeacherResultCopyLifecycleChainHandoffView {
  const itemViews = TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildTeacherResultCopyLifecycleChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice teacher result copy lifecycle chain from current review scope and shared copy artifact builders through classroom brief, reteach plan, item review, student follow-up, preview metadata, action execution, and privacy guards.',
    itemViews,
    privacy: {
      appendsCopyScopeToArtifacts: true,
      chainSourceFileCount:
        TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES.length,
      exposesAcceptedAnswerTextInHandoff: false,
      exposesArtifactTextInHandoff: false,
      exposesCsvDataUrlInHandoff: false,
      exposesExpectedAnswerTextInHandoff: false,
      exposesPromptTextInHandoff: false,
      exposesRawAnonymousTokensInHandoff: false,
      exposesRawCopyArtifactTextInHandoff: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentLabelsInHandoff: false,
      exposesTeacherNotesTextInHandoff: false,
      itemIds: [...TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_HANDOFF_ITEM_IDS],
      keepsCsvExportFullAssignment: true,
      mutatesPublicRunner: false,
      mutatesResultArtifacts: false,
      sourceFiles: [...TEACHER_RESULT_COPY_LIFECYCLE_CHAIN_SOURCE_FILES],
      usesCurrentReviewScopeForCopyActions: true,
      usesCopyArtifactHandoff: true,
      usesSharedCopyArtifactBuilders: true,
      usesSharedCopyArtifactHelpers: true,
    },
    title: 'Teacher result copy lifecycle chain',
  };
}

function buildTeacherResultCopyLifecycleChainHandoffItemView(
  id: TeacherResultCopyLifecycleChainHandoffItemId
): TeacherResultCopyLifecycleChainHandoffItemView {
  const item = getTeacherResultCopyLifecycleChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getTeacherResultCopyLifecycleChainHandoffItem(
  id: TeacherResultCopyLifecycleChainHandoffItemId
): Omit<TeacherResultCopyLifecycleChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-copy-artifact-policy':
      return item(
        id,
        'Product copy artifact policy',
        'Teacher copy loop',
        'Product policy keeps classroom briefs, reteach plans, item reviews, and student follow-up summaries first-class teacher result artifacts.'
      );
    case 'review-scope-source':
      return item(
        id,
        'Review scope source',
        'Search/sort/filter',
        'Result-page search, sort, and review-filter state defines the current review scope for copy artifacts.'
      );
    case 'copy-action-scope':
      return item(
        id,
        'Copy action scope',
        'Current review',
        'Copy actions use current-review data while CSV export remains a full-assignment boundary.'
      );
    case 'classroom-brief-builder':
      return item(
        id,
        'Classroom brief builder',
        'Brief artifact',
        'Classroom brief copy combines assignment metrics, focus items, and follow-up students.'
      );
    case 'classroom-brief-metrics':
      return item(
        id,
        'Classroom brief metrics',
        'Shared stats',
        'Brief metrics reuse assignment attempt stats and summary formatting.'
      );
    case 'classroom-brief-focus-items':
      return item(
        id,
        'Classroom brief focus items',
        'Lowest items',
        'The brief uses review-priority items for the lowest-performing classroom focus.'
      );
    case 'classroom-brief-follow-up-students':
      return item(
        id,
        'Classroom brief follow-up students',
        'Support list',
        'The brief uses follow-up priority students and latest-attempt context.'
      );
    case 'reteach-plan-builder':
      return item(
        id,
        'Reteach plan builder',
        'Classroom script',
        'The reteach plan builds a teacher-copyable script from priority items and follow-up students.'
      );
    case 'reteach-plan-review-items':
      return item(
        id,
        'Reteach plan review items',
        'Priority items',
        'Reteach plan review items share the same item-priority helper as classroom briefs.'
      );
    case 'reteach-plan-student-follow-up':
      return item(
        id,
        'Reteach plan student follow-up',
        'Priority students',
        'Reteach plan student lines share the follow-up priority and latest-attempt helpers.'
      );
    case 'item-review-summary-builder':
      return item(
        id,
        'Item review summary builder',
        'Prompt summary',
        'Item review copy sorts items by review priority for lesson planning and team review.'
      );
    case 'item-review-answer-coverage':
      return item(
        id,
        'Item review answer coverage',
        'Answer evidence',
        'Item review copy formats expected answers, accepted alternatives, explanations, and unanswered counts.'
      );
    case 'student-follow-up-summary-builder':
      return item(
        id,
        'Student follow-up summary builder',
        'Student support',
        'Student follow-up copy builds sorted support rows with accuracy, attempts, review counts, and recommendations.'
      );
    case 'student-follow-up-priority-order':
      return item(
        id,
        'Student follow-up priority order',
        'Needs review first',
        'Follow-up copy orders students by missed or unanswered work before extension cases.'
      );
    case 'latest-attempt-context':
      return item(
        id,
        'Latest attempt context',
        'Latest attempt',
        'Follow-up artifacts reuse latest-attempt submitted time, duration, and answer-review summary context.'
      );
    case 'copy-title-normalization':
      return item(
        id,
        'Copy title normalization',
        'NFKC title',
        'Copied artifact titles normalize whitespace and full-width text through shared copy formatting.'
      );
    case 'copy-line-normalization':
      return item(
        id,
        'Copy line normalization',
        'Line joiner',
        'Copied artifact bodies use shared line normalization and blank-line compaction.'
      );
    case 'copy-scope-appended':
      return item(
        id,
        'Copy scope appended',
        'Scope block',
        'Every copy artifact appends the current review scope so pasted materials keep their filter context.'
      );
    case 'copy-preview-builder':
      return item(
        id,
        'Copy preview builder',
        'Preview cards',
        'Copy previews are generated from the same artifact text, action id, scope, and description.'
      );
    case 'copy-preview-meta':
      return item(
        id,
        'Copy preview meta',
        'Preview counts',
        'Preview metadata counts focus items, follow-up students, review items, latest-attempt context, and lines.'
      );
    case 'copy-action-buttons':
      return item(
        id,
        'Copy action buttons',
        'Four copy actions',
        'Result actions expose brief, reteach, item-review, and follow-up copy buttons in a stable order.'
      );
    case 'copy-action-gates':
      return item(
        id,
        'Copy action gates',
        'Ready or blocked',
        'Copy actions report prepared blocked reasons when attempts, items, students, or brief data are missing.'
      );
    case 'copy-action-execution-plan':
      return item(
        id,
        'Copy action execution plan',
        'Copy text',
        'Execution plans resolve scoped data and return copy text without exposing it through handoff summaries.'
      );
    case 'current-review-data-set':
      return item(
        id,
        'Current review data set',
        'Filtered copy data',
        'Copy action data stores filtered students, attempts, items, and copy scope while export data stays full.'
      );
    case 'result-view-assembly':
      return item(
        id,
        'Result view assembly',
        'View model',
        'The result view model assembles copy action data, artifacts, previews, action data sets, and handoff views together.'
      );
    case 'result-page-card-consumer':
      return item(
        id,
        'Result page card consumer',
        'Brief card',
        'The classroom brief card consumes copy previews and hidden copy-artifact handoff data.'
      );
    case 'copy-handoff-hidden-dom':
      return item(
        id,
        'Copy handoff hidden DOM',
        'sr-only dl',
        'Copy artifact handoff renders as hidden semantic dl/dt/dd output, not an extra visible product surface.'
      );
    case 'teacher-results-chain-alignment':
      return item(
        id,
        'Teacher results chain alignment',
        'Results chain',
        'The copy lifecycle stays aligned with the broader teacher results review chain.'
      );
    case 'privacy-guards':
      return item(
        id,
        'Privacy guards',
        'Private text hidden',
        'Handoff summaries hide artifact text, prompts, expected answers, accepted answers, student answers, labels, tokens, and CSV URLs.'
      );
    case 'copy-artifact-handoff-boundary':
      return item(
        id,
        'Copy artifact handoff boundary',
        '30 artifact handoff slices',
        'Artifact readiness, normalized titles and lines, appended review scope, classroom metrics, focus and follow-up evidence, latest-attempt context, priority ordering, current-review preview scope, and copy privacy guards stay aligned.'
      );
  }
}

function item(
  id: TeacherResultCopyLifecycleChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<TeacherResultCopyLifecycleChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
