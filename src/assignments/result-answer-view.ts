import type {
  AssignmentAttemptReview,
  AssignmentAttemptReviewAnswerStatus,
} from '@/assignments/results';
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultValue,
  formatOptionalAcceptedAnswerAlternatives,
  formatPrimaryAcceptedAnswer,
} from '@/assignments/result-format';
import { m } from '@/locale/paraglide/messages';

export type AssignmentResultAnswerStatusTone = 'correct' | 'idle' | 'review';

export type AssignmentResultAnswerStatusView = {
  exportLabel: string;
  label: string;
  tone: AssignmentResultAnswerStatusTone;
};

export type AssignmentResultAcceptedAnswerView = {
  acceptedAlternativesText: string;
  expectedAnswerText: string;
  optionalAcceptedAlternativesText: string | null;
};

export type AssignmentResultAttemptAnswerTextView =
  AssignmentResultAcceptedAnswerView & {
    exportStatusLabel: string;
    exportStudentAnswerText: string;
    statusLabel: string;
    statusTone: AssignmentResultAnswerStatusTone;
    studentAnswerText: string;
  };

type AssignmentResultAttemptAnswerSource =
  AssignmentAttemptReview['answers'][number];

export function buildAssignmentResultAcceptedAnswerView(
  acceptedAnswers: string[],
  options?: {
    emptyValue?: string;
  }
): AssignmentResultAcceptedAnswerView {
  return {
    acceptedAlternativesText: formatAcceptedAnswerAlternatives(
      acceptedAnswers,
      {
        emptyValue: options?.emptyValue,
        includePrimary: false,
      }
    ),
    expectedAnswerText: formatPrimaryAcceptedAnswer(acceptedAnswers, {
      emptyValue: options?.emptyValue,
    }),
    optionalAcceptedAlternativesText: formatOptionalAcceptedAnswerAlternatives(
      acceptedAnswers,
      {
        includePrimary: false,
      }
    ),
  };
}

export function buildAssignmentResultAnswerStatusView(
  answer: AssignmentAttemptReviewAnswerStatus
): AssignmentResultAnswerStatusView {
  if (!answer.submitted) {
    return {
      exportLabel: m.assignment_results_export_status_unanswered(),
      label: m.assignment_result_review_unanswered(),
      tone: 'idle',
    };
  }

  if (answer.correct) {
    return {
      exportLabel: m.assignment_results_export_status_correct(),
      label: m.assignment_result_review_correct(),
      tone: 'correct',
    };
  }

  return {
    exportLabel: m.assignment_results_export_status_review(),
    label: m.assignment_result_review_review(),
    tone: 'review',
  };
}

export function buildAssignmentResultAttemptAnswerTextView(
  answer: AssignmentResultAttemptAnswerSource,
  options?: {
    acceptedAnswerEmptyValue?: string;
    studentAnswerEmptyValue?: string;
  }
): AssignmentResultAttemptAnswerTextView {
  const acceptedAnswers = buildAssignmentResultAcceptedAnswerView(
    answer.acceptedAnswers,
    {
      emptyValue: options?.acceptedAnswerEmptyValue,
    }
  );
  const status = buildAssignmentResultAnswerStatusView(answer);
  const studentAnswerText = answer.submitted
    ? formatAssignmentResultValue(answer.answer, {
        emptyValue: options?.studentAnswerEmptyValue,
      })
    : m.assignment_result_review_unanswered();

  return {
    ...acceptedAnswers,
    exportStatusLabel: status.exportLabel,
    exportStudentAnswerText: answer.submitted
      ? formatAssignmentResultValue(answer.answer, {
          emptyValue: options?.studentAnswerEmptyValue,
        })
      : m.assignment_results_export_status_unanswered(),
    statusLabel: status.label,
    statusTone: status.tone,
    studentAnswerText,
  };
}
