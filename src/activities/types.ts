import type { UserFileMaterialKind } from '@/storage/file-materials';

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

export function isActivityTemplateType(
  value: unknown
): value is ActivityTemplateType {
  return (
    typeof value === 'string' &&
    ACTIVITY_TEMPLATE_TYPES.includes(value as ActivityTemplateType)
  );
}

export const ACTIVITY_DIFFICULTIES = ['starter', 'core', 'challenge'] as const;

export const ACTIVITY_CREATABLE_VISIBILITIES = [
  'draft',
  'private',
  'public',
  'unlisted',
] as const;

export const ACTIVITY_PERSISTED_VISIBILITIES = [
  'archived',
  ...ACTIVITY_CREATABLE_VISIBILITIES,
] as const;

export const ACTIVITY_TITLE_LENGTH = {
  max: 120,
  min: 3,
} as const;

export const ACTIVITY_EDITOR_FIELD_LIMITS = {
  descriptionMaxLength: 400,
  gradeBandMaxLength: 80,
  gradeBandMinLength: 1,
  groupsTextMaxLength: 4000,
  languageMaxLength: 20,
  languageMinLength: 2,
  learningGoalMaxLength: 400,
  learningGoalMinLength: 8,
  pairsTextMaxLength: 4000,
  questionsTextMaxLength: 6000,
  sourceSummaryMaxLength: 500,
  subjectMaxLength: 80,
  subjectMinLength: 1,
  teacherNotesTextMaxLength: 2000,
  vocabularyTextMaxLength: 2000,
} as const;

export type ActivityVisibility =
  (typeof ACTIVITY_PERSISTED_VISIBILITIES)[number];

export type AssignmentStatus = 'draft' | 'published' | 'closed';

export type ActivityDifficulty = (typeof ACTIVITY_DIFFICULTIES)[number];

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

export type ActivityMaterialReference = {
  contentType?: string;
  fileId: string;
  kind: UserFileMaterialKind;
  originalName: string;
  size?: number;
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
  sourceMaterials: ActivityMaterialReference[];
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
  maxAttempts?: number | null;
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
