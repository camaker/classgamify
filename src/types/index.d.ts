/**
 * Config types (no i18n). Used by website and other config modules.
 * Icon is React component (e.g. from @tabler/icons-react) for menu items.
 */
import type { ComponentType } from 'react';

export interface UiConfig {
  mode?: {
    defaultMode?: 'light' | 'dark' | 'system';
    enableSwitch?: boolean;
  };
}

export interface ImagesConfig {
  ogImage?: string;
  logoLight?: string;
  logoDark?: string;
}

export interface SocialConfig {
  github?: string;
  twitter?: string;
  blueSky?: string;
  discord?: string;
  mastodon?: string;
  linkedin?: string;
  youtube?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  telegram?: string;
}

export interface MetadataConfig {
  images?: ImagesConfig;
  social?: SocialConfig;
}

export interface FeaturesConfig {
  enableUpgradeCard?: boolean;
  enableUpdateAvatar?: boolean;
  enableCrispChat?: boolean;
  enableTurnstileCaptcha?: boolean;
}

export interface RoutesConfig {
  defaultLoginRedirect?: string;
}

export interface AnalyticsConfig {
  enableVercelAnalytics?: boolean;
  enableSpeedInsights?: boolean;
}

export interface AuthConfig {
  enableGoogleLogin?: boolean;
  enableCredentialLogin?: boolean;
}

export interface I18nConfig {
  defaultLocale: string;
  locales: Record<string, { flag?: string; name: string; hreflang?: string }>;
}

export interface BlogConfig {
  enable: boolean;
  paginationSize?: number;
  relatedPostsSize?: number;
}

export interface DocsConfig {
  enable: boolean;
}

export interface MailConfig {
  provider: 'resend';
  fromEmail?: string;
  supportEmail?: string;
}

export interface NewsletterConfig {
  enable: boolean;
  provider?: 'resend' | 'beehiiv';
  autoSubscribeAfterSignUp?: boolean;
}

export interface StorageConfig {
  enable: boolean;
  provider?: 's3';
}

export interface PaymentConfig {
  provider?: 'stripe';
}

/** Price item for a plan (subscription or one-time) */
export interface PriceItemConfig {
  type: 'subscription' | 'one_time';
  priceId: string;
  amount: number;
  currency: string;
  interval?: 'month' | 'year';
  allowPromotionCode?: boolean;
}

/** Credits config for a plan */
export interface PlanCreditsConfig {
  enable: boolean;
  amount: number;
  expireDays?: number;
}

/** Plan config in websiteConfig.price.plans */
export interface PlanConfig {
  id: string;
  prices: PriceItemConfig[];
  isFree: boolean;
  isLifetime: boolean;
  popular?: boolean;
  credits?: PlanCreditsConfig;
}

export interface PriceConfig {
  plans: Record<string, PlanConfig>;
}

/** Credit package price */
export interface CreditPackagePriceConfig {
  priceId: string;
  amount: number;
  currency: string;
  allowPromotionCode?: boolean;
}

/** Credit package config */
export interface CreditPackageConfig {
  id: string;
  amount: number;
  expireDays?: number;
  popular: boolean;
  price: CreditPackagePriceConfig;
}

export interface CreditsConfig {
  enableCredits: boolean;
  enablePackagesForFreePlan?: boolean;
  registerGiftCredits: {
    enable: boolean;
    amount: number;
    expireDays?: number;
  };
  packages: Record<string, CreditPackageConfig>;
}

export interface WebsiteConfig {
  ui?: UiConfig;
  metadata?: MetadataConfig;
  features?: FeaturesConfig;
  routes: RoutesConfig;
  analytics?: AnalyticsConfig;
  auth: AuthConfig;
  i18n?: I18nConfig;
  blog?: BlogConfig;
  docs?: DocsConfig;
  mail: MailConfig;
  newsletter?: NewsletterConfig;
  storage?: StorageConfig;
  payment?: PaymentConfig;
  price?: PriceConfig;
  credits?: CreditsConfig;
}

/** Menu item for navbar/sidebar/footer. */
export interface MenuItemConfig {
  title: string;
  description?: string;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  external?: boolean;
  authorizeOnly?: string[];
  items?: MenuItemConfig[];
}
