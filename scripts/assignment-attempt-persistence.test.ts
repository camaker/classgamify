import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { evaluateRuntimeAnswers } from '@/activities/runtime';
import type { ActivityContent } from '@/activities/types';
import {
  buildScoredAttemptInsert,
  type ScoredAttemptEvaluation,
} from '@/assignments/attempt-persistence';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANONYMOUS_TOKEN = 'raw-private-anonymous-token';
const SECRET_PROMPT = 'SECRET_FROZEN_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_TEACHER_ANSWER = 'SECRET_TEACHER_ANSWER';
const SECRET_SOURCE_MATERIAL = 'source-materials/private/key.pdf';

const API_SOURCE = readFileSync('src/api/assignments.ts', 'utf8');
const ATTEMPT_PERSISTENCE_SOURCE = readFileSync(
  'src/assignments/attempt-persistence.ts',
  'utf8'
);
const ATTEMPT_STATS_SOURCE = readFileSync(
  'src/assignments/attempt-stats.ts',
  'utf8'
);
const RESULTS_SOURCE = readFileSync('src/assignments/results.ts', 'utf8');
const RESULTS_EXPORT_SOURCE = readFileSync(
  'src/assignments/results-export.ts',
  'utf8'
);

test('scored attempt insert clones evaluation answer and result JSON', () => {
  const { evaluation, insert } = buildPersistenceFixture();

  assert.notEqual(insert.answersJson.answers, evaluation.answers);
  assert.notEqual(insert.answersJson.answers[0], evaluation.answers[0]);
  assert.notEqual(insert.resultJson, evaluation.result);
  assert.deepEqual(insert.answersJson, {
    answers: [
      {
        answer: SECRET_STUDENT_ANSWER,
        correct: false,
        itemId: 'question-1',
      },
      {
        answer: SECRET_TEACHER_ANSWER,
        correct: true,
        itemId: 'question-2',
      },
    ],
    templateType: 'quiz',
  });
  assert.deepEqual(insert.resultJson, {
    accuracy: 50,
    completedItemCount: 2,
    correctItemCount: 1,
    durationSeconds: 45,
    earnedPoints: 1,
    totalPoints: 2,
  });

  evaluation.answers[0]!.answer = 'mutated after insert';
  evaluation.result.earnedPoints = 99;

  assert.equal(insert.answersJson.answers[0]?.answer, SECRET_STUDENT_ANSWER);
  assert.equal(insert.resultJson.earnedPoints, 1);
});

test('scored attempt persistence stays wired to submit and result helpers', () => {
  const { insert, sourceChecks } = buildPersistenceFixture();

  assert.equal(insert.score, insert.resultJson.earnedPoints);
  assert.equal(insert.maxScore, insert.resultJson.totalPoints);
  assert.deepEqual(sourceChecks, {
    apiIdentityGate: true,
    apiLifecycleGate: true,
    apiUsesPersistenceHelper: true,
    attemptLimitGate: true,
    attemptStatsUsesResultJson: true,
    csvExportUsesStoredAttempts: true,
    publicResultUsesSanitizedResult: true,
    resultAnalysisUsesStoredAnswers: true,
    reviewSummaryUsesEvaluation: true,
    runtimeValidationGate: true,
  });
  assert.match(
    ATTEMPT_PERSISTENCE_SOURCE,
    /answers:\s*cloneAttemptAnswerRows\(evaluation\.answers\)[\s\S]*resultJson:\s*cloneAttemptResult\(evaluation\.result\)/,
    'Scored attempt persistence should clone answer and result JSON before returning insert values.'
  );
});

function buildPersistenceFixture() {
  const evaluation = buildRuntimeEvaluation();
  const insert = buildScoredAttemptInsert({
    assignmentId: 'assignment-persistence-handoff',
    completedAt: new Date('2026-07-05T10:01:00.000Z'),
    evaluation,
    id: 'attempt-persistence-handoff',
    identity: {
      anonymousToken: SECRET_ANONYMOUS_TOKEN,
      studentName: null,
    },
    identitySlot: {
      attemptNumber: 1,
      identityKey: `anonymous:${SECRET_ANONYMOUS_TOKEN}`,
    },
    startedAt: new Date('2026-07-05T10:00:15.000Z'),
    submissionKey: 'persistence-submission-key',
    templateType: 'quiz',
  });
  const sourceChecks = buildPersistenceSourceChecks();

  return {
    evaluation,
    insert,
    sourceChecks,
  };
}

