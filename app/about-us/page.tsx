import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Flower2,
  Heart,
  Stars
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { GIRLS_LEHENGA_CATEGORY_PATH } from "@/lib/storefront";
import AboutHeroVideo from "@/components/founder-namaste";
import AboutStoryCards from "@/components/about-story-cards";

export const metadata: Metadata = buildMetadata({
  title: "About AMZIRA",
  description:
    "Meet the story behind AMZIRA: a menswear house founded in 2021, now bringing South Indian lehenga choli design to girls' celebrations.",
  path: "/about-us",
  image: "/images/about/mahadev-about-hero-v2.png"
});

const milestones = [
  {
    year: "2021",
    title: "A humble beginning",
    copy: "AMZIRA began with a simple belief—that every celebration deserves a story woven in tradition, for the people we love."
  },
  {
    year: "2023",
    title: "Growing together",
    copy: "With your love, we expanded our collections, bringing timeless South Indian designs to more families across India."
  },
  {
    year: "2025",
    title: "A brighter tomorrow",
    copy: "As we grow, our purpose remains the same—to celebrate her, her moments, and the heritage that lives on through generations."
  }
];

const commitments = [
  "South Indian design language, not a generic festive edit",
  "More than 200 designs shaped for the market we know best",
  "Fit, finish, and joy considered for every family celebration"
];

