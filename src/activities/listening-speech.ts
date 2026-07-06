import { m } from '@/locale/paraglide/messages';

export type ListeningPromptStatusItemId = 'language' | 'speech' | 'transcript';

export type ListeningPromptStatusItemView = {
  description: string;
  id: ListeningPromptStatusItemId;
  label: string;
  value: string;
};

export type ListeningPromptView = {
  speechLanguage: string | undefined;
  speechText: string;
  statusItemViews: ListeningPromptStatusItemView[];
  transcriptText: string | undefined;
};

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

export function buildListeningPromptView({
  language,
  prompt,
  revealAnswer,
  speechSupported = false,
}: {
  language: string | null | undefined;
  prompt: string;
  revealAnswer: boolean;
  speechSupported?: boolean;
}): ListeningPromptView {
  const speechLanguage = normalizeListeningSpeechLanguage(language);

  return {
    speechLanguage,
    speechText: prompt,
    statusItemViews: [
      buildListeningLanguageStatusView(speechLanguage),
      buildListeningSpeechSupportStatusView(speechSupported),
      buildListeningTranscriptStatusView(revealAnswer),
    ],
    transcriptText: revealAnswer ? prompt : undefined,
  };
}

function buildListeningLanguageStatusView(
  speechLanguage: string | undefined
): ListeningPromptStatusItemView {
  return {
    description: m.activity_runner_listening_language_description(),
    id: 'language',
    label: m.activity_runner_listening_language_label(),
    value: speechLanguage ?? m.activity_runner_listening_language_unknown(),
  };
}

function buildListeningSpeechSupportStatusView(
  speechSupported: boolean
): ListeningPromptStatusItemView {
  if (speechSupported) {
    return {
      description: m.activity_runner_listening_speech_available_description(),
      id: 'speech',
      label: m.activity_runner_listening_speech_status_label(),
      value: m.activity_runner_listening_speech_available_value(),
    };
  }

  return {
    description: m.activity_runner_listening_speech_unavailable_description(),
    id: 'speech',
    label: m.activity_runner_listening_speech_status_label(),
    value: m.activity_runner_listening_speech_unavailable_value(),
  };
}

function buildListeningTranscriptStatusView(
  revealAnswer: boolean
): ListeningPromptStatusItemView {
  if (revealAnswer) {
    return {
      description: m.activity_runner_listening_transcript_visible_description(),
      id: 'transcript',
      label: m.activity_runner_listening_transcript_status_label(),
      value: m.activity_runner_listening_transcript_visible_value(),
    };
  }

  return {
    description: m.activity_runner_listening_transcript_hidden_description(),
    id: 'transcript',
    label: m.activity_runner_listening_transcript_status_label(),
    value: m.activity_runner_listening_transcript_hidden_value(),
  };
}

function normalizeSpeechLanguageTag(value: string) {
  const tag = value.replace(/_/g, '-');

  if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/iu.test(tag)) {
    return undefined;
  }

  return tag
    .split('-')
    .map((part, index) => {
      if (index === 0) return part.toLocaleLowerCase();
      if (/^[a-z]{2}$/iu.test(part)) return part.toLocaleUpperCase();
      return part.toLocaleLowerCase();
    })
    .join('-');
}
