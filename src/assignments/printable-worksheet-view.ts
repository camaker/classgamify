import {
  formatRuntimeItemKindLabel,
  formatRuntimeItemPrompt,
} from '@/activities/runtime';
import type {
  PrintableAssignmentWorksheet,
  PrintableAssignmentWorksheetSummary,
  PrintableWorksheetAnswerKeyItem,
  PrintableWorksheetChoicePresentation,
  PrintableWorksheetItemLayout,
  PrintableWorksheetItem,
  PrintableWorksheetResponseMode,
} from '@/assignments/printable-worksheet';
import {
  normalizePrintableWorksheetSequenceNumber,
  summarizePrintableAssignmentWorksheet,
} from '@/assignments/printable-worksheet';
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
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';

export type PrintableWorksheetHeaderOverviewItem = {
  ariaLabel: string;
  description: string;
  id: 'answer-key' | 'items' | 'response-modes';
  label: string;
  value: string;
};

export type PrintableWorksheetAnswerKeyAccessState =
  | 'hidden'
  | 'included'
  | 'unavailable';

export type PrintableWorksheetAnswerKeyAccessView = {
  ariaLabel: string;
  description: string;
  label: string;
  state: PrintableWorksheetAnswerKeyAccessState;
  value: string;
};

export type PrintableWorksheetPreparationItemId =
  | 'answer-key'
  | 'response-plan'
  | 'student-fields';

export type PrintableWorksheetPreparationItemView = {
  ariaLabel: string;
  description: string;
  id: PrintableWorksheetPreparationItemId;
  label: string;
  value: string;
};

export type PrintableWorksheetPreparationView = {
  description: string;
  items: PrintableWorksheetPreparationItemView[];
  title: string;
};

export type PrintableWorksheetHandoffItemId =
  | 'answer-key'
  | 'print-action'
  | 'response-plan'
  | 'results-return'
  | 'share-path'
  | 'student-fields';

export type PrintableWorksheetHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PrintableWorksheetHandoffItemId;
  label: string;
  value: string;
};

export type PrintableWorksheetHandoffView = {
  description: string;
  itemViews: PrintableWorksheetHandoffItemView[];
  title: string;
};

export type PrintableWorksheetHeaderView = {
  activityDescription: string | null;
  activityTitle: string;
  assignmentTitle: string;
  brandLabel: string;
  deliveryPolicy: string;
  instructions: string;
  overviewItems: PrintableWorksheetHeaderOverviewItem[];
  printModeLabel: string;
  sharePath: string;
  sharePathLabel: string;
  templateLabel: string;
};

export type PrintableWorksheetAnswerLineView = {
  key: string;
};

export type PrintableWorksheetChoiceBankChoiceView = {
  ariaLabel: string;
  choice: string;
  description: string;
  indexLabel: string;
  key: string;
};

export type PrintableWorksheetChoiceBankView = {
  choices: PrintableWorksheetChoiceBankChoiceView[];
  emptySummary: string | null;
  label: string | null;
  presentation: PrintableWorksheetChoicePresentation;
  show: boolean;
  showIndexLabels: boolean;
  summary: string | null;
};

export type PrintableWorksheetItemView = {
  answerAreaLabel: string;
  answerLineSummary: string;
  answerLines: PrintableWorksheetAnswerLineView[];
  choiceBank: PrintableWorksheetChoiceBankView;
  choicePresentation: PrintableWorksheetChoicePresentation;
  choices: string[];
  headingLabel: string;
  id: string;
  kindLabel: string;
  layout: PrintableWorksheetItemLayout;
  prompt: string;
  responseHelp: string;
  responseModeLabel: string;
  sequenceLabel: string;
};

export type PrintableWorksheetAnswerKeyDetailId =
  | 'accepted-answers'
  | 'expected-answer'
  | 'explanation';

export type PrintableWorksheetAnswerKeyDetailView = {
  ariaLabel: string;
  id: PrintableWorksheetAnswerKeyDetailId;
  label: string;
  tone: 'primary' | 'secondary';
};

export type PrintableWorksheetAnswerKeyItemView = {
  ariaLabel: string;
  detailViews: PrintableWorksheetAnswerKeyDetailView[];
  headingLabel: string;
  id: string;
  prompt: string;
};

