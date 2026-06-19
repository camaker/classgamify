import { Markdown } from '@/components/markdown/markdown';
import { BlogPostVisual } from '@/components/blog/blog-post-visual';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { formatDate } from '@/lib/formatter';
import { getPostBySlug } from '@/lib/blog';
import { getLocale, localeConfig } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import {
  articleJsonLd,
  graphJsonLd,
  jsonLdScript,
  organizationJsonLd,
} from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import {
  IconArrowLeft,
  IconDeviceGamepad2,
  IconLayoutGrid,
  IconPlus,
} from '@tabler/icons-react';
import { Link, createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();

    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return {};
    const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';
    const path = `${Routes.Blog}/${post.slug}`;
    const metadata = seo(path, {
      title: `${post.title} | ${websiteConfig.metadata?.name}`,
      description: post.description,
      image: post.image,
      type: 'article',
    });

    return {
      ...metadata,
      scripts: [
        jsonLdScript(
          graphJsonLd([
            organizationJsonLd(),
            articleJsonLd({
              datePublished: post.date,
              description: post.description,
              headline: post.title,
              image: post.image,
              inLanguage: localeConfig[currentLocale].hreflang,
              path,
            }),
          ])
        ),
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  if (!post) throw notFound();
  const currentLocale = getLocale() === 'zh' ? 'zh' : 'en';

  return (
    <Container className="px-4 py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        <Link
          to={Routes.Blog}
          className={cn(buttonVariants({ variant: 'ghost' }), 'px-0')}
        >
          <IconArrowLeft className="size-4" />
          {currentLocale === 'zh' ? '返回文章列表' : 'Back to articles'}
        </Link>
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(new Date(post.date))}
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              {post.description}
            </p>
          </div>
          <BlogPostVisual
            post={post}
            size="hero"
            className="rounded-lg border"
          />
        </header>
        <Markdown
          content={post.content}
          className="prose prose-neutral dark:prose-invert max-w-none"
        />
        <aside className="rounded-lg border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0 space-y-2">
              <h2 className="text-lg font-semibold tracking-normal">
                {currentLocale === 'zh'
                  ? '把方法放进下一个课堂活动'
                  : 'Put this method into the next activity'}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {currentLocale === 'zh'
                  ? '创建一个活动，浏览模板，或打开学生预览检查作业体验。'
                  : 'Create an activity, browse templates, or open the student preview to check the assignment experience.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Link to={Routes.Create} className={buttonVariants()}>
                <IconPlus className="size-4" />
                {currentLocale === 'zh' ? '创建活动' : 'Create activity'}
              </Link>
              <Link
                to={Routes.Templates}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconLayoutGrid className="size-4" />
                {currentLocale === 'zh' ? '浏览模板' : 'Browse templates'}
              </Link>
              <Link
                to={Routes.PlayDemo}
                className={cn(buttonVariants({ variant: 'outline' }))}
              >
                <IconDeviceGamepad2 className="size-4" />
                {currentLocale === 'zh' ? '学生预览' : 'Student preview'}
              </Link>
            </div>
          </div>
        </aside>
      </article>
    </Container>
  );
}
