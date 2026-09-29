# Monis Workspace Builder

A visual workspace configurator for people renting workspace equipment in Bali, built for the Desent Solutions Developer Challenge. You pick a desk, a chair and optional extras, watch the workspace preview update as you go, review the setup and send a **simulated** rental request.

> **Concept demo.** This is not a Monis Rent booking tool. Submitting creates no rental, order or reservation, sends nothing to Monis, and takes no payment. Monis availability, pricing and rental terms are not shown or confirmed. Items marked "Seen on Monis Bali" match a product page on monis.rent for Bali; that is not a claim they are available now. Items marked "Illustrative" are not verified Monis products.

## Features
- **Build:** choose one of two desks and one of two chairs, and add or remove a monitor, a lamp and a plant. Every option shows its content status.
- **Live preview:** a layered 2D illustration of the workspace that updates with every change.
- **Review:** an itemized summary of the setup, with a Change action back to each category.
- **Confirmed:** a simulated request that restates the setup and the demo disclosure, with Keep editing and Start over.
- **Start over with Undo:** reset to the starting setup at any stage, with a single-level Undo.
- Responsive from 375px phones to desktop, keyboard accessible, and it respects reduced-motion preferences.

Everything runs in the browser. There is no backend, database, account, payment or persistence; the product catalog is static data in `lib/catalog.ts`.

## Tech stack
Next.js 16 (App Router, statically prerendered), React 19, TypeScript (strict), Tailwind CSS v4, Vitest. The deployment target is Vercel.

## Getting started
Requires Node.js 20.9 or later and npm.

```bash
npm ci          # install dependencies
npm run dev     # start the dev server at http://localhost:3000
```

## Scripts
| Command | What it does |
|---|---|
| `npm test` | Run the Vitest suite |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type-check |
| `npm run build` | Production build (also validates the catalog) |
| `npm start` | Serve the production build |

## Live demo
Not deployed yet.

## Project structure
- `app/`: the page, layout and global styles (design tokens)
- `components/`: the configurator UI
- `lib/`: catalog data, catalog validation, state reducer and selectors
- `public/workspace/`: the SVG artwork (one backdrop and one asset per product on a shared 1200×800 artboard)
- `tests/`: unit and component tests
- `DESIGN.md`: the visual design system
