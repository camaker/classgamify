import type { LessonCharacter } from '@/learn/hanzi-course';

const PROGRESS_STORAGE_KEY = 'lang-study:beginner-hanzi-progress:v1';

export type CharacterProgress = {
  completed: boolean;
  completedAt?: string;
  correctStrokes: number;
  mistakeStrokes?: number[];
  mistakes: number;
};

export type StoredProgress = Record<string, CharacterProgress>;

export type HanziReviewItem = {
  character: LessonCharacter;
  index: number;
  progress: CharacterProgress;
};

export type NextPracticeTarget = {
  character: LessonCharacter;
  index: number;
};

export type HanziProgressSummary = {
  cleanCount: number;
  completedCount: number;
  lessonComplete: boolean;
  nextPracticeTarget?: NextPracticeTarget;
  progressValue: number;
  reviewCharacters: string[];
  reviewItems: HanziReviewItem[];
  total: number;
};

function getCompletedAtTime(completedAt?: string) {
  if (!completedAt) return Number.POSITIVE_INFINITY;

  const completedTime = Date.parse(completedAt);
  return Number.isNaN(completedTime) ? Number.POSITIVE_INFINITY : completedTime;
}

export function readStoredHanziProgress(): StoredProgress {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};

    return parsed as StoredProgress;
  } catch {
    return {};
  }
}

export function writeStoredHanziProgress(progress: StoredProgress) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function getHanziProgressSummary(
  characters: LessonCharacter[],
  progress: StoredProgress
): HanziProgressSummary {
  const completedCount = characters.filter(
    (item) => progress[item.character]?.completed
  ).length;
  const cleanCount = characters.filter((item) => {
    const itemProgress = progress[item.character];
    return itemProgress?.completed && itemProgress.mistakes === 0;
  }).length;
  const reviewItems = characters
    .map((character, index) => ({
      character,
      index,
      progress: progress[character.character],
    }))
    .filter(
      (item): item is HanziReviewItem =>
        Boolean(item.progress?.completed) && item.progress.mistakes > 0
    )
    .sort(
      (a, b) =>
        b.progress.mistakes - a.progress.mistakes ||
        getCompletedAtTime(a.progress.completedAt) -
          getCompletedAtTime(b.progress.completedAt)
    );
  const nextPracticeIndex = characters.findIndex(
    (item) => !progress[item.character]?.completed
  );
  const nextPracticeTarget =
    nextPracticeIndex >= 0
      ? {
          character: characters[nextPracticeIndex],
          index: nextPracticeIndex,
        }
      : undefined;

  return {
    cleanCount,
    completedCount,
    lessonComplete: completedCount === characters.length,
    nextPracticeTarget,
    progressValue:
      characters.length > 0
        ? Math.round((completedCount / characters.length) * 100)
        : 0,
    reviewCharacters: reviewItems.map((item) => item.character.character),
    reviewItems,
    total: characters.length,
  };
}
