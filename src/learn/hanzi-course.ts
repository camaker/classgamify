type CourseLocale = 'en' | 'zh';

type LocalizedText = Record<CourseLocale, string>;

const HSK1_LESSON_ORDER = [
  'Foundations',
  'Time',
  'Nature',
  'Core Words',
] as const;

type Hsk1LessonId = (typeof HSK1_LESSON_ORDER)[number];

type LessonCharacterDefinition = {
  character: string;
  pinyin: string;
  meaning: LocalizedText;
  hint: LocalizedText;
  strokes: number;
  lesson: Hsk1LessonId;
  radical?: string;
  examples: string[];
  premium?: boolean;
};

export type LessonCharacter = Omit<
  LessonCharacterDefinition,
  'meaning' | 'hint'
> & {
  meaning: string;
  hint: string;
  lessonLabel: string;
};

export type CourseLesson = {
  id: Hsk1LessonId;
  title: string;
  description: string;
  characters: LessonCharacter[];
  freeCount: number;
  lockedCount: number;
  totalStrokes: number;
};

const HSK1_LESSON_LABELS: Record<Hsk1LessonId, LocalizedText> = {
  Foundations: {
    en: 'Foundations',
    zh: '基础象形字',
  },
  Time: {
    en: 'Time',
    zh: '时间',
  },
  Nature: {
    en: 'Nature',
    zh: '自然',
  },
  'Core Words': {
    en: 'Core Words',
    zh: '核心词',
  },
};

const HSK1_LESSON_DESCRIPTIONS: Record<Hsk1LessonId, LocalizedText> = {
  Foundations: {
    en: 'Start with compact shapes that appear everywhere in beginner Chinese.',
    zh: '先学最常见、结构清楚的入门汉字。',
  },
  Time: {
    en: 'Connect character shape with daily calendar words.',
    zh: '把字形和日期、月份这些日常词连起来。',
  },
  Nature: {
    en: 'Practice visual characters that make stroke direction easier to remember.',
    zh: '用山水火木这些形象字建立笔顺感觉。',
  },
  'Core Words': {
    en: 'Move into high-frequency words that unlock early HSK reading.',
    zh: '进入高频词，为 HSK 入门阅读做准备。',
  },
};

const HSK1_STARTER_DEFINITIONS: LessonCharacterDefinition[] = [
  {
    character: '人',
    pinyin: 'rén',
    meaning: { en: 'person', zh: '人、人类' },
    hint: {
      en: 'Two strokes, like a person standing.',
      zh: '两笔完成，像一个站立的人。',
    },
    strokes: 2,
    lesson: 'Foundations',
    radical: '人',
    examples: ['人', '大人', '中国人'],
  },
  {
    character: '口',
    pinyin: 'kǒu',
    meaning: { en: 'mouth / entrance', zh: '嘴巴、入口' },
    hint: {
      en: 'A box shape with one opening stroke and a closing line.',
      zh: '像一个方框，先开口，再收住。',
    },
    strokes: 3,
    lesson: 'Foundations',
    radical: '口',
    examples: ['口', '入口', '口语'],
  },
  {
    character: '日',
    pinyin: 'rì',
    meaning: { en: 'sun / day', zh: '太阳、日子' },
    hint: {
      en: 'A sun box with one horizontal line inside.',
      zh: '外面像太阳的框，中间加一横。',
    },
    strokes: 4,
    lesson: 'Foundations',
    radical: '日',
    examples: ['日', '今日', '生日'],
  },
  {
    character: '月',
    pinyin: 'yuè',
    meaning: { en: 'moon / month', zh: '月亮、月份' },
    hint: {
      en: 'A narrow body with two short inner strokes.',
      zh: '细长外形，中间两短横。',
    },
    strokes: 4,
    lesson: 'Time',
    radical: '月',
    examples: ['月', '一月', '明月'],
  },
  {
    character: '山',
    pinyin: 'shān',
    meaning: { en: 'mountain', zh: '山、山峰' },
    hint: {
      en: 'Three peaks rising from one base.',
      zh: '三座山峰从底部立起来。',
    },
    strokes: 3,
    lesson: 'Nature',
    radical: '山',
    examples: ['山', '上山', '火山'],
  },
  {
    character: '水',
    pinyin: 'shuǐ',
    meaning: { en: 'water', zh: '水' },
    hint: {
      en: 'A central stroke with flowing side strokes.',
      zh: '中间主笔，两侧像水流散开。',
    },
    strokes: 4,
    lesson: 'Nature',
    radical: '水',
    examples: ['水', '水果', '喝水'],
  },
  {
    character: '火',
    pinyin: 'huǒ',
    meaning: { en: 'fire', zh: '火' },
    hint: {
      en: 'Two sparks around a central person-like shape.',
      zh: '两点像火星，中间像火焰展开。',
    },
    strokes: 4,
    lesson: 'Nature',
    radical: '火',
    examples: ['火', '火车', '火山'],
  },
  {
    character: '木',
    pinyin: 'mù',
    meaning: { en: 'tree / wood', zh: '树木、木头' },
    hint: {
      en: 'A trunk, branch, and roots in four strokes.',
      zh: '横是枝，竖是树干，撇捺像树根。',
    },
    strokes: 4,
    lesson: 'Nature',
    radical: '木',
    examples: ['木', '木头', '树木'],
  },
  {
    character: '大',
    pinyin: 'dà',
    meaning: { en: 'big', zh: '大' },
    hint: {
      en: 'A person stretching arms wide.',
      zh: '像一个人张开手臂，表示很大。',
    },
    strokes: 3,
    lesson: 'Core Words',
    radical: '大',
    examples: ['大', '大人', '大学'],
  },
  {
    character: '小',
    pinyin: 'xiǎo',
    meaning: { en: 'small', zh: '小' },
    hint: {
      en: 'A center hook with two small side dots.',
      zh: '中间竖钩，两边小点。',
    },
    strokes: 3,
    lesson: 'Core Words',
    radical: '小',
    examples: ['小', '小孩', '小姐'],
  },
  {
    character: '中',
    pinyin: 'zhōng',
    meaning: { en: 'middle / China', zh: '中间、中国' },
    hint: {
      en: 'A box cut through by one vertical line.',
      zh: '一个口字，中间一竖穿过。',
    },
    strokes: 4,
    lesson: 'Core Words',
    radical: '丨',
    examples: ['中', '中国', '中午'],
    premium: true,
  },
  {
    character: '国',
    pinyin: 'guó',
    meaning: { en: 'country', zh: '国家' },
    hint: {
      en: 'An outer border wraps the jade-like inner component.',
      zh: '外面大框包住里面的玉。',
    },
    strokes: 8,
    lesson: 'Core Words',
    radical: '囗',
    examples: ['国', '中国', '美国'],
    premium: true,
  },
];

