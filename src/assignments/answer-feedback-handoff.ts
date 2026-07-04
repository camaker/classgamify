import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS = [
  'accepted-parser-count',
  'slash-separator',
  'semicolon-separator',
  'chinese-separator',
  'unique-normalization',
  'case-insensitive-match',
  'punctuation-match',
  'ampersand-match',
  'blank-answer-guard',
  'runtime-scoring-correct',
  'runtime-scoring-completed',
  'runtime-scoring-accuracy',
  'public-review-visible',
  'public-review-hidden',
  'public-accepted-alternatives',
  'public-explanations',
  'student-feedback-status',
  'student-feedback-details',
  'student-feedback-alternatives',
  'student-feedback-explanations',
  'teacher-analysis-items',
  'teacher-analysis-needs-review',
  'teacher-analysis-accepted-answers',
  'teacher-answer-expected',
  'teacher-answer-alternatives',
  'teacher-answer-status',
  'csv-answer-view',
  'csv-accepted-alternatives',
  'csv-explanation',
  'privacy-guard',
] as const;

export type AssignmentAnswerFeedbackHandoffItemId =
  (typeof ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS)[number];

export type AssignmentAnswerFeedbackHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAnswerFeedbackHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAnswerFeedbackHandoffEvidence = {
  acceptedAnswerCount: number;
  ampersandMatchCorrect: boolean;
  blankAnswerCorrect: boolean;
  caseInsensitiveMatchCorrect: boolean;
  chineseSeparatorCount: number;
  csvAcceptedAlternativesColumnReady: boolean;
  csvAnswerViewReady: boolean;
  csvExplanationColumnReady: boolean;
  punctuationMatchCorrect: boolean;
  publicAcceptedAlternativeCount: number;
  publicExplanationCount: number;
  publicHiddenReviewItemCount: number;
  publicHiddenReviewIsHiddenBySettings: boolean;
  publicVisibleReviewItemCount: number;
  runtimeAccuracy: number;
  runtimeCompletedItemCount: number;
  runtimeCorrectItemCount: number;
  runtimeTotalPoints: number;
  semicolonSeparatorCount: number;
  slashSeparatorCount: number;
  studentFeedbackAcceptedLineCount: number;
  studentFeedbackDetailLineCount: number;
  studentFeedbackExplanationLineCount: number;
  studentFeedbackStatus: string;
  teacherAcceptedAnswerCount: number;
  teacherAnswerAlternativesReady: boolean;
  teacherAnswerExpectedReady: boolean;
  teacherAnswerStatus: string;
  teacherAnalysisItemCount: number;
  teacherNeedsReviewCount: number;
  uniqueAcceptedAnswerCount: number;
};

export type AssignmentAnswerFeedbackHandoffPrivacyContract = {
  exposesAnonymousToken: false;
  exposesRawRuntimeItemIds: false;
  exposesRawStudentAnswerText: false;
  exposesStudentName: false;
  exposesTeacherOnlyAnswerText: false;
  exposesTeacherPromptText: false;
  itemIds: AssignmentAnswerFeedbackHandoffItemId[];
  mutatesAttempts: false;
  scope: 'assignment-answer-feedback-boundary';
  usesSharedAcceptedAnswerParser: true;
  usesSharedFeedbackViews: true;
};

export type AssignmentAnswerFeedbackHandoffView = {
  description: string;
  itemViews: AssignmentAnswerFeedbackHandoffItemView[];
  privacy: AssignmentAnswerFeedbackHandoffPrivacyContract;
  title: string;
};

type AssignmentAnswerFeedbackHandoffItemContext =
  AssignmentAnswerFeedbackHandoffEvidence & {
    id: AssignmentAnswerFeedbackHandoffItemId;
  };

export function buildAssignmentAnswerFeedbackHandoffView(
  evidence: AssignmentAnswerFeedbackHandoffEvidence
): AssignmentAnswerFeedbackHandoffView {
  const itemViews = ASSIGNMENT_ANSWER_FEEDBACK_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentAnswerFeedbackHandoffItemView({ ...evidence, id })
  );

  return {
    description: m.assignment_answer_feedback_handoff_description(),
    itemViews,
    privacy: buildAssignmentAnswerFeedbackHandoffPrivacyContract(itemViews),
    title: m.assignment_answer_feedback_handoff_title(),
  };
}

