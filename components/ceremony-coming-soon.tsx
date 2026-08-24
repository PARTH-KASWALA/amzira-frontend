import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Flower2,
  Gem,
  Leaf,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import {
  comingSoonDepartments,
  type ComingSoonDepartment,
  LIVE_CATEGORY_PATH
} from "@/lib/storefront";
import { COMPANY } from "@/lib/company";

const womenProofs = [
  {
    icon: Flower2,
    title: "South Indian craftsmanship",
    copy: "Inspired by heritage and rituals."
  },
  {
    icon: Gem,
    title: "Timeless pieces",
    copy: "Designed for celebrations that last a lifetime."
  },
  {
    icon: Leaf,
    title: "Thoughtful details",
    copy: "Every weave and embellishment chosen with care."
  }
];

const menProofs = [
  {
    icon: Flower2,
    title: "Rooted in Tradition",
    copy: "Inspired by South Indian heritage and rituals."
  },
  {
    icon: Gem,
    title: "Crafted with Purpose",
    copy: "Thoughtfully designed for meaningful celebrations."
  },
  {
    icon: ShieldCheck,
    title: "Trusted by Generations",
    copy: "Made for the milestones families remember."
  },
  {
    icon: Sparkles,
    title: "Made for Today",
    copy: "Modern silhouettes that honor timeless culture."
  }
];

const womenStories = [
  {
    image: "/images/hero-upgrade/green-kids-lehenga-front.webp",
    title: "Temple-border classics",
    copy: "Ceremony silhouettes grounded in South Indian craft."
  },
  {
    image: "/images/hero-upgrade/green-kids-lehenga-maroon-front.webp",
    title: "Made for every milestone",
    copy: "Rich color and graceful detail for her first celebrations."
  },
  {
    image: "/images/hero-upgrade/blue-kids-lehenga-front.webp",
    title: "Silk with a modern ease",
    copy: "Traditional character, considered for movement and comfort."
  }
];

function Heading({ department }: { department: ComingSoonDepartment }) {
  if (department === "women") {
    return (
      <h1 className="ceremony-hero__title">
        <span>A new ceremony</span>
        <span>wardrobe is</span>
        <span className="ceremony-hero__title-accent">taking shape.</span>
      </h1>
    );
  }

  if (department === "men") {
    return (
      <h1 className="ceremony-hero__title">
        <span>The men&apos;s</span>
        <span>ceremony edit</span>
        <span className="ceremony-hero__title-accent">is coming soon.</span>
      </h1>
    );
  }

  return (
    <h1 className="ceremony-hero__title">
      <span>Little gentlemen,</span>
      <span className="ceremony-hero__title-accent">your edit is next.</span>
    </h1>
  );
}

function TempleDivider() {
  return (
    <div className="ceremony-divider" aria-hidden="true">
      <span />
      <Flower2 />
      <span />
    </div>
  );
}

function TempleEdge({ ornamental = false }: { ornamental?: boolean }) {
  if (ornamental) {
    return (
      <svg
        className="ceremony-hero__edge ceremony-hero__edge--temple"
        viewBox="0 0 125 700"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className="ceremony-hero__edge-fill"
          d="M0 0H22C69 3 105 33 105 69C105 83 102 94 95 103C103 111 106 121 106 131C106 145 97 155 82 165C75 176 77 194 86 209L61 218C45 227 38 244 38 261C38 279 47 294 63 304C63 316 73 329 91 339L66 370L50 379L41 382C37 394 36 407 37 418C40 435 53 448 71 459L81 478C76 487 75 497 76 505C78 513 80 518 83 522C95 529 101 540 101 552C101 565 98 574 93 583C101 593 105 604 105 617C105 630 103 641 99 652C95 665 85 673 68 679C54 688 33 696 4 700H0Z"
        />
        <path
          className="ceremony-hero__edge-line"
          d="M22 0C69 3 105 33 105 69C105 83 102 94 95 103C103 111 106 121 106 131C106 145 97 155 82 165C75 176 77 194 86 209L61 218C45 227 38 244 38 261C38 279 47 294 63 304C63 316 73 329 91 339L66 370L50 379L41 382C37 394 36 407 37 418C40 435 53 448 71 459L81 478C76 487 75 497 76 505C78 513 80 518 83 522C95 529 101 540 101 552C101 565 98 574 93 583C101 593 105 604 105 617C105 630 103 641 99 652C95 665 85 673 68 679C54 688 33 696 4 700"
        />
        <g className="ceremony-hero__edge-lotus">
          <path d="M36 346C26 335 26 321 34 311C45 319 49 332 42 342Z" />
          <path d="M34 344C21 348 9 343 4 333C15 324 28 326 37 338Z" />
          <path d="M34 347C30 360 20 368 10 365C8 353 17 343 31 341Z" />
          <path d="M40 342C43 328 54 320 65 323C66 335 57 345 44 347Z" />
          <path d="M43 347C56 348 64 357 62 368C49 372 39 363 36 351Z" />
          <path d="M34 342C37 337 42 337 46 342C46 348 42 352 36 351C32 348 31 345 34 342Z" />
        </g>
      </svg>
    );
  }

  return (
    <svg className="ceremony-hero__edge" viewBox="0 0 150 700" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="ceremony-hero__edge-fill"
        d="M0 0H28C76 0 88 42 80 72C73 97 103 111 118 138C136 172 113 203 84 219C63 231 70 260 100 276C134 295 138 337 112 359C86 382 66 399 87 430C109 462 136 479 116 516C103 540 75 551 78 583C82 625 59 666 13 700H0Z"
      />
      <path
        className="ceremony-hero__edge-line"
        d="M28 0C76 0 88 42 80 72C73 97 103 111 118 138C136 172 113 203 84 219C63 231 70 260 100 276C134 295 138 337 112 359C86 382 66 399 87 430C109 462 136 479 116 516C103 540 75 551 78 583C82 625 59 666 13 700"
      />
    </svg>
  );
}

