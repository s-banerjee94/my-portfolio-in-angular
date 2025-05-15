import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExternalLink, LucideAngularModule, Github } from 'lucide-angular';

import { ChipModule } from 'primeng/chip';
import { ProfileService } from '../services/profile-service.service';

@Component({
  selector: 'app-project-section',
  imports: [CommonModule, ChipModule, LucideAngularModule],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent implements OnInit {
  readonly ExternalLink = ExternalLink;
  readonly Github = Github;
  projects: any[] = [];

  private profileService: ProfileService = inject(ProfileService);

  ngOnInit(): void {
    this.profileService.getAllProjects().subscribe((projects) => {
      this.projects = projects;
    });
  }
}
