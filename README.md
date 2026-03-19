# Studenten Portfolio Platform

Een webplatform waar studenten hun projecten kunnen publiceren en bedrijven projectaanvragen kunnen indienen — gebouwd met Next.js, Firebase en gedeployd op Vercel.

## Live Demo

[studenten-portfolio-website.vercel.app](https://studenten-portfolio-website.vercel.app)

---

## Wat is dit?

Dit platform is gemaakt door studenten van Nova College. Het heeft drie typen gebruikers:

| Wie | Account nodig? | Wat ze kunnen doen |
|---|---|---|
| **Student** | Ja (admin-goedkeuring vereist) | Registreren, inloggen, projecten publiceren, teamleden toevoegen, opdrachten claimen |
| **Bedrijf** | Nee | Projectaanvraag indienen via een formulier |
| **Admin** | Ja | Aanvragen goedkeuren/afwijzen, projecten en gebruikers beheren |

---

## Pagina's

| URL | Toegang | Beschrijving |
|---|---|---|
| `/` | Iedereen | Homepage met statistieken en uitleg |
| `/portfolio` | Iedereen | Publiek overzicht van alle studentenprojecten (zoeken, filteren, paginering) |
| `/aanvraag` | Iedereen | Aanvraagformulier voor bedrijven — geen account nodig |
| `/login` | Iedereen | Inlogpagina |
| `/register` | Iedereen | Registratiepagina voor nieuwe studenten |
| `/dashboard` | Ingelogde student | Eigen projecten beheren, teamleden toevoegen |
| `/opdrachten` | Ingelogde gebruiker | Goedgekeurde bedrijfsaanvragen bekijken en claimen |
| `/admin` | Alleen admin | Aanvragen, projecten en gebruikers beheren |

---

## Tech Stack

- **Frontend** — Next.js 16 (App Router) + TypeScript
- **Styling** — Tailwind CSS v4
- **Auth** — Firebase Authentication (email/password)
- **Database** — Cloud Firestore (NoSQL)
- **Server** — Firebase Admin SDK (voor admin API route)
- **Hosting** — Vercel (auto-deploy bij push naar `main`)

---

## Features

- Publiek portfolio met zoekfunctie, type-filters en paginering
- Projectmodal met afbeelding/YouTube-video, beschrijving en links
- Teamleden toevoegen aan projecten (zoeken op naam)
- Bedrijven kunnen opdrachten indienen zonder account
- Studenten claimen/unclaimen opdrachten
- Admin dashboard met statistieken en volledig beheer
- Server-side Firestore queries voor efficiënte data-opvraging
- Firestore Security Rules voor server-side validatie
- Dark theme met indigo/violet gradient design
- Responsief design (desktop, tablet, mobiel)

---

## Installatie

```bash
# Clone de repository
git clone https://github.com/dutchteaa/Studenten-Portfolio-Website.git
cd Studenten-Portfolio-Website

# Installeer dependencies
npm install

# Maak een .env.local bestand aan met je Firebase config
cp .env.example .env.local

# Start de development server
npm run dev
```

### Environment variables

**Client-side** (in `.env.local`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Server-side** (voor admin functionaliteit):
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
