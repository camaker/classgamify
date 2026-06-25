import {
  ACTIVITY_CREATABLE_VISIBILITIES,
  ACTIVITY_DIFFICULTIES,
  ACTIVITY_EDITOR_FIELD_LIMITS,
  ACTIVITY_PERSISTED_VISIBILITIES,
  ACTIVITY_TEMPLATE_TYPES,
  ACTIVITY_TITLE_LENGTH,
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
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import { makeActivityStableId } from '@/activities/stable-id';
import { getTemplateRemixOption } from '@/activities/template-remix';
import { m } from '@/locale/paraglide/messages';
import { z } from 'zod';

export const activityTemplateTypeSchema = z.enum(ACTIVITY_TEMPLATE_TYPES);

export const activityDifficultySchema = z.enum(ACTIVITY_DIFFICULTIES);

export const activityVisibilitySchema = z.enum(ACTIVITY_CREATABLE_VISIBILITIES);

export const activityPersistedVisibilitySchema = z.enum(
  ACTIVITY_PERSISTED_VISIBILITIES
);

export const createActivityInputSchema = z.object({
  description: z
    .string()
    .trim()
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.descriptionMaxLength)
    .optional(),
  difficulty: activityDifficultySchema.default('starter'),
  gradeBand: z
    .string()
    .trim()
    .min(ACTIVITY_EDITOR_FIELD_LIMITS.gradeBandMinLength)
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.gradeBandMaxLength),
  groupsText: z
    .string()
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.groupsTextMaxLength)
    .optional(),
  language: z
    .string()
    .trim()
    .min(ACTIVITY_EDITOR_FIELD_LIMITS.languageMinLength)
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.languageMaxLength)
    .default('en'),
  learningGoal: z
    .string()
    .trim()
    .min(ACTIVITY_EDITOR_FIELD_LIMITS.learningGoalMinLength)
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.learningGoalMaxLength),
  pairsText: z
    .string()
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.pairsTextMaxLength)
    .optional(),
  questionsText: z
    .string()
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.questionsTextMaxLength)
    .optional(),
  sourceSummary: z
    .string()
    .trim()
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.sourceSummaryMaxLength)
    .optional(),
  sourceMaterials: z.array(z.unknown()).optional(),
  subject: z
    .string()
    .trim()
    .min(ACTIVITY_EDITOR_FIELD_LIMITS.subjectMinLength)
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.subjectMaxLength),
  teacherNotesText: z
    .string()
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.teacherNotesTextMaxLength)
    .optional(),
  templateType: activityTemplateTypeSchema,
  title: z
    .string()
    .trim()
    .min(ACTIVITY_TITLE_LENGTH.min)
    .max(ACTIVITY_TITLE_LENGTH.max),
  visibility: activityVisibilitySchema.default('draft'),
  vocabularyText: z
    .string()
    .max(ACTIVITY_EDITOR_FIELD_LIMITS.vocabularyTextMaxLength)
    .optional(),
});

export type CreateActivityInput = z.infer<typeof createActivityInputSchema>;

type CreateActivityPayload = CreateActivityInput & {
  difficulty: ActivityDifficulty;
  templateType: ActivityTemplateType;
  visibility: ActivityVisibility;
};

type ActivityContentRowKind = 'group' | 'pair' | 'question';

const PRIMARY_ROW_SEPARATOR_PATTERN = /[|｜\t]/u;
const FALLBACK_ROW_SEPARATOR_PATTERN = /[:：]/u;

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
      m.activity_validation_default_source_summary(),
    sourceMaterials: normalizeActivityMaterialReferences(input.sourceMaterials),
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
  const rows = parseRows(raw, 'question');
  const questionIdCounts = countStableIds(
    rows.map((row) => row.parts[0] ?? '')
  );

  return rows.map((row, index) => {
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
    const optionIdCounts = countStableIds(allOptions);

    return {
      answer: normalizedAnswer,
      id: makeId('q', prompt, index, questionIdCounts),
      explanation,
      options: allOptions.map((option, optionIndex) => ({
        id: makeId('o', option, optionIndex, optionIdCounts),
        isCorrect: option === normalizedAnswer,
        text: option,
      })),
      prompt,
    };
  });
}

function parsePairs(raw?: string): ActivityPair[] {
  const rows = parseRows(raw, 'pair');
  const pairIdCounts = countStableIds(
    rows.map((row) => `${row.parts[0] ?? ''}-${row.parts[1] ?? ''}`)
  );

  return rows.map((row, index) => {
    const [left, right] = row.parts;
    if (!left || !right) {
      throw new Error(
        m.activity_validation_error_pair_line({
          lineNumber: row.lineNumber,
        })
      );
    }

    return {
      id: makeId('p', `${left}-${right}`, index, pairIdCounts),
      left,
      right,
    };
  });
}

function parseGroups(raw?: string): ActivityGroup[] {
  const rows = parseRows(raw, 'group');
  const groupIdCounts = countStableIds(rows.map((row) => row.parts[0] ?? ''));

  return rows.map((row, index) => {
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
      id: makeId('g', label, index, groupIdCounts),
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
      .split(/[\n,;，；、]+/u)
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function parseRows(raw: string | undefined, rowKind: ActivityContentRowKind) {
  return (raw ?? '')
    .split(/\r?\n/u)
    .map((line, index) => ({
      lineNumber: index + 1,
      parts: splitActivityContentRow(line),
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

function splitActivityContentRow(line: string) {
  const separator = PRIMARY_ROW_SEPARATOR_PATTERN.test(line)
    ? PRIMARY_ROW_SEPARATOR_PATTERN
    : FALLBACK_ROW_SEPARATOR_PATTERN;

  return line.split(separator).map((part) => part.trim());
}

function formatActivityContentRowKind(rowKind: ActivityContentRowKind) {
  if (rowKind === 'group') return m.activity_validation_row_kind_group();
  if (rowKind === 'pair') return m.activity_validation_row_kind_pair();
  return m.activity_validation_row_kind_question();
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function makeId(
  prefix: string,
  value: string,
  index: number,
  idCounts?: Map<string, number>
) {
  const slug = makeActivityStableId(value);

  if (!slug) return `${prefix}-${index + 1}`;

  if ((idCounts?.get(slug) ?? 0) > 1) {
    return `${prefix}-${slug}-${index + 1}`;
  }

  return `${prefix}-${slug}`;
}

function countStableIds(values: string[]) {
  const counts = new Map<string, number>();

  for (const value of values) {
    const slug = makeActivityStableId(value);
    if (!slug) continue;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  return counts;
}
