import { getTemplate } from '@/mail/render';
import type { SendRawEmailParams, SendTemplateParams } from '@/mail/types';

export type E2EMailOutboxRecord = {
  context?: Record<string, unknown>;
  createdAt: string;
  html: string;
  id: string;
  subject: string;
  template?: string;
  text: string;
  to: string;
};

const outbox: E2EMailOutboxRecord[] = [];

export async function captureE2EEmail(
  params: SendTemplateParams | SendRawEmailParams
) {
  const rendered =
    'template' in params
      ? await getTemplate({
          context: params.context,
          template: params.template,
        })
      : {
          html: params.html,
          subject: params.subject,
          text: params.text ?? '',
        };
  const record: E2EMailOutboxRecord = {
    context: 'template' in params ? structuredClone(params.context) : undefined,
    createdAt: new Date().toISOString(),
    html: rendered.html,
    id: crypto.randomUUID(),
    subject: rendered.subject,
    template: 'template' in params ? params.template : undefined,
    text: rendered.text,
    to: params.to,
  };
  outbox.push(record);
  return record;
}

export function listE2EOutbox() {
  return outbox.map((record) => structuredClone(record));
}

export function clearE2EOutbox() {
  outbox.length = 0;
}
