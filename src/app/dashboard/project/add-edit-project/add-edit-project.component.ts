import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../../services/profile-service.service';
import { CommunicationService } from '../../../services/communication.service';

export interface Project {
  id?: string;
  title: string;
  description: string;
  gitHubUrl: string;
  liveDemoUrl: string;
  technologies: string[];
  projectImgUrl: string;
}

@Component({
  selector: 'app-add-edit-project',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    FloatLabel,
    InputText,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    ChipModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './add-edit-project.component.html',
  styleUrl: './add-edit-project.component.css',
  providers: [MessageService],
})
export class AddEditProjectComponent implements OnInit {
  techs: string[] = [];
  enteredTech: string = '';
  projectTitle: string = '';
  description: string = '';
  gitHubUrl: string = '';
  liveDemoUrl: string = '';
  projectId: string = '';
  projectImgUrl: string = '';
  mode: string = '';

  private profileSevice: ProfileService = inject(ProfileService);
  private communicationService: CommunicationService =
    inject(CommunicationService);

  constructor(private messageService: MessageService) {}
  ngOnInit(): void {
    this.communicationService.onProjectClickedEvent.subscribe((project) => {
      if (!project?.title) {
        this.mode = 'Add Project';
        this.projectTitle = '';
        this.description = '';
        this.gitHubUrl = '';
        this.liveDemoUrl = '';
        this.techs = [];
        this.projectId = '';
        this.projectImgUrl = '';
        return;
      }
      this.mode = 'Edit Project';
      this.projectTitle = project!.title;
      this.description = project!.description;
      this.gitHubUrl = project!.gitHubUrl;
      this.liveDemoUrl = project!.liveDemoUrl;
      this.techs = project!.technologies || [];
      this.projectId = project!.id || '';
      this.projectImgUrl = project!.projectImgUrl || '';
    });
  }

  addTech(): void {
    const tech = this.enteredTech.trim();
    if (tech && !this.techs.includes(tech)) {
      this.techs.push(tech);
      this.enteredTech = '';
    }
  }

  removeTech(tech: string): void {
    this.techs = this.techs.filter((s) => s !== tech);
  }

  saveProjectDetails(): void {
    const projectData: Project = {
      title: this.projectTitle,
      description: this.description,
      gitHubUrl: this.gitHubUrl,
      liveDemoUrl: this.liveDemoUrl,
      technologies: this.techs,
      projectImgUrl: this.projectImgUrl,
    };

    this.profileSevice.saveProject(projectData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project Added',
        });
      },
      error: (error) => {
        console.error('Error saving project:', error);
      },
    });
  }

  updateProjectDetails() {
    const projectData: Project = {
      title: this.projectTitle,
      description: this.description,
      gitHubUrl: this.gitHubUrl,
      liveDemoUrl: this.liveDemoUrl,
      technologies: this.techs,
      id: this.projectId,
      projectImgUrl: this.projectImgUrl,
    };
    this.profileSevice.updateProject(this.projectId, projectData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project Updated',
        });
        console.log('Project updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating project:', error);
      },
    });
  }

  removeImage() {
    this.profileSevice.deleteFile(this.projectImgUrl).subscribe({
      next: () => {
        this.projectImgUrl = '';
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Image Removed',
        });
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.profileSevice.uploadFile(file).subscribe({
        next: (downloadURL) => {
          this.projectImgUrl = downloadURL;
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }
}
