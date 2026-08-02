import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';

export type MarkdownResult = {
  markup: string;
};

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function enhanceMarkdownElements() {
  return (tree: HastNode) => {
    const pending = [tree];

    while (pending.length > 0) {
      const node = pending.pop();
      if (!node) continue;

      if (node.type === 'element') {
        node.properties ??= {};

        if (
          node.tagName === 'a' &&
          typeof node.properties.href === 'string' &&
          node.properties.href.startsWith('/')
        ) {
          node.properties.className = ['underline-offset-4', 'hover:underline'];
        }

        if (node.tagName === 'img') {
          node.properties.loading = 'lazy';
          node.properties.className = ['rounded-lg', 'shadow-md'];
        }
      }

      if (node.children) pending.push(...node.children);
    }
  };
}

/**
 * Renders markdown to HTML using unified (remark/rehype) with GFM,
 * heading IDs, and autolink headings.
 * https://tanstack.dev/start/latest/docs/framework/react/guide/rendering-markdown
 */
export function renderMarkdown(content: string): MarkdownResult {
  const result = unified()
    .use(remarkParse) // Parse markdown
    .use(remarkGfm) // Support GitHub Flavored Markdown
    .use(remarkRehype, { allowDangerousHtml: true }) // Convert to HTML AST
    .use(rehypeRaw) // Process raw HTML in markdown
    .use(rehypeSlug) // Add IDs to headings
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: ['anchor'] },
    })
    .use(enhanceMarkdownElements)
    .use(rehypeStringify)
    .processSync(content);

  return { markup: String(result) };
}
