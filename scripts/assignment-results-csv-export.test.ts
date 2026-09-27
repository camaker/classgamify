import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAssignmentResultsCsv } from '@/assignments/results-export';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

test('assignment results CSV shares result formatting for dates, duration, and alternatives', () => {
  const csv = buildAssignmentResultsCsv({
    activity: {
      description: 'Live activity description',
      templateType: 'fill-blank',
      title: 'Live activity title',
    },
    analysis: {
      attempts: [
        {
          accuracy: 50,
          answers: [
            {
              acceptedAnswers: ['Paris', 'City of Light', 'Paris'],
              answer: '=SUM(1,2)',
              correct: false,
              expectedAnswer: 'Paris',
              explanation: 'Review the accepted alternative.',
              itemId: 'item-1',
              prompt: 'Capital of France',
              submitted: true,
            },
          ],
          completedAt: new Date('2026-01-02T03:04:05.000Z'),
          durationSeconds: 95,
          id: 'attempt-1',
          score: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
      ],
      needsReview: [],
      perItem: [
        {
          acceptedAnswers: ['Paris', 'City of Light'],
          correctCount: 0,
          correctRate: 0,
          expectedAnswer: 'Paris',
          itemId: 'item-1',
          kind: 'question',
          kindLabel: 'Question',
          prompt: 'Capital of France',
          submittedCount: 1,
          unansweredCount: 0,
        },
      ],
      students: [
        {
          attempts: 1,
          averageAccuracy: 50,
          bestAccuracy: 50,
          lastCompletedAt: new Date('2026-01-02T03:04:05.000Z'),
          latestAccuracy: 50,
          needsReviewCount: 1,
          studentKey: 'student:alice',
          studentLabel: 'Alice',
        },
      ],
    },
    assignment: {
      expiresAt: null,
      id: 'assignment-1',
      settingsJson: {
        collectStudentName: true,
        maxAttempts: 2,
        showCorrectAnswers: true,
        shuffleItems: false,
        timeLimitSeconds: 60,
      },
      shareSlug: 'share-123',
      status: 'published',
      title: 'Export formatting check',
    },
    attempts: [
      {
        completedAt: new Date('2026-01-02T03:04:05.000Z'),
        id: 'attempt-1',
        maxScore: 2,
        resultJson: {
          accuracy: 50,
          completedItemCount: 1,
          durationSeconds: 95,
          totalPoints: 2,
        },
        score: 1,
      },
    ],
    now: Date.parse('2026-01-03T00:00:00.000Z'),
    snapshot: {
      activityDescription: 'Snapshot description',
      activityTitle: 'Snapshot title',
      templateType: 'fill-blank',
    },
    stats: {
      averageDurationSeconds: 95,
      averagePoints: 1,
      averageScore: 50,
      completions: 1,
    },
  });

  assert.match(csv, /"2026-01-02T03:04:05\.000Z"/);
  assert.match(csv, /"60"/);
  assert.match(
    csv,
    /"Snapshot title","Snapshot description","Complete the sentence"/
  );
  assert.doesNotMatch(csv, /"Live activity title","Live activity description"/);
  assert.match(csv, /"Paris"/);
  assert.match(csv, /"City of Light"/);
  assert.doesNotMatch(csv, /"Paris \/ City of Light"/);
  assert.match(csv, /"'=SUM\(1,2\)"/);
});
