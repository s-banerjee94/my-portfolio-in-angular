import { Component } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import {
  LucideAngularModule,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
} from 'lucide-angular';

@Component({
  selector: 'app-hero-section',
  imports: [ButtonModule, LucideAngularModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
  readonly ArrowRight = ArrowRight;
  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Mail = Mail;
}
