import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../services/profile-service.service';

export interface Hero {
  name: string;
  professionalTitle: string;
  description: string;
  statusBadge: string;
  heroImgUrl: string;
  githubUrl: string;
  linkedInUrl: string;
  email: string;
}

@Component({
  selector: 'app-hero',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    FloatLabel,
    TextareaModule,
    ToastModule,
    CardModule,
    ButtonModule,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  providers: [MessageService],
})
export class HeroComponent implements OnInit {
  hero: Hero = {
    name: '',
    professionalTitle: '',
    description: '',
    statusBadge: '',
    heroImgUrl: '',
    githubUrl: '',
    linkedInUrl: '',
    email: '',
  };

  private profileSevice: ProfileService = inject(ProfileService);

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.profileSevice.getSectionData('hero').subscribe({
      next: (data) => {
        if (data.exists()) {
          const heroData = data.data() as Hero;
          this.hero = heroData;
        }
      },
      error: (err) => {
        // to do add toast
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.profileSevice.uploadFile(file).subscribe({
        next: (downloadURL) => {
          this.hero.heroImgUrl = downloadURL;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Image Uploaded',
          });
        },
        error: (err) => {},
      });
    }
  }

  removeImage(): void {
    this.profileSevice.deleteFile(this.hero.heroImgUrl).subscribe({
      next: () => {
        this.hero.heroImgUrl = '';
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

  saveHeroDetails(): void {
    this.profileSevice.saveSectionData('hero', this.hero).subscribe(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Content Updated',
      });
    });
  }
}
