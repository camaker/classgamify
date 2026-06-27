import type {
  ActivityTemplateType,
  AttemptAnswer,
  AttemptAnswers,
  AttemptResult,
} from '@/activities/types';

type ScoredAttemptInsert = {
  anonymousToken: string | null;
  answersJson: AttemptAnswers;
  assignmentId: string;
  completedAt: Date;
  id: string;
  maxScore: number;
  resultJson: AttemptResult;
  score: number;
  startedAt: Date;
  studentName: string | null;
};

type ScoredAttemptEvaluation = {
  answers: AttemptAnswer[];
  result: AttemptResult;
};

type ScoredAttemptIdentity = {
  anonymousToken: string | null;
  studentName: string | null;
};

export function buildScoredAttemptInsert({
  assignmentId,
  completedAt,
  evaluation,
  id,
  identity,
  startedAt,
  templateType,
}: {
  assignmentId: string;
  completedAt: Date;
  evaluation: ScoredAttemptEvaluation;
  id: string;
  identity: ScoredAttemptIdentity;
  startedAt: Date;
  templateType: ActivityTemplateType;
}): ScoredAttemptInsert {
  return {
    anonymousToken: identity.anonymousToken,
    answersJson: {
      answers: evaluation.answers,
      templateType,
    },
    assignmentId,
    completedAt,
    id,
    maxScore: evaluation.result.totalPoints,
    resultJson: evaluation.result,
    score: evaluation.result.earnedPoints,
    startedAt,
    studentName: identity.studentName,
  };
}
