import type {
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
  formatAssignmentResultCopyTitle,
  joinAssignmentResultCopyLines,
} from '@/assignments/result-copy-format';
import { getAssignmentReviewPriorityItems } from '@/assignments/review-priority';
import { getAssignmentStudentFollowUpPriorityStudents } from '@/assignments/student-follow-up-priority';
import { formatStudentFollowUpRecommendation } from '@/assignments/student-follow-up-summary';
import { m } from '@/locale/paraglide/messages';

type AssignmentReteachPlanInput = {
  assignmentTitle: string;
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
  reviewItemCountLabel: string;
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
  const studentViews = buildAssignmentReteachPlanStudentViews(reviewStudents);
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
  students: AssignmentStudentSummary[]
): AssignmentReteachPlanStudentView[] {
  return students.map(buildAssignmentReteachPlanStudentView);
}

export function buildAssignmentReteachPlanStudentView(
  student: AssignmentStudentSummary
): AssignmentReteachPlanStudentView {
  const studentLabel = formatAssignmentResultStudentLabel(student.studentLabel);
  const accuracyLabel = formatAssignmentSummaryAccuracy(student.latestAccuracy);
  const reviewItemCountLabel = formatAssignmentSummaryReviewItemCount(
    student.needsReviewCount
  );
  const followUpRecommendation = formatStudentFollowUpRecommendation(
    student.needsReviewCount
  );

  return {
    accuracyLabel,
    followUpRecommendation,
    reviewItemCountLabel,
    studentKey: student.studentKey,
    studentLabel,
    text: m.assignment_reteach_plan_student({
      accuracy: accuracyLabel,
      recommendation: followUpRecommendation,
      reviewCount: reviewItemCountLabel,
      student: studentLabel,
    }),
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
