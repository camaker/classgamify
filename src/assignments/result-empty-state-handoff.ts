import type { AttemptReviewFilter } from '@/assignments/result-filters';
import { normalizeResultSearch } from '@/assignments/result-filters';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export type AssignmentResultEmptyStateSurface =
  | 'attempt-review'
  | 'attempt-rows'
  | 'student-summary';

export type AssignmentResultEmptyStateReason =
  | 'answer-review-search-no-matches'
  | 'attempt-search-no-matches'
  | 'needs-review-no-matches'
  | 'no-answer-reviews'
  | 'no-attempts'
  | 'no-student-summaries'
  | 'student-search-no-matches';

export const ASSIGNMENT_RESULT_EMPTY_STATE_HANDOFF_ITEM_IDS = [
  'empty-surface',
  'empty-reason',
  'visible-title',
  'visible-description',
  'student-summary-section',
  'attempt-table-section',
  'answer-review-section',
  'total-students',
  'total-attempts',
  'total-answer-reviews',
  'search-state',
  'search-normalization',
  'review-filter',
  'waiting-next-step',
  'no-match-next-step',
  'copy-brief-gate',
  'copy-reteach-gate',
  'copy-item-review-gate',
  'copy-follow-up-gate',
  'export-csv-gate',
  'review-status-boundary',
  'review-scope-boundary',
  'table-boundary',
  'copy-artifact-boundary',
  'csv-export-boundary',
  'printable-worksheet-boundary',
  'public-runner-boundary',
  'anonymous-token-guard',
  'student-answer-guard',
  'teacher-answer-guard',
] as const;

export type AssignmentResultEmptyStateHandoffItemId =
  (typeof ASSIGNMENT_RESULT_EMPTY_STATE_HANDOFF_ITEM_IDS)[number];

export type AssignmentResultEmptyStateHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentResultEmptyStateHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentResultEmptyStateHandoffPrivacyContract = {
  exposesPublicRunnerContent: false;
  exposesRawAnonymousToken: false;
  exposesRawSearchText: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabels: false;
  exposesTeacherAnswerKey: false;
  itemIds: AssignmentResultEmptyStateHandoffItemId[];
  mutatesResultData: false;
  scope: 'teacher-result-empty-state';
  usesResultDomainHelpers: true;
};

export type AssignmentResultEmptyStateHandoffView = {
  description: string;
  itemViews: AssignmentResultEmptyStateHandoffItemView[];
  privacy: AssignmentResultEmptyStateHandoffPrivacyContract;
  title: string;
};

export type AssignmentResultEmptyStateHandoffInput = {
  description: string;
  filter?: AttemptReviewFilter;
  reason: AssignmentResultEmptyStateReason;
  search: string;
  surface: AssignmentResultEmptyStateSurface;
  title: string;
  totalAttemptReviews?: number;
  totalAttempts?: number;
  totalStudents?: number;
};

export function buildAssignmentResultEmptyStateHandoffView(
  input: AssignmentResultEmptyStateHandoffInput
): AssignmentResultEmptyStateHandoffView {
  const normalizedInput =
    normalizeAssignmentResultEmptyStateHandoffInput(input);
  const itemViews = ASSIGNMENT_RESULT_EMPTY_STATE_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentResultEmptyStateHandoffItem({
      id,
      input: normalizedInput,
    })
  );

  return {
    description: m.assignment_result_empty_state_handoff_description(),
    itemViews,
    privacy: buildAssignmentResultEmptyStateHandoffPrivacyContract(itemViews),
    title: m.assignment_result_empty_state_handoff_title(),
  };
}

function normalizeAssignmentResultEmptyStateHandoffInput(
  input: AssignmentResultEmptyStateHandoffInput
) {
  return {
    ...input,
    hasSearch: Boolean(normalizeResultSearch(input.search)),
    totalAttemptReviews: normalizeAssignmentResultEmptyStateCount(
      input.totalAttemptReviews
    ),
    totalAttempts: normalizeAssignmentResultEmptyStateCount(
      input.totalAttempts
    ),
    totalStudents: normalizeAssignmentResultEmptyStateCount(
      input.totalStudents
    ),
  };
}

function buildAssignmentResultEmptyStateHandoffItem({
  id,
  input,
}: {
  id: AssignmentResultEmptyStateHandoffItemId;
  input: ReturnType<typeof normalizeAssignmentResultEmptyStateHandoffInput>;
}): AssignmentResultEmptyStateHandoffItemView {
  return {
    ariaLabel: m.assignment_result_empty_state_handoff_item_aria({
      description: getAssignmentResultEmptyStateHandoffDescription(id),
      label: getAssignmentResultEmptyStateHandoffLabel(id),
      value: getAssignmentResultEmptyStateHandoffValue({ id, input }),
    }),
    description: getAssignmentResultEmptyStateHandoffDescription(id),
    id,
    label: getAssignmentResultEmptyStateHandoffLabel(id),
    value: getAssignmentResultEmptyStateHandoffValue({ id, input }),
  };
}

