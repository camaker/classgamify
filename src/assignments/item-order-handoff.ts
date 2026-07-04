import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS = [
  'delivery-policy-scope',
  'normalized-share-seed',
  'shuffle-enabled-policy',
  'fixed-order-policy',
  'same-seed-stability',
  'different-seed-isolation',
  'input-array-guard',
  'item-count-preserved',
  'item-id-set-preserved',
  'unique-runtime-ids',
  'snapshot-order-preserved',
  'shuffled-order-prepared',
  'public-payload-ordering',
  'student-submit-ordering',
  'student-review-ordering',
  'student-runner-preview-ordering',
  'printable-worksheet-ordering',
  'delivery-summary-policy',
  'publish-preview-policy',
  'public-rule-summary-policy',
  'result-export-policy',
  'ordered-answer-contract',
  'share-slug-boundary',
  'runtime-id-boundary',
  'prompt-text-boundary',
  'choice-text-boundary',
  'answer-key-boundary',
  'source-material-boundary',
  'settings-json-boundary',
  'privacy-guard',
] as const;

export type AssignmentItemOrderHandoffItemId =
  (typeof ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS)[number];

export type AssignmentItemOrderHandoffEvidence = {
  alternateSeedChangesOrder: boolean;
  deliverySummaryExposesPolicy: boolean;
  fixedOrderMatchesSnapshot: boolean;
  inputArrayPreserved: boolean;
  itemCount: number;
  itemIdSetPreserved: boolean;
  normalizedShareSeedMatches: boolean;
  orderedAnswerContractUsesRuntimeItems: boolean;
  printableWorksheetUsesOrdering: boolean;
  publicAccessExposesPolicy: boolean;
  publicPayloadUsesOrdering: boolean;
  publishPreviewExposesPolicy: boolean;
  resultExportExposesPolicy: boolean;
  runtimeIdsUnique: boolean;
  sameSeedStable: boolean;
  shuffledOrderChanged: boolean;
  studentReviewUsesOrderedRuntimeItems: boolean;
  studentRunnerPreviewUsesOrdering: boolean;
  studentSubmitUsesOrdering: boolean;
};

export type AssignmentItemOrderHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentItemOrderHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentItemOrderHandoffPrivacyContract = {
  exposesAnswerKeyText: false;
  exposesRawSettingsJson: false;
  exposesRuntimeChoiceText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesShareSlug: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentAnswerText: false;
  itemIds: AssignmentItemOrderHandoffItemId[];
  scope: 'assignment-item-order-delivery-policy';
  usesSharedOrderingHelper: true;
};

export type AssignmentItemOrderHandoffView = {
  description: string;
  itemViews: AssignmentItemOrderHandoffItemView[];
  privacy: AssignmentItemOrderHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentItemOrderHandoffView(
  evidence: AssignmentItemOrderHandoffEvidence
): AssignmentItemOrderHandoffView {
  const itemViews = ASSIGNMENT_ITEM_ORDER_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentItemOrderHandoffItemView({
      description: getAssignmentItemOrderHandoffDescription(id),
      id,
      label: getAssignmentItemOrderHandoffLabel(id),
      value: getAssignmentItemOrderHandoffValue(id, evidence),
    })
  );

  return {
    description: m.assignment_item_order_handoff_description(),
    itemViews,
    privacy: buildAssignmentItemOrderHandoffPrivacyContract(itemViews),
    title: m.assignment_item_order_handoff_title(),
  };
}

