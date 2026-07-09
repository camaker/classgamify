import type { AssignmentStudentSummary } from '@/assignments/results';
import { compareRuntimeDisplaySearchText } from '@/assignments/runtime-display';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS = [
  'priority-source',
  'input-students',
  'eligible-students',
  'selected-students',
  'selection-limit',
  'needs-review-filter',
  'needs-review-sort',
  'accuracy-tie-breaker',
  'display-label-tie-breaker',
  'positive-review-gate',
  'classroom-brief-scope',
  'reteach-plan-scope',
  'follow-up-summary-scope',
  'student-summary-sort',
  'copy-artifact-order',
  'latest-attempt-context',
  'last-submitted-context',
  'attempt-count-context',
  'average-accuracy-context',
  'best-accuracy-context',
  'latest-accuracy-context',
  'review-count-context',
  'recommendation-policy',
  'empty-state',
  'limit-normalization',
  'count-normalization',
  'domain-helper',
  'result-view-consumer',
  'anonymous-token-guard',
  'privacy-guard',
] as const;

export type AssignmentStudentFollowUpPriorityHandoffItemId =
  (typeof ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS)[number];

export type AssignmentStudentFollowUpPrioritySurface =
  | 'classroom-brief'
  | 'result-view'
  | 'reteach-plan'
  | 'student-follow-up-summary';

export type AssignmentStudentFollowUpPriorityHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentStudentFollowUpPriorityHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentStudentFollowUpPriorityHandoffPrivacyContract = {
  exposesRawAnonymousToken: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabels: false;
  exposesStudentKeys: false;
  exposesTeacherAnswerKey: false;
  itemIds: AssignmentStudentFollowUpPriorityHandoffItemId[];
  mutatesResultData: false;
  scope: 'teacher-student-follow-up-priority';
  usesSharedPriorityHelper: true;
};

export type AssignmentStudentFollowUpPriorityHandoffEvidence = {
  eligibleStudentCount: number;
  inputStudentCount: number;
  limit: number | undefined;
  selectedStudentCount: number;
  selectedStudentsHaveReviewNeeds: boolean;
  surface: AssignmentStudentFollowUpPrioritySurface;
};

export type AssignmentStudentFollowUpPriorityHandoffView = {
  description: string;
  itemViews: AssignmentStudentFollowUpPriorityHandoffItemView[];
  privacy: AssignmentStudentFollowUpPriorityHandoffPrivacyContract;
  title: string;
};

export function compareAssignmentStudentsByFollowUpPriority(
  left: AssignmentStudentSummary,
  right: AssignmentStudentSummary
) {
  const leftNeedsReviewCount = normalizeFollowUpPriorityCount(
    left.needsReviewCount
  );
  const rightNeedsReviewCount = normalizeFollowUpPriorityCount(
    right.needsReviewCount
  );
  if (leftNeedsReviewCount !== rightNeedsReviewCount) {
    return rightNeedsReviewCount - leftNeedsReviewCount;
  }

  const leftLatestAccuracy = normalizeFollowUpPriorityNumber(
    left.latestAccuracy
  );
  const rightLatestAccuracy = normalizeFollowUpPriorityNumber(
    right.latestAccuracy
  );
  if (leftLatestAccuracy !== rightLatestAccuracy) {
    return leftLatestAccuracy - rightLatestAccuracy;
  }

  return compareAssignmentStudentsByDisplayLabel(left, right);
}

export function compareAssignmentStudentsByDisplayLabel(
  left: Pick<AssignmentStudentSummary, 'studentLabel'>,
  right: Pick<AssignmentStudentSummary, 'studentLabel'>
) {
  return compareRuntimeDisplaySearchText(left.studentLabel, right.studentLabel);
}

export function sortAssignmentStudentsByFollowUpPriority(
  students: AssignmentStudentSummary[]
) {
  return [...students].sort(compareAssignmentStudentsByFollowUpPriority);
}

