import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const NOTIFICATION_ROUTE_SOURCE = readFileSync(
  'src/routes/settings/notifications.tsx',
  'utf8'
);
const NEWSLETTER_CARD_SOURCE = readFileSync(
  'src/components/settings/notification/newsletter-form-card.tsx',
  'utf8'
);
const NEWSLETTER_HOOK_SOURCE = readFileSync(
  'src/hooks/use-newsletter.ts',
  'utf8'
);
const NEWSLETTER_API_SOURCE = readFileSync('src/api/newsletter.ts', 'utf8');

const LEGACY_NOTIFICATION_COPY_MARKERS = [
  'Lang Study',
  'getlangstudy',
  'HSK',
  'Hanzi',
  'saved character',
  'Chinese level',
  'generic SaaS announcements',
] as const;

test('notification settings page wires update boundary before newsletter control', () => {
  assert.match(
    NOTIFICATION_ROUTE_SOURCE,
    /beforeLoad: \(\) => \{[\s\S]*isSettingsNotificationsEnabled\(\)[\s\S]*throw notFound\(\{ routeId: rootRouteId \}\);[\s\S]*\}/,
    'Notification settings route should remain feature-gated by the shared helper.'
  );
  assert.match(
    NOTIFICATION_ROUTE_SOURCE,
    /const pageView = buildSettingsNotificationPageViewModel\(\);[\s\S]*breadcrumbs=\{pageView\.breadcrumbs\}[\s\S]*title=\{pageView\.title\}[\s\S]*description=\{pageView\.description\}/,
    'Notification settings route should consume the prepared page view model.'
  );
  assert.match(
    NOTIFICATION_ROUTE_SOURCE,
    /<NewsletterFormCard view=\{pageView\.newsletterCardView\} \/>/,
    'Notification settings should render the newsletter control card.'
  );
  assertNoLegacyNotificationCopy(NOTIFICATION_ROUTE_SOURCE);
});

test('newsletter settings control mutates only teacher product email state', () => {
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /useNewsletterStatus\([\s\S]*notificationsEnabled \? currentUser\?\.email : undefined[\s\S]*\)/,
    'Newsletter card should query status only for the signed-in teacher email.'
  );
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /await subscribeMutation\.mutateAsync\(currentUser\.email\);[\s\S]*await unsubscribeMutation\.mutateAsync\(currentUser\.email\);/,
    'Newsletter card should mutate only the current teacher email subscription.'
  );
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /toast\.error\(view\.emailRequiredMessage\)[\s\S]*toast\.success\(view\.subscribeSuccessMessage\)[\s\S]*toast\.success\(view\.unsubscribeSuccessMessage\)[\s\S]*toast\.error\(view\.errorMessage\)/,
    'Newsletter card should use prepared localized feedback for every state.'
  );
  assert.match(
    NEWSLETTER_CARD_SOURCE,
    /catch \{[\s\S]*console\.error\('newsletter subscription update failed'\);[\s\S]*toast\.error\(view\.errorMessage\)/,
    'Newsletter card should log only a stable failure event and show localized copy.'
  );
  assert.doesNotMatch(
    NEWSLETTER_CARD_SOURCE,
    /console\.error\([^)]*,|err\.message|error\.message|statusError\?\.message|subscribeMutation\.error\?\.message|unsubscribeMutation\.error\?\.message/,
    'Newsletter card should not expose raw mutation errors or provider payloads.'
  );
  assert.match(
    NEWSLETTER_HOOK_SOURCE,
    /queryKey: newsletterKeys\.status\(email \?\? ''\)[\s\S]*queryFn: \(\) => getNewsletterStatus\(\{ data: \{ email: email! \} \}\)[\s\S]*enabled: !!email/,
    'Newsletter status hook should be email-scoped and disabled without email.'
  );
  assert.match(
    NEWSLETTER_HOOK_SOURCE,
    /mutationFn: \(email: string\) => subscribeNewsletter\(\{ data: \{ email \} \}\)[\s\S]*invalidateQueries\(\{ queryKey: newsletterKeys\.status\(email\) \}\)[\s\S]*mutationFn: \(email: string\) => unsubscribeNewsletter\(\{ data: \{ email \} \}\)[\s\S]*invalidateQueries\(\{ queryKey: newsletterKeys\.status\(email\) \}\)/,
    'Newsletter mutations should send and invalidate only the teacher email status.'
  );
  assertNoNewsletterDataMutationSurface(NEWSLETTER_HOOK_SOURCE);
  assertNoLegacyNotificationCopy(NEWSLETTER_CARD_SOURCE);
});

test('newsletter server functions sanitize provider failures and mail context', () => {
  assert.match(
    NEWSLETTER_API_SOURCE,
    /const emailSchema = z\.email\(m\.newsletter_email_invalid\(\)\);[\s\S]*\.validator\(z\.object\(\{ email: emailSchema \}\)\)/,
    'Newsletter API should validate only the teacher email input.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /template: 'subscribeNewsletter'[\s\S]*context: \{ email: data\.email, locale: getLocale\(\) \}/,
    'Newsletter API should send the localized classroom update welcome email.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /catch \{[\s\S]*console\.error\('Newsletter status check failed'\);[\s\S]*throw new Error\(m\.newsletter_error_generic\(\)\);/,
    'Newsletter status failures should log a stable event and return generic localized copy.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /catch \{[\s\S]*console\.error\('Newsletter welcome email failed'\);[\s\S]*catch \{[\s\S]*console\.error\('Newsletter subscribe failed'\);[\s\S]*throw new Error\(m\.newsletter_error\(\)\);/,
    'Newsletter subscribe failures should not serialize provider errors.'
  );
  assert.match(
    NEWSLETTER_API_SOURCE,
    /catch \{[\s\S]*console\.error\('Newsletter unsubscribe failed'\);[\s\S]*throw new Error\(m\.newsletter_error_unsubscribe\(\)\);/,
    'Newsletter unsubscribe failures should not serialize provider errors.'
  );
  assert.doesNotMatch(
    NEWSLETTER_API_SOURCE,
    /console\.error\([^)]*,|throw new Error\(\s*(?:error|err|e)\.message|error instanceof Error|err instanceof Error/,
    'Newsletter API should not expose raw provider errors to logs or clients.'
  );
  assertNoNewsletterDataMutationSurface(NEWSLETTER_API_SOURCE);
});

function assertNoLegacyNotificationCopy(value: string) {
  for (const marker of LEGACY_NOTIFICATION_COPY_MARKERS) {
    assert.equal(
      value.includes(marker),
      false,
      `Notification settings copied legacy text: ${marker}`
    );
  }
}

function assertNoNewsletterDataMutationSurface(source: string) {
  assert.doesNotMatch(
    source,
    /@\/(?:activities|assignments|storage|db)|activityId|assignmentId|attemptId|studentId|shareSlug|sourceMaterial|storageKey|publicLink|learner/i,
    'Newsletter settings should not import or mutate classroom activity, assignment, attempt, student, public-link, or source-material data.'
  );
}
