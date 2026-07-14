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
  attemptNumber: number | null;
  completedAt: Date;
  id: string;
  identityKey: string | null;
  maxScore: number;
  resultJson: AttemptResult;
  score: number;
  startedAt: Date;
  studentName: string | null;
  submissionKey: string;
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
  identitySlot,
  startedAt,
  submissionKey,
  templateType,
}: {
  assignmentId: string;
  completedAt: Date;
  evaluation: ScoredAttemptEvaluation;
  id: string;
  identity: ScoredAttemptIdentity;
  identitySlot: {
    attemptNumber: number | null;
    identityKey: string | null;
  };
  startedAt: Date;
  submissionKey: string;
  templateType: ActivityTemplateType;
}): ScoredAttemptInsert {
  return {
    anonymousToken: identity.anonymousToken,
    answersJson: {
      answers: cloneAttemptAnswerRows(evaluation.answers),
      templateType,
    },
    assignmentId,
    attemptNumber: identitySlot.attemptNumber,
    completedAt,
    id,
    identityKey: identitySlot.identityKey,
    maxScore: evaluation.result.totalPoints,
    resultJson: cloneAttemptResult(evaluation.result),
    score: evaluation.result.earnedPoints,
    startedAt,
    studentName: identity.studentName,
    submissionKey,
  };
}

function cloneAttemptAnswerRows(answers: AttemptAnswer[]) {
  return answers.map((answer) => ({ ...answer }));
}

function cloneAttemptResult(result: AttemptResult) {
  return { ...result };
}
