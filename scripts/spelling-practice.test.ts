import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSpellingHint,
  countCorrectSpellings,
  isSpellingCorrect,
  parseSpellingWords,
  SPELLING_MAX_WORDS,
  shuffleWords,
} from '@/pages/spelling-practice';

test('parseSpellingWords splits, trims, and dedupes pasted lists', () => {
  assert.deepEqual(
    parseSpellingWords(' because\nFriend, friend ;  ice  cream \n\n'),
    ['because', 'Friend', 'ice cream']
  );
  assert.deepEqual(parseSpellingWords('   \n,;'), []);
});

test('parseSpellingWords caps the list and drops overlong entries', () => {
  const many = Array.from({ length: 40 }, (_, index) => `word${index}`);
  assert.equal(parseSpellingWords(many.join('\n')).length, SPELLING_MAX_WORDS);
  assert.deepEqual(parseSpellingWords(`${'a'.repeat(31)}\nok`), ['ok']);
});

test('buildSpellingHint shows only the first letter and keeps spaces and hyphens', () => {
  assert.equal(buildSpellingHint('apple'), 'a _ _ _ _');
  assert.equal(buildSpellingHint('ice cream'), 'i _ _   _ _ _ _ _');
  assert.equal(buildSpellingHint('well-known'), 'w _ _ _ - _ _ _ _ _');
});

test('spelling answers ignore case and surrounding spaces', () => {
  assert.equal(isSpellingCorrect('Friend', '  friend '), true);
  assert.equal(isSpellingCorrect('friend', 'freind'), false);
  assert.equal(countCorrectSpellings(['a', 'b', 'c'], { a: 'A', b: 'x' }), 1);
});

test('shuffleWords keeps every word and does not mutate the input', () => {
  const input = ['a', 'b', 'c', 'd'];
  const shuffled = shuffleWords(input, () => 0);
  assert.deepEqual([...shuffled].sort(), input);
  assert.deepEqual(input, ['a', 'b', 'c', 'd']);
});
