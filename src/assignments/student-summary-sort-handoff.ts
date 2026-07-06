import type { AssignmentStudentSummary } from '@/assignments/results';
import {
  DEFAULT_STUDENT_SUMMARY_SORT,
  STUDENT_SUMMARY_SORT_VALUES,
  type AssignmentResultReviewScopeSummary,
  type StudentSummarySort,
} from '@/assignments/result-filters';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS = [
  'sort-scope',
  'selected-sort',
  'default-sort',
  'sort-option-count',
  'needs-review-order',
  'best-score-order',
  'student-name-order',
  'attempt-count-order',
  'last-submitted-order',
  'route-parser',
  'route-default-elision',
  'invalid-route-guard',
  'control-status',
  'control-description',
  'table-row-count',
  'matched-student-count',
  'copy-scope-row-count',
  'follow-up-priority-tiebreak',
  'best-score-tiebreak',
  'attempt-count-tiebreak',
  'last-submitted-tiebreak',
  'display-label-tiebreak',
  'missing-date-guard',
  'nonfinite-count-guard',
  'table-consumer',
  'review-scope-consumer',
  'copy-artifact-consumer',
  'anonymous-label-guard',
  'student-answer-guard',
  'privacy-guard',
] as const;

export type AssignmentStudentSummarySortHandoffItemId =
  (typeof ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS)[number];

export type AssignmentStudentSummarySortHandoffEvidence = {
  copyScopeRowCount: number;
  matchedStudentCount: number;
  sortOptionCount: number;
  studentSort: StudentSummarySort;
  tableRowCount: number;
  totalStudentCount: number;
};

export type BuildAssignmentStudentSummarySortHandoffEvidenceInput = {
  reviewScopeSummary: AssignmentResultReviewScopeSummary;
  sort: StudentSummarySort;
  students: AssignmentStudentSummary[];
  tableRowCount: number;
};

export type AssignmentStudentSummarySortHandoffControlView = {
  selectedSortDescription: string;
  selectedSortLabel: string;
  statusDescription: string;
  statusLabel: string;
};

export type BuildAssignmentStudentSummarySortHandoffViewInput =
  AssignmentStudentSummarySortHandoffControlView & {
    evidence: AssignmentStudentSummarySortHandoffEvidence;
  };

export type AssignmentStudentSummarySortHandoffPrivacyContract = {
  exposesCopyArtifactText: false;
  exposesRawAnonymousToken: false;
  exposesRawRouteQuery: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabels: false;
  exposesStudentKeys: false;
  exposesTeacherAnswerKey: false;
  itemIds: AssignmentStudentSummarySortHandoffItemId[];
  mutatesResultData: false;
  scope: 'teacher-result-student-summary-sort';
  usesAssignmentDomainHelpers: true;
  usesSortedTableRows: true;
};

export type AssignmentStudentSummarySortHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentStudentSummarySortHandoffItemId;
  label: string;
  statusLabel?: string;
  value: string;
};

export type AssignmentStudentSummarySortHandoffView = {
  description: string;
  itemViews: AssignmentStudentSummarySortHandoffItemView[];
  privacy: AssignmentStudentSummarySortHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentStudentSummarySortHandoffEvidence({
  reviewScopeSummary,
  sort,
  students,
  tableRowCount,
}: BuildAssignmentStudentSummarySortHandoffEvidenceInput): AssignmentStudentSummarySortHandoffEvidence {
  return {
    copyScopeRowCount: normalizeStudentSummarySortHandoffCount(
      reviewScopeSummary.students.matched
    ),
    matchedStudentCount: normalizeStudentSummarySortHandoffCount(
      students.length
    ),
    sortOptionCount: STUDENT_SUMMARY_SORT_VALUES.length,
    studentSort: sort,
    tableRowCount: normalizeStudentSummarySortHandoffCount(tableRowCount),
    totalStudentCount: normalizeStudentSummarySortHandoffCount(
      reviewScopeSummary.students.total
    ),
  };
}

export function buildAssignmentStudentSummarySortHandoffView(
  input: BuildAssignmentStudentSummarySortHandoffViewInput
): AssignmentStudentSummarySortHandoffView {
  const itemViews = ASSIGNMENT_STUDENT_SUMMARY_SORT_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentStudentSummarySortHandoffItemView(id, input)
  );

  return {
    description: m.assignment_student_summary_sort_handoff_description(),
    itemViews,
    privacy: buildAssignmentStudentSummarySortHandoffPrivacyContract(itemViews),
    title: m.assignment_student_summary_sort_handoff_title(),
  };
}

