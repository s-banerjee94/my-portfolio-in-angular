import {Component} from '@angular/core';

import {TabsModule} from 'primeng/tabs';
import {MenubarModule} from 'primeng/menubar';
import {ButtonModule} from 'primeng/button';

import {HeroComponent} from '../hero/hero.component';
import {AboutComponent} from '../about/about.component';
import {ContactComponent} from '../contact/contact.component';
import {ProjectComponent} from '../project/project.component';
import {ExperienceComponent} from '../experience/experience.component';

@Component({
  selector: 'app-edit-content',
  imports: [
    TabsModule,
    HeroComponent,
    AboutComponent,
    ProjectComponent,
    ContactComponent,
    MenubarModule,
    ButtonModule,
    ExperienceComponent,
  ],
  templateUrl: './edit-content.component.html',
  styleUrl: './edit-content.component.css',
})
export class EditContentComponent {
}
