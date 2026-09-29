import type { Category, Configuration, Product } from "./types";

// Catalog validation: 05 - Data & API §12 plus the approved MVP catalog from
// 05 §10–11. Pure and deterministic; an empty list means valid. The page runs
// it during prerender, so an invalid catalog fails the build (03 §11). It
// checks data conventions only: whether the asset files exist is tested
// separately (07 §3).

export interface CatalogInput {
  products: readonly Product[];
  initialConfiguration: Configuration;
  backdropSrc: string;
}

const CATEGORIES: readonly string[] = ["desk", "chair", "monitor", "lamp", "plant"];
const ACCESSORY_CATEGORIES: readonly string[] = ["monitor", "lamp", "plant"];
const STATUSES: readonly string[] = ["verified", "illustrative"];

// The approved catalog (05 §10). Adding a product means updating this list too.
const APPROVED_PRODUCTS: Readonly<Record<string, Category>> = {
  "desk-mechanical-adjustable": "desk",
  "desk-electrical-adjustable": "desk",
  "chair-ergonomic-office": "chair",
  "chair-cane-back": "chair",
  "monitor-24-full-hd-1c": "monitor",
  "lamp-smart-led-1s": "lamp",
  "plant-floor": "plant",
};
const APPROVED_VERIFIED_COUNT = 5;
const APPROVED_ILLUSTRATIVE_COUNT = 2;

const APPROVED_INITIAL: Configuration = {
  deskId: "desk-electrical-adjustable",
  chairId: "chair-ergonomic-office",
  accessoryIds: [],
};

const BACKDROP_SRC = "/workspace/backdrop.svg";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function validateProduct(product: Product, errors: string[]): void {
  const label = isNonEmpty(product.id) ? product.id : "(product without id)";

  if (!isNonEmpty(product.id)) errors.push("A product has an empty id.");
  if (!isNonEmpty(product.name)) errors.push(`${label}: name is empty.`);
  if (!CATEGORIES.includes(product.category)) {
    errors.push(`${label}: unsupported category "${String(product.category)}".`);
  }
  if (!STATUSES.includes(product.status)) {
    errors.push(`${label}: unsupported status "${String(product.status)}".`);
  }

  if (product.status === "verified") {
    const source = product.source;
    if (!source) {
      errors.push(`${label}: verified products need a source.`);
    } else {
      if (!isNonEmpty(source.url)) errors.push(`${label}: source.url is empty.`);
      if (!isNonEmpty(source.title)) errors.push(`${label}: source.title is empty.`);
      if (!isNonEmpty(source.note)) errors.push(`${label}: source.note is empty.`);
      if (!isNonEmpty(source.verifiedAt) || !ISO_DATE.test(source.verifiedAt)) {
        errors.push(`${label}: source.verifiedAt must be an ISO date (YYYY-MM-DD).`);
      }
    }
  } else if (product.status === "illustrative" && product.source !== undefined) {
    errors.push(`${label}: illustrative products must not have a source.`);
  }

  const asset = product.asset;
  if (!asset || !isNonEmpty(asset.src)) {
    errors.push(`${label}: asset.src is empty.`);
  } else if (asset.src !== `/workspace/products/${product.id}.svg`) {
    errors.push(`${label}: asset.src must be "/workspace/products/${product.id}.svg".`);
  }
  if (!asset || !Number.isInteger(asset.layer) || asset.layer < 1) {
    errors.push(`${label}: asset.layer must be an integer of at least 1 (0 is the backdrop).`);
  }
  if (asset?.offset !== undefined) {
    const { x, y } = asset.offset;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      errors.push(`${label}: asset.offset must have finite x and y.`);
    }
  }
}

// Items that can render together must not share a layer (05 §12 rule 9):
// desks and chairs never share one, and every accessory has its own. Desks
// may share a layer with each other, as may chairs, because only one of each
// is ever selected.
function validateLayers(products: readonly Product[], errors: string[]): void {
  const layersOf = (category: Category) =>
    new Set(products.filter((p) => p.category === category).map((p) => p.asset?.layer));
  const deskLayers = layersOf("desk");
  const chairLayers = layersOf("chair");

  for (const layer of deskLayers) {
    if (chairLayers.has(layer)) errors.push(`Layer ${layer} is used by both a desk and a chair.`);
  }

  const accessoryLayers = new Map<number, string>();
  for (const p of products) {
    if (!ACCESSORY_CATEGORIES.includes(p.category)) continue;
    const layer = p.asset?.layer;
    if (deskLayers.has(layer) || chairLayers.has(layer)) {
      errors.push(`${p.id}: layer ${layer} clashes with a desk or chair layer.`);
    }
    const other = accessoryLayers.get(layer);
    if (other !== undefined) {
      errors.push(`${p.id}: layer ${layer} is already used by ${other}.`);
    } else {
      accessoryLayers.set(layer, p.id);
    }
  }
}

