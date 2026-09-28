@AGENTS.md

# Monis Workspace Builder

Desent Solutions Developer Challenge. A visual workspace configurator for digital nomads and startups renting workspace equipment in Bali.

## Stack
Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, deployed on Vercel. Package manager: npm.
Read `node_modules/next/dist/docs/` before using any Next.js API (see the block at the top of `AGENTS.md`).

## Sources of truth
| Source | Owns |
|---|---|
| **Notion**, teamspace "Monis's Workspace" | Product requirements, architecture decisions, UX decisions, security decisions, testing strategy, deployment decisions |
| **`DESIGN.md`** | Visual tokens, component visual language, interaction states, animation principles |
| **GitHub** (this repo) | Implementation |

The pages and the agent that reads each one are listed in `AGENTS.md`. Don't copy Notion content into this repo. Link to the page instead.

## Rules
- Don't invent requirements when an approved source exists. If the source is missing, empty, or ambiguous, stop and ask.
- Don't silently override an accepted decision. If a change conflicts with one, raise it first.
- Keep the MVP sized for the 4–8 hour challenge. Avoid unnecessary infrastructure and dependencies.
- Don't modify Notion unless the user explicitly asks.
- Before committing, run:
  - `npm run lint`
  - `npx tsc --noEmit`
  - the relevant tests (see the `testing` skill)
  - `npm run build` when the change affects the build (routes, config, dependencies) and before a feature slice lands
- Never commit broken code. Make small, atomic Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
