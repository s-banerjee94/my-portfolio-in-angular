import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { LucideAngularModule, Mail, MapPin, Phone } from 'lucide-angular';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';

import { ProfileService } from '@core/services/profile-service.service';
import { ContactInfo } from '@dashboard/contact/contact.component';
import { ContaceMeService } from '@core/services/contace-me.service';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-contact-section',
  imports: [
    LucideAngularModule,
    FormsModule,
    InputTextModule,
    FloatLabel,
    TextareaModule,
    ButtonModule,
    ToastModule,
    MessageModule,
    Card,
  ],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
  providers: [MessageService],
})
export class ContactSectionComponent implements OnInit {
  private messageService = inject(MessageService);

  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;

  contactInfo: ContactInfo = {
    phone: '',
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

  private profileService: ProfileService = inject(ProfileService);
  private contaceMeService: ContaceMeService = inject(ContaceMeService);

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
    if (form.invalid) {
      return;
    }
    const message = {
      name: this.yourName,
      email: this.yourEmail,
      subject: this.subject,
      message: this.message,
    };

    this.contaceMeService.saveMessage(message).subscribe({
      next: (data) => {
        console.log('Message saved successfully:', data);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Message sent successfully',
        });
        form.resetForm();
      },
      error: (err) => {
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
