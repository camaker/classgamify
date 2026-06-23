import { createServerFn } from '@tanstack/react-start';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';
import { sendEmail } from '@/mail';
import { isSubscribed, subscribe, unsubscribe } from '@/newsletter';
import { z } from 'zod';

const emailSchema = z.email(m.newsletter_email_invalid());

function ensureNewsletterEnabled(): void {
  if (!websiteConfig.newsletter?.enable) {
    throw new Error(m.newsletter_error_disabled());
  }
}

export const getNewsletterStatus = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ email: emailSchema }))
  .handler(async ({ data }) => {
    ensureNewsletterEnabled();
    try {
      const subscribed = await isSubscribed(data.email);
      return { subscribed };
    } catch (error) {
      console.error('Check newsletter status error:', error);
      throw new Error(m.newsletter_error_generic());
    }
  });

export const subscribeNewsletter = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ email: emailSchema }))
  .handler(async ({ data }) => {
    ensureNewsletterEnabled();
    try {
      const ok = await subscribe(data.email);
      if (!ok) {
        throw new Error(m.newsletter_error());
      }
      if (websiteConfig.mail?.fromEmail) {
        // Wait for 3 seconds to ensure the newsletter is subscribed
        await new Promise((r) => setTimeout(r, 3000));
        try {
          await sendEmail({
            to: data.email,
            template: 'subscribeNewsletter',
            context: { email: data.email },
          });
        } catch (e) {
          console.error('Newsletter welcome email error:', e);
        }
      }
    } catch (error) {
      console.error('Subscribe newsletter error:', error);
      throw new Error(m.newsletter_error());
    }
  });

export const unsubscribeNewsletter = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ email: emailSchema }))
  .handler(async ({ data }) => {
    ensureNewsletterEnabled();
    try {
      const ok = await unsubscribe(data.email);
      if (!ok) {
        throw new Error(m.newsletter_error_unsubscribe());
      }
    } catch (error) {
      console.error('Unsubscribe newsletter error:', error);
      throw new Error(m.newsletter_error_unsubscribe());
    }
  });
