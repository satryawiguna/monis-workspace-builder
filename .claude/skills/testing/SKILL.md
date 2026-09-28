---
name: testing
description: Reusable testing procedures for web UI work, covering quality checks, acceptance-criteria validation, functional, regression, responsive and accessibility testing, and defect reporting. Use when validating a task, a feature slice, or a release candidate. The project-specific strategy lives in Notion "07 - Test Strategy".
---

# Testing procedures

These are reusable procedures. Once **"07 - Test Strategy"** (Notion) has content, it becomes this project's source of truth for scope, tools, flows, and coverage, and it overrides this skill wherever the two differ. If 07 is empty, use these procedures and say so in your report.

## 1. Quality checks
Run these on every task:
```
npm run lint
npx tsc --noEmit
npm run build     # per feature slice, and whenever routes, config, or dependencies change
```
No test runner is installed. Don't add one yourself. Adopting one (for example, Vitest for pure domain logic) needs an approved decision.

## 2. Acceptance criteria
- Take the criteria word for word from the task or from 02. A valid criterion is observable and binary.
- If a criterion can't be tested as written, mark it **ambiguous**. Don't interpret it.
- For each criterion, record the steps, the viewport, and the observed result. Add a screenshot when a browser tool is available.

## 3. Functional testing
- Start the app with `npm run dev` and use a browser, driving it through browser automation if available.
- Walk each flow the task touches from start to finish, using the flows defined in 07 or the traced requirements in 02.
- Probe the edge cases: rapid repeated input, toggling on and off, minimum and maximum values, every option selected, long text, empty states, reload, and slow-loading media.
- Check the browser console. It should have no errors or warnings.

## 4. Regression testing
- Keep a regression set: the criteria already accepted in the areas the change touches.
- Re-run that set for every feature slice, and run the full set before deployment.

## 5. Responsive testing
Test at 375×812, 768×1024, 1024×768, and 1440×900. At each size, check that:
- There's no horizontal scroll and no clipped or overlapping content.
- Primary actions and key information stay reachable.
- Touch targets are at least 44px.
- The layout matches the responsive rules in `DESIGN.md` and any layout criteria in the task.

## 6. Accessibility checks
- The whole flow can be completed with the keyboard alone, with focus visible and in a logical order.
- Controls expose their names and states, and dynamic values are announced.
- With reduced motion enabled, motion is minimal.

## 7. Report format
```
Gates: lint ✅/❌ · types ✅/❌ · build ✅/❌/n/a
Strategy source: 07 - Test Strategy | testing skill (07 empty)

| Criterion | Result (pass/fail/ambiguous) | Evidence |
|---|---|---|

Defects:
- [blocker|major|minor] <title>
  Steps: 1… 2… 3…
  Expected: …  Actual: …
  Viewport/browser: …  Trace: <criterion / page section>
```
