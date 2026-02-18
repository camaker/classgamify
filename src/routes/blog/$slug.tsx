import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { MarkdownBody } from '@/components/page/markdown-body';
import { getPostBySlug } from '@/lib/blog';
import { websiteConfig } from '@/config/website';
import { messages } from '@/config/messages';
import { getCanonicalUrl, getImageUrl } from '@/lib/urls';
import { IconArrowLeft } from '@tabler/icons-react';
import { formatDate } from '@/lib/formatter';

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) return {};
    const title = `${post.title} | ${websiteConfig.metadata?.name}`;
    const description = post.description ?? websiteConfig.metadata?.description ?? '';
    const url = getCanonicalUrl(`/blog/${params.slug}`);
    const image = post.image ? getImageUrl(post.image) : undefined;
    const siteName = websiteConfig.metadata?.name ?? '';
    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description,
      ...(image ? { image } : {}),
      datePublished: post.date,
      url,
      publisher: {
        '@type': 'Organization',
        name: siteName,
      },
    };
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' as const },
        ...(image ? [{ property: 'og:image', content: image }] : []),
        { name: 'twitter:card', content: 'summary_large_image' as const },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        ...(image ? [{ name: 'twitter:image', content: image }] : []),
      ],
      links: [{ rel: 'canonical', href: url }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(articleJsonLd),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  if (!websiteConfig.blog?.enable) {
    return (
      <Container className="py-16">
        <p className="text-center text-muted-foreground">
          {messages.blog.disabled}
        </p>
      </Container>
    );
  }

  const { post } = Route.useLoaderData();
  if (!post) throw notFound();

  return (
    <div className="flex flex-col gap-8 p-16">
      <Container className="px-4">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/blog"
            search={{ page: 1 }}
            className="mb-6 inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
            {messages.blog.allPosts}
          </Link>

          <article>
            {/* Metadata: category, date */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium capitalize">
                {post.category}
              </span>
              <time dateTime={post.date}>{formatDate(new Date(post.date))}</time>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>

            {post.description && (
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                {post.description}
              </p>
            )}

            <div className="mt-8">
              <MarkdownBody content={post.content} />
            </div>
          </article>
        </div>
      </Container>
    </div>
  );
}