function getAssignmentResultEmptyStateHandoffLabel(
  id: AssignmentResultEmptyStateHandoffItemId
) {
  switch (id) {
    case 'empty-surface':
      return m.assignment_result_empty_state_handoff_empty_surface_label();
    case 'empty-reason':
      return m.assignment_result_empty_state_handoff_empty_reason_label();
    case 'visible-title':
      return m.assignment_result_empty_state_handoff_visible_title_label();
    case 'visible-description':
      return m.assignment_result_empty_state_handoff_visible_description_label();
    case 'student-summary-section':
      return m.assignment_result_empty_state_handoff_student_summary_section_label();
    case 'attempt-table-section':
      return m.assignment_result_empty_state_handoff_attempt_table_section_label();
    case 'answer-review-section':
      return m.assignment_result_empty_state_handoff_answer_review_section_label();
    case 'total-students':
      return m.assignment_result_empty_state_handoff_total_students_label();
    case 'total-attempts':
      return m.assignment_result_empty_state_handoff_total_attempts_label();
    case 'total-answer-reviews':
      return m.assignment_result_empty_state_handoff_total_answer_reviews_label();
    case 'search-state':
      return m.assignment_result_empty_state_handoff_search_state_label();
    case 'search-normalization':
      return m.assignment_result_empty_state_handoff_search_normalization_label();
    case 'review-filter':
      return m.assignment_result_empty_state_handoff_review_filter_label();
    case 'waiting-next-step':
      return m.assignment_result_empty_state_handoff_waiting_next_step_label();
    case 'no-match-next-step':
      return m.assignment_result_empty_state_handoff_no_match_next_step_label();
    case 'copy-brief-gate':
      return m.assignment_result_empty_state_handoff_copy_brief_gate_label();
    case 'copy-reteach-gate':
      return m.assignment_result_empty_state_handoff_copy_reteach_gate_label();
    case 'copy-item-review-gate':
      return m.assignment_result_empty_state_handoff_copy_item_review_gate_label();
    case 'copy-follow-up-gate':
      return m.assignment_result_empty_state_handoff_copy_follow_up_gate_label();
    case 'export-csv-gate':
      return m.assignment_result_empty_state_handoff_export_csv_gate_label();
    case 'review-status-boundary':
      return m.assignment_result_empty_state_handoff_review_status_boundary_label();
    case 'review-scope-boundary':
      return m.assignment_result_empty_state_handoff_review_scope_boundary_label();
    case 'table-boundary':
      return m.assignment_result_empty_state_handoff_table_boundary_label();
    case 'copy-artifact-boundary':
      return m.assignment_result_empty_state_handoff_copy_artifact_boundary_label();
    case 'csv-export-boundary':
      return m.assignment_result_empty_state_handoff_csv_export_boundary_label();
    case 'printable-worksheet-boundary':
      return m.assignment_result_empty_state_handoff_printable_worksheet_boundary_label();
    case 'public-runner-boundary':
      return m.assignment_result_empty_state_handoff_public_runner_boundary_label();
    case 'anonymous-token-guard':
      return m.assignment_result_empty_state_handoff_anonymous_token_guard_label();
    case 'student-answer-guard':
      return m.assignment_result_empty_state_handoff_student_answer_guard_label();
    case 'teacher-answer-guard':
      return m.assignment_result_empty_state_handoff_teacher_answer_guard_label();
  }
}

