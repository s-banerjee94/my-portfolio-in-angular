import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-header',
  imports: [MenubarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
      },
      {
        label: 'About',
      },
      {
        label: 'Skill',
      },
      {
        label: 'Projects',
      },
      {
        label: 'Contact',
      },
    ];
  }
}
