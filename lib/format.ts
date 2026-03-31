/**
 * Format a price as a compact string, e.g. "$1.2k" or "$12k".
 * Returns "$0" for zero/undefined.
 */
export function formatPrice(price: number | undefined | null): string {
  if (!price) return "$0";
  if (price >= 1000) {
    const k = price / 1000;
    // Show one decimal only if it's not a round number
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${price}`;
}

/**
 * Format a price as a full dollar string with commas, e.g. "$1,200".
 * Returns "$0" for zero/undefined.
 */
export function formatPriceFull(price: number | undefined | null): string {
  if (!price) return "$0";
  return `$${price.toLocaleString("en-US")}`;
}
