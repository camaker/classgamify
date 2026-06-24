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
    deliveryPolicy: worksheet.deliveryPolicyText,
    instructions:
      worksheet.instructions || printableWorksheetPageCopy.instructionsFallback,
    sharePath: worksheet.sharePath,
    templateLabel: getTemplateByType(worksheet.templateType).name,
  };
}

export function buildPrintableWorksheetItemView(item: PrintableWorksheetItem) {
  return {
    choiceBank: buildPrintableWorksheetChoiceBankView(item),
    choicePresentation: item.choicePresentation,
    choices: item.choices,
    kindLabel: formatRuntimeItemKindLabel(item),
    prompt: formatRuntimeItemPrompt(item),
    responseHelp: getPrintableWorksheetResponseHelp(item.responseMode),
    sequenceLabel: m.assignment_printable_item_sequence({
      sequenceNumber: item.sequenceNumber,
    }),
  };
}

function buildPrintableWorksheetChoiceBankView(item: PrintableWorksheetItem) {
  return {
    choices: item.choices.map((choice, index) => ({
      choice,
      indexLabel: formatPrintableWorksheetChoiceIndex(index),
    })),
    presentation: item.choicePresentation,
    showIndexLabels: item.choicePresentation !== 'group-bank',
  };
}

export function getPrintableWorksheetAnswerLines(item: PrintableWorksheetItem) {
  return Array.from({ length: item.answerSpaceLines }, (_, index) => index);
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
