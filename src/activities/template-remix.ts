import { activityTemplates } from '@/activities/catalog';
import type {
  ActivityContent,
  ActivityTemplateDefinition,
  ActivityTemplateType,
} from '@/activities/types';

export type TemplateRemixOption = {
  diagnosis: string;
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementCount: number;
  missingRequirementLabels: string[];
  missingRequirements: Array<keyof ActivityContent>;
  readinessLabel: string;
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
  const options = activityTemplates.map((template) =>
    getTemplateRemixOption({
      content,
      currentTemplateType,
      template,
    })
  );
  const readyOptions = options.filter((option) => option.isReady);
  const suggestedOptions = readyOptions.filter((option) => !option.isCurrent);

  return {
    currentTemplateType,
    options,
    readyOptions,
    suggestedOptions,
  };
}

export function getTemplateRemixOption({
  content,
  currentTemplateType,
  template,
}: {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
  template: ActivityTemplateDefinition;
}): TemplateRemixOption {
  const missingRequirements = getMissingTemplateRequirements(template, content);
  const isCurrent = template.type === currentTemplateType;
  const isReady = missingRequirements.length === 0;
  const missingRequirementLabels = missingRequirements.map(
    formatTemplateRequirement
  );

  return {
    diagnosis: buildTemplateRemixDiagnosis({
      isCurrent,
      isReady,
      missingRequirementLabels,
      template,
    }),
    isCurrent,
    isReady,
    missingRequirementCount: missingRequirements.length,
    missingRequirementLabels,
    missingRequirements,
    readinessLabel: isReady ? 'Ready' : 'Needs more content',
    template,
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

function buildTemplateRemixDiagnosis({
  isCurrent,
  isReady,
  missingRequirementLabels,
  template,
}: {
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementLabels: string[];
  template: ActivityTemplateDefinition;
}) {
  if (isReady && isCurrent) {
    return `${template.shortName} is selected and ready.`;
  }

  if (isReady) {
    return `Ready to remix into ${template.shortName}.`;
  }

  return `Add ${formatTemplateRequirementList(
    missingRequirementLabels
  )} to unlock ${template.shortName}.`;
}

export function formatTemplateRequirementList(requirements: string[]) {
  if (requirements.length <= 1) {
    return requirements[0] ?? '';
  }

  if (requirements.length === 2) {
    return `${requirements[0]} and ${requirements[1]}`;
  }

  return `${requirements.slice(0, -1).join(', ')}, and ${
    requirements[requirements.length - 1]
  }`;
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
