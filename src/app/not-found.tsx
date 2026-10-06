import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell-narrow section flex min-h-[60svh] flex-col items-center justify-center gap-5 text-center">
      <p className="eyebrow text-muted-foreground">Page not found</p>
      <h1 className="heading-1">We couldn&apos;t find that page</h1>
      <p className="text-muted-foreground">The piece you&apos;re looking for may have moved or is no longer available.</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary">
          Return to homepage
        </Link>
        <Link href="/collections/new-arrivals" className="btn btn-secondary">
          Shop new arrivals
        </Link>
      </div>
    </section>
  );
}
