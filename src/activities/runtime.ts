import { matchAnswer } from '@/activities/answer-matching';
import { buildQuestionChoices } from '@/activities/distractors';
import {
  hasRuntimeDisplayText,
  normalizeRuntimeDisplayText,
} from '@/activities/runtime-display';
import { makeActivityStableId } from '@/activities/stable-id';
import { normalizeAttemptDurationSeconds } from '@/attempts/duration';
import type {
  ActivityContent,
  ActivityTemplateType,
  AttemptAnswer,
  AttemptResult,
} from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

export type RuntimeItem =
  | {
      answer: string;
      choices?: string[];
      explanation?: string;
      id: string;
      kind: 'question';
      prompt: string;
    }
  | {
      answer: string;
      choices: string[];
      id: string;
      kind: 'pair';
      prompt: string;
    }
  | {
      answer: string;
      choices: string[];
      id: string;
      kind: 'group-item';
      prompt: string;
    };

export type RuntimeItemKind = RuntimeItem['kind'];

type RuntimeEvaluation = {
  answers: AttemptAnswer[];
  result: AttemptResult;
};

export type ActivityTemplateRunnerKind =
  | 'choice-list'
  | 'fill-blank'
  | 'group-sort'
  | 'line-match'
  | 'listening'
  | 'matching-pairs'
  | 'open-box';

export function getActivityTemplateRunnerKind(
  templateType: ActivityTemplateType
): ActivityTemplateRunnerKind {
  switch (templateType) {
    case 'fill-blank':
      return 'fill-blank';
    case 'group-sort':
      return 'group-sort';
    case 'line-match':
      return 'line-match';
    case 'listening':
      return 'listening';
    case 'matching-pairs':
      return 'matching-pairs';
    case 'open-box':
      return 'open-box';
    case 'match-up':
    case 'quiz':
      return 'choice-list';
  }
}

export function formatRuntimeItemPrompt(
  item: Pick<RuntimeItem, 'kind' | 'prompt'>
) {
  if (item.kind === 'pair') {
    return m.activity_runtime_prompt_pair({ prompt: item.prompt });
  }

  if (item.kind === 'group-item') {
    return m.activity_runtime_prompt_group_item({ prompt: item.prompt });
  }

  return item.prompt;
}

export function formatRuntimeItemKindLabel(item: Pick<RuntimeItem, 'kind'>) {
  if (item.kind === 'group-item') {
    return m.activity_runtime_kind_group_item();
  }

  if (item.kind === 'pair') {
    return m.activity_runtime_kind_pair();
  }

  return m.activity_runtime_kind_question();
}

export function getRuntimeItems(
  templateType: ActivityTemplateType,
  content: ActivityContent
): RuntimeItem[] {
  switch (templateType) {
    case 'line-match':
    case 'match-up':
    case 'matching-pairs': {
      const pairs = content.pairs.filter(hasRuntimePairContent);
      const choices = pairs.map((pair) => pair.right);
      return pairs.map((pair) => ({
        answer: pair.right,
        choices,
        id: pair.id,
        kind: 'pair',
        prompt: pair.left,
      }));
    }
    case 'group-sort': {
      return buildGroupSortRuntimeItems(content);
    }
    case 'fill-blank':
    case 'listening':
    case 'open-box':
      return content.questions
        .filter(hasRuntimeQuestionContent)
        .map((question) => ({
          answer: question.answer,
          choices: question.options?.map((option) => option.text),
          explanation: question.explanation,
          id: question.id,
          kind: 'question',
          prompt: question.prompt,
        }));
    case 'quiz':
      return content.questions
        .filter(hasRuntimeQuestionContent)
        .map((question) => ({
          answer: question.answer,
          choices: buildQuestionChoices({ content, question }),
          explanation: question.explanation,
          id: question.id,
          kind: 'question',
          prompt: question.prompt,
        }));
  }
}

