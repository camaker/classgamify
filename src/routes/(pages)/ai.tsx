import { createFileRoute } from '@tanstack/react-router';
import Container from '@/components/layout/container';
import { AiImageCard } from '@/components/ai/ai-image-card';
import { AiSummarizationCard } from '@/components/ai/ai-summarization-card';
import { AiTaglineCard } from '@/components/ai/ai-tagline-card';
import { AiTranslationCard } from '@/components/ai/ai-translation-card';
import { AiTtsCard } from '@/components/ai/ai-tts-card';
import { websiteConfig } from '@/config/website';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/(pages)/ai')({
  head: () =>
    seo('/ai', {
      title: `AI Playground | ${websiteConfig.metadata?.name}`,
      description:
        'Demo of TanStack AI integrated with Cloudflare Workers AI and fal.ai.',
    }),
  component: AiPage,
});

function AiPage() {
  return (
    <Container className="py-16 px-4">
      <div className="mx-auto max-w-5xl space-y-10 pb-16">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Playground</h1>
          <p className="text-lg text-muted-foreground">
            Built with TanStack AI, Cloudflare Workers AI, and fal.ai.
          </p>
        </div>

        <AiSummarizationCard />
        <AiTranslationCard />
        <AiTaglineCard />
        <AiTtsCard />
        <AiImageCard />
      </div>
    </Container>
  );
}
