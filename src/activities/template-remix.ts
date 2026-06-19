import { activityTemplates } from '@/activities/catalog';
import type {
  ActivityContent,
  ActivityTemplateDefinition,
  ActivityTemplateType,
} from '@/activities/types';

export type TemplateRemixOption = {
  isCurrent: boolean;
  isReady: boolean;
  missingRequirements: Array<keyof ActivityContent>;
  template: ActivityTemplateDefinition;
};

export type TemplateRemixPlan = {
  currentTemplateType: ActivityTemplateType;
  options: TemplateRemixOption[];
  readyOptions: TemplateRemixOption[];
  suggestedOptions: TemplateRemixOption[];
};

export function getTemplateRemixPlan({
  content,
  currentTemplateType,
}: {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
}): TemplateRemixPlan {
  const options = activityTemplates.map((template) => {
    const missingRequirements = getMissingTemplateRequirements(
      template,
      content
    );

    return {
      isCurrent: template.type === currentTemplateType,
      isReady: missingRequirements.length === 0,
      missingRequirements,
      template,
    };
  });
  const readyOptions = options.filter((option) => option.isReady);
  const suggestedOptions = readyOptions.filter((option) => !option.isCurrent);

  return {
    currentTemplateType,
    options,
    readyOptions,
    suggestedOptions,
  };
}

export function getMissingTemplateRequirements(
  template: ActivityTemplateDefinition,
  content: ActivityContent
) {
  return template.contentRequirements.filter((requirement) => {
    const value = content[requirement];
    return Array.isArray(value) ? value.length === 0 : !value;
  });
}

export function formatTemplateRequirement(requirement: keyof ActivityContent) {
  switch (requirement) {
    case 'groups':
      return 'groups';
    case 'pairs':
      return 'match pairs';
    case 'questions':
      return 'questions';
    case 'teacherNotes':
      return 'teacher notes';
    case 'learningGoal':
      return 'learning goal';
    case 'sourceSummary':
      return 'source summary';
    case 'gradeBand':
      return 'grade band';
    case 'vocabulary':
      return 'vocabulary';
    default:
      return requirement;
  }
}
