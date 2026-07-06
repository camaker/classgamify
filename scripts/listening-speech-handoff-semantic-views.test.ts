import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type {
  PublicAttemptReviewItem,
  PublicRuntimeItem,
} from '@/assignments/public';
import {
  buildListeningSpeechHandoffView,
  LISTENING_SPEECH_HANDOFF_ITEM_IDS,
  type ListeningSpeechHandoffItemId,
  type ListeningSpeechHandoffView,
} from '@/assignments/listening-speech-handoff';
import { buildSequentialStudentRunnerView } from '@/assignments/student-runner-view';
import { buildListeningPromptView } from '@/activities/listening-speech';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const SECRET_ACCEPTED_ANSWER = 'SECRET_ACCEPTED_LISTENING_ANSWER';
const SECRET_EXPLANATION = 'SECRET_LISTENING_EXPLANATION';
const SECRET_PROMPT_TEXT = 'SECRET_LISTENING_PROMPT';
const SECRET_RUNTIME_ITEM_ID = 'secret-listening-item-id';
const SECRET_RUNTIME_ITEM_ID_TWO = 'secret-listening-item-id-two';
const SECRET_SOURCE_MATERIAL = 'private-listening-audio.mp3';
const SECRET_STUDENT_NAME = 'Private Listening Student';
const SECRET_TOKEN = 'raw-listening-browser-token';

test('listening speech handoff exposes 30 safe speech and transcript slices', () => {
  const runnerView = buildListeningSequentialRunnerView({
    activeItemId: SECRET_RUNTIME_ITEM_ID_TWO,
    answers: {
      [SECRET_RUNTIME_ITEM_ID]: SECRET_ACCEPTED_ANSWER,
      orphan: SECRET_ACCEPTED_ANSWER,
    },
    items: buildListeningItems(),
    revealAnswer: true,
    reviewItems: buildListeningReviewItems(),
  });
  const handoffView = buildListeningSpeechHandoffView({
    language: '中文',
    promptView: buildListeningPromptView({
      language: '中文',
      prompt: SECRET_PROMPT_TEXT,
      revealAnswer: true,
      speechSupported: true,
    }),
    revealAnswer: true,
    runnerView,
    speechSupported: true,
  });
  const itemIds = handoffView.itemViews.map((item) => item.id);

  assert.deepEqual(itemIds, [...LISTENING_SPEECH_HANDOFF_ITEM_IDS]);
  assert.equal(new Set(itemIds).size, 30);
  assert.equal(
    handoffView.itemViews.every(
      (item) =>
        Boolean(item.ariaLabel) &&
        Boolean(item.description) &&
        Boolean(item.label) &&
        Boolean(item.value)
    ),
    true
  );
  assert.deepEqual(handoffView.privacy, {
    exposesAnswerText: false,
    exposesPromptText: false,
    exposesRuntimeItemIds: false,
    exposesSourceMaterialMetadata: false,
    exposesSpeechText: false,
    exposesStudentIdentity: false,
    itemIds,
    runnerSurface: 'listening',
    scope: 'listening-speech-transcript',
    templateType: 'listening',
    usesSharedSubmissionContract: true,
  });

  assert.equal(getHandoffValue(handoffView, 'template-type'), 'listening');
  assert.equal(getHandoffValue(handoffView, 'runner-surface'), 'listening');
  assert.equal(
    getHandoffValue(handoffView, 'speech-language-source'),
    'Activity language'
  );
  assert.equal(
    getHandoffValue(handoffView, 'normalized-speech-language'),
    'zh-CN'
  );
  assert.equal(getHandoffValue(handoffView, 'speech-support'), 'Ready to play');
  assert.equal(
    getHandoffValue(handoffView, 'speech-playback-action'),
    'Ready to play'
  );
  assert.equal(
    getHandoffValue(handoffView, 'speech-text-boundary'),
    'Speech text hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'transcript-visibility'),
    'Visible in review'
  );
  assert.equal(
    getHandoffValue(handoffView, 'transcript-review-policy'),
    'Visible during review'
  );
  assert.equal(getHandoffValue(handoffView, 'active-track-state'), 'Selected');
  assert.equal(getHandoffValue(handoffView, 'active-track-label'), 'Track 2');
  assert.equal(getHandoffValue(handoffView, 'track-count'), '2 tracks');
  assert.equal(
    getHandoffValue(handoffView, 'visible-track-count'),
    '1 visible track'
  );
  assert.equal(getHandoffValue(handoffView, 'answered-track-count'), '1');
  assert.equal(getHandoffValue(handoffView, 'unanswered-track-count'), '1');
  assert.equal(
    getHandoffValue(handoffView, 'progress-summary'),
    '1 of 2 answered'
  );
  assert.equal(
    getHandoffValue(handoffView, 'sequential-navigation'),
    'Available'
  );
  assert.equal(getHandoffValue(handoffView, 'previous-action'), 'Available');
  assert.equal(getHandoffValue(handoffView, 'next-action'), 'Available');
  assert.equal(getHandoffValue(handoffView, 'answer-input-state'), 'Ready');
  assert.equal(
    getHandoffValue(handoffView, 'choice-answer-mode'),
    'Typed answer'
  );
  assert.equal(
    getHandoffValue(handoffView, 'review-feedback-state'),
    'Visible'
  );
  assert.equal(getHandoffValue(handoffView, 'review-item-count'), '2');
  assert.equal(
    getHandoffValue(handoffView, 'accepted-answer-boundary'),
    'Post-submit only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'explanation-boundary'),
    'Post-submit only'
  );
  assert.equal(
    getHandoffValue(handoffView, 'public-payload-boundary'),
    'Sanitized runtime'
  );
  assert.equal(
    getHandoffValue(handoffView, 'runtime-id-guard'),
    'Item ids hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'prompt-text-guard'),
    'Prompts hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'student-identity-guard'),
    'Student identity hidden'
  );
  assert.equal(
    getHandoffValue(handoffView, 'privacy-guard'),
    'Private data omitted'
  );

  assertNoPrivateListeningSpeechText(JSON.stringify(handoffView));
});

