import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { SpeedDial } from 'primeng/speeddial';
import { ProfileService } from '@core/services/profile-service.service';
import { AnalyticsService } from '@core/services/analytics.service';
import { Resume } from '@dashboard/resume/resume.component';
import { Button } from 'primeng/button';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, SpeedDial, Button],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  host: {
    '(window:scroll)': 'updateScrollProgress()',
  },
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;
  dialItems: MenuItem[] = [];
  primaryResume: Resume | undefined;

  // Center the nav list: give the brand (start) and controls (end) equal flex
  // so the menu sits at the true midpoint. Scoped to the menubar's own 960px
  // breakpoint — below it the speed dial takes over navigation, so the
  // built-in hamburger is hidden.
  protected readonly menubarPt = {
    start: { class: 'min-[960px]:flex-1' },
    end: {
      class: 'min-[960px]:flex-1 min-[960px]:flex min-[960px]:justify-end',
    },
    button: { class: '!hidden' },
  };

  // The mask ships position:absolute (sized to the dial's wrapper), so pin it
  // to the viewport. The closed items hide via scale(0), which keeps their
  // layout box — float the list above the button and let clicks pass through
  // it (each item re-enables its own pointer events).
  protected readonly dialPt = {
    root: { class: '!relative' },
    mask: { class: '!fixed !inset-0 !bg-black/40' },
    // max-h caps the fan on short (landscape) screens; column-reverse keeps
    // the scroll anchored at the button end, so overflow hides the top items
    // until scrolled instead of clipping them off-screen.
    list: {
      class:
        '!pointer-events-none !absolute !right-0 !bottom-full !mb-2 !max-h-[calc(100dvh-7rem)] !items-end !overflow-y-auto',
    },
  };

  /** One source for both navs: menubar links (labels) and speed dial (icons). */
  private readonly sections = [
    { label: 'Home', fragment: 'home', icon: 'pi pi-home' },
    { label: 'About', fragment: 'about', icon: 'pi pi-user' },
    { label: 'Services', fragment: 'services', icon: 'pi pi-wrench' },
    { label: 'Experience', fragment: 'experience', icon: 'pi pi-briefcase' },
    { label: 'Projects', fragment: 'projects', icon: 'pi pi-folder-open' },
    {
      label: 'Certifications',
      fragment: 'certifications',
      icon: 'pi pi-verified',
    },
    { label: 'Contact', fragment: 'contact', icon: 'pi pi-envelope' },
  ];

  protected readonly scrollProgress = signal(0);

  private profileService: ProfileService = inject(ProfileService);
  private analytics: AnalyticsService = inject(AnalyticsService);
  private router = inject(Router);
  protected readonly themeService = inject(ThemeService);

  ngOnInit() {
    this.items = this.sections.map(({ label, fragment }) => ({
      label,
      routerLink: '/',
      fragment,
    }));

    // The dial fans upward and lays items out bottom-up, so feed it the
    // sections reversed to read Home → Contact from the top.
    this.dialItems = this.sections
      .map(({ label, fragment, icon }) => ({
        label,
        icon,
        command: () => this.goToSection(fragment),
      }))
      .reverse();

    this.getPrimaryResume();
  }

  private goToSection(fragment: string): void {
    this.router.navigate(['/'], { fragment });
    // Same-fragment repeats don't re-emit on the route, so scroll directly too.
    document
      .getElementById(fragment)
      ?.scrollIntoView({ behavior: 'smooth' });
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
