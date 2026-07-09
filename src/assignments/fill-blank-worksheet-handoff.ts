import { normalizeRuntimeDisplayCount } from '@/assignments/runtime-display';
import type { FillBlankWorksheetView } from '@/assignments/student-runner-view';
import { m } from '@/locale/paraglide/messages';

const FILL_BLANK_ANSWER_CONTRACT_VALUE = '{ itemId, answer }';

export const FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'worksheet-state',
  'runtime-item-count',
  'inline-blank-count',
  'inline-input-coverage',
  'standalone-prompt-count',
  'standalone-fallback-coverage',
  'word-bank-row-count',
  'word-bank-coverage',
  'answered-item-count',
  'answer-row-scope',
  'unanswered-item-count',
  'partial-submit-boundary',
  'completion-progress',
  'input-placement-policy',
  'answer-input-state',
  'disabled-action-policy',
  'review-feedback-state',
  'review-visibility-policy',
  'review-item-count',
  'accepted-answer-boundary',
  'accepted-answer-visibility',
  'explanation-boundary',
  'explanation-visibility',
  'public-payload-boundary',
  'submission-contract',
  'runtime-id-boundary',
  'prompt-word-bank-boundary',
  'privacy-guard',
] as const;

export type FillBlankWorksheetHandoffItemId =
  (typeof FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS)[number];

export type FillBlankWorksheetHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: FillBlankWorksheetHandoffItemId;
  label: string;
  value: string;
};

export type FillBlankWorksheetHandoffPrivacyContract = {
  exposesAnswerKeys: false;
  exposesAnswerText: false;
  exposesRuntimeItemIds: false;
  exposesRuntimePromptText: false;
  exposesSourceMaterialMetadata: false;
  exposesStudentIdentity: false;
  exposesWordBankText: false;
  itemIds: FillBlankWorksheetHandoffItemId[];
  runnerSurface: 'fill-blank';
  scope: 'fill-blank-worksheet';
  templateType: 'fill-blank';
  usesSharedSubmissionContract: true;
};

export type FillBlankWorksheetHandoffView = {
  description: string;
  itemViews: FillBlankWorksheetHandoffItemView[];
  privacy: FillBlankWorksheetHandoffPrivacyContract;
  title: string;
};

type FillBlankWorksheetHandoffContext = {
  answeredItemCount: number;
  disabled: boolean;
  inlineBlankCount: number;
  itemCount: number;
  revealAnswer: boolean;
  reviewItemCount: number;
  standalonePromptCount: number;
  unansweredItemCount: number;
  wordBankRowCount: number;
};

export function buildFillBlankWorksheetHandoffView({
  disabled = false,
  revealAnswer = false,
  runnerView,
}: {
  disabled?: boolean;
  revealAnswer?: boolean;
  runnerView: FillBlankWorksheetView;
}): FillBlankWorksheetHandoffView {
  const context = buildFillBlankWorksheetHandoffContext({
    disabled,
    revealAnswer,
    runnerView,
  });
  const itemViews = FILL_BLANK_WORKSHEET_HANDOFF_ITEM_IDS.map((id) =>
    buildFillBlankWorksheetHandoffItemView({
      description: getFillBlankWorksheetHandoffDescription(id),
      id,
      label: getFillBlankWorksheetHandoffLabel(id),
      value: getFillBlankWorksheetHandoffValue(id, context),
    })
  );

  return {
    description: m.fill_blank_worksheet_handoff_description(),
    itemViews,
    privacy: buildFillBlankWorksheetHandoffPrivacyContract(itemViews),
    title: m.fill_blank_worksheet_handoff_title(),
  };
}

function buildFillBlankWorksheetHandoffContext({
  disabled,
  revealAnswer,
  runnerView,
}: {
  disabled: boolean;
  revealAnswer: boolean;
  runnerView: FillBlankWorksheetView;
}): FillBlankWorksheetHandoffContext {
  const itemCount = normalizeRuntimeDisplayCount(
    runnerView.fillBlankItemViews.length
  );

  return {
    answeredItemCount: normalizeRuntimeDisplayCount(
      runnerView.completionSummary.answeredItemCount,
      { max: itemCount }
    ),
    disabled,
    inlineBlankCount: normalizeRuntimeDisplayCount(
      runnerView.fillBlankItemViews.filter(
        (itemView) => itemView.promptView.mode === 'inline'
      ).length,
      { max: itemCount }
    ),
    itemCount,
    revealAnswer,
    reviewItemCount: normalizeRuntimeDisplayCount(
      runnerView.fillBlankItemViews.filter((itemView) => itemView.reviewItem)
        .length,
      { max: itemCount }
    ),
    standalonePromptCount: normalizeRuntimeDisplayCount(
      runnerView.fillBlankItemViews.filter(
        (itemView) => itemView.promptView.mode === 'standalone'
      ).length,
      { max: itemCount }
    ),
    unansweredItemCount: normalizeRuntimeDisplayCount(
      runnerView.completionSummary.unansweredItemCount,
      { max: itemCount }
    ),
    wordBankRowCount: normalizeRuntimeDisplayCount(
      runnerView.fillBlankItemViews.filter((itemView) => itemView.wordBankText)
        .length,
      { max: itemCount }
    ),
  };
}

