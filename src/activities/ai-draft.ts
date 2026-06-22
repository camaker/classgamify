import { getTemplateByType } from '@/activities/catalog';
import {
  buildActivityDraftMeta,
  type ActivityDraftMeta,
} from '@/activities/draft-meta';
import type { ActivityTemplateType } from '@/activities/types';
import {
  activityDifficultySchema,
  activityTemplateTypeSchema,
  createActivityInputSchema,
  type CreateActivityInput,
} from '@/activities/validation';
import { buildQuestionOptionTexts } from '@/activities/question-options';
import {
  formatTemplateRequirement,
  formatTemplateRequirementList,
  getActivityTemplateDraftGuidance,
} from '@/activities/template-remix';
import { hasWorkersAiCredentials, runWorkersAi } from '@/ai/workers';
import { WORKERS_AI_MODELS } from '@/config/ai-models';
import { m } from '@/locale/paraglide/messages';
import type { Locale } from '@/locale/paraglide/runtime';
import { z } from 'zod';

export const generateActivityDraftInputSchema = z.object({
  difficulty: activityDifficultySchema.default('starter'),
  gradeBand: z.string().trim().min(1).max(80).default('Primary'),
  itemCount: z.number().int().min(3).max(10).default(5),
  language: z.string().trim().min(2).max(20).default('en'),
  sourceText: z
    .string()
    .trim()
    .min(8, m.activity_ai_source_min_error())
    .max(2000, m.activity_ai_source_max_error()),
  subject: z.string().trim().min(1).max(80).default('English'),
  templateType: activityTemplateTypeSchema.default('quiz'),
});

export type GenerateActivityDraftInput = z.infer<
  typeof generateActivityDraftInputSchema
>;

export function buildGenerateActivityDraftInputFromEditor({
  current,
  itemCount,
  sourceText,
}: {
  current: CreateActivityInput;
  itemCount: number;
  sourceText: string;
}): GenerateActivityDraftInput {
  return generateActivityDraftInputSchema.parse({
    difficulty: current.difficulty,
    gradeBand: current.gradeBand || 'Primary',
    itemCount,
    language: current.language || 'en',
    sourceText,
    subject: current.subject || 'English',
    templateType: current.templateType,
  });
}

export type ActivityDraftResult = {
  activity: CreateActivityInput;
  meta: ActivityDraftMeta;
  model: string;
  notice?: string;
  provider: 'fallback' | 'workers-ai';
};

const aiQuestionSchema = z.object({
  answer: z.string().trim().min(1).max(120),
  explanation: z.string().trim().min(4).max(240).optional(),
  options: z.array(z.string().trim().min(1).max(120)).min(3).max(5),
  prompt: z.string().trim().min(4).max(240),
});

const aiPairSchema = z.object({
  left: z.string().trim().min(1).max(100),
  right: z.string().trim().min(1).max(140),
});

const aiGroupSchema = z.object({
  items: z.array(z.string().trim().min(1).max(80)).min(1).max(8),
  label: z.string().trim().min(1).max(80),
});

const aiDraftSchema = z.object({
  description: z.string().trim().min(8).max(220),
  groups: z.array(aiGroupSchema).min(2).max(4),
  learningGoal: z.string().trim().min(8).max(260),
  pairs: z.array(aiPairSchema).min(3).max(10),
  questions: z.array(aiQuestionSchema).min(3).max(10),
  sourceSummary: z.string().trim().min(8).max(300),
  teacherNotes: z.array(z.string().trim().min(1).max(160)).min(1).max(5),
  title: z.string().trim().min(3).max(90),
  vocabulary: z.array(z.string().trim().min(1).max(80)).min(3).max(16),
});

export type AiActivityDraft = z.infer<typeof aiDraftSchema>;

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

  let draft: AiActivityDraft;
  try {
    draft = parseAiDraftResponse(result.response);
  } catch {
    return createFallbackActivityDraftResult({
      input: data,
      model,
      notice: m.activity_ai_notice_invalid_draft(),
    });
  }

  return {
    ...createActivityDraftResult({
      activity: createActivityInputFromAiDraft({ draft, input: data }),
      input: data,
    }),
    model,
    provider: 'workers-ai',
  };
}