function getAssignmentItemOrderHandoffValue(
  id: AssignmentItemOrderHandoffItemId,
  evidence: AssignmentItemOrderHandoffEvidence
) {
  switch (id) {
    case 'delivery-policy-scope':
      return m.assignment_item_order_handoff_delivery_policy_value();
    case 'normalized-share-seed':
      return formatAssignmentItemOrderBoolean(
        evidence.normalizedShareSeedMatches
      );
    case 'shuffle-enabled-policy':
      return m.assignment_delivery_item_order_shuffled();
    case 'fixed-order-policy':
      return m.assignment_delivery_item_order_fixed();
    case 'same-seed-stability':
      return formatAssignmentItemOrderBoolean(evidence.sameSeedStable);
    case 'different-seed-isolation':
      return formatAssignmentItemOrderBoolean(
        evidence.alternateSeedChangesOrder
      );
    case 'input-array-guard':
      return formatAssignmentItemOrderBoolean(evidence.inputArrayPreserved);
    case 'item-count-preserved':
      return formatAssignmentItemOrderItemCount(evidence.itemCount);
    case 'item-id-set-preserved':
      return formatAssignmentItemOrderIdCount(
        evidence.itemIdSetPreserved ? evidence.itemCount : 0
      );
    case 'unique-runtime-ids':
      return evidence.runtimeIdsUnique
        ? m.assignment_item_order_handoff_unique_value()
        : m.assignment_item_order_handoff_blocked_value();
    case 'snapshot-order-preserved':
      return evidence.fixedOrderMatchesSnapshot
        ? m.assignment_item_order_handoff_snapshot_order_value()
        : m.assignment_item_order_handoff_blocked_value();
    case 'shuffled-order-prepared':
      return evidence.shuffledOrderChanged
        ? m.assignment_item_order_handoff_stable_shuffle_value()
        : m.assignment_item_order_handoff_blocked_value();
    case 'public-payload-ordering':
      return formatAssignmentItemOrderBoolean(
        evidence.publicPayloadUsesOrdering
      );
    case 'student-submit-ordering':
      return formatAssignmentItemOrderBoolean(
        evidence.studentSubmitUsesOrdering
      );
    case 'student-review-ordering':
      return formatAssignmentItemOrderBoolean(
        evidence.studentReviewUsesOrderedRuntimeItems
      );
    case 'student-runner-preview-ordering':
      return formatAssignmentItemOrderBoolean(
        evidence.studentRunnerPreviewUsesOrdering
      );
    case 'printable-worksheet-ordering':
      return formatAssignmentItemOrderBoolean(
        evidence.printableWorksheetUsesOrdering
      );
    case 'delivery-summary-policy':
      return formatAssignmentItemOrderBoolean(
        evidence.deliverySummaryExposesPolicy
      );
    case 'publish-preview-policy':
      return formatAssignmentItemOrderBoolean(
        evidence.publishPreviewExposesPolicy
      );
    case 'public-rule-summary-policy':
      return formatAssignmentItemOrderBoolean(
        evidence.publicAccessExposesPolicy
      );
    case 'result-export-policy':
      return formatAssignmentItemOrderBoolean(
        evidence.resultExportExposesPolicy
      );
    case 'ordered-answer-contract':
      return formatAssignmentItemOrderBoolean(
        evidence.orderedAnswerContractUsesRuntimeItems
      );
    case 'share-slug-boundary':
    case 'runtime-id-boundary':
    case 'prompt-text-boundary':
    case 'choice-text-boundary':
    case 'answer-key-boundary':
    case 'source-material-boundary':
    case 'settings-json-boundary':
    case 'privacy-guard':
      return m.assignment_item_order_handoff_hidden_value();
  }
}

function getAssignmentItemOrderHandoffLabel(
  id: AssignmentItemOrderHandoffItemId
) {
  switch (id) {
    case 'delivery-policy-scope':
      return m.assignment_item_order_handoff_delivery_policy_label();
    case 'normalized-share-seed':
      return m.assignment_item_order_handoff_seed_label();
    case 'shuffle-enabled-policy':
      return m.assignment_item_order_handoff_shuffle_label();
    case 'fixed-order-policy':
      return m.assignment_item_order_handoff_fixed_label();
    case 'same-seed-stability':
      return m.assignment_item_order_handoff_same_seed_label();
    case 'different-seed-isolation':
      return m.assignment_item_order_handoff_different_seed_label();
    case 'input-array-guard':
      return m.assignment_item_order_handoff_input_guard_label();
    case 'item-count-preserved':
      return m.assignment_item_order_handoff_item_count_label();
    case 'item-id-set-preserved':
      return m.assignment_item_order_handoff_id_set_label();
    case 'unique-runtime-ids':
      return m.assignment_item_order_handoff_unique_ids_label();
    case 'snapshot-order-preserved':
      return m.assignment_item_order_handoff_snapshot_order_label();
    case 'shuffled-order-prepared':
      return m.assignment_item_order_handoff_stable_shuffle_label();
    case 'public-payload-ordering':
      return m.assignment_item_order_handoff_public_payload_label();
    case 'student-submit-ordering':
      return m.assignment_item_order_handoff_student_submit_label();
    case 'student-review-ordering':
      return m.assignment_item_order_handoff_student_review_label();
    case 'student-runner-preview-ordering':
      return m.assignment_item_order_handoff_runner_preview_label();
    case 'printable-worksheet-ordering':
      return m.assignment_item_order_handoff_printable_label();
    case 'delivery-summary-policy':
      return m.assignment_item_order_handoff_delivery_summary_label();
    case 'publish-preview-policy':
      return m.assignment_item_order_handoff_publish_preview_label();
    case 'public-rule-summary-policy':
      return m.assignment_item_order_handoff_public_rule_label();
    case 'result-export-policy':
      return m.assignment_item_order_handoff_result_export_label();
    case 'ordered-answer-contract':
      return m.assignment_item_order_handoff_answer_contract_label();
    case 'share-slug-boundary':
      return m.assignment_item_order_handoff_share_boundary_label();
    case 'runtime-id-boundary':
      return m.assignment_item_order_handoff_runtime_id_boundary_label();
    case 'prompt-text-boundary':
      return m.assignment_item_order_handoff_prompt_boundary_label();
    case 'choice-text-boundary':
      return m.assignment_item_order_handoff_choice_boundary_label();
    case 'answer-key-boundary':
      return m.assignment_item_order_handoff_answer_key_boundary_label();
    case 'source-material-boundary':
      return m.assignment_item_order_handoff_source_material_boundary_label();
    case 'settings-json-boundary':
      return m.assignment_item_order_handoff_settings_boundary_label();
    case 'privacy-guard':
      return m.assignment_item_order_handoff_privacy_label();
  }
}

