import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type VehicleData = {
  brand: string;
  models: {
    name: string;
    variants: string[];
  }[];
};

/**
 * Diesel-only used-car catalog for India.
 *
 * Notes:
 * - This catalog intentionally excludes petrol-only, CNG-only and EV-only models.
 * - Discontinued diesel models are included because this is a USED-car marketplace.
 * - Variant names are common diesel trim names; exact trims varied by model year.
 * - Fuel type is NOT stored in the catalog. Your Car.fuelType should be DIESEL.
 */
const vehicleCatalog: VehicleData[] = [
  {
    brand: "Maruti Suzuki",
    models: [
      {
        name: "Swift",
        variants: ["LDi", "VDi", "VDi ABS", "ZDi", "ZDi+"],
      },
      {
        name: "Dzire",
        variants: ["LDi", "VDi", "VDi ABS", "ZDi", "ZDi+"],
      },
      {
        name: "Baleno",
        variants: ["Sigma", "Delta", "Zeta", "Alpha"],
      },
      {
        name: "Ciaz",
        variants: ["VDi", "ZDi", "ZDi+"],
      },
      {
        name: "Ertiga",
        variants: ["LDi", "VDi", "ZDi", "ZDi+"],
      },
      {
        name: "Vitara Brezza",
        variants: ["LDi", "LDi(O)", "VDi", "VDi(O)", "ZDi", "ZDi+"],
      },
      {
        name: "S-Cross",
        variants: ["Sigma", "Delta", "Zeta", "Alpha"],
      },
      {
        name: "SX4",
        variants: ["VDi", "ZDi"],
      },
      {
        name: "Ritz",
        variants: ["LDi", "VDi", "VDi ABS", "ZDi"],
      },
    ],
  },
  {
    brand: "Hyundai",
    models: [
      { name: "i10", variants: ["Magna", "Sportz"] },
      { name: "Grand i10", variants: ["Magna", "Sportz", "Asta"] },
      { name: "Grand i10 Nios", variants: ["Magna", "Sportz"] },
      { name: "i20", variants: ["Magna", "Sportz", "Asta"] },
      { name: "i20 Active", variants: ["S", "SX", "SX Dual Tone"] },
      { name: "Xcent", variants: ["Base", "S", "SX", "SX(O)"] },
      { name: "Verna", variants: ["E", "EX", "S", "SX", "SX(O)"] },
      { name: "Aura", variants: ["E", "S", "SX", "SX(O)"] },
      { name: "Venue", variants: ["E", "S", "S(O)", "SX", "SX(O)"] },
      { name: "Creta", variants: ["E", "EX", "S", "S(O)", "SX", "SX(O)"] },
      { name: "Alcazar", variants: ["Prestige", "Platinum", "Signature"] },
      { name: "Tucson", variants: ["GL", "GLS", "SX", "Signature"] },
      { name: "Elantra", variants: ["S", "SX", "SX(O)"] },
      { name: "Santa Fe", variants: ["2WD", "4WD"] },
    ],
  },

  {
    brand: "Tata",
    models: [
      { name: "Indica", variants: ["LS", "LX", "VX"] },
      { name: "Indica Vista", variants: ["LS", "LX", "VX"] },
      { name: "Indigo", variants: ["CS", "LS", "LX", "VX"] },
      { name: "Indigo Manza", variants: ["Aqua", "Aura", "Elan"] },
      { name: "Zest", variants: ["XE", "XM", "XMS", "XZ"] },
      { name: "Bolt", variants: ["XE", "XM", "XMS", "XT"] },
      { name: "Tiago", variants: ["XE", "XM", "XZ"] },
      { name: "Tigor", variants: ["XE", "XM", "XZ", "XZ+"] },
      { name: "Altroz", variants: ["XE", "XM+", "XZ", "XZ+"] },
      { name: "Nexon", variants: ["XE", "XM", "XZ", "XZ+"] },
      { name: "Nexon EV", variants: [] },
      { name: "Harrier", variants: ["XE", "XM", "XZ", "XZ+", "XZA+"] },
      { name: "Safari", variants: ["XE", "XM", "XZ", "XZ+", "XZA+"] },
      { name: "Safari Storme", variants: ["VX", "VX 4x4"] },
      { name: "Hexa", variants: ["XE", "XM", "XT", "XMA", "XT 4x4"] },
      { name: "Aria", variants: ["Pure", "Prestige", "Pride"] },
    ],
  },

  {
    brand: "Mahindra",
    models: [
      { name: "Bolero", variants: ["DI", "Plus", "Power+", "B4", "B6"] },
      { name: "Bolero Neo", variants: ["N4", "N8", "N10", "N10(O)"] },
      { name: "Scorpio", variants: ["S3", "S5", "S7", "S9", "S11"] },
      { name: "Scorpio-N", variants: ["Z2", "Z4", "Z6", "Z8", "Z8L"] },
      { name: "Thar", variants: ["AX", "LX"] },
      { name: "Thar Roxx", variants: ["MX1", "MX3", "AX3", "AX5", "AX7"] },
      { name: "XUV500", variants: ["W5", "W6", "W7", "W9", "W11"] },
      { name: "XUV700", variants: ["MX", "AX3", "AX5", "AX7", "AX7L"] },
      { name: "XUV300", variants: ["W4", "W6", "W8", "W8(O)"] },
      { name: "XUV 3XO", variants: ["MX1", "MX2 Pro", "MX3", "AX5", "AX7"] },
      { name: "Marazzo", variants: ["M2", "M4", "M6", "M8"] },
      { name: "KUV100", variants: ["K2", "K4", "K6", "K8"] },
      { name: "KUV100 NXT", variants: ["K2", "K4", "K6", "K8"] },
      { name: "TUV300", variants: ["T4", "T6", "T8", "T10"] },
      { name: "TUV300 Plus", variants: ["P4", "P6", "P8", "P10"] },
      { name: "Xylo", variants: ["D2", "D4", "H4", "H8", "H9"] },
      { name: "Quanto", variants: ["C2", "C4", "C6", "C8"] },
      { name: "Alturas G4", variants: ["2WD", "4WD"] },
    ],
  },

  {
    brand: "Toyota",
    models: [
      { name: "Etios", variants: ["J", "G", "V", "VX"] },
      { name: "Etios Liva", variants: ["G", "V", "VX"] },
      { name: "Etios Cross", variants: ["G", "V"] },
      { name: "Innova", variants: ["E", "G", "GX", "VX", "ZX"] },
      { name: "Innova Crysta", variants: ["G", "GX", "VX", "ZX"] },
      { name: "Fortuner", variants: ["4x2", "4x4", "4x2 AT", "4x4 AT"] },
      { name: "Corolla Altis", variants: ["G", "GL", "D-4D", "D-4D GL"] },
      { name: "Urban Cruiser", variants: ["Mid", "High", "Premium"] },
      { name: "Hilux", variants: ["Standard", "High", "High AT"] },
    ],
  },

  {
    brand: "Kia",
    models: [
      {
        name: "Seltos",
        variants: ["HTE", "HTK", "HTK+", "HTX", "GTX+", "X-Line"],
      },
      {
        name: "Sonet",
        variants: ["HTE", "HTK", "HTK+", "HTX", "GTX+", "X-Line"],
      },
      {
        name: "Carens",
        variants: ["Premium", "Prestige", "Prestige+", "Luxury", "Luxury+"],
      },
      { name: "Carnival", variants: ["Premium", "Prestige", "Limousine"] },
      { name: "Carnival Limousine", variants: ["Limousine", "Limousine+"] },
    ],
  },

  {
    brand: "MG",
    models: [
      { name: "Hector", variants: ["Style", "Super", "Smart", "Sharp"] },
      { name: "Hector Plus", variants: ["Style", "Super", "Smart", "Sharp"] },
      { name: "Gloster", variants: ["Super", "Smart", "Sharp", "Savvy"] },
    ],
  },

  {
    brand: "Ford",
    models: [
      { name: "Figo", variants: ["Ambiente", "Trend", "Titanium"] },
      { name: "Aspire", variants: ["Ambiente", "Trend", "Titanium"] },
      { name: "Freestyle", variants: ["Ambiente", "Trend", "Titanium"] },
      { name: "EcoSport", variants: ["Ambiente", "Trend", "Titanium", "S"] },
      {
        name: "Endeavour",
        variants: ["Trend", "Titanium", "Titanium+", "Sport"],
      },
    ],
  },

  {
    brand: "Chevrolet",
    models: [
      { name: "Beat", variants: ["PS", "LS", "LT", "LTZ"] },
      { name: "Sail", variants: ["1.3 LS", "1.3 LT", "1.3 LT ABS"] },
      { name: "Sail U-VA", variants: ["1.3 LS", "1.3 LT", "1.3 LT ABS"] },
      { name: "Cruze", variants: ["LT", "LTZ"] },
      { name: "Enjoy", variants: ["1.3 LS", "1.3 LT", "1.3 LTZ"] },
      { name: "Captiva", variants: ["LT", "LTZ"] },
      { name: "Trailblazer", variants: ["LT", "LTZ"] },
    ],
  },

  {
    brand: "Isuzu",
    models: [
      { name: "D-Max", variants: ["Standard", "S-CAB", "Hi-Lander"] },
      { name: "V-Cross", variants: ["Standard", "High", "Z Prestige"] },
      { name: "MU-X", variants: ["4x2", "4x4"] },
    ],
  },

  {
    brand: "Renault",
    models: [
      { name: "Duster", variants: ["RXE", "RXS", "RXZ"] },
      { name: "Lodgy", variants: ["RxE", "RxL", "RxZ", "Stepway"] },
      { name: "Fluence", variants: ["E2", "E4", "E4 AMT"] },
      { name: "Captur", variants: ["RXE", "RXL", "RXT", "Platine"] },
    ],
  },

  {
    brand: "Nissan",
    models: [
      { name: "Micra", variants: ["XL", "XV", "XV Premium"] },
      { name: "Sunny", variants: ["XE", "XL", "XV", "XV Premium"] },
      { name: "Terrano", variants: ["XE", "XL", "XV", "XV Premium"] },
      { name: "Kicks", variants: ["XL", "XV", "XV Premium"] },
      { name: "Evalia", variants: ["XE", "XL", "XV"] },
    ],
  },

  {
    brand: "Volkswagen",
    models: [
      {
        name: "Polo",
        variants: ["Trendline", "Comfortline", "Highline", "Highline Plus"],
      },
      {
        name: "Vento",
        variants: ["Trendline", "Comfortline", "Highline", "Highline Plus"],
      },
      { name: "Ameo", variants: ["Trendline", "Comfortline", "Highline"] },
      { name: "Jetta", variants: ["Trendline", "Comfortline", "Highline"] },
      { name: "Passat", variants: ["Comfortline", "Highline"] },
      { name: "Tiguan", variants: ["Comfortline", "Highline"] },
    ],
  },

  {
    brand: "Skoda",
    models: [
      { name: "Fabia", variants: ["Active", "Ambition", "Elegance"] },
      { name: "Rapid", variants: ["Active", "Ambition", "Style"] },
      { name: "Laura", variants: ["Ambiente", "Ambition", "Elegance"] },
      { name: "Octavia", variants: ["Ambition", "Style", "Elegance"] },
      { name: "Superb", variants: ["Ambition", "Style", "Laurin & Klement"] },
      { name: "Yeti", variants: ["Active", "Ambition", "Elegance"] },
      { name: "Kodiaq", variants: ["Style", "Laurin & Klement"] },
      { name: "Karoq", variants: ["Style"] },
    ],
  },
];

