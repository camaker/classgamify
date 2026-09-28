import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildContactClassroomInquiryPayload } from '@/contact/inquiry';
import { MAIL_TRANSACTIONAL_TEMPLATE_IDS } from '@/mail/workspace-boundary';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import { getEmailSubject, getTemplate } from '@/mail/render';
import type { EmailTemplate, SendTemplateParams } from '@/mail/types';

overwriteGetLocale(() => 'en');

type MailTemplateSourceContract = {
  filePath: string;
  messageKeys: string[];
  template: EmailTemplate;
};

type MailRenderCase = {
  actionLabel?: string;
  context: SendTemplateParams['context'];
  locale: 'en' | 'zh';
  requiredText: RegExp[];
  template: EmailTemplate;
};

const TEMPLATE_SOURCE_CONTRACTS = [
  {
    filePath: 'src/mail/templates/verify-email.tsx',
    messageKeys: [
      'mail_verify_email_greeting',
      'mail_verify_email_body',
      'mail_verify_email_workspace_note',
      'mail_verify_email_button',
    ],
    template: 'verifyEmail',
  },
  {
    filePath: 'src/mail/templates/forgot-password.tsx',
    messageKeys: [
      'mail_forgot_password_greeting',
      'mail_forgot_password_body',
      'mail_forgot_password_security_note',
      'mail_forgot_password_button',
    ],
    template: 'forgotPassword',
  },
  {
    filePath: 'src/mail/templates/subscribe-newsletter.tsx',
    messageKeys: [
      'mail_subscribe_newsletter_title',
      'mail_subscribe_newsletter_body',
      'mail_subscribe_newsletter_workspace_note',
    ],
    template: 'subscribeNewsletter',
  },
  {
    filePath: 'src/mail/templates/contact-message.tsx',
    messageKeys: [
      'mail_contact_message_intro',
      'mail_contact_message_type',
      'mail_contact_message_type_classroom',
      'mail_contact_message_type_general',
      'mail_contact_message_classroom_heading',
      'mail_contact_message_message',
    ],
    template: 'contactMessage',
  },
] as const satisfies MailTemplateSourceContract[];

const LEGACY_MAIL_COPY_MARKERS = [
  'Lang Study',
  'getlangstudy',
  'HSK',
  'Hanzi',
  'Website Contact',
  'Contact Message from Website',
  'MyApp',
  'TanStarter',
  'mksaas',
] as const;

const MAIL_RENDER_CASES = [
  {
    actionLabel: 'Verify workspace email',
    context: {
      locale: 'en',
      name: 'Teacher',
      url: 'https://classgamify.example/verify?token=verify-token',
    },
    locale: 'en',
    requiredText: [
      /Use the link below to verify the email for your ClassGamify teacher workspace/,
      /saved activities, assignment links, source materials/,
      /Workspace boundary/,
      /Activities and templates/,
      /Assignment links/,
      /Student attempts and results/,
      /AI drafts and source materials/,
    ],
    template: 'verifyEmail',
  },
  {
    actionLabel: 'Reset workspace password',
    context: {
      locale: 'en',
      name: 'Teacher',
      url: 'https://classgamify.example/reset?token=reset-token',
    },
    locale: 'en',
    requiredText: [
      /reset access to your ClassGamify teacher workspace/,
      /saved activities, source materials, assignment links/,
      /student attempts, and result records/,
      /Workspace boundary/,
      /Activities and templates/,
      /Assignment links/,
      /Student attempts and results/,
      /AI drafts and source materials/,
    ],
    template: 'forgotPassword',
  },
  {
    context: {
      locale: 'en',
    },
    locale: 'en',
    requiredText: [
      /ClassGamify classroom updates enabled/,
      /game templates, worksheet workflows, assignment links/,
      /teacher-reviewed AI drafts/,
      /source-material workflows/,
      /activity to assignment to attempt to results loop/,
      /Workspace boundary/,
      /Student attempts and results/,
      /AI drafts and source materials/,
    ],
    template: 'subscribeNewsletter',
  },
  {
    context: {
      classroomInquiry: buildContactClassroomInquiryPayload({
        grade: 'Grade 5',
        learners: '26 learners',
        material: 'worksheet images and vocabulary cards',
        need: 'assignment links and result review',
        routine: 'Friday review station',
      }),
      email: 'teacher@example.test',
      intent: 'classroom',
      locale: 'en',
      message: 'We need worksheet assignment links and result review.',
      name: 'Teacher Team',
    },
    locale: 'en',
    requiredText: [
      /A teacher, tutor, parent, or school team contacted ClassGamify/,
      /Inquiry type: Classroom workflow/,
      /Classroom workflow details/,
      /Learners: 26 learners/,
      /Class or grade: Grade 5/,
      /Activity material: worksheet images and vocabulary cards/,
      /Weekly routine: Friday review station/,
      /Template, worksheet, or result need: assignment links and result review/,
      /Message: We need worksheet assignment links and result review/,
      /Workspace boundary/,
      /Activities and templates/,
      /Assignment links/,
      /Student attempts and results/,
    ],
    template: 'contactMessage',
  },
  {
    actionLabel: '验证工作区邮箱',
    context: {
      locale: 'zh',
      name: '老师',
      url: 'https://classgamify.example/verify?token=zh-verify-token',
    },
    locale: 'zh',
    requiredText: [
      /验证你的 ClassGamify 教师工作区邮箱/,
      /已保存活动、作业链接、来源素材/,
      /工作区边界/,
      /活动与模板/,
      /作业链接/,
      /学生作答与结果/,
      /AI 草稿与来源素材/,
    ],
    template: 'verifyEmail',
  },
] as const satisfies MailRenderCase[];

