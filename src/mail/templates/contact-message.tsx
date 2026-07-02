import EmailLayout from '../components/email-layout';
import EmailWorkspaceBoundary from '../components/email-workspace-boundary';
import { Section, Text } from '@react-email/components';
import { m } from '@/locale/paraglide/messages';
import {
  getMailLocaleMessageOptions,
  type MailLocale,
  type MailLocaleMessageOptions,
} from '@/mail/locale';
import {
  CONTACT_CLASSROOM_INQUIRY_FIELD_IDS,
  hasContactClassroomInquiryPayload,
  type ContactClassroomInquiryFieldId,
  type ContactClassroomInquiryPayload,
  type ContactInquiryIntent,
} from '@/contact/inquiry';

interface ContactMessageProps {
  name: string;
  email: string;
  message: string;
  classroomInquiry?: ContactClassroomInquiryPayload;
  intent?: ContactInquiryIntent;
  locale?: MailLocale;
}

export default function ContactMessage({
  classroomInquiry,
  locale,
  name,
  email,
  intent = 'general',
  message,
}: ContactMessageProps) {
  const localeOptions = getMailLocaleMessageOptions({ locale });
  const classroomFields = hasContactClassroomInquiryPayload(classroomInquiry)
    ? classroomInquiry.fields
    : [];
  const inquiryType =
    intent === 'classroom'
      ? m.mail_contact_message_type_classroom(undefined, localeOptions)
      : m.mail_contact_message_type_general(undefined, localeOptions);

  return (
    <EmailLayout locale={localeOptions.locale}>
      <Text>{m.mail_contact_message_intro(undefined, localeOptions)}</Text>
      <Text>
        {m.mail_contact_message_type(undefined, localeOptions)} {inquiryType}
      </Text>
      <Text>
        {m.mail_contact_message_name(undefined, localeOptions)} {name}
      </Text>
      <Text>
        {m.mail_contact_message_email(undefined, localeOptions)} {email}
      </Text>
      {classroomFields.length > 0 ? (
        <Section>
          <Text>
            {m.mail_contact_message_classroom_heading(undefined, localeOptions)}
          </Text>
          {CONTACT_CLASSROOM_INQUIRY_FIELD_IDS.map((fieldId) => {
            const field = classroomFields.find((item) => item.id === fieldId);
            if (!field) return null;

            return (
              <Text key={fieldId}>
                {getClassroomInquiryFieldLabel(fieldId, localeOptions)}{' '}
                {field.value}
              </Text>
            );
          })}
        </Section>
      ) : null}
      <Text>
        {m.mail_contact_message_message(undefined, localeOptions)} {message}
      </Text>
      <EmailWorkspaceBoundary locale={localeOptions.locale} />
    </EmailLayout>
  );
}

function getClassroomInquiryFieldLabel(
  id: ContactClassroomInquiryFieldId,
  localeOptions: MailLocaleMessageOptions
) {
  const labels = {
    grade: m.mail_contact_message_classroom_grade(undefined, localeOptions),
    learners: m.mail_contact_message_classroom_learners(
      undefined,
      localeOptions
    ),
    material: m.mail_contact_message_classroom_material(
      undefined,
      localeOptions
    ),
    need: m.mail_contact_message_classroom_need(undefined, localeOptions),
    routine: m.mail_contact_message_classroom_routine(undefined, localeOptions),
  } satisfies Record<ContactClassroomInquiryFieldId, string>;

  return labels[id];
}
