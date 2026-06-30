import type {
  AssignmentAttemptReview,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import {
  formatAssignmentSummaryAccuracy,
  formatAssignmentSummaryItemPerformance,
  formatAssignmentSummaryReviewItemCount,
} from '@/assignments/result-summary-format';
import {
  formatAssignmentResultPromptLabel,
  formatAssignmentResultStudentLabel,
} from '@/assignments/result-display';
import {
  formatAssignmentResultCopyLine,
  formatAssignmentResultCopyTitle,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import { getAssignmentReviewPriorityItems } from '@/assignments/review-priority';
import { getAssignmentStudentFollowUpPriorityStudents } from '@/assignments/student-follow-up-priority';
import {
  buildLatestAttemptReviewByStudentKey,
  formatStudentFollowUpLastSubmitted,
  formatStudentFollowUpLastSubmittedContext,
  formatStudentFollowUpLatestAttemptCompletedAt,
  formatStudentFollowUpLatestAttemptSummary,
  formatStudentFollowUpRecommendation,
  formatStudentFollowUpSubmittedContext,
} from '@/assignments/student-follow-up-summary';
import { m } from '@/locale/paraglide/messages';

type AssignmentReteachPlanInput = {
  assignmentTitle: string;
  attempts?: AssignmentAttemptReview[];
  items: AssignmentItemAnalysis[];
  students: AssignmentStudentSummary[];
};

export const ASSIGNMENT_RETEACH_PLAN_LIMITS = {
  reviewItems: 5,
  reviewStudents: 8,
} as const;

export type AssignmentReteachPlanItemView = {
  itemId: string;
  performanceLabel: string;
  promptLabel: string;
  text: string;
};

export type AssignmentReteachPlanStudentView = {
  accuracyLabel: string;
  followUpRecommendation: string;
  lastSubmittedLabel: string | null;
  latestAttemptCompletedAtLabel: string | null;
  latestAttemptSummaryLabel: string | null;
  reviewItemCountLabel: string;
  submittedContextLabel: string | null;
  studentKey: string;
  studentLabel: string;
  text: string;
};

export type AssignmentReteachPlan = {
  followUpHeading: string;
  itemViews: AssignmentReteachPlanItemView[];
  reviewHeading: string;
  reviewItems: AssignmentItemAnalysis[];
  reviewStudents: AssignmentStudentSummary[];
  studentViews: AssignmentReteachPlanStudentView[];
  text: string;
  title: string;
};

export function buildAssignmentReteachPlan({
  assignmentTitle,
  attempts = [],
  items,
  students,
}: AssignmentReteachPlanInput): AssignmentReteachPlan {
  const reviewItems = getAssignmentReviewPriorityItems(items, {
    limit: ASSIGNMENT_RETEACH_PLAN_LIMITS.reviewItems,
  });
  const reviewStudents = getAssignmentStudentFollowUpPriorityStudents(
    students,
    {
      limit: ASSIGNMENT_RETEACH_PLAN_LIMITS.reviewStudents,
    }
  );
  const itemViews = buildAssignmentReteachPlanItemViews(reviewItems);
  const studentViews = buildAssignmentReteachPlanStudentViews(reviewStudents, {
    attempts,
  });
  const copyTitle = formatAssignmentResultCopyTitle(assignmentTitle);
  const title = m.assignment_reteach_plan_title({ title: copyTitle });
  const reviewHeading = m.assignment_reteach_plan_review_first();
  const followUpHeading = m.assignment_reteach_plan_follow_up();
  const lines = [
    title,
    '',
    reviewHeading,
    ...formatReviewItems(itemViews),
    '',
    followUpHeading,
    ...formatReviewStudents(studentViews),
  ];

  return {
    followUpHeading,
    itemViews,
    reviewHeading,
    reviewItems,
    reviewStudents,
    studentViews,
    text: joinAssignmentResultCopyLines(lines),
    title,
  };
}

export function buildAssignmentReteachPlanItemViews(
  items: AssignmentItemAnalysis[]
): AssignmentReteachPlanItemView[] {
  return items.map((item, index) =>
    buildAssignmentReteachPlanItemView({ index, item })
  );
}

export function buildAssignmentReteachPlanItemView({
  index,
  item,
}: {
  index: number;
  item: AssignmentItemAnalysis;
}): AssignmentReteachPlanItemView {
  const performanceLabel = formatAssignmentSummaryItemPerformance(item);
  const promptLabel = formatAssignmentResultPromptLabel({
    index,
    prompt: item.prompt,
  });

  return {
    itemId: item.itemId,
    performanceLabel,
    promptLabel,
    text: m.assignment_reteach_plan_item({
      performance: performanceLabel,
      promptLabel,
    }),
  };
}

export function buildAssignmentReteachPlanStudentViews(
  students: AssignmentStudentSummary[],
  options?: {
    attempts?: AssignmentAttemptReview[];
  }
): AssignmentReteachPlanStudentView[] {
  const latestAttemptByStudentKey = buildLatestAttemptReviewByStudentKey(
    options?.attempts ?? []
  );

  return students.map((student) =>
    buildAssignmentReteachPlanStudentView({
      latestAttempt: latestAttemptByStudentKey.get(student.studentKey),
      student,
    })
  );
}

export function buildAssignmentReteachPlanStudentView({
  latestAttempt,
  student,
}: {
  latestAttempt?: AssignmentAttemptReview;
  student: AssignmentStudentSummary;
}): AssignmentReteachPlanStudentView {
  const studentLabel = formatAssignmentResultStudentLabel(student.studentLabel);
  const accuracyLabel = formatAssignmentSummaryAccuracy(student.latestAccuracy);
  const reviewItemCountLabel = formatAssignmentSummaryReviewItemCount(
    student.needsReviewCount
  );
  const followUpRecommendation = formatStudentFollowUpRecommendation(
    student.needsReviewCount
  );
  const lastSubmittedLabel = formatStudentFollowUpLastSubmitted(student);
  const latestAttemptCompletedAtLabel = latestAttempt
    ? formatStudentFollowUpLatestAttemptCompletedAt(latestAttempt)
    : null;
  const latestAttemptSummaryLabel = latestAttempt
    ? formatStudentFollowUpLatestAttemptSummary({
        attempt: latestAttempt,
        completedAtLabel: latestAttemptCompletedAtLabel,
      })
    : null;
  const lastSubmittedContextLabel = formatStudentFollowUpLastSubmittedContext({
    lastSubmittedLabel,
    latestAttemptCompletedAtLabel,
  });
  const submittedContextLabel = formatStudentFollowUpSubmittedContext({
    lastSubmittedLabel,
    latestAttemptCompletedAtLabel,
  });
  const lineInput = {
    accuracy: accuracyLabel,
    lastSubmittedContext: lastSubmittedContextLabel,
    recommendation: followUpRecommendation,
    reviewCount: reviewItemCountLabel,
    student: studentLabel,
  };

  return {
    accuracyLabel,
    followUpRecommendation,
    lastSubmittedLabel,
    latestAttemptCompletedAtLabel,
    latestAttemptSummaryLabel,
    reviewItemCountLabel,
    submittedContextLabel,
    studentKey: student.studentKey,
    studentLabel,
    text: formatAssignmentResultCopyLine(
      latestAttemptSummaryLabel
        ? m.assignment_reteach_plan_student_with_latest_attempt({
            ...lineInput,
            latestAttemptSummary: latestAttemptSummaryLabel,
          })
        : m.assignment_reteach_plan_student(lineInput)
    ),
  };
}

function formatReviewItems(items: AssignmentReteachPlanItemView[]) {
  if (items.length === 0) {
    return [m.assignment_reteach_plan_empty_items()];
  }

  return items.map((item) => item.text);
}

function formatReviewStudents(students: AssignmentReteachPlanStudentView[]) {
  if (students.length === 0) {
    return [m.assignment_reteach_plan_empty_students()];
  }

  return students.map((student) => student.text);
}
