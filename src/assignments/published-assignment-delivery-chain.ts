export const PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS = [
  'publish-preflight-validation',
  'publish-delivery-preview',
  'publish-settings-json',
  'assignment-persistence',
  'snapshot-freeze',
  'share-link-distribution',
  'post-publish-list-surface',
  'list-filter-owner-scope',
  'delivery-policy-summary',
  'public-rules-summary',
  'public-access-lifecycle',
  'unavailable-content-guard',
  'item-order-policy',
  'student-identity-policy',
  'attempt-limit-policy',
  'timer-duration-policy',
  'close-time-lifecycle',
  'student-start-readiness',
  'student-submit-readiness',
  'submission-validation',
  'attempt-persistence',
  'answer-feedback-gate',
  'result-stats',
  'result-review-scope',
  'csv-export-policy',
  'result-copy-boundary',
  'source-material-guard',
  'raw-token-guard',
  'snapshot-results-retention',
  'delivery-chain-gate',
] as const;

export const PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES = [
  'docs/product.md',
  'src/api/assignments.ts',
  'src/assignments/publish-input.ts',
  'src/assignments/publish-schedule.ts',
  'src/assignments/validation.ts',
  'src/assignments/persistence.ts',
  'src/assignments/snapshot.ts',
  'src/assignments/delivery-summary.ts',
  'src/assignments/share-link.ts',
  'src/assignments/list-filters.ts',
  'src/assignments/list-query.ts',
  'src/assignments/list-summary.ts',
  'src/assignments/list-view.ts',
  'src/assignments/lifecycle.ts',
  'src/assignments/public.ts',
  'src/assignments/unavailable-access.ts',
  'src/assignments/item-order.ts',
  'src/assignments/item-order-handoff.ts',
  'src/assignments/attempt-limits.ts',
  'src/assignments/attempt-limit-handoff.ts',
  'src/assignments/submission-validation-handoff.ts',
  'src/assignments/attempt-persistence.ts',
  'src/assignments/attempt-persistence-handoff.ts',
  'src/assignments/attempt-duration.ts',
  'src/assignments/attempt-duration-handoff.ts',
  'src/assignments/student-runner-state.ts',
  'src/assignments/answer-feedback-handoff.ts',
  'src/assignments/attempt-stats-handoff.ts',
  'src/assignments/result-view.ts',
  'src/assignments/results-export.ts',
] as const;

export type PublishedAssignmentDeliveryChainHandoffItemId =
  (typeof PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS)[number];

export type PublishedAssignmentDeliveryChainHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublishedAssignmentDeliveryChainHandoffItemId;
  label: string;
  value: string;
};

export type PublishedAssignmentDeliveryChainPrivacyContract = {
  chainSourceFileCount: number;
  deliveryPolicyResolvedBeforeSurfaces: true;
  exposesActivityContentToPublicPayload: false;
  exposesAnswerKeysBeforeAllowedReview: false;
  exposesRawAnonymousTokens: false;
  exposesRawSettingsJson: false;
  exposesSourceMaterialStorageKeys: false;
  freezesAssignmentSnapshots: true;
  itemIds: PublishedAssignmentDeliveryChainHandoffItemId[];
  publicPayloadUsesRuntimeItemsOnly: true;
  rejectsInvalidSubmissions: true;
  resultExportsIncludeDeliveryPolicy: true;
  resultsPreserveAttempts: true;
  sourceFiles: string[];
};

export type PublishedAssignmentDeliveryChainHandoffView = {
  description: string;
  itemViews: PublishedAssignmentDeliveryChainHandoffItemView[];
  privacy: PublishedAssignmentDeliveryChainPrivacyContract;
  title: string;
};

