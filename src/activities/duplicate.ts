import { m } from '@/locale/paraglide/messages';

const MAX_ACTIVITY_TITLE_LENGTH = 120;

export function buildDuplicatedActivityTitle(title: string) {
  const normalizedTitle = normalizeActivitySourceTitle(title);
  const maxSourceLength = getDuplicatedTitleMaxSourceLength();

  return formatDuplicatedTitle(
    truncateActivitySourceTitle(normalizedTitle, maxSourceLength)
  );
}

export function buildRemixedActivityTitle({
  sourceTitle,
  targetShortName,
}: {
  sourceTitle: string;
  targetShortName: string;
}) {
  const normalizedTitle = normalizeActivitySourceTitle(sourceTitle);
  const normalizedTargetShortName =
    normalizeActivityTargetShortName(targetShortName);
  const maxSourceLength = getRemixedTitleMaxSourceLength(
    normalizedTargetShortName
  );

  return formatRemixedTitle({
    sourceTitle: truncateActivitySourceTitle(normalizedTitle, maxSourceLength),
    targetShortName: normalizedTargetShortName,
  });
}

function normalizeActivitySourceTitle(title: string) {
  return (
    title.normalize('NFKC').replace(/\s+/g, ' ').trim() ||
    m.activity_duplicate_untitled_title()
  );
}

function normalizeActivityTargetShortName(targetShortName: string) {
  return (
    targetShortName.normalize('NFKC').replace(/\s+/g, ' ').trim() ||
    m.activity_remix_title_template_fallback()
  );
}

function truncateActivitySourceTitle(title: string, maxLength: number) {
  if (title.length <= maxLength) {
    return title;
  }

  return `${title.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function formatDuplicatedTitle(title: string) {
  return m.activity_duplicate_title_format({ title });
}

function formatRemixedTitle({
  sourceTitle,
  targetShortName,
}: {
  sourceTitle: string;
  targetShortName: string;
}) {
  return m.activity_remix_title_format({
    template: targetShortName,
    title: sourceTitle,
  });
}

function getDuplicatedTitleMaxSourceLength() {
  return MAX_ACTIVITY_TITLE_LENGTH - formatDuplicatedTitle('').length;
}

function getRemixedTitleMaxSourceLength(targetShortName: string) {
  return (
    MAX_ACTIVITY_TITLE_LENGTH -
    formatRemixedTitle({ sourceTitle: '', targetShortName }).length
  );
}
