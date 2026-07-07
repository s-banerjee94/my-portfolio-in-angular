import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { AuthService } from '@core/services/auth-service.service';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  protected readonly themeService = inject(ThemeService);

  protected readonly navItems = [
    { label: 'analytics', link: '/admin/analytics' },
    { label: 'edit-content', link: '/admin/edit-content' },
    { label: 'messages', link: '/admin/messages' },
  ];

  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
