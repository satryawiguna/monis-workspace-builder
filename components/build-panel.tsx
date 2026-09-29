import type { Tab } from "@/lib/configurator";
import type { SummaryView } from "@/lib/selectors";
import type { Configuration, Product, ProductId } from "@/lib/types";
import { ProductOption } from "./product-option";

// Build stage controls (04 - UI UX §5, §8; DESIGN.md §3). The Desk · Chair ·
// Extras switcher uses native buttons with aria-pressed, not the ARIA tabs
// pattern (AD-008: no custom keyboard handling).

interface BuildPanelProps {
  catalog: readonly Product[];
  configuration: Configuration;
  summary: SummaryView;
  activeTab: Tab;
  onSelectTab: (tab: Tab) => void;
  onSelectDesk: (id: ProductId) => void;
  onSelectChair: (id: ProductId) => void;
  onToggleAccessory: (id: ProductId) => void;
}

const SECTIONS: Record<Tab, { title: string; hint: string }> = {
  desk: { title: "Choose a desk", hint: "Pick one" },
  chair: { title: "Choose a chair", hint: "Pick one" },
  extras: { title: "Add extras", hint: "Optional · add any" },
};

const ACCESSORY_CATEGORIES: readonly string[] = ["monitor", "lamp", "plant"];

export function BuildPanel({
  catalog,
  configuration,
  summary,
  activeTab,
  onSelectTab,
  onSelectDesk,
  onSelectChair,
  onToggleAccessory,
}: BuildPanelProps) {
  const extrasCount = summary.accessories.length;
  const tabs: { tab: Tab; label: string; current: string }[] = [
    { tab: "desk", label: "Desk", current: summary.desk.name },
    { tab: "chair", label: "Chair", current: summary.chair.name },
    { tab: "extras", label: "Extras", current: extrasCount === 0 ? "None added" : `${extrasCount} added` },
  ];

  const section = SECTIONS[activeTab];
  const options =
    activeTab === "extras"
      ? catalog.filter((p) => ACCESSORY_CATEGORIES.includes(p.category))
      : catalog.filter((p) => p.category === activeTab);

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Workspace parts" className="grid grid-cols-3 gap-1 rounded-row bg-sand p-1">
        {tabs.map(({ tab, label, current }) => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectTab(tab)}
              className={`flex min-h-[58px] min-w-0 flex-col items-start justify-center gap-0.5 rounded-thumb px-3 py-2 text-left motion-safe:transition-shadow motion-safe:duration-160 ${
                active ? "bg-card shadow-tab" : "hover:shadow-[inset_0_0_0_1px_var(--color-tab-edge)]"
              }`}
            >
              <span className="text-label font-semibold">{label}</span>
              <span className="w-full truncate text-xs text-stone">{current}</span>
            </button>
          );
        })}
      </div>

      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-3 flex w-full items-baseline justify-between gap-3">
          <span className="font-serif text-section">{section.title}</span>
          <span className="text-xs text-stone">{section.hint}</span>
        </legend>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
          {options.map((product) => {
            if (activeTab === "extras") {
              return (
                <ProductOption
                  key={product.id}
                  product={product}
                  type="checkbox"
                  name="extras"
                  checked={configuration.accessoryIds.includes(product.id)}
                  onChange={() => onToggleAccessory(product.id)}
                />
              );
            }
            const isDesk = activeTab === "desk";
            return (
              <ProductOption
                key={product.id}
                product={product}
                type="radio"
                name={activeTab}
                checked={isDesk ? configuration.deskId === product.id : configuration.chairId === product.id}
                onChange={() => (isDesk ? onSelectDesk(product.id) : onSelectChair(product.id))}
              />
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
