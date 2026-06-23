export function normalizeAssignmentShareSlug(shareSlug: string) {
  return shareSlug.normalize('NFKC').trim();
}

export function isSameAssignmentShareSlug(left: string, right: string) {
  return (
    normalizeAssignmentShareSlug(left) === normalizeAssignmentShareSlug(right)
  );
}
