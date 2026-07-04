import { allBlogs, allChangelogs } from 'content-collections';
import type { Blog, Changelog } from 'content-collections';
import { baseLocale, locales, type Locale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { m } from '@/locale/paraglide/messages';
import { getSitemapUrls } from '@/seo/public-indexing';
import {
  PUBLIC_INDEXED_BLOG_BASE_PATH,
  RETIRED_LEGACY_PUBLIC_PATHS,
} from '@/seo/public-routes';

export const PUBLIC_EDITORIAL_HANDOFF_ITEM_IDS = [
  'editorial-set',
  'blog-post-count',
  'changelog-entry-count',
  'localized-blog-pairs',
  'localized-changelog-pairs',
  'blog-list-route',
  'blog-post-route',
  'blog-cta-create',
  'blog-cta-templates',
  'blog-cta-preview',
  'sitemap-blog-urls',
  'sitemap-blog-lastmod',
  'sitemap-changelog-boundary',
  'article-json-ld',
  'content-collection-source',
  'product-loop-copy',
  'template-copy',
  'assignment-copy',
  'ai-authoring-copy',
  'teacher-results-copy',
  'source-material-boundary',
  'student-runner-boundary',
  'release-notes-boundary',
  'legacy-copy-guard',
  'handwriting-copy-guard',
  'course-copy-guard',
  'image-generation-provider-guard',
  'public-route-helper',
  'private-data-guard',
  'editorial-privacy-guard',
] as const;

export type PublicEditorialHandoffItemId =
  (typeof PUBLIC_EDITORIAL_HANDOFF_ITEM_IDS)[number];

export type PublicEditorialHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: PublicEditorialHandoffItemId;
  label: string;
  value: string;
};

export type PublicEditorialHandoffPrivacyContract = {
  createsAssignmentLinks: false;
  exposesAnswerKeys: false;
  exposesRawAnonymousToken: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentAttemptRecords: false;
  exposesTeacherPrivateActivityContent: false;
  includesBlogCtaRoutes: true;
  includesLocalizedBlogPairs: true;
  includesReleaseNotesBoundary: true;
  itemIds: PublicEditorialHandoffItemId[];
  keepsChangelogOutOfIndex: true;
  keepsLegacyCopyOut: true;
  readsSourceMaterialFileBytes: false;
  routeActionsUseSharedConstants: true;
  scope: 'public-editorial-content-boundary';
};

export type PublicEditorialHandoffView = {
  description: string;
  itemViews: PublicEditorialHandoffItemView[];
  privacy: PublicEditorialHandoffPrivacyContract;
  title: string;
};

type EditorialBlogDoc = Blog & { locale: Locale; slug: string };
type EditorialChangelogDoc = Changelog & { locale: Locale; slug: string };
type EditorialDoc = {
  content: string;
  description: string;
  locale: Locale;
  slug: string;
  title: string;
};

type PublicEditorialHandoffContext = {
  baseBlogPosts: EditorialBlogDoc[];
  baseChangelogEntries: EditorialChangelogDoc[];
  blogPosts: EditorialBlogDoc[];
  changelogEntries: EditorialChangelogDoc[];
  corpus: string;
  sitemapBlogUrls: ReturnType<typeof getSitemapUrls>;
};

const PUBLIC_EDITORIAL_BLOG_CTA_ROUTES = {
  create: Routes.Create,
  preview: Routes.StudentPreview,
  templates: Routes.Templates,
} as const;

type PublicEditorialHandoffItemContext = PublicEditorialHandoffContext & {
  id: PublicEditorialHandoffItemId;
};

export function buildPublicEditorialHandoffView(): PublicEditorialHandoffView {
  const context = buildPublicEditorialHandoffContext();
  const itemViews = PUBLIC_EDITORIAL_HANDOFF_ITEM_IDS.map((id) =>
    buildPublicEditorialHandoffItemView({ ...context, id })
  );

  return {
    description: m.public_editorial_handoff_description(),
    itemViews,
    privacy: buildPublicEditorialHandoffPrivacyContract(itemViews),
    title: m.public_editorial_handoff_title(),
  };
}

