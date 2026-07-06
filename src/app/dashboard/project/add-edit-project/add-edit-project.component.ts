import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormsModule, NgForm } from '@angular/forms';

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
import { ToggleSwitch } from 'primeng/toggleswitch';
import { SelectButton } from 'primeng/selectbutton';
import { EditorModule } from 'primeng/editor';
import { Timestamp } from '@angular/fire/firestore';

export interface Project {
  id?: string;
  title: string;
  description: string;
  gitHubUrl: string;
  liveDemoUrl: string;
  technologies: string[];
  projectImgUrl: string;
  projectDate: Timestamp | Date;
  /** Shown as the large card at the top of the projects section. */
  featured?: boolean;
  /** Rich write-up for the detail dialog (Quill HTML). */
  detailsHtml?: string;
  /** Which detail tab opens first: the write-up or the repo README. */
  detailsSource?: 'custom' | 'readme';
}

@Component({
  selector: 'app-add-edit-project',
  imports: [
    FormsModule,
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
    ToggleSwitch,
    SelectButton,
    EditorModule,
  ],
  templateUrl: './add-edit-project.component.html',
  styleUrl: './add-edit-project.component.css',
  providers: [MessageService],
})
export class AddEditProjectComponent implements OnInit {
  private messageService = inject(MessageService);

  techs: string[] = [];
  enteredTech: string = '';
  projectTitle: string = '';
  description: string = '';
  gitHubUrl: string = '';
  liveDemoUrl: string = '';
  projectId: string = '';
  projectImgUrl: string = '';
  projectDate: Date | null = null;
  featured: boolean = false;
  detailsHtml: string = '';
  detailsSource: 'custom' | 'readme' = 'custom';
  mode: string = '';

  readonly detailsSourceOptions = [
    { label: 'My write-up', value: 'custom' },
    { label: 'GitHub README', value: 'readme' },
  ];

  /** Featured items render as large spotlight cards — the site caps them at 3. */
  static readonly MAX_FEATURED = 3;

  private allProjects: Project[] = [];

  private profileService: ProfileService = inject(ProfileService);
  private communicationService: CommunicationService =
    inject(CommunicationService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.profileService
      .getAllProjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((projects) => {
        this.allProjects = projects as Project[];
      });

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
        this.featured = false;
        this.detailsHtml = '';
        this.detailsSource = 'custom';
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
      this.featured = project!.featured || false;
      this.detailsHtml = project!.detailsHtml || '';
      this.detailsSource = project!.detailsSource || 'custom';
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

  startNew(): void {
    this.communicationService.onProjectClicked({} as Project);
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

    if (this.featured) {
      const otherFeatured = this.allProjects.filter(
        (project) => project.featured && project.id !== this.projectId,
      ).length;
      if (otherFeatured >= AddEditProjectComponent.MAX_FEATURED) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Featured limit reached',
          detail: 'Max 3 featured projects — unfeature one first.',
        });
        return;
      }
    }

    const projectData: Project = {
      title: this.projectTitle,
      description: this.description,
      gitHubUrl: this.gitHubUrl,
      liveDemoUrl: this.liveDemoUrl,
      technologies: this.techs,
      projectImgUrl: this.projectImgUrl,
      projectDate: this.projectDate!,
      featured: this.featured,
      detailsHtml: this.detailsHtml,
      detailsSource: this.detailsSource,
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
    this.featured = false;
    this.detailsHtml = '';
    this.detailsSource = 'custom';

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
