/**
 * Scale a quantity string by a multiplier.
 * Handles: "150g", "4", "2 c. à soupe", "1/2", "quelques feuilles"
 */
export function scaleQuantity(quantity: string, multiplier: number): string {
  if (multiplier === 1) return quantity;

  // Match optional fraction or decimal at the start
  const fractionMatch = quantity.match(/^(\d+)\/(\d+)(.*)/);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
    const rest = fractionMatch[3];
    return formatNumber(num * multiplier) + rest;
  }

  const numMatch = quantity.match(/^(\d+(?:[.,]\d+)?)(.*)/);
  if (!numMatch) return quantity; // "quelques", "PM", etc. — untouched

  const num = parseFloat(numMatch[1].replace(",", "."));
  const rest = numMatch[2];

  return formatNumber(num * multiplier) + rest;
}

function formatNumber(n: number): string {
  // Round to nearest quarter for readability (0.25 steps)
  const rounded = Math.round(n * 4) / 4;

  if (rounded % 1 === 0) return rounded.toString();

  // Nice fractions
  const frac = rounded % 1;
  const whole = Math.floor(rounded);
  if (frac === 0.5) return whole > 0 ? `${whole}½` : "½";
  if (frac === 0.25) return whole > 0 ? `${whole}¼` : "¼";
  if (frac === 0.75) return whole > 0 ? `${whole}¾` : "¾";

  // Fallback: 1 decimal
  return rounded.toFixed(1).replace(".", ",");
}

/** Parse the number out of a servings string like "4 personnes" or "8 parts" */
export function parseServings(servings: string): number {
  const m = servings.match(/\d+/);
  return m ? parseInt(m[0]) : 4;
}
