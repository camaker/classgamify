import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { evaluateRuntimeAnswers } from '@/activities/runtime';
import type { ActivityContent } from '@/activities/types';
import {
  buildScoredAttemptInsert,
  type ScoredAttemptEvaluation,
} from '@/assignments/attempt-persistence';
import {
  ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS,
  buildAssignmentAttemptPersistenceHandoffEvidence,
  buildAssignmentAttemptPersistenceHandoffView,
  type AssignmentAttemptPersistenceHandoffItemId,
  type AssignmentAttemptPersistenceHandoffView,
  type AssignmentAttemptPersistenceHandoffSourceChecks,
} from '@/assignments/attempt-persistence-handoff';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANONYMOUS_TOKEN = 'raw-private-anonymous-token';
const SECRET_PROMPT = 'SECRET_FROZEN_PROMPT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_NAME = 'Private Student';
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

test('assignment attempt persistence handoff exposes 30 safe insert slices', () => {
  const { evidence } = buildPersistenceFixture();
  const handoffView = buildAssignmentAttemptPersistenceHandoffView(evidence);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_ATTEMPT_PERSISTENCE_HANDOFF_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAnswerText: false,
    exposesRawAnonymousToken: false,
    exposesRawSubmissionPayload: false,
    exposesRuntimeItemIds: false,
    exposesSourceMaterialMetadata: false,
    exposesStudentName: false,
    exposesTeacherOnlyAnswers: false,
    itemIds,
    mutatesEvaluationAfterInsert: false,
    scope: 'assignment-attempt-persistence-boundary',
    storesScoredAttemptRows: true,
    usesScoredAttemptInsertHelper: true,
  });
  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['persistence-scope', 'Scored attempt insert'],
      ['api-lifecycle-gate', 'Ready'],
      ['api-identity-gate', 'Ready'],
      ['attempt-limit-gate', 'Ready'],
      ['runtime-validation-gate', 'Ready'],
      ['scoring-source', 'Runtime evaluation'],
      ['insert-builder', 'buildScoredAttemptInsert'],
      ['assignment-id', 'Stored'],
      ['attempt-id', 'Stored'],
      ['started-at', 'Stored'],
      ['completed-at', 'Stored'],
      ['student-name-identity', 'Not used'],
      ['anonymous-token-identity', 'Stored'],
      ['answers-json', '2 answer rows'],
      ['template-type', 'quiz'],
      ['answer-correctness', '1 correct'],
      ['result-json', '2 total points'],
      ['score-source', '1 earned'],
      ['max-score-source', '2 max'],
      ['duration-source', '45s'],
      ['immutable-answer-copy', 'Cloned'],
      ['immutable-result-copy', 'Cloned'],
      ['public-result-boundary', 'Ready'],
      ['review-summary-boundary', 'Evaluation summary'],
      ['result-analysis-boundary', 'Stored attempts'],
      ['attempt-stats-boundary', 'Result JSON'],
      ['csv-export-boundary', 'Full assignment results'],
      ['source-material-guard', 'Not persisted'],
      ['raw-payload-guard', 'Raw payload hidden'],
      ['privacy-guard', 'Private data hidden'],
    ]
  );
  assertNoPrivatePersistenceHandoffText(JSON.stringify(handoffView));
});

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

test('assignment attempt persistence handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const { evidence } = buildPersistenceFixture();
    const handoffView = buildAssignmentAttemptPersistenceHandoffView(evidence);

    assert.equal(handoffView.title, '作答持久化交接');
    assert.match(handoffView.description, /30 切片已评分作答持久化契约/);
    assert.equal(
      getHandoffValue(handoffView, 'persistence-scope'),
      '已评分作答写入'
    );
    assert.equal(getHandoffValue(handoffView, 'answers-json'), '2 条答案');
    assert.equal(
      getHandoffValue(handoffView, 'anonymous-token-identity'),
      '已存储'
    );
    assert.equal(getHandoffValue(handoffView, 'score-source'), '1 得分');
    assert.equal(getHandoffValue(handoffView, 'duration-source'), '45 秒');
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '私密数据已隐藏'
    );
    assertNoPrivatePersistenceHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('assignment attempt persistence evidence comes from submit and result helpers', () => {
  const { evidence, insert, sourceChecks } = buildPersistenceFixture();

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
  assert.deepEqual(evidence, {
    answerCorrectCount: 1,
    answerRowCount: 2,
    answersJsonCloned: true,
    assignmentIdStored: true,
    attemptIdStored: true,
    completedAtStored: true,
    durationSeconds: 45,
    identityMode: 'anonymous',
    maxScore: 2,
    resultAccuracy: 50,
    resultJsonCloned: true,
    resultTotalPoints: 2,
    score: 1,
    sourceChecks,
    startedAtStored: true,
    templateType: 'quiz',
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
    startedAt: new Date('2026-07-05T10:00:15.000Z'),
    templateType: 'quiz',
  });
  const sourceChecks = buildPersistenceSourceChecks();
  const evidence = buildAssignmentAttemptPersistenceHandoffEvidence({
    answersJsonCloned:
      insert.answersJson.answers !== evaluation.answers &&
      insert.answersJson.answers.every(
        (answer, index) => answer !== evaluation.answers[index]
      ),
    insert,
    resultJsonCloned: insert.resultJson !== evaluation.result,
    sourceChecks,
  });

  return {
    evaluation,
    evidence,
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

function buildPersistenceSourceChecks(): AssignmentAttemptPersistenceHandoffSourceChecks {
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
      /countPreviousIdentityAttempts\(\{[\s\S]*canUseAnotherAssignmentAttempt\(\{[\s\S]*usedAttempts: previousAttemptCount/.test(
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
      /buildPublicAttemptResult\(evaluation\.result\)/.test(API_SOURCE),
    resultAnalysisUsesStoredAnswers:
      /buildAttemptAnswerMapByItemId\(\s*attempt\.answersJson\.answers\s*\)/.test(
        RESULTS_SOURCE
      ) && /attempt\.resultJson/.test(RESULTS_SOURCE),
    reviewSummaryUsesEvaluation:
      /buildPublicAttemptReviewSummaryView\(\{[\s\S]*answers: evaluation\.answers,[\s\S]*runtimeItems: orderedRuntimeItems/.test(
        API_SOURCE
      ),
    runtimeValidationGate:
      /normalizeSubmittedAttemptAnswers\(data\.answers\)[\s\S]*assertSubmittedAnswersMatchRuntimeItems\(\{[\s\S]*answers: submittedAnswers,[\s\S]*runtimeItems: orderedRuntimeItems[\s\S]*evaluateRuntimeAnswers\(\{[\s\S]*answers: submittedAnswers/.test(
        API_SOURCE
      ),
  };
}

function getHandoffValue(
  view: AssignmentAttemptPersistenceHandoffView,
  id: AssignmentAttemptPersistenceHandoffItemId
) {
  const item = view.itemViews.find((candidate) => candidate.id === id);
  assert.ok(item, `Missing attempt persistence handoff item ${id}`);
  return item.value;
}

function assertNoPrivatePersistenceHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANONYMOUS_TOKEN,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_NAME,
    SECRET_TEACHER_ANSWER,
    SECRET_SOURCE_MATERIAL,
    'secret-file-id',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Attempt persistence handoff leaked private text: ${privateValue}`
    );
  }
}
