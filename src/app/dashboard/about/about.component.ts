import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';

import { EditorModule } from 'primeng/editor';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '@core/services/toast.service';

import { ProfileService } from '@core/services/profile-service.service';
import { Message } from 'primeng/message';

export interface AboutData {
  text: string;
  experience: string;
  education: string;
  certification: string;
  skills: string[];
}

@Component({
  selector: 'app-about',
  imports: [
    FormsModule,
    EditorModule,
    FloatLabel,
    InputTextModule,
    ChipModule,
    ButtonModule,
    Message,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  private messageService = inject(ToastService);

  @ViewChild('aboutForm') aboutForm!: NgForm;

  formData: AboutData = {
    text: '',
    experience: '',
    education: '',
    certification: '',
    skills: [],
  };

  enteredSkill = '';
  isEditorReady = false;
  private profileService: ProfileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.profileService
      .getSectionData<AboutData>('about')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (data) {
            this.formData.text = data.text || '';
            this.formData.experience = data.experience || '';
            this.formData.education = data.education || '';
            this.formData.certification = data.certification || '';
            this.formData.skills = data.skills || [];
            this.isEditorReady = true;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load about data',
          });
        },
      });
  }

  addSkill(event: Event): void {
    event.preventDefault();
    const skill = this.enteredSkill.trim();
    if (skill && !this.formData.skills.includes(skill)) {
      this.formData.skills.push(skill);
      this.enteredSkill = '';
    }
  }

  removeSkill(skill: string): void {
    this.formData.skills = this.formData.skills.filter((s) => s !== skill);
  }

  saveAboutDetails(): void {
    if (this.aboutForm.invalid) {
      return;
    }

    // Text pasted from chat apps/docs often arrives with every space as a
    // no-break space (&nbsp;), which renders as one unwrappable line on the
    // public site. Normalize them to plain spaces on every save.
    const aboutData = {
      text: this.formData.text
        .replace(/&nbsp;/g, ' ')
        .replace(/[\u00A0\u202F\u2007]/g, ' '),
      experience: this.formData.experience,
      education: this.formData.education,
      certification: this.formData.certification,
      skills: this.formData.skills,
    };

    this.profileService.saveSectionData('about', aboutData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Content Updated',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update content',
        });
      },
    });
  }
}
