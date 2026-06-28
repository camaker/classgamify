import { getTemplateByType } from '@/activities/catalog';
import {
  buildActivityDraftMeta,
  type ActivityDraftMeta,
} from '@/activities/draft-meta';
import { ACTIVITY_DRAFT_SOURCE_MAX_LENGTH } from '@/activities/draft-source';
import {
  ACTIVITY_EDITOR_FIELD_LIMITS,
  ACTIVITY_TITLE_LENGTH,
  type ActivityTemplateType,
} from '@/activities/types';
import {
  buildActivityContent,
  activityDifficultySchema,
  activityTemplateTypeSchema,
  createActivityInputSchema,
  type CreateActivityInput,
} from '@/activities/validation';
import {
  buildQuestionOptionTexts,
  normalizeQuestionOptionDisplayText,
} from '@/activities/question-options';
import {
  formatEditorGroupRow,
  formatEditorGroupRows,
  formatEditorInlineList,
  formatEditorLineList,
  formatEditorPairRows,
  formatEditorQuestionRow,
  formatEditorQuestionRows,
} from '@/activities/editor-serialization';
import {
  formatTemplateRequirementList,
  formatTemplateRequirements,
  getActivityTemplateDraftGuidance,
} from '@/activities/template-remix';
import { hasWorkersAiCredentials, runWorkersAi } from '@/ai/workers';
import { WORKERS_AI_MODELS } from '@/config/ai-models';
import { m } from '@/locale/paraglide/messages';
import type { Locale } from '@/locale/paraglide/runtime';
import { z } from 'zod';

export const ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE = {
  default: 5,
  max: 10,
  min: 3,
} as const;

export const ACTIVITY_AI_DRAFT_ITEM_COUNT_OPTIONS = [
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min,
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.default,
  8,
  ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.max,
] as const;

export const ACTIVITY_AI_DRAFT_FOCUSES = [
  'balanced',
  'worksheet-practice',
  'listening-script',
  'remix-ready',
] as const;

export type ActivityAiDraftFocus = (typeof ACTIVITY_AI_DRAFT_FOCUSES)[number];

export const ACTIVITY_AI_DRAFT_DEFAULT_FOCUS =
  'balanced' satisfies ActivityAiDraftFocus;

export type ActivityAiDraftFocusOption = {
  description: string;
  label: string;
  value: ActivityAiDraftFocus;
};

export const ACTIVITY_AI_DRAFT_COMPLETION_LIMITS = {
  groups: 4,
  groupItems: 8,
  pairs: 10,
  questions: 10,
  teacherNotes: 5,
  vocabulary: 16,
} as const;

export const ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS = {
  maxPhraseLength: 48,
  maxWordLength: 32,
  minPhraseLength: 2,
  minWordLength: 3,
} as const;

export const ACTIVITY_AI_DRAFT_FIELD_LIMITS = {
  answer: {
    max: 120,
    min: 1,
  },
  description: {
    max: 220,
    min: 8,
  },
  explanation: {
    max: 240,
    min: 4,
  },
  gradeBand: {
    max: ACTIVITY_EDITOR_FIELD_LIMITS.gradeBandMaxLength,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.gradeBandMinLength,
  },
  groupItem: {
    max: 80,
    min: 1,
  },
  groupLabel: {
    max: 80,
    min: 1,
  },
  language: {
    max: ACTIVITY_EDITOR_FIELD_LIMITS.languageMaxLength,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.languageMinLength,
  },
  learningGoal: {
    max: 260,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.learningGoalMinLength,
  },
  option: {
    max: 120,
    min: 1,
  },
  options: {
    max: 12,
  },
  pairLeft: {
    max: 100,
    min: 1,
  },
  pairRight: {
    max: 140,
    min: 1,
  },
  prompt: {
    max: 240,
    min: 4,
  },
  sourceSummary: {
    max: 300,
    min: 8,
  },
  sourceSummaryFallback: {
    max: 280,
  },
  sourceText: {
    max: ACTIVITY_DRAFT_SOURCE_MAX_LENGTH,
    min: 8,
  },
  subject: {
    max: ACTIVITY_EDITOR_FIELD_LIMITS.subjectMaxLength,
    min: ACTIVITY_EDITOR_FIELD_LIMITS.subjectMinLength,
  },
  teacherNote: {
    max: 160,
    min: 1,
  },
  title: {
    max: 90,
    min: ACTIVITY_TITLE_LENGTH.min,
  },
  vocabulary: {
    max: 80,
    min: 1,
  },
} as const;

export const generateActivityDraftInputSchema = z.object({
  difficulty: activityDifficultySchema.default('starter'),
  draftFocus: z
    .enum(ACTIVITY_AI_DRAFT_FOCUSES)
    .default(ACTIVITY_AI_DRAFT_DEFAULT_FOCUS),
  gradeBand: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.gradeBand.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.gradeBand.max)
    .default('Primary'),
  itemCount: z
    .number()
    .int()
    .min(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min)
    .max(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.max)
    .default(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.default),
  language: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.language.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.language.max)
    .default('en'),
  sourceText: z
    .string()
    .trim()
    .min(
      ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceText.min,
      m.activity_ai_source_min_error()
    )
    .max(
      ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceText.max,
      m.activity_ai_source_max_error()
    ),
  subject: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.subject.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.subject.max)
    .default('English'),
  templateType: activityTemplateTypeSchema.default('quiz'),
});