function buildAssignmentStudentSummarySortHandoffItemView(
  id: AssignmentStudentSummarySortHandoffItemId,
  context: BuildAssignmentStudentSummarySortHandoffViewInput
): AssignmentStudentSummarySortHandoffItemView {
  const { evidence } = context;

  switch (id) {
    case 'sort-scope':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_scope_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_scope_label(),
        value: m.assignment_student_summary_sort_handoff_scope_value(),
      });
    case 'selected-sort':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description: context.selectedSortDescription,
        id,
        label: m.assignment_student_summary_sort_handoff_selected_sort_label(),
        statusLabel: context.statusLabel,
        value: context.selectedSortLabel,
      });
    case 'default-sort':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_default_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_default_label(),
        value: formatStudentSummarySortDefaultValue(evidence.studentSort),
      });
    case 'sort-option-count':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_option_count_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_option_count_label(),
        value: formatStudentSummarySortHandoffNumber(evidence.sortOptionCount),
      });
    case 'needs-review-order':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_needs_review_description(),
        id,
        label: m.assignment_result_sort_needs_review(),
        value: formatStudentSummarySortAvailability(
          evidence.studentSort === 'needs-review'
        ),
      });
    case 'best-score-order':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_best_score_description(),
        id,
        label: m.assignment_result_sort_best_score(),
        value: formatStudentSummarySortAvailability(
          evidence.studentSort === 'best'
        ),
      });
    case 'student-name-order':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_student_name_description(),
        id,
        label: m.assignment_result_sort_student_name(),
        value: formatStudentSummarySortAvailability(
          evidence.studentSort === 'name'
        ),
      });
    case 'attempt-count-order':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_attempt_count_description(),
        id,
        label: m.assignment_result_sort_attempts(),
        value: formatStudentSummarySortAvailability(
          evidence.studentSort === 'attempts'
        ),
      });
    case 'last-submitted-order':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_last_submitted_description(),
        id,
        label: m.assignment_result_sort_last_submitted(),
        value: formatStudentSummarySortAvailability(
          evidence.studentSort === 'last-submitted'
        ),
      });
    case 'route-parser':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_route_parser_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_route_parser_label(),
        value: 'parseStudentSummarySort',
      });
    case 'route-default-elision':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_route_default_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_route_default_label(),
        value:
          m.assignment_student_summary_sort_handoff_defaults_omitted_value(),
      });
    case 'invalid-route-guard':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_invalid_route_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_invalid_route_label(),
        value: m.assignment_student_summary_sort_handoff_invalid_route_value(),
      });
    case 'control-status':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description: context.statusDescription,
        id,
        label: m.assignment_student_summary_sort_handoff_control_status_label(),
        statusLabel: context.statusLabel,
        value: context.statusLabel,
      });
    case 'control-description':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_control_description_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_control_description_label(),
        value: context.selectedSortDescription,
      });
    case 'table-row-count':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_table_rows_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_table_rows_label(),
        value: formatStudentSummarySortHandoffNumber(evidence.tableRowCount),
      });
    case 'matched-student-count':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_matched_students_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_matched_students_label(),
        value: formatStudentSummarySortHandoffRatio({
          matched: evidence.matchedStudentCount,
          total: evidence.totalStudentCount,
        }),
      });
    case 'copy-scope-row-count':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_copy_rows_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_copy_rows_label(),
        value: formatStudentSummarySortHandoffNumber(
          evidence.copyScopeRowCount
        ),
      });
    case 'follow-up-priority-tiebreak':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_follow_up_tiebreak_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_follow_up_tiebreak_label(),
        value:
          m.assignment_student_summary_sort_handoff_follow_up_tiebreak_value(),
      });
    case 'best-score-tiebreak':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_best_score_tiebreak_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_best_score_tiebreak_label(),
        value:
          m.assignment_student_summary_sort_handoff_best_score_tiebreak_value(),
      });
    case 'attempt-count-tiebreak':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_attempt_count_tiebreak_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_attempt_count_tiebreak_label(),
        value:
          m.assignment_student_summary_sort_handoff_attempt_count_tiebreak_value(),
      });
    case 'last-submitted-tiebreak':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_last_submitted_tiebreak_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_last_submitted_tiebreak_label(),
        value:
          m.assignment_student_summary_sort_handoff_last_submitted_tiebreak_value(),
      });
    case 'display-label-tiebreak':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_display_label_tiebreak_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_display_label_tiebreak_label(),
        value:
          m.assignment_student_summary_sort_handoff_display_label_tiebreak_value(),
      });
    case 'missing-date-guard':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_missing_date_guard_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_missing_date_guard_label(),
        value: '0',
      });
    case 'nonfinite-count-guard':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_nonfinite_count_guard_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_nonfinite_count_guard_label(),
        value: '0',
      });
    case 'table-consumer':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_table_consumer_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_table_consumer_label(),
        value: m.assignment_student_summary_sort_handoff_table_consumer_value(),
      });
    case 'review-scope-consumer':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_review_scope_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_review_scope_label(),
        value: m.assignment_student_summary_sort_handoff_review_scope_value(),
      });
    case 'copy-artifact-consumer':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_copy_artifact_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_copy_artifact_label(),
        value: m.assignment_student_summary_sort_handoff_copy_artifact_value(),
      });
    case 'anonymous-label-guard':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_anonymous_label_guard_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_anonymous_label_guard_label(),
        value: m.assignment_student_summary_sort_handoff_hidden_value(),
      });
    case 'student-answer-guard':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_student_answer_guard_description(),
        id,
        label:
          m.assignment_student_summary_sort_handoff_student_answer_guard_label(),
        value: m.assignment_student_summary_sort_handoff_hidden_value(),
      });
    case 'privacy-guard':
      return buildAssignmentStudentSummarySortHandoffOutput({
        description:
          m.assignment_student_summary_sort_handoff_privacy_description(),
        id,
        label: m.assignment_student_summary_sort_handoff_privacy_label(),
        value: m.assignment_student_summary_sort_handoff_hidden_value(),
      });
  }
}

