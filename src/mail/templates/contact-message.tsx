import EmailLayout from '../components/email-layout';
import { Section, Text } from '@react-email/components';
import { m } from '@/locale/paraglide/messages';
import {
  CONTACT_CLASSROOM_INQUIRY_FIELD_IDS,
  hasContactClassroomInquiryPayload,
  type ContactClassroomInquiryFieldId,
  type ContactClassroomInquiryPayload,
  type ContactInquiryIntent,
} from '@/contact/inquiry';

const en = { locale: 'en' as const };

interface ContactMessageProps {
  name: string;
  email: string;
  message: string;
  classroomInquiry?: ContactClassroomInquiryPayload;
  intent?: ContactInquiryIntent;
}

export default function ContactMessage({
  classroomInquiry,
  name,
  email,
  intent = 'general',
  message,
}: ContactMessageProps) {
  const classroomFields = hasContactClassroomInquiryPayload(classroomInquiry)
    ? classroomInquiry.fields
    : [];
  const inquiryType =
    intent === 'classroom'
      ? m.mail_contact_message_type_classroom(undefined, en)
      : m.mail_contact_message_type_general(undefined, en);

  return (
    <EmailLayout>
      <Text>{m.mail_contact_message_intro(undefined, en)}</Text>
      <Text>
        {m.mail_contact_message_type(undefined, en)} {inquiryType}
      </Text>
      <Text>
        {m.mail_contact_message_name(undefined, en)} {name}
      </Text>
      <Text>
        {m.mail_contact_message_email(undefined, en)} {email}
      </Text>
      {classroomFields.length > 0 ? (
        <Section>
          <Text>{m.mail_contact_message_classroom_heading(undefined, en)}</Text>
          {CONTACT_CLASSROOM_INQUIRY_FIELD_IDS.map((fieldId) => {
            const field = classroomFields.find((item) => item.id === fieldId);
            if (!field) return null;

            return (
              <Text key={fieldId}>
                {getClassroomInquiryFieldLabel(fieldId)} {field.value}
              </Text>
            );
          })}
        </Section>
      ) : null}
      <Text>
        {m.mail_contact_message_message(undefined, en)} {message}
      </Text>
    </EmailLayout>
  );
}

function getClassroomInquiryFieldLabel(id: ContactClassroomInquiryFieldId) {
  const labels = {
    grade: m.mail_contact_message_classroom_grade(undefined, en),
    learners: m.mail_contact_message_classroom_learners(undefined, en),
    material: m.mail_contact_message_classroom_material(undefined, en),
    need: m.mail_contact_message_classroom_need(undefined, en),
    routine: m.mail_contact_message_classroom_routine(undefined, en),
  } satisfies Record<ContactClassroomInquiryFieldId, string>;

  return labels[id];
}