export type GenerateActivityDraftInput = z.input<
  typeof generateActivityDraftInputSchema
>;

type NormalizedGenerateActivityDraftInput = z.output<
  typeof generateActivityDraftInputSchema
>;

export function buildGenerateActivityDraftInputFromEditor({
  current,
  draftFocus,
  itemCount,
  sourceText,
}: {
  current: CreateActivityInput;
  draftFocus: ActivityAiDraftFocus;
  itemCount: number;
  sourceText: string;
}): GenerateActivityDraftInput {
  return generateActivityDraftInputSchema.parse({
    difficulty: current.difficulty,
    draftFocus,
    gradeBand: current.gradeBand || 'Primary',
    itemCount,
    language: current.language || 'en',
    sourceText,
    subject: current.subject || 'English',
    templateType: current.templateType,
  });
}

export function buildActivityAiDraftFocusOptions(): ActivityAiDraftFocusOption[] {
  return ACTIVITY_AI_DRAFT_FOCUSES.map((value) => ({
    description: formatActivityAiDraftFocusDescription(value),
    label: formatActivityAiDraftFocusLabel(value),
    value,
  }));
}

export function formatActivityAiDraftFocusLabel(
  draftFocus: ActivityAiDraftFocus
) {
  switch (draftFocus) {
    case 'balanced':
      return m.activity_ai_focus_balanced_label();
    case 'listening-script':
      return m.activity_ai_focus_listening_script_label();
    case 'remix-ready':
      return m.activity_ai_focus_remix_ready_label();
    case 'worksheet-practice':
      return m.activity_ai_focus_worksheet_practice_label();
  }
}

export function formatActivityAiDraftFocusDescription(
  draftFocus: ActivityAiDraftFocus
) {
  switch (draftFocus) {
    case 'balanced':
      return m.activity_ai_focus_balanced_description();
    case 'listening-script':
      return m.activity_ai_focus_listening_script_description();
    case 'remix-ready':
      return m.activity_ai_focus_remix_ready_description();
    case 'worksheet-practice':
      return m.activity_ai_focus_worksheet_practice_description();
  }
}

export function buildActivityAiDraftFocusPromptLine(
  draftFocus: ActivityAiDraftFocus
) {
  return m.activity_ai_prompt_draft_focus({
    focus: formatActivityAiDraftFocusLabel(draftFocus),
    guidance: getActivityAiDraftFocusGuidance(draftFocus),
  });
}

function getActivityAiDraftFocusGuidance(draftFocus: ActivityAiDraftFocus) {
  switch (draftFocus) {
    case 'balanced':
      return m.activity_ai_focus_balanced_prompt();
    case 'listening-script':
      return m.activity_ai_focus_listening_script_prompt();
    case 'remix-ready':
      return m.activity_ai_focus_remix_ready_prompt();
    case 'worksheet-practice':
      return m.activity_ai_focus_worksheet_practice_prompt();
  }
}

export type ActivityDraftResult = {
  activity: CreateActivityInput;
  meta: ActivityDraftMeta;
  model: string;
  notice?: string;
  provider: 'fallback' | 'workers-ai';
};

const aiQuestionSchema = z.object({
  answer: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.answer.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.answer.max),
  explanation: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.explanation.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.explanation.max)
    .optional(),
  options: z
    .array(
      z
        .string()
        .trim()
        .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.option.min)
        .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.option.max)
    )
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.options.max)
    .default([]),
  prompt: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.prompt.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.prompt.max),
});

const aiPairSchema = z.object({
  left: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.pairLeft.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.pairLeft.max),
  right: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.pairRight.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.pairRight.max),
});

const aiGroupSchema = z.object({
  items: z
    .array(
      z
        .string()
        .trim()
        .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.groupItem.min)
        .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.groupItem.max)
    )
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.groupItem.min)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.groupItems),
  label: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.groupLabel.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.groupLabel.max),
});

const aiDraftSchema = z.object({
  description: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.description.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.description.max),
  groups: z
    .array(aiGroupSchema)
    .min(2)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.groups),
  learningGoal: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.learningGoal.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.learningGoal.max),
  pairs: z
    .array(aiPairSchema)
    .min(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.pairs),
  questions: z
    .array(aiQuestionSchema)
    .min(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.questions),
  sourceSummary: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceSummary.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceSummary.max),
  teacherNotes: z
    .array(
      z
        .string()
        .trim()
        .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.teacherNote.min)
        .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.teacherNote.max)
    )
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.teacherNote.min)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.teacherNotes),
  title: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.title.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.title.max),
  vocabulary: z
    .array(
      z
        .string()
        .trim()
        .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.vocabulary.min)
        .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.vocabulary.max)
    )
    .min(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.vocabulary),
});

