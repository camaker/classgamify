import type {
  ActivityContent,
  ActivitySeed,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import { buildQuestionOptionTexts } from '@/activities/question-options';
import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import {
  buildActivityContent,
  createActivityInputSchema,
  parseActivityContent,
  type CreateActivityInput,
} from '@/activities/validation';
import {
  getTemplateRemixPlan,
  formatTemplateRequirement,
  type TemplateRemixPlan,
} from '@/activities/template-remix';

type ActivityEditorSource = {
  content: ActivityContent;
  description?: string | null;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

type ActivityEditorPreviewPanel = {
  actions: Array<{
    href: `#${string}`;
    icon: 'edit';
    label: string;
  }>;
  description: string;
  editorSectionId: string;
  title: string;
};

type ActivityEditorTemplateSetupView = {
  actionLabel: string;
  description: string;
  requirementBadges: string[];
  shortName: string;
  successMessage: string;
  title: string;
};

const activityEditorSectionId = 'activity-editor';

export const activityEditorDefaultInput: CreateActivityInput = {
  description:
    'Quick classroom practice that can become a quiz, match game, or worksheet.',
  difficulty: 'starter',
  gradeBand: 'Primary',
  groupsText: 'Fruit | apple, banana\nDrink | milk, water',
  language: 'en',
  learningGoal:
    'Students can recognize key words and connect them with simple meanings.',
  pairsText: 'apple | fruit\nmilk | drink\nrice | grain',
  questionsText:
    'Which word means a red or green fruit? | apple | apple, bread, water | Apple is the fruit clue.\nWhich drink is white? | milk | milk, rice, egg | Milk is the white drink.',
  sourceSummary: 'Teacher-created activity from a unit vocabulary list.',
  subject: 'English',
  teacherNotesText:
    'Use quiz mode for homework.\nUse matching pairs as a class warmup.',
  templateType: 'quiz',
  title: 'Food words quick check',
  visibility: 'draft',
  vocabularyText: 'apple, bread, milk, rice, water, egg',
};

export function buildActivityEditorInitialValues(
  templateType?: ActivityTemplateType
): CreateActivityInput | undefined {
  if (!templateType) return undefined;

  return {
    ...activityEditorDefaultInput,
    ...getActivityTemplateScaffold(templateType),
    templateType,
    visibility: activityEditorDefaultInput.visibility,
  };
}

export function buildActivityEditorPreviewSeed(
  input: CreateActivityInput = activityEditorDefaultInput
): ActivitySeed {
  const content = buildActivityContent(input);

  return {
    content,
    description: input.description,
    estimatedMinutes: 6,
    id: 'activity-editor-preview',
    status: input.visibility,
    templateType: input.templateType,
    title: input.title,
  };
}

export function buildActivityEditorPreviewPanel(
  input: CreateActivityInput = activityEditorDefaultInput
): ActivityEditorPreviewPanel {
  const template = getTemplateByType(input.templateType);

  return {
    actions: [
      {
        href: `#${activityEditorSectionId}`,
        icon: 'edit',
        label: 'Review scaffold fields',
      },
    ],
    description: `This ${template.shortName} scaffold is still a draft. Review the structured fields on the left, save it as an activity, then publish from your library to create the student link.`,
    editorSectionId: activityEditorSectionId,
    title: `${template.name} scaffold preview`,
  };
}

export function buildActivityEditorTemplateSetupView(
  templateType: ActivityTemplateType
): ActivityEditorTemplateSetupView {
  const template = getTemplateByType(templateType);

  return {
    actionLabel: 'Load scaffold',
    description: template.description,
    requirementBadges: template.contentRequirements.map(
      (requirement) => `Requires ${formatTemplateRequirement(requirement)}`
    ),
    shortName: template.shortName,
    successMessage: `${template.name} scaffold loaded.`,
    title: `${template.name} setup`,
  };
}

export function activityContentToEditorInput(
  source: ActivityEditorSource
): CreateActivityInput {
  return {
    description: source.description ?? '',
    difficulty: source.content.difficulty,
    gradeBand: source.content.gradeBand,
    groupsText: source.content.groups
      .map((group) => `${group.label} | ${group.items.join(', ')}`)
      .join('\n'),
    language: source.content.language,
    learningGoal: source.content.learningGoal,
    pairsText: source.content.pairs
      .map((pair) => `${pair.left} | ${pair.right}`)
      .join('\n'),
    questionsText: source.content.questions
      .map((question) => {
        const options = buildQuestionOptionTexts({
          answer: question.answer,
          options: question.options?.map((option) => option.text),
        });
        const base = `${question.prompt} | ${question.answer} | ${options.join(', ')}`;
        return question.explanation
          ? `${base} | ${question.explanation}`
          : base;
      })
      .join('\n'),
    sourceSummary: source.content.sourceSummary,
    subject: source.content.subject,
    teacherNotesText: source.content.teacherNotes.join('\n'),
    templateType: source.templateType,
    title: source.title,
    visibility: source.visibility,
    vocabularyText: source.content.vocabulary.join(', '),
  };
}

export function buildActivityEditorTemplateReadiness(
  input: unknown
): TemplateRemixPlan | null {
  const parsed = createActivityInputSchema.safeParse(input);
  if (!parsed.success) return null;

  try {
    const content = parseActivityContent(parsed.data);
    return getTemplateRemixPlan({
      content,
      currentTemplateType: parsed.data.templateType,
    });
  } catch {
    return null;
  }
}
