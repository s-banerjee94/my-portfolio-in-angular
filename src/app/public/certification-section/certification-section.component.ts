import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  LucideAward,
  LucideExternalLink,
  LucideGraduationCap,
} from '@lucide/angular';

import { ProfileService } from '@core/services/profile-service.service';
import {
  Certification,
  compareCertifications,
} from '@dashboard/certification/certification.component';
import { SectionHeaderComponent } from '@shared/section-header.component';
import { RevealDirective } from '@shared/reveal.directive';
import { FirebaseDatePipe } from '@shared/pipes/firebase-date.pipe';

@Component({
  selector: 'app-certification-section',
  imports: [
    DatePipe,
    LucideAward,
    LucideExternalLink,
    LucideGraduationCap,
    SectionHeaderComponent,
    RevealDirective,
    FirebaseDatePipe,
  ],
  templateUrl: './certification-section.component.html',
})
export class CertificationSectionComponent implements OnInit {
  featured: Certification[] = [];
  others: Certification[] = [];
  hasAny = false;

  private profileService = inject(ProfileService);

  ngOnInit(): void {
    this.profileService.getAllCertifications().subscribe((data) => {
      const all = data as Certification[];
      this.hasAny = all.length > 0;
      // The dashboard enforces the max-3 rule; slice defends against old
      // data. Both groups follow the manual drag order set in the dashboard.
      this.featured = all
        .filter((certification) => certification.featured)
        .sort(compareCertifications)
        .slice(0, 3);
      this.others = all
        .filter((certification) => !this.featured.includes(certification))
        .sort(compareCertifications);
    });
  }
}
