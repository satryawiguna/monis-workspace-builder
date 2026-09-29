import type { ProductId } from "./types";

// Pure helpers for the workspace preview (AD-001, 05 - Data & API §7, §14).

export const ARTBOARD = { width: 1200, height: 800 } as const;

// Every layer is drawn on the full artboard, so an offset in artboard units
// becomes a percentage of the layer's own size.
export function offsetTransform(offset?: { x: number; y: number }): string | undefined {
  if (!offset || (offset.x === 0 && offset.y === 0)) return undefined;
  const x = (offset.x / ARTBOARD.width) * 100;
  const y = (offset.y / ARTBOARD.height) * 100;
  return `translate(${x}%, ${y}%)`;
}

// Which layers were added after the first render. Only those play the entrance
// animation (DESIGN.md §5: "on the changed layer only"); the layers shown on
// first load don't animate, and a layer that is removed and added again does.
export interface EnteredLayers {
  ids: readonly ProductId[];
  entered: ReadonlySet<ProductId>;
}

export function trackEnteredLayers(previous: EnteredLayers, ids: readonly ProductId[]): EnteredLayers {
  const same = previous.ids.length === ids.length && previous.ids.every((id) => ids.includes(id));
  if (same) return previous;

  const entered = new Set([...previous.entered].filter((id) => ids.includes(id)));
  for (const id of ids) {
    if (!previous.ids.includes(id)) entered.add(id);
  }
  return { ids: [...ids], entered };
}
