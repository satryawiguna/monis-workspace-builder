// Shown after Start over while the single Undo snapshot exists (03 -
// Architecture §26, 04 - UI UX §13, DESIGN.md §3). No timer: it stays until
// the next configuration or stage change, or until Undo. Announcements go
// through the configurator's one live region, so this isn't a second one.
export function ResetUndoBanner({ onUndo }: { onUndo: () => void }) {
  return (
    <div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center gap-4 rounded-row bg-ink py-1.5 pr-1.5 pl-4 text-[13.5px] text-paper shadow-banner md:right-auto md:bottom-5 md:left-5 md:text-copy">
      <p className="grow">Started over. Your previous setup can be restored.</p>
      <button
        type="button"
        onClick={onUndo}
        aria-label="Undo start over and restore your previous setup"
        className="min-h-11 shrink-0 rounded-[9px] bg-paper px-3.5 font-bold text-ink"
      >
        Undo
      </button>
    </div>
  );
}
