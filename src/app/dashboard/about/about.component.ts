import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { EditorModule } from 'primeng/editor';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../services/profile-service.service';

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
    CommonModule,
    FormsModule,
    CardModule,
    EditorModule,
    FloatLabel,
    InputTextModule,
    ChipModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  providers: [MessageService],
})
export class AboutComponent implements OnInit {
  textAbout = '';
  experience = '';
  education = '';
  certification = '';
  enteredSkill = '';
  skills: string[] = [];
  isEditorReady = false;
  private profileSevice: ProfileService = inject(ProfileService);

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.profileSevice.getSectionData('about').subscribe({
      next: (data) => {
        if (data.exists()) {
          const aboutData = data.data() as any;
          this.textAbout = aboutData.textAbout || '';
          this.experience = aboutData.experience || '';
          this.education = aboutData.education || '';
          this.certification = aboutData.certification || '';
          this.skills = aboutData.skills || [];
          this.isEditorReady = true;
        }
      },
      error: (err) => {
        // to do add toast
      },
    });
  }

  addSkill(): void {
    const skill = this.enteredSkill.trim();
    if (skill && !this.skills.includes(skill)) {
      this.skills.push(skill);
      this.enteredSkill = '';
    }
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter((s) => s !== skill);
  }

  saveAboutDetails(): void {
    const aboutData = {
      text: this.textAbout,
      experience: this.experience,
      education: this.education,
      certification: this.certification,
      skills: this.skills,
    };
    this.profileSevice.saveSectionData('about', aboutData).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Content Updated',
      });
    });
  }
}
