import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { ToastService } from '@core/services/toast.service';

import { ProfileService } from '@core/services/profile-service.service';
import { ContactInfo } from '@dashboard/contact/contact.component';
import { ContactMeService } from '@core/services/contact-me.service';
import { AnalyticsService } from '@core/services/analytics.service';
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
    MessageModule,
    SectionHeaderComponent,
    RevealDirective,
  ],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
})
export class ContactSectionComponent implements OnInit {
  private messageService = inject(ToastService);

  contactInfo: ContactInfo = {
    email: '',
    github: '',
    linkedin: '',
    twitter: '',
    leetcode: '',
    hackerrank: '',
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
  private analytics: AnalyticsService = inject(AnalyticsService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.profileService
      .getSectionData<ContactInfo>('contact')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (data) {
            this.contactInfo = data;
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
        this.analytics.trackEvent('contact_submit');
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
