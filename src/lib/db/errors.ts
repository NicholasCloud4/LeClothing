// Helpers for recognising specific database failures. Drizzle wraps the driver error, so look through `cause`.

/** True when a stock decrement hit the `quantity >= 0` check, i.e. someone else bought the last unit. */
export function isOutOfStockError(error: unknown) {
  for (let current = error, depth = 0; current && depth < 5; depth++) {
    const { message, code, constraint, cause } = current as {
      message?: string;
      code?: string;
      constraint?: string;
      cause?: unknown;
    };
    if (
      constraint === "product_stock_quantity_non_negative" ||
      message?.includes("product_stock_quantity_non_negative")
    ) {
      return true;
    }
    if (code === "23514" && message?.includes("product_stock")) return true;
    current = cause;
  }
  return false;
}
