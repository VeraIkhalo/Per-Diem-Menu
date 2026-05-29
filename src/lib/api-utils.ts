import { NextResponse } from "next/server";
import {
  isAuthError,
  isRateLimitError,
  isSquareUnavailable,
  squareErrorMessage,
} from "@/lib/square/errors";

const LOCATION_ID_PATTERN = /^[A-Z0-9]{10,}$/i;

export function validateLocationId(
  locationId: string | null,
): locationId is string {
  return Boolean(locationId && LOCATION_ID_PATTERN.test(locationId));
}

export function jsonError(
  message: string,
  status: number,
  code?: string,
): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
}

export function handleRouteError(err: unknown): NextResponse {
  if (isRateLimitError(err)) {
    return jsonError(
      "Square rate limit reached. Please wait a moment and try again.",
      429,
      "RATE_LIMITED",
    );
  }

  if (isAuthError(err)) {
    return jsonError(
      "Square rejected the access token. Check SQUARE_ACCESS_TOKEN in .env (sandbox token only).",
      502,
      "SQUARE_AUTH",
    );
  }

  if (isSquareUnavailable(err)) {
    return jsonError(
      "Square is temporarily unavailable. Please try again shortly.",
      503,
      "SQUARE_UNAVAILABLE",
    );
  }

  const message = squareErrorMessage(err);
  const status = message.includes("SQUARE_ACCESS_TOKEN") ? 503 : 500;

  return jsonError(message, status);
}
