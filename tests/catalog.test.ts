import { describe, expect, it } from "vitest";
import { backdropSrc, catalog, initialConfiguration } from "../lib/catalog";
import type { Configuration, Product } from "../lib/types";
import { validateCatalog, type CatalogInput } from "../lib/validate-catalog";

// 07 - Test Strategy §3 (catalog); rules from 05 - Data & API §12.

function fixture(): { products: Product[]; initialConfiguration: Configuration; backdropSrc: string } {
  return structuredClone({ products: [...catalog], initialConfiguration, backdropSrc });
}

function productById(input: CatalogInput & { products: Product[] }, id: string): Product {
  const product = input.products.find((p) => p.id === id);
  if (!product) throw new Error(`fixture is missing ${id}`);
  return product;
}

// Loosely typed view of a product, so fixtures can break the contract on
// purpose.
function loose(product: Product): Record<string, unknown> & { asset: Record<string, unknown> } {
  return product as unknown as Record<string, unknown> & { asset: Record<string, unknown> };
}

const source = {
  url: "https://www.monis.rent/products/example",
  title: "Example",
  verifiedAt: "2026-09-29",
  note: "product page for Bali",
};

describe("the approved catalog", () => {
  it("passes validation", () => {
    expect(validateCatalog({ products: catalog, initialConfiguration, backdropSrc })).toEqual([]);
  });

  it("has the 7 approved records: 2 desks, 2 chairs, a monitor, a lamp and a plant", () => {
    const count = (category: string) => catalog.filter((p) => p.category === category).length;
    expect(catalog).toHaveLength(7);
    expect(count("desk")).toBe(2);
    expect(count("chair")).toBe(2);
    expect(count("monitor")).toBe(1);
    expect(count("lamp")).toBe(1);
    expect(count("plant")).toBe(1);
  });

  it("has 5 verified and 2 illustrative records, and only the illustrative ones lack a source", () => {
    const verified = catalog.filter((p) => p.status === "verified");
    const illustrative = catalog.filter((p) => p.status === "illustrative");
    expect(verified).toHaveLength(5);
    expect(illustrative.map((p) => p.id).sort()).toEqual(["chair-cane-back", "plant-floor"]);
    expect(verified.every((p) => p.source !== undefined)).toBe(true);
    expect(illustrative.every((p) => p.source === undefined)).toBe(true);
  });

  it("starts from the Electrical Adjustable Desk and Ergonomic Office Chair with no extras", () => {
    expect(initialConfiguration).toEqual({
      deskId: "desk-electrical-adjustable",
      chairId: "chair-ergonomic-office",
      accessoryIds: [],
    });
  });

  it("points every product at /workspace/products/<id>.svg and the backdrop at /workspace/backdrop.svg", () => {
    for (const product of catalog) {
      expect(product.asset.src).toBe(`/workspace/products/${product.id}.svg`);
    }
    expect(backdropSrc).toBe("/workspace/backdrop.svg");
  });

  // The files are produced in T8 (DL-004); these checks are added with them.
  it.todo("has every asset file under public/, with viewBox 0 0 1200 800 and no forbidden elements");
  it.todo("keeps each SVG within 30 KB and all 8 within 150 KB");
});

