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

All data access is **client-side only** — components query Firestore directly (no API routes). Auth state is managed globally via `context/AuthContext.tsx` which provides `useAuth()` hook with `user`, `role`, `naam`, and `loading`.

### Key directories

- `app/` — Pages using App Router (no API routes)
- `components/` — Shared UI components (Navbar, Footer, ProjectCard, Spinner)
- `context/` — AuthContext provider wrapping the app in `layout.tsx`
- `lib/firebase.ts` — Firebase app initialization (singleton), exports `auth` and `db`
- `lib/auth.ts` — Register/login/logout helpers; registration requires admin approval

### Firestore collections

- **`users`** — `{ uid, email, name, role ('student'|'admin'), approved (boolean), createdAt }`
- **`projecten`** — Student portfolio projects with `titel`, `beschrijving`, `type ('website'|'game'|'hardware'|'overig')`, `afbeeldingUrl`, links, `leden`
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
- Students can claim/unclaim opdrachten
- Dashboard supports team members (search by email, add to project)

## Environment Variables

All prefixed `NEXT_PUBLIC_` (client-side Firebase config) in `.env.local`:
`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`

## Conventions

- UI text is in **Dutch** (page content, labels, form fields)
- Path alias `@/*` maps to the project root
- TypeScript strict mode enabled
