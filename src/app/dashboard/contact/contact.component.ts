import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { SplitterModule } from 'primeng/splitter';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ProfileService } from '../../services/profile-service.service';

export interface ContactInfo {
  phone: string;
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
    CardModule,
    SplitterModule,
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
  private profileService: ProfileService = inject(ProfileService);
  contactDetails: ContactInfo = {
    phone: '',
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
  };

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.profileService.getSectionData('contact').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.contactDetails = data.data() as ContactInfo;
        }
      },
      error: (err) => {
        console.error('Error fetching contact details:', err);
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
          console.error('Error saving contact details:', error);
        },
      });
  }
}
