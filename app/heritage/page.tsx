import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Gem, HandHeart, Landmark, Palette, Sparkles, Sprout } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Our Heritage",
  description:
    "Discover AMZIRA's South Indian ceremony wear heritage, artisan craft, textile archives, and atelier-led bridal styling.",
  path: "/heritage",
  image: "/images/footer/heritage-illustration-footer.webp"
});

type Pillar = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const pillars: Pillar[] = [
  {
    icon: Landmark,
    title: "Temple border memory",
    copy: "Zari lines, jewel tones, and carved-arch geometry guide the house language."
  },
  {
    icon: HandHeart,
    title: "Hand-finished detail",
    copy: "Each edit is checked for lining, fall, blouse finish, and ceremony movement."
  },
  {
    icon: Sprout,
    title: "Made for families",
    copy: "Bride, groom, kids, and guests are styled as one celebration wardrobe."
  }
];

const craftSteps = [
  {
    title: "Archive",
    detail: "We begin with heirloom drapes, pattu pavadai color stories, and Kanjeevaram-inspired border studies."
  },
  {
    title: "Sketch",
    detail: "Silhouettes are shaped around the ritual: muhurtham, haldi, sangeet, reception, and family portraits."
  },
  {
    title: "Embroider",
    detail: "Zari, mirror, bead, and thread accents are placed where they catch light without weighing down the garment."
  },
  {
    title: "Style",
    detail: "The final look is finished with blouse pairing, dupatta drape, jewelry tone, and movement checks."
  }
];

const gallery = [
  {
    title: "Bridal silks",
    copy: "Deep reds, antique golds, and heirloom blouse craft for the ceremony hour.",
    image: "/images/occasions/bride_side.webp",
    className: "md:col-span-2 md:row-span-2"
  },
  {
    title: "Festival color",
    copy: "Marigold, emerald, and peacock shades for puja mornings and family gatherings.",
    image: "/images/occasions/celebrating_festivals.webp",
    className: ""
  },
  {
    title: "Groom edits",
    copy: "Sherwani and kurta jacket sets designed to sit beside bridal silk with ease.",
    image: "/images/occasions/team-groom.webp",
    className: ""
  }
];

const archiveNotes = [
  "Kanjeevaram-inspired borders",
  "Pattu pavadai color pairings",
  "Muhurtham red and gold edits",
  "Reception tissue and organza",
  "Family coordination styling"
];

