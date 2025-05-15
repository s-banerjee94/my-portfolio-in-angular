import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';

import { HeaderComponent } from './header/header.component';
import { AboutComponent } from './about/about.component';
import { ProjectComponent } from './project/project.component';
import { ContactComponent } from './contact/contact.component';
import { HeroComponent } from './hero/hero.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    TabsModule,
    HeroComponent,
    AboutComponent,
    ProjectComponent,
    ContactComponent,
    MenubarModule,
    ButtonModule,
    HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
