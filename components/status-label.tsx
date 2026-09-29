import type { ContentStatus } from "@/lib/types";

// 04 - UI UX §9: both statuses use the same chip with equal visual weight;
// only the wording differs. The label records evidence only; it never claims
// availability.
export const STATUS_LABEL: Record<ContentStatus, string> = {
  verified: "Seen on Monis Bali",
  illustrative: "Illustrative",
};

const CHIP =
  "inline-flex w-fit shrink-0 items-center rounded-full border border-solid border-chip-edge px-2 py-px text-chip font-bold text-body";

export function StatusLabel({ status, className }: { status: ContentStatus; className?: string }) {
  return <span className={className ? `${CHIP} ${className}` : CHIP}>{STATUS_LABEL[status]}</span>;
}
