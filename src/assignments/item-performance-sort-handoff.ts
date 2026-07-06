import type { AssignmentItemAnalysis } from '@/assignments/results';
import {
  DEFAULT_ITEM_PERFORMANCE_SORT,
  ITEM_PERFORMANCE_SORT_VALUES,
  type AssignmentResultReviewScopeSummary,
  type ItemPerformanceSort,
} from '@/assignments/result-filters';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS = [
  'sort-scope',
  'selected-sort',
  'default-sort',
  'sort-option-count',
  'snapshot-order',
  'lowest-accuracy-order',
  'submitted-count-order',
  'item-type-order',
  'route-parser',
  'route-default-elision',
  'invalid-route-guard',
  'control-status',
  'control-description',
  'table-row-count',
  'matched-item-count',
  'copy-scope-row-count',
  'stable-order-tiebreak',
  'submitted-count-tiebreak',
  'accuracy-tiebreak',
  'type-tiebreak',
  'zero-count-guard',
  'nonfinite-accuracy-guard',
  'table-consumer',
  'review-scope-consumer',
  'copy-artifact-consumer',
  'csv-export-boundary',
  'prompt-text-guard',
  'answer-key-guard',
  'student-answer-guard',
  'privacy-guard',
] as const;

export type AssignmentItemPerformanceSortHandoffItemId =
  (typeof ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS)[number];

export type AssignmentItemPerformanceSortHandoffEvidence = {
  copyScopeRowCount: number;
  itemSort: ItemPerformanceSort;
  matchedItemCount: number;
  sortOptionCount: number;
  tableRowCount: number;
  totalItemCount: number;
};

export type BuildAssignmentItemPerformanceSortHandoffEvidenceInput = {
  items: AssignmentItemAnalysis[];
  reviewScopeSummary: AssignmentResultReviewScopeSummary;
  sort: ItemPerformanceSort;
  tableRowCount: number;
};

export type AssignmentItemPerformanceSortHandoffControlView = {
  selectedSortDescription: string;
  selectedSortLabel: string;
  statusDescription: string;
  statusLabel: string;
};

export type BuildAssignmentItemPerformanceSortHandoffViewInput =
  AssignmentItemPerformanceSortHandoffControlView & {
    evidence: AssignmentItemPerformanceSortHandoffEvidence;
  };

export type AssignmentItemPerformanceSortHandoffPrivacyContract = {
  exposesAcceptedAnswers: false;
  exposesCopyArtifactText: false;
  exposesCsvDataUrl: false;
  exposesPromptText: false;
  exposesRawAnonymousToken: false;
  exposesShareSlug: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabels: false;
  exposesTeacherAnswerKey: false;
  itemIds: AssignmentItemPerformanceSortHandoffItemId[];
  mutatesResultData: false;
  scope: 'teacher-result-item-performance-sort';
  usesAssignmentDomainHelpers: true;
  usesSortedTableRows: true;
};

export type AssignmentItemPerformanceSortHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentItemPerformanceSortHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type AssignmentItemPerformanceSortHandoffView = {
  description: string;
  itemViews: AssignmentItemPerformanceSortHandoffItemView[];
  privacy: AssignmentItemPerformanceSortHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentItemPerformanceSortHandoffEvidence({
  items,
  reviewScopeSummary,
  sort,
  tableRowCount,
}: BuildAssignmentItemPerformanceSortHandoffEvidenceInput): AssignmentItemPerformanceSortHandoffEvidence {
  return {
    copyScopeRowCount: normalizeItemPerformanceSortHandoffCount(
      reviewScopeSummary.itemPerformance.matched
    ),
    itemSort: sort,
    matchedItemCount: normalizeItemPerformanceSortHandoffCount(items.length),
    sortOptionCount: ITEM_PERFORMANCE_SORT_VALUES.length,
    tableRowCount: normalizeItemPerformanceSortHandoffCount(tableRowCount),
    totalItemCount: normalizeItemPerformanceSortHandoffCount(
      reviewScopeSummary.itemPerformance.total
    ),
  };
}

export function buildAssignmentItemPerformanceSortHandoffView(
  input: BuildAssignmentItemPerformanceSortHandoffViewInput
): AssignmentItemPerformanceSortHandoffView {
  const itemViews = ASSIGNMENT_ITEM_PERFORMANCE_SORT_HANDOFF_ITEM_IDS.map(
    (id) => buildAssignmentItemPerformanceSortHandoffItemView(id, input)
  );

  return {
    description: m.assignment_item_performance_sort_handoff_description(),
    itemViews,
    privacy:
      buildAssignmentItemPerformanceSortHandoffPrivacyContract(itemViews),
    title: m.assignment_item_performance_sort_handoff_title(),
  };
}

function buildAssignmentItemPerformanceSortHandoffItemView(
  id: AssignmentItemPerformanceSortHandoffItemId,
  context: BuildAssignmentItemPerformanceSortHandoffViewInput
): AssignmentItemPerformanceSortHandoffItemView {
  const { evidence } = context;

  switch (id) {
    case 'sort-scope':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_scope_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_scope_label(),
        value: m.assignment_item_performance_sort_handoff_scope_value(),
      });
    case 'selected-sort':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description: context.selectedSortDescription,
        id,
        label: m.assignment_item_performance_sort_handoff_selected_sort_label(),
        statusLabel: context.statusLabel,
        value: context.selectedSortLabel,
      });
    case 'default-sort':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_default_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_default_label(),
        value: formatItemPerformanceSortDefaultValue(evidence.itemSort),
      });
    case 'sort-option-count':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_option_count_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_option_count_label(),
        value: formatItemPerformanceSortHandoffNumber(evidence.sortOptionCount),
      });
    case 'snapshot-order':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_snapshot_description(),
        id,
        label: m.assignment_result_sort_snapshot_order(),
        value: formatSortAvailability(evidence.itemSort === 'original'),
      });
    case 'lowest-accuracy-order':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_accuracy_description(),
        id,
        label: m.assignment_result_sort_lowest_accuracy(),
        value: formatSortAvailability(evidence.itemSort === 'accuracy'),
      });
    case 'submitted-count-order':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_submitted_description(),
        id,
        label: m.assignment_result_sort_most_answered(),
        value: formatSortAvailability(evidence.itemSort === 'submitted'),
      });
    case 'item-type-order':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_type_description(),
        id,
        label: m.assignment_result_sort_item_type(),
        value: formatSortAvailability(evidence.itemSort === 'type'),
      });
    case 'route-parser':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_route_parser_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_route_parser_label(),
        value: 'parseItemPerformanceSort',
      });
    case 'route-default-elision':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_route_default_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_route_default_label(),
        value:
          m.assignment_item_performance_sort_handoff_defaults_omitted_value(),
      });
    case 'invalid-route-guard':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_invalid_route_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_invalid_route_label(),
        value: m.assignment_item_performance_sort_handoff_invalid_route_value(),
      });
    case 'control-status':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description: context.statusDescription,
        id,
        label:
          m.assignment_item_performance_sort_handoff_control_status_label(),
        statusLabel: context.statusLabel,
        value: context.statusLabel,
      });
    case 'control-description':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_control_description_description(),
        id,
        label:
          m.assignment_item_performance_sort_handoff_control_description_label(),
        value: context.selectedSortDescription,
      });
    case 'table-row-count':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_table_rows_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_table_rows_label(),
        value: formatItemPerformanceSortHandoffNumber(evidence.tableRowCount),
      });
    case 'matched-item-count':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_matched_items_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_matched_items_label(),
        value: formatItemPerformanceSortHandoffRatio({
          matched: evidence.matchedItemCount,
          total: evidence.totalItemCount,
        }),
      });
    case 'copy-scope-row-count':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_copy_rows_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_copy_rows_label(),
        value: formatItemPerformanceSortHandoffNumber(
          evidence.copyScopeRowCount
        ),
      });
    case 'stable-order-tiebreak':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_stable_tiebreak_description(),
        id,
        label:
          m.assignment_item_performance_sort_handoff_stable_tiebreak_label(),
        value:
          m.assignment_item_performance_sort_handoff_snapshot_tiebreak_value(),
      });
    case 'submitted-count-tiebreak':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_submitted_tiebreak_description(),
        id,
        label:
          m.assignment_item_performance_sort_handoff_submitted_tiebreak_label(),
        value:
          m.assignment_item_performance_sort_handoff_submitted_tiebreak_value(),
      });
    case 'accuracy-tiebreak':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_accuracy_tiebreak_description(),
        id,
        label:
          m.assignment_item_performance_sort_handoff_accuracy_tiebreak_label(),
        value:
          m.assignment_item_performance_sort_handoff_accuracy_tiebreak_value(),
      });
    case 'type-tiebreak':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_type_tiebreak_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_type_tiebreak_label(),
        value: m.assignment_item_performance_sort_handoff_type_tiebreak_value(),
      });
    case 'zero-count-guard':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_zero_guard_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_zero_guard_label(),
        value: '0',
      });
    case 'nonfinite-accuracy-guard':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_nonfinite_guard_description(),
        id,
        label:
          m.assignment_item_performance_sort_handoff_nonfinite_guard_label(),
        value: '0',
      });
    case 'table-consumer':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_table_consumer_description(),
        id,
        label:
          m.assignment_item_performance_sort_handoff_table_consumer_label(),
        value:
          m.assignment_item_performance_sort_handoff_table_consumer_value(),
      });
    case 'review-scope-consumer':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_review_scope_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_review_scope_label(),
        value: m.assignment_item_performance_sort_handoff_review_scope_value(),
      });
    case 'copy-artifact-consumer':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_copy_artifact_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_copy_artifact_label(),
        value: m.assignment_item_performance_sort_handoff_copy_artifact_value(),
      });
    case 'csv-export-boundary':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_csv_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_csv_label(),
        value: m.assignment_item_performance_sort_handoff_csv_value(),
      });
    case 'prompt-text-guard':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_prompt_guard_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_prompt_guard_label(),
        value: m.assignment_item_performance_sort_handoff_hidden_value(),
      });
    case 'answer-key-guard':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_answer_guard_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_answer_guard_label(),
        value: m.assignment_item_performance_sort_handoff_hidden_value(),
      });
    case 'student-answer-guard':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_student_answer_guard_description(),
        id,
        label:
          m.assignment_item_performance_sort_handoff_student_answer_guard_label(),
        value: m.assignment_item_performance_sort_handoff_hidden_value(),
      });
    case 'privacy-guard':
      return buildAssignmentItemPerformanceSortHandoffOutput({
        description:
          m.assignment_item_performance_sort_handoff_privacy_description(),
        id,
        label: m.assignment_item_performance_sort_handoff_privacy_label(),
        value: m.assignment_item_performance_sort_handoff_hidden_value(),
      });
  }
}

