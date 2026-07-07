import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '@core/services/toast.service';
import { ProfileService } from '@core/services/profile-service.service';
import { Observable, catchError, of, tap } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { FirebaseDatePipe } from '@shared/pipes/firebase-date.pipe';

export interface Resume {
  id?: string;
  fileName: string;
  fileUrl: string;
  uploadDate: Date | Timestamp;
  isPrimary: boolean;
}

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    FileUploadModule,
    TableModule,
    CheckboxModule,
    TooltipModule,
    FirebaseDatePipe,
  ],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.css',
})
export class ResumeComponent implements OnInit {
  private messageService = inject(ToastService);

  resumes: Resume[] = [];
  maxResumes = 3;
  private profileService: ProfileService = inject(ProfileService);

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    this.profileService
      .getAllResumes()
      .pipe(
        tap((resumes: Resume[]) => {
          this.resumes = resumes;
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load resumes',
          });
          return of([]);
        }),
      )
      .subscribe();
  }

  onFileUpload(event: any): void {
    if (this.resumes.length >= this.maxResumes) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `You can only upload a maximum of ${this.maxResumes} resumes`,
      });
      return;
    }

    const file = event.files[0];
    if (file) {
      this.profileService
        .uploadFile(file)
        .pipe(
          tap((fileUrl) => {
            const newResume: Resume = {
              fileName: file.name,
              fileUrl: fileUrl,
              uploadDate: new Date(),
              isPrimary: this.resumes.length === 0, // Ma
            };
            this.saveResume(newResume);
          }),
          catchError((error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to upload resume',
            });
            return of(null);
          }),
        )
        .subscribe();
    }
  }

  saveResume(resume: Resume): void {
    this.profileService
      .saveResume(resume)
      .pipe(
        tap(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Resume uploaded successfully',
          });
        }),
        catchError((error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save resume',
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  deleteResume(resume: Resume): void {
    if (resume.isPrimary) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'You cannot delete the primary resume',
      });
      return;
    }
    if (resume.id) {
      this.profileService
        .deleteResume(resume.id)
        .pipe(
          tap(() => {
            if (resume.fileUrl) {
              this.profileService.deleteFile(resume.fileUrl).subscribe();
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Resume deleted successfully',
            });
          }),
          catchError((error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete resume',
            });
            return of(null);
          }),
        )
        .subscribe();
    }
  }

  setPrimary(resume: Resume): void {
    if (resume.id) {
      const updates: Observable<any>[] = this.resumes
        .filter((r) => r.isPrimary && r.id !== resume.id)
        .map((r) => {
          return this.profileService.updateResume(r.id!, {
            ...r,
            isPrimary: false,
          });
        });

      updates.push(
        this.profileService.updateResume(resume.id, {
          ...resume,
          isPrimary: true,
        }),
      );

      if (updates.length > 0) {
        this.profileService
          .updateResume(resume.id, { ...resume, isPrimary: true })
          .pipe(
            tap(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Primary resume updated successfully',
              });
            }),
            catchError((error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update primary resume',
              });
              return of(null);
            }),
          )
          .subscribe();
      }
    }
  }
}
