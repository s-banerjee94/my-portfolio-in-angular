import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { ProfileService } from '@core/services/profile-service.service';
import { ContactInfo } from '@dashboard/contact/contact.component';
import { ContactMeService } from '@core/services/contact-me.service';
import { SectionHeaderComponent } from '@shared/section-header.component';
import { RevealDirective } from '@shared/reveal.directive';

@Component({
  selector: 'app-contact-section',
  imports: [
    FormsModule,
    InputTextModule,
    FloatLabel,
    TextareaModule,
    ButtonModule,
    ToastModule,
    MessageModule,
    SectionHeaderComponent,
    RevealDirective,
  ],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
  providers: [MessageService],
})
export class ContactSectionComponent implements OnInit {
  private messageService = inject(MessageService);

  contactInfo: ContactInfo = {
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
  };

  yourName: string = '';
  yourEmail: string = '';
  subject: string = '';
  message: string = '';
  /** Honeypot — visually hidden field; humans leave it empty, bots fill it. */
  company: string = '';
  sending = false;

  private profileService: ProfileService = inject(ProfileService);
  private contactMeService: ContactMeService = inject(ContactMeService);

  ngOnInit(): void {
    this.profileService.getSectionData('contact').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.contactInfo = data.data() as ContactInfo;
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load contact information',
        });
      },
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid || this.sending) {
      return;
    }
    // Bot filled the honeypot: pretend success, write nothing.
    if (this.company) {
      form.resetForm();
      return;
    }
    const message = {
      name: this.yourName,
      email: this.yourEmail,
      subject: this.subject,
      message: this.message,
    };

    this.sending = true;
    this.contactMeService.saveMessage(message).subscribe({
      next: () => {
        this.sending = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Message sent successfully',
        });
        form.resetForm();
      },
      error: (err) => {
        this.sending = false;
        console.error('Error saving message:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send message',
        });
      },
    });
  }
}
