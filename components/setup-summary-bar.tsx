import type { SummaryView } from "@/lib/selectors";

// Compact Build-stage summary that leads to Review (04 - UI UX §5). No prices
// or totals (PD-2).

interface SetupSummaryBarProps {
  summary: SummaryView;
  onReview: () => void;
}

export function SetupSummaryBar({ summary, onReview }: SetupSummaryBarProps) {
  const extras = summary.accessories.length;
  const extrasText = extras === 0 ? "no extras" : extras === 1 ? "1 extra" : `${extras} extras`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-eyebrow text-stone uppercase">Your setup</span>
        <p className="text-copy">
          {summary.desk.name} · {summary.chair.name} · {extrasText}
        </p>
      </div>
      <button
        type="button"
        onClick={onReview}
        className="h-13 w-full rounded-row bg-ink text-label font-semibold text-paper motion-safe:transition-shadow motion-safe:duration-160 hover:shadow-halo"
      >
        Review workspace
      </button>
    </div>
  );
}
