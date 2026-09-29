import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Configurator } from "../components/configurator";
import { ProductOption } from "../components/product-option";
import { backdropSrc, catalog, initialConfiguration } from "../lib/catalog";

// T14: CSS-only motion (DESIGN.md §5, 04 §17). Every animated class is
// motion-safe, and only opacity and transform properties move.

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const lamp = catalog.find((p) => p.id === "lamp-smart-led-1s")!;
const option = (checked: boolean) =>
  renderToStaticMarkup(
    createElement(ProductOption, { product: lamp, type: "checkbox", name: "extras", checked, onChange: () => {} }),
  );

describe("stage-change motion", () => {
  it("fades in and slides 14px over 320ms, with opacity and transform only", () => {
    expect(css).toContain("--animate-stage-enter: stage-enter 320ms ease-out;");
    const keyframes = css.slice(css.indexOf("@keyframes stage-enter"));
    const body = keyframes.slice(0, keyframes.indexOf("\n  }\n"));
    expect(body).toContain("transform: translateX(14px)");
    expect([...body.matchAll(/^\s+([a-z-]+):/gm)].map((m) => m[1]).sort()).toEqual([
      "opacity",
      "opacity",
      "transform",
      "transform",
    ]);
  });

  it("does not play on first load", () => {
    const html = renderToStaticMarkup(
      createElement(Configurator, { catalog, initialConfiguration, backdropSrc }),
    );
    expect(html).not.toContain("animate-stage-enter");
  });
});

describe("extras toggle knob", () => {
  it("moves with translate, not left, and only under motion-safe", () => {
    expect(option(false)).toMatch(/left-\[3px\][^"]*motion-safe:transition-\[translate\]/);
    expect(option(true)).toMatch(/motion-safe:transition-\[translate\][^"]*translate-x-4/);
    expect(option(true)).not.toMatch(/left-\[19px\]|transition-\[left\]/);
  });
});

describe("option card hover lift", () => {
  it("transitions the translate property that the lift uses", () => {
    expect(option(false)).toContain("motion-safe:transition-[box-shadow,translate]");
    expect(option(false)).toContain("motion-safe:hover:-translate-y-px");
  });
});

describe("reduced motion", () => {
  it("keeps the global override for animation, transitions and smooth scroll", () => {
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toContain("animation-duration: 0.01ms !important;");
    expect(block).toContain("transition-duration: 0.01ms !important;");
    expect(block).toContain("scroll-behavior: auto !important;");
  });
});
