import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPresentAtLocation } from "@/lib/location-filter";

describe("isPresentAtLocation", () => {
  const locationId = "LOC1";

  it("defaults to present at all locations", () => {
    assert.equal(isPresentAtLocation({}, locationId), true);
  });

  it("respects absent_at_location_ids even when present everywhere", () => {
    assert.equal(
      isPresentAtLocation(
        { presentAtAllLocations: true, absentAtLocationIds: [locationId] },
        locationId,
      ),
      false,
    );
  });

  it("requires explicit present list when not at all locations", () => {
    assert.equal(
      isPresentAtLocation(
        { presentAtAllLocations: false, presentAtLocationIds: ["OTHER"] },
        locationId,
      ),
      false,
    );

    assert.equal(
      isPresentAtLocation(
        {
          presentAtAllLocations: false,
          presentAtLocationIds: [locationId],
        },
        locationId,
      ),
      true,
    );
  });
});
