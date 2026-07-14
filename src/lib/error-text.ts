export function getErrorTextChain(error: unknown) {
  const messages: string[] = [];
  const seen = new Set<unknown>();
  let current = error;

  for (let depth = 0; depth < 6 && !seen.has(current); depth += 1) {
    seen.add(current);
    if (typeof current === 'string') {
      messages.push(current);
      break;
    }
    if (!current || typeof current !== 'object') break;
    if ('message' in current && typeof current.message === 'string') {
      messages.push(current.message);
    }
    current = 'cause' in current ? current.cause : undefined;
  }

  return messages.join('\n');
}