function Followup({ department }: { department: ComingSoonDepartment }) {
  if (department === "men") {
    return (
      <section className="ceremony-followup ceremony-followup--men">
        <div className="container-page">
          <div className="ceremony-category-prompt">
            <div>
              <p className="ceremony-followup__kicker">Shop the category</p>
              <h2>Move from inspiration to a ceremony-ready look.</h2>
            </div>
            <Link href={LIVE_CATEGORY_PATH} className="ceremony-text-link focus-ring">
              Explore the collection <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="ceremony-proof-rail">
            {menProofs.map((proof) => (
              <div className="ceremony-proof-rail__item" key={proof.title}>
                <proof.icon aria-hidden="true" />
                <div>
                  <h3>{proof.title}</h3>
                  <p>{proof.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (department === "women") {
    return (
      <section className="ceremony-followup ceremony-followup--women">
        <div className="container-page">
          <div className="ceremony-followup__heading">
            <p className="ceremony-followup__kicker">Made for her milestones</p>
            <h2>Beautifully made for her first.</h2>
            <TempleDivider />
          </div>
          <div className="ceremony-story-grid">
            {womenStories.map((story) => (
              <Link className="ceremony-story focus-ring" href={LIVE_CATEGORY_PATH} key={story.title}>
                <span className="ceremony-story__media">
                  <Image src={story.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </span>
                <span className="ceremony-story__copy">
                  <strong>{story.title}</strong>
                  <span>{story.copy}</span>
                </span>
                <ArrowRight className="ceremony-story__arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="ceremony-followup ceremony-followup--women">
      <div className="container-page ceremony-followup__heading">
        <p className="ceremony-followup__kicker">The collection today</p>
        <h2>Made for celebration, ready to be discovered.</h2>
        <TempleDivider />
        <Link className="btn-primary mt-7 gap-2" href={LIVE_CATEGORY_PATH}>
          Shop girls&apos; styles <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export function CeremonyComingSoon({ department }: { department: ComingSoonDepartment }) {
  const collection = comingSoonDepartments[department];
  const theme = department === "men" ? "men" : department === "women" ? "women" : "boys";
  const mailSubject = encodeURIComponent(`${collection.name} updates`);

  return (
    <>
      <section className={`ceremony-hero ceremony-hero--${theme}`}>
        <div className="ceremony-hero__media">
          <Image
            src={collection.image}
            alt={collection.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="ceremony-hero__image"
          />
          <span className="ceremony-hero__image-wash" aria-hidden="true" />
        </div>

        <div className="ceremony-hero__panel">
          <TempleEdge ornamental />
          <div className="ceremony-hero__content">
            <div>
              <p className="ceremony-hero__kicker">Coming soon</p>
              <TempleDivider />
              <Heading department={department} />
              <TempleDivider />
              <p className="ceremony-hero__description">{collection.description}</p>
              <div className="ceremony-hero__actions">
                {department === "women" ? (
                  <>
                    <Link className="ceremony-button ceremony-button--primary focus-ring" href={LIVE_CATEGORY_PATH}>
                      Shop girls&apos; lehenga choli <ArrowRight aria-hidden="true" />
                    </Link>
                    <a className="ceremony-button ceremony-button--outline focus-ring" href={`mailto:${COMPANY.supportEmail}?subject=${mailSubject}`}>
                      <BellRing aria-hidden="true" /> Join updates
                    </a>
                  </>
                ) : (
                  <>
                    <a className="ceremony-button ceremony-button--outline focus-ring" href={`mailto:${COMPANY.supportEmail}?subject=${mailSubject}`}>
                      <BellRing aria-hidden="true" /> Join updates
                    </a>
                    <Link className="ceremony-button ceremony-button--light focus-ring" href={department === "men" ? "/heritage" : LIVE_CATEGORY_PATH}>
                      {department === "men" ? "Explore heritage" : "Shop girls' collection"}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {department === "women" ? (
              <div className="ceremony-hero__proofs">
                {womenProofs.map((proof) => (
                  <div className="ceremony-hero__proof" key={proof.title}>
                    <proof.icon aria-hidden="true" />
                    <div>
                      <h2>{proof.title}</h2>
                      <p>{proof.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="ceremony-hero__bottom-rule" aria-hidden="true">
          <Flower2 />
        </div>
      </section>
      <Followup department={department} />
    </>
  );
}