const FREE_CHARACTER_LIMIT = 10;

function getHsk1StarterCharacters(locale: CourseLocale = 'en') {
  return HSK1_STARTER_DEFINITIONS.map((item) => ({
    ...item,
    meaning: item.meaning[locale],
    hint: item.hint[locale],
    lessonLabel: HSK1_LESSON_LABELS[item.lesson][locale],
  }));
}

export function getFreeCharacters(locale: CourseLocale = 'en') {
  return getHsk1StarterCharacters(locale).slice(0, FREE_CHARACTER_LIMIT);
}

function getLockedCharacters(locale: CourseLocale = 'en') {
  return getHsk1StarterCharacters(locale).slice(FREE_CHARACTER_LIMIT);
}

export function getHsk1CourseLessons(
  locale: CourseLocale = 'en'
): CourseLesson[] {
  const characters = getHsk1StarterCharacters(locale);

  return HSK1_LESSON_ORDER.map((lesson) => {
    const lessonCharacters = characters.filter(
      (item) => item.lesson === lesson
    );

    return {
      id: lesson,
      title: HSK1_LESSON_LABELS[lesson][locale],
      description: HSK1_LESSON_DESCRIPTIONS[lesson][locale],
      characters: lessonCharacters,
      freeCount: lessonCharacters.filter((item) => !item.premium).length,
      lockedCount: lessonCharacters.filter((item) => item.premium).length,
      totalStrokes: lessonCharacters.reduce(
        (total, item) => total + item.strokes,
        0
      ),
    };
  });
}

export function getHsk1CharacterList() {
  return HSK1_STARTER_DEFINITIONS.map((item) => item.character);
}

export function getHanziPath(character: string) {
  return `/hanzi/${encodeURIComponent(character)}`;
}

export function findHsk1Character(
  character: string,
  locale: CourseLocale = 'en'
) {
  const normalizedCharacter = decodeCharacterParam(character);
  return getHsk1StarterCharacters(locale).find(
    (item) => item.character === normalizedCharacter
  );
}

export function getPracticeTargetCharacter(
  character: string,
  locale: CourseLocale = 'en'
) {
  const lessonCharacter = findHsk1Character(character, locale);
  if (!lessonCharacter) {
    return getFreeCharacters(locale)[0]?.character;
  }

  if (!lessonCharacter.premium) {
    return lessonCharacter.character;
  }

  const lesson = getHsk1CourseLessons(locale).find(
    (item) => item.id === lessonCharacter.lesson
  );
  return (
    lesson?.characters.find((item) => !item.premium)?.character ??
    getFreeCharacters(locale)[0]?.character
  );
}

export function getWorksheetCharactersForCharacter(
  character: string,
  locale: CourseLocale = 'en'
) {
  const lessonCharacter = findHsk1Character(character, locale);
  if (!lessonCharacter) {
    return getFreeCharacters(locale).map((item) => item.character);
  }

  const lesson = getHsk1CourseLessons(locale).find(
    (item) => item.id === lessonCharacter.lesson
  );
  return (
    lesson?.characters
      .filter((item) => !item.premium)
      .map((item) => item.character) ??
    getFreeCharacters(locale).map((item) => item.character)
  );
}

export function getCourseStats() {
  const free = getFreeCharacters();
  const locked = getLockedCharacters();

  return {
    total: HSK1_STARTER_DEFINITIONS.length,
    free: free.length,
    locked: locked.length,
    strokes: HSK1_STARTER_DEFINITIONS.reduce(
      (total, item) => total + item.strokes,
      0
    ),
  };
}

function decodeCharacterParam(character: string) {
  try {
    return decodeURIComponent(character).trim();
  } catch {
    return character.trim();
  }
}
