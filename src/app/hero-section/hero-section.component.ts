import { Component, inject, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import {
  LucideAngularModule,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
} from 'lucide-angular';
import { ProfileService } from '../services/profile-service.service';
import { Hero } from '../dashboard/hero/hero.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  imports: [CommonModule, ButtonModule, LucideAngularModule],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent implements OnInit {
  readonly ArrowRight = ArrowRight;
  readonly Github = Github;
  readonly Linkedin = Linkedin;
  readonly Mail = Mail;
  heroData: Hero = {
    name: '',
    professionalTitle: '',
    description: '',
    heroImgUrl: '',
    statusBadge: '',
    githubUrl: '',
    linkedInUrl: '',
    email: '',
  };
  private profileSevice: ProfileService = inject(ProfileService);

  private router: Router = inject(Router);

  ngOnInit(): void {
    this.profileSevice.getSectionData('hero').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.heroData = data.data() as Hero;
        }
      },
    });
  }

  navigateToProjects() {
    this.router.navigateByUrl('/#projects');
  }

  navigateToContact() {
    this.router.navigateByUrl('/#contact');
  }
}