function buildAssignmentAnswerFeedbackHandoffItemView(
  context: AssignmentAnswerFeedbackHandoffItemContext
): AssignmentAnswerFeedbackHandoffItemView {
  const item = buildAssignmentAnswerFeedbackHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.assignment_answer_feedback_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildAssignmentAnswerFeedbackHandoffItem(
  context: AssignmentAnswerFeedbackHandoffItemContext
): Omit<AssignmentAnswerFeedbackHandoffItemView, 'ariaLabel'> {
  switch (context.id) {
    case 'accepted-parser-count':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_accepted_count_value({
          count: context.acceptedAnswerCount,
        }),
      });
    case 'slash-separator':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_option_count_value({
          count: context.slashSeparatorCount,
        }),
      });
    case 'semicolon-separator':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_option_count_value({
          count: context.semicolonSeparatorCount,
        }),
      });
    case 'chinese-separator':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_option_count_value({
          count: context.chineseSeparatorCount,
        }),
      });
    case 'unique-normalization':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_deduped_value({
          count: context.uniqueAcceptedAnswerCount,
        }),
      });
    case 'case-insensitive-match':
      return buildBooleanItem({
        context,
        ok: context.caseInsensitiveMatchCorrect,
      });
    case 'punctuation-match':
      return buildBooleanItem({
        context,
        ok: context.punctuationMatchCorrect,
      });
    case 'ampersand-match':
      return buildBooleanItem({
        context,
        ok: context.ampersandMatchCorrect,
      });
    case 'blank-answer-guard':
      return buildStaticItem({
        context,
        value: context.blankAnswerCorrect
          ? m.assignment_answer_feedback_handoff_needs_review_value()
          : m.assignment_answer_feedback_handoff_blocked_value(),
      });
    case 'runtime-scoring-correct':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_fraction_value({
          count: context.runtimeCorrectItemCount,
          total: context.runtimeTotalPoints,
        }),
      });
    case 'runtime-scoring-completed':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_fraction_value({
          count: context.runtimeCompletedItemCount,
          total: context.runtimeTotalPoints,
        }),
      });
    case 'runtime-scoring-accuracy':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_percent_value({
          value: context.runtimeAccuracy,
        }),
      });
    case 'public-review-visible':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_review_items_value({
          count: context.publicVisibleReviewItemCount,
        }),
      });
    case 'public-review-hidden':
      return buildStaticItem({
        context,
        value: context.publicHiddenReviewIsHiddenBySettings
          ? m.assignment_answer_feedback_handoff_hidden_value({
              count: context.publicHiddenReviewItemCount,
            })
          : m.assignment_answer_feedback_handoff_needs_review_value(),
      });
    case 'public-accepted-alternatives':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_alternatives_value({
          count: context.publicAcceptedAlternativeCount,
        }),
      });
    case 'public-explanations':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_explanations_value({
          count: context.publicExplanationCount,
        }),
      });
    case 'student-feedback-status':
      return buildStaticItem({
        context,
        value: context.studentFeedbackStatus,
      });
    case 'student-feedback-details':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_detail_lines_value({
          count: context.studentFeedbackDetailLineCount,
        }),
      });
    case 'student-feedback-alternatives':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_detail_lines_value({
          count: context.studentFeedbackAcceptedLineCount,
        }),
      });
    case 'student-feedback-explanations':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_detail_lines_value({
          count: context.studentFeedbackExplanationLineCount,
        }),
      });
    case 'teacher-analysis-items':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_review_items_value({
          count: context.teacherAnalysisItemCount,
        }),
      });
    case 'teacher-analysis-needs-review':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_review_items_value({
          count: context.teacherNeedsReviewCount,
        }),
      });
    case 'teacher-analysis-accepted-answers':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_accepted_count_value({
          count: context.teacherAcceptedAnswerCount,
        }),
      });
    case 'teacher-answer-expected':
      return buildBooleanItem({
        context,
        ok: context.teacherAnswerExpectedReady,
      });
    case 'teacher-answer-alternatives':
      return buildBooleanItem({
        context,
        ok: context.teacherAnswerAlternativesReady,
      });
    case 'teacher-answer-status':
      return buildStaticItem({
        context,
        value: context.teacherAnswerStatus,
      });
    case 'csv-answer-view':
      return buildBooleanItem({
        context,
        ok: context.csvAnswerViewReady,
      });
    case 'csv-accepted-alternatives':
      return buildBooleanItem({
        context,
        ok: context.csvAcceptedAlternativesColumnReady,
      });
    case 'csv-explanation':
      return buildBooleanItem({
        context,
        ok: context.csvExplanationColumnReady,
      });
    case 'privacy-guard':
      return buildStaticItem({
        context,
        value: m.assignment_answer_feedback_handoff_private_data_hidden_value(),
      });
  }
}

