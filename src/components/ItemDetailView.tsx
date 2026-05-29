"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { StatusMessage } from "@/components/StatusMessage";
import { useCart } from "@/context/CartContext";
import type { ApiErrorBody, MenuItemDetail } from "@/lib/types";

interface ItemDetailViewProps {
  itemId: string;
  locationId: string;
  timezone: string;
}

export function ItemDetailView({
  itemId,
  locationId,
  timezone,
}: ItemDetailViewProps) {
  const { addItem } = useCart();
  const [item, setItem] = useState<MenuItemDetail | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ locationId, timezone });
      const res = await fetch(`/api/menu/${itemId}?${params}`);
      const body = (await res.json()) as { item?: MenuItemDetail } & ApiErrorBody;

      if (!res.ok) {
        throw new Error(body.error ?? "Failed to load item");
      }

      setItem(body.item ?? null);
    } catch (err) {
      setItem(null);
      setError(err instanceof Error ? err.message : "Failed to load item");
    } finally {
      setLoading(false);
    }
  }, [itemId, locationId, timezone]);

  useEffect(() => {
    void fetchItem();
  }, [fetchItem]);

  const backHref = `/?locationId=${encodeURIComponent(locationId)}`;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !item) {
    return (
      <div className="space-y-4">
        <StatusMessage
          variant="error"
          title="Could not load item"
          message={error ?? "Item not found"}
          action={{ label: "Retry", onClick: () => void fetchItem() }}
        />
        <Link
          href={backHref}
          className="inline-block cursor-pointer text-sm font-medium text-emerald-700"
        >
          ← Back to menu
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-lg">
      <Link
        href={backHref}
        className="cursor-pointer text-sm font-medium text-emerald-700 hover:text-emerald-900"
      >
        ← Back to menu
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="aspect-[4/3] bg-zinc-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No image
            </div>
          )}
        </div>

        <div className="p-6">
          {!item.isCurrentlyAvailable && (
            <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Not available at this time.
            </p>
          )}

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">{item.name}</h1>
              {item.variationName !== "Regular" && (
                <p className="mt-1 text-sm text-zinc-500">{item.variationName}</p>
              )}
            </div>
            <p
              className="text-xl font-bold text-emerald-800"
              aria-label={`Price ${item.price.formatted}`}
            >
              {item.price.formatted}
            </p>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            {item.description || "No description."}
          </p>

          <button
            type="button"
            disabled={!item.isCurrentlyAvailable}
            onClick={() => {
              addItem(item);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            className="mt-6 w-full cursor-pointer rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            {added
              ? "Added"
              : item.isCurrentlyAvailable
                ? "Add to cart"
                : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}