function buildPublicEditorialHandoffContext(): PublicEditorialHandoffContext {
  const blogPosts = allBlogs as EditorialBlogDoc[];
  const changelogEntries = allChangelogs as EditorialChangelogDoc[];
  const docs: EditorialDoc[] = [...blogPosts, ...changelogEntries];

  return {
    baseBlogPosts: blogPosts.filter((post) => post.locale === baseLocale),
    baseChangelogEntries: changelogEntries.filter(
      (entry) => entry.locale === baseLocale
    ),
    blogPosts,
    changelogEntries,
    corpus: docs
      .map((doc) => `${doc.title}\n${doc.description}\n${doc.content}`)
      .join('\n'),
    sitemapBlogUrls: getSitemapUrls().filter((url) =>
      url.path.startsWith(`${PUBLIC_INDEXED_BLOG_BASE_PATH}/`)
    ),
  };
}

function buildPublicEditorialHandoffItemView(
  context: PublicEditorialHandoffItemContext
): PublicEditorialHandoffItemView {
  const item = buildPublicEditorialHandoffItem(context);

  return {
    ...item,
    ariaLabel: m.public_editorial_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildPublicEditorialHandoffItem({
  baseBlogPosts,
  baseChangelogEntries,
  blogPosts,
  changelogEntries,
  corpus,
  id,
  sitemapBlogUrls,
}: PublicEditorialHandoffItemContext): Omit<
  PublicEditorialHandoffItemView,
  'ariaLabel'
> {
  switch (id) {
    case 'editorial-set':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_editorial_set_description(),
        id,
        label: m.public_editorial_handoff_editorial_set_label(),
        value: m.public_editorial_handoff_document_count_value({
          count: String(blogPosts.length + changelogEntries.length),
        }),
      });
    case 'blog-post-count':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_blog_post_count_description(),
        id,
        label: m.public_editorial_handoff_blog_post_count_label(),
        value: m.public_editorial_handoff_post_count_value({
          count: String(baseBlogPosts.length),
        }),
      });
    case 'changelog-entry-count':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_changelog_entry_count_description(),
        id,
        label: m.public_editorial_handoff_changelog_entry_count_label(),
        value: m.public_editorial_handoff_entry_count_value({
          count: String(baseChangelogEntries.length),
        }),
      });
    case 'localized-blog-pairs':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_localized_blog_pairs_description(),
        id,
        label: m.public_editorial_handoff_localized_blog_pairs_label(),
        value: m.public_editorial_handoff_pair_count_value({
          count: String(countLocalizedPairs(blogPosts)),
        }),
      });
    case 'localized-changelog-pairs':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_localized_changelog_pairs_description(),
        id,
        label: m.public_editorial_handoff_localized_changelog_pairs_label(),
        value: m.public_editorial_handoff_pair_count_value({
          count: String(countLocalizedPairs(changelogEntries)),
        }),
      });
    case 'blog-list-route':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_blog_list_route_description(),
        id,
        label: m.public_editorial_handoff_blog_list_route_label(),
        value: Routes.Blog,
      });
    case 'blog-post-route':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_blog_post_route_description(),
        id,
        label: m.public_editorial_handoff_blog_post_route_label(),
        value: `${Routes.Blog}/:slug`,
      });
    case 'blog-cta-create':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_blog_cta_create_description(),
        id,
        label: m.public_editorial_handoff_blog_cta_create_label(),
        value: getBlogCtaActionRoute('create'),
      });
    case 'blog-cta-templates':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_blog_cta_templates_description(),
        id,
        label: m.public_editorial_handoff_blog_cta_templates_label(),
        value: getBlogCtaActionRoute('templates'),
      });
    case 'blog-cta-preview':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_blog_cta_preview_description(),
        id,
        label: m.public_editorial_handoff_blog_cta_preview_label(),
        value: getBlogCtaActionRoute('preview'),
      });
    case 'sitemap-blog-urls':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_sitemap_blog_urls_description(),
        id,
        label: m.public_editorial_handoff_sitemap_blog_urls_label(),
        value: m.public_editorial_handoff_url_count_value({
          count: String(sitemapBlogUrls.length),
        }),
      });
    case 'sitemap-blog-lastmod':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_sitemap_blog_lastmod_description(),
        id,
        label: m.public_editorial_handoff_sitemap_blog_lastmod_label(),
        value: sitemapBlogUrls.every((url) => url.lastmod)
          ? m.public_editorial_handoff_present_value()
          : m.public_editorial_handoff_needs_review_value(),
      });
    case 'sitemap-changelog-boundary':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_sitemap_changelog_boundary_description(),
        id,
        label: m.public_editorial_handoff_sitemap_changelog_boundary_label(),
        value: changelogIsExcludedFromSitemap()
          ? m.public_editorial_handoff_excluded_value()
          : m.public_editorial_handoff_needs_review_value(),
      });
    case 'article-json-ld':
      return buildPublicEditorialHandoffStaticItem({
        description: m.public_editorial_handoff_article_json_ld_description(),
        id,
        label: m.public_editorial_handoff_article_json_ld_label(),
        value: m.public_editorial_handoff_configured_value(),
      });
    case 'content-collection-source':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_content_collection_source_description(),
        id,
        label: m.public_editorial_handoff_content_collection_source_label(),
        value: m.public_editorial_handoff_content_collections_value(),
      });
    case 'product-loop-copy':
      return buildPublicEditorialContentStatusItem({
        corpus,
        description: m.public_editorial_handoff_product_loop_copy_description(),
        id,
        label: m.public_editorial_handoff_product_loop_copy_label(),
        terms: ['activity -> assignment -> attempt -> results', '课堂闭环'],
      });
    case 'template-copy':
      return buildPublicEditorialContentStatusItem({
        corpus,
        description: m.public_editorial_handoff_template_copy_description(),
        id,
        label: m.public_editorial_handoff_template_copy_label(),
        terms: ['template', 'templates', '模板'],
      });
    case 'assignment-copy':
      return buildPublicEditorialContentStatusItem({
        corpus,
        description: m.public_editorial_handoff_assignment_copy_description(),
        id,
        label: m.public_editorial_handoff_assignment_copy_label(),
        terms: ['assignment', 'assignments', '作业'],
      });
    case 'ai-authoring-copy':
      return buildPublicEditorialContentStatusItem({
        corpus,
        description: m.public_editorial_handoff_ai_authoring_copy_description(),
        id,
        label: m.public_editorial_handoff_ai_authoring_copy_label(),
        terms: ['ai draft', 'AI draft', 'AI 草稿'],
      });
    case 'teacher-results-copy':
      return buildPublicEditorialContentStatusItem({
        corpus,
        description:
          m.public_editorial_handoff_teacher_results_copy_description(),
        id,
        label: m.public_editorial_handoff_teacher_results_copy_label(),
        terms: ['teacher results', 'result review', '结果'],
      });
    case 'source-material-boundary':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_source_material_boundary_description(),
        id,
        label: m.public_editorial_handoff_source_material_boundary_label(),
        value: corpusContainsAny(corpus, [
          'source material',
          'source-material',
          '来源素材',
        ])
          ? m.public_editorial_handoff_no_storage_keys_value()
          : m.public_editorial_handoff_needs_review_value(),
      });
    case 'student-runner-boundary':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_student_runner_boundary_description(),
        id,
        label: m.public_editorial_handoff_student_runner_boundary_label(),
        value: corpusContainsAny(corpus, [
          'student runner',
          'student links',
          '学生作答',
        ])
          ? m.public_editorial_handoff_sanitized_runner_value()
          : m.public_editorial_handoff_needs_review_value(),
      });
    case 'release-notes-boundary':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_release_notes_boundary_description(),
        id,
        label: m.public_editorial_handoff_release_notes_boundary_label(),
        value:
          baseChangelogEntries.length > 0
            ? m.public_editorial_handoff_release_notes_value()
            : m.public_editorial_handoff_needs_review_value(),
      });
    case 'legacy-copy-guard':
      return buildPublicEditorialGuardItem({
        corpus,
        description: m.public_editorial_handoff_legacy_copy_guard_description(),
        id,
        label: m.public_editorial_handoff_legacy_copy_guard_label(),
        safeValue: m.public_editorial_handoff_classgamify_only_value(),
        terms: ['lang study', 'hanzi', 'hsk', 'getlangstudy'],
      });
    case 'handwriting-copy-guard':
      return buildPublicEditorialGuardItem({
        corpus,
        description:
          m.public_editorial_handoff_handwriting_copy_guard_description(),
        id,
        label: m.public_editorial_handoff_handwriting_copy_guard_label(),
        terms: ['handwriting', 'saved character', '汉字书写'],
      });
    case 'course-copy-guard':
      return buildPublicEditorialGuardItem({
        corpus,
        description: m.public_editorial_handoff_course_copy_guard_description(),
        id,
        label: m.public_editorial_handoff_course_copy_guard_label(),
        terms: ['course-site', 'course site', 'hsk course', 'copied course'],
      });
    case 'image-generation-provider-guard':
      return buildPublicEditorialGuardItem({
        corpus,
        description:
          m.public_editorial_handoff_image_generation_provider_guard_description(),
        id,
        label:
          m.public_editorial_handoff_image_generation_provider_guard_label(),
        terms: ['image generation', 'fal.ai', '图像生成'],
      });
    case 'public-route-helper':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_public_route_helper_description(),
        id,
        label: m.public_editorial_handoff_public_route_helper_label(),
        value: m.public_editorial_handoff_routes_constants_value(),
      });
    case 'private-data-guard':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_private_data_guard_description(),
        id,
        label: m.public_editorial_handoff_private_data_guard_label(),
        value: m.public_editorial_handoff_private_data_hidden_value(),
      });
    case 'editorial-privacy-guard':
      return buildPublicEditorialHandoffStaticItem({
        description:
          m.public_editorial_handoff_editorial_privacy_guard_description(),
        id,
        label: m.public_editorial_handoff_editorial_privacy_guard_label(),
        value: m.public_editorial_handoff_private_data_hidden_value(),
      });
  }
}

