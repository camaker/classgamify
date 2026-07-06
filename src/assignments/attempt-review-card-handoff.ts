import type { AssignmentAttemptReview } from '@/assignments/results';
import { buildAssignmentAttemptReviewSummary } from '@/assignments/result-review-summary';
import { formatAssignmentResultNumber } from '@/assignments/result-format';
import type { AssignmentResultAnswerStatusTone } from '@/assignments/result-answer-view';
import { m } from '@/locale/paraglide/messages';

export const ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS = [
  'review-card-scope',
  'student-display-boundary',
  'submitted-time-display',
  'score-badge',
  'summary-metric-count',
  'submitted-count',
  'correct-count',
  'needs-review-count',
  'unanswered-count',
  'answer-card-count',
  'answer-sequence',
  'prompt-labels',
  'status-labels',
  'correct-status-count',
  'needs-review-status-count',
  'unanswered-status-count',
  'student-answer-lines',
  'expected-answer-lines',
  'accepted-alternatives-lines',
  'explanation-lines',
  'unsubmitted-answer-guard',
  'answer-text-view-helper',
  'answer-status-helper',
  'attempt-summary-helper',
  'review-card-consumer',
  'review-filter-consumer',
  'copy-scope-boundary',
  'csv-export-boundary',
  'anonymous-token-guard',
  'privacy-guard',
] as const;

export type AssignmentAttemptReviewCardHandoffItemId =
  (typeof ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS)[number];

export type AssignmentAttemptReviewCardHandoffAnswerViewEvidence = {
  acceptedAnswersLineText: string | null;
  expectedAnswerLineText: string;
  explanationText: string | null;
  statusLabel: string;
  statusTone: AssignmentResultAnswerStatusTone;
  studentAnswerLineText: string;
};

export type BuildAssignmentAttemptReviewCardHandoffEvidenceInput = Pick<
  AssignmentAttemptReview,
  'answers'
> & {
  answerViews: AssignmentAttemptReviewCardHandoffAnswerViewEvidence[];
  badgeLabel: string;
  submittedAtLabel: string;
  summaryMetricCount: number;
};

export type AssignmentAttemptReviewCardHandoffEvidence = {
  acceptedAlternativesLineCount: number;
  answerCardCount: number;
  correctAnswerCount: number;
  correctStatusCount: number;
  expectedAnswerLineCount: number;
  explanationLineCount: number;
  hasScoreBadge: boolean;
  hasSubmittedAtLabel: boolean;
  needsReviewAnswerCount: number;
  needsReviewStatusCount: number;
  statusLabelCount: number;
  studentAnswerLineCount: number;
  submittedAnswerCount: number;
  summaryMetricCount: number;
  totalAnswerCount: number;
  unansweredAnswerCount: number;
  unansweredStatusCount: number;
};

export type AssignmentAttemptReviewCardHandoffPrivacyContract = {
  exposesAcceptedAnswerText: false;
  exposesAttemptId: false;
  exposesPromptText: false;
  exposesRawAnonymousToken: false;
  exposesStudentAnswerText: false;
  exposesStudentDisplayLabel: false;
  exposesTeacherAnswerText: false;
  itemIds: AssignmentAttemptReviewCardHandoffItemId[];
  mutatesResultData: false;
  scope: 'teacher-result-attempt-review-card';
  usesAssignmentDomainHelpers: true;
};

export type AssignmentAttemptReviewCardHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: AssignmentAttemptReviewCardHandoffItemId;
  label: string;
  value: string;
};

export type AssignmentAttemptReviewCardHandoffView = {
  description: string;
  itemViews: AssignmentAttemptReviewCardHandoffItemView[];
  privacy: AssignmentAttemptReviewCardHandoffPrivacyContract;
  title: string;
};

