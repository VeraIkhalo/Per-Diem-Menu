import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertSquareSuccess } from "@/lib/square/errors";

describe("assertSquareSuccess", () => {
  it("returns response when no errors", () => {
    const res = assertSquareSuccess<{ errors?: unknown[]; locations: unknown[] }>(
      { locations: [] },
      "test",
    );
    assert.deepEqual(res.locations, []);
  });

  it("throws when Square returns errors array", () => {
    assert.throws(
      () =>
        assertSquareSuccess(
          { errors: [{ detail: "Bad token" }] },
          "List locations",
        ),
      /Bad token/,
    );
  });
});
