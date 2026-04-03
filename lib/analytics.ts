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

// ---------------------------------------------------------------------------
// Extended types
// ---------------------------------------------------------------------------

export interface ExtendedWatch extends AnalyticsWatch {
  sizeMm?: number;
  complications?: string[];
  material?: string;
  acquiredYear?: number;
  acquiredDate?: string;
}

// ---------------------------------------------------------------------------
// 7. collectionStats
// ---------------------------------------------------------------------------

export interface CollectionStatsResult {
  watchCount: number;
  averageSizeMm: number | null;
  sizeLabel: string;
  mechanicalPercent: number;
  waterReadyPercent: number;
  brandCount: number;
  topBrand: string;
  brandConcentration: number;
  complicationsList: string[];
  topCategory: string;
  topOrigin: string;
  topMovement: string;
}

export function collectionStats(watches: ExtendedWatch[]): CollectionStatsResult {
  if (watches.length === 0) {
    return {
      watchCount: 0,
      averageSizeMm: null,
      sizeLabel: "",
      mechanicalPercent: 0,
      waterReadyPercent: 0,
      brandCount: 0,
      topBrand: "",
      brandConcentration: 0,
      complicationsList: [],
      topCategory: "",
      topOrigin: "",
      topMovement: "",
    };
  }

  const total = watches.length;

  // Average size
  const sizes = watches.map((w) => w.sizeMm).filter((s): s is number => s != null && s > 0);
  const averageSizeMm = sizes.length > 0 ? Math.round((sizes.reduce((a, b) => a + b, 0) / sizes.length) * 10) / 10 : null;
  let sizeLabel = "";
  if (averageSizeMm !== null) {
    if (averageSizeMm < 38) sizeLabel = "compact";
    else if (averageSizeMm <= 42) sizeLabel = "classic";
    else sizeLabel = "bold";
  }

  // Mechanical %
  const mechanicalCount = watches.filter((w) => {
    const m = w.movement?.toLowerCase() ?? "";
    return m === "automatic" || m === "manual wind";
  }).length;
  const mechanicalPercent = Math.round((mechanicalCount / total) * 100);

  // Water ready %
  const waterReadyCount = watches.filter((w) => (w.water_resistance_m ?? 0) >= 200).length;
  const waterReadyPercent = Math.round((waterReadyCount / total) * 100);

  // Brands
  const brandCounts: Record<string, number> = {};
  for (const w of watches) {
    const b = w.brand || "";
    brandCounts[b] = (brandCounts[b] || 0) + 1;
  }
  const brandEntries = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
  const brandCount = brandEntries.length;
  const topBrand = brandEntries[0]?.[0] ?? "";
  const brandConcentration = brandEntries.length > 0 ? Math.round((brandEntries[0][1] / total) * 100) : 0;

  // Complications
  const compsSet = new Set<string>();
  for (const w of watches) {
    if (w.complications) {
      for (const c of w.complications) {
        if (c) compsSet.add(c.toLowerCase());
      }
    }
  }
  const complicationsList = Array.from(compsSet).sort();

  // Top category, origin, movement
  const topCategory = mode(watches.map((w) => w.category?.toLowerCase() ?? "").filter(Boolean));
  const topOrigin = mode(watches.map((w) => w.origin?.toLowerCase() ?? "").filter(Boolean));
  const topMovement = mode(watches.map((w) => w.movement?.toLowerCase() ?? "").filter(Boolean));

  return {
    watchCount: total,
    averageSizeMm,
    sizeLabel,
    mechanicalPercent,
    waterReadyPercent,
    brandCount,
    topBrand,
    brandConcentration,
    complicationsList,
    topCategory,
    topOrigin,
    topMovement,
  };
}

// ---------------------------------------------------------------------------
// 8. brandBreakdown
// ---------------------------------------------------------------------------

export interface BrandBreakdownItem {
  brand: string;
  count: number;
  percent: number;
}

