# Manuscript Builder

Manuscript Builder is a free browser-based editor for creating immersive TTRPG
documents: royal decrees, handwritten letters, arcane grimoires, field
dossiers, science-fiction datapads, and other in-world handouts.

It is part of **Bag Of Holding Tools** and shares the suite's visual language,
workspace layout, and optional account system.

## Features

- Multi-page manuscripts with a live print-style preview.
- Royal Decree, Arcane Grimoire, Orbital Datapad, and Field Dossier themes.
- Titles, body text, bold and italic markup, text alignment, and illustrations.
- Page management, undo and redo, zoom controls, and a focused inspector.
- High-resolution PNG export of the current page.
- JSON download and import for editable manuscript backups.
- Automatic guest-draft saving in browser local storage.
- Optional Google sign-in through the shared Bag Of Holding Tools account.

The editor is designed to grow beyond a fixed template list. A manuscript style
can describe any setting or medium, from parchment and magical correspondence
to terminals, intelligence reports, alien inscriptions, and campaign-specific
documents.

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Base UI · Prisma ·
PostgreSQL · Supabase Auth · Vercel.

Manuscript data is isolated in its own PostgreSQL schema while authentication
is shared with the other Bag Of Holding Tools applications.

## Running locally

```bash
cp .env.example .env.local
pnpm install
pnpm prisma
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Guest editing works without
signing in.

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Deployment-specific values are documented in `.env.example` and configured in
the hosting environment rather than in this README.

## Legal pages

Manuscript Builder serves its own `/legal`, `/privacy`, `/terms`, and `/cookies`
pages. They are public and do not depend on authentication. Links are available
on sign-in and account pages and in the workspace's Settings panel.

Publisher and contact details live in `lib/legal.ts`; shared document styling
and navigation live in `components/legal`. The policies describe the current
editor: drafts and imported images stay in browser storage even when signed in,
and no analytics integration is enabled. Update the policies and their revision
date when storage, account behavior, providers, or tracking change.