function getAssignmentItemOrderHandoffDescription(
  id: AssignmentItemOrderHandoffItemId
) {
  switch (id) {
    case 'delivery-policy-scope':
      return m.assignment_item_order_handoff_delivery_policy_description();
    case 'normalized-share-seed':
      return m.assignment_item_order_handoff_seed_description();
    case 'shuffle-enabled-policy':
      return m.assignment_item_order_handoff_shuffle_description();
    case 'fixed-order-policy':
      return m.assignment_item_order_handoff_fixed_description();
    case 'same-seed-stability':
      return m.assignment_item_order_handoff_same_seed_description();
    case 'different-seed-isolation':
      return m.assignment_item_order_handoff_different_seed_description();
    case 'input-array-guard':
      return m.assignment_item_order_handoff_input_guard_description();
    case 'item-count-preserved':
      return m.assignment_item_order_handoff_item_count_description();
    case 'item-id-set-preserved':
      return m.assignment_item_order_handoff_id_set_description();
    case 'unique-runtime-ids':
      return m.assignment_item_order_handoff_unique_ids_description();
    case 'snapshot-order-preserved':
      return m.assignment_item_order_handoff_snapshot_order_description();
    case 'shuffled-order-prepared':
      return m.assignment_item_order_handoff_stable_shuffle_description();
    case 'public-payload-ordering':
      return m.assignment_item_order_handoff_public_payload_description();
    case 'student-submit-ordering':
      return m.assignment_item_order_handoff_student_submit_description();
    case 'student-review-ordering':
      return m.assignment_item_order_handoff_student_review_description();
    case 'student-runner-preview-ordering':
      return m.assignment_item_order_handoff_runner_preview_description();
    case 'printable-worksheet-ordering':
      return m.assignment_item_order_handoff_printable_description();
    case 'delivery-summary-policy':
      return m.assignment_item_order_handoff_delivery_summary_description();
    case 'publish-preview-policy':
      return m.assignment_item_order_handoff_publish_preview_description();
    case 'public-rule-summary-policy':
      return m.assignment_item_order_handoff_public_rule_description();
    case 'result-export-policy':
      return m.assignment_item_order_handoff_result_export_description();
    case 'ordered-answer-contract':
      return m.assignment_item_order_handoff_answer_contract_description();
    case 'share-slug-boundary':
      return m.assignment_item_order_handoff_share_boundary_description();
    case 'runtime-id-boundary':
      return m.assignment_item_order_handoff_runtime_id_boundary_description();
    case 'prompt-text-boundary':
      return m.assignment_item_order_handoff_prompt_boundary_description();
    case 'choice-text-boundary':
      return m.assignment_item_order_handoff_choice_boundary_description();
    case 'answer-key-boundary':
      return m.assignment_item_order_handoff_answer_key_boundary_description();
    case 'source-material-boundary':
      return m.assignment_item_order_handoff_source_material_boundary_description();
    case 'settings-json-boundary':
      return m.assignment_item_order_handoff_settings_boundary_description();
    case 'privacy-guard':
      return m.assignment_item_order_handoff_privacy_description();
  }
}

function buildAssignmentItemOrderHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<AssignmentItemOrderHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.assignment_item_order_handoff_item_aria_label({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildAssignmentItemOrderHandoffPrivacyContract(
  itemViews: AssignmentItemOrderHandoffItemView[]
): AssignmentItemOrderHandoffPrivacyContract {
  return {
    exposesAnswerKeyText: false,
    exposesRawSettingsJson: false,
    exposesRuntimeChoiceText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesShareSlug: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentAnswerText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    scope: 'assignment-item-order-delivery-policy',
    usesSharedOrderingHelper: true,
  };
}

function formatAssignmentItemOrderBoolean(value: boolean) {
  return value
    ? m.assignment_item_order_handoff_ready_value()
    : m.assignment_item_order_handoff_missing_value();
}

function formatAssignmentItemOrderIdCount(count: number) {
  const normalizedCount = normalizeAssignmentItemOrderCount(count);
  return normalizedCount === 1
    ? m.assignment_item_order_handoff_id_count_one({
        count: normalizedCount,
      })
    : m.assignment_item_order_handoff_id_count_many({
        count: normalizedCount,
      });
}

function formatAssignmentItemOrderItemCount(count: number) {
  const normalizedCount = normalizeAssignmentItemOrderCount(count);
  return normalizedCount === 1
    ? m.assignment_item_order_handoff_item_count_one({
        count: normalizedCount,
      })
    : m.assignment_item_order_handoff_item_count_many({
        count: normalizedCount,
      });
}

function normalizeAssignmentItemOrderCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