function buildRuntimeEvaluation(): ScoredAttemptEvaluation {
  return evaluateRuntimeAnswers({
    answers: [
      {
        answer: SECRET_STUDENT_ANSWER,
        itemId: 'question-1',
      },
      {
        answer: SECRET_TEACHER_ANSWER,
        itemId: 'question-2',
      },
    ],
    content: buildActivityContentFixture(),
    durationSeconds: 45,
    templateType: 'quiz',
  });
}

function buildActivityContentFixture(): ActivityContent {
  return {
    difficulty: 'core',
    gradeBand: 'Grade 4',
    groups: [],
    language: 'en',
    learningGoal: 'Students submit scored attempts.',
    pairs: [],
    questions: [
      {
        answer: 'Expected answer',
        id: 'question-1',
        prompt: SECRET_PROMPT,
      },
      {
        answer: SECRET_TEACHER_ANSWER,
        id: 'question-2',
        prompt: 'Second prompt',
      },
    ],
    sourceMaterials: [
      {
        contentType: 'application/pdf',
        fileId: 'secret-file-id',
        kind: 'worksheet-document',
        originalName: SECRET_SOURCE_MATERIAL,
        size: 1024,
      },
    ],
    sourceSummary: 'Private source summary',
    subject: 'English',
    teacherNotes: ['Private teacher note'],
    vocabulary: [],
  };
}

function buildPersistenceSourceChecks() {
  return {
    apiIdentityGate:
      /resolveAttemptSubmissionIdentity\(\{[\s\S]*studentName: data\.studentName/.test(
        API_SOURCE
      ) &&
      /assignment_api_error_student_name_required[\s\S]*assignment_api_error_anonymous_token_required/.test(
        API_SOURCE
      ),
    apiLifecycleGate:
      /assertAssignmentAcceptsSubmissions\(\{[\s\S]*expiresAt: row\.assignment\.expiresAt,[\s\S]*status: row\.assignment\.status/.test(
        API_SOURCE
      ),
    apiUsesPersistenceHelper:
      /buildScoredAttemptInsert\(\{[\s\S]*assignmentId: row\.assignment\.id[\s\S]*evaluation,[\s\S]*identity: submissionIdentity/.test(
        API_SOURCE
      ),
    attemptLimitGate:
      /persistAttemptWithinIdentityLimit\(\{[\s\S]*countPreviousAttempts:[\s\S]*countPreviousIdentityAttempts\(\{[\s\S]*insertAttempt:[\s\S]*identitySlot,[\s\S]*maxAttempts: settings\.maxAttempts[\s\S]*persistence\.type === 'limit-reached'/.test(
        API_SOURCE
      ),
    attemptStatsUsesResultJson:
      /summarizeAssignmentAttempts[\s\S]*resultJson/.test(ATTEMPT_STATS_SOURCE),
    csvExportUsesStoredAttempts:
      /const storedAttempt = exportContext\.attemptsById\.get\(attempt\.id\)/.test(
        RESULTS_EXPORT_SOURCE
      ) &&
      /storedAttempt\?\.score \?\? attempt\.score[\s\S]*storedAttempt\?\.maxScore[\s\S]*storedAttempt\?\.resultJson\?\.completedItemCount/.test(
        RESULTS_EXPORT_SOURCE
      ),
    publicResultUsesSanitizedResult:
      /function buildAttemptSubmissionResponse[\s\S]*buildPublicAttemptResult\(result\)/.test(
        API_SOURCE
      ),
    resultAnalysisUsesStoredAnswers:
      /buildAttemptAnswerMapByItemId\(\s*attempt\.answersJson\.answers\s*\)/.test(
        RESULTS_SOURCE
      ) && /attempt\.resultJson/.test(RESULTS_SOURCE),
    reviewSummaryUsesEvaluation:
      /function buildAttemptSubmissionResponse[\s\S]*buildPublicAttemptReviewSummaryView\(\{[\s\S]*answers,[\s\S]*runtimeItems: orderedRuntimeItems/.test(
        API_SOURCE
      ),
    runtimeValidationGate:
      /normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*answers: submittedAnswers,[\s\S]*runtimeItems: orderedRuntimeItems[\s\S]*evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/.test(
        API_SOURCE
      ),
  };
}
