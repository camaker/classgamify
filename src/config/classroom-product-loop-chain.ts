export const CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS = [
  'product-loop-contract',
  'activity-model',
  'activity-content-contract',
  'activity-library-owner-scope',
  'activity-authoring-entry',
  'template-scaffold-entry',
  'ai-authoring-draft-boundary',
  'source-material-reference-boundary',
  'activity-lifecycle-derivative-guard',
  'assignment-publish-preflight',
  'assignment-snapshot-freeze',
  'share-link-distribution',
  'public-runner-access',
  'public-rules-summary',
  'student-identity-boundary',
  'runtime-item-contract',
  'progress-submit-readiness',
  'submission-validation',
  'attempt-persistence',
  'answer-feedback-policy',
  'result-submitted-date-continuity',
  'teacher-result-review',
  'result-accepted-answer-continuity',
  'csv-export',
  'result-explanation-continuity',
  'dashboard-loop-status',
  'teacher-workspace-routes',
  'public-entry-routes',
  'privacy-guards',
  'product-loop-chain-gate',
] as const;

export const CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/pages/public-page-view.ts',
  'src/dashboard/overview.ts',
  'src/dashboard/teacher-workspace-operations-chain.ts',
  'src/db/classroom-data-lifecycle-chain.ts',
  'src/activities/types.ts',
  'src/activities/validation.ts',
  'src/activities/scaffolds.ts',
  'src/activities/ai-authoring-chain.ts',
  'src/activities/authoring-library-chain.ts',
  'src/activities/activity-lifecycle-governance-chain.ts',
  'src/activities/source-material-privacy-chain.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/published-assignment-delivery-chain.ts',
  'src/assignments/result-submitted-date-chain.ts',
  'src/assignments/result-accepted-answer-chain.ts',
  'src/assignments/student-runner-play-chain.ts',
  'src/assignments/result-explanation-chain.ts',
  'src/assignments/student-identity-lifecycle-chain.ts',
  'src/assignments/runtime-identity-handoff.ts',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/scored-attempt-result-chain.ts',
  'src/assignments/answer-feedback-lifecycle-chain.ts',
  'src/assignments/teacher-results-review-chain.ts',
  'src/assignments/teacher-result-copy-lifecycle-chain.ts',
  'src/assignments/results-export.ts',
  'src/assignments/printable-worksheet-review-lifecycle-chain.ts',
  'src/config/classroom-trust-communication-chain.ts',
  'tests/e2e/TEST-CATALOG.md',
] as const;

export type ClassroomProductLoopChainHandoffItemId =
  (typeof CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS)[number];

export type ClassroomProductLoopChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ClassroomProductLoopChainHandoffItemId;
  label: string;
  value: string;
};

export type ClassroomProductLoopChainPrivacyContract = {
  chainSourceFileCount: number;
  createsAssignmentLinksWithoutTeacherAction: false;
  exposesActivityContentJsonToPublicPayload: false;
  exposesAnswerKeysBeforeAllowedReview: false;
  exposesCsvDataUrlInHandoff: false;
  exposesPrivateActivityContent: false;
  exposesRawAnonymousTokens: false;
  exposesRawSubmissionPayload: false;
  exposesResultExportRows: false;
  exposesRuntimeItemIdsInHandoff: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAnswerTextInHandoff: false;
  exposesStudentNamesInHandoff: false;
  freezesAssignmentSnapshots: true;
  itemIds: ClassroomProductLoopChainHandoffItemId[];
  keepsActivityLibraryOwnerScoped: true;
  keepsAssignmentListOwnerScoped: true;
  keepsDashboardOwnerScoped: true;
  publicPayloadUsesRuntimeItemsOnly: true;
  rejectsInvalidSubmissions: true;
  requiresTeacherReviewForAiDrafts: true;
  resultConsumersUseScoredAttempts: true;
  sourceFiles: string[];
  usesActivityAssignmentAttemptResultsLoop: true;
};

export type ClassroomProductLoopChainHandoffView = {
  description: string;
  itemViews: ClassroomProductLoopChainHandoffItemView[];
  privacy: ClassroomProductLoopChainPrivacyContract;
  title: string;
};