export type AiActivityDraft = z.input<typeof aiDraftSchema>;

const aiDraftCompletionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.description.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.description.max)
    .optional(),
  groups: z
    .array(aiGroupSchema)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.groups)
    .optional(),
  learningGoal: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.learningGoal.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.learningGoal.max)
    .optional(),
  pairs: z
    .array(aiPairSchema)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.pairs)
    .optional(),
  questions: z
    .array(aiQuestionSchema)
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.questions)
    .optional(),
  sourceSummary: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceSummary.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceSummary.max)
    .optional(),
  teacherNotes: z
    .array(
      z
        .string()
        .trim()
        .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.teacherNote.min)
        .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.teacherNote.max)
    )
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.teacherNotes)
    .optional(),
  title: z
    .string()
    .trim()
    .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.title.min)
    .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.title.max)
    .optional(),
  vocabulary: z
    .array(
      z
        .string()
        .trim()
        .min(ACTIVITY_AI_DRAFT_FIELD_LIMITS.vocabulary.min)
        .max(ACTIVITY_AI_DRAFT_FIELD_LIMITS.vocabulary.max)
    )
    .max(ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.vocabulary)
    .optional(),
});

type AiActivityDraftCompletion = z.output<typeof aiDraftCompletionSchema>;
type NormalizedAiActivityDraft = z.output<typeof aiDraftSchema>;

export async function generateActivityDraftFromAi(
  input: GenerateActivityDraftInput
): Promise<ActivityDraftResult> {
  const data = generateActivityDraftInputSchema.parse(input);
  const model = WORKERS_AI_MODELS.activityDraft;

  if (!hasWorkersAiCredentials()) {
    return createFallbackActivityDraftResult({
      input: data,
      model,
      notice: m.activity_ai_notice_missing_credentials(),
    });
  }

  const result = await runWorkersAi<{ response?: string }>(model, {
    max_tokens: 1800,
    messages: [
      {
        content:
          'You are an expert classroom activity designer. Return only valid JSON. No markdown, no commentary, no code fence.',
        role: 'system',
      },
      {
        content: buildActivityDraftPrompt(data),
        role: 'user',
      },
    ],
    temperature: 0.35,
  });

  if (!result.response) {
    throw new Error(m.activity_ai_error_empty_response());
  }

  let parsedDraft: {
    draft: NormalizedAiActivityDraft;
    usedLocalCompletion: boolean;
  };
  try {
    parsedDraft = parseAiDraftResponse(result.response, data);
  } catch {
    return createFallbackActivityDraftResult({
      input: data,
      model,
      notice: m.activity_ai_notice_invalid_draft(),
    });
  }

  return {
    ...createActivityDraftResult({
      activity: createActivityInputFromAiDraft({
        draft: parsedDraft.draft,
        input: data,
      }),
      input: data,
    }),
    model,
    notice: parsedDraft.usedLocalCompletion
      ? m.activity_ai_notice_completed_draft()
      : undefined,
    provider: 'workers-ai',
  };
}

export function buildActivityDraftPrompt(input: GenerateActivityDraftInput) {
  const data = generateActivityDraftInputSchema.parse(input);
  const template = getTemplateByType(data.templateType);
  const templateContext = `${template.name}: ${template.bestFor}`;

  return [
    m.activity_ai_prompt_intro(),
    m.activity_ai_prompt_subject({ subject: data.subject }),
    m.activity_ai_prompt_grade_band({ gradeBand: data.gradeBand }),
    m.activity_ai_prompt_language({ language: data.language }),
    m.activity_ai_prompt_difficulty({ difficulty: data.difficulty }),
    buildActivityAiDraftFocusPromptLine(data.draftFocus),
    m.activity_ai_prompt_primary_template({ template: templateContext }),
    m.activity_ai_prompt_template_requirements({
      requirements: buildTemplateRequirementSummary(data.templateType),
    }),
    m.activity_ai_prompt_template_guidance({
      guidance: getActivityTemplateDraftGuidance(data.templateType),
    }),
    m.activity_ai_prompt_target_item_count({
      itemCount: String(data.itemCount),
    }),
    m.activity_ai_prompt_source_notes({ sourceText: data.sourceText }),
    '',
    m.activity_ai_prompt_return_shape(),
    buildActivityDraftPromptJsonExample(),
    '',
    m.activity_ai_prompt_rules_heading(),
    m.activity_ai_prompt_rule_reusable_content(),
    m.activity_ai_prompt_rule_classroom_safe(),
    m.activity_ai_prompt_rule_answer_in_options(),
    m.activity_ai_prompt_rule_explanation(),
    m.activity_ai_prompt_rule_json_only(),
  ].join('\n');
}

