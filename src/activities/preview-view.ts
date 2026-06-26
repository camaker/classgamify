import {
  formatActivityTemplateClassroomMode,
  getTemplateByType,
} from '@/activities/catalog';
import type { ActivitySeed, AssignmentSeed } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';

export type ActivityPreviewAction = {
  href?: string;
  icon?: ActivityPreviewActionIcon;
  label: string;
  to?: string;
  variant?: 'default' | 'outline';
};

export type ActivityPreviewActionIcon = 'edit' | 'share' | 'sparkles';

export type ActivityPreviewPanel = {
  actions?: ActivityPreviewAction[];
  description: string;
  title: string;
};

type ActivityPreviewViewModel = {
  content: {
    gradeBand: string;
    learningGoal: string;
    subject: string;
    visibleGroups: ActivitySeed['content']['groups'];
    visiblePairs: ActivitySeed['content']['pairs'];
    visibleQuestions: ActivitySeed['content']['questions'];
  };
  description: string;
  metrics: {
    classroomMode: string;
    estimatedTime: string;
    resultTarget: string;
  };
  panel: ActivityPreviewPanel;
  templateName: string;
  title: string;
};

export const ACTIVITY_PREVIEW_CONTENT_LIMITS = {
  groups: 3,
  pairs: 4,
  questions: 3,
} as const;

export function buildActivityPreviewViewModel({
  activity,
  assignment,
  panel,
}: {
  activity: ActivitySeed;
  assignment?: AssignmentSeed;
  panel?: ActivityPreviewPanel;
}): ActivityPreviewViewModel {
  const template = getTemplateByType(activity.templateType);

  return {
    content: {
      gradeBand: activity.content.gradeBand,
      learningGoal: activity.content.learningGoal,
      subject: activity.content.subject,
      visibleGroups: activity.content.groups.slice(
        0,
        ACTIVITY_PREVIEW_CONTENT_LIMITS.groups
      ),
      visiblePairs: activity.content.pairs.slice(
        0,
        ACTIVITY_PREVIEW_CONTENT_LIMITS.pairs
      ),
      visibleQuestions: activity.content.questions.slice(
        0,
        ACTIVITY_PREVIEW_CONTENT_LIMITS.questions
      ),
    },
    description: activity.description,
    metrics: {
      classroomMode: formatActivityTemplateClassroomMode(
        template.classroomMode
      ),
      estimatedTime: m.activity_preview_estimated_time_value({
        minutes: activity.estimatedMinutes,
      }),
      resultTarget: assignment
        ? m.activity_preview_assignment_result_value({
            averageScore: assignment.averageScore,
            completions: assignment.completions,
          })
        : m.activity_preview_default_result_value(),
    },
    panel: panel ?? buildDefaultActivityPreviewPanel(),
    templateName: template.name,
    title: activity.title,
  };
}

export function buildDefaultActivityPreviewPanel(): ActivityPreviewPanel {
  return {
    actions: [
      {
        icon: 'sparkles',
        label: m.activity_preview_create_activity(),
        to: Routes.Create,
      },
      {
        icon: 'share',
        label: m.activity_preview_open_student_preview(),
        to: Routes.StudentPreview,
        variant: 'outline',
      },
    ],
    description: m.activity_preview_default_panel_description(),
    title: m.activity_preview_default_panel_title(),
  };
}