export function buildPublishedAssignmentDeliveryChainHandoffView(): PublishedAssignmentDeliveryChainHandoffView {
  const itemViews = PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS.map(
    (id) => buildPublishedAssignmentDeliveryChainHandoffItemView(id)
  );

  return {
    description:
      'Thirty-slice published assignment delivery chain from teacher publish preflight through frozen snapshots, public student rules, validated submissions, persisted attempts, and result/export review.',
    itemViews,
    privacy: {
      chainSourceFileCount:
        PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES.length,
      deliveryPolicyResolvedBeforeSurfaces: true,
      exposesActivityContentToPublicPayload: false,
      exposesAnswerKeysBeforeAllowedReview: false,
      exposesRawAnonymousTokens: false,
      exposesRawSettingsJson: false,
      exposesSourceMaterialStorageKeys: false,
      freezesAssignmentSnapshots: true,
      itemIds: [...PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_HANDOFF_ITEM_IDS],
      publicPayloadUsesRuntimeItemsOnly: true,
      rejectsInvalidSubmissions: true,
      resultExportsIncludeDeliveryPolicy: true,
      resultsPreserveAttempts: true,
      sourceFiles: [...PUBLISHED_ASSIGNMENT_DELIVERY_CHAIN_SOURCE_FILES],
    },
    title: 'Published assignment delivery chain',
  };
}

function buildPublishedAssignmentDeliveryChainHandoffItemView(
  id: PublishedAssignmentDeliveryChainHandoffItemId
): PublishedAssignmentDeliveryChainHandoffItemView {
  const item = getPublishedAssignmentDeliveryChainHandoffItem(id);

  return {
    ...item,
    ariaLabel: `${item.label}: ${item.value}`,
  };
}