export function getAssignmentStudentFollowUpPriorityStudents(
  students: AssignmentStudentSummary[],
  options?: {
    limit?: number;
  }
) {
  const sortedStudents = sortAssignmentStudentsByFollowUpPriority(
    students.filter(
      (student) => normalizeFollowUpPriorityCount(student.needsReviewCount) > 0
    )
  );
  const limit =
    options?.limit === undefined
      ? undefined
      : normalizeFollowUpPriorityCount(options.limit);

  return limit === undefined ? sortedStudents : sortedStudents.slice(0, limit);
}

export function buildAssignmentStudentFollowUpPriorityHandoffView({
  limit,
  selectedStudents,
  students,
  surface = 'result-view',
}: {
  limit?: number;
  selectedStudents?: AssignmentStudentSummary[];
  students: AssignmentStudentSummary[];
  surface?: AssignmentStudentFollowUpPrioritySurface;
}): AssignmentStudentFollowUpPriorityHandoffView {
  const evidence = buildAssignmentStudentFollowUpPriorityHandoffEvidence({
    limit,
    selectedStudents,
    students,
    surface,
  });
  const itemViews = ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS.map(
    (id) => buildAssignmentStudentFollowUpPriorityHandoffItemView(id, evidence)
  );

  return {
    description: m.assignment_student_follow_up_priority_handoff_description(),
    itemViews,
    privacy: {
      exposesRawAnonymousToken: false,
      exposesStudentAnswerText: false,
      exposesStudentDisplayLabels: false,
      exposesStudentKeys: false,
      exposesTeacherAnswerKey: false,
      itemIds: [...ASSIGNMENT_STUDENT_FOLLOW_UP_PRIORITY_HANDOFF_ITEM_IDS],
      mutatesResultData: false,
      scope: 'teacher-student-follow-up-priority',
      usesSharedPriorityHelper: true,
    },
    title: m.assignment_student_follow_up_priority_handoff_title(),
  };
}

function buildAssignmentStudentFollowUpPriorityHandoffEvidence({
  limit,
  selectedStudents,
  students,
  surface = 'result-view',
}: {
  limit?: number;
  selectedStudents?: AssignmentStudentSummary[];
  students: AssignmentStudentSummary[];
  surface?: AssignmentStudentFollowUpPrioritySurface;
}): AssignmentStudentFollowUpPriorityHandoffEvidence {
  const normalizedLimit =
    limit === undefined ? undefined : normalizeFollowUpPriorityCount(limit);
  const eligibleStudents = students.filter(
    (student) => normalizeFollowUpPriorityCount(student.needsReviewCount) > 0
  );
  const prioritizedStudents =
    selectedStudents ??
    getAssignmentStudentFollowUpPriorityStudents(students, {
      limit: normalizedLimit,
    });

  return {
    eligibleStudentCount: normalizeFollowUpPriorityCount(
      eligibleStudents.length
    ),
    inputStudentCount: normalizeFollowUpPriorityCount(students.length),
    limit: normalizedLimit,
    selectedStudentCount: normalizeFollowUpPriorityCount(
      prioritizedStudents.length
    ),
    selectedStudentsHaveReviewNeeds:
      prioritizedStudents.length > 0 &&
      prioritizedStudents.every(
        (student) =>
          normalizeFollowUpPriorityCount(student.needsReviewCount) > 0
      ),
    surface,
  };
}

