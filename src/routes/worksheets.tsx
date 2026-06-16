import { WorksheetPage } from '@/components/learn/worksheet-page';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/worksheets')({
  head: () =>
    seo('/worksheets', {
      title: `Chinese Character Worksheet Generator | ${websiteConfig.metadata?.name}`,
      description:
        'Create printable HSK1 Chinese character handwriting worksheets from the Lang Study starter set.',
    }),
  component: WorksheetPage,
});
