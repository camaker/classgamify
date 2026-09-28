import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getFooterLinks } from '@/config/footer-config';
import { getNavbarLinks } from '@/config/navbar-config';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');

const FOOTER_SOURCE = readFileSync('src/components/layout/footer.tsx', 'utf8');
const NAVBAR_SOURCE = readFileSync('src/components/layout/navbar.tsx', 'utf8');
const NAVBAR_MOBILE_SOURCE = readFileSync(
  'src/components/layout/navbar-mobile.tsx',
  'utf8'
);
const NAVBAR_CONFIG_SOURCE = readFileSync(
  'src/config/navbar-config.ts',
  'utf8'
);
const FOOTER_CONFIG_SOURCE = readFileSync(
  'src/config/footer-config.ts',
  'utf8'
);

test('public navigation handoff comes from shared navbar and footer configs', () => {
  assert.deepEqual(
    getNavbarLinks().map((item) => [item.id, item.href]),
    [
      ['templates', Routes.Templates],
      ['worksheets', Routes.Worksheets],
      ['create', Routes.Create],
      ['student-preview', Routes.StudentPreview],
      ['pricing', Routes.Pricing],
      ['blog', Routes.Blog],
    ]
  );
  assert.deepEqual(
    getFooterLinks().map((section) => [
      section.id,
      section.items?.map((item) => item.id),
    ]),
    [
      [
        'product',
        ['templates', 'worksheets', 'create', 'student-preview', 'pricing'],
      ],
      ['platform', ['activities', 'assignments']],
      ['support', ['roadmap', 'articles', 'support', 'about', 'teachers']],
      ['legal', ['privacy', 'cookies', 'terms']],
    ]
  );
  assert.match(NAVBAR_SOURCE, /const menuLinks = getNavbarLinks\(\)/);
  assert.match(NAVBAR_MOBILE_SOURCE, /const menuLinks = getNavbarLinks\(\)/);
  assert.doesNotMatch(
    FOOTER_SOURCE,
    /buildPublicNavigationHandoffView|PublicNavigationHandoffPanel|data-handoff|data-handoff-item/,
    'Footer must not render internal navigation handoff markup on public pages.'
  );
  assert.match(
    NAVBAR_CONFIG_SOURCE,
    /Routes\.Templates[\s\S]*Routes\.Worksheets[\s\S]*Routes\.Create[\s\S]*Routes\.StudentPreview[\s\S]*Routes\.Pricing[\s\S]*Routes\.Blog/
  );
  assert.match(
    FOOTER_CONFIG_SOURCE,
    /Routes\.Templates[\s\S]*Routes\.Worksheets[\s\S]*Routes\.Create[\s\S]*Routes\.StudentPreview[\s\S]*Routes\.Pricing[\s\S]*Routes\.DashboardActivities[\s\S]*Routes\.DashboardAssignments[\s\S]*Routes\.Roadmap[\s\S]*Routes\.Blog[\s\S]*Routes\.Contact[\s\S]*Routes\.Teachers[\s\S]*Routes\.PrivacyPolicy[\s\S]*Routes\.CookiePolicy[\s\S]*Routes\.TermsOfService/
  );
});