describe("catalog validation", () => {
  it("accepts a new product as a data-only change (05 §9)", () => {
    const input = fixture();
    input.products.push({
      id: "desk-dual-motor",
      name: "Dual Motor Electric Standing Desk",
      category: "desk",
      status: "verified",
      source,
      asset: { src: "/workspace/products/desk-dual-motor.svg", layer: 20 },
    });
    expect(validateCatalog(input)).toEqual([]);
  });

  const broken: [string, (input: ReturnType<typeof fixture>) => void, RegExp][] = [
    ["a duplicate id", (i) => i.products.push(structuredClone(i.products[0])), /Duplicate product id/],
    ["an empty id", (i) => (loose(productById(i, "plant-floor")).id = ""), /empty id/],
    ["an empty name", (i) => (loose(productById(i, "plant-floor")).name = " "), /name is empty/],
    ["an unknown category", (i) => (loose(productById(i, "plant-floor")).category = "other"), /unsupported category/],
    ["an unknown status", (i) => (loose(productById(i, "plant-floor")).status = "available"), /unsupported status/],
    [
      "a verified product without a source",
      (i) => delete loose(productById(i, "desk-mechanical-adjustable")).source,
      /verified products need a source/,
    ],
    [
      "a verified product with an empty source field",
      (i) => (loose(productById(i, "lamp-smart-led-1s")).source = { ...source, note: "" }),
      /source\.note is empty/,
    ],
    [
      "a verified product with a non-ISO date",
      (i) => (loose(productById(i, "lamp-smart-led-1s")).source = { ...source, verifiedAt: "29/09/2026" }),
      /ISO date/,
    ],
    [
      "an illustrative product with a source",
      (i) => (loose(productById(i, "chair-cane-back")).source = source),
      /illustrative products must not have a source/,
    ],
    [
      "an asset path outside the convention",
      (i) => (loose(productById(i, "plant-floor")).asset.src = "/img/plant.png"),
      /asset\.src must be/,
    ],
    ["layer 0 (reserved for the backdrop)", (i) => (loose(productById(i, "plant-floor")).asset.layer = 0), /asset\.layer/],
    ["a fractional layer", (i) => (loose(productById(i, "plant-floor")).asset.layer = 10.5), /asset\.layer/],
    [
      "two accessories on one layer",
      (i) => (loose(productById(i, "lamp-smart-led-1s")).asset.layer = 30),
      /already used by monitor-24-full-hd-1c/,
    ],
    [
      "an accessory on the desk layer",
      (i) => (loose(productById(i, "plant-floor")).asset.layer = 20),
      /clashes with a desk or chair layer/,
    ],
    [
      "a desk and a chair on one layer",
      (i) => (loose(productById(i, "chair-cane-back")).asset.layer = 20),
      /used by both a desk and a chair/,
    ],
    [
      "a non-finite offset",
      (i) => (loose(productById(i, "desk-mechanical-adjustable")).asset.offset = { x: Number.NaN, y: 0 }),
      /asset\.offset/,
    ],
    ["fewer than 2 desks", (i) => (i.products = i.products.filter((p) => p.id !== "desk-mechanical-adjustable")), /at least 2 desks/],
    ["fewer than 2 chairs", (i) => (i.products = i.products.filter((p) => p.id !== "chair-cane-back")), /at least 2 chairs/],
    ["no monitor", (i) => (i.products = i.products.filter((p) => p.category !== "monitor")), /at least one monitor/],
    ["no lamp", (i) => (i.products = i.products.filter((p) => p.category !== "lamp")), /at least one lamp/],
    ["no plant", (i) => (i.products = i.products.filter((p) => p.category !== "plant")), /at least one plant/],
    ["an unknown initial desk", (i) => (i.initialConfiguration.deskId = "desk-unknown"), /Initial deskId/],
    [
      "a desk as the initial chair",
      (i) => (i.initialConfiguration.chairId = "desk-mechanical-adjustable"),
      /Initial chairId/,
    ],
    ["initial accessories", (i) => (i.initialConfiguration.accessoryIds = ["plant-floor"]), /no accessories/],
    [
      "a different initial desk",
      (i) => (i.initialConfiguration.deskId = "desk-mechanical-adjustable"),
      /must be desk-electrical-adjustable \+ chair-ergonomic-office/,
    ],
    ["a different backdrop path", (i) => (i.backdropSrc = "/bg.svg"), /backdrop must be/],
  ];

  it.each(broken)("rejects %s", (_name, mutate, message) => {
    const input = fixture();
    mutate(input);
    const errors = validateCatalog(input);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join("\n")).toMatch(message);
  });
});
