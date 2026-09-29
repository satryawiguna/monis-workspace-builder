import type { Stage } from "@/lib/configurator";
import { StageStepper } from "./stage-stepper";

// Application header (DESIGN.md §3): brand line, the informational stepper,
// and Start over as a text link when isStartOverVisible() allows it (DL-003).
// On Confirmed, Start over is the confirmation panel's secondary action
// instead, so the header doesn't repeat it.
interface AppHeaderProps {
  stage: Stage;
  showStartOver: boolean;
  onStartOver: () => void;
}

export function AppHeader({ stage, showStartOver, onStartOver }: AppHeaderProps) {
  return (
    <header className="flex h-13 shrink-0 items-center justify-between gap-3 border-b border-rule px-4 md:h-16 md:gap-4 md:px-8 lg:h-18 lg:px-10">
      <h1 className="flex items-baseline gap-2">
        <span className="font-serif text-lg md:text-section">Monis Rent</span>
        <span className="hidden text-copy text-stone md:inline">Workspace configurator</span>
      </h1>
      <div className="flex items-center gap-3 md:gap-6">
        <StageStepper stage={stage} />
        {showStartOver && stage !== "confirmed" && (
          <button
            type="button"
            onClick={onStartOver}
            className="min-h-11 shrink-0 px-1 text-sm font-semibold underline underline-offset-4 hover:decoration-2"
          >
            Start over
          </button>
        )}
      </div>
    </header>
  );
}
