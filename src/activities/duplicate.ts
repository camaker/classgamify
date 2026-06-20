const DUPLICATE_TITLE_PREFIX = 'Copy of ';
const REMIX_TITLE_SEPARATOR = ' ';
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

export function buildRemixedActivityTitle({
  sourceTitle,
  targetShortName,
}: {
  sourceTitle: string;
  targetShortName: string;
}) {
  const normalizedTitle =
    sourceTitle.normalize('NFKC').replace(/\s+/g, ' ').trim() ||
    'Untitled activity';
  const suffix = `${REMIX_TITLE_SEPARATOR}(${targetShortName})`;
  const maxSourceLength = MAX_ACTIVITY_TITLE_LENGTH - suffix.length;

  if (normalizedTitle.length <= maxSourceLength) {
    return `${normalizedTitle}${suffix}`;
  }

  return `${normalizedTitle.slice(0, maxSourceLength - 3).trimEnd()}...${suffix}`;
}
