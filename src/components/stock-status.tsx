import { getStockState, type StockState } from "@/lib/catalog";

const dotColor: Record<StockState, string> = {
  in_stock: "bg-success",
  low_stock: "bg-warning",
  out_of_stock: "bg-subtle-foreground",
};

/** Stock indicator: colored dot plus label. `suffix` scopes the message, e.g. "in size M". */
export function StockStatus({ units, suffix, className = "" }: { units: number; suffix?: string; className?: string }) {
  const state = getStockState(units);
  const label = {
    in_stock: "In stock",
    low_stock: `Only ${units} left`,
    out_of_stock: "Out of stock",
  }[state];

  return (
    <p className={`flex items-center gap-2 ${state === "low_stock" ? "text-warning" : ""} ${className}`}>
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${dotColor[state]}`} />
      {suffix ? `${label} ${suffix}` : label}
    </p>
  );
}
