import EmailButton from '../components/email-button';
import EmailLayout from '../components/email-layout';
import EmailWorkspaceBoundary from '../components/email-workspace-boundary';
import { Text } from '@react-email/components';
import { m } from '@/locale/paraglide/messages';
import { getMailLocaleMessageOptions, type MailLocale } from '@/mail/locale';

interface ForgotPasswordProps {
  url: string;
  name: string;
  locale?: MailLocale;
}

export default function ForgotPassword({
  locale,
  url,
  name,
}: ForgotPasswordProps) {
  const localeOptions = getMailLocaleMessageOptions({ locale });

  return (
    <EmailLayout locale={localeOptions.locale}>
      <Text>
        {m.mail_forgot_password_greeting(undefined, localeOptions)} {name}.
      </Text>
      <Text>{m.mail_forgot_password_body(undefined, localeOptions)}</Text>
      <Text>
        {m.mail_forgot_password_security_note(undefined, localeOptions)}
      </Text>
      <EmailWorkspaceBoundary locale={localeOptions.locale} />
      <EmailButton href={url}>
        {m.mail_forgot_password_button(undefined, localeOptions)}
      </EmailButton>
    </EmailLayout>
  );
}
