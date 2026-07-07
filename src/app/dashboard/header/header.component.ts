import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { AuthService } from '@core/services/auth-service.service';
import { PushNotificationService } from '@core/services/push-notification.service';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly push = inject(PushNotificationService);
  protected readonly pushSupported = PushNotificationService.supported();

  protected readonly navItems = [
    { label: 'analytics', link: '/admin/analytics' },
    { label: 'edit-content', link: '/admin/edit-content' },
    { label: 'messages', link: '/admin/messages' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.push.disable(); // unregister first, while rules still allow it
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
