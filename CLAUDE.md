# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

**Next.js 16 App Router** with **Firebase** backend (auth + Firestore), styled with **Tailwind CSS v4**, deployed on **Vercel**.

Data access is primarily **client-side** — components query Firestore directly. One server-side API route exists at `app/api/admin/delete-user/route.ts` for admin user deletion (uses Firebase Admin SDK). Auth state is managed globally via `context/AuthContext.tsx` which provides `useAuth()` hook with `user`, `role`, `naam`, and `loading`.

### Key directories

- `app/` — Pages using App Router + one API route (`api/admin/delete-user`)
- `components/` — Shared UI components (Navbar, Footer, ProjectCard, Spinner)
- `context/` — AuthContext provider wrapping the app in `layout.tsx`
- `lib/firebase.ts` — Firebase client initialization (singleton), exports `auth` and `db`
- `lib/firebase-admin.ts` — Firebase Admin SDK (lazy initialization via `getAdminAuth()` / `getAdminDb()` to avoid build-time errors on Vercel)
- `lib/auth.ts` — Register/login/logout helpers; registration requires admin approval

### Firestore collections

- **`users`** — `{ uid, email, name, role ('student'|'admin'), approved (boolean), createdAt }`
- **`projecten`** — Student portfolio projects with `titel`, `beschrijving`, `types` (array of `'website'|'game'|'hardware'|'overig'`), `afbeeldingUrl`, `youtubeUrl`, links, `leden` (array of `{uid, naam, email}`), `ledenIds` (array of UIDs for efficient querying), `studentId`, `studentNaam`
- **`aanvragen`** — Company project requests with `status ('nieuw'|'goedgekeurd'|'afgewezen')`, `claims` array

### Page access

- Public: `/`, `/login`, `/register`, `/portfolio`, `/aanvraag`
- Logged-in users: `/dashboard`, `/opdrachten`
- Admin only: `/admin`

### Three user types

1. **Students** — register (requires admin approval), manage portfolio projects, claim company requests
2. **Companies** — submit project requests (no auth required)
3. **Admins** — approve/manage requests, projects, and user registrations

## UI / Design

- **Dark theme** — near-black background (`#09090b`) with indigo-to-violet gradient accent (`#6366f1` -> `#8b5cf6`)
- CSS variables defined in `app/globals.css` under `:root`
- Custom component classes: `.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.badge-*`, `.input-themed`, `.glass-nav`
- `.gradient-text` for gradient headings, `.hero-glow` for animated glow orbs
- Font: Inter (sans) + JetBrains Mono (mono), loaded via Google Fonts
- Animations: `.animate-fade-up`, `.animate-scale-in`, `.animate-float`, `.animate-slide-down`

## Features

- `/portfolio` and `/opdrachten` have client-side search with pagination (9 and 6 items per page)
- `/portfolio` also has type filter buttons (website/game/hardware/overig)
- `/portfolio` has a modal view for full project details (click any project card)
- Projects support YouTube video embeds (shown in modal instead of image)
- `/opdrachten` requires login — redirects to `/login` if not authenticated
- `/opdrachten` uses server-side filtering: `where('status', '==', 'goedgekeurd')`
- Students can claim/unclaim opdrachten
- Dashboard supports team members (search by name with prefix matching, add to project)
- Dashboard team search queries all users (students + admins)

## Server-side Firestore Queries

The following pages use targeted Firestore queries instead of loading entire collections:

- **Homepage** (`app/page.tsx`) — Uses `getCountFromServer()` for project and student counts (no documents downloaded)
- **Dashboard** (`app/dashboard/page.tsx`):
  - Project loading: `where('studentId', '==', uid)` + `where('ledenIds', 'array-contains', uid)` (two parallel queries, deduplicated)
  - Team search: Prefix query with `where('name', '>=', term)` + `limit(10)` (auto-capitalizes first letter)
- **Opdrachten** (`app/opdrachten/page.tsx`) — `where('status', '==', 'goedgekeurd')`
- **Portfolio** (`app/portfolio/page.tsx`) — Loads all projects (needed for search + filter count badges)

## Environment Variables

Client-side (prefixed `NEXT_PUBLIC_` in `.env.local`):
`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`

Server-side (for Firebase Admin SDK, used by API route):
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

## Conventions

- UI text is in **Dutch** (page content, labels, form fields)
- Path alias `@/*` maps to the project root
- TypeScript strict mode enabled
- Firebase Admin SDK uses lazy initialization (`getAdminAuth()` / `getAdminDb()`) — never import at module top level to avoid Vercel build failures
