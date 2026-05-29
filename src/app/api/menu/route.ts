import { NextRequest, NextResponse } from "next/server";
import {
  handleRouteError,
  jsonError,
  validateLocationId,
} from "@/lib/api-utils";
import { buildMenuForLocation } from "@/lib/square/catalog-service";
import { listActiveLocations } from "@/lib/square/locations-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const locationId = request.nextUrl.searchParams.get("locationId");
  const timezoneParam = request.nextUrl.searchParams.get("timezone");

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

    const menu = await buildMenuForLocation(locationId, timezone);
    return NextResponse.json(menu);
  } catch (err) {
    return handleRouteError(err);
  }
}