export default function HeritagePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-charcoal text-white">
        <Image
          src="/images/footer/heritage-illustration-footer.webp"
          alt="Illustrated royal Indian wedding procession with heritage architecture"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/76 to-maroon-deep/30" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory to-transparent" />

        <div className="container-page relative grid min-h-[calc(100svh-7rem)] gap-10 py-16 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:py-20">
          <div className="temple-rule max-w-3xl">
            <p className="section-kicker text-gold-pale">Our heritage</p>
            <h1 className="mt-5 font-display text-6xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
              South Indian craft, kept in motion.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
              AMZIRA carries temple-border silk, family ceremony dressing, and artisan finish into a modern wedding
              wardrobe made for brides, grooms, children, and every guest in the frame.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="btn-primary gap-2 bg-gold text-charcoal hover:bg-gold-pale" href="/appointments">
                Book a heritage session <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link className="btn-secondary border-white/30 bg-white/10 text-white hover:border-gold hover:text-gold-pale" href="#craft">
                See the craft
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[620px]" aria-label="AMZIRA heritage textile story">
            <div className="absolute left-0 top-8 h-24 w-3/5 border border-gold/35 bg-gradient-to-r from-maroon/28 to-transparent" />
            <div className="absolute right-0 top-0 h-36 w-2/5 border border-white/20 bg-peacock/20" />
            <div className="absolute left-4 top-10 aspect-[4/5] w-[48%] overflow-hidden rounded-md border border-gold/50 bg-sandal shadow-sari sm:w-[42%] lg:left-10">
              <Image
                src="/images/occasions/bride.webp"
                alt="Bride in South Indian ceremony wear"
                fill
                sizes="(min-width: 1024px) 28vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-0 top-24 aspect-[3/4] w-[54%] overflow-hidden rounded-md border border-white/20 bg-charcoal shadow-sari sm:w-[48%]">
              <Image
                src="/images/occasions/wedding.webp"
                alt="South Indian wedding ceremony styling"
                fill
                sizes="(min-width: 1024px) 30vw, 54vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-3 left-[16%] w-[68%] rounded-md border border-gold/60 bg-ivory p-5 text-charcoal shadow-sari sm:w-[54%] lg:left-[22%]">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-maroon">House archive</p>
              <p className="mt-2 font-display text-3xl font-semibold leading-tight text-maroon-deep">
                Silk, zari, ritual color, and portrait-ready drape.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-16 lg:py-24">
        <div className="container-page grid gap-5 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-md border border-charcoal/10 bg-white p-7 shadow-sm">
              <Icon className="h-8 w-8 text-gold" aria-hidden="true" />
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-maroon-deep">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/66">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="craft" className="bg-white py-16 lg:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="temple-rule lg:sticky lg:top-32">
            <p className="section-kicker">The craft route</p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-tight text-maroon-deep lg:text-6xl">
              Every garment follows the ceremony before it follows the sketch.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-charcoal/70">
              Our process is built around how South Indian celebrations actually unfold: bright morning rituals,
              movement-heavy evenings, heirloom portraits, and coordinated family dressing.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-gold via-maroon to-peacock md:block" />
            <div className="space-y-5">
              {craftSteps.map((step, index) => (
                <article key={step.title} className="relative rounded-md border border-charcoal/10 bg-ivory p-6 shadow-sm md:ml-14">
                  <span className="absolute -left-[4.45rem] top-6 hidden h-10 w-10 place-items-center rounded-full border border-gold bg-white text-xs font-bold text-maroon shadow-sm md:grid">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-4xl font-semibold text-charcoal">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-charcoal/68">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-maroon-deep py-16 text-white lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.16)_0_1px,transparent_1px_28px),linear-gradient(120deg,rgba(11,79,108,0.34),transparent_58%)]" />
        <div className="container-page relative grid gap-9 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div>
            <p className="section-kicker text-gold-pale">Wedding procession</p>
            <h2 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight text-white lg:text-6xl">
              The old homepage ritual, restored as a cinematic pause.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/76">
              The procession is a reminder that AMZIRA is not only selling occasion wear. It is dressing the public
              memory of a family day.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-md border border-gold/50 bg-charcoal shadow-sari">
            <video
              className="aspect-video h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster="/images/footer/heritage-illustration-footer.webp"
            >
              <source src="/images/animations/royal-wedding-procession-cinematic.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/46 to-transparent" />
          </div>
        </div>
      </section>

      <section className="bg-[#fbf9f5] py-16 lg:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="temple-rule max-w-3xl">
              <p className="section-kicker">Atelier archive</p>
              <h2 className="mt-3 font-display text-5xl font-semibold leading-tight text-maroon-deep lg:text-6xl">
                A living archive for wedding wardrobes.
              </h2>
            </div>
            <Link className="btn-secondary w-fit gap-2" href="/women">
              Explore collections <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid auto-rows-[320px] gap-5 md:grid-cols-4">
            {gallery.map((item) => (
              <article key={item.title} className={`group relative overflow-hidden rounded-md border border-charcoal/10 bg-sandal ${item.className}`}>
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes={item.className ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 24vw, 100vw"}
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/82 via-charcoal/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="font-display text-4xl font-semibold leading-tight">{item.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/76">{item.copy}</p>
                </div>
              </article>
            ))}

            <article className="rounded-md border border-maroon/20 bg-white p-7 shadow-sm md:col-span-2">
              <Palette className="h-9 w-9 text-peacock" aria-hidden="true" />
              <h3 className="mt-5 font-display text-4xl font-semibold leading-tight text-maroon-deep">
                Color is treated like ceremony language.
              </h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {archiveNotes.map((note) => (
                  <span key={note} className="rounded-full border border-charcoal/10 bg-ivory px-4 py-2 text-xs font-semibold text-charcoal/72">
                    {note}
                  </span>
                ))}
              </div>
            </article>

            <Link
              href="/appointments"
              className="group flex flex-col justify-between rounded-md border border-gold/50 bg-charcoal p-7 text-white shadow-sari transition hover:-translate-y-1 hover:bg-maroon-deep focus-ring md:col-span-2"
            >
              <div>
                <Sparkles className="h-9 w-9 text-gold-pale" aria-hidden="true" />
                <h3 className="mt-5 font-display text-4xl font-semibold leading-tight">
                  Build a family ceremony edit with an atelier stylist.
                </h3>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-pale">
                Book styling <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-emerald py-16 text-white lg:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div className="rounded-md border border-gold/40 bg-white/[0.08] p-7">
            <Gem className="h-10 w-10 text-gold-pale" aria-hidden="true" />
            <p className="mt-5 font-display text-4xl font-semibold leading-tight">
              Luxury is the quiet confidence that every fold has been considered.
            </p>
          </div>
          <div>
            <p className="section-kicker text-gold-pale">The promise</p>
            <h2 className="mt-3 font-display text-5xl font-semibold leading-tight lg:text-6xl">
              Heritage should feel wearable, not museum-kept.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/76">
              AMZIRA keeps the codes of South Indian celebration visible while making the shopping experience clear,
              photographed, searchable, and ready for today&apos;s wedding calendar.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
