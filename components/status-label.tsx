import type { ContentStatus } from "@/lib/types";

// 04 - UI UX §9: both statuses use the same chip with equal weight. The label
// records evidence only; it never claims availability.
export const STATUS_LABEL: Record<ContentStatus, string> = {
  verified: "Seen on Monis Bali",
  illustrative: "Illustrative",
};

export function StatusLabel({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full border border-chip-edge px-2 py-px text-chip font-bold text-body ${
        status === "illustrative" ? "border-dashed" : "border-solid"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
