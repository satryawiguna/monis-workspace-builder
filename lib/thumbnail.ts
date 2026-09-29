import type { Category } from "./types";

// Option thumbnails (04 - UI UX §8 "ItemThumb") reuse each product's
// 1200×800 layer and frame the area where that kind of item is drawn
// (DESIGN.md §7: every item sits at a fixed place on the shared artboard).

interface FocusBox {
  cx: number;
  cy: number;
  width: number;
  height: number;
}

const FOCUS: Record<Category, FocusBox> = {
  desk: { cx: 600, cy: 520, width: 600, height: 320 },
  chair: { cx: 860, cy: 529, width: 200, height: 480 },
  monitor: { cx: 655, cy: 286, width: 240, height: 190 },
  lamp: { cx: 450, cy: 300, width: 100, height: 170 },
  plant: { cx: 1063, cy: 479, width: 250, height: 400 },
};

// Position and size, in px, of the full artboard inside a thumbnail of the
// given size, so the item's focus box is centred and fits.
export function thumbnailFrame(category: Category, width: number, height: number) {
  const focus = FOCUS[category];
  const scale = Math.min(width / focus.width, height / focus.height);
  return {
    width: 1200 * scale,
    height: 800 * scale,
    left: width / 2 - scale * focus.cx,
    top: height / 2 - scale * focus.cy,
  };
}
