import { Component, inject, OnInit } from '@angular/core';
import { ProfileService } from '@core/services/profile-service.service';
import { Experience } from '@dashboard/experience/experience.component';
import { SectionHeaderComponent } from '@shared/section-header.component';
import { RevealDirective } from '@shared/reveal.directive';

@Component({
  selector: 'app-experience-section',
  imports: [SectionHeaderComponent, RevealDirective],
  templateUrl: './experience-section.component.html',
  styleUrl: './experience-section.component.css',
})
export class ExperienceSectionComponent implements OnInit {
  experiences: Experience[] = [];
  loading = true;
  private profileService: ProfileService = inject(ProfileService);

  ngOnInit() {
    this.profileService.getAllExperiences().subscribe({
      next: (data) => {
        this.experiences = data as Experience[];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /** Experiences arrive newest-first, so the newest role gets the highest
   *  "release" number: 3 roles → v3.x, v2.x, v1.x. */
  versionTag(index: number): string {
    return `v${this.experiences.length - index}.x`;
  }

  /** The description is authored one highlight per line; each line becomes a
   *  changelog-style bullet. Leading list markers are tolerated and stripped. */
  highlights(description: string): string[] {
    return (description ?? '')
      .split(/\r?\n/)
      .map((line) => line.replace(/^[-•+*]\s*/, '').trim())
      .filter(Boolean);
  }

  convertToDate(timestamp: any): string {
    let date: Date;

    if (!timestamp) {
      return 'Present';
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${year}`;
  }
}
