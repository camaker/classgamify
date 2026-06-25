import { m } from '@/locale/paraglide/messages';
import { normalizeActivityMaterialReferences } from '@/activities/material-references';
import {
  ACTIVITY_TITLE_LENGTH,
  type ActivityContent,
  type ActivityQuestion,
} from '@/activities/types';

export function cloneActivityContentForDerivative(
  content: ActivityContent
): ActivityContent {
  return {
    difficulty: content.difficulty,
    gradeBand: content.gradeBand,
    groups: content.groups.map((group) => ({
      ...group,
      items: [...group.items],
    })),
    language: content.language,
    learningGoal: content.learningGoal,
    pairs: content.pairs.map((pair) => ({ ...pair })),
    questions: content.questions.map(cloneActivityQuestion),
    sourceMaterials: normalizeActivityMaterialReferences(
      content.sourceMaterials
    ),
    sourceSummary: content.sourceSummary,
    subject: content.subject,
    teacherNotes: [...content.teacherNotes],
    vocabulary: [...content.vocabulary],
  };
}

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

function cloneActivityQuestion(question: ActivityQuestion): ActivityQuestion {
  return {
    answer: question.answer,
    ...(question.explanation !== undefined
      ? { explanation: question.explanation }
      : {}),
    id: question.id,
    ...(question.options
      ? {
          options: question.options.map((option) => ({
            ...option,
          })),
        }
      : {}),
    prompt: question.prompt,
  };
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
  return ACTIVITY_TITLE_LENGTH.max - formatDuplicatedTitle('').length;
}

function getRemixedTitleMaxSourceLength(targetShortName: string) {
  return (
    ACTIVITY_TITLE_LENGTH.max -
    formatRemixedTitle({ sourceTitle: '', targetShortName }).length
  );
}
