import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AboutData } from '@dashboard/about/about.component';
import { Hero } from '@dashboard/hero/hero.component';
import { ProfileService } from '@core/services/profile-service.service';
import { SectionHeaderComponent } from '@shared/section-header.component';
import { RevealDirective } from '@shared/reveal.directive';

@Component({
  selector: 'app-about-section',
  imports: [SectionHeaderComponent, RevealDirective],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.css',
})
export class AboutSectionComponent implements OnInit {
  aboutData: AboutData | undefined;
  role = '';
  private profileSevice: ProfileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.profileSevice
      .getSectionData<AboutData>('about')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (data) {
            this.aboutData = data;
          }
        },
        error: (err) => {
          // to do add toast
        },
      });

    // "Role" in the quick-facts card mirrors the hero's professional title,
    // so it's edited in one place (the Hero tab of the dashboard).
    this.profileSevice
      .getSectionData<Hero>('hero')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (data) {
            this.role = data.professionalTitle;
          }
        },
      });
  }
}
