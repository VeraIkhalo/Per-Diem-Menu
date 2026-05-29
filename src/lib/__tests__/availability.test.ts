import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWithinAvailabilityWindows } from "@/lib/availability";

describe("isWithinAvailabilityWindows", () => {
  it("returns true when no periods configured", () => {
    assert.equal(isWithinAvailabilityWindows([], "America/New_York"), true);
  });

  it("matches a weekday breakfast window", () => {
    const periods = [
      {
        dayOfWeek: "MON",
        startLocalTime: "07:00:00",
        endLocalTime: "11:00:00",
      },
    ];
    // Monday 2024-06-03 10:00 ET (14:00 UTC)
    const mondayMorning = new Date("2024-06-03T14:00:00.000Z");
    assert.equal(
      isWithinAvailabilityWindows(
        periods,
        "America/New_York",
        mondayMorning,
      ),
      true,
    );
  });
});