function buildActivityDraftPromptJsonExample() {
  return JSON.stringify(
    {
      title: m.activity_ai_prompt_json_title(),
      description: m.activity_ai_prompt_json_description(),
      learningGoal: m.activity_ai_prompt_json_learning_goal(),
      sourceSummary: m.activity_ai_prompt_json_source_summary(),
      vocabulary: [
        m.activity_ai_prompt_json_vocabulary_term_one(),
        m.activity_ai_prompt_json_vocabulary_term_two(),
      ],
      questions: [
        {
          answer: m.activity_ai_prompt_json_answer(),
          explanation: m.activity_ai_prompt_json_explanation(),
          options: [
            m.activity_ai_prompt_json_answer(),
            m.activity_ai_prompt_json_distractor(),
            m.activity_ai_prompt_json_distractor(),
          ],
          prompt: m.activity_ai_prompt_json_question_prompt(),
        },
      ],
      pairs: [
        {
          left: m.activity_ai_prompt_json_pair_left(),
          right: m.activity_ai_prompt_json_pair_right(),
        },
      ],
      groups: [
        {
          items: [
            m.activity_ai_prompt_json_group_item_one(),
            m.activity_ai_prompt_json_group_item_two(),
          ],
          label: m.activity_ai_prompt_json_group_label(),
        },
      ],
      teacherNotes: [m.activity_ai_prompt_json_teacher_note()],
    },
    null,
    2
  );
}

function buildTemplateRequirementSummary(templateType: ActivityTemplateType) {
  const template = getTemplateByType(templateType);
  const requirements = formatTemplateRequirements(template.contentRequirements);

  return formatTemplateRequirementList(requirements);
}

function parseAiDraftResponse(
  response: string,
  input: NormalizedGenerateActivityDraftInput
) {
  const jsonText = extractJsonObject(response);
  const parsed = JSON.parse(jsonText) as unknown;
  return normalizeAiActivityDraft({ draft: parsed, input });
}

function extractJsonObject(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(m.activity_ai_error_parse_response());
  }

  return trimmed.slice(start, end + 1);
}

export function createActivityInputFromAiDraft({
  draft,
  input,
}: {
  draft: unknown;
  input: GenerateActivityDraftInput;
}): CreateActivityInput {
  const data = generateActivityDraftInputSchema.parse(input);
  const { draft: normalizedDraft } = normalizeAiActivityDraft({
    draft,
    input: data,
  });
  const shapedDraft = shapeAiDraftForPrimaryTemplate({
    draft: normalizedDraft,
    input: data,
  });
  const activity = {
    description: shapedDraft.description,
    difficulty: data.difficulty,
    gradeBand: data.gradeBand,
    groupsText: formatEditorGroupRows(shapedDraft.groups),
    language: data.language,
    learningGoal: shapedDraft.learningGoal,
    pairsText: formatEditorPairRows(shapedDraft.pairs),
    questionsText: formatEditorQuestionRows(
      shapedDraft.questions.map(toEditorQuestionInput)
    ),
    sourceSummary: shapedDraft.sourceSummary,
    subject: data.subject,
    teacherNotesText: formatEditorLineList(shapedDraft.teacherNotes),
    templateType: data.templateType,
    title: shapedDraft.title,
    visibility: 'draft',
    vocabularyText: formatEditorInlineList(shapedDraft.vocabulary),
  } satisfies CreateActivityInput;

  return createActivityInputSchema.parse(activity);
}

function toEditorQuestionInput(
  question: NormalizedAiActivityDraft['questions'][number]
) {
  const answer = normalizeQuestionOptionDisplayText(question.answer);

  return {
    ...question,
    answer,
    options: buildQuestionOptionTexts({
      answer,
      options: question.options ?? [],
    }).map((text) => ({ id: text, text })),
  };
}

export function normalizeAiActivityDraft({
  draft,
  input,
}: {
  draft: unknown;
  input: GenerateActivityDraftInput;
}): {
  draft: NormalizedAiActivityDraft;
  usedLocalCompletion: boolean;
} {
  const data = generateActivityDraftInputSchema.parse(input);
  const fallbackDraft = createFallbackAiActivityDraft(data);
  const strictDraft = aiDraftSchema.safeParse(draft);

  if (strictDraft.success) {
    return completeAiActivityDraft({
      draft: strictDraft.data,
      fallbackDraft,
      input: data,
    });
  }

  const completionDraft = aiDraftCompletionSchema.safeParse(draft);

  if (!completionDraft.success) {
    throw new Error(m.activity_ai_error_parse_response());
  }

  const completedDraft = completeAiActivityDraft({
    draft: completionDraft.data,
    fallbackDraft,
    input: data,
  });

  return {
    draft: completedDraft.draft,
    usedLocalCompletion: true,
  };
}

