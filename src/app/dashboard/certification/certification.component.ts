import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Timestamp } from '@angular/fire/firestore';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { SelectButton } from 'primeng/selectbutton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '@core/services/toast.service';
import { DatePipe } from '@angular/common';

import { ProfileService } from '@core/services/profile-service.service';

export interface Certification {
  id?: string;
  name: string;
  issuer: string;
  type: 'certification' | 'course';
  issueDate: Date | Timestamp | undefined;
  expiryDate?: Date | Timestamp | null;
  credentialId?: string;
  verifyUrl?: string;
  /** Shown as the large card at the top of the certifications section. */
  featured?: boolean;
  /** Manual position set by drag-to-reorder in the dashboard list. */
  sortOrder?: number;
}

/**
 * Manual order first; certifications never dragged yet (no sortOrder) sort
 * after the ordered ones, newest issue date first.
 */
export function compareCertifications(
  a: Certification,
  b: Certification,
): number {
  const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) {
    return aOrder - bOrder;
  }
  return toMillis(b.issueDate) - toMillis(a.issueDate);
}

function toMillis(date: Date | Timestamp | undefined): number {
  if (!date) return 0;
  return date instanceof Date ? date.getTime() : (date.toMillis?.() ?? 0);
}

@Component({
  selector: 'app-certification',
  imports: [
    FormsModule,
    Button,
    FloatLabel,
    InputText,
    DatePicker,
    SelectButton,
    ToggleSwitch,
    TooltipModule,
    DatePipe,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
  ],
  templateUrl: './certification.component.html',
})
export class CertificationComponent implements OnInit {
  private messageService = inject(ToastService);
  private profileService: ProfileService = inject(ProfileService);

  name = '';
  issuer = '';
  type: 'certification' | 'course' = 'certification';
  issueDate: Date | undefined;
  expiryDate: Date | undefined;
  credentialId = '';
  verifyUrl = '';
  featured = false;

  isEditMode = false;
  currentCertificationId: string | undefined;

  certifications: Certification[] = [];

  readonly typeOptions = [
    { label: 'Certification', value: 'certification' },
    { label: 'Course', value: 'course' },
  ];

  @ViewChild('certificationForm') certificationForm!: NgForm;

  ngOnInit(): void {
    this.profileService.getAllCertifications().subscribe({
      next: (certifications) => {
        this.certifications = ((certifications as Certification[]) || []).sort(
          compareCertifications,
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load certifications',
        });
      },
    });
  }

  /** Featured items render as large spotlight cards — the site caps them at 3. */
  static readonly MAX_FEATURED = 3;

  onSubmit(): void {
    if (this.featured) {
      const otherFeatured = this.certifications.filter(
        (certification) =>
          certification.featured &&
          certification.id !== this.currentCertificationId,
      ).length;
      if (otherFeatured >= CertificationComponent.MAX_FEATURED) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Featured limit reached',
          detail: 'Max 3 featured certifications — unfeature one first.',
        });
        return;
      }
    }

    const certificationData: Certification = {
      name: this.name,
      issuer: this.issuer,
      type: this.type,
      issueDate: this.issueDate,
      expiryDate: this.expiryDate ?? null,
      credentialId: this.credentialId,
      verifyUrl: this.verifyUrl,
      featured: this.featured,
    };

    if (!this.isEditMode) {
      // New entries join the end of the manual order; edits keep their spot
      // (merge write leaves the stored sortOrder untouched).
      certificationData.sortOrder =
        this.certifications.reduce(
          (max, certification) => Math.max(max, certification.sortOrder ?? -1),
          -1,
        ) + 1;
    }

    if (this.isEditMode && this.currentCertificationId) {
      this.profileService
        .updateCertification(this.currentCertificationId, certificationData)
        .subscribe({
          next: () => {
            this.cancelEdit();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Certification updated successfully',
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update certification',
            });
          },
        });
    } else {
      this.profileService.saveCertification(certificationData).subscribe({
        next: () => {
          this.resetForm();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Certification added successfully',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add certification',
          });
        },
      });
    }
  }

  reorderCertifications(event: CdkDragDrop<Certification[]>): void {
    moveItemInArray(
      this.certifications,
      event.previousIndex,
      event.currentIndex,
    );
    const updates = this.certifications
      .map((certification, index) => ({
        id: certification.id!,
        sortOrder: index,
      }))
      .filter(
        (update, index) =>
          this.certifications[index].sortOrder !== update.sortOrder,
      );
    this.certifications.forEach(
      (certification, index) => (certification.sortOrder = index),
    );
    if (!updates.length) {
      return;
    }
    this.profileService.updateCertificationsOrder(updates).subscribe({
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save the new order',
        });
      },
    });
  }

  editCertification(certification: Certification): void {
    this.isEditMode = true;
    this.currentCertificationId = certification.id;

    this.name = certification.name;
    this.issuer = certification.issuer;
    this.type = certification.type || 'certification';
    this.credentialId = certification.credentialId || '';
    this.verifyUrl = certification.verifyUrl || '';
    this.featured = certification.featured || false;
    this.issueDate = certification.issueDate
      ? this.convertToDate(certification.issueDate)
      : undefined;
    this.expiryDate = certification.expiryDate
      ? this.convertToDate(certification.expiryDate)
      : undefined;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCertification(id: string | undefined): void {
    this.profileService.deleteCertification(id!).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Certification deleted successfully',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete certification',
        });
      },
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.currentCertificationId = undefined;
    this.resetForm();
  }

  resetForm(): void {
    this.name = '';
    this.issuer = '';
    this.type = 'certification';
    this.issueDate = undefined;
    this.expiryDate = undefined;
    this.credentialId = '';
    this.verifyUrl = '';
    this.featured = false;
    this.certificationForm.resetForm({ type: 'certification' });
  }

  convertToDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  }
}
