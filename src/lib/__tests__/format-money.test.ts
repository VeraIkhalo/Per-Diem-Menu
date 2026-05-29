import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatMoney } from "@/lib/format-money";

describe("formatMoney", () => {
  it("displays Square cents for USD", () => {
    const result = formatMoney(650, "USD");
    assert.equal(result.amountCents, 650);
    assert.equal(result.currency, "USD");
    assert.equal(result.formatted, "650¢");
  });

  it("displays whole-dollar amounts in cents", () => {
    assert.equal(formatMoney(1200, "USD").formatted, "1200¢");
  });
});
