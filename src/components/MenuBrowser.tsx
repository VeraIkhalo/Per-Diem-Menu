"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LocationSwitcher } from "@/components/LocationSwitcher";
import { MenuItemCard } from "@/components/MenuItemCard";
import { MenuSearch } from "@/components/MenuSearch";
import { StatusMessage } from "@/components/StatusMessage";
import { useCart } from "@/context/CartContext";
import { matchesMenuSearch } from "@/lib/menu-search";
import type {
  ApiErrorBody,
  LocationSummary,
  MenuResponse,
} from "@/lib/types";

type LoadState =
  | { status: "idle" }
  | { status: "loading-locations" }
  | { status: "loading-menu" }
  | { status: "ready" }
  | { status: "error"; message: string };

export function MenuBrowser() {
  const searchParams = useSearchParams();
  const locationFromUrl = searchParams.get("locationId");

  const [locations, setLocations] = useState<LocationSummary[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loadState, setLoadState] = useState<LoadState>({
    status: "loading-locations",
  });
  const { setLocationId: setCartLocationId } = useCart();

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId),
    [locations, selectedLocationId],
  );

  const fetchLocations = useCallback(async () => {
    setLoadState({ status: "loading-locations" });
    try {
      const res = await fetch("/api/locations");
      const body = (await res.json()) as {
        locations?: LocationSummary[];
      } & ApiErrorBody;

      if (!res.ok) {
        throw new Error(body.error ?? "Failed to load locations");
      }

      const list = body.locations ?? [];
      setLocations(list);
      if (list.length > 0) {
        setSelectedLocationId((prev) => {
          const fromUrl =
            locationFromUrl && list.some((l) => l.id === locationFromUrl)
              ? locationFromUrl
              : null;
          if (fromUrl) return fromUrl;
          if (prev && list.some((l) => l.id === prev)) return prev;
          return list[0].id;
        });
      }
      setLoadState({ status: list.length > 0 ? "idle" : "ready" });
    } catch (err) {
      setLoadState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to load locations",
      });
    }
  }, [locationFromUrl]);

  const fetchMenu = useCallback(async (locationId: string, timezone: string) => {
    setLoadState({ status: "loading-menu" });
    setSelectedCategoryId(null);
    try {
      const params = new URLSearchParams({ locationId, timezone });
      const res = await fetch(`/api/menu?${params}`);
      const body = (await res.json()) as MenuResponse & ApiErrorBody;

      if (!res.ok) {
        throw new Error(body.error ?? "Failed to load menu");
      }

      setMenu(body);
      setLoadState({ status: "ready" });
    } catch (err) {
      setMenu(null);
      setLoadState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load menu",
      });
    }
  }, []);

  useEffect(() => {
    void fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (!locationFromUrl || locations.length === 0) return;
    if (!locations.some((l) => l.id === locationFromUrl)) return;
    setSelectedLocationId(locationFromUrl);
  }, [locationFromUrl, locations]);

  useEffect(() => {
    if (!selectedLocationId || !selectedLocation) return;
    setCartLocationId(selectedLocationId);
    void fetchMenu(selectedLocationId, selectedLocation.timezone);
  }, [selectedLocationId, selectedLocation, fetchMenu, setCartLocationId]);

  const searchedItems = useMemo(() => {
    if (!menu) return [];
    return menu.items.filter((item) => matchesMenuSearch(item, searchQuery));
  }, [menu, searchQuery]);

  const filteredItems = useMemo(() => {
    if (!selectedCategoryId) return searchedItems;
    return searchedItems.filter((item) =>
      item.categoryIds.includes(selectedCategoryId),
    );
  }, [searchedItems, selectedCategoryId]);

  const groupedItems = useMemo(() => {
    if (!menu || selectedCategoryId) {
      return null;
    }

    const byCategory = new Map<string, typeof menu.items>();
    const uncategorized: typeof menu.items = [];

    for (const item of searchedItems) {
      const primary = item.categoryIds[0];
      if (!primary) {
        uncategorized.push(item);
        continue;
      }
      const list = byCategory.get(primary) ?? [];
      list.push(item);
      byCategory.set(primary, list);
    }

    const groups: { categoryId: string; name: string; items: typeof menu.items }[] =
      [];

    for (const cat of menu.categories) {
      if (!cat.isCurrentlyAvailable) continue;
      const items = byCategory.get(cat.id);
      if (items?.length) {
        groups.push({ categoryId: cat.id, name: cat.name, items });
      }
    }

    if (uncategorized.length) {
      groups.push({
        categoryId: "_other",
        name: "Other",
        items: uncategorized,
      });
    }

    return groups;
  }, [menu, searchedItems, selectedCategoryId]);

  if (loadState.status === "error") {
    return (
      <StatusMessage
        variant="error"
        title="Something went wrong"
        message={loadState.message}
        action={{ label: "Try again", onClick: () => void fetchLocations() }}
      />
    );
  }

  if (loadState.status === "loading-locations") {
    return <LoadingSkeleton />;
  }

  if (locations.length === 0) {
    return (
      <StatusMessage
        variant="empty"
        title="No locations found"
        message="Add a location in the Square dashboard, then refresh."
        action={{ label: "Refresh", onClick: () => void fetchLocations() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Menu
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            {selectedLocation?.name ?? "Pick a location"}
          </p>
        </div>
        <LocationSwitcher
          locations={locations}
          selectedId={selectedLocationId}
          onChange={setSelectedLocationId}
          disabled={loadState.status === "loading-menu"}
        />
      </div>

      {loadState.status === "loading-menu" && <LoadingSkeleton />}

      {loadState.status === "ready" && menu && (
        <>
          <MenuSearch
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={searchedItems.length}
            totalCount={menu.items.length}
          />

          <CategoryFilter
            categories={menu.categories}
            selectedCategoryId={selectedCategoryId}
            onChange={setSelectedCategoryId}
          />

          {menu.items.length === 0 ? (
            <StatusMessage
              variant="empty"
                title={
                  menu.meta.totalCatalogItems === 0
                    ? "Catalog is empty"
                    : "Nothing available right now"
                }
                message={
                  menu.meta.totalCatalogItems === 0
                    ? "Add items in the Square dashboard or run npm run seed."
                    : "Nothing matches this location and time. Try another location."
                }
            />
          ) : searchedItems.length === 0 ? (
            <StatusMessage
              variant="empty"
              title="No search results"
              message={`Nothing on the menu matches "${searchQuery.trim()}". Try another term or clear search.`}
              action={{
                label: "Clear search",
                onClick: () => setSearchQuery(""),
              }}
            />
          ) : filteredItems.length === 0 ? (
            <StatusMessage
              variant="empty"
              title="No items in this category"
              message="Pick another category or view all items."
              action={{
                label: "Show all",
                onClick: () => setSelectedCategoryId(null),
              }}
            />
          ) : selectedCategoryId ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <MenuItemCard
                    item={item}
                    locationId={selectedLocationId}
                    timezone={menu.timezone}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-10">
              {groupedItems?.map((group) => (
                <section key={group.categoryId}>
                  <h2 className="mb-4 text-lg font-semibold text-zinc-800">
                    {group.name}
                  </h2>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <MenuItemCard
                          item={item}
                          locationId={selectedLocationId}
                          timezone={menu.timezone}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
