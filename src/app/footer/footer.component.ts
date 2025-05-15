import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink, MenuModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  items: MenuItem[] | undefined;
  socials: MenuItem[] | undefined;
  currentYear: number = new Date().getFullYear();

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        routerLink: '/',
        fragment: 'home',
      },
      {
        label: 'About',
        routerLink: '/',
        fragment: 'about',
      },
      {
        label: 'Skill',
        routerLink: '/',
        fragment: 'about',
      },
      {
        label: 'Projects',
        routerLink: '/',
        fragment: 'projects',
      },
      {
        label: 'Contact',
        routerLink: '/',
        fragment: 'contact',
      },
    ];
    this.socials = [
      {
        label: 'Github',
        url: 'https://github.com/s-banerjee94',
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/connect2sandy/',
      },
    ];
  }
}
