import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');
const CONTACT_FORM_SOURCE = readFileSync(
  'src/components/contact/contact-form-card.tsx',
  'utf8'
);
const CONTACT_ROUTE_SOURCE = readFileSync(
  'src/routes/(pages)/contact.tsx',
  'utf8'
);
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('contact classroom intake keeps internal handoff out of public DOM', () => {
  assert.doesNotMatch(
    CONTACT_FORM_SOURCE,
    /ClassroomIntakeHandoff|ContactClassroomIntakeHandoffItemView|ContactClassroomIntakeHandoffView|buildContactClassroomIntakeHandoffView|data-handoff|data-handoff-item/,
    'The public contact form should render the classroom scope panel and structured fields without exposing the internal 30-slice intake handoff.'
  );
  assert.doesNotMatch(
    CONTACT_ROUTE_SOURCE,
    /ClassroomIntakeHandoff|contact-classroom-intake-handoff|data-handoff|data-handoff-item|pageView\.handoffView/,
    'The public contact route should not render contact intake audit handoff markup.'
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /On `\/contact\?subject=classroom`, verify the public contact DOM[\s\S]*does not render internal intake handoff markup/,
    'The public page catalog should keep contact intake audit markup out of the public DOM.'
  );
});
