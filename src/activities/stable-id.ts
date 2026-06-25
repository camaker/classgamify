export const ACTIVITY_STABLE_ID_LENGTH = {
  max: 40,
} as const;

export function makeActivityStableId(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, ACTIVITY_STABLE_ID_LENGTH.max);
}
