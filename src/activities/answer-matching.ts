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
  return unique(
    expectedAnswer
      .split(/\s*(?:\/|／|;|；|、)\s*/u)
      .map((answer) => answer.trim())
      .filter(Boolean)
  );
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

function unique(values: string[]) {
  return [...new Set(values)];
}
