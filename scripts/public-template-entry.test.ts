import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const TEMPLATES_ROUTE_SOURCE = readFileSync('src/routes/templates.tsx', 'utf8');
const WORKSHEETS_ROUTE_SOURCE = readFileSync(
  'src/routes/worksheets.tsx',
  'utf8'
);

test('public template entry routes keep internal handoff out of public DOM', () => {
  assert.doesNotMatch(
    `${TEMPLATES_ROUTE_SOURCE}\n${WORKSHEETS_ROUTE_SOURCE}`,
    /PublicTemplateEntryHandoffPanel|public-template-entry-handoff-panel|data-handoff|data-handoff-item|pageView\.handoffView/,
    'Template and worksheet public routes must not render internal template-entry handoff markup.'
  );
});