export function buildActivityDraftPrompt(input: GenerateActivityDraftInput) {
  const template = getTemplateByType(input.templateType);
  const templateContext = `${template.name}: ${template.bestFor}`;

  return [
    `Create a reusable ClassGamify classroom activity draft.`,
    `Subject: ${input.subject}`,
    `Grade band: ${input.gradeBand}`,
    `Language: ${input.language}`,
    `Difficulty: ${input.difficulty}`,
    `Primary template: ${templateContext}`,
    `Template requirements: ${buildTemplateRequirementSummary(input.templateType)}`,
    `Template guidance: ${getActivityTemplateDraftGuidance(input.templateType)}`,
    `Target item count: ${input.itemCount}`,
    `Source notes: ${input.sourceText}`,
    '',
    'Return exactly this JSON object shape:',
    '{',
    '  "title": "short teacher-facing title",',
    '  "description": "one sentence summary",',
    '  "learningGoal": "students can ...",',
    '  "sourceSummary": "short summary of the source",',
    '  "vocabulary": ["term one", "term two"],',
    '  "questions": [',
    '    { "prompt": "question or fill-blank prompt", "answer": "correct answer", "options": ["correct answer", "distractor", "distractor"], "explanation": "one short answer explanation" }',
    '  ],',
    '  "pairs": [{ "left": "term", "right": "meaning or match" }],',
    '  "groups": [{ "label": "category", "items": ["item one", "item two"] }],',
    '  "teacherNotes": ["short usage note"]',
    '}',
    '',
    'Rules:',
    '- Include enough questions, pairs, and groups for the selected template and for reuse in other templates.',
    '- Keep wording age-appropriate and classroom-safe.',
    '- Every question answer must appear in its options array.',
    '- Every question should include a brief teacher-approved explanation.',
    '- Return JSON only.',
  ].join('\n');
}

function buildTemplateRequirementSummary(templateType: ActivityTemplateType) {
  const template = getTemplateByType(templateType);
  const requirements = template.contentRequirements.map(
    formatTemplateRequirement
  );

  return formatTemplateRequirementList(requirements);
}

function parseAiDraftResponse(response: string): AiActivityDraft {
  const jsonText = extractJsonObject(response);
  const parsed = JSON.parse(jsonText) as unknown;
  return aiDraftSchema.parse(parsed);
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
  draft: AiActivityDraft;
  input: GenerateActivityDraftInput;
}): CreateActivityInput {
  const shapedDraft = shapeAiDraftForPrimaryTemplate({ draft, input });
  const activity = {
    description: shapedDraft.description,
    difficulty: input.difficulty,
    gradeBand: input.gradeBand,
    groupsText: shapedDraft.groups
      .map((group) => `${group.label} | ${group.items.join(', ')}`)
      .join('\n'),
    language: input.language,
    learningGoal: shapedDraft.learningGoal,
    pairsText: shapedDraft.pairs
      .map((pair) => `${pair.left} | ${pair.right}`)
      .join('\n'),
    questionsText: shapedDraft.questions
      .map((question) => {
        const options = buildQuestionOptionTexts({
          answer: question.answer,
          options: question.options,
        });
        return [
          question.prompt,
          question.answer,
          options.join(', '),
          question.explanation,
        ]
          .filter(Boolean)
          .join(' | ');
      })
      .join('\n'),
    sourceSummary: shapedDraft.sourceSummary,
    subject: input.subject,
    teacherNotesText: shapedDraft.teacherNotes.join('\n'),
    templateType: input.templateType,
    title: shapedDraft.title,
    visibility: 'draft',
    vocabularyText: shapedDraft.vocabulary.join(', '),
  } satisfies CreateActivityInput;

  return createActivityInputSchema.parse(activity);
}

function shapeAiDraftForPrimaryTemplate({
  draft,
  input,
}: {
  draft: AiActivityDraft;
  input: GenerateActivityDraftInput;
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
  input: GenerateActivityDraftInput;
}) {
  return {
    activity,
    meta: buildActivityDraftMeta({
      activity,
      currentTemplateType: input.templateType,
    }),
  };
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
  return {
    ...createActivityDraftResult({
      activity: createFallbackActivityDraft(input),
      input,
    }),
    model,
    notice,
    provider: 'fallback',
  };
}

