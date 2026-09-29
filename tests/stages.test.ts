import { readdirSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ConfirmationPanel } from "../components/confirmation-panel";
import { ReviewPanel } from "../components/review-panel";
import { StageStepper, stepStates } from "../components/stage-stepper";
import { catalog, initialConfiguration } from "../lib/catalog";
import { createInitialState, createReducer, type Action, type ConfiguratorState } from "../lib/configurator";
import { selectSummary } from "../lib/selectors";

// T11: Build → Review → Confirmed, the stepper, and the review and
// confirmation content (04 - UI UX §10–12; FR-006, FR-007, FR-011).

const reducer = createReducer(catalog, initialConfiguration);
const run = (state: ConfiguratorState, ...actions: Action[]) => actions.reduce(reducer, state);
const noop = () => {};
// Visible text of server-rendered HTML, without tags or React text separators.
const textOf = (html: string) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// Mechanical desk + cane-back chair + all three extras (two illustrative items).
const built = run(
  createInitialState(initialConfiguration),
  { type: "selectDesk", id: "desk-mechanical-adjustable" },
  { type: "selectChair", id: "chair-cane-back" },
  { type: "toggleAccessory", id: "monitor-24-full-hd-1c" },
  { type: "toggleAccessory", id: "lamp-smart-led-1s" },
  { type: "toggleAccessory", id: "plant-floor" },
);

describe("the Build → Review → Confirmed journey", () => {
  it("keeps the configuration through review, change and a second review", () => {
    const reviewing = run(built, { type: "review" });
    expect(reviewing.stage).toBe("reviewing");
    expect(reviewing.configuration).toEqual(built.configuration);

    const back = run(reviewing, { type: "edit" });
    expect(back.stage).toBe("configuring");
    expect(back.configuration).toEqual(built.configuration);

    const again = run(back, { type: "review" });
    expect(again.configuration).toEqual(built.configuration);
  });

  it("confirms exactly the configuration that was reviewed", () => {
    const reviewing = run(built, { type: "review" });
    const confirmed = run(reviewing, { type: "submit" });
    expect(confirmed.stage).toBe("confirmed");
    expect(selectSummary(confirmed.configuration, catalog)).toEqual(selectSummary(reviewing.configuration, catalog));
  });

  it("returns from Confirmed to Build with the configuration kept", () => {
    const back = run(built, { type: "review" }, { type: "submit" }, { type: "edit" });
    expect(back.stage).toBe("configuring");
    expect(back.configuration).toEqual(built.configuration);
  });
});

describe("StageStepper", () => {
  it("marks earlier steps done, one current and later ones upcoming", () => {
    expect(stepStates("configuring")).toEqual(["current", "upcoming", "upcoming"]);
    expect(stepStates("reviewing")).toEqual(["done", "current", "upcoming"]);
    expect(stepStates("confirmed")).toEqual(["done", "done", "current"]);
  });

  it("states the current step in text", () => {
    expect(textOf(renderToStaticMarkup(createElement(StageStepper, { stage: "reviewing" })))).toContain("Step 2 of 3, Review");
  });

  it("is informational only: no buttons, links or click handlers", () => {
    const html = renderToStaticMarkup(createElement(StageStepper, { stage: "reviewing" }));
    expect(html).not.toMatch(/<button|<a |href=|onclick|tabindex|role="tab/i);
  });
});

describe("ReviewPanel", () => {
  const html = renderToStaticMarkup(
    createElement(ReviewPanel, {
      summary: selectSummary(built.configuration, catalog),
      headingRef: null,
      onChange: noop,
      onRequest: noop,
      onChangeSetup: noop,
    }),
  );

  it("lists every configured item with its status and the item count", () => {
    for (const name of ["Mechanical Adjustable Desk", "Cane-back Chair", "Floor Plant", "Smart LED Desk Lamp 1S"]) {
      expect(html).toContain(name);
    }
    expect(html).toContain("Illustrative");
    expect(html).toContain("Seen on Monis Bali");
    expect(textOf(html)).toContain("5 items in this setup");
  });

  it("offers Request setup and Change setup, and no prices", () => {
    expect(html).toContain(">Request setup<");
    expect(html).toContain(">Change setup<");
    expect(html).not.toMatch(/\$|IDR|USD|price/i);
  });
});

describe("ConfirmationPanel", () => {
  const html = renderToStaticMarkup(
    createElement(ConfirmationPanel, {
      summary: selectSummary(built.configuration, catalog),
      headingRef: null,
      onKeepEditing: noop,
      onStartOver: noop,
    }),
  );

  it("uses the approved confirmation wording and disclosure", () => {
    expect(html).toMatch(/<h2 id="confirmed-heading"[^>]*>Request simulated\. <span[^>]*>Nice setup\.<\/span><\/h2>/);
    expect(html).toContain("Simulated request · demo only");
    expect(html).toContain("This is a demo: no rental was created, and nothing was booked or sent to Monis.");
    expect(textOf(html)).toContain("No order was placed with Monis and no payment was taken.");
    expect(textOf(html)).toContain("Monis availability, pricing and rental terms are not confirmed.");
  });

  it("leads the phone layout with a decorative success mark and the Step 3 caption", () => {
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(html).toContain(">Step 3 of 3 · Simulation<");
    // The mark and caption come before the heading, which carries the state in words.
    expect(html.indexOf("Step 3 of 3 · Simulation")).toBeLessThan(html.indexOf('id="confirmed-heading"'));
  });

  it("restates the submitted setup with statuses", () => {
    expect(html).toContain("Cane-back Chair");
    expect(html).toContain("Illustrative");
  });

  it("never claims an order, payment or availability (04 §11)", () => {
    expect(html).not.toMatch(/order placed|payment complete|reserved|in stock|is available|now available/i);
  });

  it("offers Keep editing this workspace as the primary action, then Start over", () => {
    const keep = html.indexOf(">Keep editing this workspace<");
    const startOver = html.indexOf(">Start over<");
    expect(keep).toBeGreaterThan(-1);
    expect(startOver).toBeGreaterThan(keep);
    // Primary is the filled ink button; Start over is the quieter outlined one.
    expect(html).toMatch(/class="[^"]*bg-ink[^"]*">Keep editing this workspace</);
    expect(html).toMatch(/class="[^"]*border-ink[^"]*">Start over</);
    expect(html).not.toMatch(/class="[^"]*bg-ink[^"]*">Start over</);
  });
});

describe("no network or storage access (AD-006, PD-6)", () => {
  const sources = ["components", "lib"].flatMap((dir) =>
    readdirSync(new URL(`../${dir}`, import.meta.url)).map((file) =>
      readFileSync(new URL(`../${dir}/${file}`, import.meta.url), "utf8"),
    ),
  );

  it("has no fetch, XHR, beacon, storage or cookie calls in app code", () => {
    for (const source of sources) {
      expect(source).not.toMatch(/\bfetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/);
    }
  });
});
