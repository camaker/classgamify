import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildSettingsPaymentPageViewModel,
  normalizeSettingsPaymentCallback,
} from '@/settings/billing-view';
import {
  buildPaymentStatusView,
  getInitialPaymentConfirmationStatus,
} from '@/payment/payment-status-view';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const PAYMENT_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/payment.tsx',
  'utf8'
);

test('settings payment callback normalizes only teacher-workspace paths', () => {
  assert.equal(
    normalizeSettingsPaymentCallback('/dashboard/assignments?published=abc'),
    '/dashboard/assignments?published=abc'
  );
  assert.equal(
    normalizeSettingsPaymentCallback('dashboard/assignments#results'),
    '/dashboard/assignments#results'
  );
  for (const unsafeCallback of [
    undefined,
    '',
    'https://evil.example/dashboard',
    '//evil.example/dashboard',
    'javascript:alert(1)',
  ]) {
    assert.equal(
      normalizeSettingsPaymentCallback(unsafeCallback),
      '/settings/billing'
    );
  }

  assert.equal(
    buildSettingsPaymentPageViewModel({
      callback: 'https://evil.example/payments',
    }).callback,
    '/settings/billing'
  );
  assert.equal(
    buildSettingsPaymentPageViewModel({
      callback: '/dashboard/assignments',
    }).callback,
    '/dashboard/assignments'
  );
  assert.match(
    PAYMENT_ROUTE_SOURCE,
    /validateSearch:[\s\S]*session_id:[\s\S]*callback:[\s\S]*buildSettingsPaymentPageViewModel\(\{[\s\S]*callback: search\.callback[\s\S]*PaymentCard sessionId=\{search\.session_id\} callback=\{pageView\.callback\}/,
    'Payment route should validate search, normalize callback, and pass safe route state into the payment card.'
  );
});

test('payment status view keeps hosted checkout states classroom-scoped', () => {
  assert.equal(getInitialPaymentConfirmationStatus(undefined), 'failed');
  assert.equal(getInitialPaymentConfirmationStatus('cs_test'), 'processing');

  const processing = buildPaymentStatusView('processing');
  const success = buildPaymentStatusView('success');
  const failed = buildPaymentStatusView('failed');
  const timeout = buildPaymentStatusView('timeout');

  assert.deepEqual(
    [processing.tone, success.tone, failed.tone, timeout.tone],
    ['working', 'success', 'danger', 'warning']
  );
  assert.deepEqual(
    [processing.icon, success.icon, failed.icon, timeout.icon],
    ['loader', 'check', 'x', 'alert']
  );
  assert.match(processing.description, /teacher workspace/);
  assert.match(success.description, /activity, assignment, and AI access/);
  assert.match(failed.description, /pricing page/);
  assert.match(timeout.description, /assignment workflow limits/);
  assert.match(processing.nextStep.description, /result workflows/);
  assert.match(timeout.nextStep.description, /source of truth/);
});
