import { describe, expect, it } from "vitest";
import { thumbnailFrame } from "../lib/thumbnail";

// Option thumbnails (T10): each category's focus box is centred and fits.

describe("thumbnailFrame", () => {
  it("keeps the artboard's 3:2 shape", () => {
    const frame = thumbnailFrame("desk", 110, 70);
    expect(frame.width / frame.height).toBeCloseTo(1.5);
  });

  it.each([
    ["desk", 110, 70, 600, 520],
    ["chair", 110, 70, 860, 529],
    ["monitor", 56, 56, 655, 286],
    ["lamp", 56, 56, 450, 300],
    ["plant", 56, 56, 1063, 479],
  ] as const)("centres the %s focus point in a %i×%i thumbnail", (category, width, height, cx, cy) => {
    const frame = thumbnailFrame(category, width, height);
    const scale = frame.width / 1200;
    expect(frame.left + cx * scale).toBeCloseTo(width / 2);
    expect(frame.top + cy * scale).toBeCloseTo(height / 2);
  });

  it("scales the focus box to fit inside the thumbnail", () => {
    const frame = thumbnailFrame("chair", 110, 70);
    const scale = frame.width / 1200;
    expect(200 * scale).toBeLessThanOrEqual(110);
    expect(480 * scale).toBeLessThanOrEqual(70.0001);
  });
});
