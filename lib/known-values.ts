/**
 * Known values for the 8 diversity dimensions used in WristList.
 * These are the canonical options for each attribute — used for
 * form dropdowns, diversity scoring, and gap analysis.
 */

export const KNOWN = {
  movement: ["automatic", "quartz", "battery", "solar", "manual wind", "spring drive"],
  category: [
    "diver",
    "pilot",
    "dress",
    "field",
    "chronograph",
    "digital",
    "gmt",
  ],
  bracelet_type: [
    "steel bracelet",
    "leather strap",
    "resin strap",
    "rubber strap",
    "nato strap",
    "mesh bracelet",
    "textile strap",
  ],
  shape: ["round", "rectangular", "square", "tonneau", "cushion"],
  color: ["black", "white", "blue", "green", "gold", "silver", "brown", "gray"],
  crystal: ["sapphire", "mineral", "hesalite", "acrylic"],
  origin: ["Swiss", "Japanese", "German", "American", "Chinese"],
  case_back: ["solid", "display", "exhibition", "skeleton"],
} as const;

/** Union helper — pulls the literal values out of a KNOWN key */
export type KnownValues<K extends keyof typeof KNOWN> =
  (typeof KNOWN)[K][number];

/** Human-friendly labels for each dimension (used in UI headings, charts, etc.) */
export const DIMENSION_LABELS: Record<keyof typeof KNOWN, string> = {
  movement: "Movement",
  category: "Category",
  bracelet_type: "Bracelet Type",
  shape: "Case Shape",
  color: "Dial Color",
  crystal: "Crystal",
  origin: "Origin",
  case_back: "Case Back",
};

/** All 8 dimension keys as an array. */
export const DIMENSIONS = Object.keys(KNOWN) as (keyof typeof KNOWN)[];

/** Convenience type for a single dimension key. */
export type Dimension = keyof typeof KNOWN;
