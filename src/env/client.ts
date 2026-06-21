import { createEnv } from '@t3-oss/env-core';
import * as z from 'zod';

/**
 * Client-side env (build-time from Vite, import.meta.env)
 */
export const clientEnv = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_BASE_URL: z.url().default('http://localhost:3000'),

    // Payment provider: 'stripe' | 'creem' | '' (empty = disabled)
    VITE_PAYMENT_PROVIDER: z.enum(['stripe', 'creem', '']).default(''),

    // Payment (Stripe)
    VITE_STRIPE_PRICE_PRO_MONTHLY: z.string().optional(),
    VITE_STRIPE_PRICE_PRO_YEARLY: z.string().optional(),
    VITE_STRIPE_PRICE_LIFETIME: z.string().optional(),

    // Payment (Creem)
    VITE_CREEM_PRODUCT_PRO_MONTHLY: z.string().optional(),
    VITE_CREEM_PRODUCT_PRO_YEARLY: z.string().optional(),
    VITE_CREEM_PRODUCT_LIFETIME: z.string().optional(),

    // Analytics
    VITE_GOOGLE_ANALYTICS_ID: z.string().default('G-QH46LZCPE3'),
    VITE_CLARITY_PROJECT_ID: z.string().default('xa8pgti8e4'),
    VITE_PLAUSIBLE_SCRIPT: z.string().optional(),
    VITE_UMAMI_WEBSITE_ID: z
      .string()
      .default('367bc1f5-9e17-46c5-af53-661b08883331'),
    VITE_UMAMI_SCRIPT: z.string().default('https://cloud.umami.is/script.js'),

    // Chatbot (Crisp Chat)
    VITE_CRISP_WEBSITE_ID: z.string().optional(),
  },
  runtimeEnv: import.meta.env,
});
