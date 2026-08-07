import Link from "next/link";

export function SimplePage({
  kicker,
  title,
  body,
  cta
}: {
  kicker: string;
  title: string;
  body: string[];
  cta?: { label: string; href: string };
}) {
  return (
    <section className="container-page py-14">
      <div className="mx-auto max-w-4xl">
        <p className="section-kicker">{kicker}</p>
        <h1 className="mt-3 font-display text-6xl font-semibold leading-none text-maroon-deep">{title}</h1>
        <div className="mt-8 space-y-5 rounded-md border border-charcoal/10 bg-white p-7 text-base leading-8 text-charcoal/70 shadow-sm">
          {body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
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
