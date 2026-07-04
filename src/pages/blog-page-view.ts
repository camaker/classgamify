import { m } from '@/locale/paraglide/messages';
import { Routes } from '@/lib/routes';
import {
  buildPublicEditorialHandoffView,
  type PublicEditorialHandoffView,
} from '@/pages/public-editorial-content-view';

export type BlogCtaActionIcon = 'create' | 'preview' | 'templates';

export type BlogCtaAction = {
  icon: BlogCtaActionIcon;
  id: BlogCtaActionIcon;
  label: string;
  to:
    | typeof Routes.Create
    | typeof Routes.StudentPreview
    | typeof Routes.Templates;
  variant?: 'default' | 'outline';
};

export type BlogListPageViewModel = {
  ctaActions: BlogCtaAction[];
  description: string;
  eyebrow: string;
  handoffView: PublicEditorialHandoffView;
  seoDescription: string;
  seoTitle: string;
  title: string;
};

export type BlogPostCtaViewModel = {
  actions: BlogCtaAction[];
  description: string;
  title: string;
};

export function buildBlogListPageViewModel(): BlogListPageViewModel {
  return {
    ctaActions: getBlogCtaActions(),
    description: m.blog_page_description(),
    eyebrow: m.blog_page_eyebrow(),
    handoffView: buildPublicEditorialHandoffView(),
    seoDescription: m.blog_page_seo_description(),
    seoTitle: m.blog_page_seo_title(),
    title: m.blog_page_title(),
  };
}

export function buildBlogPostCtaViewModel(): BlogPostCtaViewModel {
  return {
    actions: getBlogCtaActions(),
    description: m.blog_post_cta_description(),
    title: m.blog_post_cta_title(),
  };
}

export function getBlogCtaActions(): BlogCtaAction[] {
  return [
    {
      icon: 'create',
      id: 'create',
      label: m.blog_page_create_activity(),
      to: Routes.Create,
    },
    {
      icon: 'templates',
      id: 'templates',
      label: m.blog_page_browse_templates(),
      to: Routes.Templates,
      variant: 'outline',
    },
    {
      icon: 'preview',
      id: 'preview',
      label: m.blog_page_student_preview(),
      to: Routes.StudentPreview,
      variant: 'outline',
    },
  ];
}
