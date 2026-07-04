import type {
  AssignmentResultCopyArtifactPreview,
  AssignmentResultCopyArtifacts,
} from '@/assignments/result-actions';
import { countAssignmentResultCopyLines } from '@/assignments/result-copy-format';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS = [
  'artifact-scope',
  'classroom-brief-artifact',
  'reteach-plan-artifact',
  'item-review-artifact',
  'student-follow-up-artifact',
  'copy-preview-count',
  'copy-line-format',
  'copy-title-normalization',
  'copy-scope-appended',
  'copy-scope-summary',
  'classroom-stat-metrics',
  'classroom-scope-metrics',
  'brief-focus-items',
  'brief-follow-up-students',
  'reteach-review-items',
  'reteach-priority-students',
  'item-review-items',
  'item-review-answer-coverage',
  'follow-up-students',
  'follow-up-review-needed',
  'latest-attempt-details',
  'last-submitted-context',
  'attempt-duration-context',
  'priority-item-ordering',
  'student-follow-up-ordering',
  'current-review-data-scope',
  'artifact-preview-scope',
  'prompt-text-guard',
  'answer-text-guard',
  'privacy-guard',
] as const;

export type AssignmentCopyArtifactHandoffItemId =
  (typeof ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS)[number];

export type AssignmentCopyArtifactHandoffInput = {
  artifacts: AssignmentResultCopyArtifacts;
  previews: AssignmentResultCopyArtifactPreview[];
};

export type AssignmentCopyArtifactHandoffEvidence = {
  artifactPreviewCount: number;
  artifactPreviewScopeReady: boolean;
  artifactTextsUseNormalizedLines: boolean;
  artifactTitlesNormalized: boolean;
  briefFocusItemCount: number;
  briefFollowUpStudentCount: number;
  classroomBriefReady: boolean;
  classroomScopeMetricCount: number;
  classroomStatMetricCount: number;
  copyScopeAppendedToArtifacts: boolean;
  copyScopeSummaryCount: number;
  currentReviewDataScopeReady: boolean;
  followUpReviewNeededStudentCount: number;
  followUpStudentCount: number;
  itemReviewAnswerCoverageCount: number;
  itemReviewItemCount: number;
  latestAttemptDetailCount: number;
  lastSubmittedContextCount: number;
  priorityItemOrderingReady: boolean;
  promptTextHiddenFromHandoff: boolean;
  reteachPlanReady: boolean;
  reteachPriorityStudentCount: number;
  reteachReviewItemCount: number;
  studentFollowUpOrderingReady: boolean;
  studentFollowUpReady: boolean;
  studentLatestDurationCount: number;
  itemReviewReady: boolean;
  totalCopyLineCount: number;
};

export type AssignmentCopyArtifactHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentCopyArtifactHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentCopyArtifactHandoffPrivacyContract = {
  exposesAcceptedAnswerText: false;
  exposesArtifactText: false;
  exposesExpectedAnswerText: false;
  exposesPromptText: false;
  exposesRawAnonymousToken: false;
  exposesStudentAnswerText: false;
  exposesStudentLabels: false;
  exposesTeacherNotesText: false;
  itemIds: AssignmentCopyArtifactHandoffItemId[];
  mutatesResultArtifacts: false;
  scope: 'teacher-result-copy-artifacts';
  usesSharedCopyArtifactHelpers: true;
};

export type AssignmentCopyArtifactHandoffView = {
  description: string;
  itemViews: AssignmentCopyArtifactHandoffItemView[];
  privacy: AssignmentCopyArtifactHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentCopyArtifactHandoffView(
  input: AssignmentCopyArtifactHandoffInput
): AssignmentCopyArtifactHandoffView {
  const evidence = buildAssignmentCopyArtifactHandoffEvidence(input);
  const itemViews = ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentCopyArtifactHandoffItemView(
      buildAssignmentCopyArtifactHandoffItem({ evidence, id })
    )
  );

  return {
    description: m.assignment_copy_artifact_handoff_description(),
    itemViews,
    privacy: buildAssignmentCopyArtifactHandoffPrivacyContract(itemViews),
    title: m.assignment_copy_artifact_handoff_title(),
  };
}