function buildAssignmentItemPerformanceSortHandoffOutput({
  description,
  id,
  label,
  statusLabel,
  value,
}: Omit<AssignmentItemPerformanceSortHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: statusLabel
      ? m.assignment_item_performance_sort_handoff_item_status_aria_label({
          description,
          label,
          status: statusLabel,
          value,
        })
      : m.assignment_item_performance_sort_handoff_item_aria_label({
          description,
          label,
          value,
        }),
    description,
    id,
    label,
    ...(statusLabel ? { statusLabel } : {}),
    value,
  };
}

function buildAssignmentItemPerformanceSortHandoffPrivacyContract(
  itemViews: AssignmentItemPerformanceSortHandoffItemView[]
): AssignmentItemPerformanceSortHandoffPrivacyContract {
  return {
    exposesAcceptedAnswers: false,
    exposesCopyArtifactText: false,
    exposesCsvDataUrl: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesShareSlug: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesTeacherAnswerKey: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesResultData: false,
    scope: 'teacher-result-item-performance-sort',
    usesAssignmentDomainHelpers: true,
    usesSortedTableRows: true,
  };
}

function formatSortAvailability(isActive: boolean) {
  return isActive
    ? m.assignment_item_performance_sort_handoff_active_value()
    : m.assignment_item_performance_sort_handoff_available_value();
}

function formatItemPerformanceSortDefaultValue(sort: ItemPerformanceSort) {
  return sort === DEFAULT_ITEM_PERFORMANCE_SORT
    ? m.assignment_item_performance_sort_handoff_default_kept_value()
    : m.assignment_item_performance_sort_handoff_default_persisted_value();
}

function formatItemPerformanceSortHandoffRatio({
  matched,
  total,
}: {
  matched: number;
  total: number;
}) {
  return m.assignment_item_performance_sort_handoff_count_ratio({
    matched: formatItemPerformanceSortHandoffNumber(matched),
    total: formatItemPerformanceSortHandoffNumber(total),
  });
}

function formatItemPerformanceSortHandoffNumber(value: number) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

function normalizeItemPerformanceSortHandoffCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