export function buildClassroomProductLoopChainHandoffView(): ClassroomProductLoopChainHandoffView {
  const itemViews = CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS.map((id) =>
    buildClassroomProductLoopChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice classroom product loop chain from teacher-owned activities and reusable content through assignment publish, frozen snapshots, public student play, validated attempts, scored results, submitted-date, accepted-answer, and explanation continuity, teacher review, copy/export/print handoffs, dashboard status, public entry points, and privacy guards.',
    itemViews,
    privacy: {
      chainSourceFileCount: CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES.length,
      createsAssignmentLinksWithoutTeacherAction: false,
      exposesActivityContentJsonToPublicPayload: false,
      exposesAnswerKeysBeforeAllowedReview: false,
      exposesCsvDataUrlInHandoff: false,
      exposesPrivateActivityContent: false,
      exposesRawAnonymousTokens: false,
      exposesRawSubmissionPayload: false,
      exposesResultExportRows: false,
      exposesRuntimeItemIdsInHandoff: false,
      exposesSourceMaterialStorageKeys: false,
      exposesStudentAnswerTextInHandoff: false,
      exposesStudentNamesInHandoff: false,
      freezesAssignmentSnapshots: true,
      itemIds: [...CLASSROOM_PRODUCT_LOOP_CHAIN_HANDOFF_ITEM_IDS],
      keepsActivityLibraryOwnerScoped: true,
      keepsAssignmentListOwnerScoped: true,
      keepsDashboardOwnerScoped: true,
      publicPayloadUsesRuntimeItemsOnly: true,
      rejectsInvalidSubmissions: true,
      requiresTeacherReviewForAiDrafts: true,
      resultConsumersUseScoredAttempts: true,
      sourceFiles: [...CLASSROOM_PRODUCT_LOOP_CHAIN_SOURCE_FILES],
      usesActivityAssignmentAttemptResultsLoop: true,
    },
    title: 'Classroom product loop chain',
  };
}

