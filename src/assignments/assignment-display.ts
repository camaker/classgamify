import { normalizeRuntimeDisplayText } from '@/assignments/runtime-display';

export function formatAssignmentDisplayTitle(value: string | null | undefined) {
  return formatAssignmentDisplayText(value);
}

export function formatAssignmentDisplayText(value: string | null | undefined) {
  return normalizeRuntimeDisplayText(value);
}
