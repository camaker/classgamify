import {
  formatActivityTemplateClassroomMode,
  getTemplateByType,
} from '@/activities/catalog';
import type {
  ActivityGroup,
  ActivityPair,
  ActivityQuestion,
  ActivitySeed,
  AssignmentSeed,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';

export type ActivityPreviewAction = {
  href?: string;
  icon?: ActivityPreviewActionIcon;
  id: string;
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

type ActivityPreviewGroupView = ActivityGroup & {
  summaryText: string;
};

type ActivityPreviewPairView = ActivityPair & {
  summaryText: string;
};

type ActivityPreviewQuestionView = ActivityQuestion & {
  summaryText: string;
};

type ActivityPreviewViewModel = {
  content: {
    gradeBand: string;
    learningGoal: string;
    subject: string;
    visibleGroups: ActivityPreviewGroupView[];
    visiblePairs: ActivityPreviewPairView[];
    visibleQuestions: ActivityPreviewQuestionView[];
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

const ACTIVITY_PREVIEW_CONTENT_LIMITS = {
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
      visibleGroups: buildActivityPreviewGroupViews(activity.content.groups),
      visiblePairs: buildActivityPreviewPairViews(activity.content.pairs),
      visibleQuestions: buildActivityPreviewQuestionViews(
        activity.content.questions
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

function buildActivityPreviewQuestionViews(
  questions: ActivityQuestion[]
): ActivityPreviewQuestionView[] {
  return questions
    .slice(0, ACTIVITY_PREVIEW_CONTENT_LIMITS.questions)
    .map((question) => ({
      ...question,
      summaryText: question.prompt,
    }));
}

function buildActivityPreviewPairViews(
  pairs: ActivityPair[]
): ActivityPreviewPairView[] {
  return pairs.slice(0, ACTIVITY_PREVIEW_CONTENT_LIMITS.pairs).map((pair) => ({
    ...pair,
    summaryText: m.activity_preview_pair_line({
      left: pair.left,
      right: pair.right,
    }),
  }));
}

function buildActivityPreviewGroupViews(
  groups: ActivityGroup[]
): ActivityPreviewGroupView[] {
  return groups
    .slice(0, ACTIVITY_PREVIEW_CONTENT_LIMITS.groups)
    .map((group) => ({
      ...group,
      summaryText: m.activity_preview_group_line({
        items: formatActivityPreviewGroupItems(group.items),
        label: group.label,
      }),
    }));
}

function formatActivityPreviewGroupItems(items: string[]) {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .join(m.activity_preview_group_item_separator());
}

export function buildDefaultActivityPreviewPanel(): ActivityPreviewPanel {
  return {
    actions: [
      {
        icon: 'sparkles',
        id: 'create-activity',
        label: m.activity_preview_create_activity(),
        to: Routes.Create,
      },
      {
        icon: 'share',
        id: 'student-preview',
        label: m.activity_preview_open_student_preview(),
        to: Routes.StudentPreview,
        variant: 'outline',
      },
    ],
    description: m.activity_preview_default_panel_description(),
    title: m.activity_preview_default_panel_title(),
  };
}
