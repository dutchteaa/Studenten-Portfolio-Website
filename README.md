# Studenten Portfolio Platform

A web platform where students can showcase their projects and companies can submit project requests — built with Next.js, Firebase, and deployed on Vercel.

## Live Demo

🌐 [studenten-portfolio-website.vercel.app](https://studenten-portfolio-website.vercel.app)

---

## What is this?

This platform has three types of users:

| Who | Account needed? | What they can do |
|---|---|---|
| **Student** | Yes | Register, log in, and publish projects to the public portfolio |
| **Company** | No | Fill in a request form to ask students to build something |
| **Admin** | Yes (manual) | Review company requests, approve or reject them, oversee all projects |

---

## Pages

| URL | Access | Description |
|---|---|---|
| `/` | Everyone | Homepage |
| `/portfolio` | Everyone | Public overview of all student projects |
| `/aanvraag` | Everyone | Company request form — no account required |
| `/login` | Everyone | Login page for students and admin |
| `/register` | Everyone | Registration page for new students |
| `/dashboard` | Logged-in student | Student manages their own projects |
| `/admin` | Admin only | Manage all requests and projects |

---

## Tech Stack

- **Frontend** — Next.js 14 (App Router) + TypeScript
- **Styling** — Tailwind CSS
- **Auth** — Firebase Authentication (email/password)
- **Database** — Firestore (NoSQL)
- **Hosting** — Vercel (auto-deploys on every push to `main`)
- **Version control** — GitHub