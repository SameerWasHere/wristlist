import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { watchFamilies, watchReferences } from "./schema";
import { eq } from "drizzle-orm";

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

interface WatchSeed {
  brand: string;
  model: string;
  variations: WatchVariation[];
}

const WATCHES: WatchSeed[] = [
  // ===========================================================================
  // ROLEX
  // ===========================================================================
  {
    brand: "Rolex",
    model: "GMT-Master II Pepsi",
    variations: [
      {
        reference: "126710BLRO",
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
          "Blue and red ceramic Cerachrom bezel. Calibre 3285 with 70-hour power reserve. Jubilee bracelet.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "GMT-Master II Batman",
    variations: [
      {
        reference: "126710BLNR",
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
          "Blue and black ceramic bezel. Calibre 3285 on Oyster bracelet. The Batman.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Daytona",
    variations: [
      {
        reference: "116500LN",
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
          "Ceramic Cerachrom bezel Cosmograph Daytona. Calibre 4130 in-house chronograph movement.",
      },
      {
        reference: "116500LN-BLK",
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
          "Black dial ceramic Daytona. Calibre 4130, 72-hour power reserve.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Explorer I",
    variations: [
      {
        reference: "124270",
        sizeMm: 36,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 7200,
        description:
          "Time-only Oystersteel explorer. Calibre 3230, 70-hour power reserve. 3-6-9 dial.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Explorer II",
    variations: [
      {
        reference: "226570",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date", "GMT"],
        retailPrice: 9550,
        description:
          "Polar white dial with orange 24-hour hand. Calibre 3285, fixed bezel with 24-hour markings.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Datejust 41",
    variations: [
      {
        reference: "126334",
        sizeMm: 41,
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
        retailPrice: 10200,
        description:
          "Fluted white gold bezel on Oystersteel. Blue dial, Jubilee bracelet, Calibre 3235.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Day-Date 40",
    variations: [
      {
        reference: "228235",
        sizeMm: 40,
        movement: "automatic",
        material: "gold",
        color: "green",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["day", "date"],
        retailPrice: 40500,
        description:
          "Everose gold President with olive green dial. Calibre 3255, 70-hour power reserve.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Yacht-Master",
    variations: [
      {
        reference: "126621",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 14800,
        description:
          "Oystersteel and Everose gold Rolesor. Bidirectional rotatable bezel, Calibre 3235.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Air-King",
    variations: [
      {
        reference: "126900",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 7400,
        description:
          "Aviation heritage with distinctive green and yellow markings. Calibre 3230, crown guard.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Milgauss",
    variations: [
      {
        reference: "116400GV",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 9300,
        description:
          "Z-blue dial with green sapphire crystal. Anti-magnetic to 1,000 gauss. Lightning bolt seconds hand.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Sky-Dweller",
    variations: [
      {
        reference: "326934",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date", "GMT", "annual calendar"],
        retailPrice: 15400,
        description:
          "Annual calendar with dual time zone. Calibre 9001, fluted Ring Command bezel.",
      },
    ],
  },
  {
    brand: "Rolex",
    model: "Sea-Dweller",
    variations: [
      {
        reference: "126600",
        sizeMm: 43,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 1220,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 12350,
        description:
          "Professional dive watch rated to 4,000 feet. Helium escape valve, Calibre 3235, Cyclops lens.",
      },
    ],
  },
  // ===========================================================================
  // OMEGA
  // ===========================================================================
  {
    brand: "Omega",
    model: "Seamaster Planet Ocean",
    variations: [
      {
        reference: "215.30.44.21.01.001",
        sizeMm: 43.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 600,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 7100,
        description:
          "Master Chronometer Co-Axial 8900 movement. Ceramic bezel, 600m water resistance.",
      },
    ],
  },
  {
    brand: "Omega",
    model: "Seamaster Aqua Terra",
    variations: [
      {
        reference: "220.10.41.21.03.001",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 150,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5750,
        description:
          "Teak-pattern dial inspired by yacht decks. Master Chronometer 8900 movement.",
      },
    ],
  },
  {
    brand: "Omega",
    model: "De Ville Prestige",
    variations: [
      {
        reference: "424.10.40.20.03.001",
        sizeMm: 39.5,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 19,
        complications: ["date"],
        retailPrice: 4000,
        description:
          "Classic dress watch with Roman numeral markers. Co-Axial calibre 2500.",
      },
    ],
  },
  {
    brand: "Omega",
    model: "Constellation",
    variations: [
      {
        reference: "131.10.39.20.03.001",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 19,
        complications: ["date"],
        retailPrice: 5800,
        description:
          "Iconic claws and pie-pan dial. Master Chronometer 8800, integrated bracelet.",
      },
    ],
  },
  // ===========================================================================
  // TUDOR
  // ===========================================================================
  {
    brand: "Tudor",
    model: "Black Bay",
    variations: [
      {
        reference: "M7941A1A0RU-0001",
        sizeMm: 41,
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
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 3825,
        description:
          "41mm diver with snowflake hands. MT5602 in-house movement, 70-hour power reserve.",
      },
    ],
  },
  {
    brand: "Tudor",
    model: "Pelagos",
    variations: [
      {
        reference: "M25600TN-0001",
        sizeMm: 42,
        movement: "automatic",
        material: "titanium",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 500,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 4675,
        description:
          "Titanium professional diver with helium escape valve. MT5612 COSC movement. 500m rated.",
      },
    ],
  },
  {
    brand: "Tudor",
    model: "Ranger",
    variations: [
      {
        reference: "M79950-0001",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 2925,
        description:
          "Modern field watch with vintage inspiration. MT5402 COSC movement, 70-hour reserve.",
      },
    ],
  },
  {
    brand: "Tudor",
    model: "Black Bay GMT",
    variations: [
      {
        reference: "M79830RB-0001",
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
          "Burgundy and blue Pepsi bezel GMT. MT5652 in-house movement with 70-hour power reserve.",
      },
    ],
  },
  {
    brand: "Tudor",
    model: "Black Bay Chrono",
    variations: [
      {
        reference: "M79360N-0002",
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
        retailPrice: 5225,
        description:
          "COSC-certified column wheel chronograph. MT5813 in-house movement based on Breitling B01.",
      },
    ],
  },
  // ===========================================================================
  // IWC
  // ===========================================================================
  {
    brand: "IWC",
    model: "Portugieser Chronograph",
    variations: [
      {
        reference: "IW371605",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["chronograph"],
        retailPrice: 9050,
        description:
          "Iconic Portugieser chronograph with in-house 69355 calibre. 46-hour power reserve.",
      },
    ],
  },
  {
    brand: "IWC",
    model: "Big Pilot",
    variations: [
      {
        reference: "IW329301",
        sizeMm: 43,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "power reserve indicator"],
        retailPrice: 9700,
        description:
          "43mm Big Pilot with in-house 82100 calibre. Conical crown, soft-iron cage for anti-magnetism.",
      },
    ],
  },
  {
    brand: "IWC",
    model: "Pilot Spitfire",
    variations: [
      {
        reference: "IW326801",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 60,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5600,
        description:
          "Compact Spitfire automatic. In-house 32110 calibre with 72-hour power reserve.",
      },
    ],
  },
  // ===========================================================================
  // JAEGER-LECOULTRE
  // ===========================================================================
  {
    brand: "Jaeger-LeCoultre",
    model: "Master Ultra Thin",
    variations: [
      {
        reference: "Q1218420",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 8400,
        description:
          "Ultra-thin case at 8.8mm. Calibre 899 automatic, 38-hour power reserve. Sector dial.",
      },
    ],
  },
  {
    brand: "Jaeger-LeCoultre",
    model: "Master Control",
    variations: [
      {
        reference: "Q4018420",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "day"],
        retailPrice: 9200,
        description:
          "Master Control Calendar. In-house calibre 866 with day, date, and month display.",
      },
    ],
  },
  // ===========================================================================
  // CARTIER
  // ===========================================================================
  {
    brand: "Cartier",
    model: "Santos de Cartier",
    variations: [
      {
        reference: "WSSA0018",
        sizeMm: 39.8,
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
        retailPrice: 7550,
        description:
          "The first pilot's wristwatch (1904). Medium model with QuickSwitch bracelet/strap system. Calibre 1847 MC.",
      },
    ],
  },
  {
    brand: "Cartier",
    model: "Ballon Bleu",
    variations: [
      {
        reference: "WSBB0046",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 7250,
        description:
          "Signature round case with blue cabochon crown guard. Calibre 1847 MC automatic.",
      },
    ],
  },
  // ===========================================================================
  // BREITLING
  // ===========================================================================
  {
    brand: "Breitling",
    model: "Navitimer",
    variations: [
      {
        reference: "AB0138211B1P1",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "slide rule"],
        retailPrice: 9100,
        description:
          "Iconic pilot's chronograph with slide rule bezel. In-house B01 calibre, 70-hour power reserve.",
      },
    ],
  },
  {
    brand: "Breitling",
    model: "Superocean",
    variations: [
      {
        reference: "A17375E71C1S1",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 4600,
        description:
          "Modern dive watch with ceramic bezel. Calibre B17 (SW200 base), 38-hour power reserve.",
      },
    ],
  },
  {
    brand: "Breitling",
    model: "Chronomat",
    variations: [
      {
        reference: "AB0134101B1A1",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 9350,
        description:
          "All-purpose chronograph with Rouleaux bracelet. In-house B01, COSC certified.",
      },
    ],
  },
  {
    brand: "Breitling",
    model: "Avenger",
    variations: [
      {
        reference: "A17318101B1X1",
        sizeMm: 43,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 24,
        complications: ["date"],
        retailPrice: 4750,
        description:
          "Military-inspired pilot watch with oversized crown. Calibre B17 automatic, 300m WR.",
      },
    ],
  },
  // ===========================================================================
  // PANERAI
  // ===========================================================================
  {
    brand: "Panerai",
    model: "Luminor Marina",
    variations: [
      {
        reference: "PAM01312",
        sizeMm: 44,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "leather strap",
        shape: "cushion",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 24,
        complications: ["date"],
        retailPrice: 8900,
        description:
          "Iconic cushion case with crown-protecting bridge. In-house P.9010 calibre, 3-day power reserve.",
      },
    ],
  },
  {
    brand: "Panerai",
    model: "Luminor Due",
    variations: [
      {
        reference: "PAM01274",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "cushion",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 8500,
        description:
          "Thinner Luminor for dress wear. 10.7mm thick, P.900 calibre, 3-day power reserve.",
      },
    ],
  },
  {
    brand: "Panerai",
    model: "Submersible",
    variations: [
      {
        reference: "PAM01683",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "cushion",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 10700,
        description:
          "Professional dive watch with rotating bezel. In-house P.900 calibre, 72-hour power reserve.",
      },
    ],
  },
  // ===========================================================================
  // ZENITH
  // ===========================================================================
  {
    brand: "Zenith",
    model: "Chronomaster Sport",
    variations: [
      {
        reference: "03.3100.3600/69.M3100",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date", "tachymeter"],
        retailPrice: 10800,
        description:
          "El Primero 3600 movement measuring 1/10th of a second. Tri-color subdials, ceramic bezel.",
      },
    ],
  },
  {
    brand: "Zenith",
    model: "El Primero",
    variations: [
      {
        reference: "03.2040.4061/69.C496",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 8600,
        description:
          "The original high-beat chronograph from 1969. El Primero 4061 calibre, 36,000 vph.",
      },
    ],
  },
  {
    brand: "Zenith",
    model: "Defy Classic",
    variations: [
      {
        reference: "95.9000.670/78.R782",
        sizeMm: 41,
        movement: "automatic",
        material: "titanium",
        color: "blue",
        category: "dress",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 7800,
        description:
          "Modern titanium sports watch. Elite 670 automatic, open-worked dial, 50-hour reserve.",
      },
    ],
  },
  // ===========================================================================
  // TAG HEUER
  // ===========================================================================
  {
    brand: "TAG Heuer",
    model: "Carrera",
    variations: [
      {
        reference: "CBS2210.FC6534",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "date"],
        retailPrice: 5950,
        description:
          "Carrera Chronograph with TH20-00 calibre. Glassbox sapphire crystal, panda dial.",
      },
    ],
  },
  {
    brand: "TAG Heuer",
    model: "Monaco",
    variations: [
      {
        reference: "CBL2111.BA0644",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 6550,
        description:
          "Iconic square chronograph made famous by Steve McQueen. Calibre Heuer 02, 80-hour reserve.",
      },
    ],
  },
  {
    brand: "TAG Heuer",
    model: "Aquaracer Professional 300",
    variations: [
      {
        reference: "WBP201B.BA0632",
        sizeMm: 43,
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
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 3050,
        description:
          "Professional diver with ceramic bezel. Calibre 5 automatic, 38-hour power reserve.",
      },
    ],
  },
  // ===========================================================================
  // LONGINES
  // ===========================================================================
  {
    brand: "Longines",
    model: "Spirit",
    variations: [
      {
        reference: "L3.810.4.53.6",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "pilot",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 2225,
        description:
          "Aviation-inspired with COSC-certified L888.4 calibre. Silicon hairspring, 72-hour power reserve.",
      },
    ],
  },
  {
    brand: "Longines",
    model: "HydroConquest",
    variations: [
      {
        reference: "L3.790.4.56.6",
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
        retailPrice: 1525,
        description:
          "Ceramic bezel diver with L888.5 calibre. 72-hour power reserve, sunray blue dial.",
      },
    ],
  },
  {
    brand: "Longines",
    model: "Master Collection",
    variations: [
      {
        reference: "L2.909.4.78.3",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "moonphase"],
        retailPrice: 2575,
        description:
          "Classic dress watch with moonphase. L899 calibre with silicon hairspring, 72-hour reserve.",
      },
    ],
  },
  // ===========================================================================
  // AUDEMARS PIGUET
  // ===========================================================================
  {
    brand: "Audemars Piguet",
    model: "Royal Oak Offshore",
    variations: [
      {
        reference: "26470ST.OO.A027CA.01",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 28,
        complications: ["chronograph", "date"],
        retailPrice: 34500,
        description:
          "Larger, sportier Royal Oak. Calibre 3126/3840 flyback chronograph, 50-hour power reserve.",
      },
    ],
  },
  {
    brand: "Audemars Piguet",
    model: "Code 11.59",
    variations: [
      {
        reference: "15210ST.OO.A002KB.01",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 27200,
        description:
          "Modern round case with octagonal middle. Calibre 4302, 70-hour power reserve. Lacquered dial.",
      },
    ],
  },
  // ===========================================================================
  // PATEK PHILIPPE
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
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 35000,
        description:
          "Gerald Genta's iconic porthole design. Calibre 26-330 SC, integrated bracelet, 45-hour reserve.",
      },
    ],
  },
  {
    brand: "Patek Philippe",
    model: "Aquanaut",
    variations: [
      {
        reference: "5167A-001",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 24000,
        description:
          "Tropical composite strap with rounded octagonal case. Calibre 324 SC, 45-hour reserve.",
      },
    ],
  },
  {
    brand: "Patek Philippe",
    model: "Calatrava",
    variations: [
      {
        reference: "5227R-001",
        sizeMm: 39,
        movement: "automatic",
        material: "gold",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 34800,
        description:
          "Definitive dress watch. Rose gold officer's case with hinged caseback. Calibre 324 SC.",
      },
    ],
  },
  // ===========================================================================
  // GRAND SEIKO
  // ===========================================================================
  {
    brand: "Grand Seiko",
    model: "Snowflake",
    variations: [
      {
        reference: "SBGA211",
        sizeMm: 41,
        movement: "automatic",
        material: "titanium",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date", "power reserve indicator"],
        retailPrice: 5800,
        description:
          "Iconic snowflake dial texture. Spring Drive 9R65, titanium case and bracelet, 72-hour reserve.",
      },
    ],
  },
  {
    brand: "Grand Seiko",
    model: "White Birch",
    variations: [
      {
        reference: "SLGH005",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 8400,
        description:
          "Birch tree texture dial. Hi-Beat 9SA5 calibre at 36,000 vph, 80-hour reserve. Evolution 9 case.",
      },
    ],
  },
  {
    brand: "Grand Seiko",
    model: "Green Iwate",
    variations: [
      {
        reference: "SLGH021",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 8400,
        description:
          "Deep green birch texture dial. Hi-Beat 9SA5 calibre, 80-hour power reserve.",
      },
    ],
  },
  // ===========================================================================
  // SEIKO
  // ===========================================================================
  {
    brand: "Seiko",
    model: "SKX007",
    variations: [
      {
        reference: "SKX007K2",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["day", "date"],
        retailPrice: 250,
        description:
          "Legendary affordable diver. 7S26 movement, ISO 6425 certified. Discontinued but iconic.",
      },
    ],
  },
  {
    brand: "Seiko",
    model: "Presage Cocktail Time",
    variations: [
      {
        reference: "SRPB43",
        sizeMm: 40.5,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "mineral",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 425,
        description:
          "Blue Starlight cocktail-inspired dial. 4R35 movement, 41-hour power reserve. Textured dial.",
      },
    ],
  },
  {
    brand: "Seiko",
    model: "King Turtle",
    variations: [
      {
        reference: "SRPE05",
        sizeMm: 45,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["day", "date"],
        retailPrice: 575,
        description:
          "Save the Ocean edition with gradient blue dial. 4R36 movement, Turtle case shape, sapphire crystal.",
      },
    ],
  },
  {
    brand: "Seiko",
    model: "Marinemaster 300",
    variations: [
      {
        reference: "SLA021",
        sizeMm: 44.3,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 5500,
        description:
          "Professional 300m diver. 8L35 hi-beat movement, Zaratsu polished case. Prospex line flagship.",
      },
    ],
  },
  // ===========================================================================
  // CITIZEN
  // ===========================================================================
  {
    brand: "Citizen",
    model: "Promaster Tough",
    variations: [
      {
        reference: "BN0211-50E",
        sizeMm: 42,
        movement: "solar",
        material: "titanium",
        color: "black",
        category: "field",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 350,
        description:
          "Super Titanium with DLC coating. Eco-Drive E168 movement. Shock-resistant and anti-magnetic.",
      },
    ],
  },
  {
    brand: "Citizen",
    model: "Tsuki-yomi",
    variations: [
      {
        reference: "BY1010-57L",
        sizeMm: 43,
        movement: "solar",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["chronograph", "moonphase", "date"],
        retailPrice: 550,
        description:
          "Eco-Drive moonphase chronograph. Radio-controlled timekeeping, perpetual calendar.",
      },
    ],
  },
  // ===========================================================================
  // ORIENT
  // ===========================================================================
  {
    brand: "Orient",
    model: "Mako II",
    variations: [
      {
        reference: "FAA02002D9",
        sizeMm: 41.5,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["day", "date"],
        retailPrice: 200,
        description:
          "In-house F6922 movement with hacking and hand-winding. Best value automatic diver.",
      },
    ],
  },
  {
    brand: "Orient",
    model: "Kamasu",
    variations: [
      {
        reference: "RA-AA0003R19B",
        sizeMm: 41.8,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["day", "date"],
        retailPrice: 325,
        description:
          "Sapphire crystal upgrade over the Mako. F6922 calibre, green sunburst dial.",
      },
    ],
  },
  {
    brand: "Orient",
    model: "Orient Star",
    variations: [
      {
        reference: "RE-AV0003L00B",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 21,
        complications: ["date", "power reserve indicator"],
        retailPrice: 500,
        description:
          "Open heart with power reserve indicator. In-house F6N43 movement, 50-hour reserve.",
      },
    ],
  },
  // ===========================================================================
  // CASIO
  // ===========================================================================
  {
    brand: "Casio",
    model: "G-Shock DW5600",
    variations: [
      {
        reference: "DW5600E-1V",
        sizeMm: 42.8,
        movement: "quartz",
        material: "resin",
        color: "black",
        category: "digital",
        braceletType: "resin strap",
        shape: "square",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 16,
        complications: ["alarm", "stopwatch", "countdown timer"],
        retailPrice: 55,
        description:
          "The original G-Shock square. Shock resistant, 200m water resistant, legendary toughness.",
      },
    ],
  },
  {
    brand: "Casio",
    model: "Oceanus",
    variations: [
      {
        reference: "OCW-S100-1AJF",
        sizeMm: 42.3,
        movement: "solar",
        material: "titanium",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date", "world time"],
        retailPrice: 600,
        description:
          "Titanium dress watch with Tough Solar and radio-controlled accuracy. Sapphire crystal.",
      },
    ],
  },
  // ===========================================================================
  // NOMOS
  // ===========================================================================
  {
    brand: "Nomos",
    model: "Club",
    variations: [
      {
        reference: "709",
        sizeMm: 36,
        movement: "manual wind",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 1460,
        description:
          "Sporty-casual Bauhaus. Alpha calibre manual wind, 43-hour power reserve.",
      },
    ],
  },
  {
    brand: "Nomos",
    model: "Ludwig",
    variations: [
      {
        reference: "205",
        sizeMm: 35,
        movement: "manual wind",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 17,
        complications: [],
        retailPrice: 1850,
        description:
          "Elegant classic with Roman numerals. Alpha calibre, Glashutte finishing.",
      },
    ],
  },
  {
    brand: "Nomos",
    model: "Orion",
    variations: [
      {
        reference: "309",
        sizeMm: 35,
        movement: "manual wind",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 17,
        complications: [],
        retailPrice: 1700,
        description:
          "Purest Bauhaus design with dot and dash markers. Alpha calibre, 43-hour reserve.",
      },
    ],
  },
  {
    brand: "Nomos",
    model: "Zurich Weltzeit",
    variations: [
      {
        reference: "805",
        sizeMm: 39.9,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "gmt",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["world time"],
        retailPrice: 5280,
        description:
          "World time with city ring. In-house DUW 5201 calibre, true home/away time display.",
      },
    ],
  },
  // ===========================================================================
  // SINN
  // ===========================================================================
  {
    brand: "Sinn",
    model: "104 St Sa",
    variations: [
      {
        reference: "104.011",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date", "day"],
        retailPrice: 1790,
        description:
          "Iconic German pilot watch. Sellita SW220-1, day-date, bidirectional bezel. 200m WR.",
      },
    ],
  },
  {
    brand: "Sinn",
    model: "U50",
    variations: [
      {
        reference: "1050.010",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 500,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 2590,
        description:
          "Submarine steel (same as U-boat hulls) diver. Tegiment hardened, Ar-dehumidifying tech.",
      },
    ],
  },
  {
    brand: "Sinn",
    model: "356 Pilot",
    variations: [
      {
        reference: "356.022",
        sizeMm: 38.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "acrylic",
        caseBack: "solid",
        origin: "German",
        lugWidthMm: 20,
        complications: ["chronograph", "date"],
        retailPrice: 2590,
        description:
          "Classic pilot chronograph with acrylic crystal. Valjoux 7750, 38.5mm wears perfectly.",
      },
    ],
  },
  // ===========================================================================
  // JUNGHANS
  // ===========================================================================
  {
    brand: "Junghans",
    model: "Meister Driver",
    variations: [
      {
        reference: "027/3607.04",
        sizeMm: 38,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date", "day"],
        retailPrice: 1500,
        description:
          "Automotive-inspired with tachymeter scale. J800.3 automatic movement, day-date.",
      },
    ],
  },
  // ===========================================================================
  // A. LANGE & SOHNE
  // ===========================================================================
  {
    brand: "A. Lange & Sohne",
    model: "Saxonia",
    variations: [
      {
        reference: "380.032",
        sizeMm: 38.5,
        movement: "manual wind",
        material: "gold",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 24700,
        description:
          "Pure two-hand dress watch. In-house L941.1 calibre, white gold case, 72-hour reserve.",
      },
    ],
  },
  {
    brand: "A. Lange & Sohne",
    model: "Lange 1",
    variations: [
      {
        reference: "191.032",
        sizeMm: 38.5,
        movement: "manual wind",
        material: "gold",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date", "power reserve indicator"],
        retailPrice: 44500,
        description:
          "Asymmetric dial with outsize date. L121.1 calibre, twin mainspring barrel, 72-hour reserve.",
      },
    ],
  },
  {
    brand: "A. Lange & Sohne",
    model: "1815",
    variations: [
      {
        reference: "235.032",
        sizeMm: 38.5,
        movement: "manual wind",
        material: "gold",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 26000,
        description:
          "Named for Ferdinand A. Lange's birth year. L051.1 calibre, railway track minute scale.",
      },
    ],
  },
  // ===========================================================================
  // GLASHUTTE ORIGINAL
  // ===========================================================================
  {
    brand: "Glashutte Original",
    model: "Senator Excellence",
    variations: [
      {
        reference: "1-36-01-05-02-70",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date", "moonphase"],
        retailPrice: 10700,
        description:
          "Senator with panorama date and moonphase. Calibre 36-04, 100-hour power reserve.",
      },
    ],
  },
  {
    brand: "Glashutte Original",
    model: "Seventies Chronograph",
    variations: [
      {
        reference: "1-37-02-09-02-70",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "tonneau",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["chronograph", "date"],
        retailPrice: 12100,
        description:
          "Retro tonneau-shaped chronograph with panorama date. Calibre 37-02, column wheel.",
      },
    ],
  },
  // ===========================================================================
  // TISSOT
  // ===========================================================================
  {
    brand: "Tissot",
    model: "Gentleman Powermatic 80",
    variations: [
      {
        reference: "T127.407.11.041.00",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 625,
        description:
          "Versatile dress/sport watch. Powermatic 80 movement with silicon hairspring. Great value.",
      },
    ],
  },
  {
    brand: "Tissot",
    model: "Seastar 1000",
    variations: [
      {
        reference: "T120.407.11.041.02",
        sizeMm: 40,
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
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 725,
        description:
          "Ceramic bezel diver. Powermatic 80 with silicon hairspring. 80-hour power reserve.",
      },
    ],
  },
  // ===========================================================================
  // HAMILTON
  // ===========================================================================
  {
    brand: "Hamilton",
    model: "Khaki Field Mechanical",
    variations: [
      {
        reference: "H69439931",
        sizeMm: 38,
        movement: "manual wind",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 495,
        description:
          "Military-heritage field watch. H-50 hand-wind with 80-hour power reserve. MIL-SPEC inspired.",
      },
    ],
  },
  {
    brand: "Hamilton",
    model: "Jazzmaster Open Heart",
    variations: [
      {
        reference: "H32675140",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: [],
        retailPrice: 1095,
        description:
          "Open heart dial reveals the balance wheel. H-10 movement with 80-hour reserve.",
      },
    ],
  },
  {
    brand: "Hamilton",
    model: "Ventura",
    variations: [
      {
        reference: "H24585331",
        sizeMm: 42.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "dress",
        braceletType: "leather strap",
        shape: "tonneau",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 17,
        complications: [],
        retailPrice: 1395,
        description:
          "Shield-shaped case worn by Elvis. Asymmetric design icon since 1957. H-10 automatic.",
      },
    ],
  },
  {
    brand: "Hamilton",
    model: "Intra-Matic Chronograph",
    variations: [
      {
        reference: "H38416711",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph"],
        retailPrice: 2195,
        description:
          "1960s-inspired panda dial chronograph. H-51 calibre with 60-hour power reserve.",
      },
    ],
  },
  // ===========================================================================
  // SEIKO 5 VARIATIONS
  // ===========================================================================
  {
    brand: "Seiko",
    model: "5 Sports Field",
    variations: [
      {
        reference: "SRPG27",
        sizeMm: 39.4,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "field",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "mineral",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["day", "date"],
        retailPrice: 275,
        description:
          "Field-style Seiko 5 with green dial. 4R36 movement, 41-hour power reserve.",
      },
    ],
  },
  {
    brand: "Seiko",
    model: "5 Sports GMT",
    variations: [
      {
        reference: "SSK001",
        sizeMm: 42.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "mineral",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["date", "GMT"],
        retailPrice: 475,
        description:
          "Affordable true GMT with caller function. 4R34 movement. Black and red bezel.",
      },
    ],
  },
  // ===========================================================================
  // TIMEX
  // ===========================================================================
  {
    brand: "Timex",
    model: "Marlin Automatic",
    variations: [
      {
        reference: "TW2T22700",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "acrylic",
        caseBack: "display",
        origin: "American",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 249,
        description:
          "Reissue of the 1960s Marlin. Miyota 8215 automatic, exhibition caseback, retro design.",
      },
    ],
  },
  {
    brand: "Timex",
    model: "Expedition North",
    variations: [
      {
        reference: "TW2V03600",
        sizeMm: 41,
        movement: "solar",
        material: "stainless steel",
        color: "green",
        category: "field",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "American",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 279,
        description:
          "Premium field watch with solar movement and sapphire crystal. Titanium-coated case.",
      },
    ],
  },
  {
    brand: "Timex",
    model: "Q Timex",
    variations: [
      {
        reference: "TW2V18500",
        sizeMm: 38,
        movement: "quartz",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "acrylic",
        caseBack: "solid",
        origin: "American",
        lugWidthMm: 18,
        complications: ["date"],
        retailPrice: 179,
        description:
          "Reissue of 1979 quartz diver. Rotating bezel, domed acrylic crystal, battery hatch.",
      },
    ],
  },
  // ===========================================================================
  // SWATCH
  // ===========================================================================
  {
    brand: "Swatch",
    model: "MoonSwatch Mission to Moon",
    variations: [
      {
        reference: "SO33M100",
        sizeMm: 42,
        movement: "quartz",
        material: "ceramic",
        color: "black",
        category: "chronograph",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "acrylic",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 260,
        description:
          "Bioceramic Speedmaster homage. Moon variant with black dial. Quartz chronograph.",
      },
    ],
  },
  {
    brand: "Swatch",
    model: "MoonSwatch Mission to Mars",
    variations: [
      {
        reference: "SO33R100",
        sizeMm: 42,
        movement: "quartz",
        material: "ceramic",
        color: "brown",
        category: "chronograph",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "acrylic",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 260,
        description:
          "Bioceramic Mars variant in rust-red. Speedmaster-inspired case design.",
      },
    ],
  },
  {
    brand: "Swatch",
    model: "MoonSwatch Mission to Neptune",
    variations: [
      {
        reference: "SO33N100",
        sizeMm: 42,
        movement: "quartz",
        material: "ceramic",
        color: "blue",
        category: "chronograph",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "acrylic",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 260,
        description:
          "Bioceramic Neptune variant in deep blue. Speedmaster-inspired quartz chronograph.",
      },
    ],
  },
  {
    brand: "Swatch",
    model: "MoonSwatch Mission to the Sun",
    variations: [
      {
        reference: "SO33J100",
        sizeMm: 42,
        movement: "quartz",
        material: "ceramic",
        color: "gold",
        category: "chronograph",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "acrylic",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "tachymeter"],
        retailPrice: 260,
        description:
          "Bioceramic Sun variant in gold/yellow. Bold colorway in Speedmaster form.",
      },
    ],
  },
  // ===========================================================================
  // BALTIC
  // ===========================================================================
  {
    brand: "Baltic",
    model: "Aquascaphe",
    variations: [
      {
        reference: "?"
          .replace("?", "AQUA-BLK-CRM"),
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 650,
        description:
          "French microbrand diver with vintage vibes. Miyota 9039 movement, domed sapphire crystal.",
      },
    ],
  },
  {
    brand: "Baltic",
    model: "HMS 002",
    variations: [
      {
        reference: "HMS-002-S-BLU",
        sizeMm: 38,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 490,
        description:
          "Marine-inspired dress watch. Miyota 9039, sector dial, domed sapphire. French-designed.",
      },
    ],
  },
  // ===========================================================================
  // MONTA
  // ===========================================================================
  {
    brand: "Monta",
    model: "Triumph",
    variations: [
      {
        reference: "M22-TRI-BLK-01",
        sizeMm: 38.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 150,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1850,
        description:
          "American-designed with Sellita SW200-1. Superb finishing for the price, quick-adjust bracelet.",
      },
    ],
  },
  {
    brand: "Monta",
    model: "Oceanking",
    variations: [
      {
        reference: "M22-OCK-BLU-01",
        sizeMm: 40.7,
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
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 2100,
        description:
          "Ceramic bezel diver from St. Louis. Sellita SW200-1, 300m WR, quick-adjust clasp.",
      },
    ],
  },
  // ===========================================================================
  // CHRISTOPHER WARD
  // ===========================================================================
  {
    brand: "Christopher Ward",
    model: "C60 Sealander",
    variations: [
      {
        reference: "C60-40ADA3-S0BB0-HB",
        sizeMm: 40,
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
        retailPrice: 1095,
        description:
          "300m diver with Sellita SW200-1. Light catcher case, ceramic bezel, quick-release bracelet.",
      },
    ],
  },
  {
    brand: "Christopher Ward",
    model: "C63 Sealander GMT",
    variations: [
      {
        reference: "C63-39AGM3-S0KK0-B0",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 150,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "GMT"],
        retailPrice: 1295,
        description:
          "True GMT with Sellita SW330-2. Light catcher case, 42-hour power reserve.",
      },
    ],
  },
  // ===========================================================================
  // DOXA
  // ===========================================================================
  {
    brand: "Doxa",
    model: "SUB 200",
    variations: [
      {
        reference: "799.10.351.10",
        sizeMm: 42,
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
        retailPrice: 1190,
        description:
          "Tonneau-cased dive heritage. ETA 2824-2, no-decompression bezel, 200m WR.",
      },
    ],
  },
  {
    brand: "Doxa",
    model: "SUB 300",
    variations: [
      {
        reference: "821.10.351.10",
        sizeMm: 42.5,
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
        complications: [],
        retailPrice: 2190,
        description:
          "Professional diver from 1967. ETA 2824-2, signed beads-of-rice bracelet, 300m WR.",
      },
    ],
  },
  // ===========================================================================
  // ORIS
  // ===========================================================================
  {
    brand: "Oris",
    model: "Aquis Date",
    variations: [
      {
        reference: "01 733 7730 4157",
        sizeMm: 41.5,
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
        retailPrice: 2250,
        description:
          "Modern diver with ceramic bezel insert. Calibre 733 (SW200 base), quick-strap change.",
      },
    ],
  },
  {
    brand: "Oris",
    model: "Divers Sixty-Five",
    variations: [
      {
        reference: "01 733 7707 4064",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "diver",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 2050,
        description:
          "Vintage-style diver with domed sapphire. Calibre 733, aluminum bezel insert, 38-hour reserve.",
      },
    ],
  },
  {
    brand: "Oris",
    model: "Big Crown Pointer Date",
    variations: [
      {
        reference: "01 754 7741 4065",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["pointer date"],
        retailPrice: 2150,
        description:
          "Iconic Big Crown with pointer date. Calibre 754, oversized crown for gloved operation.",
      },
    ],
  },
  // ===========================================================================
  // MARATHON
  // ===========================================================================
  {
    brand: "Marathon",
    model: "JSAR",
    variations: [
      {
        reference: "WW194018",
        sizeMm: 46,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 1600,
        description:
          "Jumbo Search and Rescue diver. 46mm, ETA 2824-2, tritium tubes, military-spec.",
      },
    ],
  },
  {
    brand: "Marathon",
    model: "Navigator",
    variations: [
      {
        reference: "WW194001",
        sizeMm: 41,
        movement: "quartz",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 60,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 800,
        description:
          "Military-issue navigator with date. Swiss quartz, tritium illumination, sterile dial.",
      },
    ],
  },
  // ===========================================================================
  // SHINOLA
  // ===========================================================================
  {
    brand: "Shinola",
    model: "Runwell",
    variations: [
      {
        reference: "S0120089902",
        sizeMm: 41,
        movement: "quartz",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "American",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 625,
        description:
          "Detroit-assembled with Argonite 1069 quartz. Beautifully finished dial and Horween leather.",
      },
    ],
  },
  {
    brand: "Shinola",
    model: "Canfield",
    variations: [
      {
        reference: "S0120169414",
        sizeMm: 43,
        movement: "quartz",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "American",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 795,
        description:
          "Chronograph from Detroit. Argonite 5021 quartz, Horween leather. American-built.",
      },
    ],
  },
  // ===========================================================================
  // BULOVA
  // ===========================================================================
  {
    brand: "Bulova",
    model: "Lunar Pilot",
    variations: [
      {
        reference: "96A225",
        sizeMm: 45,
        movement: "quartz",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "American",
        lugWidthMm: 22,
        complications: ["chronograph", "date"],
        retailPrice: 525,
        description:
          "Re-edition of the watch worn on Apollo 15. High-performance quartz, 262 kHz frequency.",
      },
    ],
  },
  {
    brand: "Bulova",
    model: "Precisionist",
    variations: [
      {
        reference: "96B252",
        sizeMm: 44,
        movement: "quartz",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "American",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 595,
        description:
          "262 kHz ultra-high-frequency quartz. Continuous sweep second hand, 300m water resistance.",
      },
    ],
  },
  // ===========================================================================
  // ADDITIONAL POPULAR WATCHES FOR 150+ TOTAL
  // ===========================================================================
  // Vacheron Constantin
  {
    brand: "Vacheron Constantin",
    model: "Overseas",
    variations: [
      {
        reference: "4500V/110A-B128",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 150,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 29500,
        description:
          "Integrated bracelet luxury sports watch. In-house 5100 calibre, interchangeable straps.",
      },
    ],
  },
  {
    brand: "Vacheron Constantin",
    model: "Patrimony",
    variations: [
      {
        reference: "85180/000R-9248",
        sizeMm: 40,
        movement: "automatic",
        material: "gold",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 22500,
        description:
          "Refined round dress watch. Rose gold case, in-house 2450 Q6 calibre, 40-hour reserve.",
      },
    ],
  },
  // Blancpain
  {
    brand: "Blancpain",
    model: "Fifty Fathoms",
    variations: [
      {
        reference: "5015-1130-52A",
        sizeMm: 45,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 23,
        complications: ["date"],
        retailPrice: 14800,
        description:
          "The original modern dive watch (1953). Calibre 1315, 120-hour power reserve, unidirectional bezel.",
      },
    ],
  },
  {
    brand: "Blancpain",
    model: "Fifty Fathoms Bathyscaphe",
    variations: [
      {
        reference: "5000-0130-B52A",
        sizeMm: 43,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 23,
        complications: ["date"],
        retailPrice: 11500,
        description:
          "Thinner, sleeker Fifty Fathoms. Calibre 1315, ceramic bezel insert, 120-hour reserve.",
      },
    ],
  },
  // Hublot
  {
    brand: "Hublot",
    model: "Big Bang",
    variations: [
      {
        reference: "301.SB.131.RX",
        sizeMm: 44,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 24,
        complications: ["chronograph", "date"],
        retailPrice: 17900,
        description:
          "Fusion of materials concept. HUB4100 calibre, ceramic bezel, 42-hour power reserve.",
      },
    ],
  },
  {
    brand: "Hublot",
    model: "Classic Fusion",
    variations: [
      {
        reference: "511.NX.1171.RX",
        sizeMm: 42,
        movement: "automatic",
        material: "titanium",
        color: "blue",
        category: "dress",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 7900,
        description:
          "Restrained Hublot design in titanium. HUB1112 calibre, 42-hour power reserve.",
      },
    ],
  },
  // Bell & Ross
  {
    brand: "Bell & Ross",
    model: "BR 03-92",
    variations: [
      {
        reference: "BR0392-D-BL-ST/SRB",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "pilot",
        braceletType: "rubber strap",
        shape: "square",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 24,
        complications: ["date"],
        retailPrice: 4200,
        description:
          "Square instrument-panel case inspired by cockpit clocks. BR-CAL.302 automatic.",
      },
    ],
  },
  {
    brand: "Bell & Ross",
    model: "BR 05",
    variations: [
      {
        reference: "BR05A-BL-ST/SST",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 5300,
        description:
          "Integrated bracelet sports watch. BR-CAL.321 automatic, urban-style from B&R.",
      },
    ],
  },
  // Frederique Constant
  {
    brand: "Frederique Constant",
    model: "Classics Moonphase",
    variations: [
      {
        reference: "FC-705V4S4",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "moonphase"],
        retailPrice: 1695,
        description:
          "In-house FC-705 calibre with moonphase. 42-hour power reserve. Classic dress styling.",
      },
    ],
  },
  {
    brand: "Frederique Constant",
    model: "Highlife Automatic",
    variations: [
      {
        reference: "FC-303V4NH6B",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 1295,
        description:
          "Integrated bracelet design. FC-303 calibre, interchangeable strap system.",
      },
    ],
  },
  // Rado
  {
    brand: "Rado",
    model: "Captain Cook",
    variations: [
      {
        reference: "R32105203",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 2250,
        description:
          "1960s heritage diver reissue. Powermatic 80.611, high-tech ceramic bezel insert.",
      },
    ],
  },
  {
    brand: "Rado",
    model: "True Square",
    variations: [
      {
        reference: "R27073152",
        sizeMm: 38,
        movement: "automatic",
        material: "ceramic",
        color: "black",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 2350,
        description:
          "High-tech ceramic monobloc case. Powermatic 80 movement, scratch-resistant ceramic.",
      },
    ],
  },
  // Baume & Mercier
  {
    brand: "Baume & Mercier",
    model: "Riviera",
    variations: [
      {
        reference: "M0A10620",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 3550,
        description:
          "Integrated bracelet sports watch with dodecagonal bezel. SW200-1 automatic.",
      },
    ],
  },
  // Tudor addition
  {
    brand: "Tudor",
    model: "Black Bay 58 Blue",
    variations: [
      {
        reference: "M79030B-0001",
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
        retailPrice: 3675,
        description:
          "Navy blue variant of the BB58. MT5402 COSC-certified, 70-hour power reserve.",
      },
    ],
  },
  // Breguet
  {
    brand: "Breguet",
    model: "Classique",
    variations: [
      {
        reference: "5177BR/15/9V6",
        sizeMm: 38,
        movement: "automatic",
        material: "gold",
        color: "silver",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 22200,
        description:
          "Engine-turned guilloche dial with Breguet hands. Calibre 777Q, silicon hairspring.",
      },
    ],
  },
  {
    brand: "Breguet",
    model: "Marine",
    variations: [
      {
        reference: "5517TI/Y1/9ZU",
        sizeMm: 40,
        movement: "automatic",
        material: "titanium",
        color: "blue",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 18600,
        description:
          "Sporty Breguet in titanium. Wave-pattern guilloche dial, calibre 777A, 55-hour reserve.",
      },
    ],
  },
  // Chopard
  {
    brand: "Chopard",
    model: "Alpine Eagle",
    variations: [
      {
        reference: "298600-3001",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 13700,
        description:
          "Lucent Steel A223 integrated bracelet sports watch. COSC-certified 01.01-C calibre.",
      },
    ],
  },
  // Girard-Perregaux
  {
    brand: "Girard-Perregaux",
    model: "Laureato",
    variations: [
      {
        reference: "81010-11-431-11A",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 13300,
        description:
          "Octagonal bezel sports watch from 1975. GP01800 in-house calibre, 54-hour reserve.",
      },
    ],
  },
  // Piaget
  {
    brand: "Piaget",
    model: "Polo Date",
    variations: [
      {
        reference: "G0A46018",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 14800,
        description:
          "Ultra-thin sports-luxury at 6.5mm. In-house 1110P calibre, cushion-shaped horizontal dial.",
      },
    ],
  },
  // Ulysse Nardin
  {
    brand: "Ulysse Nardin",
    model: "Marine Torpilleur",
    variations: [
      {
        reference: "1183-310-7M/40",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "power reserve indicator"],
        retailPrice: 7500,
        description:
          "Marine chronometer heritage. In-house UN-118 calibre, silicon technology, 60-hour reserve.",
      },
    ],
  },
  // Montblanc
  {
    brand: "Montblanc",
    model: "1858",
    variations: [
      {
        reference: "117580",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "field",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 3250,
        description:
          "Mountain exploration heritage. MB 24.08 calibre, 42-hour reserve, aged-bronze accents.",
      },
    ],
  },
  {
    brand: "Montblanc",
    model: "Heritage Chronometrie",
    variations: [
      {
        reference: "119945",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 3400,
        description:
          "Classic Montblanc dress watch. MB 24.20 calibre, 42-hour reserve, deployant clasp.",
      },
    ],
  },
  // Mido
  {
    brand: "Mido",
    model: "Ocean Star",
    variations: [
      {
        reference: "M026.430.11.041.00",
        sizeMm: 42.5,
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
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 950,
        description:
          "Ceramic bezel diver. Calibre 80 with 80-hour power reserve. Great entry luxury diver.",
      },
    ],
  },
  {
    brand: "Mido",
    model: "Baroncelli Heritage",
    variations: [
      {
        reference: "M027.407.16.010.00",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 780,
        description:
          "Elegant dress watch inspired by Rozzano architecture. Calibre 80, 80-hour reserve.",
      },
    ],
  },
  // Certina
  {
    brand: "Certina",
    model: "DS Action Diver",
    variations: [
      {
        reference: "C032.407.11.051.00",
        sizeMm: 43,
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
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 695,
        description:
          "Powermatic 80 diver with ceramic bezel. DS (Double Security) concept. Great value Swiss diver.",
      },
    ],
  },
  // Alpina
  {
    brand: "Alpina",
    model: "Startimer Pilot",
    variations: [
      {
        reference: "AL-525NN4S6",
        sizeMm: 44,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 1195,
        description:
          "Heritage pilot watch. AL-525 in-house calibre, 38-hour reserve, onion crown.",
      },
    ],
  },
  // Norqain
  {
    brand: "Norqain",
    model: "Freedom 60",
    variations: [
      {
        reference: "N2000S02A/B201/20EO.18S",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 2650,
        description:
          "Independent Swiss brand. Kenissi-based NN20/1 calibre, 70-hour reserve.",
      },
    ],
  },
  // Zodiac
  {
    brand: "Zodiac",
    model: "Super Sea Wolf",
    variations: [
      {
        reference: "ZO9508",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1395,
        description:
          "Heritage diver with colorful bezels. STP 1-11 automatic, 44-hour power reserve.",
      },
    ],
  },
  // Farer
  {
    brand: "Farer",
    model: "Lander IV",
    variations: [
      {
        reference: "LAN4-MK2",
        sizeMm: 39.5,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "gmt",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date", "GMT"],
        retailPrice: 1350,
        description:
          "Colorful British-designed GMT. Sellita SW330-2, fixed 24-hour bezel, 42-hour reserve.",
      },
    ],
  },
  // Squale
  {
    brand: "Squale",
    model: "1521",
    variations: [
      {
        reference: "1521-026/A",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 500,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 960,
        description:
          "500m-rated Italian-designed Swiss diver. ETA 2824-2, 38-hour reserve. Heritage dive brand.",
      },
    ],
  },
  // Ming
  {
    brand: "Ming",
    model: "27.02",
    variations: [
      {
        reference: "27.02",
        sizeMm: 38,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 2950,
        description:
          "Malaysian microbrand sensation. ETA 2824-2, integrated rubber strap, stunning finishing.",
      },
    ],
  },
  // Stowa
  {
    brand: "Stowa",
    model: "Flieger Classic",
    variations: [
      {
        reference: "FL-CL-40-AUTOMATIC",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 1090,
        description:
          "Original Big 5 flieger maker. ETA 2824-2 Top grade, Bauhaus pilot design, 38-hour reserve.",
      },
    ],
  },
  // Seiko Prospex additions
  {
    brand: "Seiko",
    model: "Prospex Willard",
    variations: [
      {
        reference: "SPB151",
        sizeMm: 42.7,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 1300,
        description:
          "Reissue of Captain Willard from Apocalypse Now. 6R35 calibre, cushion case, 70-hour reserve.",
      },
    ],
  },
  {
    brand: "Seiko",
    model: "Prospex LX SNR029",
    variations: [
      {
        reference: "SNR029",
        sizeMm: 44.8,
        movement: "automatic",
        material: "titanium",
        color: "black",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["date", "power reserve indicator"],
        retailPrice: 3400,
        description:
          "Spring Drive titanium diver. 5R65 calibre, 72-hour reserve, zaratsu-polished.",
      },
    ],
  },
  // Glycine
  {
    brand: "Glycine",
    model: "Combat Sub",
    variations: [
      {
        reference: "GL0185",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 650,
        description:
          "Value Swiss diver. GL224 (ETA 2824-2) automatic, 38-hour reserve, unidirectional bezel.",
      },
    ],
  },
  {
    brand: "Glycine",
    model: "Airman",
    variations: [
      {
        reference: "GL0166",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date", "GMT"],
        retailPrice: 1250,
        description:
          "Original 24-hour purist GMT from the 1950s. GL293 calibre, true traveler's watch.",
      },
    ],
  },
  // MeisterSinger
  {
    brand: "MeisterSinger",
    model: "Perigraph",
    variations: [
      {
        reference: "AM1003",
        sizeMm: 43,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 2390,
        description:
          "Single-hand watch with date. Sellita SW200-1, read time to 5-minute intervals. Unique concept.",
      },
    ],
  },
  // Tutima
  {
    brand: "Tutima",
    model: "Flieger Friday",
    variations: [
      {
        reference: "6105-03",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1190,
        description:
          "German flieger with Miyota 821A movement. Military heritage, coin-edge case.",
      },
    ],
  },
  // Muhle Glashutte
  {
    brand: "Muhle Glashutte",
    model: "Teutonia IV",
    variations: [
      {
        reference: "M1-44-05-MB",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1950,
        description:
          "Glashutte-made dress watch. SW200-1 with proprietary Woodpecker neck regulation.",
      },
    ],
  },
  // Laco
  {
    brand: "Laco",
    model: "Augsburg 39",
    variations: [
      {
        reference: "861988",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "German",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 590,
        description:
          "Original Big 5 flieger brand. Miyota 821A, Type A dial, blued steel hands.",
      },
    ],
  },
  // Vaer
  {
    brand: "Vaer",
    model: "C5 Field",
    variations: [
      {
        reference: "C5-FLD-BLK",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "American",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 449,
        description:
          "American-assembled field watch. Miyota 9039, sapphire crystal, ocean-plastic strap option.",
      },
    ],
  },
  {
    brand: "Vaer",
    model: "D5 Tropic Diver",
    variations: [
      {
        reference: "D5-TRP-BLU",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "American",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 549,
        description:
          "American-assembled diver. Miyota 9039, 200m WR, tropic rubber strap.",
      },
    ],
  },
  // Lorier
  {
    brand: "Lorier",
    model: "Neptune V",
    variations: [
      {
        reference: "NEP-V-BLK",
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
        complications: ["date"],
        retailPrice: 599,
        description:
          "NYC-designed vintage-style diver. Miyota 90S5, domed sapphire, beads of rice bracelet.",
      },
    ],
  },
  // Sinn additional
  {
    brand: "Sinn",
    model: "EZM 3",
    variations: [
      {
        reference: "603.010",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date", "countdown timer"],
        retailPrice: 2290,
        description:
          "Mission timer for pilots. Ar-dehumidifying, captive countdown bezel, ETA 2824-2.",
      },
    ],
  },
  // Omega Speedmaster Sapphire variant
  {
    brand: "Omega",
    model: "Speedmaster Moonwatch Sapphire",
    variations: [
      {
        reference: "310.30.42.50.01.002",
        sizeMm: 42,
        movement: "manual wind",
        material: "stainless steel",
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
        retailPrice: 7100,
        description:
          "Sapphire sandwich variant of the Moonwatch. Calibre 3861, exhibition caseback.",
      },
    ],
  },
  // Rolex OP
  {
    brand: "Rolex",
    model: "Oyster Perpetual 36",
    variations: [
      {
        reference: "126000",
        sizeMm: 36,
        movement: "automatic",
        material: "stainless steel",
        color: "green",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 5900,
        description:
          "Time-only Rolex in vibrant green. Calibre 3230, 70-hour power reserve. Clean and versatile.",
      },
    ],
  },
  // More microbrands
  {
    brand: "Halios",
    model: "Fairwind",
    variations: [
      {
        reference: "FW-BLU",
        sizeMm: 39,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "diver",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 200,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 735,
        description:
          "Canadian microbrand with cult following. Miyota 9039, 12-hour bezel, outstanding finishing.",
      },
    ],
  },
  // Brew
  {
    brand: "Brew",
    model: "Metric",
    variations: [
      {
        reference: "METRIC-BLK",
        sizeMm: 36,
        movement: "quartz",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 18,
        complications: ["chronograph"],
        retailPrice: 375,
        description:
          "Coffee-inspired NYC brand. Meca-quartz VK64, retro-modern chronograph styling.",
      },
    ],
  },
  // Omega Planet Ocean 600m GMT
  {
    brand: "Omega",
    model: "Seamaster Planet Ocean GMT",
    variations: [
      {
        reference: "215.30.44.22.01.001",
        sizeMm: 43.5,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "gmt",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 600,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date", "GMT"],
        retailPrice: 8350,
        description:
          "Planet Ocean with dual time zone. Co-Axial Master Chronometer 8906, bi-color ceramic bezel.",
      },
    ],
  },
  // Tissot PRX Quartz
  {
    brand: "Tissot",
    model: "PRX Quartz",
    variations: [
      {
        reference: "T137.410.11.041.00",
        sizeMm: 40,
        movement: "quartz",
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
        retailPrice: 375,
        description:
          "Quartz version of the PRX. Swiss ETA quartz, integrated bracelet, unbeatable value.",
      },
    ],
  },
  // G-Shock metal
  {
    brand: "Casio",
    model: "G-Shock Full Metal",
    variations: [
      {
        reference: "GMW-B5000D-1",
        sizeMm: 43.2,
        movement: "solar",
        material: "stainless steel",
        color: "silver",
        category: "digital",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 16,
        complications: ["alarm", "stopwatch", "world time"],
        retailPrice: 550,
        description:
          "Full stainless steel G-Shock square. Tough Solar, Bluetooth, multi-band 6 radio sync.",
      },
    ],
  },
  // More IWC
  {
    brand: "IWC",
    model: "Pilot Chronograph",
    variations: [
      {
        reference: "IW388101",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["chronograph", "date"],
        retailPrice: 7950,
        description:
          "Pilot chrono with in-house 69385 calibre. 46-hour reserve, soft-iron inner case.",
      },
    ],
  },
  // Moser
  {
    brand: "H. Moser & Cie",
    model: "Streamliner Flyback Chronograph",
    variations: [
      {
        reference: "6902-1200",
        sizeMm: 42.3,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 120,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["chronograph", "flyback"],
        retailPrice: 32900,
        description:
          "Integrated bracelet flyback chrono. In-house HMC 902, fume dial, 54-hour reserve.",
      },
    ],
  },
  // More Longines
  {
    brand: "Longines",
    model: "Legend Diver",
    variations: [
      {
        reference: "L3.774.4.90.2",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 300,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 21,
        complications: ["date"],
        retailPrice: 2575,
        description:
          "Heritage diver with internal rotating bezel. L888.5 calibre, 72-hour reserve, no-date option.",
      },
    ],
  },
  // Zenith Defy Skyline
  {
    brand: "Zenith",
    model: "Defy Skyline",
    variations: [
      {
        reference: "03.9300.3620/51.I001",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 22,
        complications: ["date"],
        retailPrice: 8100,
        description:
          "Integrated bracelet entry. El Primero 3620 at 36,000 vph, 1/10th second display, 60-hour reserve.",
      },
    ],
  },
  // Seiko Presage Sharp Edged
  {
    brand: "Seiko",
    model: "Presage Sharp Edged",
    variations: [
      {
        reference: "SPB167",
        sizeMm: 39.3,
        movement: "automatic",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 975,
        description:
          "Aitetsu blue hemp leaf dial. 6R35 movement, 70-hour reserve, razor-sharp case lines.",
      },
    ],
  },
  // Grand Seiko Sport
  {
    brand: "Grand Seiko",
    model: "Sport GMT",
    variations: [
      {
        reference: "SBGE257",
        sizeMm: 40.5,
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
        complications: ["date", "GMT", "power reserve indicator"],
        retailPrice: 6200,
        description:
          "Spring Drive GMT with Mt. Iwate dial texture. 9R66 calibre, 72-hour reserve.",
      },
    ],
  },
  // Omega De Ville Trésor
  {
    brand: "Omega",
    model: "De Ville Tresor",
    variations: [
      {
        reference: "435.13.40.21.03.001",
        sizeMm: 40,
        movement: "manual wind",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 5100,
        description:
          "Ultra-thin manual wind dress watch. Master Chronometer 8910 calibre, 72-hour reserve.",
      },
    ],
  },
  // MB&F
  {
    brand: "MB&F",
    model: "HM7 Aquapod",
    variations: [
      {
        reference: "70.SRL.B",
        sizeMm: 53.8,
        movement: "automatic",
        material: "titanium",
        color: "blue",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 24,
        complications: ["date"],
        retailPrice: 115000,
        description:
          "Jellyfish-inspired horological machine. Flying tourbillon visible from every angle.",
      },
    ],
  },
  // Junghans Form A
  {
    brand: "Junghans",
    model: "Form A",
    variations: [
      {
        reference: "027/4731.00",
        sizeMm: 39.3,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "mineral",
        caseBack: "solid",
        origin: "German",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 745,
        description:
          "Bauhaus dress watch at an accessible price. J800.1 automatic, clean minimal design.",
      },
    ],
  },
  // Fortis
  {
    brand: "Fortis",
    model: "Flieger F-41 Automatic",
    variations: [
      {
        reference: "F4220007",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "nato strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1495,
        description:
          "Space-heritage Swiss pilot watch. UW-30 calibre (Werk 11 base), 38-hour reserve.",
      },
    ],
  },
  // Omega Speedmaster Reduced
  {
    brand: "Omega",
    model: "Speedmaster 38",
    variations: [
      {
        reference: "324.30.38.50.01.001",
        sizeMm: 38,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "chronograph",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 18,
        complications: ["chronograph", "date", "tachymeter"],
        retailPrice: 5600,
        description:
          "Smaller Speedmaster for slimmer wrists. Co-Axial 3330 calibre, column-wheel chronograph.",
      },
    ],
  },
  // Seiko Turtle
  {
    brand: "Seiko",
    model: "Prospex Turtle",
    variations: [
      {
        reference: "SRPE93",
        sizeMm: 45,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "diver",
        braceletType: "rubber strap",
        shape: "round",
        waterResistanceM: 200,
        crystal: "mineral",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["day", "date"],
        retailPrice: 495,
        description:
          "Cushion-case diver nicknamed Turtle. 4R36 calibre, 41-hour reserve. Iconic case shape.",
      },
    ],
  },
  // Omega Railmaster
  {
    brand: "Omega",
    model: "Seamaster Railmaster",
    variations: [
      {
        reference: "220.10.40.20.01.001",
        sizeMm: 40,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 150,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: [],
        retailPrice: 5400,
        description:
          "Anti-magnetic field watch from the Seamaster trilogy. Master Chronometer 8806.",
      },
    ],
  },
  // Cartier Panthere
  {
    brand: "Cartier",
    model: "Panthere de Cartier",
    variations: [
      {
        reference: "WSPN0007",
        sizeMm: 27,
        movement: "quartz",
        material: "stainless steel",
        color: "silver",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "square",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 14,
        complications: [],
        retailPrice: 4250,
        description:
          "Art Deco icon revived. Swiss quartz, link bracelet, hidden clasp, Roman numeral dial.",
      },
    ],
  },
  // Rolex Submariner no-date
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
          "Pure no-date Submariner. Calibre 3230, 70-hour power reserve. Clean symmetry.",
      },
    ],
  },
  // Hamilton Khaki Auto
  {
    brand: "Hamilton",
    model: "Khaki Field Auto",
    variations: [
      {
        reference: "H70455133",
        sizeMm: 38,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "field",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 595,
        description:
          "Automatic field watch with H-10 movement. 80-hour power reserve, Swiss made at $595.",
      },
    ],
  },
  // Orient Sun and Moon
  {
    brand: "Orient",
    model: "Sun and Moon",
    variations: [
      {
        reference: "RA-AK0009T10B",
        sizeMm: 42,
        movement: "automatic",
        material: "stainless steel",
        color: "white",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 50,
        crystal: "mineral",
        caseBack: "display",
        origin: "Japanese",
        lugWidthMm: 22,
        complications: ["date", "day", "moonphase"],
        retailPrice: 350,
        description:
          "Day-night indicator and day of week. In-house F6B24 calibre, 40-hour reserve.",
      },
    ],
  },
  // Omega Seamaster 300
  {
    brand: "Omega",
    model: "Seamaster 300",
    variations: [
      {
        reference: "234.30.41.21.01.001",
        sizeMm: 41,
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
        retailPrice: 6650,
        description:
          "Heritage 300 reborn. Master Chronometer 8912, sandwich dial, bronze-gold markers.",
      },
    ],
  },
  // Tudor Royal
  {
    brand: "Tudor",
    model: "Royal",
    variations: [
      {
        reference: "M28600-0005",
        sizeMm: 41,
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
        lugWidthMm: 21,
        complications: ["date", "day"],
        retailPrice: 2475,
        description:
          "Integrated bracelet day-date at a great price. T603 calibre, knurled bezel.",
      },
    ],
  },
  // Citizen Eco-Drive One
  {
    brand: "Citizen",
    model: "Eco-Drive One",
    variations: [
      {
        reference: "AR5000-50E",
        sizeMm: 39,
        movement: "solar",
        material: "stainless steel",
        color: "black",
        category: "dress",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 30,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Japanese",
        lugWidthMm: 18,
        complications: [],
        retailPrice: 3500,
        description:
          "World's thinnest light-powered watch at 2.98mm. Calibre 8826, ceramic bezel.",
      },
    ],
  },
  // Longines Conquest VHP
  {
    brand: "Longines",
    model: "Conquest VHP",
    variations: [
      {
        reference: "L3.716.4.76.6",
        sizeMm: 41,
        movement: "quartz",
        material: "stainless steel",
        color: "blue",
        category: "dress",
        braceletType: "steel bracelet",
        shape: "round",
        waterResistanceM: 50,
        crystal: "sapphire",
        caseBack: "solid",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1100,
        description:
          "Very High Precision quartz (+/- 5 sec/year). GPD gear-position detection, perpetual calendar.",
      },
    ],
  },
  // Oris ProPilot
  {
    brand: "Oris",
    model: "ProPilot",
    variations: [
      {
        reference: "01 751 7761 4065",
        sizeMm: 41,
        movement: "automatic",
        material: "stainless steel",
        color: "black",
        category: "pilot",
        braceletType: "leather strap",
        shape: "round",
        waterResistanceM: 100,
        crystal: "sapphire",
        caseBack: "display",
        origin: "Swiss",
        lugWidthMm: 20,
        complications: ["date"],
        retailPrice: 1850,
        description:
          "Modern pilot with Calibre 751 (SW200 base). Signed crown, quick-set date.",
      },
    ],
  },
];

async function seed() {
  console.log(`Seeding ${WATCHES.length} watch families...`);

  let familiesCreated = 0;
  let referencesCreated = 0;

  for (const watch of WATCHES) {
    const familySlug = slugify(`${watch.brand}-${watch.model}`);

    // Insert family
    const [family] = await db
      .insert(watchFamilies)
      .values({
        slug: familySlug,
        brand: watch.brand,
        model: watch.model,
      })
      .onConflictDoNothing()
      .returning();

    // Get family ID (either just created or existing)
    const familyId =
      family?.id ||
      (
        await db
          .select()
          .from(watchFamilies)
          .where(eq(watchFamilies.slug, familySlug))
          .limit(1)
      )[0]?.id;

    if (!familyId) {
      console.log(`  SKIP: Could not get familyId for ${watch.brand} ${watch.model}`);
      continue;
    }

    if (family) familiesCreated++;

    // Insert variations
    for (const v of watch.variations) {
      const refSlug = slugify(`${watch.brand}-${watch.model}-${v.reference}`);
      const result = await db
        .insert(watchReferences)
        .values({
          slug: refSlug,
          brand: watch.brand,
          model: watch.model,
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
        })
        .onConflictDoNothing()
        .returning();

      if (result.length > 0) referencesCreated++;
    }

    console.log(`  ${watch.brand} ${watch.model} (${watch.variations.length} variation(s))`);
  }

  // Count totals
  const totalFamilies = await db.select().from(watchFamilies);
  const totalRefs = await db.select().from(watchReferences);

  console.log(`\n--- Summary ---`);
  console.log(`New families created: ${familiesCreated}`);
  console.log(`New references created: ${referencesCreated}`);
  console.log(`Total families in DB: ${totalFamilies.length}`);
  console.log(`Total references in DB: ${totalRefs.length}`);
  console.log("Done!");
}

seed().catch(console.error);
