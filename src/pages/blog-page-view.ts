import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';

export type BlogCtaActionIcon = 'create' | 'preview' | 'templates';

export type BlogCtaAction = {
  icon: BlogCtaActionIcon;
  label: string;
  to:
    | typeof Routes.Create
    | typeof Routes.StudentPreview
    | typeof Routes.Templates;
  variant?: 'default' | 'outline';
};

export function getBlogCtaActions(): BlogCtaAction[] {
  return [
    {
      icon: 'create',
      label: m.blog_page_create_activity(),
      to: Routes.Create,
    },
    {
      icon: 'templates',
      label: m.blog_page_browse_templates(),
      to: Routes.Templates,
      variant: 'outline',
    },
    {
      icon: 'preview',
      label: m.blog_page_student_preview(),
      to: Routes.StudentPreview,
      variant: 'outline',
    },
  ];
}
