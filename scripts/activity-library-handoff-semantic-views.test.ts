import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS,
  buildActivityLibraryPageViewModel,
  buildActivityLibrarySourceScopeBoundary,
  type ActivityLibraryPageHandoffItemId,
  type ActivityLibraryPageHandoffView,
} from '@/activities/library-view';
import { summarizeActivityLibrary } from '@/activities/library-summary';
import type { ActivityContent } from '@/activities/types';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ANSWER = 'SECRET_LIBRARY_ANSWER';
const SECRET_FILE_ID = 'secret-library-file-id';
const SECRET_FILENAME = 'secret-library-worksheet.pdf';
const SECRET_PROMPT = 'SECRET_LIBRARY_PROMPT';
const SECRET_STORAGE_KEY = 'userfiles/teacher/source-material.pdf';
const DASHBOARD_ACTIVITIES_ROUTE_SOURCE = readFileSync(
  'src/routes/dashboard/activities.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

const worksheetContent = buildActivityContentFixture({
  fileId: SECRET_FILE_ID,
  kind: 'worksheet',
  originalName: SECRET_FILENAME,
});

test('activity library handoff keeps full filtered overview separate from visible page counts', () => {
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
  const handoffValues = getHandoffValues(pageView.handoffView);

  assert.deepEqual(
    pageView.handoffView.itemViews.map((item) => item.id),
    [...ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS]
  );
  assert.equal(new Set(handoffValues.keys()).size, 30);
  assert.ok(
    pageView.handoffView.itemViews.every(
      (itemView) =>
        itemView.ariaLabel &&
        itemView.description &&
        itemView.label &&
        itemView.value
    )
  );
  assert.deepEqual(pageView.handoffView.privacy, {
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    exposesDerivativeDraftPayloads: false,
    exposesPrivateActivityContent: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds: [...ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS],
    keepsVisiblePageCountsSeparate: true,
    scope: 'owner-activity-library-source-scope',
    usesFullFilteredSummaryForOverview: true,
    usesOwnerScopedSourceFilters: true,
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

  assert.equal(handoffValues.get('summary-total'), '3');
  assert.equal(
    handoffValues.get('summary-template-coverage'),
    `1/${ACTIVITY_TEMPLATE_TYPES.length}`
  );
  assert.equal(handoffValues.get('summary-source-extraction'), '3');
  assert.equal(handoffValues.get('scope-range'), '1-1 of 3');
  assert.equal(handoffValues.get('scope-source'), 'Worksheet');
  assert.equal(handoffValues.get('scope-search'), 'Unit 1');
  assert.equal(
    handoffValues.get('source-capability-worksheet-extraction'),
    '3'
  );
  assert.equal(handoffValues.get('filter-summary'), '3 matches');
  assert.equal(handoffValues.get('visible-page-items'), '1 visible activities');
  assert.equal(
    handoffValues.get('visible-source-material-activities'),
    '1 visible activities'
  );
  assert.equal(
    handoffValues.get('visible-extractable-source-activities'),
    '1 visible activities'
  );
  assert.equal(handoffValues.get('starter-preview'), '0 starter previews');

  assertNoPrivateActivityLibraryHandoffText(
    JSON.stringify(pageView.handoffView)
  );
  assertNoPrivateActivityLibraryHandoffText(
    JSON.stringify(pageView.sourceScopeBoundary)
  );
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
  assert.equal(
    getHandoffValues(pageView.handoffView).get('starter-preview'),
    '2 starter previews'
  );
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

test('activity library handoff renders stable semantic outputs in the route', () => {
  assert.match(
    DASHBOARD_ACTIVITIES_ROUTE_SOURCE,
    /<ActivityLibraryPageHandoff[\s\S]*handoffView=\{activePageView\.handoffView\}[\s\S]*\/>/
  );
  assert.match(
    DASHBOARD_ACTIVITIES_ROUTE_SOURCE,
    /function ActivityLibraryPageHandoff[\s\S]*const titleId = useId\(\)[\s\S]*const descriptionId = useId\(\)[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-labelledby=\{titleId\}[\s\S]*className="sr-only"[\s\S]*data-handoff="activity-library"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*id=\{titleId\}[\s\S]*id=\{descriptionId\}[\s\S]*handoffView\.itemViews\.map\(\(item\) =>[\s\S]*ActivityLibraryPageHandoffItem[\s\S]*function ActivityLibraryPageHandoffItem[\s\S]*item: ActivityLibraryPageHandoffItemView[\s\S]*const labelId = `activity-library-handoff-\$\{item\.id\}-label`[\s\S]*const valueId = `activity-library-handoff-\$\{item\.id\}-value`[\s\S]*const descriptionId = `activity-library-handoff-\$\{item\.id\}-description`[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*id=\{labelId\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}[\s\S]*id=\{valueId\}[\s\S]*id=\{descriptionId\}/
  );
});

test('activity library focused gate is documented', () => {
  const normalizedCatalog = TEST_CATALOG_SOURCE.replace(/\s+/g, ' ');

  assert.match(
    TEST_CATALOG_SOURCE,
    /pnpm exec tsx --test scripts\/activity-library-handoff-semantic-views\.test\.ts/
  );
  for (const boundary of [
    'activity library overview metrics',
    'current-view scope',
    'source-material filters',
    'starter-preview boundaries',
    'visible-card counts',
    'activity library privacy-scope boundaries',
    'hidden activity-library handoff',
  ]) {
    assert.match(normalizedCatalog, new RegExp(boundary));
  }
});

function getHandoffValues(view: ActivityLibraryPageHandoffView) {
  return new Map(
    view.itemViews.map((item) => [
      item.id satisfies ActivityLibraryPageHandoffItemId,
      item.value,
    ])
  );
}

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

function assertNoPrivateActivityLibraryHandoffText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER,
    SECRET_FILE_ID,
    SECRET_FILENAME,
    SECRET_PROMPT,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Activity library handoff leaked private text: ${privateValue}`
    );
  }
}
