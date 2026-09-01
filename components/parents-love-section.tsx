import Image from "next/image";
import { HandHeart, type LucideIcon } from "lucide-react";

type TrustFeature =
  | {
      kind: "image";
      title: string;
      image: string;
      imageClassName?: string;
    }
  | {
      kind: "icon";
      title: string;
      icon: LucideIcon;
    };

const parentFeatures: TrustFeature[] = [
  {
    kind: "image",
    title: "Made in India",
    image: "/images/icons/trust/made-in-india-lion.webp",
    imageClassName: "parents-love-feature__image--wide"
  },
  {
    kind: "image",
    title: "Assured Quality",
    image: "/images/icons/trust/assured-quality.png"
  },
  {
    kind: "image",
    title: "Secure Payments",
    image: "/images/icons/trust/secure-payments.png",
    imageClassName: "parents-love-feature__image--wide"
  },
  {
    kind: "icon",
    title: "Empowering Weavers",
    icon: HandHeart
  }
];

export function ParentsLoveSection() {
  return (
    <section className="parents-love-section" aria-label="AMZIRA parent trust features">
      <div className="container-page">
        <div className="parents-love-grid">
          {parentFeatures.map((feature) => (
            <article key={feature.title} className="parents-love-feature">
              {feature.kind === "image" ? (
                <span className="parents-love-feature__image-wrap">
                  <Image
                    src={feature.image}
                    alt=""
                    width={140}
                    height={96}
                    unoptimized={feature.image.startsWith("/images/") || feature.image.startsWith("https://cdn.amzira.com/")}
                    sizes="(min-width: 768px) 140px, 110px"
                    className={["parents-love-feature__image", feature.imageClassName].filter(Boolean).join(" ")}
                  />
                </span>
              ) : (
                <feature.icon className="parents-love-feature__icon" aria-hidden="true" />
              )}
              <h3>{feature.title}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
