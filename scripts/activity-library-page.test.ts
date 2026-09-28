import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildActivityLibraryPageViewModel,
  buildActivityLibrarySourceScopeBoundary,
} from '@/activities/library-view';
import { summarizeActivityLibrary } from '@/activities/library-summary';
import type { ActivityContent } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_LIBRARY_ANSWER';
const SECRET_FILE_ID = 'secret-library-file-id';
const SECRET_FILENAME = 'secret-library-worksheet.pdf';
const SECRET_PROMPT = 'SECRET_LIBRARY_PROMPT';

const worksheetContent = buildActivityContentFixture({
  fileId: SECRET_FILE_ID,
  kind: 'worksheet',
  originalName: SECRET_FILENAME,
});

test('activity library keeps full filtered overview separate from visible page counts', () => {
  const fullFilteredActivities = [
    buildActivityFixture({
      contentJson: worksheetContent,
      id: 'visible-activity',
      title: 'Unit 1 worksheet quiz',
      updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    }),
    buildActivityFixture({
      contentJson: buildActivityContentFixture({
        fileId: 'worksheet-file-2',
        kind: 'worksheet',
        originalName: 'worksheet-2.pdf',
      }),
      id: 'hidden-page-activity-1',
      title: 'Unit 1 worksheet practice',
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    }),
    buildActivityFixture({
      contentJson: buildActivityContentFixture({
        fileId: 'worksheet-file-3',
        kind: 'worksheet',
        originalName: 'worksheet-3.pdf',
      }),
      id: 'hidden-page-activity-2',
      title: 'Unit 1 worksheet review',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }),
  ];
  const pageView = buildActivityLibraryPageViewModel({
    data: {
      items: [fullFilteredActivities[0]],
      summary: summarizeActivityLibrary(fullFilteredActivities),
      total: fullFilteredActivities.length,
    },
    isLoading: false,
    search: {
      page: 1,
      q: ' Unit   1 ',
      source: 'worksheet',
      status: 'active',
      template: 'quiz',
    },
  });
  assert.deepEqual(pageView.sourceScopeBoundary, {
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    fullFilteredActivityCount: 3,
    keepsVisiblePageCountsSeparate: true,
    normalizedSearchQuery: 'Unit 1',
    overviewActivityCount: 3,
    scope: 'owner-activity-library-source-scope',
    sourceFilter: 'worksheet',
    statusFilter: 'active',
    templateFilter: 'quiz',
    usesFullFilteredSummaryForOverview: true,
    visiblePageActivityCount: 1,
  });
});

test('activity library source boundary keeps starter previews out of owned counts', () => {
  const pageView = buildActivityLibraryPageViewModel({
    data: null,
    isLoading: false,
    search: {},
  });

  assert.deepEqual(pageView.sourceScopeBoundary, {
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    fullFilteredActivityCount: 0,
    keepsVisiblePageCountsSeparate: true,
    overviewActivityCount: 0,
    scope: 'owner-activity-library-source-scope',
    sourceFilter: 'all',
    statusFilter: 'active',
    templateFilter: 'all',
    usesFullFilteredSummaryForOverview: true,
    visiblePageActivityCount: 0,
  });
});

test('activity library source boundary normalizes unsafe count inputs', () => {
  assert.deepEqual(
    buildActivityLibrarySourceScopeBoundary({
      normalizedSearchQuery: undefined,
      sourceFilter: 'audio',
      statusFilter: 'archived',
      templateFilter: 'all',
      totalActivities: Number.NaN,
      visibleCount: 5,
    }),
    {
      broadensBeyondOwner: false,
      countsStarterPreviewAsOwned: false,
      fullFilteredActivityCount: 0,
      keepsVisiblePageCountsSeparate: true,
      overviewActivityCount: 0,
      scope: 'owner-activity-library-source-scope',
      sourceFilter: 'audio',
      statusFilter: 'archived',
      templateFilter: 'all',
      usesFullFilteredSummaryForOverview: true,
      visiblePageActivityCount: 0,
    }
  );
});

function buildActivityFixture({
  contentJson,
  id,
  title,
  updatedAt,
}: {
  contentJson: ActivityContent;
  id: string;
  title: string;
  updatedAt: Date;
}) {
  return {
    contentJson,
    description: 'Owner-scoped worksheet practice',
    id,
    templateType: 'quiz',
    title,
    updatedAt,
    visibility: 'draft',
  } as const;
}

function buildActivityContentFixture({
  fileId,
  kind,
  originalName,
}: {
  fileId: string;
  kind: 'worksheet';
  originalName: string;
}): ActivityContent {
  return {
    difficulty: 'core',
    gradeBand: 'Grade 4',
    groups: [],
    language: 'en',
    learningGoal: 'Review worksheet vocabulary.',
    pairs: [],
    questions: [
      {
        answer: SECRET_ANSWER,
        id: 'question-1',
        options: [
          {
            id: 'option-1',
            isCorrect: true,
            text: SECRET_ANSWER,
          },
        ],
        prompt: SECRET_PROMPT,
      },
    ],
    sourceMaterials: [
      {
        contentType: 'application/pdf',
        fileId,
        kind,
        originalName,
        size: 1200,
      },
    ],
    sourceSummary: 'Private source summary',
    subject: 'English',
    teacherNotes: ['Private teacher note'],
    vocabulary: ['worksheet'],
  };
}