async function main() {
  console.log("Starting diesel vehicle catalog seed...");

  let brandCount = 0;
  let modelCount = 0;
  let variantCount = 0;

  for (const brandData of vehicleCatalog) {
    const brand = await prisma.vehicleBrand.upsert({
      where: { name: brandData.brand },
      update: { isActive: true },
      create: {
        name: brandData.brand,
        isActive: true,
      },
    });

    brandCount++;

    for (const modelData of brandData.models) {
      // Skip intentionally empty/non-diesel models.
      if (modelData.variants.length === 0) continue;

      const model = await prisma.vehicleModel.upsert({
        where: {
          brandId_name: {
            brandId: brand.id,
            name: modelData.name,
          },
        },
        update: { isActive: true },
        create: {
          brandId: brand.id,
          name: modelData.name,
          isActive: true,
        },
      });

      modelCount++;

      for (const variantName of modelData.variants) {
        await prisma.vehicleVariant.upsert({
          where: {
            modelId_name: {
              modelId: model.id,
              name: variantName,
            },
          },
          update: { isActive: true },
          create: {
            modelId: model.id,
            name: variantName,
            isActive: true,
          },
        });

        variantCount++;
      }
    }
  }

  console.log(`Brands processed: ${brandCount}`);
  console.log(`Models processed: ${modelCount}`);
  console.log(`Variants processed: ${variantCount}`);
  console.log("Diesel vehicle catalog seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Vehicle catalog seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
