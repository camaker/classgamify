export function parseCharactersSearch(value: unknown) {
  const characters = normalizeCharacters(readCharacterSearchValues(value));
  return characters.length > 0 ? characters : undefined;
}

function readCharacterSearchValues(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => readCharacterSearchValues(item));
  }

  if (typeof value !== 'string') return [];

  const trimmedValue = value.trim();
  if (!trimmedValue) return [];

  if (trimmedValue.startsWith('[')) {
    try {
      const parsedValue = JSON.parse(trimmedValue) as unknown;
      if (Array.isArray(parsedValue)) {
        return readCharacterSearchValues(parsedValue);
      }
    } catch {
      return [];
    }
  }

  return trimmedValue.split(/[,\uFF0C\s]+/);
}

function normalizeCharacters(values: unknown[]) {
  const seen = new Set<string>();
  return values
    .filter((item): item is string => typeof item === 'string')
    .flatMap((item) => expandCharacterSearchValue(item.trim()))
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

function expandCharacterSearchValue(value: string) {
  if (!value) return [];

  const characters = Array.from(value);
  if (characters.length > 1 && characters.every(isHanCharacter)) {
    return characters;
  }

  return [value];
}

function isHanCharacter(value: string) {
  return /^\p{Script=Han}$/u.test(value);
}
