/**
 * Pure helpers for the spelling practice on /spelling-game-generator.
 * Nothing here is stored or sent anywhere; the page keeps state in memory.
 */
export const SPELLING_MAX_WORDS = 20;
export const SPELLING_MAX_WORD_LENGTH = 30;

export const SPELLING_SAMPLE_WORDS = [
  'because',
  'friend',
  'beautiful',
  'enough',
  'neighbor',
];

/** Splits pasted text on new lines, commas, and semicolons. */
export function parseSpellingWords(text: string): string[] {
  const seen = new Set<string>();
  const words: string[] = [];

  for (const part of text.split(/[\n,;]+/)) {
    const word = part.trim().replace(/\s+/g, ' ');
    if (!word || word.length > SPELLING_MAX_WORD_LENGTH) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    words.push(word);
    if (words.length >= SPELLING_MAX_WORDS) break;
  }

  return words;
}

/** First letter plus one blank per remaining letter; spaces and hyphens stay. */
export function buildSpellingHint(word: string): string {
  return Array.from(word)
    .map((char, index) => {
      if (index === 0 || char === ' ' || char === '-') return char;
      return '_';
    })
    .join(' ');
}

export function isSpellingCorrect(word: string, answer: string): boolean {
  return answer.trim().toLowerCase() === word.toLowerCase();
}

export function countCorrectSpellings(
  words: readonly string[],
  answers: Readonly<Record<string, string>>
): number {
  return words.filter((word) => isSpellingCorrect(word, answers[word] ?? ''))
    .length;
}

/** Fisher-Yates; pass a random source so tests stay deterministic. */
export function shuffleWords(
  words: readonly string[],
  random: () => number = Math.random
): string[] {
  const result = [...words];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}
