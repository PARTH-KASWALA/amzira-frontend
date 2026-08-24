import Link from "next/link";

export function SimplePage({
  kicker,
  title,
  body,
  sections = [],
  cta
}: {
  kicker: string;
  title: string;
  body: string[];
  sections?: { title: string; paragraphs: string[]; bullets?: string[] }[];
  cta?: { label: string; href: string };
}) {
  return (
    <section className="container-page py-14">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-maroon">{kicker}</p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.04] text-maroon-deep sm:text-6xl">{title}</h1>
        <div className="mt-8 space-y-5 border-t border-charcoal/10 pt-7 text-base leading-8 text-charcoal/70">
          {body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {sections.map((section) => (
            <section key={section.title} className="space-y-3 pt-3" aria-labelledby={section.title.toLowerCase().replaceAll(" ", "-")}>
              <h2 id={section.title.toLowerCase().replaceAll(" ", "-")} className="font-display text-3xl font-semibold leading-tight text-maroon-deep">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? (
                <ul className="list-disc space-y-2 pl-6">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
            </section>
          ))}
          {cta ? (
            <Link href={cta.href} className="btn-primary mt-4">
              {cta.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
