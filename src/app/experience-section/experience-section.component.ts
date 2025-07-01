import {Component} from '@angular/core';
import {Timeline} from 'primeng/timeline';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';

@Component({
  selector: 'app-experience-section',
  imports: [Timeline, CardModule, ButtonModule],
  templateUrl: './experience-section.component.html',
  styleUrl: './experience-section.component.css'
})
export class ExperienceSectionComponent {
  events: any[];

  constructor() {
    this.events = [
      {
        status: 'Dzylo', date: 'Oct - 2024 to Jan - 2025', icon: 'pi pi-briefcase',
        color: '#fc5e6a',
        summary: ' I worked as a Software Development Engineer on key modules for the flagship product Dzylo One. I developed a lead follow-up feature using Node.js, Kotlin (Ktor), and Angular, integrating MySQL and AWS DynamoDB for data handling and leveraging AWS SQS, EventBridge, and Lambda to automate follow-up reminders. Additionally, I implemented a task reviewer system that allowed manual selection of reviewers and enabled them to update review statuses, which dynamically updated the overall task status.'
      },
      {
        status: 'Jai Balaji Group', date: 'Mar - 2024 to Oct - 2025',
        icon: 'pi pi-briefcase', color: '#cd2653',
        summary: ' I served as an Associate Manager and developed tools to streamline marathon event operations. I built a participant registration Excel validator to ensure data integrity (unique RFID chips, BIB numbers, contact info) before syncing with the RFID and SMS systems, using an Angular-based UI for real-time error reporting. Additionally, I developed a Spring Boot–based marathon timing SMS notification system with Spring Batch and MySQL, which triggered automated SMS alerts upon race completion and included an Angular interface for live monitoring of SMS delivery status.'
      },
      {
        status: 'Junior Solutions Associate',
        date: 'Jan - 2022 to Oct - 2023',
        icon: 'pi pi-briefcase',
        color: '#1E8999',
        summary: ' I worked as a Junior Solutions Associate and led key initiatives to improve product performance and usability. I optimized GIFFY’s import module using Spring Boot and Syncfusion UI, achieving a 60% performance boost that greatly enhanced data processing speed and user experience. Additionally, I spearheaded the development of a project management tool featuring Syncfusion components like Kanban boards and Gantt charts to improve project tracking, visualization, and team collaboration.'
      },
    ];
  }
}
