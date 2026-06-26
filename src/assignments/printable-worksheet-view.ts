import {
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
} from '@/activities/runtime';
import type {
  PrintableAssignmentWorksheet,
  PrintableWorksheetAnswerKeyItem,
  PrintableWorksheetItem,
  PrintableWorksheetResponseMode,
} from '@/assignments/printable-worksheet';
import { formatAssignmentResultValue } from '@/assignments/result-format';
import { getTemplateByType } from '@/activities/catalog';
import { m } from '@/locale/paraglide/messages';

type PrintableWorksheetHeaderView = ReturnType<
  typeof buildPrintableWorksheetHeaderView
>;

type PrintableWorksheetItemView = ReturnType<
  typeof buildPrintableWorksheetItemView
>;

type PrintableWorksheetAnswerKeyItemView = ReturnType<
  typeof buildPrintableWorksheetAnswerKeyItemView
>;

type PrintableWorksheetAssignmentFieldView =
  | {
      id: 'date' | 'score' | 'student-name';
      kind: 'blank-line';
      label: string;
    }
  | {
      id: 'delivery-policy' | 'instructions' | 'share-path';
      kind: 'text';
      label: string;
      value: string;
    };

type PrintableWorksheetAnswerKeyView = {
  description: string;
  itemViews: PrintableWorksheetAnswerKeyItemView[];
  show: boolean;
  title: string;
};

type PrintableWorksheetControlView = {
  answerKeyLabel: string;
  answerKeyValue: boolean;
  backToResultsLabel: string;
  printButtonLabel: string;
};

type PrintableWorksheetEmptyState = {
  description: string;
  title: string;
};

type PrintableWorksheetLoadStateView = {
  message: string;
};

type PrintableWorksheetPageViewModel = {
  answerKeyView: PrintableWorksheetAnswerKeyView;
  answerKeyItemViews: PrintableWorksheetAnswerKeyItemView[];
  assignmentFieldViews: PrintableWorksheetAssignmentFieldView[];
  controlView: PrintableWorksheetControlView;
  emptyState: PrintableWorksheetEmptyState;
  headerView: PrintableWorksheetHeaderView;
  itemViews: PrintableWorksheetItemView[];
  showAnswerKey: boolean;
};

export const printableWorksheetPageCopy = {
  get answerKeyDescription() {
    return m.assignment_printable_answer_key_description();
  },
  get answerKeyLabel() {
    return m.assignment_printable_answer_key_label();
  },
  get answerKeyTitle() {
    return m.assignment_printable_answer_key_title();
  },
  get backToResultsLabel() {
    return m.assignment_printable_back_to_results();
  },
  get brandLabel() {
    return m.assignment_printable_brand_label();
  },
  get deliveryPolicyLabel() {
    return m.assignment_printable_delivery_policy_label();
  },
  get dateLabel() {
    return m.assignment_printable_date_label();
  },
  get emptyDescription() {
    return m.assignment_printable_empty_description();
  },
  get emptyTitle() {
    return m.assignment_printable_empty_title();
  },
  get instructionsFallback() {
    return m.assignment_printable_instructions_fallback();
  },
  get instructionsLabel() {
    return m.assignment_printable_instructions_label();
  },
  get loadErrorMessage() {
    return m.assignment_printable_load_error();
  },
  get loadingLabel() {
    return m.assignment_printable_loading();
  },
  get printButtonLabel() {
    return m.assignment_printable_print_button();
  },
  get printModeLabel() {
    return m.assignment_printable_mode_label();
  },
  get sharePathLabel() {
    return m.assignment_printable_share_path_label();
  },
  get scoreLabel() {
    return m.assignment_printable_score_label();
  },
  get studentNameLabel() {
    return m.assignment_printable_student_name_label();
  },
} as const;

export function buildPrintableWorksheetHeaderView(
  worksheet: PrintableAssignmentWorksheet
) {
  return {
    activityDescription: worksheet.activityDescription,
    activityTitle: worksheet.activityTitle,
    assignmentTitle: worksheet.assignmentTitle,
    brandLabel: printableWorksheetPageCopy.brandLabel,
    deliveryPolicy: worksheet.deliveryPolicyText,
    instructions:
      worksheet.instructions || printableWorksheetPageCopy.instructionsFallback,
    printModeLabel: printableWorksheetPageCopy.printModeLabel,
    sharePath: worksheet.sharePath,
    templateLabel: getTemplateByType(worksheet.templateType).name,
  };
}

export function buildPrintableWorksheetPageViewModel({
  answerKey,
  worksheet,
}: {
  answerKey: boolean;
  worksheet: PrintableAssignmentWorksheet;
}): PrintableWorksheetPageViewModel {
  const answerKeyItemViews = worksheet.answerKey?.map(
    buildPrintableWorksheetAnswerKeyItemView
  );
  const headerView = buildPrintableWorksheetHeaderView(worksheet);
  const answerKeyView = buildPrintableWorksheetAnswerKeyView({
    answerKey,
    itemViews: answerKeyItemViews ?? [],
  });

  return {
    answerKeyView,
    answerKeyItemViews: answerKeyItemViews ?? [],
    assignmentFieldViews:
      buildPrintableWorksheetAssignmentFieldViews(headerView),
    controlView: buildPrintableWorksheetControlView({ answerKey }),
    emptyState: buildPrintableWorksheetEmptyState(),
    headerView,
    itemViews: worksheet.items.map(buildPrintableWorksheetItemView),
    showAnswerKey: answerKeyView.show,
  };
}

export function buildPrintableWorksheetLoadingView(): PrintableWorksheetLoadStateView {
  return {
    message: printableWorksheetPageCopy.loadingLabel,
  };
}

