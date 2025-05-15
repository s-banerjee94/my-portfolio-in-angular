import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    FloatLabel,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        console.log('Login successful');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed', error);
      },
    });
  }
}