export function buildAssignmentAttemptReviewCardHandoffEvidence({
  answers,
  answerViews,
  badgeLabel,
  submittedAtLabel,
  summaryMetricCount,
}: BuildAssignmentAttemptReviewCardHandoffEvidenceInput): AssignmentAttemptReviewCardHandoffEvidence {
  const summary = buildAssignmentAttemptReviewSummary({ answers });

  return {
    acceptedAlternativesLineCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => Boolean(answerView.acceptedAnswersLineText)
    ),
    answerCardCount: normalizeAttemptReviewCardHandoffCount(answerViews.length),
    correctAnswerCount: normalizeAttemptReviewCardHandoffCount(
      summary.correctItemCount
    ),
    correctStatusCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => answerView.statusTone === 'correct'
    ),
    expectedAnswerLineCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => Boolean(answerView.expectedAnswerLineText)
    ),
    explanationLineCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => Boolean(answerView.explanationText)
    ),
    hasScoreBadge: badgeLabel.trim().length > 0,
    hasSubmittedAtLabel: submittedAtLabel.trim().length > 0,
    needsReviewAnswerCount: normalizeAttemptReviewCardHandoffCount(
      summary.needsReviewItemCount
    ),
    needsReviewStatusCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => answerView.statusTone === 'review'
    ),
    statusLabelCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => Boolean(answerView.statusLabel)
    ),
    studentAnswerLineCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => Boolean(answerView.studentAnswerLineText)
    ),
    submittedAnswerCount: normalizeAttemptReviewCardHandoffCount(
      summary.submittedItemCount
    ),
    summaryMetricCount:
      normalizeAttemptReviewCardHandoffCount(summaryMetricCount),
    totalAnswerCount: normalizeAttemptReviewCardHandoffCount(
      summary.totalItemCount
    ),
    unansweredAnswerCount: normalizeAttemptReviewCardHandoffCount(
      summary.unansweredItemCount
    ),
    unansweredStatusCount: countAttemptReviewCardHandoffItems(
      answerViews,
      (answerView) => answerView.statusTone === 'idle'
    ),
  };
}

export function buildAssignmentAttemptReviewCardHandoffView(
  evidence: AssignmentAttemptReviewCardHandoffEvidence
): AssignmentAttemptReviewCardHandoffView {
  const itemViews = ASSIGNMENT_ATTEMPT_REVIEW_CARD_HANDOFF_ITEM_IDS.map((id) =>
    buildAssignmentAttemptReviewCardHandoffItemView(id, evidence)
  );

  return {
    description: m.assignment_attempt_review_card_handoff_description(),
    itemViews,
    privacy: buildAssignmentAttemptReviewCardHandoffPrivacyContract(itemViews),
    title: m.assignment_attempt_review_card_handoff_title(),
  };
}

