"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { MenuItemSummary } from "@/lib/types";

interface MenuItemCardProps {
  item: MenuItemSummary;
  locationId: string;
  timezone: string;
}

export function MenuItemCard({ item, locationId, timezone }: MenuItemCardProps) {
  const { addItem } = useCart();
  const href = `/items/${item.id}?locationId=${encodeURIComponent(locationId)}&timezone=${encodeURIComponent(timezone)}`;

  return (
    <div className="flex gap-2 rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <Link
        href={href}
        className="group flex min-w-0 flex-1 cursor-pointer gap-4 p-4"
      >
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-zinc-900 group-hover:text-emerald-800">
              {item.name}
            </h3>
            <span className="shrink-0 text-sm font-semibold text-emerald-800">
              {item.price.formatted}
            </span>
          </div>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
              {item.description}
            </p>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => addItem(item)}
        disabled={!item.isCurrentlyAvailable}
        title={
          item.isCurrentlyAvailable
            ? "Add to cart"
            : "Not available right now"
        }
        className="m-2 flex w-12 shrink-0 cursor-pointer items-center justify-center self-center rounded-lg bg-emerald-700 text-lg font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
        aria-label={`Add ${item.name} to cart`}
      >
        +
      </button>
    </div>
  );
}
