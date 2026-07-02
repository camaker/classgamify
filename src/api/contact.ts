import { m } from '@/locale/paraglide/messages';
import { createServerFn } from '@tanstack/react-start';
import { websiteConfig } from '@/config/website';
import { sendEmail } from '@/mail';
import { getLocale } from '@/lib/locale';
import {
  buildContactClassroomInquiryPayload,
  CONTACT_CLASSROOM_INQUIRY_FIELD_IDS,
  CONTACT_CLASSROOM_INQUIRY_MAX_FIELD_LENGTH,
  CONTACT_MESSAGE_LIMITS,
  normalizeContactInquiryIntent,
} from '@/contact/inquiry';
import { z } from 'zod';
const classroomInquirySchema = z.object({
  fields: z
    .array(
      z.object({
        id: z.enum(CONTACT_CLASSROOM_INQUIRY_FIELD_IDS),
        value: z.string().max(CONTACT_CLASSROOM_INQUIRY_MAX_FIELD_LENGTH),
      })
    )
    .optional(),
  intent: z.literal('classroom').optional(),
});

const schema = z.object({
  name: z
    .string()
    .min(CONTACT_MESSAGE_LIMITS.name.min, m.contact_name_min())
    .max(CONTACT_MESSAGE_LIMITS.name.max, m.contact_name_max()),
  email: z.email(m.contact_email_invalid()),
  intent: z.enum(['classroom', 'general']).optional(),
  message: z
    .string()
    .min(CONTACT_MESSAGE_LIMITS.message.min, m.contact_message_min())
    .max(CONTACT_MESSAGE_LIMITS.message.max, m.contact_message_max()),
  classroomInquiry: classroomInquirySchema.optional(),
});
export const sendContactMessage = createServerFn({ method: 'POST' })
  .validator(schema)
  .handler(async ({ data }) => {
    const supportEmail = websiteConfig.mail?.supportEmail;
    if (!supportEmail) {
      throw new Error(m.contact_error_not_configured());
    }
    const intent = normalizeContactInquiryIntent(data.intent);
    const classroomInquiry =
      intent === 'classroom'
        ? buildContactClassroomInquiryPayload(
            Object.fromEntries(
              (data.classroomInquiry?.fields ?? []).map((field) => [
                field.id,
                field.value,
              ])
            )
          )
        : undefined;
    const result = await sendEmail({
      to: supportEmail,
      template: 'contactMessage',
      context: {
        name: data.name.trim(),
        email: data.email.trim(),
        message: data.message.trim(),
        intent,
        classroomInquiry,
        locale: getLocale(),
      },
    });
    if (!result.success) {
      throw new Error(m.contact_error());
    }
  });
