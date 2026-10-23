import { getDb } from '@/db';
import { payment } from '@/db/app.schema';
import { user } from '@/db/auth.schema';
import { getLocale } from '@/lib/locale';
import { getAllPricePlans } from '@/lib/price-plan';
import { Routes } from '@/lib/routes';
import { getCanonicalUrl } from '@/lib/urls';
import { m } from '@/locale/paraglide/messages';
import { authApiMiddleware } from '@/middlewares/auth-middleware';
import { resolveCurrentBillingPlan } from '@/payment/current-plan';
import { createCheckout, createCustomerPortal } from '@/payment';
import { websiteConfig } from '@/config/website';
import { createServerFn } from '@tanstack/react-start';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const checkoutSchema = z.object({
  planId: z.string().min(1),
  priceId: z.string().min(1),
  successUrl: z.url().optional(),
  cancelUrl: z.url().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator(checkoutSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [userRow] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!userRow?.email) {
      throw new Error(m.payment_api_error_user_email_not_found());
    }
    const { planId, priceId, successUrl, cancelUrl, metadata } = data;
    const locale = getLocale();
    const isCreem = websiteConfig.payment?.provider === 'creem';
    const billingUrl = getCanonicalUrl(Routes.SettingsBilling);
    const cancel = cancelUrl ?? billingUrl;

    // For Stripe: {CHECKOUT_SESSION_ID} is replaced by Stripe on redirect,
    // then the Payment page polls by sessionId until the webhook writes the DB record.
    // For Creem: Creem does NOT replace URL placeholders and has its own
    // payment confirmation page, so redirect straight to billing.
    const success = isCreem
      ? (successUrl ?? billingUrl)
      : (successUrl ??
        getCanonicalUrl(
          `${Routes.Payment}?session_id={CHECKOUT_SESSION_ID}&callback=${Routes.SettingsBilling}`
        ));
    const checkoutMetadata = {
      ...metadata,
      userId,
      userName: userRow.name ?? '',
    };

    try {
      const result = await createCheckout({
        planId,
        priceId,
        customerEmail: userRow.email,
        successUrl: success,
        cancelUrl: cancel,
        metadata: checkoutMetadata,
        locale,
      });
      return { url: result.url, id: result.id };
    } catch (error) {
      console.error('Payment checkout creation failed:', error);
      throw new Error(m.pricing_checkout_failed());
    }
  });

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
  locale: z.string().optional(),
});

export const createCustomerPortalSession = createServerFn({ method: 'POST' })
  .validator(portalSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const db = getDb();
    const [row] = await db
      .select({ customerId: user.customerId })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    // Fall back to the customer on the latest payment so the portal stays
    // reachable even if the user row never stored a customer id.
    const [latestPayment] = row?.customerId
      ? []
      : await db
          .select({ customerId: payment.customerId })
          .from(payment)
          .where(eq(payment.userId, userId))
          .orderBy(desc(payment.createdAt))
          .limit(1);
    const customerId = row?.customerId ?? latestPayment?.customerId;
    if (!customerId) {
      throw new Error(m.payment_api_error_customer_not_found());
    }
    const locale = getLocale();
    const returnUrl = data.returnUrl ?? getCanonicalUrl(Routes.SettingsBilling);
    try {
      const result = await createCustomerPortal({
        customerId,
        returnUrl,
        locale: data.locale ?? locale,
      });
      return { url: result.url };
    } catch (error) {
      console.error('Payment customer portal creation failed:', error);
      throw new Error(m.pricing_customer_portal_failed());
    }
  });

export const getCurrentPlan = createServerFn({ method: 'GET' })
  .middleware([authApiMiddleware])
  .handler(async ({ context }) => {
    const { userId } = context;
    const db = getDb();
    const [records, [userRow]] = await Promise.all([
      db
        .select({
          cancelAtPeriodEnd: payment.cancelAtPeriodEnd,
          createdAt: payment.createdAt,
          customerId: payment.customerId,
          id: payment.id,
          interval: payment.interval,
          paid: payment.paid,
          periodEnd: payment.periodEnd,
          periodStart: payment.periodStart,
          priceId: payment.priceId,
          scene: payment.scene,
          status: payment.status,
          subscriptionId: payment.subscriptionId,
          trialEnd: payment.trialEnd,
          trialStart: payment.trialStart,
          type: payment.type,
          updatedAt: payment.updatedAt,
        })
        .from(payment)
        .where(and(eq(payment.paid, true), eq(payment.userId, userId)))
        .orderBy(desc(payment.createdAt)),
      db
        .select({ customerId: user.customerId })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1),
    ]);

    return resolveCurrentBillingPlan({
      customerId: userRow?.customerId,
      plans: getAllPricePlans(),
      records,
    });
  });

const checkCompletionSchema = z.object({ sessionId: z.string().min(1) });

/**
 * Check payment completion by Stripe session ID.
 * Used by Stripe flow where the session ID is embedded in the redirect URL.
 */
export const checkPaymentCompletion = createServerFn({ method: 'GET' })
  .validator(checkCompletionSchema)
  .middleware([authApiMiddleware])
  .handler(async ({ data, context }) => {
    const db = getDb();
    const [record] = await db
      .select()
      .from(payment)
      .where(
        and(
          eq(payment.sessionId, data.sessionId),
          eq(payment.userId, context.userId)
        )
      )
      .limit(1);
    return { isPaid: !!record?.paid };
  });
