import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../services/profile-service.service';
import { Message } from 'primeng/message';

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
    FormsModule,
    InputTextModule,
    FloatLabel,
    TextareaModule,
    ToastModule,
    CardModule,
    ButtonModule,
    Message,
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

  private profileService: ProfileService = inject(ProfileService);
  private isSubmitting: boolean = false;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadHeroData();
  }

  private loadHeroData = () => {
    this.profileService.getSectionData('hero').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.hero = data.data() as Hero;
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load hero data',
        });
      },
    });
  };

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //
  //   if (input.files && input.files.length > 0) {
  //     const file = input.files[0];
  //     if (!file.type.startsWith('image/')) {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Invalid Image Type',
  //       });
  //       return;
  //     }
  //     const maxSizeInMB = 5;
  //     if (file.size > maxSizeInMB * 1024 * 1024) {
  //       this.messageService.add({
  //         severity: 'warn',
  //         summary: 'File Too Large',
  //         detail: `File size must be less than ${maxSizeInMB}MB`,
  //       });
  //       return;
  //     }
  //     this.profileService.uploadFile(file).subscribe({
  //       next: (downloadURL) => {
  //         this.hero.heroImgUrl = downloadURL;
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Success',
  //           detail: 'Image Uploaded',
  //         });
  //       },
  //       error: (err) => {
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Upload Failed',
  //           detail: 'Failed to upload image',
  //         });
  //       },
  //     });
  //   }
  // }
  /*
  removeImage(): void {
    if (!this.hero.heroImgUrl) {
      return;
    }
    this.profileService.deleteFile(this.hero.heroImgUrl).subscribe({
      next: () => {
        this.hero.heroImgUrl = '';
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
*/
  saveHeroDetails(heroForm: NgForm): void {
    console.log(heroForm);
    if (this.isSubmitting) {
      return; // Prevent double submission
    }
    if (heroForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Enter valid details.',
      });
      return;
    }
    this.isSubmitting = true;
    this.profileService.saveSectionData('hero', this.hero).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Hero details saved successfully',
        });
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error saving hero details:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Save Failed',
          detail: 'Failed to save hero details',
        });
        this.isSubmitting = false;
      },
    });
  }

  isDragging = false;
  isUploading = false;
  uploadProgress = 0;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.handleFileUpload(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  triggerFileInput(): void {
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  private handleFileUpload(file: File): void {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid File',
        detail: 'Please select an image file',
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSizeInMB = 5;
    if (file.size > maxSizeInMB * 1024 * 1024) {
      this.messageService.add({
        severity: 'warn',
        summary: 'File Too Large',
        detail: `File size must be less than ${maxSizeInMB}MB`,
      });
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    this.profileService.uploadFile(file).subscribe({
      next: (downloadURL) => {
        this.uploadProgress = 100;

        setTimeout(() => {
          this.hero.heroImgUrl = downloadURL;
          this.isUploading = false;
          this.uploadProgress = 0;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Image uploaded successfully',
          });
        }, 500);
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadProgress = 0;
        console.error('Error uploading file:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'Failed to upload image',
        });
      },
    });
  }
  removeImage(): void {
    if (!this.hero.heroImgUrl) {
      return;
    }

    this.profileService.deleteFile(this.hero.heroImgUrl).subscribe({
      next: () => {
        this.hero.heroImgUrl = '';
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Image removed successfully',
        });
      },
      error: (err) => {
        console.error('Error removing image:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove image',
        });
      },
    });
  }
}
