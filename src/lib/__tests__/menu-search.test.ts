import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchesMenuSearch } from "@/lib/menu-search";

describe("matchesMenuSearch", () => {
  const item = {
    name: "Bacon Cheeseburger",
    description: "Angus beef, cheddar, bacon",
  };

  it("matches empty query", () => {
    assert.equal(matchesMenuSearch(item, ""), true);
  });

  it("matches name substring", () => {
    assert.equal(matchesMenuSearch(item, "burger"), true);
  });

  it("matches description term", () => {
    assert.equal(matchesMenuSearch(item, "bacon"), true);
  });

  it("requires all terms", () => {
    assert.equal(matchesMenuSearch(item, "bacon soup"), false);
  });
});