function completeAiActivityDraft({
  draft,
  fallbackDraft,
  input,
}: {
  draft: AiActivityDraftCompletion;
  fallbackDraft: NormalizedAiActivityDraft;
  input: NormalizedGenerateActivityDraftInput;
}) {
  const targetItemCount = Math.max(
    ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min,
    input.itemCount
  );
  const completedQuestions = completeAiDraftList({
    fallback: fallbackDraft.questions,
    getKey: (question) => `${question.prompt}\u0000${question.answer}`,
    max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.questions,
    primary: draft.questions,
    targetMin: targetItemCount,
  });
  const completedPairs = completeAiDraftList({
    fallback: fallbackDraft.pairs,
    getKey: (pair) => `${pair.left}\u0000${pair.right}`,
    max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.pairs,
    primary: draft.pairs,
    targetMin: targetItemCount,
  });
  const completedGroups = completeAiDraftGroups({
    fallback: fallbackDraft.groups,
    input,
    primary: draft.groups,
  });
  const completedVocabulary = completeAiDraftList({
    fallback: fallbackDraft.vocabulary,
    getKey: (value) => value,
    max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.vocabulary,
    primary: draft.vocabulary,
    targetMin: targetItemCount,
  });
  const completedTeacherNotes = completeAiDraftList({
    fallback: fallbackDraft.teacherNotes,
    getKey: (value) => value,
    max: ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.teacherNotes,
    primary: draft.teacherNotes,
    targetMin: 1,
  });
  const completedDraft = {
    description: draft.description ?? fallbackDraft.description,
    groups: completedGroups.items,
    learningGoal: draft.learningGoal ?? fallbackDraft.learningGoal,
    pairs: completedPairs.items,
    questions: completedQuestions.items,
    sourceSummary: draft.sourceSummary ?? fallbackDraft.sourceSummary,
    teacherNotes: completedTeacherNotes.items,
    title: draft.title ?? fallbackDraft.title,
    vocabulary: completedVocabulary.items,
  } satisfies AiActivityDraft;
  const usedLocalCompletion =
    draft.description === undefined ||
    draft.learningGoal === undefined ||
    draft.sourceSummary === undefined ||
    draft.title === undefined ||
    completedGroups.usedLocalCompletion ||
    completedPairs.usedLocalCompletion ||
    completedQuestions.usedLocalCompletion ||
    completedTeacherNotes.usedLocalCompletion ||
    completedVocabulary.usedLocalCompletion;

  return {
    draft: aiDraftSchema.parse(completedDraft),
    usedLocalCompletion,
  };
}

function completeAiDraftList<T>({
  fallback,
  getKey,
  max,
  primary,
  targetMin,
}: {
  fallback: T[];
  getKey: (value: T) => string;
  max: number;
  primary: T[] | undefined;
  targetMin: number;
}) {
  const items: T[] = [];
  const seen = new Set<string>();
  const addItem = (item: T) => {
    const key = normalizeAiDraftCompletionKey(getKey(item));
    if (seen.has(key) || items.length >= max) return false;
    seen.add(key);
    items.push(item);
    return true;
  };

  for (const item of primary ?? []) {
    addItem(item);
  }

  const primaryCount = items.length;

  for (const item of fallback) {
    if (items.length >= targetMin) break;
    addItem(item);
  }

  return {
    items,
    usedLocalCompletion:
      primary === undefined ||
      primary.length !== primaryCount ||
      items.length > primaryCount,
  };
}

function completeAiDraftGroups({
  fallback,
  input,
  primary,
}: {
  fallback: NormalizedAiActivityDraft['groups'];
  input: NormalizedGenerateActivityDraftInput;
  primary: AiActivityDraftCompletion['groups'];
}) {
  const groups: NormalizedAiActivityDraft['groups'] = [];
  const addGroup = (group: NormalizedAiActivityDraft['groups'][number]) => {
    const groupKey = normalizeAiDraftCompletionKey(group.label);
    const existingGroup = groups.find(
      (item) => normalizeAiDraftCompletionKey(item.label) === groupKey
    );
    const targetGroup =
      existingGroup ??
      (groups.length < ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.groups
        ? {
            items: [],
            label: group.label,
          }
        : undefined);

    if (!targetGroup) return false;
    if (!existingGroup) groups.push(targetGroup);

    const previousItemCount = targetGroup.items.length;
    targetGroup.items = uniqueAiDraftCompletionTexts([
      ...targetGroup.items,
      ...group.items,
    ]).slice(0, ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.groupItems);

    return targetGroup.items.length > previousItemCount || !existingGroup;
  };

  for (const group of primary ?? []) {
    addGroup(group);
  }

  const primaryGroupCount = groups.length;
  const primaryItemCount = countAiDraftGroupItems(groups);
  const targetItemCount =
    input.templateType === 'group-sort'
      ? Math.max(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min, input.itemCount)
      : ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min;

  for (const group of fallback) {
    if (
      groups.length >= 2 &&
      countAiDraftGroupItems(groups) >= targetItemCount
    ) {
      break;
    }
    addGroup(group);
  }

  for (const group of fallback) {
    if (countAiDraftGroupItems(groups) >= targetItemCount) break;
    addGroup(group);
  }

  return {
    items: groups,
    usedLocalCompletion:
      primary === undefined ||
      groups.length !== primaryGroupCount ||
      countAiDraftGroupItems(groups) !== primaryItemCount,
  };
}

