import {
  formatTemplateRequirement,
  getTemplateRemixPlan,
} from '@/activities/template-remix';
import type { ActivityTemplateType } from '@/activities/types';
import {
  buildActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';

export type ActivityDraftMeta = {
  coverage: {
    groups: number;
    pairs: number;
    questions: number;
    teacherNotes: number;
    vocabulary: number;
  };
  readyTemplateCount: number;
  readyTemplates: string[];
  reviewChecklist: string[];
  suggestedTemplateCount: number;
  suggestedTemplates: string[];
  templateReadiness: ActivityDraftTemplateReadiness[];
};

export type ActivityDraftTemplateReadiness = {
  isCurrent: boolean;
  isReady: boolean;
  missingRequirements: string[];
  shortName: string;
  template: ActivityTemplateType;
};

export function buildActivityDraftMeta({
  activity,
  currentTemplateType,
}: {
  activity: CreateActivityInput;
  currentTemplateType: ActivityTemplateType;
}): ActivityDraftMeta {
  const content = buildActivityContent(activity);
  const remixPlan = getTemplateRemixPlan({
    content,
    currentTemplateType,
  });
  const suggestedTemplates = remixPlan.suggestedOptions.map(
    (option) => option.template.shortName
  );
  const readyTemplates = remixPlan.readyOptions.map(
    (option) => option.template.shortName
  );

  return {
    coverage: {
      groups: content.groups.length,
      pairs: content.pairs.length,
      questions: content.questions.length,
      teacherNotes: content.teacherNotes.length,
      vocabulary: content.vocabulary.length,
    },
    readyTemplateCount: remixPlan.readyOptions.length,
    readyTemplates,
    reviewChecklist: buildDraftReviewChecklist(activity, suggestedTemplates),
    suggestedTemplateCount: suggestedTemplates.length,
    suggestedTemplates,
    templateReadiness: remixPlan.options.map((option) => ({
      isCurrent: option.isCurrent,
      isReady: option.isReady,
      missingRequirements: option.missingRequirements.map(
        formatTemplateRequirement
      ),
      shortName: option.template.shortName,
      template: option.template.type,
    })),
  };
}

function buildDraftReviewChecklist(
  activity: CreateActivityInput,
  suggestedTemplates: string[]
) {
  return [
    'Review every answer before saving.',
    'Adjust wording for your class level.',
    activity.questionsText?.includes('|')
      ? 'Check explanations and distractor choices.'
      : 'Add questions before publishing quiz-style work.',
    suggestedTemplates.length > 0
      ? `Ready to remix after saving: ${suggestedTemplates.join(', ')}.`
      : 'Add more structured pairs or groups to unlock more templates.',
  ];
}
