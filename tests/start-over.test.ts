import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppHeader } from "../components/app-header";
import { ResetUndoBanner } from "../components/reset-undo-banner";
import { catalog, initialConfiguration } from "../lib/catalog";
import { createInitialState, createReducer, type Action, type ConfiguratorState } from "../lib/configurator";
import { isStartOverVisible } from "../lib/selectors";

// T12: the Start over / Undo journeys from Architecture Amendment 001 (03
// §26), the DL-003 visibility rule, and the two controls. The reducer's
// individual rules are covered in configurator.test.ts.

const reducer = createReducer(catalog, initialConfiguration);
const init = createInitialState(initialConfiguration);
const run = (state: ConfiguratorState, ...actions: Action[]) => actions.reduce(reducer, state);
const visible = (state: ConfiguratorState) => isStartOverVisible(state, initialConfiguration);
const noop = () => {};

describe("Start over and Undo journeys", () => {
  it("A: Build, change desk, Start over, Undo", () => {
    const changed = run(init, { type: "selectDesk", id: "desk-mechanical-adjustable" });
    expect(visible(init)).toBe(false);
    expect(visible(changed)).toBe(true);

    const reset = run(changed, { type: "startOver" });
    expect(reset.configuration).toEqual(initialConfiguration);
    expect(reset.stage).toBe("configuring");
    expect(reset.ui.activeTab).toBe("desk");
    expect(reset.undo).not.toBeNull();
    expect(visible(reset)).toBe(false);

    expect(run(reset, { type: "undo" })).toEqual({ ...changed, undo: null });
  });

  it("B: change accessories, Review, Start over, Undo restores Review and the tab", () => {
    const reviewing = run(
      init,
      { type: "setActiveTab", tab: "extras" },
      { type: "toggleAccessory", id: "plant-floor" },
      { type: "review" },
    );
    expect(visible(reviewing)).toBe(true);
    const restored = run(reviewing, { type: "startOver" }, { type: "undo" });
    expect(restored.stage).toBe("reviewing");
    expect(restored.ui.activeTab).toBe("extras");
    expect(restored.configuration).toEqual(reviewing.configuration);
    expect(restored.undo).toBeNull();
  });

  it("C: Confirmed, Start over, Undo restores Confirmed with the configuration", () => {
    const confirmed = run(
      init,
      { type: "selectChair", id: "chair-cane-back" },
      { type: "review" },
      { type: "submit" },
    );
    const restored = run(confirmed, { type: "startOver" }, { type: "undo" });
    expect(restored).toEqual({ ...confirmed, undo: null });
  });

  it("D: switching tabs after Start over keeps Undo and restores the original snapshot", () => {
    const changed = run(init, { type: "toggleAccessory", id: "lamp-smart-led-1s" });
    const afterTabs = run(
      changed,
      { type: "startOver" },
      { type: "setActiveTab", tab: "chair" },
      { type: "setActiveTab", tab: "extras" },
    );
    expect(afterTabs.undo).not.toBeNull();
    expect(run(afterTabs, { type: "undo" })).toEqual({ ...changed, undo: null });
  });

  it("E: changing the configuration after Start over clears Undo and keeps the new change", () => {
    const after = run(
      init,
      { type: "selectDesk", id: "desk-mechanical-adjustable" },
      { type: "startOver" },
      { type: "toggleAccessory", id: "plant-floor" },
    );
    expect(after.undo).toBeNull();
    expect(after.configuration.accessoryIds).toEqual(["plant-floor"]);
    expect(after.configuration.deskId).toBe("desk-electrical-adjustable");
    expect(run(after, { type: "undo" })).toBe(after);
  });

  it("F: Confirmed with the initial configuration shows Start over, and Undo restores it", () => {
    const confirmed = run(init, { type: "review" }, { type: "submit" });
    expect(visible(confirmed)).toBe(true);
    const reset = run(confirmed, { type: "startOver" });
    expect(reset.stage).toBe("configuring");
    expect(reset.undo?.stage).toBe("confirmed");
    expect(run(reset, { type: "undo" })).toEqual({ ...confirmed, undo: null });
  });

  it("a stage change after Start over clears Undo", () => {
    const reset = run(init, { type: "toggleAccessory", id: "plant-floor" }, { type: "startOver" });
    expect(run(reset, { type: "review" }).undo).toBeNull();
  });
});

describe("AppHeader Start over link", () => {
  const html = (showStartOver: boolean) =>
    renderToStaticMarkup(createElement(AppHeader, { stage: "configuring", showStartOver, onStartOver: noop }));

  it("renders a Start over button only when visible", () => {
    expect(html(false)).not.toContain("Start over");
    expect(html(true)).toMatch(/<button type="button"[^>]*>Start over<\/button>/);
  });
});

describe("ResetUndoBanner", () => {
  const html = renderToStaticMarkup(createElement(ResetUndoBanner, { onUndo: noop }));

  it("offers a single Undo button with an accessible name", () => {
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Undo start over and restore your previous setup"');
    expect(html).toContain(">Undo<");
  });

  it("says the previous setup can be restored, without implying history", () => {
    expect(html).toContain("Your previous setup can be restored.");
    expect(html).not.toMatch(/history|versions|steps back/i);
  });
});
