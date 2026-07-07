import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS,
  buildAssignmentResultsExportPreparationView,
  type AssignmentResultsExportPreparationItemId,
  type AssignmentResultsExportPreparationView,
} from '@/assignments/results-export';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACCEPTED_ANSWER = 'SECRET_ACCEPTED_ANSWER';
const SECRET_ANSWER_TEXT = 'SECRET_STUDENT_ANSWER';
const SECRET_INSTRUCTIONS = 'SECRET_STUDENT_INSTRUCTIONS';
const SECRET_PROMPT_TEXT = 'SECRET_PROMPT_TEXT';
const SECRET_TOKEN = 'raw-anonymous-token-value';

test('assignment results export preparation exposes 30 safe CSV coverage slices', () => {
  const preparationView = buildAssignmentResultsExportPreparationView({
    activity: {
      description: 'Live activity description',
      templateType: 'quiz',
      title: 'Live activity title',
    },
    analysis: {
      attempts: [
        {
          accuracy: 50,
          answers: [
            {
              acceptedAnswers: ['Paris', SECRET_ACCEPTED_ANSWER],
              answer: SECRET_ANSWER_TEXT,
              correct: false,
              expectedAnswer: 'Paris',
              explanation: 'Teacher-only explanation',
              itemId: 'item-1',
              prompt: SECRET_PROMPT_TEXT,
              submitted: true,
            },
          ],
          completedAt: new Date('2026-01-01T10:00:00.000Z'),
          durationSeconds: 30,
          id: 'attempt-1',
          score: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
      ],
      needsReview: [
        {
          acceptedAnswers: ['Paris', SECRET_ACCEPTED_ANSWER],
          correctCount: 0,
          correctRate: 0,
          expectedAnswer: 'Paris',
          itemId: 'item-1',
          kind: 'question',
          kindLabel: 'Question',
          prompt: SECRET_PROMPT_TEXT,
          submittedCount: 1,
          unansweredCount: 0,
        },
      ],
      perItem: [
        {
          acceptedAnswers: ['Paris', SECRET_ACCEPTED_ANSWER],
          correctCount: 0,
          correctRate: 0,
          expectedAnswer: 'Paris',
          itemId: 'item-1',
          kind: 'question',
          kindLabel: 'Question',
          prompt: SECRET_PROMPT_TEXT,
          submittedCount: 1,
          unansweredCount: 0,
        },
      ],
      students: [
        {
          attempts: 1,
          averageAccuracy: 50,
          bestAccuracy: 50,
          lastCompletedAt: new Date('2026-01-01T10:00:00.000Z'),
          latestAccuracy: 50,
          needsReviewCount: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
      ],
    },
    assignment: {
      expiresAt: new Date('2026-01-10T10:00:00.000Z'),
      id: 'assignment-1',
      settingsJson: {
        collectStudentName: true,
        instructions: SECRET_INSTRUCTIONS,
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 60,
      },
      shareSlug: 'share-123',
      status: 'published',
      title: 'Export safety check',
    },
    snapshot: {
      activityDescription: 'Snapshot description',
      activityTitle: 'Snapshot title',
      templateType: 'quiz',
    },
    stats: {
      averageDurationSeconds: 30,
      averagePoints: 1,
      averageScore: 50,
      completions: 1,
    },
  });
  const itemIds = preparationView.itemViews.map((itemView) => itemView.id);

  assert.deepEqual(itemIds, [
    ...ASSIGNMENT_RESULTS_EXPORT_PREPARATION_ITEM_IDS,
  ]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    preparationView.itemViews.every(
      (itemView) =>
        Boolean(itemView.ariaLabel) &&
        Boolean(itemView.description) &&
        Boolean(itemView.label) &&
        Boolean(itemView.value)
    ),
    true
  );
  assert.deepEqual(preparationView.privacy, {
    exposesAssignmentTitle: false,
    exposesCopyArtifactText: false,
    exposesCsvDataUrl: false,
    exposesCsvFilename: false,
    exposesPromptText: false,
    exposesRawAnonymousToken: false,
    exposesStudentAnswerText: false,
    exposesStudentInstructions: false,
    exposesTeacherAnswerText: false,
    itemIds,
    scope: 'full-assignment-results',
  });

  assert.equal(
    getPreparationItemValue(preparationView, 'export-scope'),
    'Full assignment results'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'activity-snapshot'),
    'Quiz'
  );
  assert.equal(getPreparationItemValue(preparationView, 'attempts'), '1');
  assert.equal(getPreparationItemValue(preparationView, 'students'), '1');
  assert.equal(
    getPreparationItemValue(preparationView, 'delivery-identity'),
    'Names'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'delivery-answer-reveal'),
    'After submit'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'delivery-item-order'),
    'Fixed order'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'delivery-attempt-limit'),
    '2'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'delivery-timer'),
    '60'
  );
  assert.match(
    getPreparationItemValue(preparationView, 'delivery-close-time'),
    /2026/
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'delivery-instructions'),
    'Present'
  );
  assert.equal(getPreparationItemValue(preparationView, 'raw-settings'), '5');
  assert.equal(getPreparationItemValue(preparationView, 'result-metrics'), '4');
  assert.equal(
    getPreparationItemValue(preparationView, 'item-performance'),
    '1'
  );
  assert.equal(getPreparationItemValue(preparationView, 'answer-rows'), '1');
  assert.equal(
    getPreparationItemValue(preparationView, 'expected-answer'),
    'Primary answer column'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'accepted-alternatives'),
    'Alternatives column'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'export-filename'),
    'Prepared'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'csv-data-url-boundary'),
    'Not exposed'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'formula-injection-guard'),
    'Enabled'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'submitted-date-format'),
    'Prepared'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'duration-normalization'),
    'Timer-aware'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'empty-answer-row'),
    'Prepared'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'prompt-column'),
    'Prompt column'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'student-answer-column'),
    'Student answer column'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'correctness-column'),
    'Correctness column'
  );
  assert.equal(
    getPreparationItemValue(preparationView, 'explanation-column'),
    'Explanation column'
  );
  assert.equal(getPreparationItemValue(preparationView, 'columns'), '54');

  assertNoPrivateExportPreparationText(JSON.stringify(preparationView));
});