function getAssignmentResultEmptyStateHandoffDescription(
  id: AssignmentResultEmptyStateHandoffItemId
) {
  switch (id) {
    case 'empty-surface':
      return m.assignment_result_empty_state_handoff_empty_surface_description();
    case 'empty-reason':
      return m.assignment_result_empty_state_handoff_empty_reason_description();
    case 'visible-title':
      return m.assignment_result_empty_state_handoff_visible_title_description();
    case 'visible-description':
      return m.assignment_result_empty_state_handoff_visible_description_description();
    case 'student-summary-section':
      return m.assignment_result_empty_state_handoff_student_summary_section_description();
    case 'attempt-table-section':
      return m.assignment_result_empty_state_handoff_attempt_table_section_description();
    case 'answer-review-section':
      return m.assignment_result_empty_state_handoff_answer_review_section_description();
    case 'total-students':
      return m.assignment_result_empty_state_handoff_total_students_description();
    case 'total-attempts':
      return m.assignment_result_empty_state_handoff_total_attempts_description();
    case 'total-answer-reviews':
      return m.assignment_result_empty_state_handoff_total_answer_reviews_description();
    case 'search-state':
      return m.assignment_result_empty_state_handoff_search_state_description();
    case 'search-normalization':
      return m.assignment_result_empty_state_handoff_search_normalization_description();
    case 'review-filter':
      return m.assignment_result_empty_state_handoff_review_filter_description();
    case 'waiting-next-step':
      return m.assignment_result_empty_state_handoff_waiting_next_step_description();
    case 'no-match-next-step':
      return m.assignment_result_empty_state_handoff_no_match_next_step_description();
    case 'copy-brief-gate':
      return m.assignment_result_empty_state_handoff_copy_brief_gate_description();
    case 'copy-reteach-gate':
      return m.assignment_result_empty_state_handoff_copy_reteach_gate_description();
    case 'copy-item-review-gate':
      return m.assignment_result_empty_state_handoff_copy_item_review_gate_description();
    case 'copy-follow-up-gate':
      return m.assignment_result_empty_state_handoff_copy_follow_up_gate_description();
    case 'export-csv-gate':
      return m.assignment_result_empty_state_handoff_export_csv_gate_description();
    case 'review-status-boundary':
      return m.assignment_result_empty_state_handoff_review_status_boundary_description();
    case 'review-scope-boundary':
      return m.assignment_result_empty_state_handoff_review_scope_boundary_description();
    case 'table-boundary':
      return m.assignment_result_empty_state_handoff_table_boundary_description();
    case 'copy-artifact-boundary':
      return m.assignment_result_empty_state_handoff_copy_artifact_boundary_description();
    case 'csv-export-boundary':
      return m.assignment_result_empty_state_handoff_csv_export_boundary_description();
    case 'printable-worksheet-boundary':
      return m.assignment_result_empty_state_handoff_printable_worksheet_boundary_description();
    case 'public-runner-boundary':
      return m.assignment_result_empty_state_handoff_public_runner_boundary_description();
    case 'anonymous-token-guard':
      return m.assignment_result_empty_state_handoff_anonymous_token_guard_description();
    case 'student-answer-guard':
      return m.assignment_result_empty_state_handoff_student_answer_guard_description();
    case 'teacher-answer-guard':
      return m.assignment_result_empty_state_handoff_teacher_answer_guard_description();
  }
}

function getAssignmentResultEmptyStateHandoffValue({
  id,
  input,
}: {
  id: AssignmentResultEmptyStateHandoffItemId;
  input: ReturnType<typeof normalizeAssignmentResultEmptyStateHandoffInput>;
}) {
  switch (id) {
    case 'empty-surface':
      return formatAssignmentResultEmptyStateSurface(input.surface);
    case 'empty-reason':
      return formatAssignmentResultEmptyStateReason(input.reason);
    case 'visible-title':
      return input.title;
    case 'visible-description':
      return input.description;
    case 'student-summary-section':
      return formatAssignmentResultEmptyStateSectionStatus(
        input.surface === 'student-summary'
      );
    case 'attempt-table-section':
      return formatAssignmentResultEmptyStateSectionStatus(
        input.surface === 'attempt-rows'
      );
    case 'answer-review-section':
      return formatAssignmentResultEmptyStateSectionStatus(
        input.surface === 'attempt-review'
      );
    case 'total-students':
      return formatAssignmentResultNumber(input.totalStudents, { min: 0 });
    case 'total-attempts':
      return formatAssignmentResultNumber(input.totalAttempts, { min: 0 });
    case 'total-answer-reviews':
      return formatAssignmentResultNumber(input.totalAttemptReviews, {
        min: 0,
      });
    case 'search-state':
      return input.hasSearch
        ? m.assignment_result_empty_state_handoff_adjusted_value()
        : m.assignment_result_empty_state_handoff_default_value();
    case 'search-normalization':
      return 'normalizeResultSearch';
    case 'review-filter':
      return formatAssignmentResultEmptyStateReviewFilter(input.filter);
    case 'waiting-next-step':
      return getAssignmentResultEmptyStateWaitingNextStep(input.reason);
    case 'no-match-next-step':
      return getAssignmentResultEmptyStateNoMatchNextStep(input.reason);
    case 'copy-brief-gate':
    case 'copy-reteach-gate':
    case 'copy-item-review-gate':
    case 'copy-follow-up-gate':
      return m.assignment_result_empty_state_handoff_current_review_action_value();
    case 'export-csv-gate':
      return m.assignment_result_empty_state_handoff_full_export_action_value();
    case 'review-status-boundary':
      return m.assignment_result_empty_state_handoff_review_status_boundary_value();
    case 'review-scope-boundary':
      return m.assignment_result_empty_state_handoff_review_scope_boundary_value();
    case 'table-boundary':
      return m.assignment_result_empty_state_handoff_table_boundary_value();
    case 'copy-artifact-boundary':
      return m.assignment_result_empty_state_handoff_copy_artifact_boundary_value();
    case 'csv-export-boundary':
      return m.assignment_result_empty_state_handoff_csv_export_boundary_value();
    case 'printable-worksheet-boundary':
      return m.assignment_result_empty_state_handoff_printable_worksheet_boundary_value();
    case 'public-runner-boundary':
      return m.assignment_result_empty_state_handoff_public_runner_boundary_value();
    case 'anonymous-token-guard':
    case 'student-answer-guard':
    case 'teacher-answer-guard':
      return m.assignment_result_empty_state_handoff_hidden_value();
  }
}