function getFillBlankWorksheetHandoffValue(
  id: FillBlankWorksheetHandoffItemId,
  context: FillBlankWorksheetHandoffContext
) {
  switch (id) {
    case 'template-type':
    case 'runner-surface':
      return 'fill-blank';
    case 'worksheet-state':
      return context.itemCount > 0
        ? m.fill_blank_worksheet_handoff_active_value()
        : m.fill_blank_worksheet_handoff_empty_value();
    case 'runtime-item-count':
      return formatFillBlankWorksheetItemCount(context.itemCount);
    case 'inline-blank-count':
      return formatFillBlankWorksheetBlankCount(context.inlineBlankCount);
    case 'inline-input-coverage':
      return m.fill_blank_worksheet_handoff_inline_coverage_value({
        inlineCount: context.inlineBlankCount,
        itemCount: context.itemCount,
      });
    case 'standalone-prompt-count':
      return formatFillBlankWorksheetStandalonePromptCount(
        context.standalonePromptCount
      );
    case 'standalone-fallback-coverage':
      return m.fill_blank_worksheet_handoff_standalone_coverage_value({
        itemCount: context.itemCount,
        standaloneCount: context.standalonePromptCount,
      });
    case 'word-bank-row-count':
      return formatFillBlankWorksheetWordBankRowCount(context.wordBankRowCount);
    case 'word-bank-coverage':
      return m.fill_blank_worksheet_handoff_word_bank_coverage_value({
        itemCount: context.itemCount,
        wordBankCount: context.wordBankRowCount,
      });
    case 'answered-item-count':
      return String(context.answeredItemCount);
    case 'answer-row-scope':
      return m.fill_blank_worksheet_handoff_answer_row_scope_value();
    case 'unanswered-item-count':
      return String(context.unansweredItemCount);
    case 'partial-submit-boundary':
      return context.unansweredItemCount > 0
        ? m.fill_blank_worksheet_handoff_partial_submit_ready_value()
        : m.fill_blank_worksheet_handoff_partial_submit_complete_value();
    case 'completion-progress':
      return m.fill_blank_worksheet_handoff_progress_value({
        answeredCount: context.answeredItemCount,
        itemCount: context.itemCount,
      });
    case 'input-placement-policy':
      return m.fill_blank_worksheet_handoff_inline_policy_value();
    case 'answer-input-state':
      if (context.itemCount === 0) {
        return m.fill_blank_worksheet_handoff_unavailable_value();
      }
      return context.disabled
        ? m.fill_blank_worksheet_handoff_locked_value()
        : m.fill_blank_worksheet_handoff_ready_value();
    case 'disabled-action-policy':
      return context.disabled
        ? m.fill_blank_worksheet_handoff_actions_locked_value()
        : m.fill_blank_worksheet_handoff_actions_enabled_value();
    case 'review-feedback-state':
      if (!context.revealAnswer) {
        return m.fill_blank_worksheet_handoff_hidden_value();
      }
      return context.reviewItemCount > 0
        ? m.fill_blank_worksheet_handoff_visible_value()
        : m.fill_blank_worksheet_handoff_waiting_for_result_value();
    case 'review-visibility-policy':
      return getFillBlankWorksheetReviewStateValue(context);
    case 'review-item-count':
      return String(context.reviewItemCount);
    case 'accepted-answer-boundary':
    case 'accepted-answer-visibility':
    case 'explanation-boundary':
    case 'explanation-visibility':
      return m.fill_blank_worksheet_handoff_post_submit_value();
    case 'public-payload-boundary':
      return m.fill_blank_worksheet_handoff_sanitized_runtime_value();
    case 'submission-contract':
      return FILL_BLANK_ANSWER_CONTRACT_VALUE;
    case 'runtime-id-boundary':
      return m.fill_blank_worksheet_handoff_runtime_id_boundary_value();
    case 'prompt-word-bank-boundary':
      return m.fill_blank_worksheet_handoff_prompt_word_bank_boundary_value();
    case 'privacy-guard':
      return m.fill_blank_worksheet_handoff_private_data_omitted_value();
  }
}

