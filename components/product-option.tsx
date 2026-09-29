import Image from "next/image";
import { thumbnailFrame } from "@/lib/thumbnail";
import type { Product } from "@/lib/types";
import { STATUS_LABEL, StatusLabel } from "./status-label";

// One selectable product (04 - UI UX §8, DESIGN.md §3). The control is a
// native radio (desk, chair) or checkbox (extras) (AD-008); the card around
// it is styling. Its accessible name is the product name plus its status.

interface ProductOptionProps {
  product: Product;
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
}

const CARD =
  "relative flex cursor-pointer items-center rounded-2xl border-2 border-hairline bg-card text-ink has-[:checked]:border-leaf has-[:checked]:bg-leaf-tint has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-clay motion-safe:transition-[box-shadow,translate] motion-safe:duration-160 hover:shadow-card-hover motion-safe:hover:-translate-y-px";

function Thumb({ product, width, height }: { product: Product; width: number; height: number }) {
  const frame = thumbnailFrame(product.category, width, height);
  return (
    <span
      aria-hidden="true"
      className="relative shrink-0 overflow-hidden rounded-thumb bg-thumb"
      style={{ width, height }}
    >
      <Image
        src={product.asset.src}
        alt=""
        width={Math.round(frame.width)}
        height={Math.round(frame.height)}
        className="absolute max-w-none"
        style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
      />
    </span>
  );
}

export function ProductOption({ product, type, name, checked, onChange }: ProductOptionProps) {
  const descriptionId = `${product.id}-description`;
  const isRadio = type === "radio";

  return (
    <label className={`${CARD} ${isRadio ? "gap-3 p-2.5 pr-3" : "min-h-16 gap-3 rounded-row p-1.5 pr-3.5"}`}>
      <input
        type={type}
        name={name}
        value={product.id}
        checked={checked}
        onChange={onChange}
        aria-label={`${product.name}, ${STATUS_LABEL[product.status]}`}
        aria-describedby={product.description ? descriptionId : undefined}
        className="sr-only"
      />
      {isRadio ? <Thumb product={product} width={110} height={70} /> : <Thumb product={product} width={56} height={56} />}
      <span className="flex min-w-0 grow flex-col gap-1" aria-hidden="true">
        <span className="text-label font-semibold">{product.name}</span>
        {product.description && (
          <span id={descriptionId} className="text-[12.5px] leading-snug text-stone">
            {product.description}
          </span>
        )}
        <StatusLabel status={product.status} />
      </span>
      {isRadio ? (
        checked ? (
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center gap-1 rounded-full bg-leaf py-0.5 pr-2 pl-1.5 text-xs font-bold text-paper"
          >
            <CheckIcon />
            Selected
          </span>
        ) : (
          <span aria-hidden="true" className="size-5 shrink-0 rounded-full border-2 border-radio-edge" />
        )
      ) : (
        <span aria-hidden="true" className="flex shrink-0 items-center gap-3">
          <span className={`text-[13px] font-bold ${checked ? "text-leaf" : "text-stone"}`}>
            {checked ? "Added" : "Add"}
          </span>
          <span className={`relative h-6 w-10 rounded-full ${checked ? "bg-leaf" : "bg-track-off"}`}>
            <span
              className={`absolute top-[3px] left-[3px] size-[18px] rounded-full bg-card shadow-knob motion-safe:transition-[translate] motion-safe:duration-160 ${
                checked ? "translate-x-4" : ""
              }`}
            />
          </span>
        </span>
      )}
    </label>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5 L10 17 L19 7" />
    </svg>
  );
}
