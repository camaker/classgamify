const SPEECH_LANGUAGE_ALIASES = new Map<string, string>([
  ['chinese', 'zh-CN'],
  ['mandarin', 'zh-CN'],
  ['simplified chinese', 'zh-CN'],
  ['traditional chinese', 'zh-TW'],
  ['中文', 'zh-CN'],
  ['普通话', 'zh-CN'],
  ['國語', 'zh-TW'],
  ['英语', 'en-US'],
  ['英文', 'en-US'],
  ['english', 'en-US'],
]);

export function normalizeListeningSpeechLanguage(
  language: string | null | undefined
) {
  const normalized = language?.normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (!normalized) return undefined;

  const alias = SPEECH_LANGUAGE_ALIASES.get(normalized.toLocaleLowerCase());
  if (alias) return alias;

  const tag = normalizeSpeechLanguageTag(normalized);
  if (!tag) return undefined;

  const lowerTag = tag.toLocaleLowerCase();
  if (lowerTag === 'zh' || lowerTag === 'zh-hans') return 'zh-CN';
  if (lowerTag === 'zh-hant') return 'zh-TW';
  if (lowerTag === 'en') return 'en-US';

  return tag;
}

function normalizeSpeechLanguageTag(value: string) {
  if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/iu.test(value)) {
    return undefined;
  }

  return value
    .split('-')
    .map((part, index) => {
      if (index === 0) return part.toLocaleLowerCase();
      if (/^[a-z]{2}$/iu.test(part)) return part.toLocaleUpperCase();
      return part.toLocaleLowerCase();
    })
    .join('-');
}
