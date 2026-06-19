type CourseLocale = 'en' | 'zh';

type LocalizedText = Record<CourseLocale, string>;

const HSK1_LESSON_ORDER = [
  'Foundations',
  'Numbers',
  'Time',
  'Nature',
  'People',
  'Places',
  'Core Words',
  'Daily Actions',
  'Questions',
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
  Numbers: {
    en: 'Numbers',
    zh: '数字',
  },
  Time: {
    en: 'Time',
    zh: '时间',
  },
  Nature: {
    en: 'Nature',
    zh: '自然',
  },
  People: {
    en: 'People',
    zh: '人物',
  },
  Places: {
    en: 'Places',
    zh: '地点',
  },
  'Core Words': {
    en: 'Core Words',
    zh: '核心词',
  },
  'Daily Actions': {
    en: 'Daily Actions',
    zh: '日常动作',
  },
  Questions: {
    en: 'Questions',
    zh: '疑问表达',
  },
};

const HSK1_LESSON_DESCRIPTIONS: Record<Hsk1LessonId, LocalizedText> = {
  Foundations: {
    en: 'Start with compact shapes that appear everywhere in beginner Chinese.',
    zh: '先学最常见、结构清楚的入门汉字。',
  },
  Numbers: {
    en: 'Build the number shapes used in dates, age, time, and classroom drills.',
    zh: '练习日期、年龄、时间和课堂口令里常用的数字字形。',
  },
  Time: {
    en: 'Connect character shape with daily calendar words.',
    zh: '把字形和日期、月份这些日常词连起来。',
  },
  Nature: {
    en: 'Practice visual characters that make stroke direction easier to remember.',
    zh: '用山水火木这些形象字建立笔顺感觉。',
  },
  People: {
    en: 'Learn pronouns and school words that appear early in HSK1 dialogs.',
    zh: '学习 HSK1 对话里很早出现的人称和学校相关词。',
  },
  Places: {
    en: 'Practice location characters used for home, school, and directions.',
    zh: '练习家庭、学校和方位表达里的常用地点字。',
  },
  'Core Words': {
    en: 'Move into high-frequency words that unlock early HSK reading.',
    zh: '进入高频词，为 HSK 入门阅读做准备。',
  },
  'Daily Actions': {
    en: 'Add common action words so writing practice connects to real sentences.',
    zh: '加入常见动作词，让书写练习能连接到真实句子。',
  },
  Questions: {
    en: 'Finish the launch pack with question words used in beginner exchanges.',
    zh: '用初级交流里的疑问词完成第一阶段课程包。',
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
    character: '一',
    pinyin: 'yī',
    meaning: { en: 'one', zh: '一、一个' },
    hint: {
      en: 'One steady horizontal stroke, written left to right.',
      zh: '一笔横，从左往右写，保持平稳。',
    },
    strokes: 1,
    lesson: 'Numbers',
    radical: '一',
    examples: ['一', '一个', '一天'],
    premium: true,
  },
  {
    character: '二',
    pinyin: 'èr',
    meaning: { en: 'two', zh: '二、两个' },
    hint: {
      en: 'Two horizontal strokes: shorter on top, longer below.',
      zh: '两横组成，上短下长，间距要稳。',
    },
    strokes: 2,
    lesson: 'Numbers',
    radical: '二',
    examples: ['二', '二月', '二十'],
    premium: true,
  },
  {
    character: '三',
    pinyin: 'sān',
    meaning: { en: 'three', zh: '三、三个' },
    hint: {
      en: 'Three horizontal strokes with the longest line at the bottom.',
      zh: '三横排列，下面一横最长，整体要平衡。',
    },
    strokes: 3,
    lesson: 'Numbers',
    radical: '一',
    examples: ['三', '三月', '十三'],
    premium: true,
  },
  {
    character: '十',
    pinyin: 'shí',
    meaning: { en: 'ten', zh: '十' },
    hint: {
      en: 'A cross shape: write the horizontal first, then the vertical.',
      zh: '先横后竖，竖笔从中间穿过。',
    },
    strokes: 2,
    lesson: 'Numbers',
    radical: '十',
    examples: ['十', '十月', '二十'],
    premium: true,
  },
  {
    character: '年',
    pinyin: 'nián',
    meaning: { en: 'year', zh: '年' },
    hint: {
      en: 'Stack the top strokes carefully, then finish with the long vertical.',
      zh: '上部横画层次清楚，最后一竖收住重心。',
    },
    strokes: 6,
    lesson: 'Time',
    radical: '干',
    examples: ['年', '今年', '明年'],
    premium: true,
  },
  {
    character: '天',
    pinyin: 'tiān',
    meaning: { en: 'day / sky', zh: '天、天空' },
    hint: {
      en: 'A big person under a top line; keep the arms open.',
      zh: '像“大”上面加一横，撇捺要展开。',
    },
    strokes: 4,
    lesson: 'Time',
    radical: '大',
    examples: ['天', '今天', '明天'],
    premium: true,
  },
  {
    character: '明',
    pinyin: 'míng',
    meaning: { en: 'bright / next', zh: '明亮、明天的明' },
    hint: {
      en: 'Sun on the left, moon on the right; keep both parts narrow.',
      zh: '左日右月，两个部件都要写窄一点。',
    },
    strokes: 8,
    lesson: 'Time',
    radical: '日',
    examples: ['明', '明天', '明白'],
    premium: true,
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
    character: '土',
    pinyin: 'tǔ',
    meaning: { en: 'earth / soil', zh: '土、土地' },
    hint: {
      en: 'A short top line, vertical center, then a longer base.',
      zh: '上横短，下横长，中间一竖支撑住。',
    },
    strokes: 3,
    lesson: 'Nature',
    radical: '土',
    examples: ['土', '土地', '土豆'],
    premium: true,
  },
  {
    character: '气',
    pinyin: 'qì',
    meaning: { en: 'air / breath', zh: '气、空气' },
    hint: {
      en: 'Keep the top strokes light, then let the final hook breathe.',
      zh: '上部轻，最后一笔带弯钩，像气流展开。',
    },
    strokes: 4,
    lesson: 'Nature',
    radical: '气',
    examples: ['气', '天气', '空气'],
    premium: true,
  },
  {
    character: '我',
    pinyin: 'wǒ',
    meaning: { en: 'I / me', zh: '我' },
    hint: {
      en: 'A left hook and right slant cross; keep the middle compact.',
      zh: '左边竖钩和右边斜钩交叉，中间不要散。',
    },
    strokes: 7,
    lesson: 'People',
    radical: '戈',
    examples: ['我', '我们', '我的'],
    premium: true,
  },
  {
    character: '你',
    pinyin: 'nǐ',
    meaning: { en: 'you', zh: '你' },
    hint: {
      en: 'Person radical on the left, small balanced strokes on the right.',
      zh: '左边单人旁站稳，右边小部件保持紧凑。',
    },
    strokes: 7,
    lesson: 'People',
    radical: '亻',
    examples: ['你', '你好', '你们'],
    premium: true,
  },
  {
    character: '他',
    pinyin: 'tā',
    meaning: { en: 'he / him', zh: '他' },
    hint: {
      en: 'Person radical plus 也; keep the final hook low and open.',
      zh: '左边单人旁，右边“也”的弯钩要放开。',
    },
    strokes: 5,
    lesson: 'People',
    radical: '亻',
    examples: ['他', '他们', '他的'],
    premium: true,
  },
  {
    character: '女',
    pinyin: 'nǚ',
    meaning: { en: 'female / woman', zh: '女、女性' },
    hint: {
      en: 'Start with the slanting fold, then cross with a steady horizontal.',
      zh: '先写撇点和弯折，最后一横穿过保持平衡。',
    },
    strokes: 3,
    lesson: 'People',
    radical: '女',
    examples: ['女', '女儿', '女人'],
    premium: true,
  },
  {
    character: '儿',
    pinyin: 'ér',
    meaning: { en: 'child / son', zh: '儿、儿子' },
    hint: {
      en: 'Two open legs; leave enough space between the strokes.',
      zh: '两笔像张开的腿，中间留出空间。',
    },
    strokes: 2,
    lesson: 'People',
    radical: '儿',
    examples: ['儿', '儿子', '女儿'],
    premium: true,
  },
  {
    character: '子',
    pinyin: 'zǐ',
    meaning: { en: 'child / suffix', zh: '子、孩子的子' },
    hint: {
      en: 'A small top curve with one vertical hook and a closing horizontal.',
      zh: '上面小弯，竖钩居中，最后一横托住。',
    },
    strokes: 3,
    lesson: 'People',
    radical: '子',
    examples: ['子', '儿子', '孩子'],
    premium: true,
  },
  {
    character: '家',
    pinyin: 'jiā',
    meaning: { en: 'home / family', zh: '家、家庭' },
    hint: {
      en: 'Roof on top, then keep the lower strokes flowing but centered.',
      zh: '上面宝盖像屋顶，下面笔画多但重心要稳。',
    },
    strokes: 10,
    lesson: 'Places',
    radical: '宀',
    examples: ['家', '回家', '大家'],
    premium: true,
  },
  {
    character: '学',
    pinyin: 'xué',
    meaning: { en: 'study / learn', zh: '学、学习' },
    hint: {
      en: 'Keep the top compact, then place 子 firmly underneath.',
      zh: '上部紧凑，下面“子”要放正。',
    },
    strokes: 8,
    lesson: 'Places',
    radical: '子',
    examples: ['学', '学习', '学校'],
    premium: true,
  },
  {
    character: '校',
    pinyin: 'xiào',
    meaning: { en: 'school', zh: '校、学校' },
    hint: {
      en: 'Tree radical on the left, crossing strokes balanced on the right.',
      zh: '左边木字旁写窄，右边交叉笔画要舒展。',
    },
    strokes: 10,
    lesson: 'Places',
    radical: '木',
    examples: ['校', '学校', '校长'],
    premium: true,
  },
  {
    character: '上',
    pinyin: 'shàng',
    meaning: { en: 'up / above', zh: '上、上面' },
    hint: {
      en: 'A short vertical standing on a long bottom line.',
      zh: '短竖立在长横上，最后一横托住。',
    },
    strokes: 3,
    lesson: 'Places',
    radical: '一',
    examples: ['上', '上午', '上学'],
    premium: true,
  },
  {
    character: '下',
    pinyin: 'xià',
    meaning: { en: 'down / below', zh: '下、下面' },
    hint: {
      en: 'Start with the top line, then draw the vertical and dot below.',
      zh: '先写上横，再竖下来，最后一点放在下方。',
    },
    strokes: 3,
    lesson: 'Places',
    radical: '一',
    examples: ['下', '下午', '下面'],
    premium: true,
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
  {
    character: '好',
    pinyin: 'hǎo',
    meaning: { en: 'good / well', zh: '好、很好' },
    hint: {
      en: 'Woman on the left, child on the right; keep both parts balanced.',
      zh: '左女右子，两个部件大小要协调。',
    },
    strokes: 6,
    lesson: 'Core Words',
    radical: '女',
    examples: ['好', '你好', '很好'],
    premium: true,
  },
  {
    character: '不',
    pinyin: 'bù',
    meaning: { en: 'not / no', zh: '不、不是' },
    hint: {
      en: 'Top horizontal first, then the falling strokes spread below.',
      zh: '先写上横，下面撇竖点分开但不散。',
    },
    strokes: 4,
    lesson: 'Core Words',
    radical: '一',
    examples: ['不', '不是', '不好'],
    premium: true,
  },
  {
    character: '是',
    pinyin: 'shì',
    meaning: { en: 'to be / yes', zh: '是' },
    hint: {
      en: 'A 日 top with a steady lower path; keep the final stroke grounded.',
      zh: '上面是日，下面走势要稳，最后一笔落住。',
    },
    strokes: 9,
    lesson: 'Core Words',
    radical: '日',
    examples: ['是', '不是', '我是'],
    premium: true,
  },
  {
    character: '有',
    pinyin: 'yǒu',
    meaning: { en: 'to have / there is', zh: '有、拥有' },
    hint: {
      en: 'A slanting top over 月; keep the lower part narrow.',
      zh: '上面撇横打开，下面月部写窄。',
    },
    strokes: 6,
    lesson: 'Core Words',
    radical: '月',
    examples: ['有', '没有', '有水'],
    premium: true,
  },
  {
    character: '在',
    pinyin: 'zài',
    meaning: { en: 'at / in', zh: '在、位于' },
    hint: {
      en: 'A left slant leads into 土; keep the bottom compact.',
      zh: '左撇带出结构，下面土字要写稳。',
    },
    strokes: 6,
    lesson: 'Core Words',
    radical: '土',
    examples: ['在', '在家', '现在'],
    premium: true,
  },
  {
    character: '来',
    pinyin: 'lái',
    meaning: { en: 'to come', zh: '来、来到' },
    hint: {
      en: 'A central vertical holds the smaller side strokes together.',
      zh: '中间竖笔是主轴，两边点撇捺要对称。',
    },
    strokes: 7,
    lesson: 'Daily Actions',
    radical: '木',
    examples: ['来', '回来', '来学校'],
    premium: true,
  },
  {
    character: '去',
    pinyin: 'qù',
    meaning: { en: 'to go', zh: '去、离开' },
    hint: {
      en: 'Soil shape on top, then the lower bend closes the motion.',
      zh: '上面像土，下面撇折点收住方向。',
    },
    strokes: 5,
    lesson: 'Daily Actions',
    radical: '厶',
    examples: ['去', '回去', '去学校'],
    premium: true,
  },
  {
    character: '看',
    pinyin: 'kàn',
    meaning: { en: 'to look / watch', zh: '看、看见' },
    hint: {
      en: 'Hand-like strokes sit above 目; keep the eye box straight.',
      zh: '上面像手，下面目字框要端正。',
    },
    strokes: 9,
    lesson: 'Daily Actions',
    radical: '目',
    examples: ['看', '看书', '看见'],
    premium: true,
  },
  {
    character: '说',
    pinyin: 'shuō',
    meaning: { en: 'to speak / say', zh: '说、说话' },
    hint: {
      en: 'Speech radical on the left, compact exchange shape on the right.',
      zh: '左边言字旁，右边部件上紧下开。',
    },
    strokes: 9,
    lesson: 'Daily Actions',
    radical: '讠',
    examples: ['说', '说话', '小说'],
    premium: true,
  },
  {
    character: '听',
    pinyin: 'tīng',
    meaning: { en: 'to listen', zh: '听、听见' },
    hint: {
      en: 'Mouth on the left, axe-like shape on the right.',
      zh: '左口旁写小，右边斤的竖撇要清楚。',
    },
    strokes: 7,
    lesson: 'Daily Actions',
    radical: '口',
    examples: ['听', '听见', '听说'],
    premium: true,
  },
  {
    character: '吃',
    pinyin: 'chī',
    meaning: { en: 'to eat', zh: '吃、吃饭' },
    hint: {
      en: 'Mouth radical first, then the right side bends downward.',
      zh: '先写口字旁，右边横折弯钩向下收。',
    },
    strokes: 6,
    lesson: 'Daily Actions',
    radical: '口',
    examples: ['吃', '吃饭', '好吃'],
    premium: true,
  },
  {
    character: '喝',
    pinyin: 'hē',
    meaning: { en: 'to drink', zh: '喝、喝水' },
    hint: {
      en: 'Small mouth on the left; keep the right side stacked and compact.',
      zh: '左边口字旁要小，右边上下结构要紧凑。',
    },
    strokes: 12,
    lesson: 'Daily Actions',
    radical: '口',
    examples: ['喝', '喝水', '好喝'],
    premium: true,
  },
  {
    character: '谁',
    pinyin: 'shéi',
    meaning: { en: 'who', zh: '谁' },
    hint: {
      en: 'Speech radical plus 隹; keep the four right-side horizontals tidy.',
      zh: '左言旁，右边隹的横画多，要排整齐。',
    },
    strokes: 10,
    lesson: 'Questions',
    radical: '讠',
    examples: ['谁', '是谁', '你是谁'],
    premium: true,
  },
  {
    character: '什',
    pinyin: 'shén',
    meaning: { en: 'what component', zh: '什么的什' },
    hint: {
      en: 'Person radical on the left, ten on the right.',
      zh: '左边单人旁，右边是十，先横后竖。',
    },
    strokes: 4,
    lesson: 'Questions',
    radical: '亻',
    examples: ['什', '什么', '为什么'],
    premium: true,
  },
  {
    character: '么',
    pinyin: 'me',
    meaning: { en: 'what suffix / particle', zh: '什么的么' },
    hint: {
      en: 'A short slant above a turning lower stroke.',
      zh: '上面一撇短，下面撇折点收得轻。',
    },
    strokes: 3,
    lesson: 'Questions',
    radical: '丿',
    examples: ['么', '什么', '这么'],
    premium: true,
  },
  {
    character: '吗',
    pinyin: 'ma',
    meaning: { en: 'question particle', zh: '吗、疑问语气词' },
    hint: {
      en: 'Mouth radical asks the question; 马 stays compact on the right.',
      zh: '左口旁表示语气，右边马要写紧凑。',
    },
    strokes: 6,
    lesson: 'Questions',
    radical: '口',
    examples: ['吗', '好吗', '是吗'],
    premium: true,
  },
  {
    character: '哪',
    pinyin: 'nǎ',
    meaning: { en: 'which / where component', zh: '哪、哪儿的哪' },
    hint: {
      en: 'Mouth radical, middle shape, then the right-side city component.',
      zh: '左口旁，中间部件写紧，右边耳刀旁竖直。',
    },
    strokes: 9,
    lesson: 'Questions',
    radical: '口',
    examples: ['哪', '哪儿', '哪里'],
    premium: true,
  },
  {
    character: '几',
    pinyin: 'jǐ',
    meaning: { en: 'how many / several', zh: '几、多少' },
    hint: {
      en: 'Two strokes with an open inside and a low final hook.',
      zh: '两笔完成，里面留空，最后弯钩放低。',
    },
    strokes: 2,
    lesson: 'Questions',
    radical: '几',
    examples: ['几', '几个', '几月'],
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
  return getHsk1StarterCharacters(locale)
    .filter((item) => !item.premium)
    .slice(0, FREE_CHARACTER_LIMIT);
}

function getLockedCharacters(locale: CourseLocale = 'en') {
  return getHsk1StarterCharacters(locale).filter((item) => item.premium);
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

export function getHsk1LessonForCharacter(
  character: string,
  locale: CourseLocale = 'en'
) {
  const lessonCharacter = findHsk1Character(character, locale);
  if (!lessonCharacter) {
    return;
  }

  return getHsk1CourseLessons(locale).find(
    (item) => item.id === lessonCharacter.lesson
  );
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
  const freeLessonCharacters =
    lesson?.characters
      .filter((item) => !item.premium)
      .map((item) => item.character) ?? [];

  return freeLessonCharacters.length > 0
    ? freeLessonCharacters
    : getFreeCharacters(locale).map((item) => item.character);
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
