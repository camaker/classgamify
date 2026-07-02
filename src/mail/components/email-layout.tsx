import {
  Container,
  Font,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { m } from '@/locale/paraglide/messages';
import { getMailLocaleMessageOptions, type MailLocale } from '@/mail/locale';

interface EmailLayoutProps {
  children: React.ReactNode;
  locale?: MailLocale;
}

/**
 * Shared ClassGamify transactional email layout.
 */
export default function EmailLayout({ children, locale }: EmailLayoutProps) {
  const localeOptions = getMailLocaleMessageOptions({ locale });
  const year = new Date().getFullYear();

  return (
    <Html lang={localeOptions.locale}>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Section className="bg-background p-4">
          <Container className="rounded-lg bg-card p-6 text-card-foreground">
            {children}
            <Hr className="my-8" />
            <Text className="mt-4">
              {m.site_name(undefined, localeOptions)}{' '}
              {m.mail_layout_team(undefined, localeOptions)}
            </Text>
            <Text>
              ©️ {year} {m.mail_layout_copyright(undefined, localeOptions)}
            </Text>
          </Container>
        </Section>
      </Tailwind>
    </Html>
  );
}
