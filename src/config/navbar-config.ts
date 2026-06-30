import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import {
  IconArticle,
  IconDeviceGamepad2,
  IconListDetails,
  IconLayoutGrid,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import type { MenuItemConfig } from '../types';
/**
 * Navbar links
 */
export function getNavbarLinks(): MenuItemConfig[] {
  return [
    {
      id: 'templates',
      title: m.nav_templates(),
      href: Routes.Templates,
      icon: IconLayoutGrid,
    },
    {
      id: 'worksheets',
      title: m.nav_worksheets(),
      href: Routes.Worksheets,
      icon: IconListDetails,
    },
    {
      id: 'create',
      title: m.nav_create(),
      href: Routes.Create,
      icon: IconPlus,
    },
    {
      id: 'student-preview',
      title: m.nav_student_preview(),
      href: Routes.StudentPreview,
      icon: IconDeviceGamepad2,
    },
    {
      id: 'pricing',
      title: m.nav_pricing(),
      href: Routes.Pricing,
      icon: IconSparkles,
    },
    { id: 'blog', title: m.nav_blog(), href: Routes.Blog, icon: IconArticle },
  ];
}
