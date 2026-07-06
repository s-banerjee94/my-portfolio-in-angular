import { Component, inject, OnInit } from '@angular/core';

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

  ngOnInit(): void {
    this.profileSevice.getSectionData('about').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.aboutData = data.data() as AboutData;
        }
      },
      error: (err) => {
        // to do add toast
      },
    });

    // "Role" in the quick-facts card mirrors the hero's professional title,
    // so it's edited in one place (the Hero tab of the dashboard).
    this.profileSevice.getSectionData('hero').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.role = (data.data() as Hero).professionalTitle;
        }
      },
    });
  }
}
