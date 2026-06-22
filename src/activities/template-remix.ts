import { getActivityTemplates } from '@/activities/catalog';
import type {
  ActivityContent,
  ActivityTemplateContentRequirement,
  ActivityTemplateDefinition,
  ActivityTemplateType,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export type TemplateRemixTemplateOption = {
  shortName: string;
  template: ActivityTemplateType;
};

export type TemplateRemixLockedOption = {
  diagnosis: string;
  template: ActivityTemplateType;
};

export type TemplateRemixOption = {
  diagnosis: string;
  isCurrent: boolean;
  isReady: boolean;
  missingRequirementCount: number;
  missingRequirementLabels: string[];
  missingRequirements: ActivityTemplateContentRequirement[];
  readinessLabel: string;
  template: ActivityTemplateDefinition;
};

export type TemplateRemixPlan = {
  currentTemplateType: ActivityTemplateType;
  options: TemplateRemixOption[];
  readyOptions: TemplateRemixOption[];
  suggestedOptions: TemplateRemixOption[];
};

type TemplateRemixSummary = {
  lockedTemplateDiagnostics: string[];
  lockedTemplateOptions: TemplateRemixLockedOption[];
  readyTemplateOptions: TemplateRemixTemplateOption[];
  suggestedTemplateOptions: TemplateRemixTemplateOption[];
};

export function getTemplateRemixPlan({
  content,
  currentTemplateType,
}: {
  content: ActivityContent;
  currentTemplateType: ActivityTemplateType;
}): TemplateRemixPlan {
  const options = getActivityTemplates().map((template) =>
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

export function buildTemplateRemixSummary(
  remixPlan: TemplateRemixPlan
): TemplateRemixSummary {
  const lockedOptions = remixPlan.options.filter((option) => !option.isReady);

  return {
    lockedTemplateDiagnostics: lockedOptions.map((option) => option.diagnosis),
    lockedTemplateOptions: lockedOptions.map(toTemplateOptionDiagnostic),
    readyTemplateOptions: remixPlan.readyOptions.map(toTemplateOptionSummary),
    suggestedTemplateOptions: remixPlan.suggestedOptions.map(
      toTemplateOptionSummary
    ),
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
    readinessLabel: isReady
      ? m.template_remix_ready()
      : m.template_remix_needs_more_content(),
    template,
  };
}

function toTemplateOptionSummary(
  option: TemplateRemixOption
): TemplateRemixTemplateOption {
  return {
    shortName: option.template.shortName,
    template: option.template.type,
  };
}

function toTemplateOptionDiagnostic(
  option: TemplateRemixOption
): TemplateRemixLockedOption {
  return {
    diagnosis: option.diagnosis,
    template: option.template.type,
  };
}

function getMissingTemplateRequirements(
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
    return m.template_remix_diagnosis_selected_ready({
      template: template.shortName,
    });
  }

  if (isReady) {
    return m.template_remix_diagnosis_ready({
      template: template.shortName,
    });
  }

  return m.template_remix_diagnosis_locked({
    requirements: formatTemplateRequirementList(missingRequirementLabels),
    template: template.shortName,
  });
}

export function formatTemplateRequirementList(requirements: string[]) {
  if (requirements.length <= 1) {
    return requirements[0] ?? '';
  }

  if (requirements.length === 2) {
    return m.template_remix_requirement_list_pair({
      first: requirements[0],
      second: requirements[1],
    });
  }

  return m.template_remix_requirement_list_many({
    head: requirements
      .slice(0, -1)
      .join(m.template_remix_requirement_list_separator()),
    last: requirements[requirements.length - 1],
  });
}

export function formatTemplateRequirement(
  requirement: ActivityTemplateContentRequirement
) {
  switch (requirement) {
    case 'groups':
      return m.activity_template_requirement_groups();
    case 'pairs':
      return m.activity_template_requirement_pairs();
    case 'questions':
      return m.activity_template_requirement_questions();
    case 'teacherNotes':
      return m.activity_template_requirement_teacher_notes();
    case 'learningGoal':
      return m.activity_template_requirement_learning_goal();
    case 'sourceSummary':
      return m.activity_template_requirement_source_summary();
    case 'gradeBand':
      return m.activity_template_requirement_grade_band();
    case 'vocabulary':
      return m.activity_template_requirement_vocabulary();
  }
}

export function getActivityTemplateDraftGuidance(
  templateType: ActivityTemplateType
) {
  switch (templateType) {
    case 'fill-blank':
      return m.activity_template_draft_guidance_fill_blank();
    case 'group-sort':
      return m.activity_template_draft_guidance_group_sort();
    case 'line-match':
      return m.activity_template_draft_guidance_line_match();
    case 'listening':
      return m.activity_template_draft_guidance_listening();
    case 'match-up':
      return m.activity_template_draft_guidance_match_up();
    case 'matching-pairs':
      return m.activity_template_draft_guidance_matching_pairs();
    case 'open-box':
      return m.activity_template_draft_guidance_open_box();
    case 'quiz':
      return m.activity_template_draft_guidance_quiz();
  }
}