test('transactional mail templates render workspace boundary output', async () => {
  for (const renderCase of MAIL_RENDER_CASES) {
    const renderedTemplate = await getTemplate({
      context: renderCase.context,
      template: renderCase.template,
    });

    assert.equal(
      renderedTemplate.subject,
      getEmailSubject({
        locale: renderCase.locale,
        template: renderCase.template,
      })
    );
    assert.match(
      renderedTemplate.html,
      new RegExp(`<html[^>]+lang="${renderCase.locale}"`)
    );
    assert.ok(renderedTemplate.html.length > renderedTemplate.text.length);
    assert.ok(renderedTemplate.text.length > 100);

    for (const pattern of renderCase.requiredText) {
      assert.match(
        renderedTemplate.text,
        pattern,
        `${renderCase.template} should render ${pattern}`
      );
    }

    if (renderCase.actionLabel) {
      const boundaryTitle =
        renderCase.locale === 'zh' ? '工作区边界' : 'Workspace boundary';
      const boundaryIndex = renderedTemplate.text.indexOf(boundaryTitle);
      const actionIndex = renderedTemplate.text.indexOf(renderCase.actionLabel);

      assert.ok(boundaryIndex >= 0);
      assert.ok(actionIndex >= 0);
      assert.equal(
        boundaryIndex < actionIndex,
        true,
        `${renderCase.template} should place action copy after the boundary`
      );
    }

    assertNoLegacyMailCopy(renderedTemplate.subject);
    assertNoLegacyMailCopy(renderedTemplate.text);
  }
});

test('transactional mail templates use localized shared source contracts', () => {
  const templateSources = TEMPLATE_SOURCE_CONTRACTS.map((contract) => ({
    ...contract,
    source: readFileSync(contract.filePath, 'utf8'),
  }));
  const combinedTemplateSource = templateSources
    .map((templateSource) => templateSource.source)
    .join('\n');

  assert.deepEqual(
    templateSources.map((templateSource) => templateSource.template),
    [...MAIL_TRANSACTIONAL_TEMPLATE_IDS]
  );

  for (const { filePath, messageKeys, source } of templateSources) {
    assert.match(
      source,
      /import EmailLayout from '\.\.\/components\/email-layout';/,
      `${filePath} should use the shared mail layout`
    );
    assert.match(
      source,
      /import EmailWorkspaceBoundary from '\.\.\/components\/email-workspace-boundary';/,
      `${filePath} should import the shared workspace boundary`
    );
    assert.match(
      source,
      /getMailLocaleMessageOptions\(\{ locale \}\)/,
      `${filePath} should normalize locale options locally`
    );
    assert.match(
      source,
      /<EmailLayout locale=\{localeOptions\.locale\}>/,
      `${filePath} should pass the normalized locale into EmailLayout`
    );
    assert.match(
      source,
      /<EmailWorkspaceBoundary locale=\{localeOptions\.locale\} \/>/,
      `${filePath} should render the shared boundary with the same locale`
    );

    for (const key of messageKeys) {
      assert.match(
        source,
        new RegExp(`m\\.${key}\\(`),
        `${filePath} should render localized ${key}`
      );
    }
  }

  assertNoLegacyMailCopy(combinedTemplateSource);
});

function assertNoLegacyMailCopy(value: string) {
  for (const marker of LEGACY_MAIL_COPY_MARKERS) {
    assert.equal(
      value.includes(marker),
      false,
      `Transactional mail copied legacy text: ${marker}`
    );
  }
}
