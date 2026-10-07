import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";
import { helpNav } from "../help-links";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Body measurements for LE Clothing women's, men's, tailoring and shoe sizes.",
};

/** A body measurement range in centimetres. */
type Range = [min: number, max: number];

type SizeTable = {
  id: string;
  title: string;
  note: string;
  /** Column headers after the size column. Ranges are rendered in cm with inches beneath. */
  columns: string[];
  rows: { size: string; cells: (string | Range)[] }[];
};

const tables: SizeTable[] = [
  {
    id: "women",
    title: "Women's clothing",
    note: "Coats, knitwear, dresses and separates.",
    columns: ["US", "UK", "EU", "Bust", "Waist", "Hips"],
    rows: [
      { size: "XS", cells: ["0–2", "4–6", "32–34", [80, 83], [62, 65], [87, 90]] },
      { size: "S", cells: ["4–6", "8–10", "36–38", [84, 88], [66, 70], [91, 95]] },
      { size: "M", cells: ["8–10", "12–14", "40–42", [89, 94], [71, 76], [96, 101]] },
      { size: "L", cells: ["12–14", "16–18", "44–46", [95, 101], [77, 83], [102, 108]] },
      { size: "XL", cells: ["16", "20", "48", [102, 108], [84, 90], [109, 115]] },
    ],
  },
  {
    id: "men",
    title: "Men's clothing",
    note: "Tees, knitwear, shirts and outerwear.",
    columns: ["Chest", "Waist", "Neck"],
    rows: [
      {
        size: "S",
        cells: [
          [88, 94],
          [76, 82],
          [37, 38],
        ],
      },
      {
        size: "M",
        cells: [
          [95, 101],
          [83, 89],
          [39, 40],
        ],
      },
      {
        size: "L",
        cells: [
          [102, 108],
          [90, 96],
          [41, 42],
        ],
      },
      {
        size: "XL",
        cells: [
          [109, 115],
          [97, 103],
          [43, 44],
        ],
      },
      {
        size: "XXL",
        cells: [
          [116, 122],
          [104, 110],
          [45, 46],
        ],
      },
    ],
  },
  {
    id: "tailoring",
    title: "Men's tailoring",
    note: "Suits and jackets are sized in European (Italian) sizes. Trousers come unhemmed.",
    columns: ["US / UK", "Chest", "Waist"],
    rows: [
      { size: "46", cells: ["36", [90, 93], [78, 81]] },
      { size: "48", cells: ["38", [94, 97], [82, 85]] },
      { size: "50", cells: ["40", [98, 101], [86, 89]] },
      { size: "52", cells: ["42", [102, 105], [90, 93]] },
      { size: "54", cells: ["44", [106, 109], [94, 97]] },
    ],
  },
  {
    id: "shoes",
    title: "Shoes",
    note: "Shoes are sized in European sizes. Measure your foot from heel to longest toe.",
    columns: ["US", "UK", "Foot length"],
    rows: [
      { size: "36", cells: ["6", "3", "23 cm"] },
      { size: "37", cells: ["7", "4", "23.7 cm"] },
      { size: "38", cells: ["8", "5", "24.4 cm"] },
      { size: "39", cells: ["9", "6", "25 cm"] },
      { size: "40", cells: ["10", "7", "25.7 cm"] },
      { size: "41", cells: ["11", "8", "26.4 cm"] },
    ],
  },
];

/** Centimetres to inches, rounded to the nearest half inch. */
function inches(cm: number) {
  return Math.round((cm / 2.54) * 2) / 2;
}

function Measurement({ value }: { value: string | Range }) {
  if (typeof value === "string") return value;
  const [min, max] = value;
  return (
    <>
      {min}–{max} cm
      <span className="block text-xs text-muted-foreground">
        {inches(min)}–{inches(max)} in
      </span>
    </>
  );
}

export default function SizeGuidePage() {
  return (
    <ContentPage
      eyebrow="Client Services"
      title="Size Guide"
      intro="The measurements below are body measurements, not garment measurements. If you are between sizes, we suggest the larger size for a relaxed fit."
      nav={helpNav("/help/size-guide")}
    >
      <div className="prose-content">
        <h2>How to measure</h2>
        <ul>
          <li>
            <strong>Bust or chest:</strong> around the fullest part, keeping the tape level under your arms.
          </li>
          <li>
            <strong>Waist:</strong> around the narrowest part of your natural waistline.
          </li>
          <li>
            <strong>Hips:</strong> around the fullest part, with your feet together.
          </li>
          <li>
            <strong>Neck:</strong> around the base of the neck, where a shirt collar sits.
          </li>
        </ul>
        <p>
          A product&apos;s Details &amp; Care notes often describe its fit, such as a relaxed or slim cut, and sometimes
          the size the model wears.
        </p>
      </div>

      {tables.map((table) => (
        <section key={table.id} aria-labelledby={`size-${table.id}`} className="mt-16 max-w-3xl">
          <h2 id={`size-${table.id}`} className="heading-2">
            {table.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{table.note}</p>
          <div className="mt-6 overflow-x-auto">
            <table aria-labelledby={`size-${table.id}`} className="w-full min-w-lg border-collapse text-left">
              <thead>
                <tr className="border-b">
                  <th scope="col" className="eyebrow py-3 pr-6 font-medium text-muted-foreground">
                    Size
                  </th>
                  {table.columns.map((column) => (
                    <th key={column} scope="col" className="eyebrow py-3 pr-6 font-medium text-muted-foreground">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row) => (
                  <tr key={row.size} className="border-b align-top">
                    <th scope="row" className="py-4 pr-6 font-medium">
                      {row.size}
                    </th>
                    {row.cells.map((cell, index) => (
                      <td key={table.columns[index]} className="py-4 pr-6 whitespace-nowrap">
                        <Measurement value={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <div className="prose-content mt-16">
        <h2>One size</h2>
        <p>Pieces marked &ldquo;One size&rdquo; are cut to fit a range of figures, so there is no size to choose.</p>
        <h2>Still unsure?</h2>
        <p>
          A client advisor can recommend a size for a specific piece.{" "}
          <Link href="/contact">Contact client services</Link>, and if the fit isn&apos;t right, you can{" "}
          <Link href="/help/returns">exchange it free of charge</Link>.
        </p>
      </div>
    </ContentPage>
  );
}
