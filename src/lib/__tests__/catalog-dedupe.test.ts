import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dedupeCategoriesForMenu,
  dedupeItemsByName,
} from "@/lib/catalog-dedupe";
import type { CategorySummary, MenuItemSummary } from "@/lib/types";

describe("dedupeCategoriesForMenu", () => {
  it("collapses duplicate category names", () => {
    const categories: CategorySummary[] = [
      { id: "lunch-a", name: "Lunch", isCurrentlyAvailable: true },
      { id: "lunch-b", name: "Lunch", isCurrentlyAvailable: true },
    ];
    const items: MenuItemSummary[] = [
      {
        id: "1",
        name: "Soup",
        description: "",
        imageUrl: null,
        price: { amountCents: 100, currency: "USD", formatted: "$1.00" },
        categoryIds: ["lunch-b"],
        isCurrentlyAvailable: true,
      },
    ];

    const { categories: out, normalizeCategoryId } = dedupeCategoriesForMenu(
      categories,
      items,
    );

    assert.equal(out.length, 1);
    assert.equal(out[0].id, "lunch-b");
    assert.equal(normalizeCategoryId("lunch-a"), "lunch-b");
  });
});

describe("dedupeItemsByName", () => {
  it("keeps one item per name", () => {
    const items: MenuItemSummary[] = [
      {
        id: "a",
        name: "Coffee",
        description: "",
        imageUrl: null,
        price: { amountCents: 350, currency: "USD", formatted: "$3.50" },
        categoryIds: [],
        isCurrentlyAvailable: true,
      },
      {
        id: "b",
        name: "Coffee",
        description: "",
        imageUrl: null,
        price: { amountCents: 350, currency: "USD", formatted: "$3.50" },
        categoryIds: ["x"],
        isCurrentlyAvailable: true,
      },
    ];
    assert.equal(dedupeItemsByName(items).length, 1);
  });
});
