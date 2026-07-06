import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProfileService } from '@core/services/profile-service.service';

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
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
    ToastModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  providers: [MessageService],
})
export class ContactComponent implements OnInit {
  private messageService = inject(MessageService);

  private profileService: ProfileService = inject(ProfileService);
  contactDetails: ContactInfo = {
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
  };

  ngOnInit(): void {
    this.profileService.getSectionData('contact').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.contactDetails = data.data() as ContactInfo;
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
