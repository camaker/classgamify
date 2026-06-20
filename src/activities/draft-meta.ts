import { getTemplateRemixPlan } from '@/activities/template-remix';
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
  diagnosis: string;
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementCount: number;
  missingRequirements: string[];
  readinessLabel: string;
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
  const lockedTemplateDiagnostics = remixPlan.options
    .filter((option) => !option.isReady)
    .map((option) => option.diagnosis);

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
    reviewChecklist: buildDraftReviewChecklist({
      activity,
      lockedTemplateDiagnostics,
      suggestedTemplates,
    }),
    suggestedTemplateCount: suggestedTemplates.length,
    suggestedTemplates,
    templateReadiness: remixPlan.options.map((option) => ({
      diagnosis: option.diagnosis,
      isCurrent: option.isCurrent,
      isReady: option.isReady,
      missingRequirementCount: option.missingRequirementCount,
      missingRequirements: option.missingRequirementLabels,
      readinessLabel: option.readinessLabel,
      shortName: option.template.shortName,
      template: option.template.type,
    })),
  };
}

function buildDraftReviewChecklist({
  activity,
  lockedTemplateDiagnostics,
  suggestedTemplates,
}: {
  activity: CreateActivityInput;
  lockedTemplateDiagnostics: string[];
  suggestedTemplates: string[];
}) {
  const checklist = [
    'Review every answer before saving.',
    'Adjust wording for your class level.',
    activity.questionsText?.includes('|')
      ? 'Check explanations and distractor choices.'
      : 'Add questions before publishing quiz-style work.',
  ];

  if (suggestedTemplates.length > 0) {
    checklist.push(
      `Ready to remix after saving: ${suggestedTemplates.join(', ')}.`
    );

    if (lockedTemplateDiagnostics[0]) {
      checklist.push(`Next content gap: ${lockedTemplateDiagnostics[0]}`);
    }

    return checklist;
  }

  checklist.push(
    lockedTemplateDiagnostics[0] ??
      'Add more structured pairs or groups to unlock more templates.'
  );

  return checklist;
}
