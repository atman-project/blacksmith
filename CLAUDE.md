# Blacksmith — Project Context for Claude Code

## Overview

Blacksmith is a **doc-to-app framework** — part of the [Atman Project](https://github.com/atman-project).

- **Atman** = Universal peer-to-peer sync engine (infrastructure/protocol layer)
- **Blacksmith** = Doc-to-app framework (user-facing system for control and interaction)

Tagline: *"Your memories you will never lose. Software shifts. Your data shouldn't."*

---

## Core Philosophy — READ THIS FIRST

**Blacksmith is for END USERS, not developers.**

Users create and maintain mini apps through **natural language chat** — they never touch source code. The experience should be exactly like talking to an AI assistant that builds and modifies an app for you in real time.

- Users don't want to "build and publish apps." They don't care about software engineering.
- They want to shape their data into something useful — a living document that behaves like an app.
- The boundary between "document" and "app" is intentionally fluid.
- If a user's mini app becomes powerful enough, they can **publish** it for others to use.

**If the project ever drifts toward a developer-centric direction, push back.**

### Philosophical Foundation

- **Atman** = Self (Ownership) — users fully own their data
- **Blacksmith** = Will (Creation and Control) — users shape and direct their data
- Ownership alone is not enough. Users must also have **agency**.

### Values

1. **Local-first** — data stays on user-controlled devices; software can shift, data shouldn't
2. **Malleable software** — simple tools, infinite composability; from docs to apps
3. **Version control for everything** — history across all software, not just code
4. **Data ownership** — own and prove your data

### Related Work

- [Ink & Switch](https://www.inkandswitch.com/) — local-first, CRDTs, programmable ink
- The project shares common ground with their research direction

---

## Current State — Prototype

A working single-file React prototype (`prototype/blacksmith.jsx`) has been built and validated. It demonstrates the core interaction model.

### UI Layout

```
┌──────────────────────────────────────────────────────────┐
│ [Anvil] Blacksmith FORGE    REVERT COMMIT HISTORY│PUBLISH│  ← Top bar
├────┬─────────────┬───────────────────────────────────────┤
│    │ FORGE CHAT  │ DOCUMENT                    [👁][</>] │
│ A  │             │                                       │
│ P  │ Chat with   │ Editable note view /                  │
│ P  │ AI to shape │ Rendered preview                       │
│ S  │ documents   │                                       │
│    │             │                                       │
│    │ [input...]  │                                       │
├────┴─────────────┴───────────────────────────────────────┤
```

- **Left sidebar** (collapsible): App/doc list with create, delete, switch. Tooltips on hover when collapsed.
- **Chat panel** (380px): Conversational interface to shape documents via natural language.
- **Document view** (flex): Toggle between rendered preview (default) and raw markdown editor.
- **Top bar**: Branding + version control buttons (Revert, Commit, History, Publish).
- **History panel** (slide-out): Git-style commit timeline with click-to-view diffs.

### Key Features Implemented

1. **Multi-document support** — each app has independent doc, chat history, commit history
2. **Version control** — commit with messages, revert to last commit, restore any commit
3. **Diff view** — LCS-based line diff with hunk context (3 lines), inline character-level highlighting for modified lines (green additions, red deletions)
4. **Preview/Markdown toggle** — icon-only buttons, labels expand on hover
5. **Simulated AI** — pattern-matched responses (add section, rename, clear, etc.)
6. **Publish button** — placeholder, shows "coming soon" toast

### Design Language

- **Theme**: Dark forge aesthetic — charcoal background, amber (#e2a04a) accent
- **Fonts**: Instrument Serif (display), DM Sans (body), JetBrains Mono (UI labels/code)
- **Style**: Monospace uppercase labels for UI chrome, serif for branding, clean sans for content
- **Colors**:
  - Surface: #111113, Elevated: #1a1a1f, Sidebar: #0d0d0f
  - Text: #e8e6e3 (primary), #9d9b97 (secondary), #5c5a57 (muted)
  - Accent: #e2a04a (amber), with dim/glow variants
  - Diff: #4ae28a (green/add), #e25a5a (red/delete)

---

## Architecture Decisions

### State Model

Each app (document) holds:

```
{
  id: string,
  doc: string,                    // current markdown content
  lastCommittedDoc: string,       // baseline for dirty tracking
  messages: Message[],            // chat history [{role, content}]
  commits: Commit[],              // [{message, doc, time, hash}]
}
```

Global state:
- `apps: App[]` — list of all apps
- `activeId: string` — currently selected app
- `sidebarOpen: boolean`
- `viewMode: "markdown" | "rendered"` (default: "rendered")

### Diff Engine

- **Line-level**: LCS (Longest Common Subsequence) based diff
- **Hunk grouping**: 3 lines of context around changes, separated by `···`
- **Inline highlighting**: Adjacent del/add lines are paired, then character-level LCS produces highlighted segments within modified lines
- **Performance guard**: Character-level diff falls back to full-line highlight if m×n > 500,000

### Markdown Renderer

Simple regex-based renderer supporting: h1-h3, bold, italic, blockquotes, unordered lists, inline code, checkboxes, horizontal rules. No external dependency.

---

## Next Steps — Persistence

### What to Persist

All app state listed above. Specifically:

1. App list with metadata (id, creation order)
2. Document content per app
3. Commit history per app (full doc snapshots)
4. Chat messages per app
5. Last committed doc per app (dirty tracking baseline)
6. UI preferences (active app, sidebar state, view mode)

### Persistence Strategy

**Phase 1 (now):** IndexedDB

- Use IndexedDB (via `idb` library) as primary storage
- Single `apps` object store, keyed by app id
- Auto-save on state changes (debounced)
- This is already local-first — data lives in the browser, no server needed

**Phase 2 (later):** CRDT document model

- Replace raw string doc with a CRDT-based model (e.g., Automerge or Y.js)
- Enables conflict-free multi-device sync
- Commit history becomes a DAG rather than linear array

**Phase 3 (eventually):** Atman sync engine

- Plug Blacksmith's persistence into the Atman p2p sync protocol
- Data syncs across devices the user owns
- Uses existing repos: `syncman`, `actman`, `atman`

### Principle

Start with web best practices (IndexedDB), then improve toward local-first. Don't over-engineer the sync layer before the core product works well.

---

## Tech Stack (Recommended)

- **Framework**: React (already prototyped with React)
- **Build**: Vite (lightweight, fast)
- **Language**: TypeScript
- **Persistence**: `idb` (IndexedDB wrapper)
- **Styling**: CSS-in-JS or CSS modules (prototype uses inline styles — consider migrating)
- **AI**: Anthropic API (Claude) for the chat-to-document transformation
- **Future**: Rust core via WASM for CRDT/sync layer

---

## Project Structure (Suggested)

```
blacksmith/
├── CLAUDE.md                    # This file
├── prototype/
│   └── blacksmith.jsx           # Reference prototype from Claude.ai
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component
│   ├── components/
│   │   ├── Sidebar.tsx          # App list sidebar
│   │   ├── Chat.tsx             # Forge chat panel
│   │   ├── Editor.tsx           # Markdown editor + preview toggle
│   │   ├── TopBar.tsx           # Toolbar with version control buttons
│   │   ├── HistoryPanel.tsx     # Commit history + diff view
│   │   ├── DiffView.tsx         # Unified diff renderer
│   │   ├── CommitDialog.tsx     # Commit message modal
│   │   └── Toast.tsx            # Notification toast
│   ├── lib/
│   │   ├── diff.ts              # LCS diff engine + inline diff
│   │   ├── markdown.ts          # Simple markdown renderer
│   │   ├── store.ts             # State management
│   │   └── persistence.ts       # IndexedDB layer
│   ├── types.ts                 # TypeScript type definitions
│   └── styles/
│       └── theme.ts             # Design tokens (colors, fonts, spacing)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## GitHub

- Organization: https://github.com/atman-project
- Relevant repos: `atman`, `syncman`, `actman`, `blacksmith` (to be created)

---

## Conversation History

This project was designed through an iterative conversation in Claude.ai. The prototype went through these versions:

1. **v1** — Initial layout: chat sidebar, note view, top bar with revert/commit/history
2. **v2** — Added diff view in history panel (LCS-based, hunk context, unified diff)
3. **v3** — Added inline character-level highlighting within modified lines in diffs
4. **v4** — Added publish button with "coming soon" toast
5. **v5** — Added collapsible left sidebar for managing multiple docs/apps
6. **v6** — Fixed delete button hover, new apps get same intro content
7. **v7** — Added tooltips for collapsed sidebar icons (fixed overflow:hidden clipping)
8. **v8** — Added Preview/Markdown toggle, preview as default, icon-only with text on hover
