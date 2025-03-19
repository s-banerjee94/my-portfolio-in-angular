import { Component } from '@angular/core';

import {
  LucideAngularModule,
  Briefcase,
  GraduationCap,
  Award,
} from 'lucide-angular';

@Component({
  selector: 'app-about-section',
  imports: [LucideAngularModule],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.css',
})
export class AboutSectionComponent {
  readonly Briefcase = Briefcase;
  readonly GraduationCap = GraduationCap;
  readonly Award = Award;

  skills = [
    'HTML',
    'CSS',
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Express',
    'MongoDB',
    'MySQL',
    'AWS',
    'Firebase',
    'Git',
    'Redux',
    'Next.js',
    'TailwindCSS',
    'GraphQL',
    'Docker',
    'Jest',
  ];
}
