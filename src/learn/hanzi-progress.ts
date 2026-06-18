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
  activeDayCount: number;
  cleanCount: number;
  completedCount: number;
  currentStreakDays: number;
  lastPracticeAt?: string;
  lessonComplete: boolean;
  nextPracticeTarget?: NextPracticeTarget;
  practicedToday: boolean;
  progressValue: number;
  reviewCharacters: string[];
  reviewItems: HanziReviewItem[];
  total: number;
};

export function getDisplayStrokeNumber(strokeIndex: number) {
  return strokeIndex + 1;
}

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
  const scopedProgress = characters
    .map((item) => progress[item.character])
    .filter((item): item is CharacterProgress => Boolean(item));
  const practiceStats = getHanziPracticeStats(scopedProgress);
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
    activeDayCount: practiceStats.activeDayCount,
    cleanCount,
    completedCount,
    currentStreakDays: practiceStats.currentStreakDays,
    lastPracticeAt: practiceStats.lastPracticeAt,
    lessonComplete: completedCount === characters.length,
    nextPracticeTarget,
    practicedToday: practiceStats.practicedToday,
    progressValue:
      characters.length > 0
        ? Math.round((completedCount / characters.length) * 100)
        : 0,
    reviewCharacters: reviewItems.map((item) => item.character.character),
    reviewItems,
    total: characters.length,
  };
}

function getHanziPracticeStats(progressItems: CharacterProgress[]) {
  const completedItems = progressItems
    .filter((item) => item.completed && item.completedAt)
    .map((item) => ({
      completedAt: item.completedAt as string,
      completedTime: Date.parse(item.completedAt as string),
    }))
    .filter((item) => !Number.isNaN(item.completedTime));

  if (completedItems.length === 0) {
    return {
      activeDayCount: 0,
      currentStreakDays: 0,
      lastPracticeAt: undefined,
      practicedToday: false,
    };
  }

  const dayKeys = new Set(
    completedItems.map((item) => getLocalDayKey(new Date(item.completedTime)))
  );
  const today = getLocalDayStart(new Date());
  const yesterday = getOffsetLocalDay(today, -1);
  const todayKey = getLocalDayKey(today);
  const yesterdayKey = getLocalDayKey(yesterday);
  const practicedToday = dayKeys.has(todayKey);
  const streakStart = practicedToday
    ? today
    : dayKeys.has(yesterdayKey)
      ? yesterday
      : null;
  let currentStreakDays = 0;

  if (streakStart) {
    let currentDay = streakStart;

    while (dayKeys.has(getLocalDayKey(currentDay))) {
      currentStreakDays += 1;
      currentDay = getOffsetLocalDay(currentDay, -1);
    }
  }

  return {
    activeDayCount: dayKeys.size,
    currentStreakDays,
    lastPracticeAt: completedItems.reduce((latest, item) =>
      item.completedTime > latest.completedTime ? item : latest
    ).completedAt,
    practicedToday,
  };
}

function getLocalDayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getOffsetLocalDay(date: Date, offset: number) {
  const nextDate = getLocalDayStart(date);
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
}

function getLocalDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
