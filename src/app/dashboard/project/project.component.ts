import { Component, inject, OnInit } from '@angular/core';

import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { ButtonModule } from 'primeng/button';
import { ToastService } from '@core/services/toast.service';

import {
  AddEditProjectComponent,
  compareProjects,
  Project,
} from './add-edit-project/add-edit-project.component';
import { ProfileService } from '@core/services/profile-service.service';
import { CommunicationService } from '@core/services/communication.service';

@Component({
  selector: 'app-project',
  imports: [ButtonModule, AddEditProjectComponent, CdkDrag, CdkDropList],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
})
export class ProjectComponent implements OnInit {
  private messageService = inject(ToastService);

  private profileSevice: ProfileService = inject(ProfileService);
  private communicationService: CommunicationService =
    inject(CommunicationService);
  projects: Project[] = [];
  // Featured and normal projects are ordered independently; each list is a
  // drop zone of its own, so a drag never crosses groups.
  featuredProjects: Project[] = [];
  otherProjects: Project[] = [];

  selectedProject: Project | null = null;

  ngOnInit() {
    this.getAllProjects();
  }

  selectProject(project: Project) {
    this.selectedProject = project;
    this.communicationService.onProjectClicked(project);
  }

  deleteProject(project: Project, event: Event) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent element
    this.deleteProjectFromDB(project);
  }

  addProject() {
    this.selectedProject = null; // Reset selected project for adding a new one
    this.communicationService.onProjectClicked({} as Project); // Emit an empty project to open the add form
  }

  reorderProjects(group: Project[], event: CdkDragDrop<Project[]>): void {
    moveItemInArray(group, event.previousIndex, event.currentIndex);
    const updates = group
      .map((project, index) => ({ id: project.id!, sortOrder: index }))
      .filter((update, index) => group[index].sortOrder !== update.sortOrder);
    group.forEach((project, index) => (project.sortOrder = index));
    if (!updates.length) {
      return;
    }
    this.profileSevice.updateProjectsOrder(updates).subscribe({
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save the new order',
        });
        this.getAllProjects();
      },
    });
  }

  getAllProjects(): void {
    this.profileSevice.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects as Project[];
        this.featuredProjects = this.projects
          .filter((project) => project.featured)
          .sort(compareProjects);
        this.otherProjects = this.projects
          .filter((project) => !project.featured)
          .sort(compareProjects);
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

  deleteProjectFromDB(project: Project): void {
    this.profileSevice.deleteProject(project.id!).subscribe({
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
