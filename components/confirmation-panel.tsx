import type { Ref } from "react";
import type { SummaryView } from "@/lib/selectors";
import { SetupList } from "./review-panel";
import { SimulationNotice } from "./simulation-notice";

// Confirmed stage (04 - UI UX §11, FR-007, PD-3, AD-006): the request is
// simulated. Nothing was sent, ordered, reserved or paid, and the setup is
// restated from the same configuration.

interface ConfirmationPanelProps {
  summary: SummaryView;
  headingRef: Ref<HTMLHeadingElement>;
  onBackToSetup: () => void;
}

export function ConfirmationPanel({ summary, headingRef, onBackToSetup }: ConfirmationPanelProps) {
  return (
    <>
      <section
        aria-labelledby="confirmed-heading"
        className="flex flex-col gap-5 px-4 py-6 md:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-7"
      >
        <span className="w-fit rounded-thumb border-[1.5px] border-leaf px-3 py-1.5 text-xs font-bold tracking-[0.03em] text-leaf-ink uppercase">
          Simulated request · demo only
        </span>
        <div className="flex flex-col gap-2">
          <h2 id="confirmed-heading" ref={headingRef} tabIndex={-1} className="font-serif text-section outline-none">
            Request simulated. Nice setup.
          </h2>
          <p className="text-copy text-body">
            No order was placed with Monis and no payment was taken. Monis availability, pricing and rental
            terms are not confirmed.
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
      {/* Start over, the other exit FR-007 requires, is the header link. */}
      <div className="sticky bottom-0 flex shrink-0 flex-col gap-3 border-t border-hairline bg-paper px-4 pt-4 pb-6 md:px-8 lg:static lg:px-7">
        <button
          type="button"
          onClick={onBackToSetup}
          className="h-12 w-full rounded-row border-[1.5px] border-ink text-label font-semibold hover:shadow-[inset_0_0_0_2px_var(--color-ink)]"
        >
          Back to setup
        </button>
      </div>
    </>
  );
}
