export const ACTIVITY_TEMPLATE_TYPES = [
  'quiz',
  'match-up',
  'line-match',
  'group-sort',
  'fill-blank',
  'listening',
  'matching-pairs',
  'open-box',
] as const;

export type ActivityTemplateType = (typeof ACTIVITY_TEMPLATE_TYPES)[number];

export type ActivityVisibility =
  | 'archived'
  | 'draft'
  | 'private'
  | 'public'
  | 'unlisted';

export type AssignmentStatus = 'draft' | 'published' | 'closed';

export type ActivityDifficulty = 'starter' | 'core' | 'challenge';

export type ActivityQuestionOption = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type ActivityQuestion = {
  id: string;
  prompt: string;
  answer: string;
  options?: ActivityQuestionOption[];
  explanation?: string;
};

export type ActivityPair = {
  id: string;
  left: string;
  right: string;
};

export type ActivityGroup = {
  id: string;
  label: string;
  items: string[];
};

export type ActivityContent = {
  subject: string;
  gradeBand: string;
  language: string;
  difficulty: ActivityDifficulty;
  sourceSummary: string;
  learningGoal: string;
  vocabulary: string[];
  questions: ActivityQuestion[];
  pairs: ActivityPair[];
  groups: ActivityGroup[];
  teacherNotes: string[];
};

export type ActivityTemplateContentRequirement =
  | 'gradeBand'
  | 'groups'
  | 'learningGoal'
  | 'pairs'
  | 'questions'
  | 'sourceSummary'
  | 'teacherNotes'
  | 'vocabulary';

export type AssignmentSettings = {
  collectStudentName: boolean;
  instructions?: string;
  showCorrectAnswers: boolean;
  shuffleItems: boolean;
  timeLimitSeconds?: number;
  maxAttempts?: number;
};

export type AttemptAnswer = {
  itemId: string;
  answer: string;
  correct?: boolean;
};

export type AttemptAnswers = {
  answers: AttemptAnswer[];
  templateType: ActivityTemplateType;
};

export type AttemptResult = {
  earnedPoints: number;
  totalPoints: number;
  accuracy: number;
  completedItemCount: number;
  correctItemCount: number;
  durationSeconds?: number;
};

export type ActivityTemplateDefinition = {
  type: ActivityTemplateType;
  name: string;
  shortName: string;
  description: string;
  bestFor: string;
  contentRequirements: ActivityTemplateContentRequirement[];
  classroomMode: 'individual' | 'small-group' | 'whole-class';
};

export type ActivitySeed = {
  id: string;
  title: string;
  description: string;
  templateType: ActivityTemplateType;
  content: ActivityContent;
  estimatedMinutes: number;
  status: ActivityVisibility;
};

export type AssignmentSeed = {
  id: string;
  shareId: string;
  title: string;
  activityId: string;
  settings: AssignmentSettings;
  status: AssignmentStatus;
  expiresAt?: Date | null;
  completions: number;
  averageScore: number;
};
