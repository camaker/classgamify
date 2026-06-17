import HeroSection from '@/components/blocks/hero';
import CallToActionSection from '@/components/blocks/calltoaction';
import PricingSection from '@/components/blocks/pricing';
import FaqSection from '@/components/blocks/faqs';

export function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CallToActionSection />
      <PricingSection />
      <FaqSection />
    </div>
  );
}
