import assert from 'node:assert/strict';
import test from 'node:test';
import { getCatchBoundaryMessage } from '@/lib/catch-boundary-message';

test('router error messages survive serialization and foreign prototypes', () => {
  assert.equal(
    getCatchBoundaryMessage(new Error('local'), 'fallback'),
    'local'
  );
  assert.equal(
    getCatchBoundaryMessage(JSON.parse('{"message":"serialized"}'), 'fallback'),
    'serialized'
  );
  const foreign: unknown = Object.create({ message: 'foreign' });
  assert.equal(getCatchBoundaryMessage(foreign, 'fallback'), 'foreign');
});

test('non-string error messages use renderable localized fallback', () => {
  for (const value of [undefined, null, 'error', 1, {}, { message: {} }]) {
    assert.equal(getCatchBoundaryMessage(value, 'fallback'), 'fallback');
  }
  assert.equal(getCatchBoundaryMessage({ message: '' }, 'fallback'), '');
});