function validateApprovedCatalog(products: readonly Product[], errors: string[]): void {
  const approvedIds = Object.keys(APPROVED_PRODUCTS);
  const ids = products.map((p) => p.id);

  if (products.length !== approvedIds.length) {
    errors.push(`The catalog must have exactly ${approvedIds.length} products; found ${products.length}.`);
  }
  for (const id of approvedIds) {
    const product = products.find((p) => p.id === id);
    if (!product) {
      errors.push(`Missing approved product "${id}".`);
    } else if (product.category !== APPROVED_PRODUCTS[id]) {
      errors.push(`${id}: category must be "${APPROVED_PRODUCTS[id]}".`);
    }
  }
  for (const id of ids) {
    if (isNonEmpty(id) && !(id in APPROVED_PRODUCTS)) errors.push(`Unexpected product "${id}".`);
  }

  const verified = products.filter((p) => p.status === "verified").length;
  const illustrative = products.filter((p) => p.status === "illustrative").length;
  if (verified !== APPROVED_VERIFIED_COUNT) {
    errors.push(`Expected ${APPROVED_VERIFIED_COUNT} verified products; found ${verified}.`);
  }
  if (illustrative !== APPROVED_ILLUSTRATIVE_COUNT) {
    errors.push(`Expected ${APPROVED_ILLUSTRATIVE_COUNT} illustrative products; found ${illustrative}.`);
  }
}

function validateInitialConfiguration(
  products: readonly Product[],
  initial: Configuration,
  errors: string[],
): void {
  const byId = new Map(products.map((p) => [p.id, p]));

  if (byId.get(initial.deskId)?.category !== "desk") {
    errors.push(`Initial deskId "${initial.deskId}" is not a desk in the catalog.`);
  }
  if (byId.get(initial.chairId)?.category !== "chair") {
    errors.push(`Initial chairId "${initial.chairId}" is not a chair in the catalog.`);
  }
  for (const id of initial.accessoryIds) {
    const category = byId.get(id)?.category;
    if (category === undefined || !ACCESSORY_CATEGORIES.includes(category)) {
      errors.push(`Initial accessory "${id}" is not an accessory in the catalog.`);
    }
  }
  if (initial.accessoryIds.length !== 0) {
    errors.push("The initial configuration must have no accessories (PD-4).");
  }

  if (initial.deskId !== APPROVED_INITIAL.deskId || initial.chairId !== APPROVED_INITIAL.chairId) {
    errors.push(
      `The initial configuration must be ${APPROVED_INITIAL.deskId} + ${APPROVED_INITIAL.chairId} (05 §11).`,
    );
  }
}

export function validateCatalog({
  products,
  initialConfiguration,
  backdropSrc,
}: CatalogInput): string[] {
  const errors: string[] = [];

  const seen = new Set<string>();
  for (const product of products) {
    if (seen.has(product.id)) errors.push(`Duplicate product id "${product.id}".`);
    seen.add(product.id);
    validateProduct(product, errors);
  }

  const count = (categories: readonly string[]) =>
    products.filter((p) => categories.includes(p.category)).length;
  if (count(["desk"]) < 2) errors.push("The catalog needs at least 2 desks.");
  if (count(["chair"]) < 2) errors.push("The catalog needs at least 2 chairs.");
  for (const category of ACCESSORY_CATEGORIES) {
    if (count([category]) < 1) errors.push(`The catalog needs at least one ${category}.`);
  }

  validateLayers(products, errors);
  validateApprovedCatalog(products, errors);
  validateInitialConfiguration(products, initialConfiguration, errors);

  if (backdropSrc !== BACKDROP_SRC) {
    errors.push(`The backdrop must be "${BACKDROP_SRC}".`);
  }

  return errors;
}

export function assertValidCatalog(input: CatalogInput): void {
  const errors = validateCatalog(input);
  if (errors.length > 0) {
    throw new Error(`Invalid product catalog:\n- ${errors.join("\n- ")}`);
  }
}
