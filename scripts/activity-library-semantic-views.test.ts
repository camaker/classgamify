import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS,
  buildActivityLibraryPageViewModel,
} from '@/activities/library-view';
import { summarizeActivityLibrary } from '@/activities/library-summary';
import type { ActivityContent, ActivityVisibility } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_FILE_ID = 'SECRET_LIBRARY_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/source-material.pdf';

test('activity dashboard route renders the page handoff marker and item outputs', () => {
  const routeSource = readFileSync(
    'src/routes/dashboard/activities.tsx',
    'utf8'
  );

  assert.match(
    routeSource,
    /<ActivityLibraryPageHandoff[\s\S]*handoffView=\{activePageView\.handoffView\}[\s\S]*\/>/,
    'Activity dashboard route should render the prepared activity-library page handoff view.'
  );
  assert.match(
    routeSource,
    /function ActivityLibraryPageHandoff[\s\S]*data-handoff="activity-library"[\s\S]*data-handoff-scope=\{handoffView\.privacy\.scope\}[\s\S]*handoffView\.itemViews\.map\(\(item\) =>[\s\S]*ActivityLibraryPageHandoffItem[\s\S]*function ActivityLibraryPageHandoffItem[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*aria-describedby=\{descriptionId\}[\s\S]*aria-label=\{item\.ariaLabel\}[\s\S]*aria-labelledby=\{`\$\{labelId\} \$\{valueId\}`\}/,
    'Activity dashboard route should expose the activity-library marker, stable item markers, and prepared item outputs.'
  );
});

test('activity library page exposes a 30-slice owner-scoped handoff', () => {
  const activeActivities = [
    buildLibraryActivity({
      content: buildContent({
        sourceMaterials: [
          {
            fileId: `${SECRET_FILE_ID}-audio`,
            kind: 'audio',
            originalName: 'Weather listening.mp3',
          },
          {
            fileId: `${SECRET_FILE_ID}-worksheet`,
            kind: 'worksheet-document',
            originalName: `${SECRET_STORAGE_KEY}?token=private`,
          },
        ],
      }),
      id: 'weather-quiz',
      templateType: 'quiz',
      title: 'Weather quiz',
      visibility: 'draft',
    }),
    buildLibraryActivity({
      content: buildContent({
        sourceMaterials: [
          {
            fileId: `${SECRET_FILE_ID}-spreadsheet`,
            kind: 'spreadsheet',
            originalName: 'weather-vocab.csv',
          },
        ],
      }),
      id: 'weather-groups',
      templateType: 'group-sort',
      title: 'Weather groups',
      visibility: 'private',
    }),
  ];
  const archivedActivity = buildLibraryActivity({
    content: buildContent(),
    id: 'archived-weather',
    templateType: 'match-up',
    title: 'Archived weather',
    visibility: 'archived',
  });
  const pageView = buildActivityLibraryPageViewModel({
    data: {
      items: activeActivities,
      statusSummary: summarizeActivityLibrary([
        ...activeActivities,
        archivedActivity,
      ]),
      summary: summarizeActivityLibrary(activeActivities),
      total: activeActivities.length,
    },
    isLoading: false,
    search: {
      page: 1,
      q: '  weather  ',
      source: 'extractable',
      status: 'active',
      template: 'all',
    },
  });
  const handoffView = pageView.handoffView;
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...ACTIVITY_LIBRARY_PAGE_HANDOFF_ITEM_IDS]);
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
    broadensBeyondOwner: false,
    countsStarterPreviewAsOwned: false,
    exposesDerivativeDraftPayloads: false,
    exposesPrivateActivityContent: false,
    exposesSourceMaterialFilenames: false,
    exposesSourceMaterialFileIds: false,
    exposesSourceMaterialStorageKeys: false,
    itemIds,
    keepsVisiblePageCountsSeparate: true,
    scope: 'owner-activity-library-source-scope',
    usesFullFilteredSummaryForOverview: true,
    usesOwnerScopedSourceFilters: true,
  });

  assert.equal(getHandoffValue(handoffView.itemViews, 'summary-total'), '2');
  assert.equal(
    getHandoffValue(
      handoffView.itemViews,
      'source-capability-audio-extraction'
    ),
    '1'
  );
  assert.equal(
    getHandoffValue(
      handoffView.itemViews,
      'source-capability-worksheet-extraction'
    ),
    '1'
  );
  assert.equal(
    getHandoffValue(
      handoffView.itemViews,
      'source-capability-spreadsheet-import'
    ),
    '1'
  );
  assert.equal(getHandoffValue(handoffView.itemViews, 'status-active'), '2');
  assert.equal(getHandoffValue(handoffView.itemViews, 'status-archived'), '1');
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'filter-summary'),
    '2 matches'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-page-items'),
    '2 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-publish-ready'),
    '2 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-publish-blocked'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-duplicate-ready'),
    '2 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-duplicate-blocked'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-remix-ready'),
    '2 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-remix-blocked'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-archive-ready'),
    '2 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'visible-restore-ready'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(
      handoffView.itemViews,
      'visible-source-material-activities'
    ),
    '2 visible activities'
  );
  assert.equal(
    getHandoffValue(
      handoffView.itemViews,
      'visible-extractable-source-activities'
    ),
    '2 visible activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'pagination'),
    'Page 1 of 1; 2 owned activities'
  );
  assert.equal(
    getHandoffValue(handoffView.itemViews, 'starter-preview'),
    '0 starter previews'
  );

  const serializedHandoffView = JSON.stringify(handoffView);
  assertNoPrivateMaterialText(serializedHandoffView);
});