test('listening speech handoff reports locked single-track and choice state', () => {
  const handoffView = buildListeningSpeechHandoffView({
    disabled: true,
    language: undefined,
    promptView: buildListeningPromptView({
      language: undefined,
      prompt: SECRET_PROMPT_TEXT,
      revealAnswer: false,
      speechSupported: false,
    }),
    runnerView: buildListeningSequentialRunnerView({
      items: [
        {
          choices: ['safe option', 'another safe option'],
          id: SECRET_RUNTIME_ITEM_ID,
          kind: 'question',
          prompt: SECRET_PROMPT_TEXT,
        },
      ],
    }),
  });

  assert.equal(
    getHandoffValue(handoffView, 'speech-language-source'),
    'Device default'
  );
  assert.equal(
    getHandoffValue(handoffView, 'normalized-speech-language'),
    'Device default'
  );
  assert.equal(getHandoffValue(handoffView, 'speech-support'), 'Not available');
  assert.equal(
    getHandoffValue(handoffView, 'speech-playback-action'),
    'Unavailable'
  );
  assert.equal(
    getHandoffValue(handoffView, 'transcript-visibility'),
    'Hidden until review'
  );
  assert.equal(
    getHandoffValue(handoffView, 'transcript-review-policy'),
    'Hidden before review'
  );
  assert.equal(getHandoffValue(handoffView, 'track-count'), '1 track');
  assert.equal(
    getHandoffValue(handoffView, 'sequential-navigation'),
    'Single track'
  );
  assert.equal(getHandoffValue(handoffView, 'previous-action'), 'Unavailable');
  assert.equal(getHandoffValue(handoffView, 'next-action'), 'Unavailable');
  assert.equal(getHandoffValue(handoffView, 'answer-input-state'), 'Locked');
  assert.equal(
    getHandoffValue(handoffView, 'choice-answer-mode'),
    'Choice answer'
  );
  assert.equal(getHandoffValue(handoffView, 'review-feedback-state'), 'Hidden');

  assertNoPrivateListeningSpeechText(JSON.stringify(handoffView));
});

