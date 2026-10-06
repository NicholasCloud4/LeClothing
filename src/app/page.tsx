import Image from "next/image";
import Link from "next/link";
import { ChatIcon, GiftIcon, ReturnIcon, TruckIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { SectionHeading } from "@/components/section-heading";
import { boutique, collections, essentials, features, hero, newArrivals } from "@/lib/catalog";

const services = [
  { icon: TruckIcon, title: "Complimentary Shipping", body: "On every order, delivered in signature packaging." },
  { icon: ReturnIcon, title: "Easy Returns", body: "Return or exchange within 30 days, free of charge." },
  { icon: GiftIcon, title: "Gift Wrapping", body: "Add a handwritten note and our signature box at checkout." },
  { icon: ChatIcon, title: "Client Advisors", body: "Styling advice by chat, phone or appointment." },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <NewArrivals />
      <FeaturedCollections />
      <Essentials />
      <Boutique />
      <Services />
      <Newsletter />
    </>
  );
}

function Hero() {
  const [left, right] = hero.images;

  return (
    <section aria-labelledby="hero-title" className="hero justify-items-center pb-12 text-center md:pb-16">
      {/* Diptych on desktop; a single portrait frame on phones. */}
      <div className="absolute inset-0 -z-10 grid md:grid-cols-2">
        <div className="relative hidden md:block">
          <Image
            src={left.src}
            alt={left.alt}
            fill
            sizes="50vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-top"
          />
        </div>
        <div className="relative">
          <Image
            src={right.src}
            alt={right.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-top"
          />
        </div>
      </div>

      <div className="flex max-w-2xl flex-col items-center gap-5">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title" className="text-display">
          {hero.title}
        </h1>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link href={hero.cta.href} className="btn btn-primary">
            {hero.cta.label}
          </Link>
          <Link href="/collections/new-arrivals" className="btn btn-secondary">
            Shop new arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section aria-labelledby="categories-title" className="shell section">
      <SectionHeading id="categories-title" eyebrow="Explore" title="Shop by Category" />
      <ul className="grid grid-cols-2 gap-x-grid-x gap-y-8 md:grid-cols-4">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link href={`/collections/${collection.slug}`} className="group block text-center">
              <div className="media-frame">
                <Image
                  src={collection.image.src}
                  alt={collection.image.alt}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                />
              </div>
              <span className="mt-4 inline-block text-base underline decoration-transparent decoration-1 underline-offset-[0.3em] transition-colors group-hover:decoration-current">
                {collection.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NewArrivals() {
  return (
    <section aria-labelledby="new-arrivals-title" className="shell section border-t">
      <SectionHeading
        id="new-arrivals-title"
        eyebrow="Just In"
        title="New Arrivals"
        action={{ label: "View all new arrivals", href: "/collections/new-arrivals" }}
      />
      <ul className="product-grid">
        {newArrivals.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeaturedCollections() {
  return (
    <section aria-label="Featured collections">
      {features.map((feature, index) => (
        <article key={feature.title} className="grid md:grid-cols-2">
          <div className={`media-frame aspect-portrait xl:aspect-square ${index % 2 === 1 ? "md:order-last" : ""}`}>
            <Image src={feature.image.src} alt={feature.image.alt} fill sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
          <div className="surface-muted flex items-center justify-center px-gutter py-section">
            <div className="flex max-w-sm flex-col items-center gap-5 text-center">
              <p className="eyebrow text-muted-foreground">{feature.eyebrow}</p>
              <h2 className="heading-1">{feature.title}</h2>
              <p className="text-base text-muted-foreground">{feature.body}</p>
              <Link href={feature.cta.href} className="btn btn-secondary mt-3">
                {feature.cta.label}
              </Link>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function Essentials() {
  return (
    <section aria-labelledby="essentials-title" className="shell section">
      <SectionHeading
        id="essentials-title"
        eyebrow="Wardrobe Foundations"
        title="The Essentials"
        action={{ label: "Shop the essentials", href: "/collections/essentials" }}
      />
      <ProductRail label="The Essentials">
        {essentials.map((product) => (
          <li
            key={product.slug}
            className="w-[72%] shrink-0 snap-start sm:w-[42%] md:w-[calc((100%-2*var(--grid-gap-x))/3)] xl:w-[calc((100%-3*var(--grid-gap-x))/4)]"
          >
            <ProductCard product={product} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 72vw" />
          </li>
        ))}
      </ProductRail>
    </section>
  );
}

function Boutique() {
  return (
    <section
      aria-labelledby="boutique-title"
      // Centered copy needs an even scrim across the frame, not just the bottom gradient.
      className="hero min-h-[min(80svh,52rem)] content-center justify-items-center text-center after:bg-ink/55"
    >
      <Image src={boutique.image.src} alt={boutique.image.alt} fill sizes="100vw" className="hero-media" />
      <div className="flex max-w-lg flex-col items-center gap-5">
        <p className="eyebrow">{boutique.eyebrow}</p>
        <h2 id="boutique-title" className="heading-1">
          {boutique.title}
        </h2>
        <p className="text-base">{boutique.body}</p>
        <Link href={boutique.cta.href} className="btn btn-primary mt-3">
          {boutique.cta.label}
        </Link>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section aria-label="Our services" className="shell section-tight">
      <ul className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col items-center gap-3 text-center">
            <Icon width={28} height={28} />
            <h3 className="heading-3">{title}</h3>
            <p className="max-w-60 text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Newsletter() {
  return (
    <section aria-labelledby="newsletter-title" className="surface-muted section">
      <div className="shell-narrow flex flex-col items-center gap-5 text-center">
        <h2 id="newsletter-title" className="heading-2">
          Stay in Touch
        </h2>
        <p className="text-muted-foreground">
          Be the first to hear about new collections, private events and the stories behind our pieces.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
