import { Component, inject, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { ToastService } from '@core/services/toast.service';

import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';
import { ProfileService } from '@core/services/profile-service.service';
import { CommunicationService } from '@core/services/communication.service';

@Component({
  selector: 'app-project',
  imports: [ButtonModule, AddEditProjectComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent implements OnInit {
  private messageService = inject(ToastService);

  private profileSevice: ProfileService = inject(ProfileService);
  private communicationService: CommunicationService =
    inject(CommunicationService);
  projects: any[] = [];

  selectedProject: any = null;

  ngOnInit() {
    this.getAllProjects();
  }

  selectProject(project: any) {
    this.selectedProject = project;
    this.communicationService.onProjectClicked(project);
  }

  deleteProject(project: any, event: Event) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent element
    this.deleteProjectFromDB(project);
  }

  addProject() {
    this.selectedProject = null; // Reset selected project for adding a new one
    this.communicationService.onProjectClicked({} as any); // Emit an empty project to open the add form
  }

  getAllProjects(): void {
    this.profileSevice.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load projects',
        });
      },
    });
  }

  deleteProjectFromDB(project: any): void {
    this.profileSevice.deleteProject(project.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Project Deleted',
        });
        this.getAllProjects(); // Refresh the project list after deletion
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete project',
        });
      },
    });
  }
}
