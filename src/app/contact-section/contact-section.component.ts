import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule, Mail } from 'lucide-angular';

@Component({
  selector: 'app-contact-section',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css',
})
export class ContactSectionComponent {
  readonly Mail = Mail;
}
