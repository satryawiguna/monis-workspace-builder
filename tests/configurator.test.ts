import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog, initialConfiguration } from "../lib/catalog";
import {
  createInitialState,
  createReducer,
  isInitialView,
  isValidConfiguration,
  type Action,
  type ConfiguratorState,
  type Stage,
} from "../lib/configurator";

// 07 - Test Strategy §3 (reducer); behavior from 03 - Architecture §9 and
// Amendment 001 (§26).

const reducer = createReducer(catalog, initialConfiguration);
const run = (state: ConfiguratorState, ...actions: Action[]) => actions.reduce(reducer, state);

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

const init = createInitialState(initialConfiguration);

// A state that differs from the initial view in configuration, stage and tab.
function editedState(stage: Stage): ConfiguratorState {
  let state = run(
    init,
    { type: "selectChair", id: "chair-cane-back" },
    { type: "toggleAccessory", id: "lamp-smart-led-1s" },
    { type: "setActiveTab", tab: "extras" },
  );
  if (stage !== "configuring") state = run(state, { type: "review" });
  if (stage === "confirmed") state = run(state, { type: "submit" });
  return state;
}

describe("initial state", () => {
  it("is the approved configuration on Build with the Desk tab and no Undo", () => {
    expect(init).toEqual({
      configuration: {
        deskId: "desk-electrical-adjustable",
        chairId: "chair-ergonomic-office",
        accessoryIds: [],
      },
      stage: "configuring",
      ui: { activeTab: "desk" },
      undo: null,
    });
  });

  it("does not share arrays with the catalog's initial configuration", () => {
    expect(init.configuration.accessoryIds).not.toBe(initialConfiguration.accessoryIds);
  });
});

