# Sandeepan Banerjee — Developer Portfolio

A personal portfolio and content-management system built with **Angular 21** and backed entirely by **Firebase** — no custom backend server.

**Live site:** [connectwithsandeepan.in](https://connectwithsandeepan.in/)

## Overview

The application has two halves served from a single SPA:

- **Public site** (`/`) — a single scrolling page: hero, about, services, featured & other projects, experience, and a contact form. Content is loaded live from Firestore, so edits appear without a redeploy.
- **Admin dashboard** (`/admin`) — a private CMS for every section of the site, plus a visitor-analytics view and a contact-message inbox. Protected by Firebase Authentication.

## Features

### Public site

- Fully content-managed — every section reads from Firestore documents
- Featured project spotlight (up to 3) with manual drag-and-drop ordering
- Project detail dialogs with a rich-text write-up or the project's GitHub README rendered in place
- Contact form writing straight to Firestore, with FCM push notification to the owner's devices
- Dark / light theme with persistence, scroll-reveal animations, PWA service worker

### Admin dashboard

- One editor per section (hero, about, services, projects, experience, contact, resume, certifications)
- Drag-and-drop ordering for projects, skills, and technology chips
- Rich-text editing (Quill) with HTML normalization on save
- Resume upload/management with a designated primary resume (Firebase Storage)
- Traffic analytics built from scratch: visitors per day, sources, devices, new vs returning visitors, section-reach funnel, time-on-site, scroll depth, and exit points
- Messages inbox with browser push notifications for new messages

## Tech stack

| Layer        | Technology                                                             |
| ------------ | ---------------------------------------------------------------------- |
| Framework    | Angular 21 (standalone components, strict TypeScript)                  |
| UI           | PrimeNG 21 (custom "Magma" preset), Tailwind CSS 4, PrimeIcons, Lucide |
| Rich text    | Quill 2                                                                |
| Charts       | Chart.js                                                               |
| Backend      | Firebase — Auth, Firestore, Storage, Hosting, Cloud Functions (FCM)    |
| Firebase SDK | @angular/fire                                                          |
| PWA          | Angular service worker                                                 |
| Testing      | Karma + Jasmine                                                        |
| Formatting   | Prettier with prettier-plugin-tailwindcss                              |

## Architecture

```
src/app
├── core/        app-wide singletons: guards, services, PrimeNG theme preset
├── public/      public site: header, footer, home, *-section components
├── dashboard/   admin CMS: one editor per section, analytics, messages, login
└── shared/      reusable pieces: section header, reveal directive, pipes
```

- TypeScript path aliases: `@core/*`, `@public/*`, `@dashboard/*`, `@shared/*`
- Firestore layout: `profile/<section>` singleton docs per section; `projects`, `experience`, `certifications`, `resumes`, and `messages` collections
- Security rules: world-readable, authenticated writes — except `messages`, which is world-writable (public contact form) and authenticated-read

## Getting started

### Prerequisites

- Node.js 20+
- Java 21+ (for the Firebase emulators)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm i -g firebase-tools`)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the environment files (gitignored) at `src/env/environment.ts` and `src/env/environment.prod.ts`:

   ```ts
   export const environment = {
     production: false, // true in environment.prod.ts
     firebase: {
       apiKey: "...",
       authDomain: "<project>.firebaseapp.com",
       projectId: "<project>",
       storageBucket: "<project>.firebasestorage.app",
       messagingSenderId: "...",
       appId: "...",
       measurementId: "...",
     },
     useEmulators: true, // false in environment.prod.ts
   };
   ```

3. Start the Firebase emulators (Auth 9099, Firestore 8081, Storage 9199) and seed them:

   ```bash
   npm run emulators
   npm run seed
   ```

   The dev configuration connects to the local emulators, so they must be running before the dev server starts. The seed script fills the emulators with sample content and an admin login user (see `scripts/seed-emulator.mjs`).

4. In a second terminal, start the dev server:

   ```bash
   npm start
   ```

   The site runs at `http://localhost:4200`; the dashboard is at `/admin` (log in at `/login`).

## Scripts

| Command             | Description                                                        |
| ------------------- | ------------------------------------------------------------------ |
| `npm start`         | Dev server at `http://localhost:4200` (expects running emulators)  |
| `npm run build`     | Production build to `dist/my-portfolio-angular`                    |
| `npm test`          | Karma/Jasmine tests in watch mode                                  |
| `npm run emulators` | Local Firebase emulators with periodic export to `./emulator-data` |
| `npm run seed`      | Seed the running emulators with content + admin user (idempotent)  |

## Deployment

Deploys are manual via the Firebase CLI:

```bash
npm run build
firebase deploy --only hosting
```

Firestore/Storage rules and the Cloud Function live in this repo as well (`firestore.rules`, `storage.rules`, `functions/`) and can be deployed with the corresponding `firebase deploy --only ...` targets.
