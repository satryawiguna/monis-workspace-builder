import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatusLabel } from "../components/status-label";
import { catalog, initialConfiguration } from "../lib/catalog";
import { includesIllustrative } from "../lib/selectors";

// T10.1: equal status chips (04 - UI UX §9) and the preview's Illustrative
// indicator.

const chip = (status: "verified" | "illustrative") =>
  renderToStaticMarkup(createElement(StatusLabel, { status }));
const classOf = (html: string) => /class="([^"]*)"/.exec(html)?.[1];

describe("StatusLabel", () => {
  it("uses the approved wording", () => {
    expect(chip("verified")).toContain(">Seen on Monis Bali<");
    expect(chip("illustrative")).toContain(">Illustrative<");
  });

  it("gives both statuses exactly the same chip styling", () => {
    expect(classOf(chip("verified"))).toBeDefined();
    expect(classOf(chip("verified"))).toBe(classOf(chip("illustrative")));
  });
});

describe("includesIllustrative", () => {
  it("is false for the initial configuration (all Seen on Monis Bali)", () => {
    expect(includesIllustrative(initialConfiguration, catalog)).toBe(false);
  });

  it("is true once the Floor Plant is added", () => {
    expect(includesIllustrative({ ...initialConfiguration, accessoryIds: ["plant-floor"] }, catalog)).toBe(true);
  });

  it("is true with the Cane-back Chair", () => {
    expect(includesIllustrative({ ...initialConfiguration, chairId: "chair-cane-back" }, catalog)).toBe(true);
  });

  it("is false again when only verified products remain", () => {
    expect(
      includesIllustrative(
        { ...initialConfiguration, accessoryIds: ["monitor-24-full-hd-1c", "lamp-smart-led-1s"] },
        catalog,
      ),
    ).toBe(false);
  });
});