function buildAssignmentStudentFollowUpPriorityHandoffItemView(
  id: AssignmentStudentFollowUpPriorityHandoffItemId,
  evidence: AssignmentStudentFollowUpPriorityHandoffEvidence
): AssignmentStudentFollowUpPriorityHandoffItemView {
  const label = getAssignmentStudentFollowUpPriorityHandoffLabel(id);
  const description =
    getAssignmentStudentFollowUpPriorityHandoffDescription(id);
  const value = getAssignmentStudentFollowUpPriorityHandoffValue(id, evidence);

  return {
    ariaLabel: m.assignment_student_follow_up_priority_handoff_item_aria({
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

function getAssignmentStudentFollowUpPriorityHandoffValue(
  id: AssignmentStudentFollowUpPriorityHandoffItemId,
  evidence: AssignmentStudentFollowUpPriorityHandoffEvidence
) {
  switch (id) {
    case 'priority-source':
      return 'student-follow-up-priority.ts';
    case 'input-students':
      return formatStudentFollowUpPriorityStudentCount(
        evidence.inputStudentCount
      );
    case 'eligible-students':
      return formatStudentFollowUpPriorityStudentCount(
        evidence.eligibleStudentCount
      );
    case 'selected-students':
      return formatStudentFollowUpPriorityStudentCount(
        evidence.selectedStudentCount
      );
    case 'selection-limit':
      return evidence.limit === undefined
        ? m.assignment_student_follow_up_priority_handoff_limit_none_value()
        : formatStudentFollowUpPriorityStudentCount(evidence.limit);
    case 'needs-review-filter':
      return evidence.eligibleStudentCount > 0
        ? m.assignment_student_follow_up_priority_handoff_needs_review_filter_value()
        : m.assignment_student_follow_up_priority_handoff_no_review_needs_value();
    case 'needs-review-sort':
      return m.assignment_student_follow_up_priority_handoff_needs_review_sort_value();
    case 'accuracy-tie-breaker':
      return m.assignment_student_follow_up_priority_handoff_accuracy_tie_breaker_value();
    case 'display-label-tie-breaker':
      return m.assignment_student_follow_up_priority_handoff_display_label_tie_breaker_value();
    case 'positive-review-gate':
      return evidence.selectedStudentsHaveReviewNeeds
        ? m.assignment_student_follow_up_priority_handoff_ready_value()
        : m.assignment_student_follow_up_priority_handoff_no_review_needs_value();
    case 'classroom-brief-scope':
      return m.assignment_student_follow_up_priority_handoff_classroom_brief_scope_value();
    case 'reteach-plan-scope':
      return m.assignment_student_follow_up_priority_handoff_reteach_plan_scope_value();
    case 'follow-up-summary-scope':
      return m.assignment_student_follow_up_priority_handoff_follow_up_summary_scope_value();
    case 'student-summary-sort':
      return m.assignment_student_follow_up_priority_handoff_student_summary_sort_value();
    case 'copy-artifact-order':
      return m.assignment_student_follow_up_priority_handoff_copy_artifact_order_value();
    case 'latest-attempt-context':
      return m.assignment_student_follow_up_priority_handoff_latest_attempt_context_value();
    case 'last-submitted-context':
      return m.assignment_student_follow_up_priority_handoff_last_submitted_context_value();
    case 'attempt-count-context':
      return m.assignment_student_follow_up_priority_handoff_attempt_count_context_value();
    case 'average-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_average_accuracy_context_value();
    case 'best-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_best_accuracy_context_value();
    case 'latest-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_latest_accuracy_context_value();
    case 'review-count-context':
      return m.assignment_student_follow_up_priority_handoff_review_count_context_value();
    case 'recommendation-policy':
      return m.assignment_student_follow_up_priority_handoff_recommendation_policy_value();
    case 'empty-state':
      if (evidence.inputStudentCount <= 0) {
        return m.assignment_student_follow_up_priority_handoff_empty_students_value();
      }

      return evidence.selectedStudentCount > 0
        ? m.assignment_student_follow_up_priority_handoff_follow_up_ready_value()
        : m.assignment_student_follow_up_priority_handoff_no_review_needs_value();
    case 'limit-normalization':
      return m.assignment_student_follow_up_priority_handoff_limit_normalization_value();
    case 'count-normalization':
      return m.assignment_student_follow_up_priority_handoff_count_normalization_value();
    case 'domain-helper':
      return 'getAssignmentStudentFollowUpPriorityStudents';
    case 'result-view-consumer':
      return getAssignmentStudentFollowUpPrioritySurfaceValue(evidence.surface);
    case 'anonymous-token-guard':
      return m.assignment_student_follow_up_priority_handoff_anonymous_token_guard_value();
    case 'privacy-guard':
      return m.assignment_student_follow_up_priority_handoff_privacy_guard_value();
    default: {
      const exhaustiveId: never = id;
      return exhaustiveId;
    }
  }
}

function getAssignmentStudentFollowUpPrioritySurfaceValue(
  surface: AssignmentStudentFollowUpPrioritySurface
) {
  switch (surface) {
    case 'classroom-brief':
      return m.assignment_student_follow_up_priority_handoff_surface_classroom_brief_value();
    case 'reteach-plan':
      return m.assignment_student_follow_up_priority_handoff_surface_reteach_plan_value();
    case 'student-follow-up-summary':
      return m.assignment_student_follow_up_priority_handoff_surface_follow_up_summary_value();
    case 'result-view':
      return m.assignment_student_follow_up_priority_handoff_surface_result_view_value();
    default: {
      const exhaustiveSurface: never = surface;
      return exhaustiveSurface;
    }
  }
}

function getAssignmentStudentFollowUpPriorityHandoffLabel(
  id: AssignmentStudentFollowUpPriorityHandoffItemId
) {
  switch (id) {
    case 'priority-source':
      return m.assignment_student_follow_up_priority_handoff_priority_source_label();
    case 'input-students':
      return m.assignment_student_follow_up_priority_handoff_input_students_label();
    case 'eligible-students':
      return m.assignment_student_follow_up_priority_handoff_eligible_students_label();
    case 'selected-students':
      return m.assignment_student_follow_up_priority_handoff_selected_students_label();
    case 'selection-limit':
      return m.assignment_student_follow_up_priority_handoff_selection_limit_label();
    case 'needs-review-filter':
      return m.assignment_student_follow_up_priority_handoff_needs_review_filter_label();
    case 'needs-review-sort':
      return m.assignment_student_follow_up_priority_handoff_needs_review_sort_label();
    case 'accuracy-tie-breaker':
      return m.assignment_student_follow_up_priority_handoff_accuracy_tie_breaker_label();
    case 'display-label-tie-breaker':
      return m.assignment_student_follow_up_priority_handoff_display_label_tie_breaker_label();
    case 'positive-review-gate':
      return m.assignment_student_follow_up_priority_handoff_positive_review_gate_label();
    case 'classroom-brief-scope':
      return m.assignment_student_follow_up_priority_handoff_classroom_brief_scope_label();
    case 'reteach-plan-scope':
      return m.assignment_student_follow_up_priority_handoff_reteach_plan_scope_label();
    case 'follow-up-summary-scope':
      return m.assignment_student_follow_up_priority_handoff_follow_up_summary_scope_label();
    case 'student-summary-sort':
      return m.assignment_student_follow_up_priority_handoff_student_summary_sort_label();
    case 'copy-artifact-order':
      return m.assignment_student_follow_up_priority_handoff_copy_artifact_order_label();
    case 'latest-attempt-context':
      return m.assignment_student_follow_up_priority_handoff_latest_attempt_context_label();
    case 'last-submitted-context':
      return m.assignment_student_follow_up_priority_handoff_last_submitted_context_label();
    case 'attempt-count-context':
      return m.assignment_student_follow_up_priority_handoff_attempt_count_context_label();
    case 'average-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_average_accuracy_context_label();
    case 'best-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_best_accuracy_context_label();
    case 'latest-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_latest_accuracy_context_label();
    case 'review-count-context':
      return m.assignment_student_follow_up_priority_handoff_review_count_context_label();
    case 'recommendation-policy':
      return m.assignment_student_follow_up_priority_handoff_recommendation_policy_label();
    case 'empty-state':
      return m.assignment_student_follow_up_priority_handoff_empty_state_label();
    case 'limit-normalization':
      return m.assignment_student_follow_up_priority_handoff_limit_normalization_label();
    case 'count-normalization':
      return m.assignment_student_follow_up_priority_handoff_count_normalization_label();
    case 'domain-helper':
      return m.assignment_student_follow_up_priority_handoff_domain_helper_label();
    case 'result-view-consumer':
      return m.assignment_student_follow_up_priority_handoff_result_view_consumer_label();
    case 'anonymous-token-guard':
      return m.assignment_student_follow_up_priority_handoff_anonymous_token_guard_label();
    case 'privacy-guard':
      return m.assignment_student_follow_up_priority_handoff_privacy_guard_label();
    default: {
      const exhaustiveId: never = id;
      return exhaustiveId;
    }
  }
}

function getAssignmentStudentFollowUpPriorityHandoffDescription(
  id: AssignmentStudentFollowUpPriorityHandoffItemId
) {
  switch (id) {
    case 'priority-source':
      return m.assignment_student_follow_up_priority_handoff_priority_source_description();
    case 'input-students':
      return m.assignment_student_follow_up_priority_handoff_input_students_description();
    case 'eligible-students':
      return m.assignment_student_follow_up_priority_handoff_eligible_students_description();
    case 'selected-students':
      return m.assignment_student_follow_up_priority_handoff_selected_students_description();
    case 'selection-limit':
      return m.assignment_student_follow_up_priority_handoff_selection_limit_description();
    case 'needs-review-filter':
      return m.assignment_student_follow_up_priority_handoff_needs_review_filter_description();
    case 'needs-review-sort':
      return m.assignment_student_follow_up_priority_handoff_needs_review_sort_description();
    case 'accuracy-tie-breaker':
      return m.assignment_student_follow_up_priority_handoff_accuracy_tie_breaker_description();
    case 'display-label-tie-breaker':
      return m.assignment_student_follow_up_priority_handoff_display_label_tie_breaker_description();
    case 'positive-review-gate':
      return m.assignment_student_follow_up_priority_handoff_positive_review_gate_description();
    case 'classroom-brief-scope':
      return m.assignment_student_follow_up_priority_handoff_classroom_brief_scope_description();
    case 'reteach-plan-scope':
      return m.assignment_student_follow_up_priority_handoff_reteach_plan_scope_description();
    case 'follow-up-summary-scope':
      return m.assignment_student_follow_up_priority_handoff_follow_up_summary_scope_description();
    case 'student-summary-sort':
      return m.assignment_student_follow_up_priority_handoff_student_summary_sort_description();
    case 'copy-artifact-order':
      return m.assignment_student_follow_up_priority_handoff_copy_artifact_order_description();
    case 'latest-attempt-context':
      return m.assignment_student_follow_up_priority_handoff_latest_attempt_context_description();
    case 'last-submitted-context':
      return m.assignment_student_follow_up_priority_handoff_last_submitted_context_description();
    case 'attempt-count-context':
      return m.assignment_student_follow_up_priority_handoff_attempt_count_context_description();
    case 'average-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_average_accuracy_context_description();
    case 'best-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_best_accuracy_context_description();
    case 'latest-accuracy-context':
      return m.assignment_student_follow_up_priority_handoff_latest_accuracy_context_description();
    case 'review-count-context':
      return m.assignment_student_follow_up_priority_handoff_review_count_context_description();
    case 'recommendation-policy':
      return m.assignment_student_follow_up_priority_handoff_recommendation_policy_description();
    case 'empty-state':
      return m.assignment_student_follow_up_priority_handoff_empty_state_description();
    case 'limit-normalization':
      return m.assignment_student_follow_up_priority_handoff_limit_normalization_description();
    case 'count-normalization':
      return m.assignment_student_follow_up_priority_handoff_count_normalization_description();
    case 'domain-helper':
      return m.assignment_student_follow_up_priority_handoff_domain_helper_description();
    case 'result-view-consumer':
      return m.assignment_student_follow_up_priority_handoff_result_view_consumer_description();
    case 'anonymous-token-guard':
      return m.assignment_student_follow_up_priority_handoff_anonymous_token_guard_description();
    case 'privacy-guard':
      return m.assignment_student_follow_up_priority_handoff_privacy_guard_description();
    default: {
      const exhaustiveId: never = id;
      return exhaustiveId;
    }
  }
}

function formatStudentFollowUpPriorityStudentCount(count: number) {
  return m.assignment_student_follow_up_priority_handoff_student_count_value({
    count: formatAssignmentResultNumber(count, { min: 0 }),
  });
}

function normalizeFollowUpPriorityNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function normalizeFollowUpPriorityCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