describe("desk and chair selection", () => {
  it("replaces the desk", () => {
    expect(run(init, { type: "selectDesk", id: "desk-mechanical-adjustable" }).configuration.deskId).toBe(
      "desk-mechanical-adjustable",
    );
  });

  it("replaces the chair", () => {
    expect(run(init, { type: "selectChair", id: "chair-cane-back" }).configuration.chairId).toBe("chair-cane-back");
  });

  it.each([
    ["an unknown id as a desk", { type: "selectDesk", id: "desk-unknown" }],
    ["a chair id as a desk", { type: "selectDesk", id: "chair-cane-back" }],
    ["an accessory id as a chair", { type: "selectChair", id: "plant-floor" }],
  ] as [string, Action][])("ignores %s, leaving the state unchanged and warning in development", (_name, action) => {
    expect(run(init, action)).toBe(init);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("does nothing when the item is already selected", () => {
    expect(run(init, { type: "selectDesk", id: "desk-electrical-adjustable" })).toBe(init);
  });

  it("is ignored outside the Build stage", () => {
    const reviewing = run(init, { type: "review" });
    expect(run(reviewing, { type: "selectDesk", id: "desk-mechanical-adjustable" })).toBe(reviewing);
  });
});

describe("accessories", () => {
  it("adds and removes each accessory independently, in catalog order", () => {
    const both = run(
      init,
      { type: "toggleAccessory", id: "plant-floor" },
      { type: "toggleAccessory", id: "monitor-24-full-hd-1c" },
    );
    expect(both.configuration.accessoryIds).toEqual(["monitor-24-full-hd-1c", "plant-floor"]);
    expect(run(both, { type: "toggleAccessory", id: "plant-floor" }).configuration.accessoryIds).toEqual([
      "monitor-24-full-hd-1c",
    ]);
  });

  it("allows every accessory at once and none at all", () => {
    const all = run(
      init,
      { type: "toggleAccessory", id: "monitor-24-full-hd-1c" },
      { type: "toggleAccessory", id: "lamp-smart-led-1s" },
      { type: "toggleAccessory", id: "plant-floor" },
    );
    expect(all.configuration.accessoryIds).toHaveLength(3);
    expect(new Set(all.configuration.accessoryIds).size).toBe(3);
    expect(init.configuration.accessoryIds).toEqual([]);
  });

  it("ignores a non-accessory id", () => {
    expect(run(init, { type: "toggleAccessory", id: "desk-mechanical-adjustable" })).toBe(init);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("is ignored outside the Build stage", () => {
    const reviewing = run(init, { type: "review" });
    expect(run(reviewing, { type: "toggleAccessory", id: "plant-floor" })).toBe(reviewing);
  });
});

describe("stage transitions", () => {
  const configured = run(init, { type: "toggleAccessory", id: "plant-floor" });

  it("review moves Build to Review and keeps the configuration", () => {
    const state = run(configured, { type: "review" });
    expect(state.stage).toBe("reviewing");
    expect(state.configuration).toEqual(configured.configuration);
  });

  it("edit moves Review back to Build and keeps the configuration", () => {
    const state = run(configured, { type: "review" }, { type: "edit" });
    expect(state.stage).toBe("configuring");
    expect(state.configuration).toEqual(configured.configuration);
  });

  it("submit moves Review to Confirmed and keeps the configuration", () => {
    const state = run(configured, { type: "review" }, { type: "submit" });
    expect(state.stage).toBe("confirmed");
    expect(state.configuration).toEqual(configured.configuration);
  });

  it("edit moves Confirmed back to Build and keeps the configuration", () => {
    const state = run(configured, { type: "review" }, { type: "submit" }, { type: "edit" });
    expect(state.stage).toBe("configuring");
    expect(state.configuration).toEqual(configured.configuration);
  });

  it("ignores submit and edit on Build", () => {
    expect(run(init, { type: "submit" })).toBe(init);
    expect(run(init, { type: "edit" })).toBe(init);
  });

  it("ignores review and submit on Confirmed", () => {
    const confirmed = run(init, { type: "review" }, { type: "submit" });
    expect(run(confirmed, { type: "review" })).toBe(confirmed);
    expect(run(confirmed, { type: "submit" })).toBe(confirmed);
  });

  it("does not submit an invalid configuration", () => {
    const invalid: ConfiguratorState = {
      ...init,
      stage: "reviewing",
      configuration: { ...init.configuration, deskId: "desk-unknown" },
    };
    expect(run(invalid, { type: "submit" })).toBe(invalid);
  });
});

describe("Start Over", () => {
  it("does nothing on the initial view", () => {
    expect(run(init, { type: "startOver" })).toBe(init);
  });

  it.each(["configuring", "reviewing", "confirmed"] as Stage[])(
    "from %s resets to the initial view and captures the previous state",
    (stage) => {
      const before = editedState(stage);
      const reset = run(before, { type: "startOver" });
      expect(reset.configuration).toEqual(initialConfiguration);
      expect(reset.stage).toBe("configuring");
      expect(reset.ui.activeTab).toBe("desk");
      expect(reset.undo).toEqual({
        configuration: before.configuration,
        stage: before.stage,
        activeTab: before.ui.activeTab,
      });
    },
  );

  it("works on Confirmed even when the confirmed setup is the initial one", () => {
    const confirmed = run(init, { type: "review" }, { type: "submit" });
    expect(run(confirmed, { type: "startOver" }).undo?.stage).toBe("confirmed");
  });

  it("replaces an earlier snapshot rather than stacking", () => {
    const first = run(editedState("configuring"), { type: "startOver" });
    const second = run(first, { type: "toggleAccessory", id: "plant-floor" }, { type: "startOver" });
    expect(second.undo?.configuration.accessoryIds).toEqual(["plant-floor"]);
  });
});

describe("Undo", () => {
  it.each(["configuring", "reviewing", "confirmed"] as Stage[])(
    "after Start Over from %s restores configuration, stage and tab exactly and clears the snapshot",
    (stage) => {
      const before = editedState(stage);
      const restored = run(before, { type: "startOver" }, { type: "undo" });
      expect(restored).toEqual({ ...before, undo: null });
    },
  );

  it("does nothing without a snapshot", () => {
    expect(run(init, { type: "undo" })).toBe(init);
  });

  it("is single-level: a second Undo does nothing", () => {
    const once = run(editedState("configuring"), { type: "startOver" }, { type: "undo" });
    expect(run(once, { type: "undo" })).toBe(once);
  });

  describe("the snapshot", () => {
    const withUndo = run(editedState("configuring"), { type: "startOver" });

    it.each([
      ["selectDesk", { type: "selectDesk", id: "desk-mechanical-adjustable" }],
      ["selectChair", { type: "selectChair", id: "chair-cane-back" }],
      ["toggleAccessory", { type: "toggleAccessory", id: "plant-floor" }],
      ["review", { type: "review" }],
    ] as [string, Action][])("is cleared by %s", (_name, action) => {
      expect(run(withUndo, action).undo).toBeNull();
    });

    it("is cleared by edit and submit", () => {
      const reviewing = { ...withUndo, stage: "reviewing" as const };
      expect(run(reviewing, { type: "edit" }).undo).toBeNull();
      expect(run(reviewing, { type: "submit" }).undo).toBeNull();
    });

    it("is kept when switching tabs", () => {
      expect(run(withUndo, { type: "setActiveTab", tab: "chair" }).undo).toEqual(withUndo.undo);
    });

    it("is kept by an ignored action", () => {
      expect(run(withUndo, { type: "selectDesk", id: "desk-unknown" })).toBe(withUndo);
      expect(run(withUndo, { type: "submit" })).toBe(withUndo);
    });
  });
});

describe("active tab", () => {
  it("switches tabs without touching the configuration or stage", () => {
    const state = run(init, { type: "setActiveTab", tab: "extras" });
    expect(state.ui.activeTab).toBe("extras");
    expect(state.configuration).toEqual(init.configuration);
    expect(state.stage).toBe("configuring");
  });

  it("ignores an unknown tab", () => {
    expect(run(init, { type: "setActiveTab", tab: "other" } as unknown as Action)).toBe(init);
  });
});

describe("helpers", () => {
  it("isInitialView needs the initial configuration, the Build stage and the Desk tab", () => {
    expect(isInitialView(init, initialConfiguration)).toBe(true);
    expect(isInitialView(run(init, { type: "setActiveTab", tab: "chair" }), initialConfiguration)).toBe(false);
    expect(isInitialView(run(init, { type: "review" }), initialConfiguration)).toBe(false);
  });

  it("isValidConfiguration accepts the initial configuration and rejects broken ones", () => {
    expect(isValidConfiguration(initialConfiguration, catalog)).toBe(true);
    expect(isValidConfiguration({ ...initialConfiguration, chairId: "desk-mechanical-adjustable" }, catalog)).toBe(false);
    expect(
      isValidConfiguration({ ...initialConfiguration, accessoryIds: ["plant-floor", "plant-floor"] }, catalog),
    ).toBe(false);
    expect(isValidConfiguration({ ...initialConfiguration, accessoryIds: ["chair-cane-back"] }, catalog)).toBe(false);
  });
});
