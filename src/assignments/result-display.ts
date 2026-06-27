import { m } from '@/locale/paraglide/messages';

type AssignmentResultPromptLabelInput = {
  index?: number;
  itemNumberLabel?: string;
  prompt: string;
};

export function formatAssignmentResultItemNumberLabel(index: number) {
  return m.assignment_result_item_number_label({
    index: normalizeAssignmentResultIndex(index) + 1,
  });
}

export function formatAssignmentResultPromptLabel({
  index,
  itemNumberLabel,
  prompt,
}: AssignmentResultPromptLabelInput) {
  return m.assignment_result_prompt_label({
    itemNumberLabel:
      itemNumberLabel ?? formatAssignmentResultItemNumberLabel(index ?? 0),
    prompt,
  });
}

export function formatAssignmentResultFraction(value: number, total: number) {
  const normalizedValue = normalizeAssignmentResultFractionNumber(value);
  const normalizedTotal = normalizeAssignmentResultFractionNumber(total);

  if (normalizedValue === undefined || normalizedTotal === undefined) {
    return m.assignment_result_empty_value();
  }

  return m.assignment_result_fraction({
    total: normalizedTotal,
    value: normalizedValue,
  });
}

export function joinAssignmentResultSearchSummaryParts(parts: string[]) {
  return parts.join(m.assignment_result_search_summary_separator());
}

function normalizeAssignmentResultIndex(index: number) {
  if (!Number.isFinite(index)) return 0;
  return Math.floor(Math.max(0, index));
}

function normalizeAssignmentResultFractionNumber(value: number) {
  if (!Number.isFinite(value)) return undefined;
  return Math.floor(Math.max(0, value));
}