export function buildAssignmentCopyArtifactHandoffEvidence({
  artifacts,
  previews,
}: AssignmentCopyArtifactHandoffInput): AssignmentCopyArtifactHandoffEvidence {
  const artifactTexts = [
    artifacts.classroomBrief.text,
    artifacts.reteachPlan.text,
    artifacts.itemReviewSummary.text,
    artifacts.studentFollowUpSummary.text,
  ];
  const artifactTitles = [
    artifacts.reteachPlan.title,
    artifacts.itemReviewSummary.title,
    artifacts.studentFollowUpSummary.title,
  ];
  const firstPriorityItemId =
    artifacts.classroomBrief.focusItems[0]?.itemId ??
    artifacts.reteachPlan.reviewItems[0]?.itemId ??
    artifacts.itemReviewSummary.items[0]?.itemId ??
    null;
  const firstFollowUpStudentKey =
    artifacts.classroomBrief.followUpStudents[0]?.studentKey ??
    artifacts.reteachPlan.reviewStudents[0]?.studentKey ??
    artifacts.studentFollowUpSummary.students[0]?.studentKey ??
    null;

  return {
    artifactPreviewCount: previews.length,
    artifactPreviewScopeReady: previews.every(
      (preview) =>
        preview.copyScopeView.itemViews.length === 3 &&
        preview.copyScopeView.summaryItems.length > 0
    ),
    artifactTextsUseNormalizedLines: artifactTexts.every(
      (text) => !text.includes('\r') && countAssignmentResultCopyLines(text) > 0
    ),
    artifactTitlesNormalized: artifactTitles.every(
      (title) => title === title.normalize('NFKC').replace(/[ \t]+/gu, ' ')
    ),
    briefFocusItemCount: artifacts.classroomBrief.focusItems.length,
    briefFollowUpStudentCount: artifacts.classroomBrief.followUpStudents.length,
    classroomBriefReady:
      artifacts.classroomBrief.statViews.length > 0 &&
      artifacts.classroomBrief.text.length > 0,
    classroomScopeMetricCount: artifacts.classroomBrief.scopeViews.length,
    classroomStatMetricCount: artifacts.classroomBrief.statViews.length,
    copyScopeAppendedToArtifacts: artifactTexts.every((text) =>
      previews.some((preview) =>
        text.includes(preview.copyScopeView.description)
      )
    ),
    copyScopeSummaryCount: Math.max(
      0,
      ...previews.map((preview) => preview.copyScopeView.summaryItems.length)
    ),
    currentReviewDataScopeReady: previews.every(
      (preview) => preview.dataScope === 'current-review'
    ),
    followUpReviewNeededStudentCount:
      artifacts.studentFollowUpSummary.students.filter(
        (student) => student.needsReviewCount > 0
      ).length,
    followUpStudentCount: artifacts.studentFollowUpSummary.students.length,
    itemReviewAnswerCoverageCount: artifacts.itemReviewSummary.itemViews.filter(
      (itemView) =>
        itemView.expectedAnswerText ||
        itemView.acceptedAnswersText ||
        itemView.explanationText
    ).length,
    itemReviewItemCount: artifacts.itemReviewSummary.items.length,
    itemReviewReady:
      artifacts.itemReviewSummary.itemViews.length > 0 &&
      artifacts.itemReviewSummary.text.length > 0,
    lastSubmittedContextCount:
      artifacts.studentFollowUpSummary.studentViews.filter((studentView) =>
        Boolean(studentView.lastSubmittedLabel)
      ).length,
    latestAttemptDetailCount:
      artifacts.studentFollowUpSummary.studentViews.filter((studentView) =>
        Boolean(studentView.latestAttemptSummaryLabel)
      ).length,
    priorityItemOrderingReady:
      firstPriorityItemId != null &&
      artifacts.reteachPlan.reviewItems[0]?.itemId === firstPriorityItemId &&
      artifacts.itemReviewSummary.items[0]?.itemId === firstPriorityItemId,
    promptTextHiddenFromHandoff: true,
    reteachPlanReady:
      artifacts.reteachPlan.reviewHeading.length > 0 &&
      artifacts.reteachPlan.text.length > 0,
    reteachPriorityStudentCount: artifacts.reteachPlan.reviewStudents.length,
    reteachReviewItemCount: artifacts.reteachPlan.reviewItems.length,
    studentFollowUpOrderingReady:
      firstFollowUpStudentKey != null &&
      artifacts.reteachPlan.reviewStudents[0]?.studentKey ===
        firstFollowUpStudentKey &&
      artifacts.studentFollowUpSummary.students[0]?.studentKey ===
        firstFollowUpStudentKey,
    studentFollowUpReady:
      artifacts.studentFollowUpSummary.studentViews.length > 0 &&
      artifacts.studentFollowUpSummary.text.length > 0,
    studentLatestDurationCount:
      artifacts.studentFollowUpSummary.studentViews.filter((studentView) =>
        Boolean(studentView.latestAttemptDurationLabel)
      ).length,
    totalCopyLineCount: artifactTexts.reduce(
      (total, text) => total + countAssignmentResultCopyLines(text),
      0
    ),
  };
}