export function buildPrintableWorksheetErrorView(): PrintableWorksheetLoadStateView {
  return {
    message: printableWorksheetPageCopy.loadErrorMessage,
  };
}

export function buildPrintableWorksheetControlView({
  answerKey,
}: {
  answerKey: boolean;
}): PrintableWorksheetControlView {
  return {
    answerKeyLabel: printableWorksheetPageCopy.answerKeyLabel,
    answerKeyValue: answerKey,
    backToResultsLabel: printableWorksheetPageCopy.backToResultsLabel,
    printButtonLabel: printableWorksheetPageCopy.printButtonLabel,
  };
}

export function buildPrintableWorksheetAssignmentFieldViews(
  headerView: PrintableWorksheetHeaderView
): PrintableWorksheetAssignmentFieldView[] {
  return [
    {
      id: 'student-name',
      kind: 'blank-line',
      label: printableWorksheetPageCopy.studentNameLabel,
    },
    {
      id: 'date',
      kind: 'blank-line',
      label: printableWorksheetPageCopy.dateLabel,
    },
    {
      id: 'score',
      kind: 'blank-line',
      label: printableWorksheetPageCopy.scoreLabel,
    },
    {
      id: 'share-path',
      kind: 'text',
      label: printableWorksheetPageCopy.sharePathLabel,
      value: headerView.sharePath,
    },
    {
      id: 'instructions',
      kind: 'text',
      label: printableWorksheetPageCopy.instructionsLabel,
      value: headerView.instructions,
    },
    {
      id: 'delivery-policy',
      kind: 'text',
      label: printableWorksheetPageCopy.deliveryPolicyLabel,
      value: headerView.deliveryPolicy,
    },
  ];
}

export function buildPrintableWorksheetEmptyState(): PrintableWorksheetEmptyState {
  return {
    description: printableWorksheetPageCopy.emptyDescription,
    title: printableWorksheetPageCopy.emptyTitle,
  };
}

export function buildPrintableWorksheetAnswerKeyView({
  answerKey,
  itemViews,
}: {
  answerKey: boolean;
  itemViews: PrintableWorksheetAnswerKeyItemView[];
}): PrintableWorksheetAnswerKeyView {
  return {
    description: printableWorksheetPageCopy.answerKeyDescription,
    itemViews,
    show: answerKey && itemViews.length > 0,
    title: printableWorksheetPageCopy.answerKeyTitle,
  };
}

export function buildPrintableWorksheetItemView(item: PrintableWorksheetItem) {
  return {
    answerLines: getPrintableWorksheetAnswerLines(item),
    choiceBank: buildPrintableWorksheetChoiceBankView(item),
    choicePresentation: item.choicePresentation,
    choices: item.choices,
    id: item.id,
    kindLabel: formatRuntimeItemKindLabel(item),
    prompt: formatRuntimeItemPrompt(item),
    responseHelp: getPrintableWorksheetResponseHelp(item.responseMode),
    sequenceLabel: m.assignment_printable_item_sequence({
      sequenceNumber: item.sequenceNumber,
    }),
  };
}

export function buildPrintableWorksheetAnswerKeyItemView(
  item: PrintableWorksheetAnswerKeyItem
) {
  const acceptedAnswers = formatPrintableWorksheetAcceptedAnswers(
    item.acceptedAnswers
  );

  return {
    acceptedAnswersLabel: acceptedAnswers
      ? m.assignment_printable_answer_key_accepted({
          acceptedAnswers,
        })
      : undefined,
    answerLabel: m.assignment_printable_answer_key_item({
      answer: formatPrintableWorksheetValue(item.answer),
      sequenceNumber: item.sequenceNumber,
    }),
    explanationLabel: item.explanation
      ? m.assignment_printable_answer_key_explanation({
          explanation: item.explanation,
        })
      : undefined,
    id: item.id,
    prompt: formatPrintableWorksheetAnswerKeyPrompt(item),
  };
}

function buildPrintableWorksheetChoiceBankView(item: PrintableWorksheetItem) {
  return {
    choices: item.choices.map((choice, index) => ({
      choice,
      indexLabel: formatPrintableWorksheetChoiceIndex(index),
      key: `${item.id}-choice-${index}`,
    })),
    presentation: item.choicePresentation,
    showIndexLabels: item.choicePresentation !== 'group-bank',
  };
}

export function getPrintableWorksheetAnswerLines(item: PrintableWorksheetItem) {
  return Array.from({ length: item.answerSpaceLines }, (_, index) => ({
    key: `${item.id}-answer-line-${index}`,
  }));
}

export function formatPrintableWorksheetAcceptedAnswers(values: string[]) {
  return values.length > 1
    ? values.slice(1).join(m.assignment_printable_answer_separator())
    : '';
}

export function formatPrintableWorksheetValue(value: string | undefined) {
  return formatAssignmentResultValue(value);
}

export function formatPrintableWorksheetAnswerKeyPrompt({
  kind,
  prompt,
}: Pick<PrintableWorksheetAnswerKeyItem, 'kind' | 'prompt'>) {
  return formatRuntimeItemPrompt({ kind, prompt });
}

function getPrintableWorksheetResponseHelp(
  responseMode: PrintableWorksheetResponseMode
) {
  switch (responseMode) {
    case 'choice':
      return m.assignment_printable_response_choice();
    case 'group-choice':
      return m.assignment_printable_response_group_choice();
    case 'line-match':
      return m.assignment_printable_response_line_match();
    case 'matching-pairs':
      return m.assignment_printable_response_matching_pairs();
    case 'short-answer':
      return m.assignment_printable_response_short_answer();
  }
}

function formatPrintableWorksheetChoiceIndex(index: number) {
  return index >= 0 && index < 26
    ? String.fromCharCode(65 + index)
    : `${index + 1}`;
}
