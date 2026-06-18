import { m } from '@/locale/paraglide/messages';
import { HeaderSection } from '@/components/shared/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { PricingTable } from '@/components/pricing/pricing-table';
import {
  IconBook2,
  IconPrinter,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';

type PricingDecisionCard = {
  description: string;
  icon: TablerIcon;
  title: string;
};

export default function PricingSection() {
  const decisionCards: PricingDecisionCard[] = [
    {
      description: m.pricing_decision_learners_description(),
      icon: IconBook2,
      title: m.pricing_decision_learners_title(),
    },
    {
      description: m.pricing_decision_worksheets_description(),
      icon: IconPrinter,
      title: m.pricing_decision_worksheets_title(),
    },
    {
      description: m.pricing_decision_teachers_description(),
      icon: IconUsers,
      title: m.pricing_decision_teachers_title(),
    },
  ];

  return (
    <section id="pricing" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl space-y-12 md:space-y-16">
        <ScrollReveal>
          <HeaderSection
            subtitle={m.home_pricing_block_subtitle()}
            subtitleClassName="text-4xl font-bold"
            description={m.home_pricing_block_description()}
          />
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <PricingTable />
        </ScrollReveal>
        <ScrollReveal delay={250}>
          <div className="grid gap-4 md:grid-cols-3">
            {decisionCards.map((card) => (
              <PricingDecisionCard key={card.title} card={card} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PricingDecisionCard({ card }: { card: PricingDecisionCard }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
        <card.icon className="size-4" />
      </div>
      <h3 className="font-semibold">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {card.description}
      </p>
    </div>
  );
}