function getPublishedAssignmentDeliveryChainHandoffItem(
  id: PublishedAssignmentDeliveryChainHandoffItemId
): Omit<PublishedAssignmentDeliveryChainHandoffItemView, 'ariaLabel' | 'id'> {
  switch (id) {
    case 'publish-preflight-validation':
      return item(
        id,
        'Publish preflight validation',
        '30 publish slices',
        'Publish preflight checks title, instructions, attempts, timer, close time, and activity lifecycle before creating a link.'
      );
    case 'publish-delivery-preview':
      return item(
        id,
        'Publish delivery preview',
        'Rules before freeze',
        'The publish dialog previews delivery rules, frozen-link state, and review checklist before the assignment is persisted.'
      );
    case 'publish-settings-json':
      return item(
        id,
        'Publish settings JSON',
        'Resolved settings',
        'Assignment settings resolve through shared defaults before reaching teacher, student, submission, result, or export surfaces.'
      );
    case 'assignment-persistence':
      return item(
        id,
        'Assignment persistence',
        'Published row',
        'Published assignment inserts use assignment-domain persistence helpers instead of rebuilding database rows inline.'
      );
    case 'snapshot-freeze':
      return item(
        id,
        'Snapshot freeze',
        'Frozen ActivityContent',
        'The published snapshot freezes title, template, and content so later activity edits affect only future assignments.'
      );
    case 'share-link-distribution':
      return item(
        id,
        'Share-link distribution',
        'Public play URL',
        'Share links normalize and encode the public /play path consistently for publish success panels, list cards, and results.'
      );
    case 'post-publish-list-surface':
      return item(
        id,
        'Post-publish list surface',
        'Immediate distribution',
        'After publishing, assignment list state can surface copy, preview, and result actions for the new class link.'
      );
    case 'list-filter-owner-scope':
      return item(
        id,
        'List filter owner scope',
        'Owner assignments only',
        'Assignment list search, status filters, and pagination stay bound to the current teacher owner.'
      );
    case 'delivery-policy-summary':
      return item(
        id,
        'Delivery policy summary',
        'Teacher-visible rules',
        'Teacher cards and result pages summarize attempts, timer, close time, identity, answer reveal, item order, and instructions.'
      );
    case 'public-rules-summary':
      return item(
        id,
        'Public rules summary',
        'Student-visible rules',
        'Student rule cards describe sanitized assignment rules without answer keys, raw settings, or teacher-only content.'
      );
    case 'public-access-lifecycle':
      return item(
        id,
        'Public access lifecycle',
        'Open links only',
        'Public assignment payloads are returned only while the lifecycle helper says the assignment is open.'
      );
    case 'unavailable-content-guard':
      return item(
        id,
        'Unavailable content guard',
        'Runtime hidden',
        'Closed, expired, draft, or missing links return unavailable policy instead of runtime prompts, answers, or teacher materials.'
      );
    case 'item-order-policy':
      return item(
        id,
        'Item order policy',
        'Stable shuffled order',
        'Item order is resolved through assignment-domain helpers keyed by the share link while preserving snapshot order when shuffle is off.'
      );
    case 'student-identity-policy':
      return item(
        id,
        'Student identity policy',
        'Name or browser token',
        'Named and anonymous identities normalize before attempts are counted or grouped in teacher results.'
      );
    case 'attempt-limit-policy':
      return item(
        id,
        'Attempt limit policy',
        'Per-student cap',
        'Attempt limits reuse the same resolved settings across public rules, student runner, API enforcement, and result summaries.'
      );
    case 'timer-duration-policy':
      return item(
        id,
        'Timer duration policy',
        'Normalized seconds',
        'Student timers start after runtime readiness and submitted durations normalize and cap against the configured time limit.'
      );
    case 'close-time-lifecycle':
      return item(
        id,
        'Close-time lifecycle',
        'Closed or expired blocked',
        'Close-after windows and manual close/reopen status flow through shared lifecycle helpers.'
      );
    case 'student-start-readiness':
      return item(
        id,
        'Student start readiness',
        'Payload ready first',
        'Student start state waits for sanitized payload, identity, rules, runtime items, and timer readiness before play begins.'
      );
    case 'student-submit-readiness':
      return item(
        id,
        'Student submit readiness',
        'Explicit partial confirmation',
        'Student submit controls use prepared progress, payload, identity, timer, and confirmation state before sending answers.'
      );
    case 'submission-validation':
      return item(
        id,
        'Submission validation',
        'Unknown and duplicate guard',
        'Server-side submission validation rejects unknown runtime ids, duplicate ids, and answer lists longer than the frozen runtime.'
      );
    case 'attempt-persistence':
      return item(
        id,
        'Attempt persistence',
        'Scored attempt row',
        'The API delegates scored attempt row shape to buildScoredAttemptInsert after lifecycle and answer validation pass.'
      );
    case 'answer-feedback-gate':
      return item(
        id,
        'Answer feedback gate',
        'Reveal policy respected',
        'Correct answers, explanations, and accepted alternatives appear only in post-submit review when the assignment allows it.'
      );
    case 'result-stats':
      return item(
        id,
        'Result stats',
        'Shared attempt metrics',
        'Completions, average accuracy, points, and duration are computed through assignment-domain stats helpers.'
      );
    case 'result-review-scope':
      return item(
        id,
        'Result review scope',
        'Teacher review state',
        'Result pages share prepared review status, scope, sorting, and copy-preview evidence before teachers export or copy artifacts.'
      );
    case 'csv-export-policy':
      return item(
        id,
        'CSV export policy',
        'Delivery rules included',
        'CSV export preparation includes delivery policy fields while keeping CSV data URLs and raw private result text out of audit handoffs.'
      );
    case 'result-copy-boundary':
      return item(
        id,
        'Result copy boundary',
        'Teacher-only artifacts',
        'Copyable reteach and follow-up artifacts stay teacher-only and do not change the public student runner.'
      );
    case 'source-material-guard':
      return item(
        id,
        'Source material guard',
        'Storage keys hidden',
        'Delivery and result handoffs do not expose source-material storage keys or teacher private material lists.'
      );
    case 'raw-token-guard':
      return item(
        id,
        'Raw token guard',
        'Anonymous tokens hidden',
        'Anonymous browser tokens enforce attempts but stay out of public handoffs, assignment lists, results, and exports.'
      );
    case 'snapshot-results-retention':
      return item(
        id,
        'Snapshot results retention',
        'Attempts retained',
        'Closing or expiring a link blocks new public access while preserving prior attempts for teacher review.'
      );
    case 'delivery-chain-gate':
      return item(
        id,
        'Delivery chain gate',
        '30 source files',
        'The published assignment delivery chain keeps publish, public runner, submission, and result/export gates connected.'
      );
  }
}

function item(
  id: PublishedAssignmentDeliveryChainHandoffItemId,
  label: string,
  value: string,
  description: string
): Omit<PublishedAssignmentDeliveryChainHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}