function buildStaticItem({
  context,
  value,
}: {
  context: AssignmentAnswerFeedbackHandoffItemContext;
  value: string;
}): Omit<AssignmentAnswerFeedbackHandoffItemView, 'ariaLabel'> {
  return {
    description: getAssignmentAnswerFeedbackHandoffDescription(context.id),
    id: context.id,
    label: getAssignmentAnswerFeedbackHandoffLabel(context.id),
    value,
  };
}

function buildBooleanItem({
  context,
  ok,
}: {
  context: AssignmentAnswerFeedbackHandoffItemContext;
  ok: boolean;
}): Omit<AssignmentAnswerFeedbackHandoffItemView, 'ariaLabel'> {
  return buildStaticItem({
    context,
    value: ok
      ? m.assignment_answer_feedback_handoff_ready_value()
      : m.assignment_answer_feedback_handoff_needs_review_value(),
  });
}

function buildAssignmentAnswerFeedbackHandoffPrivacyContract(
  itemViews: AssignmentAnswerFeedbackHandoffItemView[]
): AssignmentAnswerFeedbackHandoffPrivacyContract {
  return {
    exposesAnonymousToken: false,
    exposesRawRuntimeItemIds: false,
    exposesRawStudentAnswerText: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswerText: false,
    exposesTeacherPromptText: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesAttempts: false,
    scope: 'assignment-answer-feedback-boundary',
    usesSharedAcceptedAnswerParser: true,
    usesSharedFeedbackViews: true,
  };
}

function getAssignmentAnswerFeedbackHandoffLabel(
  id: AssignmentAnswerFeedbackHandoffItemId
) {
  switch (id) {
    case 'accepted-parser-count':
      return m.assignment_answer_feedback_handoff_accepted_parser_count_label();
    case 'slash-separator':
      return m.assignment_answer_feedback_handoff_slash_separator_label();
    case 'semicolon-separator':
      return m.assignment_answer_feedback_handoff_semicolon_separator_label();
    case 'chinese-separator':
      return m.assignment_answer_feedback_handoff_chinese_separator_label();
    case 'unique-normalization':
      return m.assignment_answer_feedback_handoff_unique_normalization_label();
    case 'case-insensitive-match':
      return m.assignment_answer_feedback_handoff_case_insensitive_match_label();
    case 'punctuation-match':
      return m.assignment_answer_feedback_handoff_punctuation_match_label();
    case 'ampersand-match':
      return m.assignment_answer_feedback_handoff_ampersand_match_label();
    case 'blank-answer-guard':
      return m.assignment_answer_feedback_handoff_blank_answer_guard_label();
    case 'runtime-scoring-correct':
      return m.assignment_answer_feedback_handoff_runtime_scoring_correct_label();
    case 'runtime-scoring-completed':
      return m.assignment_answer_feedback_handoff_runtime_scoring_completed_label();
    case 'runtime-scoring-accuracy':
      return m.assignment_answer_feedback_handoff_runtime_scoring_accuracy_label();
    case 'public-review-visible':
      return m.assignment_answer_feedback_handoff_public_review_visible_label();
    case 'public-review-hidden':
      return m.assignment_answer_feedback_handoff_public_review_hidden_label();
    case 'public-accepted-alternatives':
      return m.assignment_answer_feedback_handoff_public_accepted_alternatives_label();
    case 'public-explanations':
      return m.assignment_answer_feedback_handoff_public_explanations_label();
    case 'student-feedback-status':
      return m.assignment_answer_feedback_handoff_student_feedback_status_label();
    case 'student-feedback-details':
      return m.assignment_answer_feedback_handoff_student_feedback_details_label();
    case 'student-feedback-alternatives':
      return m.assignment_answer_feedback_handoff_student_feedback_alternatives_label();
    case 'student-feedback-explanations':
      return m.assignment_answer_feedback_handoff_student_feedback_explanations_label();
    case 'teacher-analysis-items':
      return m.assignment_answer_feedback_handoff_teacher_analysis_items_label();
    case 'teacher-analysis-needs-review':
      return m.assignment_answer_feedback_handoff_teacher_analysis_needs_review_label();
    case 'teacher-analysis-accepted-answers':
      return m.assignment_answer_feedback_handoff_teacher_analysis_accepted_answers_label();
    case 'teacher-answer-expected':
      return m.assignment_answer_feedback_handoff_teacher_answer_expected_label();
    case 'teacher-answer-alternatives':
      return m.assignment_answer_feedback_handoff_teacher_answer_alternatives_label();
    case 'teacher-answer-status':
      return m.assignment_answer_feedback_handoff_teacher_answer_status_label();
    case 'csv-answer-view':
      return m.assignment_answer_feedback_handoff_csv_answer_view_label();
    case 'csv-accepted-alternatives':
      return m.assignment_answer_feedback_handoff_csv_accepted_alternatives_label();
    case 'csv-explanation':
      return m.assignment_answer_feedback_handoff_csv_explanation_label();
    case 'privacy-guard':
      return m.assignment_answer_feedback_handoff_privacy_guard_label();
  }
}

