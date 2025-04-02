import { Component } from '@angular/core';

import { TabsModule } from 'primeng/tabs';
import { HeorComponent } from './heor/heor.component';
import { AboutComponent } from './about/about.component';
import { ProjectComponent } from './project/project.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    TabsModule,
    HeorComponent,
    AboutComponent,
    ProjectComponent,
    ContactComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
