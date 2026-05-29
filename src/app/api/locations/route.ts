import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api-utils";
import { listActiveLocations } from "@/lib/square/locations-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const locations = await listActiveLocations();
    return NextResponse.json({ locations });
  } catch (err) {
    return handleRouteError(err);
  }
}
