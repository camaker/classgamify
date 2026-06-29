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
import { normalizePrintableWorksheetSequenceNumber } from '@/assignments/printable-worksheet';
import {
  formatAcceptedAnswerAlternatives,
  formatAssignmentResultValue,
} from '@/assignments/result-format';
import {
  normalizeOptionalRuntimeDisplayText,
  normalizeRuntimeChoiceList,
  normalizeRuntimeDisplayCount,
  normalizeRuntimeDisplayText,
} from '@/assignments/runtime-display';
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
      id:
        | 'delivery-policy'
        | 'instructions'
        | 'share-path'
        | 'snapshot-source'
        | 'template';
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
  answerKeyDescription: string;
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

type PrintableWorksheetRouteState =
  | {
      statePanelView: PrintableWorksheetLoadStateView;
      status: 'loading';
    }
  | {
      statePanelView: PrintableWorksheetLoadStateView;
      status: 'error';
    }
  | {
      pageView: PrintableWorksheetPageViewModel;
      status: 'ready';
    };

export const PRINTABLE_WORKSHEET_BODY_PRINT_MODE = 'worksheet';

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
  get snapshotSourceLabel() {
    return m.assignment_printable_snapshot_source_label();
  },
  get scoreLabel() {
    return m.assignment_printable_score_label();
  },
  get studentNameLabel() {
    return m.assignment_printable_student_name_label();
  },
  get templateLabel() {
    return m.assignment_printable_template_label();
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
    sharePathLabel: printableWorksheetPageCopy.sharePathLabel,
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

export function buildPrintableWorksheetRouteState({
  answerKey,
  isError,
  isLoading,
  worksheet,
}: {
  answerKey: boolean;
  isError: boolean;
  isLoading: boolean;
  worksheet?: PrintableAssignmentWorksheet | null;
}): PrintableWorksheetRouteState {
  if (isLoading) {
    return {
      statePanelView: buildPrintableWorksheetLoadingView(),
      status: 'loading',
    };
  }

  if (isError || !worksheet) {
    return {
      statePanelView: buildPrintableWorksheetErrorView(),
      status: 'error',
    };
  }

  return {
    pageView: buildPrintableWorksheetPageViewModel({
      answerKey,
      worksheet,
    }),
    status: 'ready',
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
    answerKeyDescription: printableWorksheetPageCopy.answerKeyDescription,
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
      id: 'template',
      kind: 'text',
      label: printableWorksheetPageCopy.templateLabel,
      value: headerView.templateLabel,
    },
    buildPrintableWorksheetSnapshotSourceFieldView(headerView),
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

export function buildPrintableWorksheetSnapshotSourceFieldView(
  headerView: PrintableWorksheetHeaderView
): PrintableWorksheetAssignmentFieldView {
  return {
    id: 'snapshot-source',
    kind: 'text',
    label: printableWorksheetPageCopy.snapshotSourceLabel,
    value: m.assignment_printable_snapshot_source_value({
      activityTitle: headerView.activityTitle,
      sharePath: headerView.sharePath,
    }),
  };
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
  const kindLabel = formatRuntimeItemKindLabel(item);
  const sequenceLabel = m.assignment_printable_item_sequence({
    sequenceNumber: normalizePrintableWorksheetSequenceNumber(
      item.sequenceNumber
    ),
  });
  const answerLines = getPrintableWorksheetAnswerLines(item);
  const choiceBank = buildPrintableWorksheetChoiceBankView(item);

  return {
    answerAreaLabel: m.assignment_printable_answer_area_label(),
    answerLineSummary: formatPrintableWorksheetAnswerLineSummary(
      answerLines.length
    ),
    answerLines,
    choiceBank,
    choicePresentation: item.choicePresentation,
    choices: normalizeRuntimeChoiceList(item.choices) ?? [],
    headingLabel: m.assignment_printable_item_heading({
      kindLabel,
      sequenceLabel,
    }),
    id: item.id,
    kindLabel,
    prompt: formatRuntimeItemPrompt(item),
    responseHelp: getPrintableWorksheetResponseHelp(item.responseMode),
    responseModeLabel: formatPrintableWorksheetResponseModeLabel(
      item.responseMode
    ),
    sequenceLabel,
  };
}

export function buildPrintableWorksheetAnswerKeyItemView(
  item: PrintableWorksheetAnswerKeyItem
) {
  const acceptedAnswers = formatPrintableWorksheetAcceptedAnswers(
    item.acceptedAnswers
  );
  const explanation = normalizeOptionalRuntimeDisplayText(item.explanation);
  const sequenceLabel = m.assignment_printable_item_sequence({
    sequenceNumber: normalizePrintableWorksheetSequenceNumber(
      item.sequenceNumber
    ),
  });

  return {
    acceptedAnswersLabel: acceptedAnswers
      ? m.assignment_printable_answer_key_accepted({
          acceptedAnswers,
        })
      : undefined,
    answerLabel: m.assignment_printable_answer_key_item({
      answer: formatPrintableWorksheetValue(item.answer),
      sequenceNumber: normalizePrintableWorksheetSequenceNumber(
        item.sequenceNumber
      ),
    }),
    explanationLabel: explanation
      ? m.assignment_printable_answer_key_explanation({
          explanation,
        })
      : undefined,
    headingLabel: m.assignment_printable_item_heading({
      kindLabel: formatRuntimeItemKindLabel(item),
      sequenceLabel,
    }),
    id: item.id,
    prompt: formatPrintableWorksheetAnswerKeyPrompt(item),
  };
}

function buildPrintableWorksheetChoiceBankView(item: PrintableWorksheetItem) {
  const showChoiceBank = shouldShowPrintableWorksheetChoiceBank(item);
  const choices = showChoiceBank
    ? (normalizeRuntimeChoiceList(item.choices) ?? [])
    : [];

  return {
    choices: choices.map((choice, index) => ({
      choice,
      indexLabel: formatPrintableWorksheetChoiceIndex(index),
      key: `${item.id}-choice-${index}`,
    })),
    emptySummary:
      showChoiceBank && choices.length === 0
        ? m.assignment_printable_choice_bank_empty()
        : null,
    label:
      showChoiceBank && choices.length > 0
        ? getPrintableWorksheetChoiceBankLabel(item.choicePresentation)
        : null,
    presentation: item.choicePresentation,
    show: showChoiceBank,
    showIndexLabels: showChoiceBank && item.choicePresentation !== 'group-bank',
    summary: formatPrintableWorksheetChoiceBankSummary({
      count: choices.length,
      presentation: item.choicePresentation,
      showChoiceBank,
    }),
  };
}

function shouldShowPrintableWorksheetChoiceBank(item: PrintableWorksheetItem) {
  return item.choicePresentation !== 'none';
}

export function getPrintableWorksheetAnswerLines(item: PrintableWorksheetItem) {
  const answerSpaceLines = normalizeRuntimeDisplayCount(item.answerSpaceLines, {
    max: 4,
    min: 1,
  });

  return Array.from({ length: answerSpaceLines }, (_, index) => ({
    key: `${item.id}-answer-line-${index}`,
  }));
}

export function formatPrintableWorksheetAcceptedAnswers(values: string[]) {
  return formatAcceptedAnswerAlternatives(values, {
    emptyValue: '',
    includePrimary: false,
    separator: m.assignment_printable_answer_separator(),
  });
}

export function formatPrintableWorksheetValue(value: string | undefined) {
  return formatAssignmentResultValue(value);
}

export function formatPrintableWorksheetAnswerKeyPrompt({
  kind,
  prompt,
}: Pick<PrintableWorksheetAnswerKeyItem, 'kind' | 'prompt'>) {
  return formatRuntimeItemPrompt({
    kind,
    prompt: normalizeRuntimeDisplayText(prompt),
  });
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

function formatPrintableWorksheetResponseModeLabel(
  responseMode: PrintableWorksheetResponseMode
) {
  switch (responseMode) {
    case 'choice':
      return m.assignment_printable_response_mode_choice();
    case 'group-choice':
      return m.assignment_printable_response_mode_group_choice();
    case 'line-match':
      return m.assignment_printable_response_mode_line_match();
    case 'matching-pairs':
      return m.assignment_printable_response_mode_matching_pairs();
    case 'short-answer':
      return m.assignment_printable_response_mode_short_answer();
  }
}

function formatPrintableWorksheetAnswerLineSummary(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count, {
    min: 0,
  });

  if (normalizedCount === 1) {
    return m.assignment_printable_answer_line_summary_one({
      count: normalizedCount,
    });
  }

  return m.assignment_printable_answer_line_summary_many({
    count: normalizedCount,
  });
}

function formatPrintableWorksheetChoiceBankSummary({
  count,
  presentation,
  showChoiceBank,
}: {
  count: number;
  presentation: PrintableWorksheetItem['choicePresentation'];
  showChoiceBank: boolean;
}) {
  if (!showChoiceBank) {
    return null;
  }

  const normalizedCount = normalizeRuntimeDisplayCount(count, {
    min: 0,
  });

  if (normalizedCount === 0) {
    return m.assignment_printable_choice_bank_summary_none();
  }

  if (presentation === 'group-bank') {
    return m.assignment_printable_choice_bank_summary_groups({
      count: normalizedCount,
    });
  }

  if (normalizedCount === 1) {
    return m.assignment_printable_choice_bank_summary_one({
      count: normalizedCount,
    });
  }

  return m.assignment_printable_choice_bank_summary_many({
    count: normalizedCount,
  });
}

function getPrintableWorksheetChoiceBankLabel(
  presentation: PrintableWorksheetItem['choicePresentation']
) {
  switch (presentation) {
    case 'answer-bank':
      return m.assignment_printable_choice_bank_answer_label();
    case 'choice-list':
      return m.assignment_printable_choice_bank_choice_label();
    case 'group-bank':
      return m.assignment_printable_choice_bank_group_label();
    case 'none':
      return null;
  }
}

function formatPrintableWorksheetChoiceIndex(index: number) {
  return m.assignment_printable_choice_index_label({
    index: getPrintableWorksheetChoiceIndexValue(index),
  });
}

export function getPrintableWorksheetChoiceIndexValue(index: number) {
  if (Number.isFinite(index) && index >= 0 && index < 26) {
    return String.fromCharCode(
      65 + normalizeRuntimeDisplayCount(index, { min: 0 })
    );
  }

  return `${normalizeRuntimeDisplayCount(index + 1, { min: 1 })}`;
}
