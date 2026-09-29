import { describe, expect, it } from "vitest";
import { offsetTransform, trackEnteredLayers, type EnteredLayers } from "../lib/preview";

// Workspace preview helpers (T9): asset offsets and which layers animate.

describe("offsetTransform", () => {
  it("returns nothing when there is no offset or a zero offset", () => {
    expect(offsetTransform(undefined)).toBeUndefined();
    expect(offsetTransform({ x: 0, y: 0 })).toBeUndefined();
  });

  it("converts artboard units to a percentage of the 1200×800 layer", () => {
    expect(offsetTransform({ x: 120, y: -40 })).toBe("translate(10%, -5%)");
  });
});

describe("trackEnteredLayers", () => {
  const start: EnteredLayers = { ids: ["desk-a", "chair-a"], entered: new Set() };

  it("keeps the same object when the layers are unchanged, in any order", () => {
    expect(trackEnteredLayers(start, ["chair-a", "desk-a"])).toBe(start);
  });

  it("does not animate the layers shown on first load", () => {
    const next = trackEnteredLayers(start, ["desk-a", "chair-a", "plant"]);
    expect([...next.entered]).toEqual(["plant"]);
  });

  it("animates a replaced desk but not the unchanged chair", () => {
    const next = trackEnteredLayers(start, ["desk-b", "chair-a"]);
    expect([...next.entered]).toEqual(["desk-b"]);
  });

  it("forgets removed layers and animates a layer that is added again", () => {
    const withPlant = trackEnteredLayers(start, ["desk-a", "chair-a", "plant"]);
    const removed = trackEnteredLayers(withPlant, ["desk-a", "chair-a"]);
    expect(removed.entered.size).toBe(0);
    const readded = trackEnteredLayers(removed, ["desk-a", "chair-a", "plant"]);
    expect([...readded.entered]).toEqual(["plant"]);
  });

  it("animates a layer from the first load once it is removed and added again", () => {
    const noChair = trackEnteredLayers(start, ["desk-a"]);
    const chairBack = trackEnteredLayers(noChair, ["desk-a", "chair-a"]);
    expect([...chairBack.entered]).toEqual(["chair-a"]);
  });
});