export function createFallbackActivityDraft(
  input: GenerateActivityDraftInput
): CreateActivityInput {
  const locale = getFallbackDraftLocale(input.language);
  const terms = extractTerms(input.sourceText, input.subject).slice(
    0,
    input.itemCount
  );
  const normalizedTerms =
    terms.length >= 3 ? terms : fallbackTerms(input, locale);
  const options = normalizedTerms.slice(0, Math.max(3, input.itemCount));

  const questions = buildFallbackQuestions({
    input,
    locale,
    options,
    terms: normalizedTerms.slice(0, input.itemCount),
  });

  const pairs = buildFallbackPairs({
    input,
    locale,
    terms: normalizedTerms.slice(0, input.itemCount),
  });

  const groups = buildFallbackGroups(
    normalizedTerms,
    input.templateType,
    input.subject,
    locale
  );

  const sourceSummary = summarizeSource(input.sourceText);
  const activity = {
    description: m.activity_ai_fallback_description(
      { subject: input.subject },
      { locale }
    ),
    difficulty: input.difficulty,
    gradeBand: input.gradeBand,
    groupsText: groups,
    language: input.language,
    learningGoal: m.activity_ai_fallback_learning_goal(
      { subject: input.subject },
      { locale }
    ),
    pairsText: pairs.join('\n'),
    questionsText: questions.join('\n'),
    sourceSummary,
    subject: input.subject,
    teacherNotesText: [
      m.activity_ai_fallback_teacher_note_review(
        { gradeBand: input.gradeBand },
        { locale }
      ),
      m.activity_ai_fallback_teacher_note_remix({}, { locale }),
    ].join('\n'),
    templateType: input.templateType,
    title: createFallbackTitle(input, normalizedTerms[0], locale),
    visibility: 'draft',
    vocabularyText: normalizedTerms.join(', '),
  } satisfies CreateActivityInput;

  return createActivityInputSchema.parse(activity);
}

function buildFallbackQuestions({
  input,
  locale,
  options,
  terms,
}: {
  input: GenerateActivityDraftInput;
  locale: Locale;
  options: string[];
  terms: string[];
}) {
  return terms.map((term, index) => {
    const choices = buildQuestionOptionTexts({
      answer: term,
      options,
    }).join(', ');
    const explanation = m.activity_ai_fallback_question_explanation(
      { term },
      { locale }
    );

    switch (input.templateType) {
      case 'fill-blank':
        return `${buildFallbackFillBlankPrompt({ input, locale, term })} | ${term} | ${choices} | ${explanation}`;
      case 'listening':
        return `${m.activity_ai_fallback_listening_prompt(
          { index: index + 1, subject: input.subject, term },
          { locale }
        )} | ${term} | ${choices} | ${m.activity_ai_fallback_listening_explanation(
          { term },
          { locale }
        )}`;
      case 'open-box':
        return `${m.activity_ai_fallback_open_box_prompt(
          { subject: input.subject },
          { locale }
        )} | ${term} | | ${m.activity_ai_fallback_open_box_explanation(
          { explanation, term },
          { locale }
        )}`;
      default:
        return `${buildFallbackQuizPrompt({ input, locale, term })} | ${term} | ${choices} | ${explanation}`;
    }
  });
}

function buildFallbackQuizPrompt({
  input,
  locale,
  term,
}: {
  input: GenerateActivityDraftInput;
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
  input: GenerateActivityDraftInput;
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
  input: GenerateActivityDraftInput;
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

function extractTerms(sourceText: string, subject: string) {
  const phrases = sourceText
    .split(/[\n,;|，。；、:：!?！？()[\]{}]+/u)
    .map((value) => value.trim())
    .filter((value) => value.length >= 2 && value.length <= 48);
  const words = sourceText
    .split(/\s+/u)
    .map((value) => value.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((value) => value.length >= 3 && value.length <= 32);

  return unique([...phrases, ...words, subject]).slice(0, 16);
}

function fallbackTerms(input: GenerateActivityDraftInput, locale: Locale) {
  return unique([
    ...extractTerms(input.sourceText, input.subject),
    m.activity_ai_fallback_term_key_word({}, { locale }),
    m.activity_ai_fallback_term_example({}, { locale }),
    m.activity_ai_fallback_term_meaning({}, { locale }),
    m.activity_ai_fallback_term_category({}, { locale }),
    m.activity_ai_fallback_term_review({}, { locale }),
  ]).slice(0, Math.max(5, input.itemCount));
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

  return [
    `${firstLabel} | ${first.join(', ')}`,
    `${secondLabel} | ${(second.length > 0 ? second : [subject]).join(', ')}`,
  ].join('\n');
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
  input: GenerateActivityDraftInput,
  firstTerm: string | undefined,
  locale: Locale
) {
  const topic =
    firstTerm && firstTerm !== input.subject ? firstTerm : input.subject;
  return m.activity_ai_fallback_title({ topic }, { locale }).slice(0, 90);
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
  return compact.length > 280 ? `${compact.slice(0, 277)}...` : compact;
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
