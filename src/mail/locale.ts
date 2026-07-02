import { baseLocale, isLocale, type Locale } from '@/locale/paraglide/runtime';

export type MailLocale = Locale;

export type MailLocaleInput = {
  locale?: unknown;
};

export type MailLocaleMessageOptions = {
  locale: MailLocale;
};

export function normalizeMailLocale(value: unknown): MailLocale {
  return isLocale(value) ? value : baseLocale;
}

export function getMailLocaleMessageOptions(
  input?: MailLocaleInput
): MailLocaleMessageOptions {
  return {
    locale: normalizeMailLocale(input?.locale),
  };
}
