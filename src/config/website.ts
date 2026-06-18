import { getMessageList } from '@/lib/locale';
import { m } from '@/locale/paraglide/messages';
import { clientEnv } from '@/env/client';
import type { WebsiteConfig } from '../types';
import {
  DEFAULT_ALLOWED_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_USER_FILES_FOLDER,
} from '@/storage/constants';

const CREEM_LIVE_PRODUCTS = {
  proMonthly: 'prod_4UAixAoqrbOrK5p7G6giUQ',
  proYearly: 'prod_462uI05mvUFSP00oOs2ad9',
  lifetime: 'prod_36Ljh9TXt43qnQBkSHYZk1',
} as const;

// Payment provider controlled by env var: 'stripe' | 'creem' | ''.
// Production falls back to Creem live so missing CI/Cloudflare vars do not
// disable the pricing page.
const paymentProvider =
  clientEnv.VITE_PAYMENT_PROVIDER || (import.meta.env.PROD ? 'creem' : '');
const isPaymentEnabled = paymentProvider !== '';
const isCreemPayment = paymentProvider === 'creem';
// Resolve price/product IDs based on the active payment provider
const priceIds = isPaymentEnabled
  ? {
      proMonthly: isCreemPayment
        ? clientEnv.VITE_CREEM_PRODUCT_PRO_MONTHLY ||
          CREEM_LIVE_PRODUCTS.proMonthly
        : (clientEnv.VITE_STRIPE_PRICE_PRO_MONTHLY ?? ''),
      proYearly: isCreemPayment
        ? clientEnv.VITE_CREEM_PRODUCT_PRO_YEARLY ||
          CREEM_LIVE_PRODUCTS.proYearly
        : (clientEnv.VITE_STRIPE_PRICE_PRO_YEARLY ?? ''),
      lifetime: isCreemPayment
        ? clientEnv.VITE_CREEM_PRODUCT_LIFETIME || CREEM_LIVE_PRODUCTS.lifetime
        : (clientEnv.VITE_STRIPE_PRICE_LIFETIME ?? ''),
    }
  : { proMonthly: '', proYearly: '', lifetime: '' };

/**
 * Website config
 */
export const websiteConfig: WebsiteConfig = {
  ui: {
    mode: {
      defaultMode: 'dark',
      enableSwitch: true,
    },
  },
  metadata: {
    get name() {
      return m.site_name();
    },
    get title() {
      return m.site_title();
    },
    get description() {
      return m.site_description();
    },
    images: {
      ogImage: '/og.png',
      logoLight: '/logo.png',
      logoDark: '/logo-dark.png',
    },
  },
  auth: {
    enable: true,
    enableGoogleLogin: true,
    enableCredentialLogin: true,
    enableDeleteAccount: true,
  },
  blog: {
    enable: false,
    paginationSize: 6,
  },
  mail: {
    enable: true,
    provider: 'cloudflare',
    fromEmail: 'Lang Study <support@mail.getlangstudy.com>',
    supportEmail: 'Lang Study <support@mail.getlangstudy.com>',
  },
  newsletter: {
    enable: false,
    provider: 'resend',
    autoSubscribeAfterSignUp: false,
  },
  notification: {
    enable: false,
    provider: 'discord',
  },
  storage: {
    enable: true,
    provider: 'r2',
    maxFileSize: DEFAULT_MAX_FILE_SIZE,
    allowedTypes: DEFAULT_ALLOWED_TYPES,
    userFilesFolder: DEFAULT_USER_FILES_FOLDER,
  },
  payment: {
    enable: isPaymentEnabled,
    provider: isPaymentEnabled ? paymentProvider : undefined,
    price: {
      plans: {
        free: {
          id: 'free',
          prices: [],
          isFree: true,
          isLifetime: false,
          get name() {
            return m.pricing_plans_free_name();
          },
          get description() {
            return m.pricing_plans_free_description();
          },
          get features() {
            return [...getMessageList(m.pricing_plans_free_features())];
          },
          get limits() {
            return [...getMessageList(m.pricing_plans_free_limits())];
          },
        },
        pro: {
          id: 'pro',
          prices: [
            {
              type: 'subscription',
              priceId: priceIds.proMonthly,
              amount: 699,
              currency: 'USD',
              interval: 'month',
            },
            {
              type: 'subscription',
              priceId: priceIds.proYearly,
              amount: 4900,
              currency: 'USD',
              interval: 'year',
            },
          ],
          isFree: false,
          isLifetime: false,
          popular: true,
          get name() {
            return m.pricing_plans_pro_name();
          },
          get description() {
            return m.pricing_plans_pro_description();
          },
          get features() {
            return [...getMessageList(m.pricing_plans_pro_features())];
          },
          get limits() {
            return [...getMessageList(m.pricing_plans_pro_limits())];
          },
        },
        lifetime: {
          id: 'lifetime',
          prices: [
            {
              type: 'one_time',
              priceId: priceIds.lifetime,
              amount: 7900,
              currency: 'USD',
              allowPromotionCode: true,
            },
          ],
          isFree: false,
          isLifetime: true,
          get name() {
            return m.pricing_plans_lifetime_name();
          },
          get description() {
            return m.pricing_plans_lifetime_description();
          },
          get features() {
            return [...getMessageList(m.pricing_plans_lifetime_features())];
          },
          get limits() {
            return [...getMessageList(m.pricing_plans_lifetime_limits())];
          },
        },
      },
    },
  },
};
