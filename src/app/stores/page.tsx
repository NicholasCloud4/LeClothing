import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { boutique } from "@/lib/content";
import { STORES } from "@/lib/stores";

export const metadata: Metadata = {
  title: "Boutiques",
  description: "Find an LE Clothing boutique: addresses, opening hours and in-store services.",
};

/** `tel:` link target: digits and a leading plus only. */
function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function StoresPage() {
  return (
    <ContentPage eyebrow={boutique.eyebrow} title={boutique.title} intro={boutique.body}>
      <div className="media-frame aspect-editorial">
        <Image
          src={boutique.image.src}
          alt={boutique.image.alt}
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <ul className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {STORES.map((store) => (
          <li key={store.slug}>
            <article aria-labelledby={`store-${store.slug}`} className="flex h-full flex-col gap-6 border-t pt-6">
              <h2 id={`store-${store.slug}`} className="heading-2">
                {store.name}
              </h2>

              <address className="text-muted-foreground not-italic">
                {store.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <a href={telHref(store.phone)} className="link mt-2 inline-block text-foreground">
                  {store.phone}
                </a>
              </address>

              <div>
                <h3 className="heading-3">Opening hours</h3>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-muted-foreground">
                  {store.hours.map((entry) => (
                    <div key={entry.days} className="contents">
                      <dt>{entry.days}</dt>
                      <dd className="price">{entry.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className="heading-3">Services</h3>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
                  {store.services.map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <section aria-labelledby="appointments-title" className="surface-muted mt-16 px-gutter py-12 text-center">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5">
          <h2 id="appointments-title" className="heading-2">
            Book a Private Appointment
          </h2>
          <p className="text-muted-foreground">
            Our client advisors can set aside time and a selection of pieces for you at any boutique.
          </p>
          <Link href="/contact" className="btn btn-primary mt-2">
            Contact client services
          </Link>
        </div>
      </section>
    </ContentPage>
  );
}
