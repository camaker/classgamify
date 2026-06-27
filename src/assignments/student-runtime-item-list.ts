import {
  getActivityTemplateRunnerKind,
  type ActivityTemplateRunnerKind,
} from '@/activities/runtime';
import { getActivityTemplateRunnerCopy } from '@/activities/runner-copy';
import type { ActivityTemplateType } from '@/activities/types';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import { buildDefaultRuntimeItemCardViews } from '@/assignments/student-runner-view';
import {
  buildStudentAnswerChanges,
  type StudentAnswerChange,
} from '@/assignments/student-submission';

export type { StudentAnswerChange };

export type StudentRuntimeItemListSurface = ActivityTemplateRunnerKind;

type StudentRuntimeItemListView = {
  defaultItemCardViews: ReturnType<typeof buildDefaultRuntimeItemCardViews>;
  runnerCopy: ReturnType<typeof getActivityTemplateRunnerCopy>;
  surface: StudentRuntimeItemListSurface;
};

export function buildStudentRuntimeItemListView({
  answers,
  items,
  reviewItems,
  templateType,
}: {
  answers: Record<string, string>;
  items: PublicRuntimeItem[];
  reviewItems?: PublicAttemptReviewItem[];
  templateType: ActivityTemplateType;
}): StudentRuntimeItemListView {
  const surface = getActivityTemplateRunnerKind(templateType);
  const runnerCopy = getActivityTemplateRunnerCopy(templateType);

  return {
    defaultItemCardViews: buildDefaultRuntimeItemCardViews({
      answers,
      correctAnswerLabel: runnerCopy.correctAnswerLabel,
      inputPlaceholder: runnerCopy.inputPlaceholder,
      items,
      progressVerb: runnerCopy.progressVerb,
      reviewItems,
    }),
    runnerCopy,
    surface,
  };
}

export function buildStudentRuntimeSingleAnswerChanges({
  answer,
  itemId,
}: {
  answer: string;
  itemId: string;
}): StudentAnswerChange[] {
  return buildStudentAnswerChanges({ answer, itemId });
}
