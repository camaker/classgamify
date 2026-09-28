import assert from 'node:assert/strict';
import test from 'node:test';
import { buildActivityLibraryPageViewModel } from '@/activities/library-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

test('starter previews remain outside owned activity metrics', () => {
  const pageView = buildActivityLibraryPageViewModel({
    data: null,
    isLoading: false,
    search: {},
  });

  assert.equal(pageView.totalActivities, 0);
  assert.equal(pageView.starterPreview.activities.length, 2);
});