function buildClassroomProductLoopChainHandoffItemView(
  id: ClassroomProductLoopChainHandoffItemId
): ClassroomProductLoopChainHandoffItemView {
  const item = getClassroomProductLoopChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getClassroomProductLoopChainHandoffItem(
  id: ClassroomProductLoopChainHandoffItemId
): Omit<ClassroomProductLoopChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'product-loop-contract':
      return item(
        id,
        'Product loop contract',
        'Activity -> Assignment -> Attempt -> Results',
        'The top-level product loop stays grounded in teacher activities, assignment links, student attempts, and teacher results.'
      );
    case 'activity-model':
      return item(
        id,
        'Activity model',
        'Teacher-owned activity',
        'Reusable activities remain owner-scoped classroom content rather than public demo rows.'
      );
    case 'activity-content-contract':
      return item(
        id,
        'Activity content contract',
        'Template-neutral content',
        'Questions, pairs, groups, vocabulary, notes, explanations, and source references stay in the shared activity content model.'
      );
    case 'activity-library-owner-scope':
      return item(
        id,
        'Activity library owner scope',
        'Owner activities only',
        'Activity library search, filters, pagination, and summaries stay scoped to the authenticated teacher.'
      );
    case 'activity-authoring-entry':
      return item(
        id,
        'Activity authoring entry',
        'Create editor',
        'Public template and worksheet entry points land in the shared teacher-reviewed create editor.'
      );
    case 'template-scaffold-entry':
      return item(
        id,
        'Template scaffold entry',
        'Reviewed scaffold',
        'Template scaffolds demonstrate playable structured content without bypassing teacher review.'
      );
    case 'ai-authoring-draft-boundary':
      return item(
        id,
        'AI authoring draft boundary',
        'Teacher-reviewed draft',
        'AI drafts fill CreateActivityInput for editor review and cannot persist or publish directly.'
      );
    case 'source-material-reference-boundary':
      return item(
        id,
        'Source material reference boundary',
        'Compact references',
        'Teacher-uploaded materials remain compact owner-scoped references and stay out of public student payloads.'
      );
    case 'activity-lifecycle-derivative-guard':
      return item(
        id,
        'Activity lifecycle derivative guard',
        'Restore before derive',
        'Archive, restore, duplicate, remix, and publish actions share the restore-before-derive lifecycle rule.'
      );
    case 'assignment-publish-preflight':
      return item(
        id,
        'Assignment publish preflight',
        'Delivery settings review',
        'Teachers review title, instructions, identity, attempt, timer, close-time, and answer-reveal settings before publishing.'
      );
    case 'assignment-snapshot-freeze':
      return item(
        id,
        'Assignment snapshot freeze',
        'Frozen ActivityContent',
        'Published links freeze title, template, content, and delivery context so later activity edits affect only future assignments.'
      );
    case 'share-link-distribution':
      return item(
        id,
        'Share-link distribution',
        'Copy/preview/print/review',
        'Assignment list and result surfaces keep copy, preview, printable, and review actions aligned.'
      );
    case 'public-runner-access':
      return item(
        id,
        'Public runner access',
        'Open links only',
        'Public student payloads are returned only for open assignment links.'
      );
    case 'public-rules-summary':
      return item(
        id,
        'Public rules summary',
        'Student-visible rules',
        'Student runners show safe delivery rules without answer keys or teacher-only content.'
      );
    case 'student-identity-boundary':
      return item(
        id,
        'Student identity boundary',
        'Name or browser token',
        'Named and anonymous identities normalize before attempt limits and teacher result grouping.'
      );
    case 'runtime-item-contract':
      return item(
        id,
        'Runtime item contract',
        '{ itemId, answer }',
        'Every student renderer submits the same template-neutral answer shape against frozen runtime items.'
      );
    case 'progress-submit-readiness':
      return item(
        id,
        'Progress submit readiness',
        'Explicit partial confirm',
        'Progress counts and submit controls make incomplete attempts an explicit student decision.'
      );
    case 'submission-validation':
      return item(
        id,
        'Submission validation',
        'Unknown duplicate guard',
        'The submit API rejects unknown runtime ids, duplicate ids, and answer lists longer than the frozen runtime.'
      );
    case 'attempt-persistence':
      return item(
        id,
        'Attempt persistence',
        'Scored attempt row',
        'Validated submissions persist through the shared scored-attempt helper after lifecycle and identity gates pass.'
      );
    case 'answer-feedback-policy':
      return item(
        id,
        'Answer feedback policy',
        'Reveal if allowed',
        'Student feedback exposes accepted answers and explanations only after scoring and only when policy allows review.'
      );
    case 'result-submitted-date-continuity':
      return item(
        id,
        'Result submitted date continuity',
        'Submitted dates',
        'Teacher result tables, review cards, follow-up copy, sorting, and CSV columns share submitted-date formatting.'
      );
    case 'teacher-result-review':
      return item(
        id,
        'Teacher result review',
        'Reteach evidence',
        'Teacher result pages combine frozen runtime items with stored attempts for item performance and student follow-up.'
      );
    case 'result-accepted-answer-continuity':
      return item(
        id,
        'Result accepted-answer continuity',
        'Accepted alternatives',
        'Scoring, feedback, teacher review, CSV exports, and printable answer keys share primary and alternative answer formatting.'
      );
    case 'csv-export':
      return item(
        id,
        'CSV export',
        'Private offline records',
        'CSV exports preserve delivery policy and scored result context while guarding formula-like text.'
      );
    case 'result-explanation-continuity':
      return item(
        id,
        'Result explanation continuity',
        'Answer explanations',
        'Explanations stay hidden before review, then flow through feedback, result cards, copy artifacts, CSV exports, and printable answer keys.'
      );
    case 'dashboard-loop-status':
      return item(
        id,
        'Dashboard loop status',
        'Create/publish/play/review',
        'Dashboard status and next actions summarize where the teacher is in the classroom loop.'
      );
    case 'teacher-workspace-routes':
      return item(
        id,
        'Teacher workspace routes',
        'Dashboard workspace',
        'Authenticated dashboard, activity library, assignment list, results, print, and settings surfaces keep owner scope.'
      );
    case 'public-entry-routes':
      return item(
        id,
        'Public entry routes',
        'Home/templates/worksheets',
        'Public pages point teachers toward the real ClassGamify creation and assignment loop.'
      );
    case 'privacy-guards':
      return item(
        id,
        'Privacy guards',
        'Private data hidden',
        'Loop handoffs hide teacher private content, raw student identifiers, answers, source storage keys, and CSV payloads.'
      );
    case 'product-loop-chain-gate':
      return item(
        id,
        'Product loop chain gate',
        '30 source files',
        'A focused gate keeps activity, assignment, attempt, result continuity, workspace, public entry, and privacy boundaries connected.'
      );
  }
}

function item(
  id: ClassroomProductLoopChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<ClassroomProductLoopChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
