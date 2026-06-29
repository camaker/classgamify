export const ASSIGNMENT_RESULT_COPY_TEXT_FORMAT = {
  lineBreak: '\n',
} as const;

type AssignmentResultCopyLine = string | null | undefined;

export function joinAssignmentResultCopyLines(
  lines: AssignmentResultCopyLine[]
) {
  const normalizedLines: string[] = [];
  let previousLineWasBlank = false;

  for (const line of lines) {
    const normalizedLine = formatAssignmentResultCopyLine(line);
    const lineIsBlank = normalizedLine.length === 0;

    if (lineIsBlank && previousLineWasBlank) continue;

    normalizedLines.push(normalizedLine);
    previousLineWasBlank = lineIsBlank;
  }

  while (normalizedLines[0] === '') {
    normalizedLines.shift();
  }
  while (normalizedLines.at(-1) === '') {
    normalizedLines.pop();
  }

  return normalizedLines.join(ASSIGNMENT_RESULT_COPY_TEXT_FORMAT.lineBreak);
}

export function countAssignmentResultCopyLines(text: string) {
  return text
    .split(/\r?\n/)
    .filter((line) => formatAssignmentResultCopyLine(line).length > 0).length;
}

export function formatAssignmentResultCopyTitle(value: string) {
  return formatAssignmentResultCopyLine(value);
}

export function formatAssignmentResultCopyLine(
  value: AssignmentResultCopyLine
) {
  return (value ?? '')
    .normalize('NFKC')
    .replace(/[ \t]+/gu, ' ')
    .trim();
}

export function formatAssignmentResultCopyOrdinal(index: number) {
  if (!Number.isFinite(index)) return 1;

  return Math.floor(Math.max(0, index)) + 1;
}
