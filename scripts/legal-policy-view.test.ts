import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

test('legal routes keep internal policy handoff out of public DOM', () => {
  const markdownPageSource = readFileSync(
    'src/components/page/markdown-page.tsx',
    'utf8'
  );

  assert.doesNotMatch(
    markdownPageSource,
    /MarkdownPageHandoff|data-handoff|data-handoff-item/,
    'Markdown legal pages must not render internal policy handoff markup.'
  );
});
