import type { Stage } from "@/lib/configurator";

// Informational stage indicator (04 - UI UX §12, DESIGN.md §3). It shows
// progress only: no buttons, links or hover, so it can't be used to move
// between stages.

export const STEPS: readonly { stage: Stage; label: string }[] = [
  { stage: "configuring", label: "Build" },
  { stage: "reviewing", label: "Review" },
  { stage: "confirmed", label: "Confirmed" },
];

export type StepState = "done" | "current" | "upcoming";

export function stepStates(stage: Stage): StepState[] {
  const current = STEPS.findIndex((step) => step.stage === stage);
  return STEPS.map((_, index) => (index < current ? "done" : index === current ? "current" : "upcoming"));
}

export function StageStepper({ stage }: { stage: Stage }) {
  const states = stepStates(stage);
  const currentIndex = states.indexOf("current");

  return (
    <div className="flex items-center">
      <p className="sr-only">
        Step {currentIndex + 1} of {STEPS.length}, {STEPS[currentIndex].label}
      </p>
      <ol aria-hidden="true" className="flex items-center gap-2.5">
        {STEPS.map((step, index) => {
          const state = states[index];
          return (
            <li key={step.stage} className="flex items-center gap-2.5">
              {index > 0 && (
                <span className={`h-0.5 w-5 lg:w-7 ${state === "upcoming" ? "bg-connector" : "bg-ink"}`} />
              )}
              <span className={`flex items-center gap-2 ${state === "upcoming" ? "text-stone-muted" : "text-ink"}`}>
                <span
                  className={`flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold ${
                    state === "done"
                      ? "bg-leaf text-paper"
                      : state === "current"
                        ? "bg-ink text-paper"
                        : "border-[1.5px] border-radio-edge"
                  }`}
                >
                  {state === "done" ? <CheckIcon /> : index + 1}
                </span>
                {/* Tablet and phone use the compact form: only the current
                    step keeps its label (DESIGN.md §3). */}
                <span
                  className={`text-sm ${state === "current" ? "font-bold" : "hidden font-medium lg:inline"}`}
                >
                  {step.label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5 L10 17 L19 7" />
    </svg>
  );
}
