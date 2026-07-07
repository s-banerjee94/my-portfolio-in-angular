import { Component, inject, OnInit, signal } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ProfileService } from '@core/services/profile-service.service';
import { AnalyticsService } from '@core/services/analytics.service';
import { Resume } from '@dashboard/resume/resume.component';
import { Button } from 'primeng/button';
import { ThemeService } from '@core/theme/theme.service';

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

  // Center the nav list: give the brand (start) and controls (end) equal flex
  // so the menu sits at the true midpoint. Scoped to the menubar's own 960px
  // breakpoint — below it the list collapses to a hamburger and centering the
  // start/end would push that button off to the middle.
  protected readonly menubarPt = {
    start: { class: 'min-[960px]:flex-1' },
    end: {
      class: 'min-[960px]:flex-1 min-[960px]:flex min-[960px]:justify-end',
    },
  };

  protected readonly scrollProgress = signal(0);

  private profileService: ProfileService = inject(ProfileService);
  private analytics: AnalyticsService = inject(AnalyticsService);
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
        label: 'Services',
        routerLink: '/',
        fragment: 'services',
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
        label: 'Certifications',
        routerLink: '/',
        fragment: 'certifications',
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
      },
    });
  }

  downloadResume() {
    const link = document.createElement('a');
    if (!this.primaryResume) return;

    this.analytics.trackEvent('resume_download');
    link.href = this.primaryResume.fileUrl;
    link.download = 'sandeepan_resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
