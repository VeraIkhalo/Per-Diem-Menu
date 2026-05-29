import type { CatalogObject } from "square";
import {
  availabilityLabel,
  isWithinAvailabilityWindows,
  toAvailabilityPeriod,
  type AvailabilityPeriod,
} from "@/lib/availability";
import {
  dedupeCategoriesForMenu,
  dedupeItemsByName,
  normalizeItemCategoryIds,
} from "@/lib/catalog-dedupe";
import { formatMoney } from "@/lib/format-money";
import { isPresentAtLocation } from "@/lib/location-filter";
import type {
  CategorySummary,
  MenuItemDetail,
  MenuItemSummary,
  MenuResponse,
} from "@/lib/types";
import { getSquareClient } from "./client";

const CATALOG_TYPES =
  "CATEGORY,ITEM,ITEM_VARIATION,IMAGE,AVAILABILITY_PERIOD" as const;

function moneyToCents(amount: bigint | number | null | undefined): number | null {
  if (amount === null || amount === undefined) return null;
  const cents = typeof amount === "bigint" ? Number(amount) : amount;
  if (!Number.isFinite(cents) || cents < 0) return null;
  return cents;
}

interface CatalogMaps {
  categories: Map<string, CatalogObject.Category>;
  items: Map<string, CatalogObject.Item>;
  variations: Map<string, CatalogObject.ItemVariation>;
  images: Map<string, CatalogObject.Image>;
  availabilityById: Map<string, AvailabilityPeriod[]>;
}

export async function fetchAllCatalogObjects(): Promise<CatalogObject[]> {
  const client = getSquareClient();
  const objects: CatalogObject[] = [];

  const page = await client.catalog.list({ types: CATALOG_TYPES });
  for await (const obj of page) {
    if (!obj.isDeleted) {
      objects.push(obj);
    }
  }

  return objects;
}

function buildCatalogMaps(objects: CatalogObject[]): CatalogMaps {
  const categories = new Map<string, CatalogObject.Category>();
  const items = new Map<string, CatalogObject.Item>();
  const variations = new Map<string, CatalogObject.ItemVariation>();
  const images = new Map<string, CatalogObject.Image>();
  const availabilityById = new Map<string, AvailabilityPeriod[]>();

  for (const obj of objects) {
    if (!obj.id) continue;

    switch (obj.type) {
      case "CATEGORY":
        categories.set(obj.id, obj);
        break;
      case "ITEM":
        items.set(obj.id, obj);
        break;
      case "ITEM_VARIATION":
        variations.set(obj.id, obj);
        break;
      case "IMAGE":
        images.set(obj.id, obj);
        break;
      case "AVAILABILITY_PERIOD":
        if (obj.availabilityPeriodData) {
          availabilityById.set(obj.id, [
            toAvailabilityPeriod(obj.availabilityPeriodData),
          ]);
        }
        break;
      default:
        break;
    }
  }

  return { categories, items, variations, images, availabilityById };
}

function resolveCategoryPeriods(
  category: CatalogObject.Category,
  availabilityById: Map<string, AvailabilityPeriod[]>,
): AvailabilityPeriod[] {
  const ids = category.categoryData?.availabilityPeriodIds ?? [];
  const periods: AvailabilityPeriod[] = [];
  for (const id of ids) {
    const p = availabilityById.get(id);
    if (p) periods.push(...p);
  }
  return periods;
}

function resolveImageUrl(
  item: CatalogObject.Item,
  images: Map<string, CatalogObject.Image>,
): string | null {
  const imageIds = item.itemData?.imageIds ?? [];
  for (const imageId of imageIds) {
    const image = images.get(imageId);
    const url = image?.imageData?.url;
    if (url) return url;
  }
  const singleImageId = item.imageId;
  if (singleImageId) {
    return images.get(singleImageId)?.imageData?.url ?? null;
  }
  return null;
}

function pickDefaultVariation(
  item: CatalogObject.Item,
  variations: Map<string, CatalogObject.ItemVariation>,
  locationId: string,
): CatalogObject.ItemVariation | undefined {
  const embedded = (item.itemData?.variations ?? []).filter(
    (v): v is CatalogObject.ItemVariation => v.type === "ITEM_VARIATION",
  );

  const fromMap =
    embedded.length > 0
      ? embedded
      : [...variations.values()].filter(
          (v) => v.itemVariationData?.itemId === item.id,
        );

  const available = fromMap.filter((v) => isPresentAtLocation(v, locationId));
  const pool = available.length > 0 ? available : fromMap;

  return (
    pool.find((v) => v.itemVariationData?.ordinal === 0) ??
    pool.find((v) => v.itemVariationData?.priceMoney) ??
    pool[0]
  );
}

