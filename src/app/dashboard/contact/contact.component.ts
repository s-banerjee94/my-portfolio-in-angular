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

import { ProfileService } from '@core/services/profile-service.service';
import {
  Github,
  Instagram,
  Linkedin,
  LucideAngularModule,
  Mail,
  Phone,
  Twitter,
} from 'lucide-angular';

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
    LucideAngularModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  providers: [MessageService],
})
export class ContactComponent implements OnInit {
  private messageService = inject(MessageService);

  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Instagram = Instagram;
  readonly Phone = Phone;
  readonly Mail = Mail;
  readonly Twitter = Twitter;

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