function countAiDraftGroupItems(groups: NormalizedAiActivityDraft['groups']) {
  return groups.reduce((total, group) => total + group.items.length, 0);
}

function shapeAiDraftForPrimaryTemplate({
  draft,
  input,
}: {
  draft: AiActivityDraft;
  input: NormalizedGenerateActivityDraftInput;
}): AiActivityDraft {
  if (usesQuestionRuntimeItems(input.templateType)) {
    return {
      ...draft,
      questions: draft.questions.slice(0, input.itemCount),
    };
  }

  if (usesPairRuntimeItems(input.templateType)) {
    return {
      ...draft,
      pairs: draft.pairs.slice(0, input.itemCount),
    };
  }

  return {
    ...draft,
    groups: limitAiDraftGroupsToItemCount(draft.groups, input.itemCount),
  };
}

function usesQuestionRuntimeItems(templateType: ActivityTemplateType) {
  return (
    templateType === 'fill-blank' ||
    templateType === 'listening' ||
    templateType === 'open-box' ||
    templateType === 'quiz'
  );
}

function usesPairRuntimeItems(templateType: ActivityTemplateType) {
  return (
    templateType === 'line-match' ||
    templateType === 'match-up' ||
    templateType === 'matching-pairs'
  );
}

function limitAiDraftGroupsToItemCount(
  groups: AiActivityDraft['groups'],
  itemCount: number
) {
  const selectedGroups = groups.slice(0, Math.min(groups.length, itemCount));
  const limitedGroups = selectedGroups.map((group) => ({
    ...group,
    items: [] as string[],
  }));
  let remainingItems = itemCount;

  for (const [index, group] of selectedGroups.entries()) {
    const item = group.items[0];
    if (!item || remainingItems <= 0) continue;

    limitedGroups[index]?.items.push(item);
    remainingItems -= 1;
  }

  let itemIndex = 1;
  while (remainingItems > 0) {
    let addedItem = false;

    for (const [groupIndex, group] of selectedGroups.entries()) {
      const item = group.items[itemIndex];
      if (!item) continue;

      limitedGroups[groupIndex]?.items.push(item);
      remainingItems -= 1;
      addedItem = true;

      if (remainingItems === 0) break;
    }

    if (!addedItem) break;
    itemIndex += 1;
  }

  return limitedGroups.filter((group) => group.items.length > 0);
}

function createActivityDraftResult({
  activity,
  input,
}: {
  activity: CreateActivityInput;
  input: NormalizedGenerateActivityDraftInput;
}) {
  return {
    activity,
    meta: buildActivityDraftMeta({
      activity,
      currentTemplateType: input.templateType,
    }),
  };
}

function createFallbackAiActivityDraft(
  input: NormalizedGenerateActivityDraftInput
): NormalizedAiActivityDraft {
  const activity = createFallbackActivityDraft(input);
  const content = buildActivityContent(activity);

  return aiDraftSchema.parse({
    description: activity.description,
    groups: content.groups.map((group) => ({
      items: group.items,
      label: group.label,
    })),
    learningGoal: activity.learningGoal,
    pairs: content.pairs.map((pair) => ({
      left: pair.left,
      right: pair.right,
    })),
    questions: content.questions.map((question) => ({
      answer: question.answer,
      explanation: question.explanation,
      options: question.options?.map((option) => option.text) ?? [],
      prompt: question.prompt,
    })),
    sourceSummary: activity.sourceSummary,
    teacherNotes: content.teacherNotes,
    title: activity.title,
    vocabulary: content.vocabulary,
  });
}

export function createFallbackActivityDraftResult({
  input,
  model,
  notice,
}: {
  input: GenerateActivityDraftInput;
  model: string;
  notice: string;
}): ActivityDraftResult {
  const data = generateActivityDraftInputSchema.parse(input);

  return {
    ...createActivityDraftResult({
      activity: createFallbackActivityDraft(data),
      input: data,
    }),
    model,
    notice,
    provider: 'fallback',
  };
}

