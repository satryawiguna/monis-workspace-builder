import type { Stage } from "@/lib/configurator";
import { StageStepper } from "./stage-stepper";

// Application header (DESIGN.md §3): brand line and the informational
// stepper. Start over (T12) is added later.
export function AppHeader({ stage }: { stage: Stage }) {
  return (
    <header className="flex h-13 shrink-0 items-center justify-between gap-4 border-b border-rule px-4 md:h-16 md:px-8 lg:h-18 lg:px-10">
      <h1 className="flex items-baseline gap-2">
        <span className="font-serif text-section">Monis Rent</span>
        <span className="hidden text-copy text-stone md:inline">Workspace configurator</span>
      </h1>
      <StageStepper stage={stage} />
    </header>
  );
}