export default function AboutUsPage() {
  return (
    <>
      <section className="about-hero about-cinematic-hero relative isolate overflow-hidden text-white">
        <AboutHeroVideo />
        <div className="about-cinematic-hero__wash" aria-hidden="true" />
        <div className="about-cinematic-hero__vignette" aria-hidden="true" />
        <div className="about-cinematic-hero__particles" aria-hidden="true" />
        <div className="about-cinematic-hero__content container-page relative z-10">
          <div className="about-cinematic-hero__copy">
            <h1 className="about-cinematic-hero__title font-display font-semibold">
              <span>A warm<br />welcome.</span>
              <span className="text-gold-pale">A bolder<br />next chapter.</span>
            </h1>
            <p className="about-cinematic-hero__description">
              We began by dressing men for milestones. Today, we are bringing that same respect for craft to girls&apos;
              South Indian celebration wear—one joyful lehenga choli at a time.
            </p>
            <div className="about-cinematic-hero__actions">
              <Link href="#our-story" className="btn-primary about-cinematic-hero__primary-action gap-2">
                Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={GIRLS_LEHENGA_CATEGORY_PATH} className="btn-secondary about-cinematic-hero__secondary-action gap-2">
                Explore the collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside className="about-cinematic-hero__values" aria-label="AMZIRA values">
            <p className="about-cinematic-hero__mantra">ॐ<br />नमः<br />शिवाय</p>
            <span className="about-cinematic-hero__values-rule" aria-hidden="true" />
            <p className="about-cinematic-hero__values-copy">Strength<br />Tradition<br />Grace<br />For generations</p>
          </aside>
        </div>
      </section>

      <section id="our-story" className="about-story relative isolate overflow-hidden text-charcoal">
        <Image
          src="/images/about/amzira-story-bg-reference.png"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="about-story__backdrop object-cover"
        />
        <div className="about-story__wash" aria-hidden="true" />
        <div className="about-story__content container-page relative z-10">
          <div className="about-story__intro">
            <div className="about-story__eyebrow">
              <span>Our story</span>
              <span className="about-story__eyebrow-rule" aria-hidden="true">
                <i />
                <Flower2 className="h-6 w-6" />
                <i />
              </span>
            </div>
            <h2 className="about-story__title font-display">
              <span>Tradition</span>
              <span>Threads</span>
              <span><em>Tomorrow.</em></span>
            </h2>
            <p className="about-story__intro-copy">
              More than clothing, we create heirlooms—celebrating our roots, our people, and the moments that shape
              brighter tomorrows.
            </p>
            <Link href="#about-pivot" className="btn-primary about-story__journey gap-2">
              Our journey <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="about-story__timeline" aria-label="AMZIRA story chapters">
            {milestones.map((milestone, index) => (
              <article className="about-story__chapter" key={milestone.year}>
                <div className="about-story__chapter-year">
                  <span>{milestone.year}</span>
                  <i aria-hidden="true" />
                </div>
                <div className="about-story__chapter-copy">
                  <p>Chapter {String(index + 1).padStart(2, "0")}</p>
                  <h3 className="font-display">{milestone.title}</h3>
                  <span>{milestone.copy}</span>
                </div>
              </article>
            ))}
          </div>

          <AboutStoryCards />

          <p className="about-story__aside">“Rooted in our past,<br />designed for her tomorrow.”</p>
        </div>
      </section>

      <section id="about-pivot" className="about-pivot relative isolate overflow-hidden text-white">
        <Image
          src="/images/about/amzira-pivot-bg-v2.png"
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="about-pivot__backdrop object-cover"
        />
        <div className="about-pivot__wash" aria-hidden="true" />
        <div className="about-pivot__pattern" aria-hidden="true" />
        <div className="about-pivot__content container-page relative z-10">
          <div className="about-pivot__copy">
            <div className="about-pivot__eyebrow">
              <span>Why South Indian lehenga choli</span>
              <span className="about-pivot__eyebrow-rule" aria-hidden="true"><i /><Flower2 className="h-6 w-6" /><i /></span>
            </div>
            <h2 className="about-pivot__title font-display">Not a side collection.<br />A <em>genuine</em> focus.</h2>
            <p>
              Our designers bring experience in the colour, border work, silhouette, and celebration rituals of South
              Indian dressing. This is where our next range of ideas belongs—and where we intend to go deep.
            </p>
            <Link href="#our-story" className="about-pivot__button">Our philosophy <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <p className="about-pivot__signature">Rooted in heritage<br />Designed for tomorrow</p>
          </div>

          <div className="about-pivot__card">
            <span className="about-pivot__card-corner about-pivot__card-corner--tl" aria-hidden="true" />
            <span className="about-pivot__card-corner about-pivot__card-corner--tr" aria-hidden="true" />
            <span className="about-pivot__card-corner about-pivot__card-corner--bl" aria-hidden="true" />
            <span className="about-pivot__card-corner about-pivot__card-corner--br" aria-hidden="true" />
            <Flower2 className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
            <p className="about-pivot__percent font-display">70%</p>
            <p className="about-pivot__card-kicker">Inventory focus<br />moving forward</p>
            <div className="about-pivot__divider" aria-hidden="true"><i /><Flower2 className="h-5 w-5" /><i /></div>
            <p className="about-pivot__card-title font-display">Made for little entrances and long family memories.</p>
            <div className="about-pivot__mini-grid">
              <div><Building2 aria-hidden="true" /><span>Tradition<br />in every thread</span></div>
              <div><Flower2 aria-hidden="true" /><span>Celebrations<br />for generations</span></div>
              <div><Heart aria-hidden="true" /><span>More than<br />outfits</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-promise relative isolate overflow-hidden">
        <div className="about-promise__texture" aria-hidden="true" />
        <div className="about-promise__content container-page">
          <div className="about-promise__visual">
            <div className="about-promise__visual-main">
              <Image
                src="/images/catalog/mahika-heritage-multi-pattu-pavadai/01.webp"
                alt="A South Indian pattu pavadai from the AMZIRA collection"
                fill
                unoptimized
                sizes="(min-width: 1024px) 36vw, 100vw"
              />
              <div className="about-promise__visual-wash" aria-hidden="true" />
              <div className="about-promise__visual-copy">
                <p>The new design room</p>
                <h3 className="font-display">Colour stories that know the ceremony.</h3>
                <span>South Indian detail, reimagined for little entrances.</span>
              </div>
              <Stars className="about-promise__visual-star h-9 w-9" aria-hidden="true" />
            </div>
            <div className="about-promise__visual-detail about-promise__visual-detail--top">
              <Image src="/images/catalog/aarika-purple-gold-pattu-pavadai/04.webp" alt="Gold border detail on a pattu pavadai" fill unoptimized sizes="18vw" />
            </div>
            <div className="about-promise__visual-detail about-promise__visual-detail--bottom">
              <Image src="/images/catalog/tara-maroon-gold-pattu-pavadai/01.webp" alt="Maroon and gold celebration wear detail" fill unoptimized sizes="18vw" />
            </div>
            <div className="about-promise__seal" aria-hidden="true"><Flower2 className="h-7 w-7" /><span>Made with<br />intention</span></div>
          </div>

          <div className="about-promise__copy">
            <div className="about-promise__eyebrow">
              <span>What stays with every AMZIRA piece</span>
              <span className="about-promise__eyebrow-rule" aria-hidden="true"><i /><Flower2 className="h-5 w-5" /><i /></span>
            </div>
            <h2 className="about-promise__title font-display">A bigger wardrobe,<br /><em>held to the same promise.</em></h2>
            <p className="about-promise__intro">From a first kurta to a little girl&apos;s first celebration lehenga, every AMZIRA piece carries the same respect for craft, fit, and the moment it will become a memory.</p>
            <div className="about-promise__list">
              {commitments.map((commitment) => (
                <div className="about-promise__item" key={commitment}>
                  <span className="about-promise__item-icon"><Check className="h-4 w-4" aria-hidden="true" /></span>
                  <span>{commitment}</span>
                </div>
              ))}
            </div>
            <Link href={GIRLS_LEHENGA_CATEGORY_PATH} className="about-promise__cta group">
              See the girls&apos; collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