function buildPublicEditorialContentStatusItem({
  corpus,
  description,
  id,
  label,
  terms,
}: {
  corpus: string;
  description: string;
  id: PublicEditorialHandoffItemId;
  label: string;
  terms: string[];
}) {
  return buildPublicEditorialHandoffStaticItem({
    description,
    id,
    label,
    value: corpusContainsAny(corpus, terms)
      ? m.public_editorial_handoff_covered_value()
      : m.public_editorial_handoff_needs_review_value(),
  });
}

function buildPublicEditorialGuardItem({
  corpus,
  description,
  id,
  label,
  safeValue = m.public_editorial_handoff_excluded_value(),
  terms,
}: {
  corpus: string;
  description: string;
  id: PublicEditorialHandoffItemId;
  label: string;
  safeValue?: string;
  terms: string[];
}) {
  return buildPublicEditorialHandoffStaticItem({
    description,
    id,
    label,
    value: corpusContainsAny(corpus, terms)
      ? m.public_editorial_handoff_needs_review_value()
      : safeValue,
  });
}

function buildPublicEditorialHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<PublicEditorialHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildPublicEditorialHandoffPrivacyContract(
  itemViews: PublicEditorialHandoffItemView[]
): PublicEditorialHandoffPrivacyContract {
  return {
    createsAssignmentLinks: false,
    exposesAnswerKeys: false,
    exposesRawAnonymousToken: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentAttemptRecords: false,
    exposesTeacherPrivateActivityContent: false,
    includesBlogCtaRoutes: true,
    includesLocalizedBlogPairs: true,
    includesReleaseNotesBoundary: true,
    itemIds: itemViews.map((item) => item.id),
    keepsChangelogOutOfIndex: true,
    keepsLegacyCopyOut: true,
    readsSourceMaterialFileBytes: false,
    routeActionsUseSharedConstants: true,
    scope: 'public-editorial-content-boundary',
  };
}

function countLocalizedPairs(docs: { locale: Locale; slug: string }[]) {
  const localesBySlug = new Map<string, Set<Locale>>();

  for (const doc of docs) {
    const slugLocales = localesBySlug.get(doc.slug) ?? new Set<Locale>();
    slugLocales.add(doc.locale);
    localesBySlug.set(doc.slug, slugLocales);
  }

  return [...localesBySlug.values()].filter((slugLocales) =>
    locales.every((locale) => slugLocales.has(locale))
  ).length;
}

function getBlogCtaActionRoute(
  id: keyof typeof PUBLIC_EDITORIAL_BLOG_CTA_ROUTES
) {
  return PUBLIC_EDITORIAL_BLOG_CTA_ROUTES[id];
}

function changelogIsExcludedFromSitemap() {
  return (
    RETIRED_LEGACY_PUBLIC_PATHS.includes('/changelog') &&
    !getSitemapUrls().some((url) => url.path.startsWith('/changelog'))
  );
}

function corpusContainsAny(corpus: string, terms: string[]) {
  const lowerCorpus = corpus.toLocaleLowerCase();

  return terms.some((term) => lowerCorpus.includes(term.toLocaleLowerCase()));
}
