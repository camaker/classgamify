import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildHomePageViewModel } from '@/pages/public-page-view';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const HOME_ROUTE_SOURCE = readFileSync('src/routes/index.tsx', 'utf8');

test('homepage route keeps internal product-loop handoff out of public DOM', () => {
  assert.doesNotMatch(
    HOME_ROUTE_SOURCE,
    /HomePageProductLoopHandoff|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Homepage route must not render internal product-loop handoff markup on the public page.'
  );
});

test('homepage visual model and handoff share route constants', () => {
  const pageView = buildHomePageViewModel();

  assert.equal(pageView.hero.primaryAction.to, Routes.Create);
  assert.equal(pageView.hero.browseTemplatesAction.to, Routes.Templates);
  assert.equal(pageView.hero.worksheetAction.to, Routes.Worksheets);
});
