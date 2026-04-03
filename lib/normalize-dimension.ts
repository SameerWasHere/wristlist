import { KNOWN, type Dimension } from "./known-values";

/**
 * Maps camelCase field names (used in API bodies and DB columns)
 * to the KNOWN dimension keys used in analytics.
 */
const FIELD_TO_DIMENSION: Record<string, Dimension> = {
  movement: "movement",
  category: "category",
  braceletType: "bracelet_type",
  shape: "shape",
  color: "color",
  crystal: "crystal",
  origin: "origin",
  caseBack: "case_back",
};

/** Common aliases that users might type instead of canonical values. */
const ALIASES: Partial<Record<Dimension, Record<string, string>>> = {
  movement: {
    auto: "automatic",
    "hand-wound": "manual wind",
    "hand wound": "manual wind",
    handwound: "manual wind",
    kinetic: "automatic",
    "self-winding": "automatic",
    "self winding": "automatic",
  },
  case_back: {
    "see-through": "exhibition",
    "see through": "exhibition",
    open: "display",
    transparent: "exhibition",
    closed: "solid",
  },
  color: {
    grey: "gray",
    cream: "white",
    champagne: "gold",
    slate: "gray",
    navy: "blue",
  },
  crystal: {
    "sapphire crystal": "sapphire",
    "mineral glass": "mineral",
    "mineral crystal": "mineral",
    plexiglass: "acrylic",
    plexi: "acrylic",
    plastic: "acrylic",
  },
  bracelet_type: {
    "metal bracelet": "steel bracelet",
    bracelet: "steel bracelet",
    leather: "leather strap",
    rubber: "rubber strap",
    nato: "nato strap",
    canvas: "textile strap",
    fabric: "textile strap",
    nylon: "textile strap",
    mesh: "mesh bracelet",
    milanese: "mesh bracelet",
  },
};

/**
 * Normalize a dimension field value to its canonical KNOWN form.
 *
 * - Exact match (case-insensitive) → return canonical value
 * - Alias match → return canonical value
 * - Substring containment → return canonical value
 * - No match → return trimmed original (don't reject unknown values)
 */
export function normalizeDimensionValue(
  field: string,
  value: string | null | undefined,
): string | null {
  if (!value || !value.trim()) return null;

  const dim = FIELD_TO_DIMENSION[field];
  if (!dim) return value.trim(); // Not a dimension field, pass through

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  const knownValues = KNOWN[dim] as readonly string[];

  // 1. Exact match (case-insensitive)
  const exact = knownValues.find((k) => k.toLowerCase() === lower);
  if (exact) return exact;

  // 2. Alias lookup
  const dimAliases = ALIASES[dim];
  if (dimAliases && lower in dimAliases) {
    return dimAliases[lower];
  }

  // 3. Substring containment (e.g., "sapphire crystal" → "sapphire")
  for (const k of knownValues) {
    const kl = k.toLowerCase();
    if (lower.includes(kl) || kl.includes(lower)) return k;
  }

  // 4. No match — store as-is
  return trimmed;
}

/** The dimension field names that should be normalized. */
export const DIMENSION_FIELDS = Object.keys(FIELD_TO_DIMENSION);
