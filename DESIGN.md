# DESIGN.md

## Role of this file
This is the **local, implementation-facing visual design source** for Monis Workspace Builder.

| Topic | Source of truth |
|---|---|
| UX decisions, user flows, interaction requirements | Notion **"04 - UI UX"** (APPROVED) |
| Product scope, catalog, asset contract | Notion **"02 - Product Requirements"**, **"05 - Data & API"** (APPROVED) |
| How those decisions look and behave in code: tokens, type, spacing, color, component visuals, states, motion, responsive visuals, preview framing | **This file** |

This file translates approved UX decisions into visual rules. It contains no product requirements.
If this file and "04 - UI UX" conflict, **don't silently choose one.** Flag the conflict to the user.

> **Status: v1, "Limewash & Teak".** Based on the approved **04 - UI UX** (the UX authority) and the validated Claude Design canvas (the visual reference). This file is the implementation visual system that sits between them. Values are taken from the canvas "Monis Rent — Workspace Configurator" (https://claude.ai/artifact/EBqdHnLSjNG8znvLvSqwDc), mainly the "Design language & component states" and "WorkspacePreview" boards, read 2026-09-29. The canvas is a visual reference only: never copy its HTML into the app. Its product names, notes and drawings are design-time placeholders (04 §22).
> Values marked **DERIVED** are not drawn in the canvas; they are the smallest extension needed to satisfy an approved requirement. Values marked **04 OVERRIDES** differ from the canvas because an approved page wins.

## 1. Visual direction
A calm, sunlit room is the hero; the interface is quiet paper around it. Bali shows up as material and light (limewash, teak, cane, terrace greens, a palm shadow on the wall), never as motifs or tourism imagery (04 §7). Serif only for headings and the brand line; everything interactive is sans.

## 2. Tokens
Define these in `app/globals.css` under `@theme` and use them through Tailwind utilities (`bg-limewash`, `text-ink`, …). Never hard-code hex values in components.

### UI colour
| Token | Value | Role |
|---|---|---|
| `--color-limewash` | `#F3EEE5` | Page ground |
| `--color-paper` | `#FBF8F2` | Panels, bars, header/bottom bars |
| `--color-card` | `#FFFDF9` | Option cards, toggle knob |
| `--color-sand` | `#ECE4D6` | Tab-switcher track |
| `--color-ink` | `#1C211D` | Text, primary button, Undo banner |
| `--color-body` | `#3F443E` | Body copy, chip text |
| `--color-stone` | `#5B6058` | Secondary text, captions |
| `--color-stone-muted` | `#62665E` | Upcoming stepper step text |
| `--color-leaf` | `#2F5D46` | Selected / Added: borders, badges, toggle track on |
| `--color-leaf-ink` | `#22463A` | Text on the "Simulated request" tag |
| `--color-leaf-tint` | `#EEF3EC` | Selected card / toggle background |
| `--color-clay` | `#B4532A` | **Focus ring only** |
| `--color-hairline` | `#E4DCCD` | Card borders (unselected), dividers |
| `--color-rule` | `#DDD4C5` | Header bottom border, desktop panel left border |
| `--color-tab-edge` | `#D9CFBE` | Active tab outline |
| `--color-radio-edge` | `#A39A8A` | Unselected radio circle, upcoming stepper circle |
| `--color-connector` | `#C9BFAE` | Upcoming stepper connector |
| `--color-chip-edge` | `#857A69` | Status chip border |
| `--color-track-off` | `#B9B0A0` | Toggle track off |
| `--color-thumb` | `#EFE7DA` | Thumbnail background |
| `--color-notice` | `#EFE8DC` | SimulationNotice background |
| `--color-notice-edge` | `#A99E8B` | SimulationNotice dashed border |

### Scene palette (artwork only, never UI)
Wall `#E9DECD` · Floor `#D3C5AF` · Teak `#8E5F3B` · Oak `#CFB48C` · Cane `#D8BF92` · Terrace `#8FA88C` · Frond `#3F6247`. The preview frame background is Wall `#E9DECD`.

### Typography
- Fonts via `next/font/google` (no new dependency): **Young Serif** 400 (headings, brand line) and **Hanken Grotesk** 400/500/600/700 (all UI). Both are SIL Open Font License 1.1 (google/fonts `ofl/youngserif`, `ofl/hankengrotesk`, checked 2026-09-29). Fallbacks: `Georgia, serif` and `'Helvetica Neue', sans-serif`.
- Scale:

| Use | Font | Size / weight / line-height |
|---|---|---|
| Page title (desktop) | Young Serif | 34px · 400 · 1.1 · −0.015em |
| Page title (tablet) / stage heading | Young Serif | 30px · 400 · 1.1 |
| Section title ("Choose a desk") | Young Serif | 22px · 400 · −0.01em |
| Item name | Hanken Grotesk | 15–16px · 600 |
| Body | Hanken Grotesk | 14.5–16px · 400 · 1.5–1.55 |
| Button | Hanken Grotesk | 15px · 600 (text link 14px · 600, underline offset 4px) |
| Eyebrow / stepper caption | Hanken Grotesk | 12px · 700 · uppercase · 0.08em |
| Caption, chip | Hanken Grotesk | 11–12.5px · 600–700 |

- Minimum UI text 12px (chips 11px at the smallest).

### Spacing, radius, borders
- Spacing scale: **4, 8, 12, 16, 24, 32, 40** px.
- Radius: **10** thumbnails, tabs · **14** rows, buttons, tab track, toggles · **16** cards · **20** preview frame · **999** pills and chips.
- Card borders are **2px** (hairline unselected, leaf selected). Secondary button border **1.5px** ink. Chip border **1px** (dashed for Illustrative).

### Elevation
- Preview frame: `0 30px 60px -36px rgba(70,45,20,.45), 0 0 0 1px rgba(60,40,20,.08)`.
- Card hover: `0 10px 22px -14px rgba(60,40,20,.55)` plus `translateY(-1px)`.
- Active tab: `0 1px 2px rgba(40,30,20,.14), 0 0 0 1px var(--color-tab-edge)` on `--color-card`.
- Undo banner: `0 16px 32px -18px rgba(0,0,0,.5)`.
- Toggle knob: `0 1px 2px rgba(0,0,0,.2)`.
- Everything else uses borders, not shadows.

## 3. Component visual rules
- **Primary button:** ink background, paper text, height 52px, radius 14. Hover: leaf halo `0 0 0 4px rgba(47,93,70,.22)`.
- **Secondary button:** transparent, 1.5px ink border, height 48px, radius 14. Hover: `inset 0 0 0 2px` ink.
- **Text link button** ("Change", "Start over"): 14px · 600, underlined, min height 44px.
- **Option card (desk, chair):** card background, 2px hairline border, radius 16, thumbnail radius 10 on `--color-thumb`. Selected = leaf border + leaf tint + leaf "✓ Selected" pill (11.5–12px · 700). Unselected shows a 20px empty circle (2px radio-edge border). Never colour alone.
- **Extra toggle:** row, radius 14, min height 64px (desktop), 72px (tablet), 100px tile (mobile). Right side: state word ("Add" in stone / "Added" in leaf, 13px · 700) and a 40×24 switch (track off `--color-track-off`, on leaf; 18px knob). Selected row uses leaf border + tint.
- **Tab switcher (Desk · Chair · Extras):** sand track, radius 14, padding 4, gap 4, three equal columns. Tab radius 10, min height 58px desktop / 48px mobile; active tab = card background + active-tab shadow.
- **Status chips** (04 §9: same chip style, equal weight, on every option, review row and confirmation row):
  - **Illustrative:** pill, `1px dashed --color-chip-edge`, body text, 11px · 700, padding 1px 7–8px.
  - **Seen on Monis Bali:** same geometry and type with a **solid** 1px chip-edge border. **DERIVED**: the canvas draws only the Illustrative chip.
- **Preview overlay chip** "Illustrative preview": top-left of the frame, pill, `rgba(251,248,242,.92)` fill, dashed chip-edge border, 12–12.5px · 600–700.
- **Simulated request tag** (Confirmed only): 1.5px leaf border, leaf-ink text, radius 10–12, 12–14px · 700, uppercase, 0.02–0.03em. Wording per 04 §11; never "Order placed".
- **SimulationNotice:** notice background, 1px dashed notice-edge border, radius 14, body 13.5px.
- **Stage stepper:** informational only: no fills on hover, no pointer. Done step = 22px leaf circle with a check; current = 22px ink circle with its number, label 700; upcoming = 1.5px radio-edge ring, stone-muted text. Connectors 28×2px (ink when passed, connector colour ahead). Tablet and mobile use the compact dot form. Labels **Build · Review · Confirmed** (**04 OVERRIDES**: the canvas says "Request"; 04 §4 names the stage Confirmed).
- **Undo banner** (after Start over): ink background, paper text 13.5–14.5px, radius 12–14, pinned bottom-left over the preview (full width minus 10px on mobile), `role="status"`, no timeout. The Undo button uses a paper background, ink text, 700 and radius 9, at **min height 44px** (**04 OVERRIDES**: the canvas draws 40px; 04 §15 targets about 44px).
- **Header:** 72px desktop (40px side padding, bottom rule), 64px tablet (32px), 52px mobile (16/12px). Start over is a text link on the right.

## 4. Interaction states
| State | Treatment |
|---|---|
| Default | Card background, 2px hairline border |
| Hover (pointer devices only) | Card: soft shadow + 1px lift. Primary: leaf halo. Secondary: inset ink border |
| Focus-visible | `outline: 3px solid var(--color-clay); outline-offset: 3px` on every focusable element. Never removed |
| Selected (desk, chair) | Leaf border + leaf tint + "✓ Selected" pill |
| Added (extra) | Leaf border + tint + "Added" label + switch on |
| Disabled | Not used in the MVP (no disabled options, 04 §8) |

## 5. Motion (04 §17, AD-009: CSS only)
| Motion | Spec |
|---|---|
| Layer enter | Fade + 8px rise, **280ms ease-out**, on the changed layer only |
| Stage change | Panel slides 14px + fades, **320ms**; the preview never moves. Easing is not specified in the canvas; use `ease-out` (**DERIVED**) |
| Hover / focus / toggle knob | **160ms** |
| Reduced motion | All animation and lift removed; state changes are instant (`motion-safe:` / `motion-reduce:`) |

Animate only `opacity` and `transform`. Motion never delays a state change or blocks input.

## 6. Responsive visual rules
Tailwind default breakpoints: **mobile < 768px**, **tablet 768–1023px** (`md`), **desktop ≥ 1024px** (`lg`). Layout per 04 §14. The preview keeps its 3:2 frame on desktop and tablet and scales fluidly with the available width (**DERIVED**: the canvas draws fixed sizes only); mobile crops instead of shrinking.

| Mode | Layout |
|---|---|
| Desktop (`lg` and up, drawn at 1440×900) | Header 72px. Preview column with 28px 40px padding; preview frame 920×613 at 1440 (3:2, radius 20). Control panel fixed **440px**, paper background, 1px rule on the left, scrolling body, footer bar (16px 28px 24px padding, hairline top border) |
| Tablet (`md`, drawn at 834×1112) | Header 64px. Preview on top (770×513 at 834, radius 20). Options below in a 2-column grid; bottom action bar (14px 32px 20px padding) |
| Mobile (below `md`, drawn at 390×844 and 375×667) | Header 52px. **Cropped** preview, full width, height `min(236px, 30svh)` (200px at 375×667). Tab switcher (16px side margin), desk/chair cards 160px wide in a horizontally scrolling row (`scroll-padding-left: 16px`), extras in a 2-column tile grid, fixed bottom bar (12px 16px 18px padding) |

- No horizontal page scroll at any size. Touch targets at least 44×44px. Nothing depends on hover.
- Wider than 1440px: centre the layout at the drawn 1440 width (**DERIVED**; the canvas draws no wider desktop).

## 7. Workspace preview framing (AD-001, AD-002, 05 §7)
- One shared artboard: **1200×800**, `viewBox="0 0 1200 800"`, origin top-left, transparent product layers, straight-on elevation, zero offsets.
- Scene geometry: wall y 0–644, floor from y 644 (skirting 638–646). **Desk feet on y 668; chair casters on y 760.** Desk top at about y 376–392. One light source: the window, upper left (a light patch falls on the floor below it).
- The chair is always pulled out to the right of the desk so it never hides the screen.
- **Safe area / mobile crop:** the furniture zone is scene **y 170–780**, centred on **x 680**. The mobile frame scales the whole layer stack by `frameHeight / 610` and centres x 680; layers are never moved or cropped individually. All furniture must stay inside this zone.
- Layer order comes from `asset.layer` in the catalog (05 §14; provisional values). The canvas draws the lamp below the monitor; the two do not overlap, so the 05 order is kept.
- The preview is a stack of static image layers in the DOM: no canvas element, 3D or drag and drop (AD-001).

## 8. Accessibility (visual)
- Contrast meets WCAG AA: 4.5:1 for body text, 3:1 for large text and UI boundaries.
- Focus indicators are never suppressed.
- State is never communicated by colour alone.
- Text stays readable at 200% zoom without horizontal scrolling.
- **Semantics follow AD-008, not the canvas markup:** the canvas uses `role="radio"`, `role="tab"` and `aria-pressed` on buttons, but the app uses native radio inputs for desk and chair, native checkboxes for extras, and native buttons for the tab switcher. Only the visuals above come from the canvas.

## 9. Not yet decided
- Dark mode: none is designed, so the app ships the light theme only.
- Monis logo or brand assets: none are invented (04 §7).
