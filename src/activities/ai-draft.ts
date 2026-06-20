import { activityTemplates } from '@/activities/catalog';
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
import { z } from 'zod';

export const generateActivityDraftInputSchema = z.object({
  difficulty: activityDifficultySchema.default('starter'),
  gradeBand: z.string().trim().min(1).max(80).default('Primary'),
  itemCount: z.number().int().min(3).max(10).default(5),
  language: z.string().trim().min(2).max(20).default('en'),
  sourceText: z
    .string()
    .trim()
    .min(8, 'Add a lesson topic, vocabulary list, or source notes.')
    .max(2000, 'Source notes are too long. Keep them under 2000 characters.'),
  subject: z.string().trim().min(1).max(80).default('English'),
  templateType: activityTemplateTypeSchema.default('quiz'),
});

export type GenerateActivityDraftInput = z.infer<
  typeof generateActivityDraftInputSchema
>;

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

type AiActivityDraft = z.infer<typeof aiDraftSchema>;

export async function generateActivityDraftFromAi(
  input: GenerateActivityDraftInput
): Promise<ActivityDraftResult> {
  const data = generateActivityDraftInputSchema.parse(input);
  const model = WORKERS_AI_MODELS.activityDraft;

  if (!hasWorkersAiCredentials()) {
    return createFallbackActivityDraftResult({
      input: data,
      model,
      notice:
        'Workers AI credentials are not configured, so a local deterministic draft was used.',
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
    throw new Error('Activity draft generation returned an empty response.');
  }

  let draft: AiActivityDraft;
  try {
    draft = parseAiDraftResponse(result.response);
  } catch {
    return createFallbackActivityDraftResult({
      input: data,
      model,
      notice:
        'Workers AI returned an invalid draft, so a local deterministic draft was used.',
    });
  }

  return {
    ...createActivityDraftResult({
      activity: toCreateActivityInput(draft, data),
      input: data,
    }),
    model,
    provider: 'workers-ai',
  };
}

export function buildActivityDraftPrompt(input: GenerateActivityDraftInput) {
  const template = activityTemplates.find(
    (item) => item.type === input.templateType
  );
  const templateContext = template
    ? `${template.name}: ${template.bestFor}`
    : input.templateType;

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
  const template = activityTemplates.find((item) => item.type === templateType);
  const requirements = template?.contentRequirements.map(
    formatTemplateRequirement
  );

  if (!requirements?.length) {
    return 'questions, match pairs, or groups depending on the selected template';
  }

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
    throw new Error('Could not parse JSON from the activity draft response.');
  }

  return trimmed.slice(start, end + 1);
}

function toCreateActivityInput(
  draft: AiActivityDraft,
  input: GenerateActivityDraftInput
): CreateActivityInput {
  const activity = {
    description: draft.description,
    difficulty: input.difficulty,
    gradeBand: input.gradeBand,
    groupsText: draft.groups
      .map((group) => `${group.label} | ${group.items.join(', ')}`)
      .join('\n'),
    language: input.language,
    learningGoal: draft.learningGoal,
    pairsText: draft.pairs
      .map((pair) => `${pair.left} | ${pair.right}`)
      .join('\n'),
    questionsText: draft.questions
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
    sourceSummary: draft.sourceSummary,
    subject: input.subject,
    teacherNotesText: draft.teacherNotes.join('\n'),
    templateType: input.templateType,
    title: draft.title,
    visibility: 'draft',
    vocabularyText: draft.vocabulary.join(', '),
  } satisfies CreateActivityInput;

  return createActivityInputSchema.parse(activity);
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
  const terms = extractTerms(input.sourceText, input.subject).slice(
    0,
    input.itemCount
  );
  const normalizedTerms = terms.length >= 3 ? terms : fallbackTerms(input);
  const options = normalizedTerms.slice(0, Math.max(3, input.itemCount));

  const questions = buildFallbackQuestions({
    input,
    options,
    terms: normalizedTerms.slice(0, input.itemCount),
  });

  const pairs = normalizedTerms
    .slice(0, input.itemCount)
    .map((term) => `${term} | key idea from ${input.subject}`);

  const groups = buildFallbackGroups(
    normalizedTerms,
    input.templateType,
    input.subject
  );

  const sourceSummary = summarizeSource(input.sourceText);
  const activity = {
    description: `Teacher-ready ${input.subject} activity generated from lesson notes.`,
    difficulty: input.difficulty,
    gradeBand: input.gradeBand,
    groupsText: groups,
    language: input.language,
    learningGoal: `Students can recognize and use key ${input.subject} ideas from the lesson.`,
    pairsText: pairs.join('\n'),
    questionsText: questions.join('\n'),
    sourceSummary,
    subject: input.subject,
    teacherNotesText: [
      `Review the draft before assigning it to ${input.gradeBand} learners.`,
      'Switch templates after saving to reuse the same content in another game mode.',
    ].join('\n'),
    templateType: input.templateType,
    title: createFallbackTitle(input, normalizedTerms[0]),
    visibility: 'draft',
    vocabularyText: normalizedTerms.join(', '),
  } satisfies CreateActivityInput;

  return createActivityInputSchema.parse(activity);
}

function buildFallbackQuestions({
  input,
  options,
  terms,
}: {
  input: GenerateActivityDraftInput;
  options: string[];
  terms: string[];
}) {
  return terms.map((term) => {
    const choices = buildQuestionOptionTexts({
      answer: term,
      options,
    }).join(', ');
    const explanation = `${term} is one of the target items from this lesson.`;

    switch (input.templateType) {
      case 'fill-blank':
        return `In this ${input.subject} lesson, remember ___. | ${term} | ${choices} | ${explanation}`;
      case 'listening':
        return `Listen to this sentence: ${term} is important in ${input.subject}. | ${term} | ${choices} | The spoken sentence names ${term}.`;
      case 'open-box':
        return `Open the box and answer with this ${input.subject} idea: ${term}. | ${term} | | ${explanation}`;
      default:
        return `Which item belongs in this lesson set: ${term}? | ${term} | ${choices} | ${explanation}`;
    }
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

function fallbackTerms(input: GenerateActivityDraftInput) {
  return unique([
    ...extractTerms(input.sourceText, input.subject),
    'key word',
    'example',
    'meaning',
    'category',
    'review',
  ]).slice(0, Math.max(5, input.itemCount));
}

function buildFallbackGroups(
  terms: string[],
  templateType: ActivityTemplateType,
  subject: string
) {
  const midpoint = Math.max(1, Math.ceil(terms.length / 2));
  const first = terms.slice(0, midpoint);
  const second = terms.slice(midpoint);
  const firstLabel = templateType === 'group-sort' ? 'Core ideas' : 'Practice';
  const secondLabel = templateType === 'group-sort' ? 'Examples' : 'Review';

  return [
    `${firstLabel} | ${first.join(', ')}`,
    `${secondLabel} | ${(second.length > 0 ? second : [subject]).join(', ')}`,
  ].join('\n');
}

function createFallbackTitle(
  input: GenerateActivityDraftInput,
  firstTerm?: string
) {
  const topic =
    firstTerm && firstTerm !== input.subject ? firstTerm : input.subject;
  return `${topic} quick practice`.slice(0, 90);
}

function summarizeSource(sourceText: string) {
  const compact = sourceText.replace(/\s+/g, ' ').trim();
  return compact.length > 280 ? `${compact.slice(0, 277)}...` : compact;
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