test('activity library handoff counts archived lifecycle gates', () => {
  const archivedActivity = buildLibraryActivity({
    content: buildContent(),
    id: 'archived-weather',
    templateType: 'match-up',
    title: 'Archived weather',
    visibility: 'archived',
  });
  const pageView = buildActivityLibraryPageViewModel({
    data: {
      items: [archivedActivity],
      statusSummary: summarizeActivityLibrary([archivedActivity]),
      summary: summarizeActivityLibrary([archivedActivity]),
      total: 1,
    },
    isLoading: false,
    search: {
      status: 'archived',
    },
  });

  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'visible-publish-ready'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'visible-publish-blocked'),
    '1 visible activities'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'visible-duplicate-ready'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(
      pageView.handoffView.itemViews,
      'visible-duplicate-blocked'
    ),
    '1 visible activities'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'visible-remix-ready'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'visible-remix-blocked'),
    '1 visible activities'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'visible-archive-ready'),
    '0 visible activities'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'visible-restore-ready'),
    '1 visible activities'
  );
});

test('starter previews remain outside owned activity metrics', () => {
  const pageView = buildActivityLibraryPageViewModel({
    data: null,
    isLoading: false,
    search: {},
  });

  assert.equal(pageView.totalActivities, 0);
  assert.equal(pageView.starterPreview.activities.length, 2);
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'summary-total'),
    '0'
  );
  assert.equal(
    getHandoffValue(pageView.handoffView.itemViews, 'starter-preview'),
    '2 starter previews'
  );
  assert.equal(pageView.handoffView.privacy.countsStarterPreviewAsOwned, false);
});

type LibraryActivityFixture = {
  content: ActivityContent;
  id: string;
  templateType: 'group-sort' | 'match-up' | 'quiz';
  title: string;
  visibility: ActivityVisibility;
};

function buildLibraryActivity({
  content,
  id,
  templateType,
  title,
  visibility,
}: LibraryActivityFixture) {
  return {
    contentJson: content,
    description: `${title} description`,
    id,
    templateType,
    title,
    visibility,
  };
}

function buildContent({
  sourceMaterials = [],
}: {
  sourceMaterials?: ActivityContent['sourceMaterials'];
} = {}): ActivityContent {
  return {
    difficulty: 'core',
    gradeBand: 'Grade 4',
    groups: [
      {
        id: 'weather-group',
        items: ['rain', 'snow'],
        label: 'Weather',
      },
    ],
    language: 'en',
    learningGoal: 'Students can review weather vocabulary.',
    pairs: [
      {
        id: 'pair-rain',
        left: 'rain',
        right: 'water from clouds',
      },
    ],
    questions: [
      {
        answer: 'rain',
        id: 'question-rain',
        options: [
          { id: 'rain', isCorrect: true, text: 'rain' },
          { id: 'sun', text: 'sun' },
        ],
        prompt: 'What falls from clouds?',
      },
    ],
    sourceMaterials,
    sourceSummary: 'Weather lesson notes.',
    subject: 'English',
    teacherNotes: ['Review before assigning.'],
    vocabulary: ['rain', 'snow', 'wind'],
  };
}

function getHandoffValue(
  itemViews: Array<{ id: string; value: string }>,
  id: string
) {
  const item = itemViews.find((view) => view.id === id);
  assert.ok(item, `Expected activity library handoff item ${id}`);
  return item.value;
}

function assertNoPrivateMaterialText(value: string) {
  for (const privateValue of [
    SECRET_FILE_ID,
    SECRET_STORAGE_KEY,
    'token=private',
  ]) {
    assert.equal(
      value.includes(privateValue),
      false,
      `Activity library handoff leaked private material text: ${privateValue}`
    );
  }
}
