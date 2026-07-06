# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server at http://localhost:4200 (development configuration)
- `npm run build` — production build to `dist/my-portfolio-angular`
- `npm test` — Karma/Jasmine tests in watch mode (opens Chrome)
- `ng test --watch=false --browsers=ChromeHeadless` — single test run
- `ng test --include='**/hero.component.spec.ts'` — run a single spec file
- `firebase emulators:start` — start local Firebase emulators (Auth 9099, Firestore 8081, Storage 9199)
- `firebase deploy` — deploy to Firebase Hosting (serves `dist/my-portfolio-angular/browser`)

**Important:** `src/env/environment.ts` has `useEmulators: true`, so the dev server connects to local Firebase emulators (wired up in `app.config.ts`). Start the emulators before `npm start`, or Firestore/Auth/Storage calls will fail. The production build swaps in `src/env/environment.prod.ts` via `fileReplacements` (note: `src/env/`, not the conventional `src/environments/`).

Formatting is Prettier with `prettier-plugin-tailwindcss` (sorts Tailwind classes). There is no lint target.

## Architecture

Angular 19 personal-portfolio SPA backed entirely by Firebase (no custom backend). All components are standalone (no NgModules); app bootstraps via `app.config.ts` providers.

The app has two halves, defined in `src/app/app.routes.ts`:

1. **Public site** (`/` → `HomeComponent`): a single scrolling page composed of `*-section` components (`hero-section`, `about-section`, `project-section`, `experience-section`, `contact-section`) plus `header`/`footer`. Navigation uses URL fragments; `HomeComponent` scrolls to the matching element id.
2. **Admin dashboard** (`/dashboard` → `DashboardComponent`): CMS for the site's content. Child routes: `edit-content` (PrimeNG tabs hosting one editor component per section in `src/app/dashboard/*`) and `messages` (contact-form inbox). Protected by `authGuard`; `/login` uses `noAuthGuard` to redirect authenticated users. Both guards wrap Firebase `onAuthStateChanged` in an Observable (`src/app/guard/auth.guard.ts`).

### Data layer

Firestore structure (accessed through `@angular/fire`):
- `profile/<sectionName>` docs — singleton content per section (hero, about, contact...), read/written generically via `ProfileService.getSectionData`/`saveSectionData`
- `projects`, `experience`, `resumes` collections — CRUD in `ProfileService` (`src/app/services/profile-service.service.ts`), which also handles Firebase Storage uploads/deletes
- `messages` collection — `ContaceMeService` (note the typo in the name/file), which also defines the `Message` interface

Services wrap Firebase promises in RxJS with `from(...)`; components subscribe. Data model interfaces live in the component files that own them (e.g. `Project` in `add-edit-project.component.ts`, `Experience` in `experience.component.ts`, `Resume` in `resume.component.ts`), and services import types from those components — follow this pattern rather than creating a separate models directory.

`CommunicationService` is an EventEmitter bus used to pass the selected project between the dashboard project list and the add/edit form.

Security rules (`firestore.rules`, `storage.rules`): everything is world-readable and auth-required for writes, **except** `messages`, which is inverted — anyone can write (public contact form), only authenticated users can read. Keep this in mind when adding collections.

### UI stack

- **PrimeNG 19** with the Aura theme preset; dark mode toggled by adding the `.my-app-dark` class (configured in `app.config.ts`)
- **Tailwind CSS 4** via PostCSS (`.postcssrc.json`); global styles in `src/styles.css` import `tailwindcss`, `tailwindcss-primeui`, and PrimeIcons — there is no tailwind.config file
- Lucide icons (`lucide-angular`) and Quill (rich text) are also used
- Component style budget is tight (8kB error per component style) — keep styling in Tailwind utility classes, not component CSS

### Other notes

- TypeScript is fully strict (`strict: true` plus `strictTemplates`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`)
- There are no bundled static assets: angular.json points assets at a `public/` directory that does not exist in the repo — all images and files (hero photo, resume PDFs) are served from Firebase Storage URLs stored in Firestore
