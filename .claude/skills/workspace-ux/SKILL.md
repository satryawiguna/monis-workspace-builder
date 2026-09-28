---
name: workspace-ux
description: Reusable UX knowledge for visual product configurators (option selection, live preview, running totals, constraints). Use when designing, building, reviewing, or testing configurator UI. Project-specific UX decisions live in Notion "04 - UI UX".
---

# Configurator UX patterns

These are reusable defaults for visual configurators. They don't define this project's UX.
- **"04 - UI UX"** (Notion) is the source of truth for this project's flows and interaction decisions. Where it decides something, it wins over this skill.
- **"02 - Product Requirements"** defines which items, options, prices, and rules exist.
- **`DESIGN.md`** defines how each state looks.

If 04 contradicts a pattern here, follow 04.

## When 04 - UI UX is silent, missing, or ambiguous
Don't silently apply a default as if it were an approved product decision. Instead:
1. Identify the UX gap.
2. Explain the reasonable options.
3. Treat any pattern from this skill as a proposal only.
4. Ask the user or main agent to approve the UX decision.
5. Once it's approved, the main agent records it in 04 - UI UX or 09 - Decision Log before anyone treats it as project context. Subagents don't write to Notion.

## Interaction principles
- **Direct cause and effect.** A change to a control updates the preview and the total in the same render. No "Apply" step for simple choices.
- **One decision at a time.** Group options by category and show where the user is in the sequence.
- **Forgiving.** Every choice can be reversed. Confirm only destructive resets.
- **Show constraints, don't hide them.** Keep incompatible options visible but disabled, with a reason. When a change invalidates an earlier choice, say so. Never drop a selection silently.
- **Never blank.** Start from a valid base state so the preview always renders something meaningful.

## Control patterns
| Choice type | Control |
|---|---|
| One of a few visual options | Radio group rendered as cards |
| Optional add-on | Checkbox or toggle card |
| Quantity | Stepper with min/max limits |
| Many options | Card grid with category tabs or filters |

- Option cards show the price change they cause. The summary shows the total.
- Keep the summary and total reachable at every viewport.

## Visual state behavior
- The preview is a **pure function of the configuration state**. It holds no state of its own.
- Compose the preview from layers in a z-order defined once, in data.
- Swapping an item replaces it in place, with no layout shift. Reserve media space with fixed aspect ratios.

## Responsive composition
- Keep the preview visible, or one tap away, while the user makes choices.
- On small screens, stack the preview above the options and pin the total and primary action to a bottom bar.
- Nothing depends on hover. Breakpoints and sizing come from `DESIGN.md`.

## Anti-patterns
- Wizards that hide the preview
- Modals for simple choices
- Totals that update late
- Options that vanish with no explanation
- UX features that aren't in 02 or 04
