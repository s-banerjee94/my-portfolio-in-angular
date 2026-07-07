import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '@core/services/toast.service';

import { ProfileService } from '@core/services/profile-service.service';

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  leetcode: string;
  hackerrank: string;
}

@Component({
  selector: 'app-contact',
  imports: [
    FormsModule,
    FloatLabel,
    InputText,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  private messageService = inject(ToastService);

  private profileService: ProfileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);
  contactDetails: ContactInfo = {
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    leetcode: '',
    hackerrank: '',
  };

  ngOnInit(): void {
    this.profileService
      .getSectionData<ContactInfo>('contact')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (data) {
            this.contactDetails = data;
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load contact details',
          });
        },
      });
  }

  saveContactDetails() {
    this.profileService
      .saveSectionData('contact', this.contactDetails)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Contact details updated',
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save contact details',
          });
        },
      });
  }
}
