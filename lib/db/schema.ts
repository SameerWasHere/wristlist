import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  serial,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// watch_references — the canonical catalog of watch models
// ---------------------------------------------------------------------------
export const watchReferences = pgTable(
  "watch_references",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    reference: text("reference").notNull(),
    sizeMm: real("size_mm"),
    movement: text("movement"),
    material: text("material"),
    color: text("color"),
    category: text("category"),
    braceletType: text("bracelet_type"),
    shape: text("shape"),
    waterResistanceM: integer("water_resistance_m"),
    crystal: text("crystal"),
    caseBack: text("case_back"),
    origin: text("origin"),
    lugWidthMm: real("lug_width_mm"),
    complications: jsonb("complications").$type<string[]>(),
    retailPrice: integer("retail_price"),
    description: text("description"),
    imageUrl: text("image_url"),
  },
  (table) => [uniqueIndex("watch_references_slug_idx").on(table.slug)],
);

// ---------------------------------------------------------------------------
// users — Clerk-authenticated users
// ---------------------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id").notNull(),
    username: text("username").notNull(),
    displayName: text("display_name"),
    bio: text("bio"),
    collectingSince: integer("collecting_since"),
    showValuePublicly: boolean("show_value_publicly").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_clerk_id_idx").on(table.clerkId),
    uniqueIndex("users_username_idx").on(table.username),
  ],
);

// ---------------------------------------------------------------------------
// user_watches — a user's collection + wishlist entries
// ---------------------------------------------------------------------------
export const userWatches = pgTable("user_watches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  watchReferenceId: integer("watch_reference_id")
    .notNull()
    .references(() => watchReferences.id),
  status: text("status", { enum: ["collection", "wishlist"] }).notNull(),
  modelYear: integer("model_year"),
  modifications: jsonb("modifications").$type<string[]>(),
  notes: text("notes"),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
});
