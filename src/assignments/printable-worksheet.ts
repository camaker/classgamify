import { getAcceptedAnswers } from '@/activities/answer-matching';
import {
  getActivityTemplateRunnerKind,
  type RuntimeItem,
} from '@/activities/runtime';
import type {
  ActivityTemplateType,
  AssignmentSettings,
} from '@/activities/types';
import {
  buildAssignmentDeliverySummary,
  formatAssignmentDeliveryPolicyText,
} from '@/assignments/delivery-summary';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { resolveAssignmentSnapshotSource } from '@/assignments/snapshot';
import { resolveAssignmentSettings } from '@/assignments/validation';

export type PrintableWorksheetResponseMode =
  | 'choice'
  | 'group-choice'
  | 'line-match'
  | 'matching-pairs'
  | 'short-answer';

export type PrintableWorksheetChoicePresentation =
  | 'answer-bank'
  | 'choice-list'
  | 'group-bank'
  | 'none';

export type PrintableWorksheetItem = {
  answerSpaceLines: number;
  choicePresentation: PrintableWorksheetChoicePresentation;
  choices: string[];
  id: string;
  kind: RuntimeItem['kind'];
  prompt: string;
  responseMode: PrintableWorksheetResponseMode;
  sequenceNumber: number;
};

export type PrintableWorksheetAnswerKeyItem = {
  acceptedAnswers: string[];
  answer: string;
  explanation?: string;
  id: string;
  kind: RuntimeItem['kind'];
  prompt: string;
  sequenceNumber: number;
};

export type PrintableAssignmentWorksheet = {
  activityDescription: string | null;
  activityTitle: string;
  answerKey?: PrintableWorksheetAnswerKeyItem[];
  assignmentTitle: string;
  deliveryPolicyText: string;
  deliverySummary: ReturnType<typeof buildAssignmentDeliverySummary>;
  includeAnswerKey: boolean;
  instructions?: string;
  items: PrintableWorksheetItem[];
  sharePath: string;
  shareSlug: string;
  templateType: ActivityTemplateType;
};

export type PrintableAssignmentSearch = {
  answerKey?: boolean;
};

type PrintableAssignmentWorksheetSource = {
  activity: {
    description: string | null;
    templateType: ActivityTemplateType;
    title: string;
  };
  assignment: {
    expiresAt: Date | string | null;
    settingsJson: Partial<AssignmentSettings> | null | undefined;
    shareSlug: string;
    title: string;
  };
  includeAnswerKey?: boolean;
  runtimeItems: RuntimeItem[];
  snapshot?: {
    activityDescription: string | null;
    activityTitle: string;
    templateType: ActivityTemplateType;
  } | null;
};

export function parsePrintableAssignmentSearch(
  search: Record<string, unknown>
): PrintableAssignmentSearch {
  return {
    answerKey: isPrintableAnswerKeySearchEnabled(search.answerKey)
      ? true
      : undefined,
  };
}

export function buildPrintableAssignmentWorksheet({
  activity,
  assignment,
  includeAnswerKey = false,
  runtimeItems,
  snapshot,
}: PrintableAssignmentWorksheetSource): PrintableAssignmentWorksheet {
  const settings = resolveAssignmentSettings(assignment.settingsJson);
  const shareSlug = normalizeAssignmentShareSlug(assignment.shareSlug);
  const resolvedSource = resolveAssignmentSnapshotSource({
    activity,
    snapshot,
  });
  const templateType = resolvedSource.templateType;
  const orderedRuntimeItems = orderAssignmentRuntimeItems({
    items: runtimeItems,
    shareSlug,
    shuffleItems: settings.shuffleItems,
  });

  return {
    activityDescription: resolvedSource.activityDescription ?? null,
    activityTitle: resolvedSource.activityTitle,
    answerKey: includeAnswerKey
      ? orderedRuntimeItems.map(toPrintableWorksheetAnswerKeyItem)
      : undefined,
    assignmentTitle: assignment.title,
    deliveryPolicyText: formatAssignmentDeliveryPolicyText({
      expiresAt: assignment.expiresAt,
      settings,
    }),
    deliverySummary: buildAssignmentDeliverySummary({
      collectStudentName: settings.collectStudentName,
      expiresAt: assignment.expiresAt,
      maxAttempts: settings.maxAttempts,
      showCorrectAnswers: settings.showCorrectAnswers,
      shuffleItems: settings.shuffleItems,
      timeLimitSeconds: settings.timeLimitSeconds,
    }),
    includeAnswerKey,
    instructions: settings.instructions,
    items: orderedRuntimeItems.map((item, index) =>
      toPrintableWorksheetItem({
        item,
        sequenceNumber: index + 1,
        templateType,
      })
    ),
    sharePath: buildAssignmentSharePath(shareSlug),
    shareSlug,
    templateType,
  };
}

function isPrintableAnswerKeySearchEnabled(value: unknown) {
  return value === true || value === 'true' || value === '1';
}

function toPrintableWorksheetItem({
  item,
  sequenceNumber,
  templateType,
}: {
  item: RuntimeItem;
  sequenceNumber: number;
  templateType: ActivityTemplateType;
}): PrintableWorksheetItem {
  const responseMode = getPrintableWorksheetResponseMode(templateType);

  return {
    answerSpaceLines: getPrintableWorksheetAnswerSpaceLines(responseMode),
    choicePresentation: getPrintableWorksheetChoicePresentation(responseMode),
    choices: item.choices ? [...item.choices] : [],
    id: item.id,
    kind: item.kind,
    prompt: item.prompt,
    responseMode,
    sequenceNumber,
  };
}

function toPrintableWorksheetAnswerKeyItem(
  item: RuntimeItem,
  index: number
): PrintableWorksheetAnswerKeyItem {
  const acceptedAnswers = getAcceptedAnswers(item.answer);

  return {
    acceptedAnswers,
    answer: acceptedAnswers[0] ?? item.answer,
    explanation: item.explanation,
    id: item.id,
    kind: item.kind,
    prompt: item.prompt,
    sequenceNumber: index + 1,
  };
}

function getPrintableWorksheetResponseMode(
  templateType: ActivityTemplateType
): PrintableWorksheetResponseMode {
  const runnerKind = getActivityTemplateRunnerKind(templateType);

  switch (runnerKind) {
    case 'choice-list':
      return 'choice';
    case 'group-sort':
      return 'group-choice';
    case 'line-match':
      return 'line-match';
    case 'matching-pairs':
      return 'matching-pairs';
    case 'fill-blank':
    case 'listening':
    case 'open-box':
      return 'short-answer';
  }
}

function getPrintableWorksheetAnswerSpaceLines(
  responseMode: PrintableWorksheetResponseMode
) {
  return responseMode === 'short-answer' ? 2 : 1;
}

function getPrintableWorksheetChoicePresentation(
  responseMode: PrintableWorksheetResponseMode
): PrintableWorksheetChoicePresentation {
  switch (responseMode) {
    case 'choice':
      return 'choice-list';
    case 'group-choice':
      return 'group-bank';
    case 'line-match':
    case 'matching-pairs':
      return 'answer-bank';
    case 'short-answer':
      return 'none';
  }
}
