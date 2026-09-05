# Manuscript Builder

Manuscript Builder is a free handout editor designed for D&D, Pathfinder, other
TTRPG campaigns, and fictional worldbuilding.

Write royal decrees, secret letters, grimoire pages, field dossiers, and
science-fiction transmissions. Style each manuscript, add illustrations, and
export a handout for your players. An account is optional: guest mode opens
directly in the editor and stores its work in the browser.

## Why it exists

A letter from a missing ally, a sealed summons, or an intercepted transmission
can turn a plot hook into something players can hold. Creating those documents
should not require a desktop publishing application or a new layout for every
session.

Manuscript Builder keeps writing and presentation together. The same words can
become a parchment decree, an arcane text, a classified report, or a terminal
readout by changing the manuscript's style.

## Features

- Multi-page manuscripts with a live print-style preview.
- Royal Decree, Arcane Grimoire, Orbital Datapad, and Field Dossier themes.
- Page titles, body text, bold and italic markup, alignment, and illustrations.
- Page management, undo and redo, zoom controls, and a focused inspector.
- Guest drafts stored locally in the browser.
- Account dashboard for creating and reopening saved manuscripts.
- Cloud autosave for signed-in manuscripts, including guest-draft import.
- Version checks that prevent older tabs from overwriting newer saves.
- High-resolution PNG export of the current page.
- Editable JSON download and import.

## Who it is for

Dungeon masters preparing clues and correspondence, players writing in-character
letters, and worldbuilders creating documents from their settings. Nothing in
the editor is tied to a specific game system or genre.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Base UI · Prisma ·
PostgreSQL · Supabase Auth · Vercel.

The editor lives in
[`components/manuscript-workspace.tsx`](components/manuscript-workspace.tsx).
Guest drafts use browser storage; account manuscripts and their pages are
stored alongside the other apps in the shared PostgreSQL `public` schema.

Manuscript Builder is part of **Bag Of Holding Tools**, a family of free TTRPG
utilities with a shared visual language and optional account system.

## Running locally

Use Node.js 22.13 or later and pnpm. Copy the environment template and configure
the Supabase and database values before installing dependencies.

```bash
cp .env.example .env.local
pnpm install
pnpm exec prisma generate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Guest mode is available at
`/workspace` without signing in. Signed-in users can access their manuscripts
at `/dashboard`.

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`pnpm test:database` checks ownership, save conflicts, and page persistence
against the configured database. Its temporary fixtures are rolled back after
the checks.

Deployment-specific values are documented in `.env.example` and configured in
the hosting environment rather than in this README.

## License

[MIT](LICENSE) — Copyright © 2026 mKzz.
