import { NextRequest, NextResponse } from "next/server";
import {
  handleRouteError,
  jsonError,
  validateLocationId,
} from "@/lib/api-utils";
import { getMenuItemDetail } from "@/lib/square/catalog-service";
import { listActiveLocations } from "@/lib/square/locations-service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ itemId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { itemId } = await context.params;
  const locationId = request.nextUrl.searchParams.get("locationId");
  const timezoneParam = request.nextUrl.searchParams.get("timezone");

  if (!itemId || itemId.length > 64) {
    return jsonError("Invalid item id.", 400);
  }

  if (!validateLocationId(locationId)) {
    return jsonError("A valid locationId query parameter is required.", 400);
  }

  try {
    let timezone = timezoneParam ?? undefined;
    if (!timezone) {
      const locations = await listActiveLocations();
      timezone =
        locations.find((l) => l.id === locationId)?.timezone ??
        "America/New_York";
    }

    const item = await getMenuItemDetail(itemId, locationId, timezone);
    if (!item) {
      return jsonError("Item not found at this location.", 404);
    }

    return NextResponse.json({ item });
  } catch (err) {
    return handleRouteError(err);
  }
}
