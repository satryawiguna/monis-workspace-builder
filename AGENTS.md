<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI-assisted engineering workflow

The **main agent orchestrates** the work: it talks to the user, runs the stages below, and hands isolated tasks to the five subagents in `.claude/agents/`. Reusable know-how lives in `.claude/skills/`. The source-of-truth rules are in `CLAUDE.md`.

## Workflow

| # | Stage | Owner | Notion page | Output |
|---|---|---|---|---|
| 1 | Discovery | Main agent with user | 01 - Discovery | Problem, users, constraints |
| 2 | Product Requirements | Main agent with user | 02 - Product Requirements | Approved requirements and acceptance criteria |
| 3 | Architecture | `architect` | 03 - Architecture, 05 - Data & API, 06 - Security, 09 - Decision Log | Decision records for the user to approve |
| 4 | UI/UX | Main agent with user | 04 - UI UX, plus `DESIGN.md` | Approved UX decisions, translated into visual rules |
| 5 | Planning | `planner` | 01 - Discovery, 02 - Product Requirements | Ordered, traceable task list |
| 6 | Implementation | `implementer` | 02, 03, 04, 05 | One task per commit |
| 7 | Review | `reviewer` | 02, 03, 04, 06 | Findings and a verdict |
| 8 | Testing | `tester` | 07 - Test Strategy, plus the relevant parts of 02 | Pass/fail per criterion, defects |
| 9 | Deployment | Main agent | 08 - Deployment | Vercel deployment |
| 10 | Final Submission | Main agent | 10 - Final Submission | Submission package |

Stages 6–8 repeat for each feature slice. Deployment and Final Submission belong to the main agent, not a subagent.

## Agents

| Agent | Responsibility | Never |
|---|---|---|
| `architect` | Architecture, boundaries, state model, technical decisions | Writes application code |
| `planner` | Turns approved requirements into implementation tasks, with dependencies and implementation order | Adds scope or writes code |
| `implementer` | Implements approved tasks following the requirements, architecture, and design, with no unrelated changes | Starts a task that has no trace |
| `reviewer` | Reviews the implementation and identifies defects and deviations | Modifies application code |
| `tester` | Validates acceptance criteria through functional, regression, and responsive testing; reports defects | Fixes defects |

Only the main agent writes to Notion, and only when the user explicitly asks. Subagents read Notion and return their results to the main agent.

## Notion context
The teamspace is **"Monis's Workspace"** (`3e9ae277-28f9-81c7-8123-0042fea2054f`). Fetch pages by ID.

| Page | ID | Read by |
|---|---|---|
| 00 - Project Overview | `3e9ae277-28f9-804d-8193-c1e4fa882ed4` | Main agent |
| 01 - Discovery | `3e9ae277-28f9-8032-a6ad-e186a44c30f8` | Planner |
| 02 - Product Requirements | `3e9ae277-28f9-80e2-9987-d6c517629f7e` | Planner, Implementer, Reviewer, Tester (relevant requirements only) |
| 03 - Architecture | `3e9ae277-28f9-8024-a8d3-dc7634a21d5e` | Architect, Implementer, Reviewer |
| 04 - UI UX | `3e9ae277-28f9-8020-b5d4-e125cf1ef729` | Implementer, Reviewer |
| 05 - Data & API | `3e9ae277-28f9-8021-be39-cbe94f520b09` | Architect, Implementer |
| 06 - Security | `3e9ae277-28f9-8070-94a3-e527ea543d25` | Architect, Reviewer |
| 07 - Test Strategy | `3e9ae277-28f9-80e6-879f-ddad3a7328af` | Tester |
| 08 - Deployment | `3e9ae277-28f9-80af-9f63-eaa5c7c4b3dc` | Main agent |
| 09 - Decision Log | `3e9ae277-28f9-8086-9588-c85aa17c9b7e` | Architect |
| 10 - Final Submission | `3e9ae277-28f9-806f-9d76-dc748b19b06d` | Main agent |

**Read only what the current task needs.** Start with the sections the task's trace points to, and open another mapped page only when the task depends on it. Don't load every page by default.

## Task contract
Every task handed to a subagent includes:
- **ID and title**
- **Trace:** the Notion page and section, or the Decision Log entry, that it implements
- **Acceptance criteria:** testable statements
- **Scope:** the files and areas expected to change
- **Dependencies:** task IDs that must land first

A task with no trace isn't implemented. It goes back to the user.

## Orchestration rules
- The main agent handles trivial single-file changes itself. Delegate only when isolation or a fresh review actually helps.
- Run review and testing per feature slice, not per line. Aim for one review round and one fix round.
- Findings go back to the `implementer`. The `reviewer` and `tester` never patch code.
- A subagent that hits a missing, empty, or conflicting source stops and reports it. The main agent takes it to the user.

## Definition of done
- The `tester` has confirmed the acceptance criteria.
- The `reviewer` has no blocking findings.
- The pre-commit checks in `CLAUDE.md` pass.
- The change is committed as one atomic commit that references its trace.
