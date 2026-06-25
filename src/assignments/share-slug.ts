export const ASSIGNMENT_SHARE_SLUG_LENGTH = {
  generated: 10,
  max: 80,
  min: 1,
} as const;

export function normalizeAssignmentShareSlug(shareSlug: string) {
  return shareSlug.normalize('NFKC').trim();
}

export function isSameAssignmentShareSlug(left: string, right: string) {
  return (
    normalizeAssignmentShareSlug(left) === normalizeAssignmentShareSlug(right)
  );
}