function hasRuntimePairContent({
  left,
  right,
}: {
  left: string;
  right: string;
}) {
  return hasRuntimeDisplayText(left) && hasRuntimeDisplayText(right);
}

function hasRuntimeQuestionContent({
  answer,
  prompt,
}: {
  answer: string;
  prompt: string;
}) {
  return hasRuntimeDisplayText(prompt) && hasRuntimeDisplayText(answer);
}

export function evaluateRuntimeAnswers({
  answers,
  content,
  durationSeconds,
  templateType,
}: {
  answers: Array<{ answer: string; itemId: string }>;
  content: ActivityContent;
  durationSeconds?: number;
  templateType: ActivityTemplateType;
}): RuntimeEvaluation {
  const runtimeItems = getRuntimeItems(templateType, content);
  const answerMap = new Map(
    answers.map((answer) => [
      answer.itemId,
      normalizeRuntimeDisplayText(answer.answer),
    ])
  );
  const scoredAnswers = runtimeItems.map((item) => {
    const submitted = answerMap.get(item.id) ?? '';
    const match = matchAnswer({
      expectedAnswer: item.answer,
      submittedAnswer: submitted,
    });
    return {
      answer: submitted,
      correct: match.correct,
      itemId: item.id,
    };
  });
  const correctItemCount = scoredAnswers.filter(
    (answer) => answer.correct
  ).length;
  const totalPoints = runtimeItems.length;
  const earnedPoints = correctItemCount;
  const accuracy =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const normalizedDurationSeconds = normalizeAttemptDurationSeconds({
    durationSeconds,
  });

  return {
    answers: scoredAnswers,
    result: {
      accuracy,
      completedItemCount: countSubmittedRuntimeAnswers(scoredAnswers),
      correctItemCount,
      durationSeconds: normalizedDurationSeconds,
      earnedPoints,
      totalPoints,
    },
  };
}

function countSubmittedRuntimeAnswers(answers: AttemptAnswer[]) {
  return answers.filter((answer) => hasRuntimeDisplayText(answer.answer))
    .length;
}

function buildGroupSortRuntimeItems(content: ActivityContent): RuntimeItem[] {
  const groups = content.groups.filter(hasRuntimeGroupContent);
  const choices = groups.map((group) => group.label);
  const candidates = groups.flatMap((group) =>
    group.items.filter(hasRuntimeDisplayText).map((item) => ({
      answer: group.label,
      baseId: buildGroupItemRuntimeBaseId({
        groupId: group.id,
        item,
      }),
      choices,
      item,
    }))
  );
  const baseIdCounts = countCandidateBaseIds(candidates);
  const seenBaseIds = new Map<string, number>();

  return candidates.map((candidate) => {
    const seenCount = (seenBaseIds.get(candidate.baseId) ?? 0) + 1;
    seenBaseIds.set(candidate.baseId, seenCount);

    return {
      answer: candidate.answer,
      choices: candidate.choices,
      id:
        baseIdCounts.get(candidate.baseId) === 1
          ? candidate.baseId
          : `${candidate.baseId}-${seenCount}`,
      kind: 'group-item',
      prompt: candidate.item,
    };
  });
}

function hasRuntimeGroupContent({
  items,
  label,
}: {
  items: string[];
  label: string;
}) {
  return hasRuntimeDisplayText(label) && items.some(hasRuntimeDisplayText);
}

function buildGroupItemRuntimeBaseId({
  groupId,
  item,
}: {
  groupId: string;
  item: string;
}) {
  const itemId = makeActivityStableId(item);

  return `${groupId}-${itemId || 'item'}`;
}

function countCandidateBaseIds(candidates: Array<{ baseId: string }>) {
  const counts = new Map<string, number>();

  for (const candidate of candidates) {
    counts.set(candidate.baseId, (counts.get(candidate.baseId) ?? 0) + 1);
  }

  return counts;
}
