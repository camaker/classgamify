import type {
  ActivityTemplateType,
  AttemptAnswer,
  AttemptAnswers,
  AttemptResult,
} from '@/activities/types';

export type ScoredAttemptInsert = {
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

export type ScoredAttemptEvaluation = {
  answers: AttemptAnswer[];
  result: AttemptResult;
};

export type ScoredAttemptIdentity = {
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
      answers: cloneAttemptAnswerRows(evaluation.answers),
      templateType,
    },
    assignmentId,
    completedAt,
    id,
    maxScore: evaluation.result.totalPoints,
    resultJson: cloneAttemptResult(evaluation.result),
    score: evaluation.result.earnedPoints,
    startedAt,
    studentName: identity.studentName,
  };
}

function cloneAttemptAnswerRows(answers: AttemptAnswer[]) {
  return answers.map((answer) => ({ ...answer }));
}

function cloneAttemptResult(result: AttemptResult) {
  return { ...result };
}
