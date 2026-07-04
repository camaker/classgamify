import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS,
  buildAssignmentCopyArtifactHandoffEvidence,
  buildAssignmentCopyArtifactHandoffView,
  type AssignmentCopyArtifactHandoffItemId,
  type AssignmentCopyArtifactHandoffView,
} from '@/assignments/copy-artifact-handoff';
import {
  buildAssignmentResultCopyArtifactPreviews,
  buildAssignmentResultCopyArtifacts,
  type AssignmentResultCopyArtifactPreviewScope,
} from '@/assignments/result-actions';
import type {
  AssignmentAttemptReview,
  AssignmentItemAnalysis,
  AssignmentStudentSummary,
} from '@/assignments/results';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACCEPTED_ANSWER = 'SECRET_ACCEPTED_ALTERNATIVE';
const SECRET_ANONYMOUS_TOKEN = 'SECRET_RAW_ANONYMOUS_TOKEN';
const SECRET_EXPECTED_ANSWER = 'SECRET_EXPECTED_ANSWER';
const SECRET_EXPLANATION = 'SECRET_TEACHER_EXPLANATION';
const SECRET_PROMPT = 'SECRET_PROMPT_TEXT';
const SECRET_STUDENT_ANSWER = 'SECRET_STUDENT_ANSWER';
const SECRET_STUDENT_LABEL = 'Private Student Label';

const CLASSROOM_BRIEF_SOURCE = readFileSync(
  'src/assignments/classroom-brief.ts',
  'utf8'
);
const COPY_ARTIFACT_HANDOFF_SOURCE = readFileSync(
  'src/assignments/copy-artifact-handoff.ts',
  'utf8'
);
const ITEM_REVIEW_SOURCE = readFileSync(
  'src/assignments/item-review-summary.ts',
  'utf8'
);
const RESULT_ACTIONS_SOURCE = readFileSync(
  'src/assignments/result-actions.ts',
  'utf8'
);
const RETEACH_PLAN_SOURCE = readFileSync(
  'src/assignments/reteach-plan.ts',
  'utf8'
);
const STUDENT_FOLLOW_UP_SOURCE = readFileSync(
  'src/assignments/student-follow-up-summary.ts',
  'utf8'
);

test('assignment copy artifact handoff exposes 30 safe slices', () => {
  const fixture = buildCopyArtifactFixture();
  const handoffView = buildAssignmentCopyArtifactHandoffView(fixture);
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ASSIGNMENT_COPY_ARTIFACT_HANDOFF_ITEM_IDS]);
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
    exposesAcceptedAnswerText: false,
    exposesArtifactText: false,
    exposesExpectedAnswerText: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentLabels: false,
    exposesTeacherNotesText: false,
    itemIds,
    mutatesResultArtifacts: false,
    scope: 'teacher-result-copy-artifacts',
    usesSharedCopyArtifactHelpers: true,
  });
  assertNoPrivateCopyArtifactHandoffText(JSON.stringify(handoffView));
});

test('assignment copy artifact handoff summarizes copy coverage', () => {
  const fixture = buildCopyArtifactFixture();
  const handoffView = buildAssignmentCopyArtifactHandoffView(fixture);

  assert.deepEqual(
    handoffView.itemViews.map((item) => [item.id, item.value]),
    [
      ['artifact-scope', 'Teacher copy artifacts'],
      ['classroom-brief-artifact', 'Brief ready'],
      ['reteach-plan-artifact', 'Reteach ready'],
      ['item-review-artifact', 'Item review ready'],
      ['student-follow-up-artifact', 'Follow-up ready'],
      ['copy-preview-count', '4 previews'],
      [
        'copy-line-format',
        `${buildAssignmentCopyArtifactHandoffEvidence(fixture).totalCopyLineCount} normalized lines`,
      ],
      ['copy-title-normalization', 'Title normalized'],
      ['copy-scope-appended', 'Scope appended'],
      ['copy-scope-summary', '4 scope items'],
      ['classroom-stat-metrics', '4 metrics'],
      ['classroom-scope-metrics', '4 scope items'],
      ['brief-focus-items', '3 focus items'],
      ['brief-follow-up-students', '2 students'],
      ['reteach-review-items', '4 review items'],
      ['reteach-priority-students', '2 students'],
      ['item-review-items', '4 items'],
      ['item-review-answer-coverage', '4 answer fields'],
      ['follow-up-students', '3 students'],
      ['follow-up-review-needed', '2 students'],
      ['latest-attempt-details', '3 students'],
      ['last-submitted-context', '3 students'],
      ['attempt-duration-context', '3 students'],
      ['priority-item-ordering', 'Priority first'],
      ['student-follow-up-ordering', 'Follow-up first'],
      ['current-review-data-scope', 'Current review'],
      ['artifact-preview-scope', '4 scoped previews'],
      ['prompt-text-guard', 'Prompt text hidden'],
      ['answer-text-guard', 'Answer text hidden'],
      ['privacy-guard', 'Private copy hidden'],
    ]
  );

  assertNoPrivateCopyArtifactHandoffText(JSON.stringify(handoffView));
});

