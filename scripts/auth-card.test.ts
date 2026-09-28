import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const AUTH_CARD_SOURCE = readFileSync(
  'src/components/auth/auth-card.tsx',
  'utf8'
);

test('auth card shows only the heading, form, and account switch link', () => {
  assert.match(
    AUTH_CARD_SOURCE,
    /<CardDescription[\s\S]*\{headerLabel\}[\s\S]*<CardContent[\s\S]*\{children\}[\s\S]*<BottomLink/,
    'AuthCard should render the heading, the form, and the sign-in/sign-up switch.'
  );
  assert.doesNotMatch(
    AUTH_CARD_SOURCE,
    /workspaceBoundary|benefits|trustNote|returnHint|workflowSteps/,
    'AuthCard must not stack explanation panels above the sign-in form.'
  );
  assert.doesNotMatch(
    AUTH_CARD_SOURCE,
    /data-handoff|data-handoff-item/,
    'Public auth pages must not render internal handoff audit markup.'
  );
});
