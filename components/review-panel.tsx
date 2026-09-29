import type { Ref } from "react";
import type { SummaryLine, SummaryView } from "@/lib/selectors";
import type { Category } from "@/lib/types";
import { SimulationNotice } from "./simulation-notice";
import { StatusLabel } from "./status-label";

// Review stage (04 - UI UX §10, FR-006): the same configuration the preview
// shows, item by item with statuses and the item count. No prices, totals or
// rental terms.

interface ReviewPanelProps {
  summary: SummaryView;
  headingRef: Ref<HTMLHeadingElement>;
  onChange: (category: Category) => void;
  onRequest: () => void;
  onChangeSetup: () => void;
}

// The configured items as rows (ReviewList / ReviewRow). Also used by the
// confirmation to restate the setup; `onChange` adds the per-row Change action.
export function SetupList({ summary, onChange }: { summary: SummaryView; onChange?: (category: Category) => void }) {
  const row = (label: string, line: SummaryLine) => (
    <li key={line.productId} className="flex items-center gap-3 border-b border-hairline py-3 last:border-b-0">
      <div className="flex min-w-0 grow flex-col gap-1">
        <span className="text-xs font-bold tracking-eyebrow text-stone uppercase">{label}</span>
        <span className="text-label font-semibold">{line.name}</span>
        <StatusLabel status={line.status} />
      </div>
      {onChange && (
        <button
          type="button"
          onClick={() => onChange(line.category)}
          aria-label={`Change ${label.toLowerCase()}`}
          className="min-h-11 shrink-0 px-1 text-sm font-semibold underline underline-offset-4 hover:decoration-2"
        >
          Change
        </button>
      )}
    </li>
  );

  return (
    <ul className="flex flex-col">
      {row("Desk", summary.desk)}
      {row("Chair", summary.chair)}
      {summary.accessories.length === 0 ? (
        <li className="flex items-center gap-3 py-3">
          <div className="flex grow flex-col gap-1">
            <span className="text-xs font-bold tracking-eyebrow text-stone uppercase">Extras</span>
            <span className="text-copy text-stone">None added — extras are optional.</span>
          </div>
          {onChange && (
            <button
              type="button"
              onClick={() => onChange("monitor")}
              aria-label="Change extras"
              className="min-h-11 shrink-0 px-1 text-sm font-semibold underline underline-offset-4 hover:decoration-2"
            >
              Change
            </button>
          )}
        </li>
      ) : (
        summary.accessories.map((line) => row("Extra", line))
      )}
    </ul>
  );
}

export function ReviewPanel({ summary, headingRef, onChange, onRequest, onChangeSetup }: ReviewPanelProps) {
  return (
    <>
      <section
        aria-labelledby="review-heading"
        className="flex flex-col gap-5 px-4 py-6 md:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-7"
      >
        <div className="flex flex-col gap-2">
          <h2 id="review-heading" ref={headingRef} tabIndex={-1} className="font-serif text-section outline-none">
            Review your workspace
          </h2>
          <p className="text-copy text-body">Everything listed here is exactly what the preview shows.</p>
        </div>
        <div className="rounded-2xl border border-hairline bg-card px-4">
          <SetupList summary={summary} onChange={onChange} />
        </div>
        <p className="text-copy text-stone">
          {summary.itemCount} {summary.itemCount === 1 ? "item" : "items"} in this setup
        </p>
        <SimulationNotice />
      </section>
      <div className="sticky bottom-0 flex shrink-0 flex-col gap-3 border-t border-hairline bg-paper px-4 pt-4 pb-6 md:px-8 lg:static lg:px-7">
        <button
          type="button"
          onClick={onRequest}
          className="h-13 w-full rounded-row bg-ink text-label font-semibold text-paper motion-safe:transition-shadow motion-safe:duration-160 hover:shadow-halo"
        >
          Request setup
        </button>
        <button
          type="button"
          onClick={onChangeSetup}
          className="h-12 w-full rounded-row border-[1.5px] border-ink text-label font-semibold hover:shadow-[inset_0_0_0_2px_var(--color-ink)]"
        >
          Change setup
        </button>
      </div>
    </>
  );
}
