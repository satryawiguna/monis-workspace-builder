import type { Ref } from "react";
import type { SummaryView } from "@/lib/selectors";
import { SetupList } from "./review-panel";
import { SimulationNotice } from "./simulation-notice";

// Confirmed stage (04 - UI UX §11, FR-007, PD-3, AD-006): the request is
// simulated. Nothing was sent, ordered, reserved or paid, and the setup is
// restated from the same configuration.

export const SIMULATED_TAG = "Simulated request · demo only";

interface ConfirmationPanelProps {
  summary: SummaryView;
  headingRef: Ref<HTMLHeadingElement>;
  onKeepEditing: () => void;
  onStartOver: () => void;
}

export function ConfirmationPanel({ summary, headingRef, onKeepEditing, onStartOver }: ConfirmationPanelProps) {
  return (
    <>
      <section
        aria-labelledby="confirmed-heading"
        className="flex flex-1 flex-col gap-5 px-4 pt-7 pb-6 md:px-8 md:py-6 lg:min-h-0 lg:overflow-y-auto lg:px-7"
      >
        {/* Phone (DESIGN.md §3): success mark and step caption lead, and the
            Simulated request tag sits on the preview instead (configurator). */}
        <div className="flex items-center gap-3 md:hidden">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-leaf text-paper">
            <SuccessIcon />
          </span>
          <p className="text-xs font-bold tracking-eyebrow text-stone uppercase">Step 3 of 3 · Simulation</p>
        </div>
        <span className="hidden w-fit rounded-thumb border-[1.5px] border-leaf px-3 py-1.5 text-xs font-bold tracking-[0.03em] text-leaf-ink uppercase md:block">
          {SIMULATED_TAG}
        </span>
        <div className="flex flex-col gap-2">
          <h2
            id="confirmed-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-serif text-heading outline-none md:text-section"
          >
            Request simulated. <span className="block md:inline">Nice setup.</span>
          </h2>
          <p className="text-copy text-body">
            This is a demo: no rental was created, and nothing was booked or sent to Monis. No order was placed with
            Monis and no payment was taken. Monis availability, pricing and rental terms are not confirmed.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold tracking-eyebrow text-stone uppercase">Setup in this request</h3>
          <div className="rounded-2xl border border-hairline bg-card px-4">
            <SetupList summary={summary} />
          </div>
        </div>
        <SimulationNotice />
      </section>
      {/* FR-007: back to the configurator with the setup kept (primary), or
          a new configuration through the existing Start over (secondary). */}
      <div className="sticky bottom-0 flex shrink-0 flex-col gap-3 border-t border-hairline bg-paper px-4 pt-4 pb-6 md:px-8 lg:static lg:px-7">
        <button
          type="button"
          onClick={onKeepEditing}
          className="h-13 w-full rounded-row bg-ink text-label font-semibold text-paper motion-safe:transition-shadow motion-safe:duration-160 hover:shadow-halo"
        >
          Keep editing this workspace
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="h-12 w-full rounded-row border-[1.5px] border-ink text-label font-semibold hover:shadow-[inset_0_0_0_2px_var(--color-ink)]"
        >
          Start over
        </button>
      </div>
    </>
  );
}

function SuccessIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5 L10 17 L19 7" />
    </svg>
  );
}
