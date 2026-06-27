export const ASSIGNMENT_RESULT_COPY_TEXT_FORMAT = {
  lineBreak: '\n',
} as const;

export function joinAssignmentResultCopyLines(lines: string[]) {
  return lines.join(ASSIGNMENT_RESULT_COPY_TEXT_FORMAT.lineBreak);
}

export function formatAssignmentResultCopyOrdinal(index: number) {
  if (!Number.isFinite(index)) return 1;

  return Math.floor(Math.max(0, index)) + 1;
}
