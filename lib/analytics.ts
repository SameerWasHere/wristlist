import { KNOWN, DIMENSIONS, DIMENSION_LABELS, type Dimension } from "./known-values";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalyticsWatch {
  movement: string;
  category: string;
  bracelet_type: string;
  shape: string;
  color: string;
  crystal: string;
  origin: string;
  case_back: string;
  water_resistance_m: number;
  price: number;
  brand: string;
  model: string;
}

export interface DimensionGap {
  dimension: Dimension;
  label: string;
  owned: string[];
  wishlistFills: string[];
  stillMissing: string[];
  total: number;
}

export interface RankedWatch {
  watch: AnalyticsWatch;
  gapsFilled: number;
  efficiency: number;
}

export interface PersonalityResult {
  archetype: string;
  description: string;
  tags: PersonalityTag[];
}

export interface PersonalityTag {
  text: string;
  variant: "primary" | "secondary";
}

export interface RadarPoint {
  dimension: Dimension;
  label: string;
  currentPercent: number;
  projectedPercent: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the set of unique values a collection has for each dimension. */
function collectValues(watches: AnalyticsWatch[]): Record<Dimension, Set<string>> {
  const result = {} as Record<Dimension, Set<string>>;
  for (const dim of DIMENSIONS) {
    result[dim] = new Set<string>();
  }
  for (const w of watches) {
    for (const dim of DIMENSIONS) {
      const val = w[dim];
      if (val != null && val !== "") {
        result[dim].add(String(val).toLowerCase());
      }
    }
  }
  return result;
}

/** Normalise KNOWN values to lowercase for comparison. */
function knownLower(dim: Dimension): string[] {
  return (KNOWN[dim] as readonly string[]).map((v) => v.toLowerCase());
}

/** Find the mode (most frequent value) of an array. */
function mode(values: string[]): string {
  const counts: Record<string, number> = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  let best = "";
  let bestCount = 0;
  for (const [v, c] of Object.entries(counts)) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// 1. diversityScore
// ---------------------------------------------------------------------------

/**
 * Calculate a 0-100 diversity score across 8 dimensions.
 * For each dimension, count how many KNOWN values are present in the collection.
 * Score = totalPresent / totalPossible * 100.
 */
export function diversityScore(watches: AnalyticsWatch[]): number {
  if (watches.length === 0) return 0;

  const vals = collectValues(watches);
  let totalPresent = 0;
  let totalPossible = 0;

  for (const dim of DIMENSIONS) {
    const known = knownLower(dim);
    totalPossible += known.length;
    for (const k of known) {
      if (vals[dim].has(k)) {
        totalPresent++;
      }
    }
  }

  if (totalPossible === 0) return 0;
  return Math.round((totalPresent / totalPossible) * 100);
}

// ---------------------------------------------------------------------------
// 2. gapAnalysis
// ---------------------------------------------------------------------------

/**
 * Per dimension: which values are owned, which the wishlist fills, which are
 * still missing. Only considers values present in KNOWN.
 */
export function gapAnalysis(
  collection: AnalyticsWatch[],
  wishlist: AnalyticsWatch[]
): DimensionGap[] {
  const collectionVals = collectValues(collection);
  const wishlistVals = collectValues(wishlist);

  return DIMENSIONS.map((dim) => {
    const known = knownLower(dim);
    const owned: string[] = [];
    const wishlistFills: string[] = [];
    const stillMissing: string[] = [];

    for (const k of known) {
      if (collectionVals[dim].has(k)) {
        owned.push(k);
      } else if (wishlistVals[dim].has(k)) {
        wishlistFills.push(k);
      } else {
        stillMissing.push(k);
      }
    }

    return {
      dimension: dim,
      label: DIMENSION_LABELS[dim] || dim,
      owned,
      wishlistFills,
      stillMissing,
      total: known.length,
    };
  });
}

// ---------------------------------------------------------------------------
// 3. gapCount
// ---------------------------------------------------------------------------

/**
 * Count how many KNOWN attributes a single watch has that the collection
 * currently does NOT have.
 */
export function gapCount(
  watch: AnalyticsWatch,
  collectionValues: Record<Dimension, Set<string>>
): number {
  let count = 0;
  for (const dim of DIMENSIONS) {
    const val = watch[dim];
    if (val == null || val === "") continue;
    const normalised = String(val).toLowerCase();
    const known = knownLower(dim);
    if (known.includes(normalised) && !collectionValues[dim].has(normalised)) {
      count++;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// 4. nextBestPurchase
// ---------------------------------------------------------------------------

/**
 * Rank wishlist watches by gaps filled (descending).
 */
export function nextBestPurchase(
  collection: AnalyticsWatch[],
  wishlist: AnalyticsWatch[]
): RankedWatch[] {
  const collectionVals = collectValues(collection);

  return wishlist
    .map((watch) => {
      const gaps = gapCount(watch, collectionVals);
      return {
        watch,
        gapsFilled: gaps,
        efficiency: gaps,
      };
    })
    .sort((a, b) => b.gapsFilled - a.gapsFilled);
}

// ---------------------------------------------------------------------------
// 5. personality
// ---------------------------------------------------------------------------

/**
 * Generate a collector personality: archetype name, description, and DNA tags.
 */
export function personality(watches: AnalyticsWatch[]): PersonalityResult {
  if (watches.length === 0) {
    return {
      archetype: "The Blank Canvas",
      description: "Start your collection to discover your collector personality.",
      tags: [],
    };
  }

  // Find modal values
  const topCategory = mode(watches.map((w) => w.category?.toLowerCase() ?? ""));
  const topMovement = mode(watches.map((w) => w.movement?.toLowerCase() ?? ""));
  const topBracelet = mode(watches.map((w) => w.bracelet_type?.toLowerCase() ?? ""));
  const topOrigin = mode(watches.map((w) => w.origin?.toLowerCase() ?? ""));
  const topColor = mode(watches.map((w) => w.color?.toLowerCase() ?? ""));
  const topShape = mode(watches.map((w) => w.shape?.toLowerCase() ?? ""));

  // Categories and movements present
  const categories = new Set(watches.map((w) => w.category?.toLowerCase()).filter(Boolean));
  const movements = new Set(watches.map((w) => w.movement?.toLowerCase()).filter(Boolean));

  const score = diversityScore(watches);

  // Determine archetype
  let archetype = "The Collector";
  if (watches.length >= 10 && score >= 80) {
    archetype = "The Completionist";
  } else if (topMovement === "automatic" && !categories.has("dress")) {
    archetype = "The Mechanical Purist";
  } else if (topCategory === "diver") {
    archetype = "The Deep Diver";
  } else if (topCategory === "dress") {
    archetype = "The Dress Code";
  } else if (topCategory === "pilot") {
    archetype = "The Aviator";
  } else if (topCategory === "field") {
    archetype = "The Explorer";
  } else if (topCategory === "chronograph") {
    archetype = "The Racer";
  }

  // Build description
  // Collect missing categories, movements, colors for suggestion sentences
  const missingCategories = knownLower("category").filter((c) => !categories.has(c));
  const missingMovements = knownLower("movement").filter((m) => !movements.has(m));
  const colors = new Set(watches.map((w) => w.color?.toLowerCase()).filter(Boolean));
  const missingColors = knownLower("color").filter((c) => !colors.has(c));

  let description =
    `Your collection leans ${topCategory} and ${secondMode(watches.map((w) => w.category?.toLowerCase() ?? ""), topCategory)}, ` +
    `powered by ${topMovement} movements on ${topBracelet}s. ` +
    `You favor ${topOrigin} craftsmanship with ${topColor} dials in ${topShape} cases.`;

  if (missingCategories.length > 0) {
    description += ` Consider exploring ${missingCategories.slice(0, 3).join(", ")} categories.`;
  }
  if (missingMovements.length > 0) {
    description += ` You're missing ${missingMovements.slice(0, 2).join(" and ")} movements.`;
  }
  if (missingColors.length > 0) {
    description += ` Adding ${missingColors.slice(0, 2).join(" or ")} dials would add variety.`;
  }

  // DNA tags
  const tags: PersonalityTag[] = [];

  // 1. top category collector (primary)
  tags.push({ text: `${topCategory} collector`, variant: "primary" });

  // 2. movement tag (primary)
  if (topMovement === "automatic") {
    tags.push({ text: "mechanical purist", variant: "primary" });
  } else {
    tags.push({ text: `${topMovement} fan`, variant: "primary" });
  }

  // 3. origin (secondary)
  tags.push({ text: `${topOrigin} made`, variant: "secondary" });

  // 4. water ready (secondary)
  if (watches.some((w) => (w.water_resistance_m ?? 0) >= 200)) {
    tags.push({ text: "water ready", variant: "secondary" });
  }

  // 5. versatile (secondary)
  if (categories.has("dress") || categories.has("digital")) {
    tags.push({ text: "versatile", variant: "secondary" });
  }

  return { archetype, description, tags };
}

/** Get the second most common value (for description text). */
function secondMode(values: string[], excludeTop: string): string {
  const filtered = values.filter((v) => v !== excludeTop);
  if (filtered.length === 0) return excludeTop;
  return mode(filtered) || excludeTop;
}

// ---------------------------------------------------------------------------
// 6. radarData
// ---------------------------------------------------------------------------

/**
 * For each of 8 dimensions: current coverage % (collection only) and
 * projected coverage % (collection + wishlist).
 */
export function radarData(
  collection: AnalyticsWatch[],
  wishlist: AnalyticsWatch[]
): RadarPoint[] {
  const collectionVals = collectValues(collection);
  const combinedVals = collectValues([...collection, ...wishlist]);

  return DIMENSIONS.map((dim) => {
    const known = knownLower(dim);
    const total = known.length;
    if (total === 0) {
      return {
        dimension: dim,
        label: DIMENSION_LABELS[dim] || dim,
        currentPercent: 0,
        projectedPercent: 0,
      };
    }

    let currentCount = 0;
    let projectedCount = 0;
    for (const k of known) {
      if (collectionVals[dim].has(k)) currentCount++;
      if (combinedVals[dim].has(k)) projectedCount++;
    }

    return {
      dimension: dim,
      label: DIMENSION_LABELS[dim] || dim,
      currentPercent: Math.round((currentCount / total) * 100),
      projectedPercent: Math.round((projectedCount / total) * 100),
    };
  });
}

// Re-export collectValues for use by gapCount callers
export { collectValues };
