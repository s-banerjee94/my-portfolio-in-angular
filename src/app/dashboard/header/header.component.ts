import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] = [];
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  constructor() {}

  ngOnInit() {
    this.items = [
      {
        label: 'Dashboard',
        routerLink: '/dashboard',
      },
      {
        label: 'Messages',
        routerLink: '/messages',
      },
    ];
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