export function createFallbackActivityDraft(
  input: GenerateActivityDraftInput
): CreateActivityInput {
  const data = generateActivityDraftInputSchema.parse(input);
  const locale = getFallbackDraftLocale(data.language);
  const normalizedTerms = buildFallbackActivityDraftTerms({
    input: data,
    locale,
  });
  const options = normalizedTerms.slice(
    0,
    Math.max(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min, data.itemCount)
  );

  const questions = buildFallbackQuestions({
    input: data,
    locale,
    options,
    terms: normalizedTerms.slice(0, data.itemCount),
  });

  const pairs = buildFallbackPairs({
    input: data,
    locale,
    terms: normalizedTerms.slice(0, data.itemCount),
  });

  const groups = buildFallbackGroups(
    normalizedTerms,
    data.templateType,
    data.subject,
    locale
  );

  const sourceSummary = summarizeSource(data.sourceText);
  const focusLabel = formatActivityAiDraftFocusLabelForLocale(
    data.draftFocus,
    locale
  );
  const activity = {
    description: m.activity_ai_fallback_description(
      { focus: focusLabel, subject: data.subject },
      { locale }
    ),
    difficulty: data.difficulty,
    gradeBand: data.gradeBand,
    groupsText: groups,
    language: data.language,
    learningGoal: m.activity_ai_fallback_learning_goal(
      { subject: data.subject },
      { locale }
    ),
    pairsText: formatEditorLineList(pairs),
    questionsText: formatEditorLineList(questions),
    sourceSummary,
    subject: data.subject,
    teacherNotesText: formatEditorLineList([
      m.activity_ai_fallback_teacher_note_focus(
        { focus: focusLabel },
        { locale }
      ),
      m.activity_ai_fallback_teacher_note_review(
        { gradeBand: data.gradeBand },
        { locale }
      ),
      m.activity_ai_fallback_teacher_note_remix({}, { locale }),
    ]),
    templateType: data.templateType,
    title: createFallbackTitle(data, normalizedTerms[0], locale),
    visibility: 'draft',
    vocabularyText: formatEditorInlineList(normalizedTerms),
  } satisfies CreateActivityInput;

  return createActivityInputSchema.parse(activity);
}

function formatActivityAiDraftFocusLabelForLocale(
  draftFocus: ActivityAiDraftFocus,
  locale: Locale
) {
  switch (draftFocus) {
    case 'balanced':
      return m.activity_ai_focus_balanced_label({}, { locale });
    case 'listening-script':
      return m.activity_ai_focus_listening_script_label({}, { locale });
    case 'remix-ready':
      return m.activity_ai_focus_remix_ready_label({}, { locale });
    case 'worksheet-practice':
      return m.activity_ai_focus_worksheet_practice_label({}, { locale });
  }
}

function buildFallbackQuestions({
  input,
  locale,
  options,
  terms,
}: {
  input: NormalizedGenerateActivityDraftInput;
  locale: Locale;
  options: string[];
  terms: string[];
}) {
  return terms.map((term, index) => {
    const explanation = m.activity_ai_fallback_question_explanation(
      { term },
      { locale }
    );
    const question = {
      answer: term,
      explanation,
      options: buildQuestionOptionTexts({
        answer: term,
        options,
      }).map((text) => ({ id: text, text })),
      prompt: '',
    };

    switch (input.templateType) {
      case 'fill-blank':
        return formatEditorQuestionRow({
          ...question,
          prompt: buildFallbackFillBlankPrompt({ input, locale, term }),
        });
      case 'listening':
        return formatEditorQuestionRow({
          ...question,
          explanation: m.activity_ai_fallback_listening_explanation(
            { term },
            { locale }
          ),
          prompt: m.activity_ai_fallback_listening_prompt(
            { index: index + 1, subject: input.subject, term },
            { locale }
          ),
        });
      case 'open-box':
        return formatEditorQuestionRow({
          ...question,
          explanation: m.activity_ai_fallback_open_box_explanation(
            { explanation, term },
            { locale }
          ),
          options: [],
          prompt: m.activity_ai_fallback_open_box_prompt(
            { subject: input.subject },
            { locale }
          ),
        });
      default:
        return formatEditorQuestionRow({
          ...question,
          prompt: buildFallbackQuizPrompt({ input, locale, term }),
        });
    }
  });
}

function buildFallbackQuizPrompt({
  input,
  locale,
  term,
}: {
  input: NormalizedGenerateActivityDraftInput;
  locale: Locale;
  term: string;
}) {
  return m.activity_ai_fallback_quiz_prompt(
    {
      clue: buildFallbackTermClue(term, locale),
      subject: input.subject,
    },
    { locale }
  );
}

function buildFallbackFillBlankPrompt({
  input,
  locale,
  term,
}: {
  input: NormalizedGenerateActivityDraftInput;
  locale: Locale;
  term: string;
}) {
  return m.activity_ai_fallback_fill_blank_prompt(
    {
      clue: buildFallbackTermClue(term, locale),
      subject: input.subject,
    },
    { locale }
  );
}

function buildFallbackTermClue(term: string, locale: Locale) {
  const characterCount = Array.from(term).length;
  const characterCountLabel =
    characterCount === 1
      ? m.activity_ai_fallback_character_count_one(
          { count: characterCount },
          { locale }
        )
      : m.activity_ai_fallback_character_count_many(
          { count: characterCount },
          { locale }
        );
  const firstCharacter = Array.from(term.trim()).find(Boolean) ?? term;

  if (characterCount <= 1) {
    return m.activity_ai_fallback_term_clue_single(
      { characterCountLabel },
      { locale }
    );
  }

  return m.activity_ai_fallback_term_clue_prefix(
    {
      characterCountLabel,
      firstCharacter: JSON.stringify(firstCharacter),
    },
    { locale }
  );
}

