import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { EditorModule } from 'primeng/editor';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../services/profile-service.service';
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
    CardModule,
    EditorModule,
    FloatLabel,
    InputTextModule,
    ChipModule,
    ButtonModule,
    ToastModule,
    Message,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  providers: [MessageService],
})
export class AboutComponent implements OnInit {
  private messageService = inject(MessageService);

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

  ngOnInit() {
    this.profileService.getSectionData('about').subscribe({
      next: (data) => {
        if (data.exists()) {
          const aboutData = data.data() as any;
          this.formData.text = aboutData.text || '';
          this.formData.experience = aboutData.experience || '';
          this.formData.education = aboutData.education || '';
          this.formData.certification = aboutData.certification || '';
          this.formData.skills = aboutData.skills || [];
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

    const aboutData = {
      text: this.formData.text,
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
