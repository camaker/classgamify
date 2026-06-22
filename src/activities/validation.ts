import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityContent,
  type ActivityDifficulty,
  type ActivityGroup,
  type ActivityPair,
  type ActivityQuestion,
  type ActivityTemplateType,
  type ActivityVisibility,
} from '@/activities/types';
import { getTemplateByType } from '@/activities/catalog';
import {
  buildQuestionOptionTexts,
  normalizeQuestionOptionDisplayText,
} from '@/activities/question-options';
import { getTemplateRemixOption } from '@/activities/template-remix';
import { m } from '@/locale/paraglide/messages';
import { z } from 'zod';

export const activityTemplateTypeSchema = z.enum(ACTIVITY_TEMPLATE_TYPES);

export const activityDifficultySchema = z.enum([
  'starter',
  'core',
  'challenge',
]);

export const activityVisibilitySchema = z.enum([
  'draft',
  'private',
  'public',
  'unlisted',
]);

export const activityPersistedVisibilitySchema = z.enum([
  'archived',
  'draft',
  'private',
  'public',
  'unlisted',
]);

export const createActivityInputSchema = z.object({
  description: z.string().trim().max(400).optional(),
  difficulty: activityDifficultySchema.default('starter'),
  gradeBand: z.string().trim().min(1).max(80),
  groupsText: z.string().max(4000).optional(),
  language: z.string().trim().min(2).max(20).default('en'),
  learningGoal: z.string().trim().min(8).max(400),
  pairsText: z.string().max(4000).optional(),
  questionsText: z.string().max(6000).optional(),
  sourceSummary: z.string().trim().max(500).optional(),
  subject: z.string().trim().min(1).max(80),
  teacherNotesText: z.string().max(2000).optional(),
  templateType: activityTemplateTypeSchema,
  title: z.string().trim().min(3).max(120),
  visibility: activityVisibilitySchema.default('draft'),
  vocabularyText: z.string().max(2000).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;

export type CreateActivityPayload = CreateActivityInput & {
  difficulty: ActivityDifficulty;
  templateType: ActivityTemplateType;
  visibility: ActivityVisibility;
};

type ActivityContentRowKind = 'group' | 'pair' | 'question';

export function buildActivityContent(
  input: CreateActivityPayload
): ActivityContent {
  const content = parseActivityContent(input);

  assertTemplateRequirements(input.templateType, content);

  return content;
}

export function parseActivityContent(
  input: CreateActivityPayload
): ActivityContent {
  return {
    difficulty: input.difficulty,
    gradeBand: input.gradeBand,
    groups: parseGroups(input.groupsText),
    language: input.language,
    learningGoal: input.learningGoal,
    pairs: parsePairs(input.pairsText),
    questions: parseQuestions(input.questionsText),
    sourceSummary:
      input.sourceSummary?.trim() ||
      'Teacher-created activity from structured editor input.',
    subject: input.subject,
    teacherNotes: parseLineList(input.teacherNotesText),
    vocabulary: parseVocabulary(input.vocabularyText),
  };
}

function assertTemplateRequirements(
  templateType: ActivityTemplateType,
  content: ActivityContent
) {
  const template = getTemplateByType(templateType);
  const remixOption = getTemplateRemixOption({
    content,
    currentTemplateType: templateType,
    template,
  });

  if (!remixOption.isReady) {
    throw new Error(remixOption.diagnosis);
  }
}

function parseQuestions(raw?: string): ActivityQuestion[] {
  return parseRows(raw, 'question').map((row, index) => {
    const [prompt, answer, optionsRaw, explanation] = row.parts;
    if (!prompt || !answer) {
      throw new Error(
        m.activity_validation_error_question_line({
          lineNumber: row.lineNumber,
        })
      );
    }

    const normalizedAnswer = normalizeQuestionOptionDisplayText(answer);
    const allOptions = buildQuestionOptionTexts({
      answer: normalizedAnswer,
      options: parseInlineList(optionsRaw),
    });

    return {
      answer: normalizedAnswer,
      id: makeId('q', prompt, index),
      explanation,
      options: allOptions.map((option, optionIndex) => ({
        id: makeId('o', option, optionIndex),
        isCorrect: option === normalizedAnswer,
        text: option,
      })),
      prompt,
    };
  });
}

function parsePairs(raw?: string): ActivityPair[] {
  return parseRows(raw, 'pair').map((row, index) => {
    const [left, right] = row.parts;
    if (!left || !right) {
      throw new Error(
        m.activity_validation_error_pair_line({
          lineNumber: row.lineNumber,
        })
      );
    }

    return {
      id: makeId('p', `${left}-${right}`, index),
      left,
      right,
    };
  });
}

function parseGroups(raw?: string): ActivityGroup[] {
  return parseRows(raw, 'group').map((row, index) => {
    const [label, itemsRaw] = row.parts;
    const items = parseInlineList(itemsRaw);
    if (!label || items.length === 0) {
      throw new Error(
        m.activity_validation_error_group_line({
          lineNumber: row.lineNumber,
        })
      );
    }

    return {
      id: makeId('g', label, index),
      items,
      label,
    };
  });
}

function parseVocabulary(raw?: string): string[] {
  return unique(parseInlineList(raw));
}

function parseLineList(raw?: string): string[] {
  return unique(
    (raw ?? '')
      .split(/\r?\n/u)
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function parseInlineList(raw?: string): string[] {
  return unique(
    (raw ?? '')
      .split(/[\n,;]+/u)
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function parseRows(raw: string | undefined, rowKind: ActivityContentRowKind) {
  return (raw ?? '')
    .split(/\r?\n/u)
    .map((line, index) => ({
      lineNumber: index + 1,
      parts: line.split('|').map((part) => part.trim()),
      raw: line.trim(),
    }))
    .filter((row) => row.raw.length > 0)
    .map((row) => {
      if (row.parts.length < 2) {
        throw new Error(
          m.activity_validation_error_row_separator({
            label: formatActivityContentRowKind(rowKind),
          })
        );
      }
      return row;
    });
}

function formatActivityContentRowKind(rowKind: ActivityContentRowKind) {
  if (rowKind === 'group') return m.activity_validation_row_kind_group();
  if (rowKind === 'pair') return m.activity_validation_row_kind_pair();
  return m.activity_validation_row_kind_question();
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function makeId(prefix: string, value: string, index: number) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);

  return `${prefix}-${slug || index + 1}`;
}
