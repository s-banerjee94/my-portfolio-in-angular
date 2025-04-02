import { Component } from '@angular/core';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { AboutSectionComponent } from '../about-section/about-section.component';
import { ProjectSectionComponent } from '../project-section/project-section.component';
import { ContactSectionComponent } from '../contact-section/contact-section.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home-component',
  imports: [
    ButtonModule,
    HeaderComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ProjectSectionComponent,
    ContactSectionComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
