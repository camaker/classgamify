import { renderMarkdown } from '@/lib/markdown';

type MarkdownProps = {
  content: string;
  className?: string;
};
/**
 * Renders markdown component
 * https://tanstack.dev/start/latest/docs/framework/react/guide/rendering-markdown
 */
export function Markdown({ content, className }: MarkdownProps) {
  const { markup } = renderMarkdown(content);

  return (
    <div
      className={className}
      // Content is compiled from version-controlled Markdown, not user input.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
