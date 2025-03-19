import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExternalLink, LucideAngularModule, Github } from 'lucide-angular';

import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-project-section',
  imports: [CommonModule, ChipModule, LucideAngularModule],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent {
  readonly ExternalLink = ExternalLink;
  readonly Github = Github;
  projects = [
    {
      title: 'E-Commerce Platform',
      description:
        'A full-featured e-commerce platform with product management, cart functionality, and payment integration.',
      image: 'bg-blue-100',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      githubLink: '#',
      liveLink: '#',
    },
    {
      title: 'Task Management App',
      description:
        'A collaborative task management application with real-time updates and team collaboration features.',
      image: 'bg-green-100',
      tags: ['React', 'Firebase', 'Redux', 'Tailwind'],
      githubLink: '#',
      liveLink: '#',
    },
    {
      title: 'Health Tracking Dashboard',
      description:
        'A comprehensive dashboard for tracking health metrics with data visualization and progress reports.',
      image: 'bg-amber-100',
      tags: ['TypeScript', 'Chart.js', 'Express', 'MongoDB'],
      githubLink: '#',
      liveLink: '#',
    },
    {
      title: 'Real Estate Finder',
      description:
        'A property listing platform with advanced search filters and map integration for finding real estate.',
      image: 'bg-purple-100',
      tags: ['Next.js', 'Google Maps API', 'Prisma', 'PostgreSQL'],
      githubLink: '#',
      liveLink: '#',
    },
  ];
}