function itemCategoryIds(item: CatalogObject.Item): string[] {
  const fromList = item.itemData?.categories ?? [];
  const ids = fromList
    .map((c) => c.id)
    .filter((id): id is string => Boolean(id));
  if (ids.length > 0) return ids;
  const legacy = item.itemData?.categoryId;
  return legacy ? [legacy] : [];
}

export async function buildMenuForLocation(
  locationId: string,
  timezone: string,
): Promise<MenuResponse> {
  const objects = await fetchAllCatalogObjects();
  const maps = buildCatalogMaps(objects);

  const categories: CategorySummary[] = [];
  const categoryAvailability = new Map<string, boolean>();

  for (const [id, cat] of maps.categories) {
    const periods = resolveCategoryPeriods(cat, maps.availabilityById);
    const available = isWithinAvailabilityWindows(periods, timezone);
    categoryAvailability.set(id, available);
    categories.push({
      id,
      name: cat.categoryData?.name ?? "Unnamed category",
      isCurrentlyAvailable: available,
      availabilityLabel: periods.length
        ? availabilityLabel(periods)
        : undefined,
    });
  }

  categories.sort((a, b) => a.name.localeCompare(b.name));

  const items: MenuItemSummary[] = [];
  let totalCatalogItems = 0;

  for (const [id, item] of maps.items) {
    if (item.itemData?.isArchived) continue;
    totalCatalogItems++;

    if (!isPresentAtLocation(item, locationId)) continue;

    const variation = pickDefaultVariation(item, maps.variations, locationId);
    const priceMoney = variation?.itemVariationData?.priceMoney;
    const amountCents = moneyToCents(priceMoney?.amount);
    if (amountCents === null) continue;

    const categoryIds = itemCategoryIds(item);
    const categoryAvailable =
      categoryIds.length === 0 ||
      categoryIds.some((cid) => categoryAvailability.get(cid) === true);

    const description =
      item.itemData?.descriptionPlaintext ??
      item.itemData?.description ??
      "";

    items.push({
      id,
      name: item.itemData?.name ?? "Unnamed item",
      description,
      imageUrl: resolveImageUrl(item, maps.images),
      price: formatMoney(amountCents, priceMoney?.currency ?? "USD"),
      categoryIds,
      isCurrentlyAvailable: categoryAvailable,
    });
  }

  items.sort((a, b) => a.name.localeCompare(b.name));

  const visibleAtLocation = items.length;
  const orderableItems = items.filter((i) => i.isCurrentlyAvailable);

  const { categories: dedupedCategories, normalizeCategoryId } =
    dedupeCategoriesForMenu(categories, orderableItems);
  const normalizedItems = normalizeItemCategoryIds(
    dedupeItemsByName(orderableItems),
    normalizeCategoryId,
  );
  const categoriesForMenu = dedupedCategories.filter((category) =>
    normalizedItems.some((item) => item.categoryIds.includes(category.id)),
  );

  return {
    locationId,
    timezone,
    categories: categoriesForMenu,
    items: normalizedItems,
    meta: {
      totalCatalogItems,
      visibleAtLocation,
    },
  };
}

export async function getMenuItemDetail(
  itemId: string,
  locationId: string,
  timezone: string,
): Promise<MenuItemDetail | null> {
  const objects = await fetchAllCatalogObjects();
  const maps = buildCatalogMaps(objects);
  const item = maps.items.get(itemId);
  if (!item || !isPresentAtLocation(item, locationId)) {
    return null;
  }

  const variation = pickDefaultVariation(item, maps.variations, locationId);
  const priceMoney = variation?.itemVariationData?.priceMoney;
  const amountCents = moneyToCents(priceMoney?.amount);
  if (amountCents === null) return null;

  const categoryIds = itemCategoryIds(item);
  const categoryAvailable =
    categoryIds.length === 0 ||
    categoryIds.some((cid) => {
      const cat = maps.categories.get(cid);
      if (!cat) return true;
      const periods = resolveCategoryPeriods(cat, maps.availabilityById);
      return isWithinAvailabilityWindows(periods, timezone);
    });

  const description =
    item.itemData?.descriptionPlaintext ??
    item.itemData?.description ??
    "";

  return {
    id: itemId,
    name: item.itemData?.name ?? "Unnamed item",
    description,
    imageUrl: resolveImageUrl(item, maps.images),
    price: formatMoney(amountCents, priceMoney?.currency ?? "USD"),
    categoryIds,
    isCurrentlyAvailable: categoryAvailable,
    variationName: variation?.itemVariationData?.name ?? "Regular",
    modifierListIds:
      item.itemData?.modifierListInfo?.map((m) => m.modifierListId).filter(
        (id): id is string => Boolean(id),
      ) ?? [],
  };
}
