import { Component, inject, OnInit } from '@angular/core';

import { FormsModule, NgForm } from '@angular/forms';

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

import { ProfileService } from '@core/services/profile-service.service';
import { CommunicationService } from '@core/services/communication.service';
import { Message } from 'primeng/message';
import { DatePicker } from 'primeng/datepicker';
import { Timestamp } from '@angular/fire/firestore';
import { Github, Link, LucideAngularModule } from 'lucide-angular';

export interface Project {
  id?: string;
  title: string;
  description: string;
  gitHubUrl: string;
  liveDemoUrl: string;
  technologies: string[];
  projectImgUrl: string;
  projectDate: Timestamp | Date;
}

@Component({
  selector: 'app-add-edit-project',
  imports: [
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
    Message,
    DatePicker,
    LucideAngularModule,
  ],
  templateUrl: './add-edit-project.component.html',
  styleUrl: './add-edit-project.component.css',
  providers: [MessageService],
})
export class AddEditProjectComponent implements OnInit {
  private messageService = inject(MessageService);

  readonly Github = Github;
  readonly Link = Link;

  techs: string[] = [];
  enteredTech: string = '';
  projectTitle: string = '';
  description: string = '';
  gitHubUrl: string = '';
  liveDemoUrl: string = '';
  projectId: string = '';
  projectImgUrl: string = '';
  projectDate: Date | null = null;
  mode: string = '';

  private profileService: ProfileService = inject(ProfileService);
  private communicationService: CommunicationService =
    inject(CommunicationService);

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
        this.projectDate = null;
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
      this.projectDate = this.convertToDate(project.projectDate);
    });
  }

  private convertToDate(timestamp: any): Date {
    if (!timestamp) return new Date();

    if (timestamp.toDate) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  addTech(event: Event): void {
    event.preventDefault();
    const tech = this.enteredTech.trim();
    if (tech && !this.techs.includes(tech)) {
      this.techs.push(tech);
      this.enteredTech = '';
    }
  }

  removeTech(tech: string): void {
    this.techs = this.techs.filter((s) => s !== tech);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fix the validation errors',
      });
      return;
    }

    const projectData: Project = {
      title: this.projectTitle,
      description: this.description,
      gitHubUrl: this.gitHubUrl,
      liveDemoUrl: this.liveDemoUrl,
      technologies: this.techs,
      projectImgUrl: this.projectImgUrl,
      projectDate: this.projectDate!,
    };

    if (this.mode === 'Add Project') {
      this.saveProjectDetails(projectData, form);
    } else {
      this.updateProjectDetails(projectData);
    }
  }

  private saveProjectDetails(projectData: Project, form: NgForm): void {
    this.profileService.saveProject(projectData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project Added Successfully',
        });

        this.resetForm(form);
      },
      error: (error) => {
        console.error('Error saving project:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add project. Please try again.',
        });
      },
    });
  }

  private updateProjectDetails(projectData: Project) {
    projectData.id = this.projectId;

    this.profileService.updateProject(this.projectId, projectData).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project Updated Successfully',
        });
      },
      error: (error) => {
        console.error('Error updating project:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update project. Please try again.',
        });
      },
    });
  }

  private resetForm(form: NgForm): void {
    form.resetForm();

    this.projectTitle = '';
    this.description = '';
    this.gitHubUrl = '';
    this.liveDemoUrl = '';
    this.techs = [];
    this.enteredTech = '';
    this.projectImgUrl = '';
    this.projectDate = null;

    // Keep the mode as "Add Project"
    this.mode = 'Add Project';
  }

  removeImage() {
    this.profileService.deleteFile(this.projectImgUrl).subscribe({
      next: () => {
        this.projectImgUrl = '';
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Image Removed',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove image',
        });
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.profileService.uploadFile(file).subscribe({
        next: (downloadURL) => {
          this.projectImgUrl = downloadURL;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to upload image',
          });
        },
      });
    }
  }
}
