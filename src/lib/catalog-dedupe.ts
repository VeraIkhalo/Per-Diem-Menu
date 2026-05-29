import type { CategorySummary, MenuItemSummary } from "@/lib/types";

export function dedupeCategoriesForMenu(
  categories: CategorySummary[],
  items: MenuItemSummary[],
): {
  categories: CategorySummary[];
  normalizeCategoryId: (categoryId: string) => string;
} {
  const itemCountByCategoryId = new Map<string, number>();
  for (const item of items) {
    for (const categoryId of item.categoryIds) {
      itemCountByCategoryId.set(
        categoryId,
        (itemCountByCategoryId.get(categoryId) ?? 0) + 1,
      );
    }
  }

  const byName = new Map<string, CategorySummary[]>();
  for (const category of categories) {
    const key = category.name.trim().toLowerCase();
    const group = byName.get(key) ?? [];
    group.push(category);
    byName.set(key, group);
  }

  const idToCanonical = new Map<string, string>();
  const deduped: CategorySummary[] = [];

  for (const group of byName.values()) {
    const withItems = group.filter(
      (c) => (itemCountByCategoryId.get(c.id) ?? 0) > 0,
    );
    const pool = withItems.length > 0 ? withItems : group;
    const winner = [...pool].sort(
      (a, b) =>
        (itemCountByCategoryId.get(b.id) ?? 0) -
        (itemCountByCategoryId.get(a.id) ?? 0),
    )[0];

    deduped.push(winner);
    for (const category of group) {
      idToCanonical.set(category.id, winner.id);
    }
  }

  deduped.sort((a, b) => a.name.localeCompare(b.name));

  return {
    categories: deduped,
    normalizeCategoryId: (categoryId: string) =>
      idToCanonical.get(categoryId) ?? categoryId,
  };
}

export function dedupeItemsByName(items: MenuItemSummary[]): MenuItemSummary[] {
  const byName = new Map<string, MenuItemSummary>();
  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, item);
      continue;
    }
    if (item.categoryIds.length >= existing.categoryIds.length) {
      byName.set(key, item);
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function normalizeItemCategoryIds(
  items: MenuItemSummary[],
  normalizeCategoryId: (categoryId: string) => string,
): MenuItemSummary[] {
  return items.map((item) => ({
    ...item,
    categoryIds: [
      ...new Set(item.categoryIds.map((id) => normalizeCategoryId(id))),
    ],
  }));
}
