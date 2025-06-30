import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';

import {CardModule} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {ButtonModule} from 'primeng/button';
import {AuthService} from '../../services/auth-service.service';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {Message} from 'primeng/message';

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
    Toast,
    Message,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [MessageService]
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private messageService: MessageService = inject(MessageService);

  login(form: NgForm) {
    if (form.valid) {
      this.authService.login(this.email, this.password).subscribe({
        next: () => {
          console.log('Login successful');
          this.router.navigate(['/dashboard']);
          form.resetForm();
        },
        error: (error) => {
          if(error.code === "auth/user-not-found"){
            this.messageService.add({
              severity: 'error',
              summary: 'Login Failed',
              detail:  'Invalid email address. Please try again.'
            });
            return;
          } else if(error.code === "auth/wrong-password"){
            this.messageService.add({
              severity: 'error',
              summary: 'Login Failed',
              detail:  'Invalid password. Please try again.'
            });
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: 'Failed to login. Please try again.'
          });
        },
      });
    }
  }
}
