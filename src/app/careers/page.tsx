import type { Metadata } from "next";
import Image from "next/image";
import { ContentPage } from "@/components/content-page";
import { aboutNav, COLUMN_SIZES, unsplash } from "@/app/about/about-links";

export const metadata: Metadata = {
  title: "Careers",
  description: "What working at LE Clothing is like, and how to get in touch about joining the house.",
};

const CAREERS_EMAIL = "careers@example.com";

const teams = [
  {
    title: "Design and studio",
    body: "Developing collections, prints and fits, and working closely with the makers who produce them.",
  },
  {
    title: "Client services",
    body: "Advising clients on sizing, styling and care, and looking after every order from bag to doorstep.",
  },
  {
    title: "Operations",
    body: "Stock, fulfilment and the systems behind the shop, kept simple so the rest of the house can move quickly.",
  },
];

export default function CareersPage() {
  return (
    <ContentPage
      eyebrow="The House"
      title="Careers"
      intro="We are a small team, so everyone's work shows. If you care about how clothes are made and how people are looked after, we would like to hear from you."
      nav={aboutNav("/careers")}
    >
      <figure>
        <div className="media-frame aspect-editorial">
          <Image
            src={unsplash("1441984904996-e0b6ba687e04", 2000, 1125)}
            alt="Boutique interior with hanging rails of clothing under pendant lights"
            fill
            sizes={COLUMN_SIZES}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </figure>

      <div className="prose-content mt-12">
        <h2>Working at the house</h2>
        <p>
          We make a small number of pieces and take each one seriously, and we work the same way. Teams are small,
          decisions are made close to the work, and we would rather do fewer things well than many things quickly.
        </p>
        <p>
          We look for people who are curious about materials and making, precise in their work, and kind to clients.
        </p>
      </div>

      <section aria-labelledby="careers-teams-title" className="mt-12">
        <h2 id="careers-teams-title" className="heading-2">
          Where people work
        </h2>
        <ul className="mt-8 grid gap-x-grid-x gap-y-8 sm:grid-cols-3">
          {teams.map((team) => (
            <li key={team.title} className="border-t pt-5">
              <h3 className="heading-3">{team.title}</h3>
              <p className="mt-2 text-muted-foreground">{team.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="prose-content mt-12">
        <h2>Open roles</h2>
        <p>
          When we are hiring, open roles are posted on this page with a full description and how to apply. There are no
          open roles listed at the moment.
        </p>

        <h2>Get in touch</h2>
        <p>
          You are welcome to write to us at any time. Send a short note about yourself and the kind of work you are
          interested in, with your CV or portfolio, to <a href={`mailto:${CAREERS_EMAIL}`}>{CAREERS_EMAIL}</a>. We read
          every message.
        </p>
      </div>

      <a href={`mailto:${CAREERS_EMAIL}`} className="btn btn-secondary mt-8">
        Email the careers team
      </a>
    </ContentPage>
  );
}
