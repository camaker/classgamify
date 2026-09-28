import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

test('blog routes keep internal editorial handoff out of public DOM', () => {
  const blogListRouteSource = readFileSync('src/routes/blog/index.tsx', 'utf8');
  const blogPostRouteSource = readFileSync('src/routes/blog/$slug.tsx', 'utf8');

  assert.doesNotMatch(
    blogListRouteSource,
    /PublicEditorialHandoff|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Blog list route must not render internal editorial handoff markup.'
  );
  assert.doesNotMatch(
    blogListRouteSource,
    /public-editorial-handoff/,
    'Blog list route must not import the internal editorial handoff component.'
  );
  assert.doesNotMatch(
    blogPostRouteSource,
    /PublicEditorialHandoff|buildPublicEditorialHandoffView|data-handoff|data-handoff-item/,
    'Blog post route must not render internal editorial handoff markup.'
  );
  assert.match(
    blogListRouteSource,
    /loaderDeps:\s*\(\{ search \}\) => \(\{ page: search\.page \?\? 1 \}\)/,
    'The first blog page must load without forcing ?page=1 into its URL.'
  );
  assert.match(
    blogListRouteSource,
    /Number\.isInteger\(parsedValue\) && parsedValue > 1[\s\S]*: undefined/,
    'Only page 2 and later should survive blog search normalization.'
  );
});
