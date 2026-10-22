import assert from 'node:assert/strict';
import test from 'node:test';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { getTemplateDetailGuide } from '@/pages/template-guide-content';
import { TEMPLATE_GUIDE_PATHS } from '@/pages/template-guide-paths';
import {
  linkChangesLocale,
  PUBLIC_INDEXABLE_STATIC_ROUTES,
} from '@/seo/public-routes';

test('sitemap template guide slugs match TEMPLATE_GUIDE_PATHS', () => {
  const sitemapGuidePaths = PUBLIC_INDEXABLE_STATIC_ROUTES.filter((route) =>
    route.id.startsWith('template-')
  )
    .map((route) => route.path)
    .sort();
  const guidePaths = Object.values(TEMPLATE_GUIDE_PATHS)
    .filter((path) => path.startsWith('/templates/'))
    .sort();

  assert.deepEqual(sitemapGuidePaths, guidePaths);
});

test('every template has a guide path and every /templates guide has copy', () => {
  assert.deepEqual(
    Object.keys(TEMPLATE_GUIDE_PATHS).sort(),
    [...ACTIVITY_TEMPLATE_TYPES].sort()
  );
  for (const [type, path] of Object.entries(TEMPLATE_GUIDE_PATHS)) {
    if (!path.startsWith('/templates/')) continue;
    assert.equal(path, `/templates/${type}`);
    assert.ok(getTemplateDetailGuide(type), `${type} guide copy is missing`);
  }
});

test('only blog links that leave the current locale reload the document', () => {
  try {
    overwriteGetLocale(() => 'fr');
    assert.equal(linkChangesLocale('/blog'), true);
    assert.equal(linkChangesLocale('/pricing'), false);
    overwriteGetLocale(() => 'zh');
    assert.equal(linkChangesLocale('/blog'), false);
    overwriteGetLocale(() => 'en');
    assert.equal(linkChangesLocale('/blog'), false);
  } finally {
    overwriteGetLocale(() => 'en');
  }
});
