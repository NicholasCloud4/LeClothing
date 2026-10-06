import Link from "next/link";

type SectionHeadingProps = {
  id: string;
  eyebrow?: string;
  title: string;
  action?: { label: string; href: string };
};

/** Centered section title with an optional eyebrow and a "view all" style link beneath. */
export function SectionHeading({ id, eyebrow, title, action }: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
      {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
      <h2 id={id} className="heading-2">
        {title}
      </h2>
      {action && (
        <Link href={action.href} className="link mt-1">
          {action.label}
        </Link>
      )}
    </div>
  );
}
