import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TemplateLiveDemo } from '@/components/page/template-live-demo';
import { getAcceptedAnswers } from '@/activities/answer-matching';
import { evaluateRuntimeAnswers, getRuntimeItems } from '@/activities/runtime';
import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import { ACTIVITY_TEMPLATE_TYPES } from '@/activities/types';
import { locales, overwriteGetLocale } from '@/locale/paraglide/runtime';
import {
  buildTemplateDemo,
  getTemplateDemoInput,
  TEMPLATE_DEMO_MAX_ROWS,
} from '@/pages/template-live-demo';

test('every template starter builds a playable example in every locale', () => {
  try {
    for (const locale of locales) {
      overwriteGetLocale(() => locale);
      for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
        const { text } = getTemplateDemoInput(
          templateType,
          getActivityTemplateScaffold(templateType)
        );
        const demo = buildTemplateDemo({ templateType, text });
        assert.equal(demo.status, 'ready', `${locale} ${templateType}`);
        if (demo.status !== 'ready') continue;

        // Answering with the stored answers must score every item correct.
        const items = getRuntimeItems(templateType, demo.content);
        const evaluation = evaluateRuntimeAnswers({
          answers: items.map((item) => ({
            // "cup / mug" lists accepted alternatives; submit the first.
            answer: getAcceptedAnswers(item.answer)[0] ?? '',
            itemId: item.id,
          })),
          content: demo.content,
          templateType,
        });
        assert.ok(
          evaluation.answers.every((answer) => answer.correct),
          `${locale} ${templateType} answers should score as correct`
        );
      }
    }
  } finally {
    overwriteGetLocale(() => 'en');
  }
});

test('demo rows are capped and incomplete rows are reported', () => {
  const many = Array.from(
    { length: 30 },
    (_, index) => `term${index} | meaning ${index}`
  ).join('\n');
  const demo = buildTemplateDemo({ templateType: 'line-match', text: many });
  assert.equal(demo.status, 'ready');
  if (demo.status === 'ready') {
    assert.equal(demo.content.pairs.length, TEMPLATE_DEMO_MAX_ROWS);
  }
  assert.equal(
    buildTemplateDemo({ templateType: 'line-match', text: 'only a term' })
      .status,
    'invalid'
  );
  assert.equal(
    buildTemplateDemo({ templateType: 'open-box', text: '  \n ' }).status,
    'invalid'
  );
});

test('the playable example server-renders for every template', () => {
  for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
    const html = renderToStaticMarkup(
      createElement(TemplateLiveDemo, { templateType })
    );
    assert.match(html, /<textarea/, templateType);
    assert.match(html, /Check answers/, templateType);
    assert.doesNotMatch(html, /<h2/, `${templateType} demo adds no h2`);
  }
});