function formatAssignmentResultEmptyStateSurface(
  surface: AssignmentResultEmptyStateSurface
) {
  switch (surface) {
    case 'attempt-review':
      return m.assignment_result_empty_state_handoff_surface_attempt_review_value();
    case 'attempt-rows':
      return m.assignment_result_empty_state_handoff_surface_attempt_rows_value();
    case 'student-summary':
      return m.assignment_result_empty_state_handoff_surface_student_summary_value();
  }
}

function formatAssignmentResultEmptyStateReason(
  reason: AssignmentResultEmptyStateReason
) {
  switch (reason) {
    case 'answer-review-search-no-matches':
      return m.assignment_result_empty_state_handoff_reason_answer_review_search_value();
    case 'attempt-search-no-matches':
      return m.assignment_result_empty_state_handoff_reason_attempt_search_value();
    case 'needs-review-no-matches':
      return m.assignment_result_empty_state_handoff_reason_needs_review_value();
    case 'no-answer-reviews':
      return m.assignment_result_empty_state_handoff_reason_no_answer_reviews_value();
    case 'no-attempts':
      return m.assignment_result_empty_state_handoff_reason_no_attempts_value();
    case 'no-student-summaries':
      return m.assignment_result_empty_state_handoff_reason_no_students_value();
    case 'student-search-no-matches':
      return m.assignment_result_empty_state_handoff_reason_student_search_value();
  }
}

function formatAssignmentResultEmptyStateSectionStatus(isActive: boolean) {
  return isActive
    ? m.assignment_result_empty_state_handoff_active_section_value()
    : m.assignment_result_empty_state_handoff_covered_section_value();
}

function formatAssignmentResultEmptyStateReviewFilter(
  filter: AttemptReviewFilter | undefined
) {
  if (!filter) {
    return m.assignment_result_empty_state_handoff_filter_not_applied_value();
  }

  return filter === 'needs-review'
    ? m.assignment_result_filter_needs_review_only()
    : m.assignment_result_filter_all_answers();
}

function getAssignmentResultEmptyStateWaitingNextStep(
  reason: AssignmentResultEmptyStateReason
) {
  if (
    reason === 'no-attempts' ||
    reason === 'no-student-summaries' ||
    reason === 'no-answer-reviews'
  ) {
    return m.assignment_result_empty_state_handoff_next_step_share_link_value();
  }

  return m.assignment_result_empty_state_handoff_next_step_not_waiting_value();
}

function getAssignmentResultEmptyStateNoMatchNextStep(
  reason: AssignmentResultEmptyStateReason
) {
  if (
    reason === 'answer-review-search-no-matches' ||
    reason === 'attempt-search-no-matches' ||
    reason === 'student-search-no-matches'
  ) {
    return m.assignment_result_empty_state_handoff_next_step_clear_search_value();
  }

  if (reason === 'needs-review-no-matches') {
    return m.assignment_result_empty_state_handoff_next_step_all_submissions_value();
  }

  return m.assignment_result_empty_state_handoff_next_step_not_matched_value();
}

function normalizeAssignmentResultEmptyStateCount(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function buildAssignmentResultEmptyStateHandoffPrivacyContract(
  itemViews: AssignmentResultEmptyStateHandoffItemView[]
): AssignmentResultEmptyStateHandoffPrivacyContract {
  return {
    exposesPublicRunnerContent: false,
    exposesRawAnonymousToken: false,
    exposesRawSearchText: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabels: false,
    exposesTeacherAnswerKey: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesResultData: false,
    scope: 'teacher-result-empty-state',
    usesResultDomainHelpers: true,
  };
}
