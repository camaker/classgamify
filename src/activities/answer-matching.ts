type AnswerMatchResult = {
  acceptedAnswer: string;
  correct: boolean;
  normalizedAcceptedAnswer: string;
  normalizedSubmittedAnswer: string;
};

export function matchAnswer({
  expectedAnswer,
  submittedAnswer,
}: {
  expectedAnswer: string;
  submittedAnswer: string;
}): AnswerMatchResult {
  const normalizedSubmittedAnswer = normalizeAnswerForMatching(submittedAnswer);
  const acceptedAnswers = getAcceptedAnswers(expectedAnswer);
  const match = acceptedAnswers
    .map((answer) => ({
      raw: answer,
      normalized: normalizeAnswerForMatching(answer),
    }))
    .find((answer) => answer.normalized === normalizedSubmittedAnswer);

  return {
    acceptedAnswer: match?.raw ?? acceptedAnswers[0] ?? expectedAnswer,
    correct: Boolean(match && normalizedSubmittedAnswer),
    normalizedAcceptedAnswer:
      match?.normalized ?? normalizeAnswerForMatching(expectedAnswer),
    normalizedSubmittedAnswer,
  };
}

export function getAcceptedAnswers(expectedAnswer: string) {
  return getUniqueAcceptedAnswers(
    expectedAnswer
      .split(/\s*(?:\/|／|;|；|、)\s*/u)
      .map((answer) => answer.trim())
      .filter(Boolean)
  );
}

export function getUniqueAcceptedAnswers(values: string[]) {
  const seen = new Set<string>();
  const acceptedAnswers: string[] = [];

  for (const value of values) {
    const displayValue = value.trim();
    const normalized = normalizeAnswerForMatching(displayValue);

    if (!normalized || seen.has(normalized)) continue;

    seen.add(normalized);
    acceptedAnswers.push(displayValue);
  }

  return acceptedAnswers;
}

function normalizeAnswerForMatching(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[’‘`´']/gu, '')
    .replace(/&/gu, ' and ')
    .replace(/[.,!?;:，。！？；：、()[\]{}"“”\-_‐‑‒–—―]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}
