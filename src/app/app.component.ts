import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Instantiated here so the saved light/dark preference is applied on every
  // route (login and dashboard render without the header).
  protected readonly themeService = inject(ThemeService);
}
