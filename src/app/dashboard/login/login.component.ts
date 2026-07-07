import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { ToastService } from '@core/services/toast.service';

import { AuthService } from '@core/services/auth-service.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink,
    FloatLabel,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    Message,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  protected readonly loading = signal(false);

  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private messageService = inject(ToastService);

  login(form: NgForm) {
    if (form.invalid || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin']);
        form.resetForm();
      },
      error: (error) => {
        this.loading.set(false);
        // Modern Firebase Auth collapses bad email/password into one code.
        const badCredential =
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password';
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: badCredential
            ? 'Invalid email or password. Please try again.'
            : 'Failed to login. Please try again.',
        });
      },
    });
  }
}