export type PrintableWorksheetBlankFieldView = {
  ariaLabel: string;
  description: string;
  id: 'date' | 'score' | 'student-name';
  kind: 'blank-line';
  label: string;
  value: string;
};

export type PrintableWorksheetTextFieldView = {
  ariaLabel: string;
  description: string;
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

export type PrintableWorksheetAssignmentFieldView =
  | PrintableWorksheetBlankFieldView
  | PrintableWorksheetTextFieldView;

export type PrintableWorksheetAnswerKeyView = {
  accessView: PrintableWorksheetAnswerKeyAccessView;
  description: string;
  itemViews: PrintableWorksheetAnswerKeyItemView[];
  show: boolean;
  title: string;
};

export type PrintableWorksheetBackToResultsAction = {
  assignmentId: string;
  label: string;
  to: typeof Routes.DashboardAssignmentResults;
};

export type PrintableWorksheetAnswerKeyToggleView = {
  accessView: PrintableWorksheetAnswerKeyAccessView;
  description: string;
  label: string;
  value: boolean;
};

export type PrintableWorksheetPrintAction = {
  description: string;
  label: string;
};

export type PrintableWorksheetControlView = {
  answerKeyToggle: PrintableWorksheetAnswerKeyToggleView;
  backToResultsAction: PrintableWorksheetBackToResultsAction;
  printAction: PrintableWorksheetPrintAction;
};

export type PrintableWorksheetEmptyState = {
  description: string;
  title: string;
};

export type PrintableWorksheetLoadStateView = {
  message: string;
};

export type PrintableWorksheetPageViewModel = {
  answerKeyView: PrintableWorksheetAnswerKeyView;
  answerKeyItemViews: PrintableWorksheetAnswerKeyItemView[];
  assignmentFieldViews: PrintableWorksheetAssignmentFieldView[];
  controlView: PrintableWorksheetControlView;
  emptyState: PrintableWorksheetEmptyState;
  handoffView: PrintableWorksheetHandoffView;
  headerView: PrintableWorksheetHeaderView;
  itemViews: PrintableWorksheetItemView[];
  preparationView: PrintableWorksheetPreparationView;
  showAnswerKey: boolean;
};

export type PrintableWorksheetRouteState =
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
  get answerKeyAccessHiddenDescription() {
    return m.assignment_printable_answer_key_access_hidden_description();
  },
  get answerKeyAccessHiddenValue() {
    return m.assignment_printable_answer_key_access_hidden_value();
  },
  get answerKeyAccessIncludedDescription() {
    return m.assignment_printable_answer_key_access_included_description();
  },
  get answerKeyAccessIncludedValue() {
    return m.assignment_printable_answer_key_access_included_value();
  },
  get answerKeyAccessLabel() {
    return m.assignment_printable_answer_key_access_label();
  },
  get answerKeyAccessUnavailableDescription() {
    return m.assignment_printable_answer_key_access_unavailable_description();
  },
  get answerKeyAccessUnavailableValue() {
    return m.assignment_printable_answer_key_access_unavailable_value();
  },
  get answerKeyTitle() {
    return m.assignment_printable_answer_key_title();
  },
  get blankFieldDescription() {
    return m.assignment_printable_field_blank_description();
  },
  get blankFieldValue() {
    return m.assignment_printable_field_blank_value();
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
  get preparationAnswerKeyHiddenDescription() {
    return m.assignment_printable_preparation_answer_key_hidden_description();
  },
  get preparationAnswerKeyIncludedDescription() {
    return m.assignment_printable_preparation_answer_key_included_description();
  },
  get preparationAnswerKeyLabel() {
    return m.assignment_printable_preparation_answer_key_label();
  },
  get preparationDescription() {
    return m.assignment_printable_preparation_description();
  },
  get preparationResponsePlanDescription() {
    return m.assignment_printable_preparation_response_plan_description();
  },
  get preparationResponsePlanLabel() {
    return m.assignment_printable_preparation_response_plan_label();
  },
  get preparationStudentFieldsDescription() {
    return m.assignment_printable_preparation_student_fields_description();
  },
  get preparationStudentFieldsLabel() {
    return m.assignment_printable_preparation_student_fields_label();
  },
  get preparationStudentFieldsValue() {
    return m.assignment_printable_preparation_student_fields_value();
  },
  get preparationTitle() {
    return m.assignment_printable_preparation_title();
  },
  get printButtonLabel() {
    return m.assignment_printable_print_button();
  },
  get printButtonDescription() {
    return m.assignment_printable_print_button_description();
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
  get textFieldDescription() {
    return m.assignment_printable_field_text_description();
  },
} as const;

export function buildPrintableWorksheetHeaderView(
  worksheet: PrintableAssignmentWorksheet,
  options?: {
    answerKeyAccessView?: PrintableWorksheetAnswerKeyAccessView;
    includeAnswerKey?: boolean;
  }
): PrintableWorksheetHeaderView {
  const summary = summarizePrintableAssignmentWorksheet(worksheet, options);

  return {
    activityDescription: worksheet.activityDescription,
    activityTitle: worksheet.activityTitle,
    assignmentTitle: worksheet.assignmentTitle,
    brandLabel: printableWorksheetPageCopy.brandLabel,
    deliveryPolicy: worksheet.deliveryPolicyText,
    instructions:
      worksheet.instructions || printableWorksheetPageCopy.instructionsFallback,
    overviewItems: buildPrintableWorksheetHeaderOverviewItems(summary, {
      answerKeyAccessView: options?.answerKeyAccessView,
    }),
    printModeLabel: printableWorksheetPageCopy.printModeLabel,
    sharePath: worksheet.sharePath,
    sharePathLabel: printableWorksheetPageCopy.sharePathLabel,
    templateLabel: getTemplateByType(worksheet.templateType).name,
  };
}

export function buildPrintableWorksheetHeaderOverviewItems(
  summary: PrintableAssignmentWorksheetSummary,
  options?: {
    answerKeyAccessView?: PrintableWorksheetAnswerKeyAccessView;
  }
): PrintableWorksheetHeaderOverviewItem[] {
  const itemCountValue = formatPrintableWorksheetOverviewItemCount(
    summary.itemCount
  );
  const responseModesValue =
    formatPrintableWorksheetOverviewResponseModes(summary);
  const answerKeyValue = formatPrintableWorksheetAnswerKeyOverviewLabel(
    summary,
    options?.answerKeyAccessView
  );
  const answerKeyDescription =
    options?.answerKeyAccessView?.description ??
    (summary.showAnswerKey
      ? printableWorksheetPageCopy.answerKeyAccessIncludedDescription
      : printableWorksheetPageCopy.answerKeyAccessHiddenDescription);

  return [
    buildPrintableWorksheetHeaderOverviewItemView({
      description: m.assignment_printable_overview_items_description(),
      id: 'items',
      label: m.assignment_printable_overview_items_label(),
      value: itemCountValue,
    }),
    buildPrintableWorksheetHeaderOverviewItemView({
      description: m.assignment_printable_overview_response_modes_description(),
      id: 'response-modes',
      label: m.assignment_printable_overview_response_modes_label(),
      value: responseModesValue,
    }),
    buildPrintableWorksheetHeaderOverviewItemView({
      description: answerKeyDescription,
      id: 'answer-key',
      label: m.assignment_printable_overview_answer_key_label(),
      value: answerKeyValue,
    }),
  ];
}

function buildPrintableWorksheetHeaderOverviewItemView({
  description,
  id,
  label,
  value,
}: Omit<PrintableWorksheetHeaderOverviewItem, 'ariaLabel'>) {
  return {
    ariaLabel: buildPrintableWorksheetSemanticAriaLabel({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function formatPrintableWorksheetAnswerKeyOverviewLabel(
  summary: PrintableAssignmentWorksheetSummary,
  accessView?: PrintableWorksheetAnswerKeyAccessView
) {
  if (accessView) return accessView.value;

  return summary.showAnswerKey
    ? m.assignment_printable_overview_answer_key_included()
    : m.assignment_printable_overview_answer_key_hidden();
}

export function buildPrintableWorksheetPageViewModel({
  answerKey,
  assignmentId,
  worksheet,
}: {
  answerKey: boolean;
  assignmentId: string;
  worksheet: PrintableAssignmentWorksheet;
}): PrintableWorksheetPageViewModel {
  const answerKeySummary = summarizePrintableAssignmentWorksheet(worksheet, {
    includeAnswerKey: answerKey,
  });
  const answerKeyAccessView = buildPrintableWorksheetAnswerKeyAccessView({
    answerKey,
    summary: answerKeySummary,
  });
  const answerKeyItemViews = answerKeySummary.showAnswerKey
    ? (worksheet.answerKey?.map(buildPrintableWorksheetAnswerKeyItemView) ?? [])
    : [];
  const answerKeyView = buildPrintableWorksheetAnswerKeyView({
    accessView: answerKeyAccessView,
    answerKey,
    itemViews: answerKeyItemViews,
    worksheet,
  });
  const headerView = buildPrintableWorksheetHeaderView(worksheet, {
    answerKeyAccessView,
    includeAnswerKey: answerKeyView.show,
  });
  const summary = summarizePrintableAssignmentWorksheet(worksheet, {
    includeAnswerKey: answerKeyView.show,
  });
  const assignmentFieldViews =
    buildPrintableWorksheetAssignmentFieldViews(headerView);
  const controlView = buildPrintableWorksheetControlView({
    answerKey,
    answerKeyAccessView,
    assignmentId,
  });
  const preparationView = buildPrintableWorksheetPreparationView(summary, {
    answerKeyAccessView,
  });

  return {
    answerKeyView,
    answerKeyItemViews,
    assignmentFieldViews,
    controlView,
    emptyState: buildPrintableWorksheetEmptyState(),
    handoffView: buildPrintableWorksheetHandoffView({
      assignmentFieldViews,
      controlView,
      headerView,
      preparationView,
    }),
    headerView,
    itemViews: worksheet.items.map(buildPrintableWorksheetItemView),
    preparationView,
    showAnswerKey: answerKeyView.show,
  };
}

export function buildPrintableWorksheetPreparationView(
  summary: PrintableAssignmentWorksheetSummary,
  options?: {
    answerKeyAccessView?: PrintableWorksheetAnswerKeyAccessView;
  }
): PrintableWorksheetPreparationView {
  const answerKeyAccessView =
    options?.answerKeyAccessView ??
    buildPrintableWorksheetAnswerKeyAccessView({
      answerKey: summary.showAnswerKey,
      summary,
    });

  return {
    description: printableWorksheetPageCopy.preparationDescription,
    items: [
      buildPrintableWorksheetPreparationItemView({
        description:
          printableWorksheetPageCopy.preparationStudentFieldsDescription,
        id: 'student-fields',
        label: printableWorksheetPageCopy.preparationStudentFieldsLabel,
        value: printableWorksheetPageCopy.preparationStudentFieldsValue,
      }),
      buildPrintableWorksheetPreparationItemView({
        description:
          printableWorksheetPageCopy.preparationResponsePlanDescription,
        id: 'response-plan',
        label: printableWorksheetPageCopy.preparationResponsePlanLabel,
        value: m.assignment_printable_preparation_response_plan_value({
          itemCount: formatPrintableWorksheetOverviewItemCount(
            summary.itemCount
          ),
          responseSummary:
            formatPrintableWorksheetOverviewResponseModes(summary),
        }),
      }),
      buildPrintableWorksheetPreparationItemView({
        description: answerKeyAccessView.description,
        id: 'answer-key',
        label: printableWorksheetPageCopy.preparationAnswerKeyLabel,
        value: answerKeyAccessView.value,
      }),
    ],
    title: printableWorksheetPageCopy.preparationTitle,
  };
}

function buildPrintableWorksheetPreparationItemView({
  description,
  id,
  label,
  value,
}: Omit<PrintableWorksheetPreparationItemView, 'ariaLabel'>) {
  return {
    ariaLabel: buildPrintableWorksheetSemanticAriaLabel({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

export function buildPrintableWorksheetHandoffView({
  assignmentFieldViews,
  controlView,
  headerView,
  preparationView,
}: {
  assignmentFieldViews: PrintableWorksheetAssignmentFieldView[];
  controlView: PrintableWorksheetControlView;
  headerView: PrintableWorksheetHeaderView;
  preparationView: PrintableWorksheetPreparationView;
}): PrintableWorksheetHandoffView {
  return {
    description: preparationView.description,
    itemViews: [
      ...preparationView.items.map(
        buildPrintableWorksheetHandoffPreparationItem
      ),
      buildPrintableWorksheetHandoffAssignmentFieldItem({
        fieldViews: assignmentFieldViews,
        id: 'share-path',
      }),
      buildPrintableWorksheetHandoffItemView({
        description: headerView.assignmentTitle,
        id: 'results-return',
        label: controlView.backToResultsAction.label,
        value: controlView.backToResultsAction.assignmentId,
      }),
      buildPrintableWorksheetHandoffItemView({
        description: controlView.printAction.description,
        id: 'print-action',
        label: controlView.printAction.label,
        value: headerView.printModeLabel,
      }),
    ].filter(isPrintableWorksheetHandoffItemView),
    title: preparationView.title,
  };
}

function buildPrintableWorksheetHandoffPreparationItem(
  itemView: PrintableWorksheetPreparationItemView
): PrintableWorksheetHandoffItemView {
  return buildPrintableWorksheetHandoffItemView({
    description: itemView.description,
    id: itemView.id,
    label: itemView.label,
    value: itemView.value,
  });
}

function buildPrintableWorksheetHandoffAssignmentFieldItem({
  fieldViews,
  id,
}: {
  fieldViews: PrintableWorksheetAssignmentFieldView[];
  id: Extract<PrintableWorksheetHandoffItemId, 'share-path'>;
}) {
  const fieldView = fieldViews.find((view) => view.id === id);
  if (!fieldView) return null;

  return buildPrintableWorksheetHandoffItemView({
    description: fieldView.description,
    id,
    label: fieldView.label,
    value: fieldView.value,
  });
}

function buildPrintableWorksheetHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<PrintableWorksheetHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: buildPrintableWorksheetSemanticAriaLabel({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function isPrintableWorksheetHandoffItemView(
  itemView: PrintableWorksheetHandoffItemView | null
): itemView is PrintableWorksheetHandoffItemView {
  return itemView !== null;
}

export function buildPrintableWorksheetRouteState({
  answerKey,
  assignmentId,
  isError,
  isLoading,
  worksheet,
}: {
  answerKey: boolean;
  assignmentId: string;
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
      assignmentId,
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
  answerKeyAccessView,
  assignmentId,
}: {
  answerKey: boolean;
  answerKeyAccessView: PrintableWorksheetAnswerKeyAccessView;
  assignmentId: string;
}): PrintableWorksheetControlView {
  return {
    answerKeyToggle: {
      accessView: answerKeyAccessView,
      description: printableWorksheetPageCopy.answerKeyDescription,
      label: printableWorksheetPageCopy.answerKeyLabel,
      value: answerKey,
    },
    backToResultsAction: {
      assignmentId,
      label: printableWorksheetPageCopy.backToResultsLabel,
      to: Routes.DashboardAssignmentResults,
    },
    printAction: {
      description: printableWorksheetPageCopy.printButtonDescription,
      label: printableWorksheetPageCopy.printButtonLabel,
    },
  };
}

export function buildPrintableWorksheetAssignmentFieldViews(
  headerView: PrintableWorksheetHeaderView
): PrintableWorksheetAssignmentFieldView[] {
  return [
    buildPrintableWorksheetBlankFieldView({
      id: 'student-name',
      kind: 'blank-line',
      label: printableWorksheetPageCopy.studentNameLabel,
    }),
    buildPrintableWorksheetBlankFieldView({
      id: 'date',
      kind: 'blank-line',
      label: printableWorksheetPageCopy.dateLabel,
    }),
    buildPrintableWorksheetBlankFieldView({
      id: 'score',
      kind: 'blank-line',
      label: printableWorksheetPageCopy.scoreLabel,
    }),
    buildPrintableWorksheetTextFieldView({
      id: 'share-path',
      kind: 'text',
      label: printableWorksheetPageCopy.sharePathLabel,
      value: headerView.sharePath,
    }),
    buildPrintableWorksheetTextFieldView({
      id: 'template',
      kind: 'text',
      label: printableWorksheetPageCopy.templateLabel,
      value: headerView.templateLabel,
    }),
    buildPrintableWorksheetSnapshotSourceFieldView(headerView),
    buildPrintableWorksheetTextFieldView({
      id: 'instructions',
      kind: 'text',
      label: printableWorksheetPageCopy.instructionsLabel,
      value: headerView.instructions,
    }),
    buildPrintableWorksheetTextFieldView({
      id: 'delivery-policy',
      kind: 'text',
      label: printableWorksheetPageCopy.deliveryPolicyLabel,
      value: headerView.deliveryPolicy,
    }),
  ];
}

function buildPrintableWorksheetBlankFieldView({
  id,
  kind,
  label,
}: Pick<PrintableWorksheetBlankFieldView, 'id' | 'kind' | 'label'>) {
  const description = printableWorksheetPageCopy.blankFieldDescription;
  const value = printableWorksheetPageCopy.blankFieldValue;

  return {
    ariaLabel: buildPrintableWorksheetSemanticAriaLabel({
      description,
      label,
      value,
    }),
    description,
    id,
    kind,
    label,
    value,
  };
}

function buildPrintableWorksheetTextFieldView({
  id,
  kind,
  label,
  value,
}: Pick<PrintableWorksheetTextFieldView, 'id' | 'kind' | 'label' | 'value'>) {
  const description = printableWorksheetPageCopy.textFieldDescription;

  return {
    ariaLabel: buildPrintableWorksheetSemanticAriaLabel({
      description,
      label,
      value,
    }),
    description,
    id,
    kind,
    label,
    value,
  };
}

export function buildPrintableWorksheetSnapshotSourceFieldView(
  headerView: PrintableWorksheetHeaderView
): PrintableWorksheetAssignmentFieldView {
  return buildPrintableWorksheetTextFieldView({
    id: 'snapshot-source',
    kind: 'text',
    label: printableWorksheetPageCopy.snapshotSourceLabel,
    value: m.assignment_printable_snapshot_source_value({
      activityTitle: headerView.activityTitle,
      sharePath: headerView.sharePath,
    }),
  });
}

export function buildPrintableWorksheetEmptyState(): PrintableWorksheetEmptyState {
  return {
    description: printableWorksheetPageCopy.emptyDescription,
    title: printableWorksheetPageCopy.emptyTitle,
  };
}

export function buildPrintableWorksheetAnswerKeyView({
  accessView,
  answerKey,
  itemViews,
  worksheet,
}: {
  accessView?: PrintableWorksheetAnswerKeyAccessView;
  answerKey: boolean;
  itemViews: PrintableWorksheetAnswerKeyItemView[];
  worksheet?: PrintableAssignmentWorksheet;
}): PrintableWorksheetAnswerKeyView {
  const summary =
    worksheet !== undefined
      ? summarizePrintableAssignmentWorksheet(worksheet, {
          includeAnswerKey: answerKey,
        })
      : buildPrintableWorksheetAnswerKeyFallbackSummary({
          itemCount: itemViews.length,
          showAnswerKey: answerKey && itemViews.length > 0,
        });
  const show = summary.showAnswerKey;

  return {
    accessView:
      accessView ??
      buildPrintableWorksheetAnswerKeyAccessView({
        answerKey,
        summary,
      }),
    description: printableWorksheetPageCopy.answerKeyDescription,
    itemViews,
    show,
    title: printableWorksheetPageCopy.answerKeyTitle,
  };
}

export function buildPrintableWorksheetAnswerKeyAccessView({
  answerKey,
  summary,
}: {
  answerKey: boolean;
  summary: PrintableAssignmentWorksheetSummary;
}): PrintableWorksheetAnswerKeyAccessView {
  const state = getPrintableWorksheetAnswerKeyAccessState({
    answerKey,
    summary,
  });
  const { description, value } =
    getPrintableWorksheetAnswerKeyAccessCopy(state);
  const label = printableWorksheetPageCopy.answerKeyAccessLabel;

  return {
    ariaLabel: m.assignment_printable_answer_key_access_aria_label({
      description,
      label,
      value,
    }),
    description,
    label,
    state,
    value,
  };
}

function buildPrintableWorksheetSemanticAriaLabel({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return m.assignment_printable_semantic_item_aria_label({
    description,
    label,
    value,
  });
}

function getPrintableWorksheetAnswerKeyAccessState({
  answerKey,
  summary,
}: {
  answerKey: boolean;
  summary: PrintableAssignmentWorksheetSummary;
}): PrintableWorksheetAnswerKeyAccessState {
  if (!answerKey) return 'hidden';
  if (summary.showAnswerKey) return 'included';

  return 'unavailable';
}

function getPrintableWorksheetAnswerKeyAccessCopy(
  state: PrintableWorksheetAnswerKeyAccessState
) {
  switch (state) {
    case 'hidden':
      return {
        description:
          printableWorksheetPageCopy.answerKeyAccessHiddenDescription,
        value: printableWorksheetPageCopy.answerKeyAccessHiddenValue,
      };
    case 'included':
      return {
        description:
          printableWorksheetPageCopy.answerKeyAccessIncludedDescription,
        value: printableWorksheetPageCopy.answerKeyAccessIncludedValue,
      };
    case 'unavailable':
      return {
        description:
          printableWorksheetPageCopy.answerKeyAccessUnavailableDescription,
        value: printableWorksheetPageCopy.answerKeyAccessUnavailableValue,
      };
  }
}

function buildPrintableWorksheetAnswerKeyFallbackSummary({
  itemCount,
  showAnswerKey,
}: {
  itemCount: number;
  showAnswerKey: boolean;
}): PrintableAssignmentWorksheetSummary {
  const answerKeyItemCount = normalizeRuntimeDisplayCount(itemCount, {
    min: 0,
  });

  return {
    answerKeyItemCount,
    choiceBankItemCount: 0,
    itemCount: answerKeyItemCount,
    responseModeCount: 0,
    responseModes: [],
    showAnswerKey,
  };
}

export function buildPrintableWorksheetItemView(
  item: PrintableWorksheetItem
): PrintableWorksheetItemView {
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
    layout: item.layout,
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
): PrintableWorksheetAnswerKeyItemView {
  const acceptedAnswers = formatPrintableWorksheetAcceptedAnswers(
    item.acceptedAnswers
  );
  const explanation = normalizeOptionalRuntimeDisplayText(item.explanation);
  const sequenceLabel = m.assignment_printable_item_sequence({
    sequenceNumber: normalizePrintableWorksheetSequenceNumber(
      item.sequenceNumber
    ),
  });

  const headingLabel = m.assignment_printable_item_heading({
    kindLabel: formatRuntimeItemKindLabel(item),
    sequenceLabel,
  });
  const prompt = formatPrintableWorksheetAnswerKeyPrompt(item);

  return {
    ariaLabel: buildPrintableWorksheetSemanticAriaLabel({
      description: prompt,
      label: headingLabel,
      value: formatPrintableWorksheetValue(item.answer),
    }),
    detailViews: buildPrintableWorksheetAnswerKeyDetailViews({
      acceptedAnswers,
      answer: item.answer,
      explanation,
      sequenceNumber: item.sequenceNumber,
    }),
    headingLabel,
    id: item.id,
    prompt,
  };
}

function buildPrintableWorksheetAnswerKeyDetailViews({
  acceptedAnswers,
  answer,
  explanation,
  sequenceNumber,
}: {
  acceptedAnswers: string;
  answer: string | undefined;
  explanation: string | undefined;
  sequenceNumber: number;
}): PrintableWorksheetAnswerKeyDetailView[] {
  return [
    buildPrintableWorksheetAnswerKeyDetailView({
      id: 'expected-answer',
      label: m.assignment_printable_answer_key_item({
        answer: formatPrintableWorksheetValue(answer),
        sequenceNumber:
          normalizePrintableWorksheetSequenceNumber(sequenceNumber),
      }),
      tone: 'primary',
    }),
    ...(acceptedAnswers
      ? [
          buildPrintableWorksheetAnswerKeyDetailView({
            id: 'accepted-answers',
            label: m.assignment_printable_answer_key_accepted({
              acceptedAnswers,
            }),
            tone: 'secondary',
          }),
        ]
      : []),
    ...(explanation
      ? [
          buildPrintableWorksheetAnswerKeyDetailView({
            id: 'explanation',
            label: m.assignment_printable_answer_key_explanation({
              explanation,
            }),
            tone: 'secondary',
          }),
        ]
      : []),
  ];
}

function buildPrintableWorksheetAnswerKeyDetailView({
  id,
  label,
  tone,
}: Omit<PrintableWorksheetAnswerKeyDetailView, 'ariaLabel'>) {
  return {
    ariaLabel: label,
    id,
    label,
    tone,
  };
}

function buildPrintableWorksheetChoiceBankView(
  item: PrintableWorksheetItem
): PrintableWorksheetChoiceBankView {
  const showChoiceBank = shouldShowPrintableWorksheetChoiceBank(item);
  const choices = showChoiceBank
    ? (normalizeRuntimeChoiceList(item.choices) ?? [])
    : [];
  const label =
    showChoiceBank && choices.length > 0
      ? getPrintableWorksheetChoiceBankLabel(item.choicePresentation)
      : null;
  const summary = formatPrintableWorksheetChoiceBankSummary({
    count: choices.length,
    presentation: item.choicePresentation,
    showChoiceBank,
  });

  return {
    choices: choices.map((choice, index) =>
      buildPrintableWorksheetChoiceBankChoiceView({
        choice,
        description: summary ?? '',
        index,
        itemId: item.id,
        label,
      })
    ),
    emptySummary:
      showChoiceBank && choices.length === 0
        ? m.assignment_printable_choice_bank_empty()
        : null,
    label,
    presentation: item.choicePresentation,
    show: showChoiceBank,
    showIndexLabels: showChoiceBank && item.choicePresentation !== 'group-bank',
    summary,
  };
}

function buildPrintableWorksheetChoiceBankChoiceView({
  choice,
  description,
  index,
  itemId,
  label,
}: {
  choice: string;
  description: string;
  index: number;
  itemId: string;
  label: string | null;
}) {
  const indexLabel = formatPrintableWorksheetChoiceIndex(index);
  const choiceLabel = label ?? indexLabel;

  return {
    ariaLabel: buildPrintableWorksheetSemanticAriaLabel({
      description,
      label: choiceLabel,
      value: choice,
    }),
    choice,
    description,
    indexLabel,
    key: `${itemId}-choice-${index}`,
  };
}

function shouldShowPrintableWorksheetChoiceBank(item: PrintableWorksheetItem) {
  return item.choicePresentation !== 'none';
}

export function getPrintableWorksheetAnswerLines(
  item: PrintableWorksheetItem
): PrintableWorksheetAnswerLineView[] {
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

function formatPrintableWorksheetOverviewItemCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count, { min: 0 });

  if (normalizedCount === 1) {
    return m.assignment_printable_overview_items_one({
      count: normalizedCount,
    });
  }

  return m.assignment_printable_overview_items_many({
    count: normalizedCount,
  });
}

function formatPrintableWorksheetOverviewResponseModes(
  summary: Pick<
    PrintableAssignmentWorksheetSummary,
    'responseModeCount' | 'responseModes'
  >
) {
  if (summary.responseModeCount === 1 && summary.responseModes[0]) {
    return m.assignment_printable_overview_response_mode_single({
      mode: formatPrintableWorksheetOverviewResponseModeLabel(
        summary.responseModes[0]
      ),
    });
  }

  return m.assignment_printable_overview_response_modes_many({
    count: summary.responseModeCount,
  });
}

function formatPrintableWorksheetOverviewResponseModeLabel(
  responseMode: PrintableWorksheetResponseMode
) {
  switch (responseMode) {
    case 'choice':
      return m.assignment_printable_overview_response_choice();
    case 'group-choice':
      return m.assignment_printable_overview_response_group_choice();
    case 'line-match':
      return m.assignment_printable_overview_response_line_match();
    case 'matching-pairs':
      return m.assignment_printable_overview_response_matching_pairs();
    case 'short-answer':
      return m.assignment_printable_overview_response_short_answer();
  }
}

function formatPrintableWorksheetChoiceBankSummary({
  count,
  presentation,
  showChoiceBank,
}: {
  count: number;
  presentation: PrintableWorksheetChoicePresentation;
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
  presentation: PrintableWorksheetChoicePresentation
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