function buildFallbackPairs({
  input,
  locale,
  terms,
}: {
  input: NormalizedGenerateActivityDraftInput;
  locale: Locale;
  terms: string[];
}) {
  return terms.map((term, index) => {
    const characterCount = Array.from(term).length;
    const clue = m.activity_ai_fallback_pair_clue(
      {
        count: characterCount,
        index: index + 1,
        subject: input.subject,
      },
      { locale }
    );
    return `${term} | ${clue}`;
  });
}

export function buildFallbackActivityDraftTerms({
  input,
  locale,
}: {
  input: GenerateActivityDraftInput;
  locale: Locale;
}) {
  const data = generateActivityDraftInputSchema.parse(input);
  const sourceTerms = extractActivityDraftSourceTerms({
    sourceText: data.sourceText,
    subject: data.subject,
  }).slice(0, data.itemCount);

  return sourceTerms.length >= ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.min
    ? sourceTerms
    : fallbackTerms(data, locale);
}

export function extractActivityDraftSourceTerms({
  sourceText,
  subject,
}: {
  sourceText: string;
  subject: string;
}) {
  const phrases = sourceText
    .split(/[\n,;|，。；、:：!?！？()[\]{}]+/u)
    .map((value) => value.trim())
    .filter(
      (value) =>
        value.length >= ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS.minPhraseLength &&
        value.length <= ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS.maxPhraseLength
    );
  const words = sourceText
    .split(/\s+/u)
    .map((value) => value.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(
      (value) =>
        value.length >= ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS.minWordLength &&
        value.length <= ACTIVITY_AI_DRAFT_SOURCE_TERM_LIMITS.maxWordLength
    );

  return unique([...phrases, ...words, subject]).slice(
    0,
    ACTIVITY_AI_DRAFT_COMPLETION_LIMITS.vocabulary
  );
}

function fallbackTerms(
  input: NormalizedGenerateActivityDraftInput,
  locale: Locale
) {
  return unique([
    ...extractActivityDraftSourceTerms({
      sourceText: input.sourceText,
      subject: input.subject,
    }),
    m.activity_ai_fallback_term_key_word({}, { locale }),
    m.activity_ai_fallback_term_example({}, { locale }),
    m.activity_ai_fallback_term_meaning({}, { locale }),
    m.activity_ai_fallback_term_category({}, { locale }),
    m.activity_ai_fallback_term_review({}, { locale }),
  ]).slice(
    0,
    Math.max(ACTIVITY_AI_DRAFT_ITEM_COUNT_RANGE.default, input.itemCount)
  );
}

function buildFallbackGroups(
  terms: string[],
  templateType: ActivityTemplateType,
  subject: string,
  locale: Locale
) {
  const midpoint = Math.max(1, Math.ceil(terms.length / 2));
  const first = terms.slice(0, midpoint);
  const second = terms.slice(midpoint);
  const [firstLabel, secondLabel] =
    templateType === 'group-sort'
      ? buildFallbackGroupSortLabels(subject, locale)
      : [
          m.activity_ai_fallback_group_practice({}, { locale }),
          m.activity_ai_fallback_group_review({}, { locale }),
        ];

  return formatEditorLineList([
    formatEditorGroupRow({ items: first, label: firstLabel }),
    formatEditorGroupRow({
      items: second.length > 0 ? second : [subject],
      label: secondLabel,
    }),
  ]);
}

function buildFallbackGroupSortLabels(subject: string, locale: Locale) {
  const normalizedSubject =
    subject.trim() || m.activity_ai_fallback_default_subject({}, { locale });
  return [
    m.activity_ai_fallback_group_review_focus({}, { locale }),
    m.activity_ai_fallback_group_subject_examples(
      { subject: normalizedSubject },
      { locale }
    ),
  ] as const;
}

function createFallbackTitle(
  input: NormalizedGenerateActivityDraftInput,
  firstTerm: string | undefined,
  locale: Locale
) {
  const topic =
    firstTerm && firstTerm !== input.subject ? firstTerm : input.subject;
  return m
    .activity_ai_fallback_title({ topic }, { locale })
    .slice(0, ACTIVITY_AI_DRAFT_FIELD_LIMITS.title.max);
}

function getFallbackDraftLocale(language: string): Locale {
  const normalizedLanguage = language.trim().toLocaleLowerCase();
  return normalizedLanguage.startsWith('zh') ||
    normalizedLanguage.includes('chinese') ||
    normalizedLanguage.includes('中文')
    ? 'zh'
    : 'en';
}

function summarizeSource(sourceText: string) {
  const compact = sourceText.replace(/\s+/g, ' ').trim();
  const maxLength = ACTIVITY_AI_DRAFT_FIELD_LIMITS.sourceSummaryFallback.max;

  return compact.length > maxLength
    ? `${compact.slice(0, maxLength - 3)}...`
    : compact;
}

function unique(values: string[]) {
  return uniqueAiDraftCompletionTexts(values);
}

function uniqueAiDraftCompletionTexts(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;

    const key = normalizeAiDraftCompletionKey(trimmed);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

function normalizeAiDraftCompletionKey(value: string) {
  return value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}
