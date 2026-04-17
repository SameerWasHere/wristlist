/**
 * Backfill community nicknames (variantName) across the catalog.
 *
 * Each entry matches by (brand, reference). Only applies when the target
 * reference exists in the DB AND doesn't already have a variantName.
 *
 *   npx tsx scripts/fix-nicknames.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb, schema } from "@/lib/db";
import { eq, and, ilike } from "drizzle-orm";

const NICKS: Array<{ brand: string; ref: string; name: string }> = [
  // ---- Rolex ----
  { brand: "Rolex", ref: "116400GV", name: "GV" }, // Milgauss green crystal
  { brand: "Rolex", ref: "116500LN", name: "Panda" }, // white dial
  { brand: "Rolex", ref: "116500LN-white", name: "Panda" },
  { brand: "Rolex", ref: "116500LN-black", name: "Reverse Panda" },
  { brand: "Rolex", ref: "116500LN-BLK", name: "Reverse Panda" },
  { brand: "Rolex", ref: "116508", name: "John Mayer" }, // green dial gold Daytona
  { brand: "Rolex", ref: "116610LN", name: "Sub" },
  { brand: "Rolex", ref: "124060", name: "No-Date Sub" },
  { brand: "Rolex", ref: "126000", name: "Stella (green)" }, // celebration OP
  { brand: "Rolex", ref: "126500LN", name: "New Daytona" },
  { brand: "Rolex", ref: "126506", name: "Ice Blue Daytona" },
  { brand: "Rolex", ref: "126600", name: "SD43" },
  { brand: "Rolex", ref: "126610LB", name: "Cookie Monster" },
  { brand: "Rolex", ref: "126610LV", name: "Starbucks" }, // set
  { brand: "Rolex", ref: "126613LB", name: "Bluesy" },
  { brand: "Rolex", ref: "126710BLNR", name: "Batman" }, // set
  { brand: "Rolex", ref: "126710BLRO", name: "Pepsi" }, // set
  { brand: "Rolex", ref: "126711CHNR", name: "Root Beer" }, // set
  { brand: "Rolex", ref: "126720VTNR", name: "Sprite" }, // set
  { brand: "Rolex", ref: "226570", name: "Polar" }, // Explorer II white
  { brand: "Rolex", ref: "228235", name: "Green Day-Date" },

  // ---- Tudor ----
  { brand: "Tudor", ref: "M79030N", name: "BB58 Black" }, // set
  { brand: "Tudor", ref: "M79030N-0001", name: "BB58 Black" },
  { brand: "Tudor", ref: "M79030B-0001", name: "BB58 Blue" },
  { brand: "Tudor", ref: "M79000N-0001", name: "BB54" },
  { brand: "Tudor", ref: "M79360N", name: "BB Chrono" },
  { brand: "Tudor", ref: "M79360N-0002", name: "BB Chrono" },
  { brand: "Tudor", ref: "M79830RB", name: "BBGMT Pepsi" },
  { brand: "Tudor", ref: "M79830RB-0001", name: "BBGMT Pepsi" },
  { brand: "Tudor", ref: "M79830RB-0011", name: "BB58 GMT" },
  { brand: "Tudor", ref: "M79470-0001", name: "BB Pro" },
  { brand: "Tudor", ref: "M7941A1A0RU", name: "Pelagos 39" }, // set
  { brand: "Tudor", ref: "M7941A1A0RU-0001", name: "Pelagos 39" },
  { brand: "Tudor", ref: "M25600TN", name: "Pelagos" },
  { brand: "Tudor", ref: "M25600TN-0001", name: "Pelagos" },
  { brand: "Tudor", ref: "M25707N/8N-0001", name: "Pelagos FXD" },

  // ---- Seiko ----
  { brand: "Seiko", ref: "SPB121", name: "Alpinist" }, // set
  { brand: "Seiko", ref: "SPB151", name: "Willard" },
  { brand: "Seiko", ref: "SPB167", name: "Sharp Edged" },
  { brand: "Seiko", ref: "SPB279", name: "King Seiko" },
  { brand: "Seiko", ref: "SPB453", name: "62MAS Reissue (Blue)" },
  { brand: "Seiko", ref: "SRPB43", name: "Cocktail Time" },
  { brand: "Seiko", ref: "SRPE93", name: "Turtle" },
  { brand: "Seiko", ref: "SRPE05", name: "King Turtle" },
  { brand: "Seiko", ref: "SRPG27", name: "Field 5" },
  { brand: "Seiko", ref: "SRPD55", name: "5KX" },
  { brand: "Seiko", ref: "SSK001", name: "GMT 5" },
  { brand: "Seiko", ref: "SKX007K2", name: "SKX" },
  { brand: "Seiko", ref: "SLA021", name: "62MAS Reissue" }, // set
  { brand: "Seiko", ref: "SNR029", name: "Prospex LX" },

  // ---- Grand Seiko ----
  { brand: "Grand Seiko", ref: "SBGA211", name: "Snowflake" }, // set
  { brand: "Grand Seiko", ref: "SBGA413", name: "Shunbun" }, // set on one row
  { brand: "Grand Seiko", ref: "SBGJ201", name: "Mt. Iwate" },
  { brand: "Grand Seiko", ref: "SBGE257", name: "Sport GMT" },
  { brand: "Grand Seiko", ref: "SBGA463", name: "Spring Drive Diver" },
  { brand: "Grand Seiko", ref: "SLGH005", name: "White Birch" }, // set
  { brand: "Grand Seiko", ref: "SLGH021", name: "Green Iwate" },
  { brand: "Grand Seiko", ref: "SLGW003", name: "White Birch Bark" }, // set
  { brand: "Grand Seiko", ref: "SLGA009", name: "White Birch SD" },

  // ---- Omega ----
  { brand: "Omega", ref: "310.30.42.50.01.001", name: "Moonwatch (Hesalite)" }, // set
  { brand: "Omega", ref: "310.30.42.50.01.002", name: "Moonwatch (Sapphire)" },
  { brand: "Omega", ref: "310.30.42.50.04.001", name: "Silver Dial Moonwatch" },
  { brand: "Omega", ref: "310.32.42.50.01.001", name: "Moonwatch Cal. 3861" },
  { brand: "Omega", ref: "310.60.42.50.01.001", name: "Moonwatch WG" },
  { brand: "Omega", ref: "332.10.41.51.01.001", name: "Speedmaster '57" },
  { brand: "Omega", ref: "210.22.42.20.01.004", name: "Seamaster Bond" },
  { brand: "Omega", ref: "215.30.44.21.01.001", name: "Planet Ocean" },
  { brand: "Omega", ref: "215.30.44.22.01.001", name: "Planet Ocean GMT" },
  { brand: "Omega", ref: "234.30.41.21.01.001", name: "Seamaster 300 Heritage" },

  // ---- Audemars Piguet ----
  { brand: "Audemars Piguet", ref: "15202ST.OO.1240ST.01", name: "Jumbo" },
  { brand: "Audemars Piguet", ref: "15510ST.OO.1320ST.01", name: "Green RO" },
  { brand: "Audemars Piguet", ref: "26470ST.OO.A027CA.01", name: "Offshore" },
  { brand: "Audemars Piguet", ref: "15210ST.OO.A002KB.01", name: "Code 11.59" },

  // ---- Patek Philippe ----
  { brand: "Patek Philippe", ref: "5167A-001", name: "Aquanaut" },
  { brand: "Patek Philippe", ref: "5711/1A-010", name: "Nautilus Blue" },
  { brand: "Patek Philippe", ref: "5811/1G-001", name: "Nautilus WG" },
  { brand: "Patek Philippe", ref: "5164A-001", name: "Travel Time" },

  // ---- IWC ----
  { brand: "IWC", ref: "IW329301", name: "Big Pilot" },
  { brand: "IWC", ref: "IW326801", name: "Spitfire" },

  // ---- TAG Heuer ----
  { brand: "TAG Heuer", ref: "CBL2111.BA0644", name: "Monaco" },

  // ---- Hamilton ----
  { brand: "Hamilton", ref: "H24585331", name: "Ventura" }, // the Elvis watch
];

async function main() {
  const db = getDb();
  let set = 0;
  let skipped = 0;
  let notFound = 0;

  for (const { brand, ref, name } of NICKS) {
    const rows = await db
      .select()
      .from(schema.watchReferences)
      .where(
        and(
          ilike(schema.watchReferences.brand, brand),
          ilike(schema.watchReferences.reference, ref),
        ),
      );

    if (rows.length === 0) {
      console.log(`  - not found: ${brand} ${ref} → "${name}"`);
      notFound++;
      continue;
    }

    for (const r of rows) {
      if (r.variantName && r.variantName.trim().length > 0) {
        console.log(`  = ${r.brand} ${r.reference}  keeping existing "${r.variantName}"`);
        skipped++;
        continue;
      }
      await db
        .update(schema.watchReferences)
        .set({ variantName: name })
        .where(eq(schema.watchReferences.id, r.id));
      console.log(`  + ${r.brand} ${r.reference}  →  "${name}"`);
      set++;
    }
  }

  console.log(`\nSet ${set}, skipped ${skipped} (already named), ${notFound} not found in catalog.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
