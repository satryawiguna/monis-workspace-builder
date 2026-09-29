"use client";

import Image from "next/image";
import { useState } from "react";
import { offsetTransform, trackEnteredLayers, type EnteredLayers } from "@/lib/preview";
import type { PreviewLayer } from "@/lib/selectors";
import type { ProductId } from "@/lib/types";
import { StatusLabel } from "./status-label";

// Layered 2D workspace preview (AD-001, 04 - UI UX §6, DESIGN.md §6–7). It only
// displays: layers come from selectLayers() and the label from
// previewAltText(), both computed from the one configuration. The only local
// state is presentation state (04 §20): which images failed to load and which
// layers should play the entrance animation.

interface WorkspacePreviewProps {
  layers: readonly PreviewLayer[];
  backdropSrc: string;
  label: string;
  // From includesIllustrative(): shows the Illustrative indicator (04 §9).
  illustrative: boolean;
}

// Desktop and tablet show the whole 3:2 artboard. Below md the frame is
// min(236px, 30svh) tall and the full layer stack is scaled by frame height /
// 610 and centred on the furniture zone (scene x 680, y 170–780), so phones
// crop the scene instead of shrinking it (DESIGN.md §6–7).
const FRAME =
  "relative w-full overflow-hidden bg-scene-wall [--pv-h:min(236px,30svh)] h-(--pv-h) md:h-auto md:aspect-[3/2] md:rounded-preview md:shadow-preview";
const STACK =
  "absolute top-[calc(var(--pv-h)*-170/610)] left-[calc(50%_-_var(--pv-h)*680/610)] h-[calc(var(--pv-h)*800/610)] w-[calc(var(--pv-h)*1200/610)] md:inset-0 md:h-full md:w-full";
const SIZES = "(min-width: 768px) 100vw, 250vw";

export function WorkspacePreview({ layers, backdropSrc, label, illustrative }: WorkspacePreviewProps) {
  const ids = layers.map((layer) => layer.productId);

  const [tracked, setTracked] = useState<EnteredLayers>(() => ({ ids, entered: new Set() }));
  const current = trackEnteredLayers(tracked, ids);
  if (current !== tracked) setTracked(current);

  const [failed, setFailed] = useState<ReadonlySet<ProductId>>(() => new Set());
  const [backdropFailed, setBackdropFailed] = useState(false);

  // A missing image hides only its own layer; the item stays selected and
  // listed elsewhere (02 §12, 03 §16).
  const hideLayer = (id: ProductId) =>
    setFailed((previous) => (previous.has(id) ? previous : new Set(previous).add(id)));

  return (
    <div className="relative">
      <div
        role="img"
        aria-label={illustrative ? `${label} Includes illustrative items.` : label}
        className={FRAME}
      >
        <div className={STACK}>
        {!backdropFailed && (
          <Image src={backdropSrc} alt="" fill preload sizes={SIZES} onError={() => setBackdropFailed(true)} />
        )}
        {layers
          .filter((layer) => !failed.has(layer.productId))
          .map((layer) => (
            <Image
              key={layer.productId}
              src={layer.src}
              alt=""
              fill
              sizes={SIZES}
              style={{ zIndex: layer.layer, transform: offsetTransform(layer.offset) }}
              className={current.entered.has(layer.productId) ? "motion-safe:animate-layer-enter" : undefined}
              onError={() => hideLayer(layer.productId)}
            />
          ))}
        </div>
      </div>
      {/* Overlay, not artwork (AD-002); screen readers get the same fact from
          the preview label above. */}
      {illustrative && (
        <span aria-hidden="true" className="absolute top-2.5 left-2.5 md:top-4 md:left-4">
          <StatusLabel status="illustrative" className="bg-paper/92" />
        </span>
      )}
    </div>
  );
}
