import { randomUUID } from "node:crypto";
import { SquareClient, SquareEnvironment } from "square";

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Sandbox,
});

async function main() {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error("Set SQUARE_ACCESS_TOKEN in .env first.");
  }

  const locationsRes = await client.locations.list();
  const locations = locationsRes.locations ?? [];
  const primary = locations.find((l) => l.status === "ACTIVE" && l.id);
  if (!primary?.id) {
    throw new Error("No active sandbox location found.");
  }

  const locationId = primary.id;
  console.log(`Seeding catalog for location: ${primary.name} (${locationId})`);

  let categoryCount = 0;
  let itemCount = 0;
  let hasBreakfastCategory = false;
  const page = await client.catalog.list({ types: "CATEGORY,ITEM" });
  for await (const obj of page) {
    if (obj.type === "CATEGORY") {
      categoryCount++;
      if (obj.categoryData?.name === "Breakfast") {
        hasBreakfastCategory = true;
      }
    } else if (obj.type === "ITEM") {
      itemCount++;
    }
  }
  const hasDemoMenu = hasBreakfastCategory && itemCount >= 6;
  if (hasDemoMenu) {
    console.log("Catalog already seeded, skipping.");
    console.log("Delete items in Square dashboard to seed again.");
    return;
  }

  // Optional second location for multi-location demos
  let secondLocationId: string | undefined;
  const existingSecond = locations.find(
    (l) => l.id !== locationId && l.status === "ACTIVE",
  );
  if (existingSecond?.id) {
    secondLocationId = existingSecond.id;
  } else {
    const created = await client.locations.create({
      location: {
        name: "Downtown Test",
        address: {
          addressLine1: "1 Market St",
          locality: "San Francisco",
          administrativeDistrictLevel1: "CA",
          postalCode: "94105",
          country: "US",
        },
        timezone: "America/Los_Angeles",
      },
    });
    secondLocationId = created.location?.id;
    console.log("Created second location:", created.location?.name, secondLocationId);
  }

  const response = await client.catalog.batchUpsert({
    idempotencyKey: randomUUID(),
    batches: [
      {
        objects: [
          {
            type: "AVAILABILITY_PERIOD",
            id: "#breakfast-period",
            availabilityPeriodData: {
              startLocalTime: "00:00:00",
              endLocalTime: "23:59:00",
            },
          },
          {
            type: "CATEGORY",
            id: "#cat-breakfast",
            categoryData: {
              name: "Breakfast",
              availabilityPeriodIds: ["#breakfast-period"],
            },
          },
          {
            type: "CATEGORY",
            id: "#cat-lunch",
            categoryData: { name: "Lunch" },
          },
          {
            type: "CATEGORY",
            id: "#cat-drinks",
            categoryData: { name: "Drinks" },
          },
          {
            type: "ITEM",
            id: "#item-pancakes",
            presentAtAllLocations: true,
            itemData: {
              name: "Pancakes with Fruit",
              description: "Fluffy pancakes with seasonal fruit and maple syrup.",
              categories: [{ id: "#cat-breakfast" }],
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#var-pancakes",
                  itemVariationData: {
                    name: "Regular",
                    pricingType: "FIXED_PRICING",
                    priceMoney: { amount: BigInt(899), currency: "USD" },
                  },
                },
              ],
            },
          },
          {
            type: "ITEM",
            id: "#item-eggs",
            presentAtAllLocations: true,
            itemData: {
              name: "Sunny-Side Eggs on Toast",
              description: "Two eggs, sourdough, and herb butter.",
              categories: [{ id: "#cat-breakfast" }],
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#var-eggs",
                  itemVariationData: {
                    name: "Regular",
                    pricingType: "FIXED_PRICING",
                    priceMoney: { amount: BigInt(750), currency: "USD" },
                  },
                },
              ],
            },
          },
          {
            type: "ITEM",
            id: "#item-burger",
            presentAtAllLocations: true,
            itemData: {
              name: "Bacon Cheeseburger",
              description: "Angus beef, cheddar, bacon, house sauce.",
              categories: [{ id: "#cat-lunch" }],
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#var-burger",
                  itemVariationData: {
                    name: "Regular",
                    pricingType: "FIXED_PRICING",
                    priceMoney: { amount: BigInt(1299), currency: "USD" },
                  },
                },
              ],
            },
          },
          {
            type: "ITEM",
            id: "#item-soup",
            presentAtAllLocations: true,
            itemData: {
              name: "Autumn Soup",
              description: "Roasted squash soup with pepitas.",
              categories: [{ id: "#cat-lunch" }],
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#var-soup",
                  itemVariationData: {
                    name: "Bowl",
                    pricingType: "FIXED_PRICING",
                    priceMoney: { amount: BigInt(650), currency: "USD" },
                  },
                },
              ],
            },
          },
          {
            type: "ITEM",
            id: "#item-coffee",
            presentAtAllLocations: true,
            itemData: {
              name: "House Coffee",
              description: "Single-origin drip coffee.",
              categories: [{ id: "#cat-drinks" }],
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#var-coffee",
                  itemVariationData: {
                    name: "12 oz",
                    pricingType: "FIXED_PRICING",
                    priceMoney: { amount: BigInt(350), currency: "USD" },
                  },
                },
              ],
            },
          },
          {
            type: "ITEM",
            id: "#item-lemonade",
            presentAtAllLocations: true,
            itemData: {
              name: "Fresh Lemonade",
              categories: [{ id: "#cat-drinks" }],
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#var-lemonade",
                  itemVariationData: {
                    name: "Regular",
                    pricingType: "FIXED_PRICING",
                    priceMoney: { amount: BigInt(450), currency: "USD" },
                  },
                },
              ],
            },
          },
          // Only at primary location — demonstrates location filter when switching
          {
            type: "ITEM",
            id: "#item-exclusive",
            presentAtAllLocations: false,
            presentAtLocationIds: [locationId],
            itemData: {
              name: "Store Exclusive Muffin",
              description: "Only sold at the default test location.",
              categories: [{ id: "#cat-breakfast" }],
              variations: [
                {
                  type: "ITEM_VARIATION",
                  id: "#var-muffin",
                  presentAtAllLocations: false,
                  presentAtLocationIds: [locationId],
                  itemVariationData: {
                    name: "Regular",
                    pricingType: "FIXED_PRICING",
                    priceMoney: { amount: BigInt(425), currency: "USD" },
                  },
                },
              ],
            },
          },
          ...(secondLocationId
            ? [
                {
                  type: "ITEM" as const,
                  id: "#item-downtown-only",
                  presentAtAllLocations: false,
                  presentAtLocationIds: [secondLocationId],
                  itemData: {
                    name: "Downtown Club Sandwich",
                    description: "Only at the second location.",
                    categories: [{ id: "#cat-lunch" }],
                    variations: [
                      {
                        type: "ITEM_VARIATION" as const,
                        id: "#var-club",
                        presentAtAllLocations: false,
                        presentAtLocationIds: [secondLocationId],
                        itemVariationData: {
                          name: "Regular",
                          pricingType: "FIXED_PRICING" as const,
                          priceMoney: {
                            amount: BigInt(1099),
                            currency: "USD" as const,
                          },
                        },
                      },
                    ],
                  },
                },
              ]
            : []),
        ],
      },
    ],
  });

  if (response.errors?.length) {
    console.error("Seed errors:", response.errors);
    process.exit(1);
  }

  console.log("Done. Refresh the app.");
  console.log(
    "Objects upserted:",
    response.objects?.length ?? response.idMappings?.length ?? "ok",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