export function brandBreakdown(watches: ExtendedWatch[]): BrandBreakdownItem[] {
  if (watches.length === 0) return [];
  const total = watches.length;
  const counts: Record<string, number> = {};
  for (const w of watches) {
    const b = w.brand || "Unknown";
    counts[b] = (counts[b] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([brand, count]) => ({
      brand,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// 9. collectionGapsHuman
// ---------------------------------------------------------------------------

export function collectionGapsHuman(watches: ExtendedWatch[], wishlist: ExtendedWatch[] = []): string[] {
  if (watches.length === 0) return [];

  // Combine collection + wishlist to avoid suggesting gaps the wishlist already fills
  const combined = [...watches, ...wishlist];

  const gaps: string[] = [];

  const categories = new Set(combined.map((w) => w.category?.toLowerCase()).filter(Boolean));
  const movements = new Set(combined.map((w) => w.movement?.toLowerCase()).filter(Boolean));
  const origins = new Set(combined.map((w) => w.origin?.toLowerCase()).filter(Boolean));
  const bracelets = new Set(combined.map((w) => w.bracelet_type?.toLowerCase()).filter(Boolean));
  const sizes = watches.map((w) => w.sizeMm).filter((s): s is number => s != null && s > 0);

  const topOriginVal = mode(watches.map((w) => w.origin?.toLowerCase() ?? "").filter(Boolean));

  // Chronograph
  if (!categories.has("chronograph")) {
    gaps.push("A chronograph -- add a timing complication to your collection");
  }

  // Dress
  if (!categories.has("dress")) {
    gaps.push("A dress watch -- something for formal occasions");
  }

  // Travel watch
  if (!categories.has("gmt") && !categories.has("digital")) {
    gaps.push("A travel watch -- GMT or world time for the road");
  }

  // Missing origins
  const knownOrigins = ["swiss", "japanese", "german", "american", "chinese"];
  for (const o of knownOrigins) {
    if (!origins.has(o) && o !== topOriginVal?.toLowerCase()) {
      const label = o.charAt(0).toUpperCase() + o.slice(1);
      gaps.push(`Something ${label} -- explore beyond ${topOriginVal || "your current favorites"}`);
      break;
    }
  }

  // Same size
  if (sizes.length >= 2) {
    const avg = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const allSame = sizes.every((s) => Math.abs(s - avg) <= 2);
    if (allSame) {
      const direction = avg <= 40 ? "larger" : "smaller";
      gaps.push(`A different size -- your average is ${Math.round(avg)}mm, try something ${direction}`);
    }
  }

  // Manual wind
  if (!movements.has("manual wind")) {
    gaps.push("A manual wind -- feel the mechanical connection");
  }

  // Same bracelet type
  if (bracelets.size === 1) {
    const current = Array.from(bracelets)[0];
    const suggestions = ["leather strap", "rubber strap", "nato strap", "steel bracelet", "mesh bracelet"];
    const alt = suggestions.find((s) => s !== current) || "something different";
    gaps.push(`A different strap -- try ${alt} for variety`);
  }

  // Return top 3-5
  return gaps.slice(0, 5);
}

// ---------------------------------------------------------------------------
// 10. timelineStats
// ---------------------------------------------------------------------------

export interface TimelineStatsResult {
  oldestYear: number | null;
  newestYear: number | null;
  totalYears: number | null;
  watchesPerYear: number | null;
  mostActiveYear: { year: number; count: number } | null;
  latestAddition: { brand: string; model: string; year: number } | null;
}

export function timelineStats(watches: ExtendedWatch[]): TimelineStatsResult {
  const empty: TimelineStatsResult = {
    oldestYear: null,
    newestYear: null,
    totalYears: null,
    watchesPerYear: null,
    mostActiveYear: null,
    latestAddition: null,
  };

  if (watches.length === 0) return empty;

  // Extract years from acquiredYear or acquiredDate
  const withYears = watches
    .map((w) => {
      let year: number | null = w.acquiredYear ?? null;
      if (!year && w.acquiredDate) {
        const parsed = parseInt(w.acquiredDate.substring(0, 4), 10);
        if (!isNaN(parsed) && parsed > 1900) year = parsed;
      }
      return { watch: w, year };
    })
    .filter((x): x is { watch: ExtendedWatch; year: number } => x.year !== null);

  if (withYears.length === 0) return empty;

  const years = withYears.map((x) => x.year);
  const oldestYear = Math.min(...years);
  const newestYear = Math.max(...years);
  const totalYears = newestYear - oldestYear + 1;
  const watchesPerYear = totalYears > 0 ? Math.round((withYears.length / totalYears) * 10) / 10 : null;

  // Most active year
  const yearCounts: Record<number, number> = {};
  for (const y of years) {
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  }
  const sortedYears = Object.entries(yearCounts).sort((a, b) => Number(b[1]) - Number(a[1]));
  const mostActiveYear = sortedYears[0]
    ? { year: Number(sortedYears[0][0]), count: sortedYears[0][1] }
    : null;

  // Latest addition
  const sorted = [...withYears].sort((a, b) => {
    // Sort by date string if available, otherwise by year
    const dateA = a.watch.acquiredDate || String(a.year);
    const dateB = b.watch.acquiredDate || String(b.year);
    return dateB.localeCompare(dateA);
  });
  const latest = sorted[0];
  const latestAddition = latest
    ? { brand: latest.watch.brand, model: latest.watch.model, year: latest.year }
    : null;

  return {
    oldestYear,
    newestYear,
    totalYears,
    watchesPerYear,
    mostActiveYear,
    latestAddition,
  };
}
