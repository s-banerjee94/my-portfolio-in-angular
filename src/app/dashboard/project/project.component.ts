import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { SplitterModule } from 'primeng/splitter';
import { ListboxModule } from 'primeng/listbox';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LucideAngularModule, Trash2 } from 'lucide-angular';

import { AddEditProjectComponent } from './add-edit-project/add-edit-project.component';
import { ProfileService } from '@core/services/profile-service.service';
import { CommunicationService } from '@core/services/communication.service';

@Component({
  selector: 'app-project',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    SplitterModule,
    ListboxModule,
    PanelModule,
    ButtonModule,
    ToastModule,
    LucideAngularModule,
    AddEditProjectComponent,
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css',
  providers: [MessageService],
})
export class ProjectComponent implements OnInit {
  private messageService = inject(MessageService);

  readonly Trash2 = Trash2;
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
