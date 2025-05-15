import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import {
  getFirestore,
  provideFirestore,
  connectFirestoreEmulator,
} from '@angular/fire/firestore';
import {
  provideStorage,
  getStorage,
  connectStorageEmulator,
} from '@angular/fire/storage';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';

import { environment } from '../env/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment)),
    provideFirestore(() => {
      const firestore = getFirestore();
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      return firestore;
    }),
    provideStorage(() => {
      const firestore = getStorage();
      connectStorageEmulator(firestore, 'localhost', 9199);
      return getStorage();
    }),
    provideAuth(() => {
      const auth = getAuth();
      connectAuthEmulator(auth, 'http://localhost:9099');
      return auth;
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
      ripple: true,
    }),
  ],
};
