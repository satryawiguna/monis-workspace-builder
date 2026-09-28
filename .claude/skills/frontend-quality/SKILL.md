---
name: frontend-quality
description: Reusable engineering practices for Next.js 16 App Router, React 19, strict TypeScript and Tailwind v4, including accessibility, performance and maintainability. Use when writing, structuring, or reviewing frontend code. Project-specific architecture lives in Notion "03 - Architecture".
---

# Frontend quality practices

These are generic engineering practices. For this project's structure, boundaries, and state model, follow **"03 - Architecture"** and any approved decisions handed to you with the task. Where those decide something, they win over this skill.

## Next.js 16 (App Router)
- Read `node_modules/next/dist/docs/` before using any Next API. The upgrade notes are in `01-app/02-guides/upgrading/version-16.md`.
- Differences from older versions:
  - `params`, `searchParams`, `cookies()`, and `headers()` are async. Await them.
  - `middleware` is now `proxy`.
  - `next lint` is removed. Use ESLint directly (`npm run lint`).
  - Turbopack is the default bundler.
- Prefer the global route helper types (`PageProps<"/">`, `LayoutProps<"/">`) to hand-written prop types.
- Server Components are the default. Put `"use client"` on the smallest interactive leaf.
- Use `next/image` for raster images (with explicit size, or `fill` inside a sized parent) and `next/font` for fonts.
- Replace any scaffold metadata with real metadata.

## React
- Keep components small and focused. Props go in, events come out.
- Give each piece of state one owner. Derive values during render instead of syncing them with `useEffect`.
- Use effects only to synchronize with external systems.
- Once transitions become non-trivial, use `useReducer` with typed discriminated-union actions.
- Use stable keys (IDs), never array indexes for dynamic lists.
- Keep domain logic in pure functions outside components, so it can be tested without rendering.

## TypeScript
- Strict mode stays on. No `any`, no `@ts-ignore`, and no `!` without a comment explaining why it's safe.
- Model fixed domains with literal unions and `as const` data, so invalid states don't compile.
- Define each type once and import it everywhere else.
- Store money as integers in the smallest currency unit, and format it in a single helper.

## Tailwind v4
- Tokens live in `app/globals.css` under `@theme`, following `DESIGN.md`. There's no `tailwind.config`.
- Use token utilities (`bg-surface`). Don't hard-code hex values or arbitrary color values.
- Use arbitrary values only when no scale value fits. If one repeats, promote it to a token.
- Write mobile-first: `sm:`, `md:`, and `lg:` layer on top.
- Build conditional classes with a small local `cn()` helper. Only add `clsx` or `tailwind-merge` if a decision approves it.

## Accessibility (WCAG 2.2 AA)
- Use semantic elements: `button` for actions, and `fieldset`/`legend` with native radio or checkbox inputs for option groups (these can be styled as cards).
- Everything is operable by keyboard, with a visible `focus-visible` indicator.
- Expose selected state to assistive tech, not just visually.
- Announce dynamic values, such as totals, through a polite `aria-live` region.
- Meaningful images get `alt` text. Decorative layers get `alt=""`.
- Respect `prefers-reduced-motion`.

## Performance
- Keep client JavaScript minimal. Don't ship data to the client that it doesn't need.
- Prefer SVG, size raster images correctly, and use `priority` only on the LCP image.
- Prevent layout shift with fixed aspect ratios and reserved space.
- Don't memoize by default. Only do it for a measured problem.

## Maintainability
- Use the domain vocabulary from 02, consistently.
- Comment on *why*, not *what*.
- Leave no dead code, commented-out blocks, or `console.log`.
- Don't add a dependency without an approved decision.
