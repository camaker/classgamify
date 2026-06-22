export function buildQuestionOptionTexts({
  answer,
  maxOptions = 5,
  options,
}: {
  answer: string;
  maxOptions?: number;
  options?: string[];
}) {
  return uniqueQuestionOptionTexts([answer, ...(options ?? [])]).slice(
    0,
    maxOptions
  );
}

function uniqueQuestionOptionTexts(values: string[]) {
  const seen = new Set<string>();
  const options: string[] = [];

  for (const value of values) {
    const option = normalizeQuestionOptionDisplayText(value);
    const key = normalizeQuestionOptionText(option);
    if (!option || seen.has(key)) continue;

    seen.add(key);
    options.push(option);
  }

  return options;
}

export function normalizeQuestionOptionText(value: string) {
  return normalizeQuestionOptionDisplayText(value).toLowerCase();
}

export function normalizeQuestionOptionDisplayText(value: string) {
  return value.normalize('NFKC').trim();
}
