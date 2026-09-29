import { sameConfiguration, type ConfiguratorState, type Tab } from "./configurator";
import type { Category, Configuration, ContentStatus, Product, ProductId } from "./types";

// Derived views: 05 - Data & API §14–15 and 03 - Architecture §12. Every view
// is computed from the same configuration; none reads `ui` or `undo`, and
// none keeps a copy.

export interface PreviewLayer {
  productId: ProductId;
  src: string;
  layer: number;
  offset?: { x: number; y: number };
}

export interface SummaryLine {
  productId: ProductId;
  name: string;
  category: Category;
  status: ContentStatus;
}

export interface SummaryView {
  desk: SummaryLine;
  chair: SummaryLine;
  accessories: SummaryLine[]; // catalog order; empty = "no extras" (02 §12)
  itemCount: number; // 2 + accessories.length
}

function resolve(configuration: Configuration, catalog: readonly Product[]) {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const find = (id: ProductId): Product => {
    const product = byId.get(id);
    if (!product) throw new Error(`Unknown product "${id}" in the configuration.`);
    return product;
  };
  const accessories = configuration.accessoryIds.map(find);
  const order = new Map(catalog.map((p, index) => [p.id, index]));
  accessories.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return {
    desk: find(configuration.deskId),
    chair: find(configuration.chairId),
    accessories,
    order,
  };
}

// Selected products as preview layers, back to front: sorted by layer, ties
// broken by catalog order. The backdrop is rendered separately beneath them.
export function selectLayers(
  configuration: Configuration,
  catalog: readonly Product[],
): PreviewLayer[] {
  const { desk, chair, accessories, order } = resolve(configuration, catalog);
  return [desk, chair, ...accessories]
    .sort((a, b) => a.asset.layer - b.asset.layer || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map((p) => ({
      productId: p.id,
      src: p.asset.src,
      layer: p.asset.layer,
      ...(p.asset.offset ? { offset: p.asset.offset } : {}),
    }));
}

function toLine(product: Product): SummaryLine {
  return {
    productId: product.id,
    name: product.name,
    category: product.category,
    status: product.status,
  };
}

export function selectSummary(configuration: Configuration, catalog: readonly Product[]): SummaryView {
  const { desk, chair, accessories } = resolve(configuration, catalog);
  return {
    desk: toLine(desk),
    chair: toLine(chair),
    accessories: accessories.map(toLine),
    itemCount: 2 + accessories.length,
  };
}

// Text alternative for the preview image (AD-008), e.g. "Workspace with
// Electrical Adjustable Desk, Ergonomic Office Chair and no extras."
export function previewAltText(configuration: Configuration, catalog: readonly Product[]): string {
  const { desk, chair, accessories } = resolve(configuration, catalog);
  const names = [desk.name, chair.name, ...accessories.map((p) => p.name)];
  if (accessories.length === 0) return `Workspace with ${desk.name}, ${chair.name} and no extras.`;
  return `Workspace with ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}.`;
}

// True when any selected product is illustrative, so the preview can show the
// Illustrative indicator (04 - UI UX §9).
export function includesIllustrative(configuration: Configuration, catalog: readonly Product[]): boolean {
  const { desk, chair, accessories } = resolve(configuration, catalog);
  return [desk, chair, ...accessories].some((product) => product.status === "illustrative");
}

// DL-003: Start over shows when the configuration differs from the initial
// one, or on the Confirmed stage.
export function isStartOverVisible(
  state: ConfiguratorState,
  initialConfiguration: Configuration,
): boolean {
  return (
    !sameConfiguration(state.configuration, initialConfiguration) || state.stage === "confirmed"
  );
}

// The Build tab a Review "Change" action returns to (05 §15).
export function tabForCategory(category: Category): Tab {
  if (category === "desk" || category === "chair") return category;
  return "extras";
}