test('listening speech handoff localizes Chinese speech boundaries', () => {
  try {
    overwriteGetLocale(() => 'zh');

    const handoffView = buildListeningSpeechHandoffView({
      language: 'zh',
      promptView: buildListeningPromptView({
        language: 'zh',
        prompt: SECRET_PROMPT_TEXT,
        revealAnswer: false,
        speechSupported: true,
      }),
      runnerView: buildListeningSequentialRunnerView(),
      speechSupported: true,
    });

    assert.equal(handoffView.title, '听力语音交接');
    assert.match(handoffView.description, /30 切片/);
    assert.equal(
      getHandoffValue(handoffView, 'speech-language-source'),
      '活动语言'
    );
    assert.equal(
      getHandoffValue(handoffView, 'normalized-speech-language'),
      'zh-CN'
    );
    assert.equal(getHandoffValue(handoffView, 'speech-support'), '可播放');
    assert.equal(
      getHandoffValue(handoffView, 'transcript-visibility'),
      '复盘前隐藏'
    );
    assert.equal(getHandoffValue(handoffView, 'track-count'), '2 个音轨');
    assert.equal(
      getHandoffValue(handoffView, 'progress-summary'),
      '0/2 已作答'
    );
    assert.equal(
      getHandoffValue(handoffView, 'public-payload-boundary'),
      '清理后的运行内容'
    );
    assert.equal(
      getHandoffValue(handoffView, 'privacy-guard'),
      '已省略私有数据'
    );

    assertNoPrivateListeningSpeechText(JSON.stringify(handoffView));
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('listening runner attaches the speech handoff to the component', () => {
  const source = readFileSync(
    'src/components/activities/listening-runner.tsx',
    'utf8'
  );

  assert.match(
    source,
    /buildListeningSpeechHandoffView[\s\S]*disabled,[\s\S]*language,[\s\S]*promptView: activePromptView,[\s\S]*revealAnswer,[\s\S]*runnerView,[\s\S]*speechSupported,/
  );
  assert.match(source, /data-handoff="listening-speech"/);
  assert.match(
    source,
    /view\.itemViews\.map[\s\S]*data-handoff-item=\{item\.id\}[\s\S]*<output aria-label=\{item\.ariaLabel\}>/
  );
});

function buildListeningSequentialRunnerView({
  activeItemId,
  answers = {},
  items = buildListeningItems(),
  revealAnswer = false,
  reviewItems,
}: {
  activeItemId?: string;
  answers?: Record<string, string>;
  items?: PublicRuntimeItem[];
  revealAnswer?: boolean;
  reviewItems?: PublicAttemptReviewItem[];
} = {}) {
  return buildSequentialStudentRunnerView({
    activeItemId,
    answers,
    itemLabel: 'Track',
    items,
    revealAnswer,
    reviewItems,
  });
}

function buildListeningItems(): PublicRuntimeItem[] {
  return [
    {
      id: SECRET_RUNTIME_ITEM_ID,
      kind: 'question',
      prompt: SECRET_PROMPT_TEXT,
    },
    {
      id: SECRET_RUNTIME_ITEM_ID_TWO,
      kind: 'question',
      prompt: `${SECRET_PROMPT_TEXT}_TWO`,
    },
  ];
}

function buildListeningReviewItems(): PublicAttemptReviewItem[] {
  return [
    {
      acceptedAnswers: [SECRET_ACCEPTED_ANSWER],
      correct: true,
      correctAnswer: SECRET_ACCEPTED_ANSWER,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID,
      submitted: true,
      submittedAnswer: SECRET_ACCEPTED_ANSWER,
    },
    {
      acceptedAnswers: [SECRET_ACCEPTED_ANSWER],
      correct: false,
      correctAnswer: SECRET_ACCEPTED_ANSWER,
      explanation: SECRET_EXPLANATION,
      itemId: SECRET_RUNTIME_ITEM_ID_TWO,
      submitted: false,
      submittedAnswer: '',
    },
  ];
}

function getHandoffValue(
  view: ListeningSpeechHandoffView,
  id: ListeningSpeechHandoffItemId
) {
  const item = view.itemViews.find((itemView) => itemView.id === id);
  assert.ok(item, `Missing listening speech handoff item ${id}`);
  return item.value;
}

function assertNoPrivateListeningSpeechText(serializedView: string) {
  for (const privateValue of [
    SECRET_ACCEPTED_ANSWER,
    SECRET_EXPLANATION,
    SECRET_PROMPT_TEXT,
    SECRET_RUNTIME_ITEM_ID,
    SECRET_RUNTIME_ITEM_ID_TWO,
    SECRET_SOURCE_MATERIAL,
    SECRET_STUDENT_NAME,
    SECRET_TOKEN,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Listening speech handoff leaked private text: ${privateValue}`
    );
  }
}
