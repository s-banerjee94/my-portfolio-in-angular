import { Component, inject, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { ProfileService } from '@core/services/profile-service.service';
import { Hero } from '@dashboard/hero/hero.component';

import { Router } from '@angular/router';
import { ApiStatusCardComponent } from './api-status-card/api-status-card.component';

@Component({
  selector: 'app-hero-section',
  imports: [ButtonModule, ApiStatusCardComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent implements OnInit {
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
  loading = true;
  private profileSevice: ProfileService = inject(ProfileService);

  private router: Router = inject(Router);

  ngOnInit(): void {
    this.profileSevice.getSectionData('hero').subscribe({
      next: (data) => {
        if (data.exists()) {
          this.heroData = data.data() as Hero;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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
