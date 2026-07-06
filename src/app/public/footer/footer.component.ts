import { Component, OnInit } from '@angular/core';

import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  socials: MenuItem[] | undefined;
  currentYear: number = new Date().getFullYear();

  ngOnInit() {
    this.socials = [
      {
        label: 'github',
        url: 'https://github.com/s-banerjee94',
      },
      {
        label: 'linkedin',
        url: 'https://www.linkedin.com/in/connect2sandy/',
      },
    ];
  }
}