test('assignment copy artifact handoff localizes Chinese boundaries', () => {
  overwriteGetLocale(() => 'zh');
  try {
    const handoffView = buildAssignmentCopyArtifactHandoffView(
      buildCopyArtifactFixture()
    );

    assert.equal(handoffView.title, '复制材料交接');
    assert.match(handoffView.description, /三十切片/);
    assert.equal(
      getCopyArtifactHandoffValue(handoffView, 'artifact-scope'),
      '教师复制材料'
    );
    assert.equal(
      getCopyArtifactHandoffValue(handoffView, 'classroom-brief-artifact'),
      '课堂简报已准备'
    );
    assert.equal(
      getCopyArtifactHandoffValue(handoffView, 'copy-preview-count'),
      '4 个预览'
    );
    assert.equal(
      getCopyArtifactHandoffValue(handoffView, 'copy-scope-appended'),
      '已追加范围'
    );
    assert.equal(
      getCopyArtifactHandoffValue(handoffView, 'priority-item-ordering'),
      '优先项在前'
    );
    assert.equal(
      getCopyArtifactHandoffValue(handoffView, 'prompt-text-guard'),
      '题目文本隐藏'
    );
    assert.equal(
      getCopyArtifactHandoffValue(handoffView, 'privacy-guard'),
      '私有复制内容隐藏'
    );
    assertNoPrivateCopyArtifactHandoffText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('assignment copy artifact evidence comes from shared copy helpers', () => {
  const fixture = buildCopyArtifactFixture();
  const evidence = buildAssignmentCopyArtifactHandoffEvidence(fixture);

  assert.equal(evidence.classroomBriefReady, true);
  assert.equal(evidence.reteachPlanReady, true);
  assert.equal(evidence.itemReviewReady, true);
  assert.equal(evidence.studentFollowUpReady, true);
  assert.equal(evidence.copyScopeAppendedToArtifacts, true);
  assert.equal(evidence.currentReviewDataScopeReady, true);
  assert.equal(evidence.priorityItemOrderingReady, true);
  assert.equal(evidence.studentFollowUpOrderingReady, true);
  assert.equal(evidence.artifactPreviewScopeReady, true);
  assert.equal(evidence.promptTextHiddenFromHandoff, true);

  assert.equal(
    fixture.artifacts.reteachPlan.text.includes(SECRET_PROMPT),
    true
  );
  assert.equal(
    fixture.artifacts.itemReviewSummary.text.includes(SECRET_EXPECTED_ANSWER),
    true
  );
  assert.equal(
    fixture.artifacts.itemReviewSummary.text.includes(SECRET_ACCEPTED_ANSWER),
    true
  );
  assert.equal(
    fixture.artifacts.itemReviewSummary.text.includes(SECRET_EXPLANATION),
    true
  );
  assert.equal(
    fixture.artifacts.studentFollowUpSummary.text.includes(
      SECRET_STUDENT_LABEL
    ),
    true
  );

  assert.match(COPY_ARTIFACT_HANDOFF_SOURCE, /AssignmentResultCopyArtifacts/);
  assert.match(COPY_ARTIFACT_HANDOFF_SOURCE, /countAssignmentResultCopyLines/);
  assert.match(RESULT_ACTIONS_SOURCE, /buildAssignmentResultCopyArtifacts/);
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /buildAssignmentResultCopyArtifactPreviews/
  );
  assert.match(
    RESULT_ACTIONS_SOURCE,
    /appendAssignmentResultCopyScopeToArtifacts/
  );
  assert.match(CLASSROOM_BRIEF_SOURCE, /getAssignmentReviewPriorityItems/);
  assert.match(RETEACH_PLAN_SOURCE, /getAssignmentReviewPriorityItems/);
  assert.match(ITEM_REVIEW_SOURCE, /sortAssignmentItemsByReviewPriority/);
  assert.match(
    STUDENT_FOLLOW_UP_SOURCE,
    /sortAssignmentStudentsByFollowUpPriority/
  );

  assertNoPrivateCopyArtifactHandoffText(
    JSON.stringify(buildAssignmentCopyArtifactHandoffView(fixture))
  );
});

function buildCopyArtifactFixture() {
  const artifacts = buildAssignmentResultCopyArtifacts({
    analysis: {
      attempts: buildAttemptReviews(),
      perItem: buildItemAnalyses(),
      students: buildStudentSummaries(),
    },
    assignment: {
      title: '  Ｆractions   exit   ticket  ',
    },
    copyScopeView: buildCopyScopeView(),
    stats: {
      averageDurationSeconds: 75,
      averagePoints: 2.25,
      averageScore: 68,
      completions: 4,
    },
  });
  const previews = buildAssignmentResultCopyArtifactPreviews({
    artifacts,
    copyScopeView: buildCopyScopeView(),
  });

  return { artifacts, previews };
}

function buildCopyScopeView(): AssignmentResultCopyArtifactPreviewScope {
  return {
    description:
      'Current copy artifacts use the active search, sort, and review filter.',
    itemViews: [
      {
        description: 'Student scan order is filtered by follow-up need.',
        id: 'students',
        label: 'Students',
        value: '3 students',
      },
      {
        description: 'Item performance uses the selected sort.',
        id: 'items',
        label: 'Items',
        value: 'Lowest accuracy',
      },
      {
        description: 'Answer cards use the selected review filter.',
        id: 'review',
        label: 'Review',
        value: 'Needs review only',
      },
    ],
    summaryItems: [
      buildCopyScopeSummaryItem('students', 'Students', '3'),
      buildCopyScopeSummaryItem('attempts', 'Attempts', '4'),
      buildCopyScopeSummaryItem('items', 'Items', '4'),
      buildCopyScopeSummaryItem('answer-reviews', 'Answer reviews', '5'),
    ],
    title: 'Copy scope',
  };
}

function buildCopyScopeSummaryItem(
  id: 'answer-reviews' | 'attempts' | 'items' | 'students',
  label: string,
  value: string
) {
  return {
    ariaLabel: `${label}: ${value}`,
    description: `${label} included in the current review scope.`,
    id,
    label,
    value,
  };
}

function buildItemAnalyses(): AssignmentItemAnalysis[] {
  return [
    buildItemAnalysis({
      correctRate: 50,
      itemId: 'item-mid',
      prompt: `${SECRET_PROMPT} medium item`,
      submittedCount: 4,
      unansweredCount: 1,
    }),
    buildItemAnalysis({
      correctRate: 10,
      itemId: 'item-low',
      prompt: `${SECRET_PROMPT} lowest item`,
      submittedCount: 3,
      unansweredCount: 2,
    }),
    buildItemAnalysis({
      correctRate: 85,
      itemId: 'item-strong',
      prompt: `${SECRET_PROMPT} strong item`,
      submittedCount: 4,
      unansweredCount: 0,
    }),
    buildItemAnalysis({
      correctRate: 25,
      itemId: 'item-open',
      kind: 'pair',
      kindLabel: 'Pair',
      prompt: `${SECRET_PROMPT} open item`,
      submittedCount: 2,
      unansweredCount: 1,
    }),
  ];
}

function buildItemAnalysis({
  correctRate,
  itemId,
  kind = 'question',
  kindLabel = 'Question',
  prompt,
  submittedCount,
  unansweredCount,
}: {
  correctRate: number;
  itemId: string;
  kind?: AssignmentItemAnalysis['kind'];
  kindLabel?: string;
  prompt: string;
  submittedCount: number;
  unansweredCount: number;
}): AssignmentItemAnalysis {
  return {
    acceptedAnswers: [SECRET_EXPECTED_ANSWER, SECRET_ACCEPTED_ANSWER],
    correctCount: Math.max(0, submittedCount - unansweredCount),
    correctRate,
    explanation: SECRET_EXPLANATION,
    expectedAnswer: SECRET_EXPECTED_ANSWER,
    itemId,
    kind,
    kindLabel,
    prompt,
    submittedCount,
    unansweredCount,
  };
}

function buildStudentSummaries(): AssignmentStudentSummary[] {
  return [
    {
      attempts: 2,
      averageAccuracy: 45,
      bestAccuracy: 60,
      lastCompletedAt: new Date('2026-07-05T10:00:00.000Z'),
      latestAccuracy: 40,
      needsReviewCount: 3,
      studentKey: 'student:private',
      studentLabel: SECRET_STUDENT_LABEL,
    },
    {
      attempts: 1,
      averageAccuracy: 90,
      bestAccuracy: 90,
      lastCompletedAt: new Date('2026-07-05T09:30:00.000Z'),
      latestAccuracy: 90,
      needsReviewCount: 0,
      studentKey: 'student:extension',
      studentLabel: 'Extension Student',
    },
    {
      attempts: 1,
      averageAccuracy: 35,
      bestAccuracy: 35,
      lastCompletedAt: new Date('2026-07-05T09:00:00.000Z'),
      latestAccuracy: 35,
      needsReviewCount: 2,
      studentKey: 'anonymous:1',
      studentLabel: 'Anonymous student 1',
    },
  ];
}

function buildAttemptReviews(): AssignmentAttemptReview[] {
  return [
    buildAttemptReview({
      accuracy: 40,
      completedAt: new Date('2026-07-05T10:00:00.000Z'),
      durationSeconds: 75,
      id: 'attempt-private-latest',
      score: 1,
      studentKey: 'student:private',
      studentLabel: SECRET_STUDENT_LABEL,
    }),
    buildAttemptReview({
      accuracy: 60,
      completedAt: new Date('2026-07-05T08:00:00.000Z'),
      durationSeconds: 82,
      id: 'attempt-private-first',
      score: 2,
      studentKey: 'student:private',
      studentLabel: SECRET_STUDENT_LABEL,
    }),
    buildAttemptReview({
      accuracy: 90,
      completedAt: new Date('2026-07-05T09:30:00.000Z'),
      durationSeconds: 64,
      id: 'attempt-extension',
      score: 3,
      studentKey: 'student:extension',
      studentLabel: 'Extension Student',
    }),
    buildAttemptReview({
      accuracy: 35,
      completedAt: new Date('2026-07-05T09:00:00.000Z'),
      durationSeconds: 70,
      id: 'attempt-anonymous',
      score: 1,
      studentKey: 'anonymous:1',
      studentLabel: 'Anonymous student 1',
    }),
  ];
}

function buildAttemptReview({
  accuracy,
  completedAt,
  durationSeconds,
  id,
  score,
  studentKey,
  studentLabel,
}: {
  accuracy: number;
  completedAt: Date;
  durationSeconds: number;
  id: string;
  score: number;
  studentKey: string;
  studentLabel: string;
}): AssignmentAttemptReview {
  return {
    accuracy,
    answers: [
      {
        acceptedAnswers: [SECRET_EXPECTED_ANSWER, SECRET_ACCEPTED_ANSWER],
        answer: SECRET_STUDENT_ANSWER,
        correct: false,
        expectedAnswer: SECRET_EXPECTED_ANSWER,
        explanation: SECRET_EXPLANATION,
        itemId: 'item-low',
        prompt: `${SECRET_PROMPT} attempt prompt`,
        submitted: true,
      },
    ],
    completedAt,
    durationSeconds,
    id,
    score,
    studentKey,
    studentLabel,
  };
}

function getCopyArtifactHandoffValue(
  view: AssignmentCopyArtifactHandoffView,
  id: AssignmentCopyArtifactHandoffItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing copy artifact handoff item ${id}`);
  return itemView.value;
}

function assertNoPrivateCopyArtifactHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACCEPTED_ANSWER,
    SECRET_ANONYMOUS_TOKEN,
    SECRET_EXPECTED_ANSWER,
    SECRET_EXPLANATION,
    SECRET_PROMPT,
    SECRET_STUDENT_ANSWER,
    SECRET_STUDENT_LABEL,
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Copy artifact handoff leaked private text: ${privateValue}`
    );
  }
}
