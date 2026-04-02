import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { watchFamilies, watchReferences, catalogEdits } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface WatchVariation {
  reference: string;
  sizeMm: number;
  movement: string;
  material: string;
  color: string;
  category: string;
  braceletType: string;
  shape: string;
  waterResistanceM: number;
  crystal: string;
  caseBack: string;
  origin: string;
  lugWidthMm: number;
  complications: string[];
  retailPrice: number;
  description: string;
}

interface FamilyExpansion {
  brand: string;
  model: string;
  variations: WatchVariation[];
}

// ---------------------------------------------------------------------------
// Variations to add — all specs based on real manufacturer data
// ---------------------------------------------------------------------------
const EXPANSIONS: FamilyExpansion[] = [
  // ===========================================================================
  // ROLEX SUBMARINER DATE — existing family "Submariner Date"
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Submariner Date",
    variations: [
      {
        reference: "126610LB",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 10250,
        description:
          "Blue dial and Cerachrom bezel insert. Calibre 3235, 70-hour power reserve. Oyster bracelet with Glidelock.",
      },
      {
        reference: "126613LN",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel/yellow gold",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 16100,
        description:
          "Rolesor (Oystersteel and 18ct yellow gold). Black dial and bezel. Calibre 3235, 70-hour reserve.",
      },
      {
        reference: "126613LB",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel/yellow gold",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 16100,
        description:
          "Rolesor two-tone with royal blue dial and Cerachrom bezel. Calibre 3235, 70-hour power reserve.",
      },
      {
        reference: "116610LN",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 9150,
        description:
          "Previous generation 40mm Submariner Date. Calibre 3135, Cerachrom bezel, Glidelock clasp.",
      },
    ],
  },

  // ===========================================================================
  // ROLEX SUBMARINER NO DATE — existing family
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Submariner No Date",
    variations: [
      {
        reference: "124060",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: [],
        retailPrice: 9100,
        description:
          "No-date Submariner in 41mm case. Calibre 3230, 70-hour power reserve. Clean symmetrical dial.",
      },
    ],
  },

  // ===========================================================================
  // ROLEX DATEJUST 41 — existing family
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Datejust 41",
    variations: [
      {
        reference: "126334-silver",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel/white gold",
        color: "silver",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 10200,
        description:
          "Silver dial with fluted white gold bezel. Calibre 3235, Jubilee bracelet, 70-hour power reserve.",
      },
      {
        reference: "126331",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel/rose gold",
        color: "chocolate",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 15500,
        description:
          "Everose Rolesor with chocolate dial. Fluted bezel, Jubilee bracelet, Calibre 3235.",
      },
    ],
  },

  // ===========================================================================
  // ROLEX DATEJUST 36 — new family
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Datejust 36",
    variations: [
      {
        reference: "126234",
        sizeMm: 36,
        movement: "automatic",
        material: "stainless steel/white gold",
        color: "black",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 8950,
        description:
          "Classic 36mm Datejust with black dial. Fluted white gold bezel, Jubilee bracelet, Calibre 3235.",
      },
      {
        reference: "126200",
        sizeMm: 36,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 7650,
        description:
          "Oystersteel with smooth bezel and blue dial. Oyster bracelet, Calibre 3235, 70-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // ROLEX DATEJUST 31 — new family
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Datejust 31",
    variations: [
      {
        reference: "278274",
        sizeMm: 31,
        movement: "automatic",
        material: "stainless steel/white gold",
        color: "silver",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 16,
        complications: ["date"],
        retailPrice: 9550,
        description:
          "Mid-size Datejust with silver dial. Fluted white gold bezel, Jubilee bracelet, Calibre 2236.",
      },
    ],
  },

  // ===========================================================================
  // ROLEX DAYTONA — existing family
  // ===========================================================================
  {
    brand: "Rolex",
    model: "Daytona",
    variations: [
      {
        reference: "116500LN-white",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 15000,
        description:
          "White dial Cosmograph Daytona with black ceramic Cerachrom bezel. Calibre 4130, 72-hour power reserve.",
      },
      {
        reference: "116500LN-black",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 15000,
        description:
          "Black dial Cosmograph Daytona with ceramic bezel. Calibre 4130, Oyster bracelet, 72-hour reserve.",
      },
      {
        reference: "126506",
        sizeMm: 40,
        movement: "automatic",
        material: "platinum",
        color: "ice blue",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 82700,
        description:
          "950 Platinum with ice blue dial and brown ceramic bezel. Calibre 4131, 72-hour power reserve.",
      },
      {
        reference: "116508",
        sizeMm: 40,
        movement: "automatic",
        material: "yellow gold",
        color: "green",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 38200,
        description:
          "18ct yellow gold with green dial. Black Cerachrom bezel, Calibre 4130, Oysterflex bracelet.",
      },
    ],
  },

  // ===========================================================================
  // ROLEX GMT-MASTER II — add to existing families + create new ones
  // ===========================================================================
  {
    brand: "Rolex",
    model: "GMT-Master II Root Beer",
    variations: [
      {
        reference: "126711CHNR",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel/rose gold",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "GMT"],
        retailPrice: 17150,
        description:
          "Everose Rolesor with brown and black Cerachrom bezel (Root Beer). Calibre 3285, 70-hour reserve.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "GMT-Master II Sprite",
    variations: [
      {
        reference: "126720VTNR",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "GMT"],
        retailPrice: 10750,
        description:
          "Left-handed crown at 9 o'clock. Green and black Cerachrom bezel (Sprite). Calibre 3285, Jubilee bracelet.",
      },
    ],
  },

  // ===========================================================================
  // OMEGA SPEEDMASTER MOONWATCH — existing family
  // ===========================================================================
  {
    brand: "Omega",
    model: "Speedmaster Moonwatch",
    variations: [
      {
        reference: "310.32.42.50.01.001",
        sizeMm: 42,
        movement: "manual wind",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "hesalite",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 6900,
        description:
          "Moonwatch on brown leather strap. Calibre 3861 manual wind, hesalite crystal, 50-hour power reserve.",
      },
      {
        reference: "310.60.42.50.01.001",
        sizeMm: 42,
        movement: "manual wind",
        material: "gold",
        color: "black",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 34600,
        description:
          "18K Sedna gold Moonwatch. Calibre 3861 with burgundy-gold PVD plate. Sapphire sandwich crystal.",
      },
      {
        reference: "310.30.42.50.04.001",
        sizeMm: 42,
        movement: "manual wind",
        material: "stainless steel",
        color: "silver",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 11100,
        description:
          "Silver Snoopy Award 50th anniversary. Blue ceramic bezel, Calibre 3861, animated caseback with Snoopy.",
      },
    ],
  },

  // ===========================================================================
  // OMEGA SPEEDMASTER MOONWATCH SAPPHIRE — existing family
  // ===========================================================================
  // Note: 310.30.42.50.01.002 already exists in this family; skip re-adding

  // ===========================================================================
  // OMEGA SEAMASTER DIVER 300M — new family
  // ===========================================================================
  {
    brand: "Omega",
    model: "Seamaster Diver 300M",
    variations: [
      {
        reference: "210.30.42.20.01.001",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5500,
        description:
          "Black ceramic dial with laser-engraved waves. Calibre 8800 Co-Axial Master Chronometer, 55-hour reserve.",
      },
      {
        reference: "210.30.42.20.03.001",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5500,
        description:
          "Blue ceramic dial and bezel. Calibre 8800, helium escape valve, 55-hour power reserve.",
      },
      {
        reference: "210.22.42.20.01.004",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel/yellow gold",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 8300,
        description:
          "Two-tone steel and 18K yellow gold. Black ceramic dial, Calibre 8800 Master Chronometer.",
      },
      {
        reference: "210.30.42.20.06.001",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "grey",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5500,
        description:
          "Grey ceramic dial with wave pattern. Calibre 8800, helium escape valve, 55-hour reserve.",
      },
      {
        reference: "210.32.42.20.01.001",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5200,
        description:
          "Black ceramic dial on integrated rubber strap. Calibre 8800 Master Chronometer, 55-hour reserve.",
      },
    ],
  },

  // ===========================================================================
  // TUDOR BLACK BAY — existing family (39mm Black Bay 58 variants)
  // ===========================================================================
  {
    brand: "Tudor",
    model: "Black Bay 58",
    variations: [
      {
        reference: "M7941A1A0RU",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 3775,
        description:
          "39mm vintage-inspired diver. MT5400 manufacture calibre, 70-hour power reserve, riveted bracelet.",
      },
      {
        reference: "M79030N",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 3775,
        description:
          "Navy blue dial and bezel. MT5400 manufacture movement, 70-hour power reserve. 39mm case.",
      },
    ],
  },

  // ===========================================================================
  // TUDOR BLACK BAY CHRONO — existing family
  // ===========================================================================
  {
    brand: "Tudor",
    model: "Black Bay Chrono",
    variations: [
      {
        reference: "M79360N",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 5425,
        description:
          "Panda dial chronograph. MT5813 manufacture calibre (column wheel), 70-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // TUDOR BLACK BAY GMT — existing family
  // ===========================================================================
  {
    brand: "Tudor",
    model: "Black Bay GMT",
    variations: [
      {
        reference: "M79830RB",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "GMT"],
        retailPrice: 4075,
        description:
          "Red and blue Pepsi bezel. MT5652 manufacture GMT calibre, 70-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // TUDOR PELAGOS — new family
  // ===========================================================================
  {
    brand: "Tudor",
    model: "Pelagos",
    variations: [
      {
        reference: "M25600TN",
        sizeMm: 42,
        movement: "automatic",
        material: "titanium",
        color: "black",
        category: "diver",
        braceletType: "titanium bracelet",
        shape: "round",
        waterResistanceM: 500,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 4775,
        description:
          "Full titanium 500m diver. MT5612 manufacture calibre, 70-hour reserve. Self-adjusting clasp.",
      },
    ],
  },

  // ===========================================================================
  // AP ROYAL OAK — new family (distinct from Royal Oak Offshore)
  // ===========================================================================
  {
    brand: "Audemars Piguet",
    model: "Royal Oak",
    variations: [
      {
        reference: "15500ST.OO.1220ST.01",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 29200,
        description:
          "Blue Grande Tapisserie dial. Calibre 4302, 70-hour power reserve. Iconic octagonal bezel with exposed screws.",
      },
      {
        reference: "15500ST.OO.1220ST.03",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "grey",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 29200,
        description:
          "Grey Grande Tapisserie dial. Calibre 4302 self-winding, 70-hour power reserve. 41mm case.",
      },
      {
        reference: "15500ST.OO.1220ST.04",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 29200,
        description:
          "Black Grande Tapisserie dial. Calibre 4302, 70-hour power reserve, integrated steel bracelet.",
      },
      {
        reference: "15202ST.OO.1240ST.01",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 33600,
        description:
          "Extra-Thin Jumbo 39mm. Blue Petite Tapisserie dial. Calibre 2121 ultra-thin (3.05mm), 40-hour reserve.",
      },
      {
        reference: "15510ST.OO.1320ST.01",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 29900,
        description:
          "New generation Royal Oak with green dial. Calibre 4302, 70-hour reserve. Updated bracelet design.",
      },
    ],
  },

  // ===========================================================================
  // PATEK PHILIPPE NAUTILUS — existing family
  // ===========================================================================
  {
    brand: "Patek Philippe",
    model: "Nautilus",
    variations: [
      {
        reference: "5711/1A-010",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 35000,
        description:
          "Iconic blue-black gradient dial with horizontal embossing. Calibre 26-330 S C, 45-hour power reserve.",
      },
      {
        reference: "5711/1A-001",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 35000,
        description:
          "Silvery-white dial with horizontal embossing. Calibre 26-330 S C self-winding, 45-hour power reserve.",
      },
      {
        reference: "5712/1A-001",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "moon phase", "power reserve indicator"],
        retailPrice: 44000,
        description:
          "Nautilus with power reserve, moon phase, and date subdials. Calibre 240 PS IRM C LU, ultra-thin.",
      },
      {
        reference: "5726/1A-014",
        sizeMm: 40.5,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "luxury sport",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "day", "month", "moon phase"],
        retailPrice: 51000,
        description:
          "Nautilus Annual Calendar. Calibre 324 S QA LU 24H, day/date/month/moon phase, 45-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // GRAND SEIKO SNOWFLAKE — existing family
  // ===========================================================================
  {
    brand: "Grand Seiko",
    model: "Snowflake",
    variations: [
      {
        reference: "SBGA413",
        sizeMm: 40,
        movement: "automatic",
        material: "titanium",
        color: "pink",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 19,
        complications: ["date", "power reserve indicator"],
        retailPrice: 6300,
        description:
          "Shunbun spring cherry blossom dial. Spring Drive 9R65, titanium case, 72-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // GRAND SEIKO WHITE BIRCH — existing family
  // ===========================================================================
  // SLGH005 already exists; skip

  // ===========================================================================
  // GRAND SEIKO HERITAGE — new family for additional GS references
  // ===========================================================================
  {
    brand: "Grand Seiko",
    model: "Heritage",
    variations: [
      {
        reference: "SBGJ201",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date", "GMT"],
        retailPrice: 7400,
        description:
          "Hi-Beat GMT with blue dial. Calibre 9S86 at 36,000 vph, 55-hour power reserve. Dual time zone.",
      },
      {
        reference: "SBGW231",
        sizeMm: 37.3,
        movement: "manual wind",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire (dual curved)",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 4200,
        description:
          "Elegant manual-wind with ivory dial. Calibre 9S64 at 28,800 vph, 72-hour power reserve.",
      },
    ],
  },

  // ===========================================================================
  // CARTIER SANTOS DE CARTIER — existing family
  // ===========================================================================
  {
    brand: "Cartier",
    model: "Santos de Cartier",
    variations: [
      {
        reference: "WSSA0018",
        sizeMm: 35,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 18,
        complications: ["date"],
        retailPrice: 7350,
        description:
          "Medium Santos in steel. Silver-white dial, Calibre 1847 MC, QuickSwitch interchangeable bracelet/strap.",
      },
      {
        reference: "WSSA0029",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 7850,
        description:
          "Large Santos in steel. Silver opaline dial, Calibre 1847 MC, SmartLink easy-size bracelet.",
      },
      {
        reference: "W2SA0016",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel/yellow gold",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 12600,
        description:
          "Large Santos in two-tone steel and 18K yellow gold. Silvered opaline dial, Calibre 1847 MC.",
      },
      {
        reference: "WSSA0030",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 7850,
        description:
          "Large Santos with graduated blue dial. Calibre 1847 MC, steel bracelet with SmartLink system.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------
async function seedVariations() {
  console.log(`Expanding ${EXPANSIONS.length} watch families with new variations...\n`);

  let familiesCreated = 0;
  let refsCreated = 0;
  let editsLogged = 0;

  for (const expansion of EXPANSIONS) {
    const familySlug = slugify(`${expansion.brand}-${expansion.model}`);

    // Try to find existing family
    let familyId: number | undefined;
    const [existing] = await db
      .select()
      .from(watchFamilies)
      .where(eq(watchFamilies.slug, familySlug))
      .limit(1);

    if (existing) {
      familyId = existing.id;
      console.log(`  Found existing family: ${expansion.brand} ${expansion.model} (id=${familyId})`);
    } else {
      // Create new family
      const [created] = await db
        .insert(watchFamilies)
        .values({
          slug: familySlug,
          brand: expansion.brand,
          model: expansion.model,
          isCommunitySubmitted: false,
          createdBy: 1,
        })
        .onConflictDoNothing()
        .returning();

      if (created) {
        familyId = created.id;
        familiesCreated++;
        console.log(`  Created new family: ${expansion.brand} ${expansion.model} (id=${familyId})`);

        // Log catalog edit for family creation
        await db.insert(catalogEdits).values({
          userId: 1,
          targetType: "family",
          targetId: familyId,
          action: "create",
          newValue: `${expansion.brand} ${expansion.model}`,
        });
        editsLogged++;
      } else {
        // Race condition fallback
        const [fallback] = await db
          .select()
          .from(watchFamilies)
          .where(eq(watchFamilies.slug, familySlug))
          .limit(1);
        familyId = fallback?.id;
      }
    }

    if (!familyId) {
      console.log(`  SKIP: Could not resolve family for ${expansion.brand} ${expansion.model}`);
      continue;
    }

    // Insert each variation
    for (const v of expansion.variations) {
      const refSlug = slugify(`${expansion.brand}-${expansion.model}-${v.reference}`);

      const result = await db
        .insert(watchReferences)
        .values({
          slug: refSlug,
          brand: expansion.brand,
          model: expansion.model,
          reference: v.reference,
          familyId,
          sizeMm: v.sizeMm,
          movement: v.movement,
          material: v.material,
          color: v.color,
          category: v.category,
          braceletType: v.braceletType,
          shape: v.shape,
          waterResistanceM: v.waterResistanceM,
          crystal: v.crystal,
          caseBack: v.caseBack,
          origin: v.origin,
          lugWidthMm: v.lugWidthMm,
          complications: v.complications,
          retailPrice: v.retailPrice,
          description: v.description,
          createdBy: 1,
          isCommunitySubmitted: false,
        })
        .onConflictDoNothing()
        .returning();

      if (result.length > 0) {
        refsCreated++;
        // Log catalog edit for new variation
        await db.insert(catalogEdits).values({
          userId: 1,
          targetType: "reference",
          targetId: result[0].id,
          action: "add_variation",
          newValue: `${expansion.brand} ${expansion.model} ${v.reference}`,
        });
        editsLogged++;
        console.log(`    + ${v.reference} (${v.color}, ${v.material}, ${v.sizeMm}mm)`);
      } else {
        console.log(`    ~ ${v.reference} already exists, skipped`);
      }
    }
  }

  // Summary
  const totalFamilies = await db.select().from(watchFamilies);
  const totalRefs = await db.select().from(watchReferences);

  console.log(`\n--- Summary ---`);
  console.log(`New families created: ${familiesCreated}`);
  console.log(`New references created: ${refsCreated}`);
  console.log(`Catalog edits logged: ${editsLogged}`);
  console.log(`Total families in DB: ${totalFamilies.length}`);
  console.log(`Total references in DB: ${totalRefs.length}`);
  console.log("Done!");
}

seedVariations().catch(console.error);
