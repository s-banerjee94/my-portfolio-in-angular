import { Component, inject, OnInit, signal } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ProfileService } from '../services/profile-service.service';
import { Resume } from '../dashboard/resume/resume.component';
import { Button } from 'primeng/button';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, Button],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  host: {
    '(window:scroll)': 'updateScrollProgress()',
  },
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;
  primaryResume: Resume | undefined;

  protected readonly scrollProgress = signal(0);

  private profileService: ProfileService = inject(ProfileService);
  protected readonly themeService = inject(ThemeService);

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
        label: 'Experience',
        routerLink: '/',
        fragment: 'experience',
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

    this.getPrimaryResume();
  }

  protected updateScrollProgress(): void {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    this.scrollProgress.set(max > 0 ? (window.scrollY / max) * 100 : 0);
  }

  getPrimaryResume() {
    this.profileService.getPrimaryResume().subscribe({
      next: (data) => {
        const resumes = data as Resume[];
        this.primaryResume = resumes[0];
      }
    })
  }

  downloadResume() {
    const link = document.createElement('a');
    if (!this.primaryResume)
      return;

    link.href = this.primaryResume.fileUrl;
    link.download = 'sandeepan_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
