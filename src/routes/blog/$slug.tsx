import { Markdown } from '@/components/markdown/markdown';
import Container from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { formatDate } from '@/lib/formatter';
import { getPostBySlug } from '@/lib/blog';
import { getLocale } from '@/lib/locale';
import { Routes } from '@/lib/routes';
import { seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';
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

    return seo(`${Routes.Blog}/${post.slug}`, {
      title: `${post.title} | ${websiteConfig.metadata?.name}`,
      description: post.description,
      image: post.image,
      type: 'article',
    });
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
          <div className="aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
            <img
              src={post.image}
              alt={post.title}
              className="size-full object-cover"
              width={1280}
              height={720}
            />
          </div>
        </header>
        <Markdown
          content={post.content}
          className="prose prose-neutral dark:prose-invert max-w-none"
        />
      </article>
    </Container>
  );
}
