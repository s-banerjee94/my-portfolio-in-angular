import { Component, inject, OnInit } from '@angular/core';

import {
  LucideAngularModule,
  Briefcase,
  GraduationCap,
  Award,
} from 'lucide-angular';
import { AboutData } from '../dashboard/about/about.component';
import { ProfileService } from '../services/profile-service.service';

@Component({
  selector: 'app-about-section',
  imports: [LucideAngularModule],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.css',
})
export class AboutSectionComponent implements OnInit {
  readonly Briefcase = Briefcase;
  readonly GraduationCap = GraduationCap;
  readonly Award = Award;
  aboutData: AboutData | undefined;
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
  }
}