function getFillBlankWorksheetReviewStateValue(
  context: FillBlankWorksheetHandoffContext
) {
  if (!context.revealAnswer) {
    return m.fill_blank_worksheet_handoff_hidden_value();
  }

  return context.reviewItemCount > 0
    ? m.fill_blank_worksheet_handoff_visible_value()
    : m.fill_blank_worksheet_handoff_waiting_for_result_value();
}

function getFillBlankWorksheetHandoffLabel(
  id: FillBlankWorksheetHandoffItemId
) {
  switch (id) {
    case 'template-type':
      return m.fill_blank_worksheet_handoff_template_label();
    case 'runner-surface':
      return m.fill_blank_worksheet_handoff_surface_label();
    case 'worksheet-state':
      return m.fill_blank_worksheet_handoff_state_label();
    case 'runtime-item-count':
      return m.fill_blank_worksheet_handoff_item_count_label();
    case 'inline-blank-count':
      return m.fill_blank_worksheet_handoff_inline_blank_count_label();
    case 'inline-input-coverage':
      return m.fill_blank_worksheet_handoff_inline_coverage_label();
    case 'standalone-prompt-count':
      return m.fill_blank_worksheet_handoff_standalone_count_label();
    case 'standalone-fallback-coverage':
      return m.fill_blank_worksheet_handoff_standalone_coverage_label();
    case 'word-bank-row-count':
      return m.fill_blank_worksheet_handoff_word_bank_count_label();
    case 'word-bank-coverage':
      return m.fill_blank_worksheet_handoff_word_bank_coverage_label();
    case 'answered-item-count':
      return m.fill_blank_worksheet_handoff_answered_count_label();
    case 'answer-row-scope':
      return m.fill_blank_worksheet_handoff_answer_row_scope_label();
    case 'unanswered-item-count':
      return m.fill_blank_worksheet_handoff_unanswered_count_label();
    case 'partial-submit-boundary':
      return m.fill_blank_worksheet_handoff_partial_submit_label();
    case 'completion-progress':
      return m.fill_blank_worksheet_handoff_progress_label();
    case 'input-placement-policy':
      return m.fill_blank_worksheet_handoff_input_placement_label();
    case 'answer-input-state':
      return m.fill_blank_worksheet_handoff_input_state_label();
    case 'disabled-action-policy':
      return m.fill_blank_worksheet_handoff_disabled_label();
    case 'review-feedback-state':
      return m.fill_blank_worksheet_handoff_review_label();
    case 'review-visibility-policy':
      return m.fill_blank_worksheet_handoff_review_visibility_label();
    case 'review-item-count':
      return m.fill_blank_worksheet_handoff_review_count_label();
    case 'accepted-answer-boundary':
      return m.fill_blank_worksheet_handoff_accepted_answer_label();
    case 'accepted-answer-visibility':
      return m.fill_blank_worksheet_handoff_accepted_answer_visibility_label();
    case 'explanation-boundary':
      return m.fill_blank_worksheet_handoff_explanation_label();
    case 'explanation-visibility':
      return m.fill_blank_worksheet_handoff_explanation_visibility_label();
    case 'public-payload-boundary':
      return m.fill_blank_worksheet_handoff_public_payload_label();
    case 'submission-contract':
      return m.fill_blank_worksheet_handoff_submission_label();
    case 'runtime-id-boundary':
      return m.fill_blank_worksheet_handoff_runtime_id_boundary_label();
    case 'prompt-word-bank-boundary':
      return m.fill_blank_worksheet_handoff_prompt_word_bank_boundary_label();
    case 'privacy-guard':
      return m.fill_blank_worksheet_handoff_privacy_label();
  }
}

