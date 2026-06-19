import type {
  ActivityContent,
  ActivityTemplateType,
  ActivityVisibility,
} from '@/activities/types';
import type { CreateActivityInput } from '@/activities/validation';

type ActivityEditorSource = {
  content: ActivityContent;
  description?: string | null;
  templateType: ActivityTemplateType;
  title: string;
  visibility: ActivityVisibility;
};

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
        const options = ensureOptionText(question.answer, question.options);
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

function ensureOptionText(
  answer: string,
  options?: Array<{ text: string }>
): string[] {
  return unique([answer, ...(options?.map((option) => option.text) ?? [])]);
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
