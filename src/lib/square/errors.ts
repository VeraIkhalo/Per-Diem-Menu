import { SquareError } from "square";

export function squareErrorMessage(err: unknown): string {
  if (err instanceof SquareError) {
    const details = err.errors?.map((e) => e.detail ?? e.code).filter(Boolean);
    if (details?.length) {
      return details.join("; ");
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred";
}

export function isRateLimitError(err: unknown): boolean {
  return err instanceof SquareError && err.statusCode === 429;
}

export function isAuthError(err: unknown): boolean {
  return err instanceof SquareError && err.statusCode === 401;
}

export function isSquareUnavailable(err: unknown): boolean {
  return err instanceof SquareError && (err.statusCode ?? 0) >= 500;
}

export function assertSquareSuccess<T extends { errors?: unknown[] }>(
  response: T,
  context: string,
): T {
  const errors = response.errors;
  if (errors?.length) {
    const detail =
      errors
        .map((e) =>
          typeof e === "object" && e && "detail" in e
            ? String((e as { detail?: string }).detail)
            : null,
        )
        .filter(Boolean)
        .join("; ") || `${context} failed`;
    throw new Error(detail);
  }
  return response;
}
