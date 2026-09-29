import type { Configuration, Product, ProductId } from "./types";

// Configurator state and reducer: 03 - Architecture §9 (AD-004) as amended by
// Amendment 001 (§26). Pure, framework-free, and free of persistence, URL
// state and network access.

export type Stage = "configuring" | "reviewing" | "confirmed";

// Ephemeral UI navigation, not domain state (03 §26.1).
export type Tab = "desk" | "chair" | "extras";

export const DEFAULT_TAB: Tab = "desk";

export interface UndoSnapshot {
  configuration: Configuration;
  stage: Stage;
  activeTab: Tab;
}

export interface ConfiguratorState {
  configuration: Configuration; // the single source of truth for every view
  stage: Stage;
  ui: { activeTab: Tab };
  undo: UndoSnapshot | null; // set by Start Over; single level, in memory only
}

// No dismissUndo: Amendment 001 adds it only if the UI offers a dismiss
// control, and 04 - UI UX designs none.
export type Action =
  | { type: "selectDesk"; id: ProductId }
  | { type: "selectChair"; id: ProductId }
  | { type: "toggleAccessory"; id: ProductId }
  | { type: "review" }
  | { type: "edit" }
  | { type: "submit" }
  | { type: "startOver" }
  | { type: "undo" }
  | { type: "setActiveTab"; tab: Tab };

const ACCESSORY_CATEGORIES: readonly string[] = ["monitor", "lamp", "plant"];
const TABS: readonly string[] = ["desk", "chair", "extras"];

function copyConfiguration(configuration: Configuration): Configuration {
  return { ...configuration, accessoryIds: [...configuration.accessoryIds] };
}

export function createInitialState(initialConfiguration: Configuration): ConfiguratorState {
  return {
    configuration: copyConfiguration(initialConfiguration),
    stage: "configuring",
    ui: { activeTab: DEFAULT_TAB },
    undo: null,
  };
}

export function sameConfiguration(a: Configuration, b: Configuration): boolean {
  return (
    a.deskId === b.deskId &&
    a.chairId === b.chairId &&
    a.accessoryIds.length === b.accessoryIds.length &&
    a.accessoryIds.every((id) => b.accessoryIds.includes(id))
  );
}

// The view Start Over returns to (03 §26.2): initial configuration, Build
// stage and default tab.
export function isInitialView(state: ConfiguratorState, initialConfiguration: Configuration): boolean {
  return (
    sameConfiguration(state.configuration, initialConfiguration) &&
    state.stage === "configuring" &&
    state.ui.activeTab === DEFAULT_TAB
  );
}

// Exactly one existing desk, one existing chair, and unique existing
// accessories (SR-1 to SR-3). The reducer can't produce anything else; submit
// checks it anyway (03 §16).
export function isValidConfiguration(
  configuration: Configuration,
  catalog: readonly Product[],
): boolean {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const { deskId, chairId, accessoryIds } = configuration;
  return (
    byId.get(deskId)?.category === "desk" &&
    byId.get(chairId)?.category === "chair" &&
    new Set(accessoryIds).size === accessoryIds.length &&
    accessoryIds.every((id) => ACCESSORY_CATEGORIES.includes(byId.get(id)?.category ?? ""))
  );
}

function warnIgnored(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[configurator] ${message}`);
  }
}

export function createReducer(catalog: readonly Product[], initialConfiguration: Configuration) {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const catalogOrder = new Map(catalog.map((p, index) => [p.id, index]));

  // Any change to the configuration or the stage clears the Undo snapshot
  // (03 §26.3).
  function withChange(
    state: ConfiguratorState,
    changes: Partial<Pick<ConfiguratorState, "configuration" | "stage">>,
  ): ConfiguratorState {
    return { ...state, ...changes, undo: null };
  }

  return function reducer(state: ConfiguratorState, action: Action): ConfiguratorState {
    switch (action.type) {
      case "selectDesk":
      case "selectChair": {
        const category = action.type === "selectDesk" ? "desk" : "chair";
        if (state.stage !== "configuring") return state;
        if (byId.get(action.id)?.category !== category) {
          warnIgnored(`${action.type} ignored: "${action.id}" is not a ${category}.`);
          return state;
        }
        const key = category === "desk" ? "deskId" : "chairId";
        if (state.configuration[key] === action.id) return state;
        return withChange(state, { configuration: { ...state.configuration, [key]: action.id } });
      }

      case "toggleAccessory": {
        if (state.stage !== "configuring") return state;
        if (!ACCESSORY_CATEGORIES.includes(byId.get(action.id)?.category ?? "")) {
          warnIgnored(`toggleAccessory ignored: "${action.id}" is not an accessory.`);
          return state;
        }
        const current = state.configuration.accessoryIds;
        const accessoryIds = current.includes(action.id)
          ? current.filter((id) => id !== action.id)
          : [...current, action.id].sort(
              (a, b) => (catalogOrder.get(a) ?? 0) - (catalogOrder.get(b) ?? 0),
            );
        return withChange(state, { configuration: { ...state.configuration, accessoryIds } });
      }

      case "review":
        return state.stage === "configuring" ? withChange(state, { stage: "reviewing" }) : state;

      // From Review or Confirmed back to Build, keeping the configuration
      // (SR-6; 05 §16).
      case "edit":
        return state.stage === "reviewing" || state.stage === "confirmed"
          ? withChange(state, { stage: "configuring" })
          : state;

      // Simulated request (AD-006): a stage change only; nothing is sent.
      case "submit":
        if (state.stage !== "reviewing") return state;
        if (!isValidConfiguration(state.configuration, catalog)) {
          warnIgnored("submit ignored: the configuration is not valid.");
          return state;
        }
        return withChange(state, { stage: "confirmed" });

      case "startOver":
        if (isInitialView(state, initialConfiguration)) return state;
        return {
          configuration: copyConfiguration(initialConfiguration),
          stage: "configuring",
          ui: { activeTab: DEFAULT_TAB },
          undo: {
            configuration: state.configuration,
            stage: state.stage,
            activeTab: state.ui.activeTab,
          },
        };

      case "undo":
        if (state.undo === null) return state;
        return {
          configuration: state.undo.configuration,
          stage: state.undo.stage,
          ui: { activeTab: state.undo.activeTab },
          undo: null,
        };

      // Tab switching never clears the Undo snapshot (03 §26.3).
      case "setActiveTab":
        if (!TABS.includes(action.tab)) {
          warnIgnored(`setActiveTab ignored: unknown tab "${String(action.tab)}".`);
          return state;
        }
        if (state.ui.activeTab === action.tab) return state;
        return { ...state, ui: { activeTab: action.tab } };

      default:
        return state;
    }
  };
}