function buildAssignmentAttemptReviewCardHandoffItemView(
  id: AssignmentAttemptReviewCardHandoffItemId,
  evidence: AssignmentAttemptReviewCardHandoffEvidence
): AssignmentAttemptReviewCardHandoffItemView {
  switch (id) {
    case 'review-card-scope':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_scope_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_scope_label(),
        value: m.assignment_attempt_review_card_handoff_scope_value(),
      });
    case 'student-display-boundary':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_student_display_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_student_display_label(),
        value:
          m.assignment_attempt_review_card_handoff_display_prepared_value(),
      });
    case 'submitted-time-display':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_submitted_time_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_submitted_time_label(),
        value: formatAttemptReviewCardHandoffReadyState(
          evidence.hasSubmittedAtLabel
        ),
      });
    case 'score-badge':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_score_badge_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_score_badge_label(),
        value: formatAttemptReviewCardHandoffReadyState(evidence.hasScoreBadge),
      });
    case 'summary-metric-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_summary_metric_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_summary_metric_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.summaryMetricCount
        ),
      });
    case 'submitted-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_submitted_count_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_submitted_count_label(),
        value: formatAttemptReviewCardHandoffRatio({
          matched: evidence.submittedAnswerCount,
          total: evidence.totalAnswerCount,
        }),
      });
    case 'correct-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_correct_count_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_correct_count_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.correctAnswerCount
        ),
      });
    case 'needs-review-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_needs_review_count_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_needs_review_count_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.needsReviewAnswerCount
        ),
      });
    case 'unanswered-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_unanswered_count_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_unanswered_count_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.unansweredAnswerCount
        ),
      });
    case 'answer-card-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_answer_card_count_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_answer_card_count_label(),
        value: formatAttemptReviewCardHandoffNumber(evidence.answerCardCount),
      });
    case 'answer-sequence':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_answer_sequence_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_answer_sequence_label(),
        value: m.assignment_attempt_review_card_handoff_snapshot_order_value(),
      });
    case 'prompt-labels':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_prompt_labels_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_prompt_labels_label(),
        value: m.assignment_attempt_review_card_handoff_numbered_value(),
      });
    case 'status-labels':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_status_labels_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_status_labels_label(),
        value: formatAttemptReviewCardHandoffNumber(evidence.statusLabelCount),
      });
    case 'correct-status-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_correct_status_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_correct_status_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.correctStatusCount
        ),
      });
    case 'needs-review-status-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_review_status_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_review_status_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.needsReviewStatusCount
        ),
      });
    case 'unanswered-status-count':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_unanswered_status_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_unanswered_status_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.unansweredStatusCount
        ),
      });
    case 'student-answer-lines':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_student_answer_lines_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_student_answer_lines_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.studentAnswerLineCount
        ),
      });
    case 'expected-answer-lines':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_expected_answer_lines_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_expected_answer_lines_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.expectedAnswerLineCount
        ),
      });
    case 'accepted-alternatives-lines':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_accepted_lines_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_accepted_lines_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.acceptedAlternativesLineCount
        ),
      });
    case 'explanation-lines':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_explanation_lines_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_explanation_lines_label(),
        value: formatAttemptReviewCardHandoffNumber(
          evidence.explanationLineCount
        ),
      });
    case 'unsubmitted-answer-guard':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_unsubmitted_guard_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_unsubmitted_guard_label(),
        value:
          m.assignment_attempt_review_card_handoff_unanswered_label_value(),
      });
    case 'answer-text-view-helper':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_answer_text_helper_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_answer_text_helper_label(),
        value: 'buildAssignmentResultAttemptAnswerTextView',
      });
    case 'answer-status-helper':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_answer_status_helper_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_answer_status_helper_label(),
        value: 'buildAssignmentResultAnswerStatusView',
      });
    case 'attempt-summary-helper':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_summary_helper_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_summary_helper_label(),
        value: 'buildAssignmentAttemptReviewSummary',
      });
    case 'review-card-consumer':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_review_card_consumer_description(),
        id,
        label:
          m.assignment_attempt_review_card_handoff_review_card_consumer_label(),
        value:
          m.assignment_attempt_review_card_handoff_review_card_consumer_value(),
      });
    case 'review-filter-consumer':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_review_filter_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_review_filter_label(),
        value: m.assignment_attempt_review_card_handoff_review_filter_value(),
      });
    case 'copy-scope-boundary':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_copy_scope_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_copy_scope_label(),
        value: m.assignment_attempt_review_card_handoff_copy_scope_value(),
      });
    case 'csv-export-boundary':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_csv_export_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_csv_export_label(),
        value: m.assignment_attempt_review_card_handoff_csv_export_value(),
      });
    case 'anonymous-token-guard':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_anonymous_token_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_anonymous_token_label(),
        value: m.assignment_attempt_review_card_handoff_hidden_value(),
      });
    case 'privacy-guard':
      return buildAssignmentAttemptReviewCardHandoffOutput({
        description:
          m.assignment_attempt_review_card_handoff_privacy_description(),
        id,
        label: m.assignment_attempt_review_card_handoff_privacy_label(),
        value: m.assignment_attempt_review_card_handoff_hidden_value(),
      });
  }
}

function buildAssignmentAttemptReviewCardHandoffOutput({
  description,
  id,
  label,
  value,
}: Omit<AssignmentAttemptReviewCardHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.assignment_attempt_review_card_handoff_item_aria_label({
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

function buildAssignmentAttemptReviewCardHandoffPrivacyContract(
  itemViews: AssignmentAttemptReviewCardHandoffItemView[]
): AssignmentAttemptReviewCardHandoffPrivacyContract {
  return {
    exposesAcceptedAnswerText: false,
    exposesAttemptId: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentDisplayLabel: false,
    exposesTeacherAnswerText: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    mutatesResultData: false,
    scope: 'teacher-result-attempt-review-card',
    usesAssignmentDomainHelpers: true,
  };
}

function countAttemptReviewCardHandoffItems<TItem>(
  items: TItem[],
  predicate: (item: TItem) => boolean
) {
  return normalizeAttemptReviewCardHandoffCount(items.filter(predicate).length);
}

function formatAttemptReviewCardHandoffReadyState(isReady: boolean) {
  return isReady
    ? m.assignment_attempt_review_card_handoff_prepared_value()
    : m.assignment_attempt_review_card_handoff_missing_value();
}

function formatAttemptReviewCardHandoffRatio({
  matched,
  total,
}: {
  matched: number;
  total: number;
}) {
  return m.assignment_attempt_review_card_handoff_count_ratio({
    matched: formatAttemptReviewCardHandoffNumber(matched),
    total: formatAttemptReviewCardHandoffNumber(total),
  });
}

function formatAttemptReviewCardHandoffNumber(value: number) {
  return formatAssignmentResultNumber(value, { min: 0 });
}

function normalizeAttemptReviewCardHandoffCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
