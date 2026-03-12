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
- `lib/auth.ts` — Register/login/logout helpers; registration restricted to `@novacollege.nl` emails

### Firestore collections

- **`users`** — `{ uid, email, name, role ('student'|'admin'), createdAt }`
- **`projects`** — Student portfolio projects with `titel`, `beschrijving`, `type ('website'|'game'|'hardware'|'overig')`, `afbeeldingUrl`, links, `leden`
- **`aanvragen`** — Company project requests with `status ('nieuw'|'goedgekeurd')`, `claims` array

### Page access

- Public: `/`, `/login`, `/register`, `/portfolio`, `/aanvraag`
- Students: `/dashboard`, `/opdrachten`
- Admin only: `/admin`

### Three user types

1. **Students** — register, manage portfolio projects, claim company requests
2. **Companies** — submit project requests (no auth required)
3. **Admins** — approve/manage requests and projects

## Environment Variables

All prefixed `NEXT_PUBLIC_` (client-side Firebase config) in `.env.local`:
`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`

## Conventions

- UI text is in **Dutch** (page content, labels, form fields)
- Path alias `@/*` maps to the project root
- TypeScript strict mode enabled
