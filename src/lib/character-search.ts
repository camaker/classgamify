export function parseCharactersSearch(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeCharacters(value);
  }

  if (typeof value !== 'string') return undefined;

  const trimmedValue = value.trim();
  if (!trimmedValue) return undefined;

  if (trimmedValue.startsWith('[')) {
    try {
      const parsedValue = JSON.parse(trimmedValue) as unknown;
      if (Array.isArray(parsedValue)) {
        return normalizeCharacters(parsedValue);
      }
    } catch {
      return undefined;
    }
  }

  return normalizeCharacters(trimmedValue.split(','));
}

function normalizeCharacters(values: unknown[]) {
  const characters = values
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
  return characters.length > 0 ? characters : undefined;
}
