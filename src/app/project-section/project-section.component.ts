import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExternalLink, LucideAngularModule, Github } from 'lucide-angular';

import { ChipModule } from 'primeng/chip';
import { ProfileService } from '../services/profile-service.service';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {Dialog} from 'primeng/dialog';

@Component({
  selector: 'app-project-section',
  imports: [CommonModule, ChipModule, LucideAngularModule, Card, Button, Dialog],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent implements OnInit {
  readonly ExternalLink = ExternalLink;
  readonly Github = Github;
  projects: any[] = [];
  visible: boolean = false;

  private profileService: ProfileService = inject(ProfileService);

  ngOnInit(): void {
    this.profileService.getAllProjects().subscribe((projects) => {
      this.projects = projects;
    });
  }

  showDialog() {
    this.visible = true;
  }
}
