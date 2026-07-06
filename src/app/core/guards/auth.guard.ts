import { inject } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  return new Observable<boolean>((subscriber) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        subscriber.next(true);
      } else {
        router.navigate(['/login']);
        subscriber.next(false);
      }
      subscriber.complete();
    });

    return { unsubscribe };
  });
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Observable<boolean>((subscriber) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Already logged in → redirect away
        router.navigate(['/dashboard']);
        subscriber.next(false);
      } else {
        // Not logged in → allow access to /login
        subscriber.next(true);
      }
      subscriber.complete();
    });

    return { unsubscribe };
  });
};