function getAssignmentAnswerFeedbackHandoffDescription(
  id: AssignmentAnswerFeedbackHandoffItemId
) {
  switch (id) {
    case 'accepted-parser-count':
      return m.assignment_answer_feedback_handoff_accepted_parser_count_description();
    case 'slash-separator':
      return m.assignment_answer_feedback_handoff_slash_separator_description();
    case 'semicolon-separator':
      return m.assignment_answer_feedback_handoff_semicolon_separator_description();
    case 'chinese-separator':
      return m.assignment_answer_feedback_handoff_chinese_separator_description();
    case 'unique-normalization':
      return m.assignment_answer_feedback_handoff_unique_normalization_description();
    case 'case-insensitive-match':
      return m.assignment_answer_feedback_handoff_case_insensitive_match_description();
    case 'punctuation-match':
      return m.assignment_answer_feedback_handoff_punctuation_match_description();
    case 'ampersand-match':
      return m.assignment_answer_feedback_handoff_ampersand_match_description();
    case 'blank-answer-guard':
      return m.assignment_answer_feedback_handoff_blank_answer_guard_description();
    case 'runtime-scoring-correct':
      return m.assignment_answer_feedback_handoff_runtime_scoring_correct_description();
    case 'runtime-scoring-completed':
      return m.assignment_answer_feedback_handoff_runtime_scoring_completed_description();
    case 'runtime-scoring-accuracy':
      return m.assignment_answer_feedback_handoff_runtime_scoring_accuracy_description();
    case 'public-review-visible':
      return m.assignment_answer_feedback_handoff_public_review_visible_description();
    case 'public-review-hidden':
      return m.assignment_answer_feedback_handoff_public_review_hidden_description();
    case 'public-accepted-alternatives':
      return m.assignment_answer_feedback_handoff_public_accepted_alternatives_description();
    case 'public-explanations':
      return m.assignment_answer_feedback_handoff_public_explanations_description();
    case 'student-feedback-status':
      return m.assignment_answer_feedback_handoff_student_feedback_status_description();
    case 'student-feedback-details':
      return m.assignment_answer_feedback_handoff_student_feedback_details_description();
    case 'student-feedback-alternatives':
      return m.assignment_answer_feedback_handoff_student_feedback_alternatives_description();
    case 'student-feedback-explanations':
      return m.assignment_answer_feedback_handoff_student_feedback_explanations_description();
    case 'teacher-analysis-items':
      return m.assignment_answer_feedback_handoff_teacher_analysis_items_description();
    case 'teacher-analysis-needs-review':
      return m.assignment_answer_feedback_handoff_teacher_analysis_needs_review_description();
    case 'teacher-analysis-accepted-answers':
      return m.assignment_answer_feedback_handoff_teacher_analysis_accepted_answers_description();
    case 'teacher-answer-expected':
      return m.assignment_answer_feedback_handoff_teacher_answer_expected_description();
    case 'teacher-answer-alternatives':
      return m.assignment_answer_feedback_handoff_teacher_answer_alternatives_description();
    case 'teacher-answer-status':
      return m.assignment_answer_feedback_handoff_teacher_answer_status_description();
    case 'csv-answer-view':
      return m.assignment_answer_feedback_handoff_csv_answer_view_description();
    case 'csv-accepted-alternatives':
      return m.assignment_answer_feedback_handoff_csv_accepted_alternatives_description();
    case 'csv-explanation':
      return m.assignment_answer_feedback_handoff_csv_explanation_description();
    case 'privacy-guard':
      return m.assignment_answer_feedback_handoff_privacy_guard_description();
  }
}
