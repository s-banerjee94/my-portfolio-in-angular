import { inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

import { Injectable } from '@angular/core';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth: Auth = inject(Auth);

  constructor() {}

  login(email: string, password: string) {
    return from(
      signInWithEmailAndPassword(this.firebaseAuth, email, password).then(
        () => {},
      ),
    );
  }

  logout() {
    return from(this.firebaseAuth.signOut());
  }
}
