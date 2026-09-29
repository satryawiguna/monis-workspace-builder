import { describe, expect, it } from "vitest";
import { catalog, initialConfiguration } from "../lib/catalog";
import { createInitialState, createReducer, type Action, type ConfiguratorState } from "../lib/configurator";
import {
  isStartOverVisible,
  previewAltText,
  selectLayers,
  selectSummary,
  tabForCategory,
} from "../lib/selectors";
import type { Configuration } from "../lib/types";

// 07 - Test Strategy §3 (selectors); contracts from 05 - Data & API §14–15,
// 03 - Architecture §12 and DL-003.

const ids = (category: string) => catalog.filter((p) => p.category === category).map((p) => p.id);
const accessoryIds = catalog
  .filter((p) => ["monitor", "lamp", "plant"].includes(p.category))
  .map((p) => p.id);

// Every configuration: 2 desk choices × 2 chair choices × 2³ combinations of
// the three on/off accessories (monitor, lamp, plant) = 32.
const allConfigurations: Configuration[] = ids("desk").flatMap((deskId) =>
  ids("chair").flatMap((chairId) =>
    Array.from({ length: 2 ** accessoryIds.length }, (_, mask) => ({
      deskId,
      chairId,
      accessoryIds: accessoryIds.filter((_, bit) => mask & (1 << bit)),
    })),
  ),
);

describe("across all configurations", () => {
  it("covers all 32", () => {
    expect(allConfigurations).toHaveLength(32);
  });

  it.each(allConfigurations.map((c) => [JSON.stringify(c), c] as const))(
    "%s: layers and summary list the same products",
    (_label, configuration) => {
      const layers = selectLayers(configuration, catalog);
      const summary = selectSummary(configuration, catalog);
      const summaryIds = [summary.desk, summary.chair, ...summary.accessories].map((l) => l.productId);

      expect(layers.map((l) => l.productId).sort()).toEqual([...summaryIds].sort());
      expect(summary.itemCount).toBe(2 + configuration.accessoryIds.length);
      expect(layers.map((l) => l.layer)).toEqual([...layers.map((l) => l.layer)].sort((a, b) => a - b));
    },
  );
});

describe("selectLayers", () => {
  it("returns exactly the selected products, back to front", () => {
    const layers = selectLayers(
      { ...initialConfiguration, accessoryIds: ["lamp-smart-led-1s", "plant-floor", "monitor-24-full-hd-1c"] },
      catalog,
    );
    expect(layers.map((l) => l.productId)).toEqual([
      "plant-floor",
      "desk-electrical-adjustable",
      "monitor-24-full-hd-1c",
      "lamp-smart-led-1s",
      "chair-ergonomic-office",
    ]);
    expect(layers[0]).toEqual({ productId: "plant-floor", src: "/workspace/products/plant-floor.svg", layer: 10 });
  });

  it("breaks layer ties by catalog order", () => {
    const tied = catalog.map((p) => ({ ...p, asset: { ...p.asset, layer: 20 } }));
    const layers = selectLayers({ ...initialConfiguration, accessoryIds: ["plant-floor"] }, tied);
    expect(layers.map((l) => l.productId)).toEqual([
      "desk-electrical-adjustable",
      "chair-ergonomic-office",
      "plant-floor",
    ]);
  });

  it("throws on an unknown product rather than hiding it", () => {
    expect(() => selectLayers({ ...initialConfiguration, deskId: "desk-unknown" }, catalog)).toThrow(/Unknown product/);
  });
});

describe("selectSummary", () => {
  it("lists desk, chair and extras in catalog order with their statuses", () => {
    const summary = selectSummary(
      { deskId: "desk-mechanical-adjustable", chairId: "chair-cane-back", accessoryIds: ["plant-floor", "monitor-24-full-hd-1c"] },
      catalog,
    );
    expect(summary).toEqual({
      desk: { productId: "desk-mechanical-adjustable", name: "Mechanical Adjustable Desk", category: "desk", status: "verified" },
      chair: { productId: "chair-cane-back", name: "Cane-back Chair", category: "chair", status: "illustrative" },
      accessories: [
        { productId: "monitor-24-full-hd-1c", name: '24" Full HD Office Monitor 1C', category: "monitor", status: "verified" },
        { productId: "plant-floor", name: "Floor Plant", category: "plant", status: "illustrative" },
      ],
      itemCount: 4,
    });
  });

  it("has no extras for the initial configuration", () => {
    const summary = selectSummary(initialConfiguration, catalog);
    expect(summary.accessories).toEqual([]);
    expect(summary.itemCount).toBe(2);
  });
});

describe("previewAltText", () => {
  it("describes a setup with no extras", () => {
    expect(previewAltText(initialConfiguration, catalog)).toBe(
      "Workspace with Electrical Adjustable Desk, Ergonomic Office Chair and no extras.",
    );
  });

  it("names every extra in catalog order", () => {
    expect(
      previewAltText({ ...initialConfiguration, accessoryIds: ["plant-floor", "lamp-smart-led-1s"] }, catalog),
    ).toBe("Workspace with Electrical Adjustable Desk, Ergonomic Office Chair, Smart LED Desk Lamp 1S and Floor Plant.");
  });
});

describe("isStartOverVisible (DL-003)", () => {
  const reducer = createReducer(catalog, initialConfiguration);
  const run = (...actions: Action[]): ConfiguratorState =>
    actions.reduce(reducer, createInitialState(initialConfiguration));

  it("is hidden on Build and Review with the initial configuration", () => {
    expect(isStartOverVisible(run(), initialConfiguration)).toBe(false);
    expect(isStartOverVisible(run({ type: "setActiveTab", tab: "extras" }), initialConfiguration)).toBe(false);
    expect(isStartOverVisible(run({ type: "review" }), initialConfiguration)).toBe(false);
  });

  it("is visible when the configuration differs", () => {
    expect(isStartOverVisible(run({ type: "toggleAccessory", id: "plant-floor" }), initialConfiguration)).toBe(true);
    expect(isStartOverVisible(run({ type: "selectDesk", id: "desk-mechanical-adjustable" }), initialConfiguration)).toBe(
      true,
    );
  });

  it("is visible on Confirmed, even with the initial configuration", () => {
    expect(isStartOverVisible(run({ type: "review" }, { type: "submit" }), initialConfiguration)).toBe(true);
  });
});

describe("tabForCategory", () => {
  it("maps desks and chairs to their tabs and every accessory to Extras", () => {
    expect(tabForCategory("desk")).toBe("desk");
    expect(tabForCategory("chair")).toBe("chair");
    expect(tabForCategory("monitor")).toBe("extras");
    expect(tabForCategory("lamp")).toBe("extras");
    expect(tabForCategory("plant")).toBe("extras");
  });
});
