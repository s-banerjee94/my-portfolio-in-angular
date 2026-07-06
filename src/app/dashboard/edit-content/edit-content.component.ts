import { Component } from '@angular/core';

import { TabsModule } from 'primeng/tabs';

import { HeroComponent } from '../hero/hero.component';
import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';
import { ProjectComponent } from '../project/project.component';
import { ExperienceComponent } from '../experience/experience.component';
import { ResumeComponent } from '../resume/resume.component';
import { CertificationComponent } from '../certification/certification.component';
import { ServicesComponent } from '../services/services.component';
import { SectionHeaderComponent } from '@shared/section-header.component';

@Component({
  selector: 'app-edit-content',
  imports: [
    TabsModule,
    HeroComponent,
    AboutComponent,
    ProjectComponent,
    ContactComponent,
    ExperienceComponent,
    ResumeComponent,
    CertificationComponent,
    ServicesComponent,
    SectionHeaderComponent,
  ],
  templateUrl: './edit-content.component.html',
  styleUrl: './edit-content.component.css',
})
export class EditContentComponent {}
