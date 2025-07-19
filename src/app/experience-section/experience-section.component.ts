import {Component, inject, OnInit} from '@angular/core';
import {Timeline} from 'primeng/timeline';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {ProfileService} from '../services/profile-service.service';

@Component({
  selector: 'app-experience-section',
  imports: [Timeline, CardModule, ButtonModule],
  templateUrl: './experience-section.component.html',
  styleUrl: './experience-section.component.css'
})
export class ExperienceSectionComponent implements OnInit {
  events: any[] | undefined;
  private profileService: ProfileService = inject(ProfileService);

  constructor() {}

  ngOnInit() {
    this.profileService.getAllExperiences().subscribe({
      next: (data) => {
        this.events = data as Event[];
      },
      error: (err) => {

      }
    })
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
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${month} - ${year}`;
  }
}
