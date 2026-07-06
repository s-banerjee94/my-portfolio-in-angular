import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Card } from 'primeng/card';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Timestamp } from '@angular/fire/firestore';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { ProfileService } from '@core/services/profile-service.service';
import { Avatar } from 'primeng/avatar';
import { Panel } from 'primeng/panel';
import { DatePipe } from '@angular/common';
import { ColorPicker } from 'primeng/colorpicker';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

export interface Experience {
  id?: string;
  companyName: string;
  jobProfile: string;
  color: string;
  startDate: Date | Timestamp | undefined;
  endDate: Date | Timestamp | undefined;
  description: string;
}

@Component({
  selector: 'app-experience',
  imports: [
    Card,
    FormsModule,
    DatePicker,
    Button,
    FloatLabel,
    InputText,
    Textarea,
    Avatar,
    Panel,
    DatePipe,
    ColorPicker,
    Toast,
  ],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css',
  providers: [MessageService],
})
export class ExperienceComponent implements OnInit {
  private messageService = inject(MessageService);

  startDate: Date | undefined;
  endDate: Date | undefined;
  companyName: string = '';
  description: string = '';
  color: string = '';
  jobProfile: string = '';

  isEditMode: boolean = false;
  currentExperienceId: string | undefined;

  experiences: Experience[] | undefined;

  @ViewChild('experienceForm') experienceForm!: NgForm;
  private profileService: ProfileService = inject(ProfileService);

  ngOnInit() {
    this.profileService.getAllExperiences().subscribe({
      next: (experiences) => {
        this.experiences = (experiences as Experience[]) || [];
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load experiences',
        });
      },
    });
  }

  onSubmit() {
    const experienceData: Experience = {
      companyName: this.companyName,
      jobProfile: this.jobProfile,
      startDate: this.startDate,
      endDate: this.endDate,
      description: this.description,
      color: this.color,
    };

    if (this.isEditMode && this.currentExperienceId) {
      this.profileService
        .updateExperience(this.currentExperienceId, experienceData)
        .subscribe({
          next: (response) => {
            this.resetForm();
            this.isEditMode = false;
            this.currentExperienceId = undefined;
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Experience updated successfully',
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update experience',
            });
          },
        });
    } else {
      this.profileService.saveExperience(experienceData).subscribe({
        next: (response) => {
          this.resetForm();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Experience added successfully',
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add experience',
          });
        },
      });
    }
  }

  convertToDate(timestamp: any): Date {
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

  deleteExp(id: string | undefined) {
    this.profileService.deleteExperience(id!).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Experience deleted successfully',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete experience',
        });
      },
    });
  }

  editExp(experience: Experience) {
    this.isEditMode = true;
    this.currentExperienceId = experience.id;

    this.companyName = experience.companyName;
    this.jobProfile = experience.jobProfile;
    this.description = experience.description;
    this.color = experience.color;

    if (experience.startDate) {
      this.startDate = this.convertToDate(experience.startDate);
    }
    if (experience.endDate) {
      this.endDate = this.convertToDate(experience.endDate);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.currentExperienceId = undefined;
    this.resetForm();
  }

  resetForm() {
    this.companyName = '';
    this.jobProfile = '';
    this.description = '';
    this.color = '';
    this.startDate = undefined;
    this.endDate = undefined;
    this.experienceForm.resetForm();
  }
}