test('assignment results export preparation renders stable handoff markers', () => {
  const headerActionsSource = readFileSync(
    'src/components/assignments/assignment-results-header-actions.tsx',
    'utf8'
  );
  const catalogSource = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

  assert.match(
    headerActionsSource,
    /data-handoff="assignment-results-export-preparation"/
  );
  assert.match(
    headerActionsSource,
    /data-handoff-scope=\{exportPreparationView\.privacy\.scope\}/
  );
  assert.match(headerActionsSource, /data-handoff-item=\{itemView\.id\}/);
  assert.match(
    headerActionsSource,
    /AssignmentResultsExportPreparationItem[\s\S]*const labelId = `assignment-results-export-preparation-\$\{itemView\.id\}-label`[\s\S]*const valueId = `assignment-results-export-preparation-\$\{itemView\.id\}-value`[\s\S]*const descriptionId = `assignment-results-export-preparation-\$\{itemView\.id\}-description`[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*data-handoff-item=\{itemView\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{itemView\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
  assert.match(catalogSource, /\|\s*6i\s*\|/);
});

function getPreparationItemValue(
  view: AssignmentResultsExportPreparationView,
  id: AssignmentResultsExportPreparationItemId
) {
  const itemView = view.itemViews.find((item) => item.id === id);
  assert.ok(itemView, `Missing export preparation item ${id}`);
  return itemView.value;
}

function assertNoPrivateExportPreparationText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACCEPTED_ANSWER,
    SECRET_ANSWER_TEXT,
    SECRET_INSTRUCTIONS,
    SECRET_PROMPT_TEXT,
    SECRET_TOKEN,
    'data:text/csv',
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Export preparation leaked private text: ${privateValue}`
    );
  }
}
