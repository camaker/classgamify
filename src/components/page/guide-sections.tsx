import type { GuideFaq } from '@/pages/guide-faq-content';

export function GuideFaqSection({
  faqs,
  headingId,
}: {
  faqs: GuideFaq[];
  headingId: string;
}) {
  return (
    <section aria-labelledby={headingId} className="space-y-6">
      <h2 id={headingId} className="text-3xl font-semibold">
        Frequently asked questions
      </h2>
      <dl className="grid gap-3 md:grid-cols-2">
        {faqs.map((faq) => (
          <div className="rounded-lg border bg-card p-5" key={faq.question}>
            <dt className="font-semibold">{faq.question}</dt>
            <dd className="mt-2 text-sm leading-6 text-muted-foreground">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function GuideStepCard({
  detail,
  number,
  title,
}: {
  detail: string;
  number: string;
  title: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <span className="text-primary text-sm font-semibold">{number}</span>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

export function RelatedGuides({
  links,
}: {
  links: { href: string; label: string; detail: string }[];
}) {
  return (
    <nav aria-label="Related guides" className="space-y-4">
      <h2 className="text-2xl font-semibold">More classroom game guides</h2>
      <ul className="grid gap-3 md:grid-cols-3">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className="block h-full rounded-lg border bg-card p-4 transition-colors hover:border-primary/50"
              href={link.href}
            >
              <span className="font-semibold text-primary">{link.label} →</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                {link.detail}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
