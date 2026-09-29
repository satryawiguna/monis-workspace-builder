"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { createInitialState, createReducer, type Tab } from "@/lib/configurator";
import {
  includesIllustrative,
  isStartOverVisible,
  previewAltText,
  selectLayers,
  selectSummary,
  tabForCategory,
} from "@/lib/selectors";
import type { Category, Configuration, Product, ProductId } from "@/lib/types";
import { AppHeader } from "./app-header";
import { BuildPanel } from "./build-panel";
import { ConfirmationPanel } from "./confirmation-panel";
import { ResetUndoBanner } from "./reset-undo-banner";
import { ReviewPanel } from "./review-panel";
import { SetupSummaryBar } from "./setup-summary-bar";
import { SimulationNotice } from "./simulation-notice";
import { WorkspacePreview } from "./workspace-preview";

// The client boundary (03 - Architecture §8, AD-004): owns the reducer state
// and derives every view from the one configuration through the selectors.

interface ConfiguratorProps {
  catalog: readonly Product[];
  initialConfiguration: Configuration;
  backdropSrc: string;
}

export function Configurator({ catalog, initialConfiguration, backdropSrc }: ConfiguratorProps) {
  const reducer = useMemo(() => createReducer(catalog, initialConfiguration), [catalog, initialConfiguration]);
  const [state, dispatch] = useReducer(reducer, initialConfiguration, createInitialState);
  // Polite announcement of the last change (04 §15). Presentation state only.
  const [announcement, setAnnouncement] = useState("");

  const { configuration, stage } = state;
  const summary = selectSummary(configuration, catalog);
  const nameOf = (id: ProductId) => catalog.find((p) => p.id === id)?.name ?? id;

  const selectDesk = (id: ProductId) => {
    dispatch({ type: "selectDesk", id });
    setAnnouncement(`${nameOf(id)} selected as your desk.`);
  };
  const selectChair = (id: ProductId) => {
    dispatch({ type: "selectChair", id });
    setAnnouncement(`${nameOf(id)} selected as your chair.`);
  };
  const toggleAccessory = (id: ProductId) => {
    const removing = configuration.accessoryIds.includes(id);
    dispatch({ type: "toggleAccessory", id });
    setAnnouncement(`${nameOf(id)} ${removing ? "removed" : "added"}.`);
  };
  const selectTab = (tab: Tab) => dispatch({ type: "setActiveTab", tab });

  // After a stage change, Start over or Undo, focus moves to the heading of the
  // stage now shown (AD-008, 03 §26.4). Never on first load.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusPending = useRef(false);
  useEffect(() => {
    if (focusPending.current) {
      focusPending.current = false;
      headingRef.current?.focus();
    }
  });

  // Stage changes: the same configuration throughout (SR-6); nothing is sent
  // anywhere (AD-006).
  const review = () => {
    dispatch({ type: "review" });
    focusPending.current = true;
    setAnnouncement("Review your workspace.");
  };
  const edit = () => {
    dispatch({ type: "edit" });
    focusPending.current = true;
    setAnnouncement("Back to building your workspace. Your setup is unchanged.");
  };
  const changeCategory = (category: Category) => {
    edit();
    dispatch({ type: "setActiveTab", tab: tabForCategory(category) });
  };
  const submit = () => {
    dispatch({ type: "submit" });
    focusPending.current = true;
    setAnnouncement("Request simulated. No order was placed and no payment was taken.");
  };

  // Start over and single-level Undo: reducer actions only (03 §26), in
  // memory, with no browser history, URL or storage.
  const startOver = () => {
    dispatch({ type: "startOver" });
    focusPending.current = true;
    setAnnouncement("Setup reset. Your previous setup can be restored with Undo.");
  };
  const undo = () => {
    dispatch({ type: "undo" });
    focusPending.current = true;
    setAnnouncement("Previous setup restored.");
  };

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <AppHeader
        stage={stage}
        showStartOver={isStartOverVisible(state, initialConfiguration)}
        onStartOver={startOver}
      />
      <main className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <div className="flex items-center justify-center md:px-8 md:py-6 lg:min-w-0 lg:flex-1 lg:px-10 lg:py-7">
          <div className="relative w-full max-w-[920px]">
            <WorkspacePreview
              layers={selectLayers(configuration, catalog)}
              backdropSrc={backdropSrc}
              label={previewAltText(configuration, catalog)}
              illustrative={includesIllustrative(configuration, catalog)}
            />
            {state.undo !== null && <ResetUndoBanner onUndo={undo} />}
          </div>
        </div>

        <div className="flex flex-col bg-paper lg:min-h-0 lg:w-[440px] lg:shrink-0 lg:border-l lg:border-rule">
          {stage === "configuring" && (
            <>
              <section
                aria-labelledby="build-heading"
                className="flex flex-col gap-5 px-4 py-6 md:px-8 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:px-7"
              >
                <h2 id="build-heading" ref={headingRef} tabIndex={-1} className="sr-only">
                  Build your workspace
                </h2>
                <BuildPanel
                  catalog={catalog}
                  configuration={configuration}
                  summary={summary}
                  activeTab={state.ui.activeTab}
                  onSelectTab={selectTab}
                  onSelectDesk={selectDesk}
                  onSelectChair={selectChair}
                  onToggleAccessory={toggleAccessory}
                />
                <SimulationNotice />
              </section>
              <div className="sticky bottom-0 shrink-0 border-t border-hairline bg-paper px-4 pt-4 pb-6 md:px-8 lg:static lg:px-7">
                <SetupSummaryBar summary={summary} onReview={review} />
              </div>
            </>
          )}
          {stage === "reviewing" && (
            <ReviewPanel
              summary={summary}
              headingRef={headingRef}
              onChange={changeCategory}
              onRequest={submit}
              onChangeSetup={edit}
            />
          )}
          {stage === "confirmed" && (
            <ConfirmationPanel summary={summary} headingRef={headingRef} onBackToSetup={edit} />
          )}
        </div>
      </main>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
