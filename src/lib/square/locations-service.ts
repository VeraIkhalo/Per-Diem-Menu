import type { LocationSummary } from "@/lib/types";
import { assertSquareSuccess } from "./errors";
import { getSquareClient } from "./client";

export async function listActiveLocations(): Promise<LocationSummary[]> {
  const client = getSquareClient();
  const response = assertSquareSuccess(
    await client.locations.list(),
    "List locations",
  );

  const locations = response.locations ?? [];

  return locations
    .filter((loc) => loc.id && loc.status === "ACTIVE")
    .map((loc) => ({
      id: loc.id!,
      name: loc.name ?? "Unnamed location",
      timezone: loc.timezone ?? "America/New_York",
      status: loc.status ?? "ACTIVE",
      addressLine: formatAddress(loc.address),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function formatAddress(
  address: { addressLine1?: string | null; locality?: string | null } | undefined,
): string | undefined {
  if (!address) return undefined;
  const parts = [address.addressLine1, address.locality].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}
