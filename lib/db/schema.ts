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
// watch_families — groups of related watch references (e.g. "Rolex Submariner")
// ---------------------------------------------------------------------------
export const watchFamilies = pgTable(
  "watch_families",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    collection: text("collection"), // e.g. "Submariner", "Speedmaster", "Datejust"
    description: text("description"),
    imageUrl: text("image_url"),
    isCommunitySubmitted: boolean("is_community_submitted")
      .default(false)
      .notNull(),
    createdBy: integer("created_by").references(() => users.id),
    updatedAt: timestamp("updated_at").defaultNow(),
    updatedBy: integer("updated_by").references(() => users.id),
    editCount: integer("edit_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("watch_families_slug_idx").on(table.slug)],
);

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
    bezelType: text("bezel_type"),
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
    familyId: integer("family_id").references(() => watchFamilies.id),
    createdBy: integer("created_by").references(() => users.id),
    updatedAt: timestamp("updated_at").defaultNow(),
    updatedBy: integer("updated_by").references(() => users.id),
    editCount: integer("edit_count").default(0).notNull(),
    isCommunitySubmitted: boolean("is_community_submitted")
      .default(false)
      .notNull(),
  },
  (table) => [uniqueIndex("watch_references_slug_idx").on(table.slug)],
);

// ---------------------------------------------------------------------------
// catalog_edits — tracks all community contributions and changes
// ---------------------------------------------------------------------------
export const catalogEdits = pgTable("catalog_edits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(), // 'family' or 'reference'
  targetId: integer("target_id").notNull(),
  action: text("action").notNull(), // 'create', 'edit', 'add_variation', 'add_image'
  fieldChanged: text("field_changed"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
    avatarUrl: text("avatar_url"),
    websiteUrl: text("website_url"),
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
// ---------------------------------------------------------------------------
// watch_requests — user-submitted requests for watches not in the catalog
// ---------------------------------------------------------------------------
export const watchRequests = pgTable("watch_requests", {
  id: serial("id").primaryKey(),
  requestedBy: text("requested_by"), // clerk ID, optional (anonymous requests ok)
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  reference: text("reference"),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  acquiredYear: integer("acquired_year"), // legacy, kept for backward compat
  acquiredDate: text("acquired_date"), // "YYYY-MM-DD" format for full date
  milestone: text("milestone"), // e.g. "Wedding gift", "Graduation 2019", "First bonus"
  notes: text("notes"),
  caption: text("caption"),
  photos: jsonb("photos").$type<string[]>().default([]),
  position: integer("position").default(0).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// follows — social graph for user-to-user follows
// ---------------------------------------------------------------------------
export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id),
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("follows_follower_following_idx").on(
      table.followerId,
      table.followingId,
    ),
  ],
);
