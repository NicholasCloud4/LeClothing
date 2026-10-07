// Boutique directory for /stores. Static, client-safe data.
// PLACEHOLDER: every boutique, address and phone number here is fictional (555 numbers); replace with real locations.

export type Boutique = {
  slug: string;
  name: string;
  /** Address lines, top to bottom. */
  address: string[];
  phone: string;
  hours: { days: string; time: string }[];
  services: string[];
};

export const STORES: Boutique[] = [
  {
    slug: "new-york",
    name: "New York",
    address: ["100 Example Avenue", "New York, NY 10000", "United States"],
    phone: "+1 (555) 010-0110",
    hours: [
      { days: "Monday – Saturday", time: "10:00 – 19:00" },
      { days: "Sunday", time: "12:00 – 18:00" },
    ],
    services: ["Private styling appointments", "Complimentary alterations", "Gift wrapping"],
  },
  {
    slug: "london",
    name: "London",
    address: ["20 Placeholder Row", "London EC0 0AA", "United Kingdom"],
    phone: "+44 (555) 010-0120",
    hours: [
      { days: "Monday – Saturday", time: "10:00 – 19:00" },
      { days: "Sunday", time: "12:00 – 18:00" },
    ],
    services: ["Private styling appointments", "Complimentary alterations", "Gift wrapping"],
  },
  {
    slug: "paris",
    name: "Paris",
    address: ["30 Rue de l'Exemple", "75000 Paris", "France"],
    phone: "+33 (555) 010-0130",
    hours: [
      { days: "Monday – Saturday", time: "10:30 – 19:30" },
      { days: "Sunday", time: "Closed" },
    ],
    services: ["Private styling appointments", "Complimentary alterations"],
  },
];