function buildAssignmentCopyArtifactHandoffItem({
  evidence,
  id,
}: {
  evidence: AssignmentCopyArtifactHandoffEvidence;
  id: AssignmentCopyArtifactHandoffItemId;
}): Omit<AssignmentCopyArtifactHandoffItemView, 'ariaLabel'> {
  switch (id) {
    case 'artifact-scope':
      return {
        description: m.assignment_copy_artifact_handoff_scope_description(),
        id,
        label: m.assignment_copy_artifact_handoff_scope_label(),
        value: m.assignment_copy_artifact_handoff_scope_value(),
      };
    case 'classroom-brief-artifact':
      return {
        description:
          m.assignment_copy_artifact_handoff_classroom_brief_description(),
        id,
        label: m.assignment_copy_artifact_handoff_classroom_brief_label(),
        value: formatReadyValue(
          evidence.classroomBriefReady,
          m.assignment_copy_artifact_handoff_classroom_brief_value()
        ),
      };
    case 'reteach-plan-artifact':
      return {
        description:
          m.assignment_copy_artifact_handoff_reteach_plan_description(),
        id,
        label: m.assignment_copy_artifact_handoff_reteach_plan_label(),
        value: formatReadyValue(
          evidence.reteachPlanReady,
          m.assignment_copy_artifact_handoff_reteach_plan_value()
        ),
      };
    case 'item-review-artifact':
      return {
        description:
          m.assignment_copy_artifact_handoff_item_review_description(),
        id,
        label: m.assignment_copy_artifact_handoff_item_review_label(),
        value: formatReadyValue(
          evidence.itemReviewReady,
          m.assignment_copy_artifact_handoff_item_review_value()
        ),
      };
    case 'student-follow-up-artifact':
      return {
        description:
          m.assignment_copy_artifact_handoff_student_follow_up_description(),
        id,
        label: m.assignment_copy_artifact_handoff_student_follow_up_label(),
        value: formatReadyValue(
          evidence.studentFollowUpReady,
          m.assignment_copy_artifact_handoff_student_follow_up_value()
        ),
      };
    case 'copy-preview-count':
      return {
        description:
          m.assignment_copy_artifact_handoff_preview_count_description(),
        id,
        label: m.assignment_copy_artifact_handoff_preview_count_label(),
        value: m.assignment_copy_artifact_handoff_previews_value({
          count: evidence.artifactPreviewCount,
        }),
      };
    case 'copy-line-format':
      return {
        description:
          m.assignment_copy_artifact_handoff_line_format_description(),
        id,
        label: m.assignment_copy_artifact_handoff_line_format_label(),
        value: formatReadyValue(
          evidence.artifactTextsUseNormalizedLines,
          m.assignment_copy_artifact_handoff_line_format_value({
            count: evidence.totalCopyLineCount,
          })
        ),
      };
    case 'copy-title-normalization':
      return {
        description:
          m.assignment_copy_artifact_handoff_title_normalization_description(),
        id,
        label: m.assignment_copy_artifact_handoff_title_normalization_label(),
        value: formatReadyValue(
          evidence.artifactTitlesNormalized,
          m.assignment_copy_artifact_handoff_title_normalization_value()
        ),
      };
    case 'copy-scope-appended':
      return {
        description:
          m.assignment_copy_artifact_handoff_scope_appended_description(),
        id,
        label: m.assignment_copy_artifact_handoff_scope_appended_label(),
        value: formatReadyValue(
          evidence.copyScopeAppendedToArtifacts,
          m.assignment_copy_artifact_handoff_scope_appended_value()
        ),
      };
    case 'copy-scope-summary':
      return {
        description:
          m.assignment_copy_artifact_handoff_scope_summary_description(),
        id,
        label: m.assignment_copy_artifact_handoff_scope_summary_label(),
        value: m.assignment_copy_artifact_handoff_scope_items_value({
          count: evidence.copyScopeSummaryCount,
        }),
      };
    case 'classroom-stat-metrics':
      return {
        description:
          m.assignment_copy_artifact_handoff_stat_metrics_description(),
        id,
        label: m.assignment_copy_artifact_handoff_stat_metrics_label(),
        value: m.assignment_copy_artifact_handoff_metrics_value({
          count: evidence.classroomStatMetricCount,
        }),
      };
    case 'classroom-scope-metrics':
      return {
        description:
          m.assignment_copy_artifact_handoff_scope_metrics_description(),
        id,
        label: m.assignment_copy_artifact_handoff_scope_metrics_label(),
        value: m.assignment_copy_artifact_handoff_scope_items_value({
          count: evidence.classroomScopeMetricCount,
        }),
      };
    case 'brief-focus-items':
      return {
        description:
          m.assignment_copy_artifact_handoff_brief_focus_description(),
        id,
        label: m.assignment_copy_artifact_handoff_brief_focus_label(),
        value: m.assignment_copy_artifact_handoff_focus_items_value({
          count: evidence.briefFocusItemCount,
        }),
      };
    case 'brief-follow-up-students':
      return {
        description:
          m.assignment_copy_artifact_handoff_brief_follow_up_description(),
        id,
        label: m.assignment_copy_artifact_handoff_brief_follow_up_label(),
        value: m.assignment_copy_artifact_handoff_students_value({
          count: evidence.briefFollowUpStudentCount,
        }),
      };
    case 'reteach-review-items':
      return {
        description:
          m.assignment_copy_artifact_handoff_reteach_items_description(),
        id,
        label: m.assignment_copy_artifact_handoff_reteach_items_label(),
        value: m.assignment_copy_artifact_handoff_review_items_value({
          count: evidence.reteachReviewItemCount,
        }),
      };
    case 'reteach-priority-students':
      return {
        description:
          m.assignment_copy_artifact_handoff_reteach_students_description(),
        id,
        label: m.assignment_copy_artifact_handoff_reteach_students_label(),
        value: m.assignment_copy_artifact_handoff_students_value({
          count: evidence.reteachPriorityStudentCount,
        }),
      };
    case 'item-review-items':
      return {
        description:
          m.assignment_copy_artifact_handoff_item_review_items_description(),
        id,
        label: m.assignment_copy_artifact_handoff_item_review_items_label(),
        value: m.assignment_copy_artifact_handoff_items_value({
          count: evidence.itemReviewItemCount,
        }),
      };
    case 'item-review-answer-coverage':
      return {
        description:
          m.assignment_copy_artifact_handoff_answer_coverage_description(),
        id,
        label: m.assignment_copy_artifact_handoff_answer_coverage_label(),
        value: m.assignment_copy_artifact_handoff_answer_fields_value({
          count: evidence.itemReviewAnswerCoverageCount,
        }),
      };
    case 'follow-up-students':
      return {
        description:
          m.assignment_copy_artifact_handoff_follow_up_students_description(),
        id,
        label: m.assignment_copy_artifact_handoff_follow_up_students_label(),
        value: m.assignment_copy_artifact_handoff_students_value({
          count: evidence.followUpStudentCount,
        }),
      };
    case 'follow-up-review-needed':
      return {
        description:
          m.assignment_copy_artifact_handoff_review_needed_description(),
        id,
        label: m.assignment_copy_artifact_handoff_review_needed_label(),
        value: m.assignment_copy_artifact_handoff_students_value({
          count: evidence.followUpReviewNeededStudentCount,
        }),
      };
    case 'latest-attempt-details':
      return {
        description:
          m.assignment_copy_artifact_handoff_latest_attempt_description(),
        id,
        label: m.assignment_copy_artifact_handoff_latest_attempt_label(),
        value: m.assignment_copy_artifact_handoff_students_value({
          count: evidence.latestAttemptDetailCount,
        }),
      };
    case 'last-submitted-context':
      return {
        description:
          m.assignment_copy_artifact_handoff_last_submitted_description(),
        id,
        label: m.assignment_copy_artifact_handoff_last_submitted_label(),
        value: m.assignment_copy_artifact_handoff_students_value({
          count: evidence.lastSubmittedContextCount,
        }),
      };
    case 'attempt-duration-context':
      return {
        description:
          m.assignment_copy_artifact_handoff_duration_context_description(),
        id,
        label: m.assignment_copy_artifact_handoff_duration_context_label(),
        value: m.assignment_copy_artifact_handoff_students_value({
          count: evidence.studentLatestDurationCount,
        }),
      };
    case 'priority-item-ordering':
      return {
        description:
          m.assignment_copy_artifact_handoff_priority_order_description(),
        id,
        label: m.assignment_copy_artifact_handoff_priority_order_label(),
        value: formatReadyValue(
          evidence.priorityItemOrderingReady,
          m.assignment_copy_artifact_handoff_priority_order_value()
        ),
      };
    case 'student-follow-up-ordering':
      return {
        description:
          m.assignment_copy_artifact_handoff_student_order_description(),
        id,
        label: m.assignment_copy_artifact_handoff_student_order_label(),
        value: formatReadyValue(
          evidence.studentFollowUpOrderingReady,
          m.assignment_copy_artifact_handoff_student_order_value()
        ),
      };
    case 'current-review-data-scope':
      return {
        description:
          m.assignment_copy_artifact_handoff_data_scope_description(),
        id,
        label: m.assignment_copy_artifact_handoff_data_scope_label(),
        value: formatReadyValue(
          evidence.currentReviewDataScopeReady,
          m.assignment_copy_artifact_handoff_data_scope_value()
        ),
      };
    case 'artifact-preview-scope':
      return {
        description:
          m.assignment_copy_artifact_handoff_preview_scope_description(),
        id,
        label: m.assignment_copy_artifact_handoff_preview_scope_label(),
        value: formatReadyValue(
          evidence.artifactPreviewScopeReady,
          m.assignment_copy_artifact_handoff_scoped_previews_value({
            count: evidence.artifactPreviewCount,
          })
        ),
      };
    case 'prompt-text-guard':
      return {
        description:
          m.assignment_copy_artifact_handoff_prompt_guard_description(),
        id,
        label: m.assignment_copy_artifact_handoff_prompt_guard_label(),
        value: formatReadyValue(
          evidence.promptTextHiddenFromHandoff,
          m.assignment_copy_artifact_handoff_prompt_guard_value()
        ),
      };
    case 'answer-text-guard':
      return {
        description:
          m.assignment_copy_artifact_handoff_answer_guard_description(),
        id,
        label: m.assignment_copy_artifact_handoff_answer_guard_label(),
        value: m.assignment_copy_artifact_handoff_answer_guard_value(),
      };
    case 'privacy-guard':
      return {
        description:
          m.assignment_copy_artifact_handoff_privacy_guard_description(),
        id,
        label: m.assignment_copy_artifact_handoff_privacy_guard_label(),
        value: m.assignment_copy_artifact_handoff_privacy_guard_value(),
      };
  }
}

function buildAssignmentCopyArtifactHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<
  AssignmentCopyArtifactHandoffItemView,
  'ariaLabel'
>): AssignmentCopyArtifactHandoffItemView {
  return {
    ariaLabel: m.assignment_copy_artifact_handoff_item_aria_label({
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

function buildAssignmentCopyArtifactHandoffPrivacyContract(
  itemViews: AssignmentCopyArtifactHandoffItemView[]
): AssignmentCopyArtifactHandoffPrivacyContract {
  return {
    exposesAcceptedAnswerText: false,
    exposesArtifactText: false,
    exposesExpectedAnswerText: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentLabels: false,
    exposesTeacherNotesText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesResultArtifacts: false,
    scope: 'teacher-result-copy-artifacts',
    usesSharedCopyArtifactHelpers: true,
  };
}

function formatReadyValue(isReady: boolean, value: string) {
  return isReady
    ? value
    : m.assignment_copy_artifact_handoff_needs_review_value();
}