function buildAssignmentStudentSummarySortHandoffOutput({
  description,
  id,
  label,
  statusLabel,
  value,
}: Omit<AssignmentStudentSummarySortHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: statusLabel
      ? m.assignment_student_summary_sort_handoff_item_status_aria_label({
          description,
          label,
          status: statusLabel,
          value,
        })
      : m.assignment_student_summary_sort_handoff_item_aria_label({
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

function buildAssignmentStudentSummarySortHandoffPrivacyContract(
  itemViews: AssignmentStudentSummarySortHandoffItemView[]
): AssignmentStudentSummarySortHandoffPrivacyContract {
  return {
    exposesCopyArtifactText: false,
    exposesRawAnonymousToken: false,
    exposesRawRouteQuery: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesStudentKeys: false,
    exposesTeacherAnswerKey: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesResultData: false,
    scope: 'teacher-result-student-summary-sort',
    usesAssignmentDomainHelpers: true,
    usesSortedTableRows: true,
  };
}

function formatStudentSummarySortAvailability(isActive: boolean) {
  return isActive
    ? m.assignment_student_summary_sort_handoff_active_value()
    : m.assignment_student_summary_sort_handoff_available_value();
}

function formatStudentSummarySortDefaultValue(sort: StudentSummarySort) {
  return sort === DEFAULT_STUDENT_SUMMARY_SORT
    ? m.assignment_student_summary_sort_handoff_default_kept_value()
    : m.assignment_student_summary_sort_handoff_default_persisted_value();
}

function formatStudentSummarySortHandoffRatio({
  matched,
  total,
}: {
  matched: number;
  total: number;
}) {
  return m.assignment_student_summary_sort_handoff_count_ratio({
    matched: formatStudentSummarySortHandoffNumber(matched),
    total: formatStudentSummarySortHandoffNumber(total),
  });
}

function formatStudentSummarySortHandoffNumber(value: number) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

function normalizeStudentSummarySortHandoffCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
