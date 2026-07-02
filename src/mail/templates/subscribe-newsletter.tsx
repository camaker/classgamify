import EmailLayout from '../components/email-layout';
import EmailWorkspaceBoundary from '../components/email-workspace-boundary';
import { Heading, Text } from '@react-email/components';
import { m } from '@/locale/paraglide/messages';
import { getMailLocaleMessageOptions, type MailLocale } from '@/mail/locale';

type SubscribeNewsletterProps = {
  locale?: MailLocale;
};

export default function SubscribeNewsletter({
  locale,
}: SubscribeNewsletterProps) {
  const localeOptions = getMailLocaleMessageOptions({ locale });

  return (
    <EmailLayout locale={localeOptions.locale}>
      <Heading className="text-xl">
        {m.mail_subscribe_newsletter_title(undefined, localeOptions)}
      </Heading>
      <Text>{m.mail_subscribe_newsletter_body(undefined, localeOptions)}</Text>
      <Text>
        {m.mail_subscribe_newsletter_workspace_note(undefined, localeOptions)}
      </Text>
      <EmailWorkspaceBoundary locale={localeOptions.locale} />
    </EmailLayout>
  );
}