function getFillBlankWorksheetHandoffDescription(
  id: FillBlankWorksheetHandoffItemId
) {
  switch (id) {
    case 'template-type':
      return m.fill_blank_worksheet_handoff_template_description();
    case 'runner-surface':
      return m.fill_blank_worksheet_handoff_surface_description();
    case 'worksheet-state':
      return m.fill_blank_worksheet_handoff_state_description();
    case 'runtime-item-count':
      return m.fill_blank_worksheet_handoff_item_count_description();
    case 'inline-blank-count':
      return m.fill_blank_worksheet_handoff_inline_blank_count_description();
    case 'inline-input-coverage':
      return m.fill_blank_worksheet_handoff_inline_coverage_description();
    case 'standalone-prompt-count':
      return m.fill_blank_worksheet_handoff_standalone_count_description();
    case 'standalone-fallback-coverage':
      return m.fill_blank_worksheet_handoff_standalone_coverage_description();
    case 'word-bank-row-count':
      return m.fill_blank_worksheet_handoff_word_bank_count_description();
    case 'word-bank-coverage':
      return m.fill_blank_worksheet_handoff_word_bank_coverage_description();
    case 'answered-item-count':
      return m.fill_blank_worksheet_handoff_answered_count_description();
    case 'answer-row-scope':
      return m.fill_blank_worksheet_handoff_answer_row_scope_description();
    case 'unanswered-item-count':
      return m.fill_blank_worksheet_handoff_unanswered_count_description();
    case 'partial-submit-boundary':
      return m.fill_blank_worksheet_handoff_partial_submit_description();
    case 'completion-progress':
      return m.fill_blank_worksheet_handoff_progress_description();
    case 'input-placement-policy':
      return m.fill_blank_worksheet_handoff_input_placement_description();
    case 'answer-input-state':
      return m.fill_blank_worksheet_handoff_input_state_description();
    case 'disabled-action-policy':
      return m.fill_blank_worksheet_handoff_disabled_description();
    case 'review-feedback-state':
      return m.fill_blank_worksheet_handoff_review_description();
    case 'review-visibility-policy':
      return m.fill_blank_worksheet_handoff_review_visibility_description();
    case 'review-item-count':
      return m.fill_blank_worksheet_handoff_review_count_description();
    case 'accepted-answer-boundary':
      return m.fill_blank_worksheet_handoff_accepted_answer_description();
    case 'accepted-answer-visibility':
      return m.fill_blank_worksheet_handoff_accepted_answer_visibility_description();
    case 'explanation-boundary':
      return m.fill_blank_worksheet_handoff_explanation_description();
    case 'explanation-visibility':
      return m.fill_blank_worksheet_handoff_explanation_visibility_description();
    case 'public-payload-boundary':
      return m.fill_blank_worksheet_handoff_public_payload_description();
    case 'submission-contract':
      return m.fill_blank_worksheet_handoff_submission_description();
    case 'runtime-id-boundary':
      return m.fill_blank_worksheet_handoff_runtime_id_boundary_description();
    case 'prompt-word-bank-boundary':
      return m.fill_blank_worksheet_handoff_prompt_word_bank_boundary_description();
    case 'privacy-guard':
      return m.fill_blank_worksheet_handoff_privacy_description();
  }
}

function buildFillBlankWorksheetHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<FillBlankWorksheetHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.fill_blank_worksheet_handoff_item_aria({
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

function buildFillBlankWorksheetHandoffPrivacyContract(
  itemViews: FillBlankWorksheetHandoffItemView[]
): FillBlankWorksheetHandoffPrivacyContract {
  return {
    exposesAnswerKeys: false,
    exposesAnswerText: false,
    exposesRuntimeItemIds: false,
    exposesRuntimePromptText: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentIdentity: false,
    exposesWordBankText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    runnerSurface: 'fill-blank',
    scope: 'fill-blank-worksheet',
    templateType: 'fill-blank',
    usesSharedSubmissionContract: true,
  };
}

function formatFillBlankWorksheetItemCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.fill_blank_worksheet_handoff_item_count_one({
      count: normalizedCount,
    });
  }

  return m.fill_blank_worksheet_handoff_item_count_many({
    count: normalizedCount,
  });
}

function formatFillBlankWorksheetBlankCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.fill_blank_worksheet_handoff_blank_count_one({
      count: normalizedCount,
    });
  }

  return m.fill_blank_worksheet_handoff_blank_count_many({
    count: normalizedCount,
  });
}

function formatFillBlankWorksheetStandalonePromptCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.fill_blank_worksheet_handoff_standalone_count_one({
      count: normalizedCount,
    });
  }

  return m.fill_blank_worksheet_handoff_standalone_count_many({
    count: normalizedCount,
  });
}

function formatFillBlankWorksheetWordBankRowCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.fill_blank_worksheet_handoff_word_bank_count_one({
      count: normalizedCount,
    });
  }

  return m.fill_blank_worksheet_handoff_word_bank_count_many({
    count: normalizedCount,
  });
}
