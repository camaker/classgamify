const DUPLICATE_TITLE_PREFIX = 'Copy of ';
const MAX_ACTIVITY_TITLE_LENGTH = 120;

export function buildDuplicatedActivityTitle(title: string) {
  const normalizedTitle =
    title.normalize('NFKC').replace(/\s+/g, ' ').trim() || 'Untitled activity';
  const maxSourceLength =
    MAX_ACTIVITY_TITLE_LENGTH - DUPLICATE_TITLE_PREFIX.length;

  if (normalizedTitle.length <= maxSourceLength) {
    return `${DUPLICATE_TITLE_PREFIX}${normalizedTitle}`;
  }

  return `${DUPLICATE_TITLE_PREFIX}${normalizedTitle
    .slice(0, maxSourceLength - 3)
    .trimEnd()}...`;
}
