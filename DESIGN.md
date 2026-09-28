# DESIGN.md

## Role of this file
This is the **local, implementation-facing visual design source** for Monis Workspace Builder.

| Topic | Source of truth |
|---|---|
| UX decisions, user flows, interaction requirements | Notion **"04 - UI UX"** |
| Product scope (items, options, pricing, rules) | Notion **"02 - Product Requirements"** |
| How those decisions look and behave in code: tokens, type, spacing, color, component visuals, states, motion, responsive visuals, visual accessibility | **This file** |

This file translates approved UX decisions into visual rules. It contains no product requirements.
If this file and "04 - UI UX" conflict, **don't silently choose one.** Flag the conflict to the user.

> **Status: v0 proposal.** "04 - UI UX" is still empty, so the rules below are a starting direction. They aren't approved decisions yet. Revise them once 04 is populated, and note each change in its commit.

## 1. Visual direction
Tropical-modern, natural, and light: warm neutrals, natural wood tones, and one lush accent. The overall feel is calm and tactile, with restrained color and nothing decorative that lacks a purpose.

## 2. Tokens
Define these in `app/globals.css` under `@theme` and use them through Tailwind utilities (`bg-surface`, `text-ink`, …). Never hard-code hex values in components.

### Color
| Token | Role | Value |
|---|---|---|
| `--color-canvas` | Page background | `#FAF7F2` |
| `--color-surface` | Cards, panels | `#FFFFFF` |
| `--color-ink` | Primary text | `#1F2421` |
| `--color-ink-muted` | Secondary text | `#5E6660` |
| `--color-line` | Borders, dividers | `#E7E1D7` |
| `--color-accent` | Primary action, selected state | `#2F6B4F` |
| `--color-accent-soft` | Selected background tint | `#E4EFE8` |
| `--color-sand` | Secondary highlight | `#D9B98C` |
| `--color-danger` | Errors, destructive actions | `#B4412F` |

### Typography
- Use Geist Sans for the UI (already loaded in `app/layout.tsx`). Use Geist Mono only for tabular numbers, such as prices.
- Scale: `text-sm` for meta, `text-base` for body, `text-lg` for item and option titles, `text-2xl`/`text-3xl` for headings.
- Headings use `font-semibold` with tight tracking. Body uses `leading-relaxed`.

### Spacing & shape
- Use an 8px spacing rhythm (Tailwind `2`, `4`, `6`, `8`, …).
- Radius: `rounded-xl` for cards, `rounded-full` for pills and toggles, `rounded-2xl` for large media frames.
- Elevation: one soft shadow, only for floating elements (sticky bars, popovers). Everything else uses borders.

## 3. Component visual rules
- **Selectable card:** `surface` background, `line` border, `rounded-xl`, and an optional thumbnail at a fixed aspect ratio.
- **Primary button:** `accent` background with white text. Secondary buttons use a `line`-colored outline.
- **Price text:** tabular numerals, always shown with currency. The format itself comes from 02 or 04.
- **Media/preview frame:** fixed aspect ratio, `rounded-2xl`. Layered visuals share one perspective, scale, and light direction.

## 4. Interaction states
| State | Treatment |
|---|---|
| Default | `surface` background, `line` border |
| Hover (pointer devices only) | Border darkens slightly |
| Focus-visible | 2px `accent` ring with offset. Always visible, never removed |
| Selected | `accent` border, `accent-soft` background, and a check icon. Never color alone |
| Disabled | 50% opacity, `cursor-not-allowed`, with a visible reason text |
| Loading | A skeleton matching the final shape. No spinners for in-place swaps |
| Error | `danger` text or border plus an icon, with a message next to the field |

## 5. Animation principles
- State changes: 150–250ms, `ease-out`.
- Elements entering or leaving: 200–300ms fade plus slight scale. Swapping one element for another crossfades in place with no layout shift.
- Animate only `opacity` and `transform`.
- Honor `prefers-reduced-motion` (`motion-safe:` / `motion-reduce:`).

## 6. Responsive visual rules
Breakpoints follow Tailwind defaults: mobile under 768px, tablet 768–1023px, desktop 1024px and up.
- Max content width is 1280px. Gutters are 16px on mobile and 24–32px on larger screens.
- Media scales proportionally inside its aspect-ratio container and is never cropped.
- Touch targets are at least 44×44px. Nothing depends on hover.
- Where each region goes at each breakpoint is set by "04 - UI UX". This file only defines how the regions look.

## 7. Accessibility (visual)
- Contrast meets WCAG AA: 4.5:1 for body text, 3:1 for large text and UI boundaries.
- Focus indicators are never suppressed.
- State is never communicated by color alone.
- Text stays readable at 200% zoom without horizontal scrolling.

## 8. Not yet decided
Dark mode, illustration style beyond item assets, and brand assets (logo, brand colors). These wait on "04 - UI UX" or a Decision Log entry.
