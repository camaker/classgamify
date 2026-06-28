import {
  getActivityTemplateRunnerKind,
  type ActivityTemplateRunnerKind,
  type RuntimeItem,
} from '@/activities/runtime';
import type {
  ActivityTemplateType,
  AssignmentSettings,
} from '@/activities/types';
import { formatAssignmentDisplayTitle } from '@/assignments/assignment-display';
import {
  buildAssignmentDeliverySummary,
  formatAssignmentDeliveryInstructions,
  formatAssignmentDeliveryPolicyText,
} from '@/assignments/delivery-summary';
import { orderAssignmentRuntimeItems } from '@/assignments/item-order';
import { buildAssignmentSharePath } from '@/assignments/share-link';
import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { resolveAssignmentSnapshotSource } from '@/assignments/snapshot';
import {
  getRuntimeDisplayAcceptedAnswers,
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeChoiceList,
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';
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

export type PrintableWorksheetResponsePolicy = {
  answerSpaceLines: number;
  choicePresentation: PrintableWorksheetChoicePresentation;
  responseMode: PrintableWorksheetResponseMode;
};

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

export type PrintableAssignmentDeliveryView = {
  deliveryPolicyText: string;
  deliverySummary: ReturnType<typeof buildAssignmentDeliverySummary>;
  instructions?: string;
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

export const PRINTABLE_WORKSHEET_RESPONSE_POLICIES = {
  'choice-list': {
    answerSpaceLines: 1,
    choicePresentation: 'choice-list',
    responseMode: 'choice',
  },
  'fill-blank': {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    responseMode: 'short-answer',
  },
  'group-sort': {
    answerSpaceLines: 1,
    choicePresentation: 'group-bank',
    responseMode: 'group-choice',
  },
  'line-match': {
    answerSpaceLines: 1,
    choicePresentation: 'answer-bank',
    responseMode: 'line-match',
  },
  listening: {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    responseMode: 'short-answer',
  },
  'matching-pairs': {
    answerSpaceLines: 1,
    choicePresentation: 'answer-bank',
    responseMode: 'matching-pairs',
  },
  'open-box': {
    answerSpaceLines: 2,
    choicePresentation: 'none',
    responseMode: 'short-answer',
  },
} as const satisfies Record<
  ActivityTemplateRunnerKind,
  PrintableWorksheetResponsePolicy
>;

export function parsePrintableAssignmentSearch(
  search: Record<string, unknown>
): PrintableAssignmentSearch {
  return {
    answerKey: isPrintableAnswerKeySearchEnabled(search.answerKey)
      ? true
      : undefined,
  };
}

export function buildPrintableAssignmentSearch({
  answerKey,
}: {
  answerKey: boolean;
}): PrintableAssignmentSearch {
  return {
    answerKey: answerKey ? true : undefined,
  };
}

export function getPrintableWorksheetResponsePolicy(
  templateType: ActivityTemplateType
): PrintableWorksheetResponsePolicy {
  return {
    ...PRINTABLE_WORKSHEET_RESPONSE_POLICIES[
      getActivityTemplateRunnerKind(templateType)
    ],
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
  const deliveryView = buildPrintableAssignmentDeliveryView({
    expiresAt: assignment.expiresAt,
    settings,
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
    assignmentTitle: formatAssignmentDisplayTitle(assignment.title),
    deliveryPolicyText: deliveryView.deliveryPolicyText,
    deliverySummary: deliveryView.deliverySummary,
    includeAnswerKey,
    instructions: deliveryView.instructions,
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

export function buildPrintableAssignmentDeliveryView({
  expiresAt,
  settings,
}: {
  expiresAt: Date | string | null;
  settings: AssignmentSettings;
}): PrintableAssignmentDeliveryView {
  return {
    deliveryPolicyText: formatAssignmentDeliveryPolicyText({
      expiresAt,
      settings,
    }),
    deliverySummary: buildAssignmentDeliverySummary({
      collectStudentName: settings.collectStudentName,
      expiresAt,
      maxAttempts: settings.maxAttempts,
      showCorrectAnswers: settings.showCorrectAnswers,
      shuffleItems: settings.shuffleItems,
      timeLimitSeconds: settings.timeLimitSeconds,
    }),
    instructions: formatAssignmentDeliveryInstructions(settings.instructions),
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
  const responsePolicy = getPrintableWorksheetResponsePolicy(templateType);

  return {
    answerSpaceLines: responsePolicy.answerSpaceLines,
    choicePresentation: responsePolicy.choicePresentation,
    choices: normalizeRuntimeChoiceList(item.choices) ?? [],
    id: item.id,
    kind: item.kind,
    prompt: normalizeRuntimeDisplayText(item.prompt),
    responseMode: responsePolicy.responseMode,
    sequenceNumber: normalizeRuntimeDisplayCount(sequenceNumber, { min: 1 }),
  };
}

function toPrintableWorksheetAnswerKeyItem(
  item: RuntimeItem,
  index: number
): PrintableWorksheetAnswerKeyItem {
  const acceptedAnswers = getRuntimeDisplayAcceptedAnswers(item.answer);

  return {
    acceptedAnswers,
    answer: normalizeRuntimeDisplayText(acceptedAnswers[0] ?? item.answer),
    explanation: normalizeOptionalRuntimeDisplayText(item.explanation),
    id: item.id,
    kind: item.kind,
    prompt: normalizeRuntimeDisplayText(item.prompt),
    sequenceNumber: normalizeRuntimeDisplayCount(index + 1, { min: 1 }),
  };
}
