import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ThemeService } from '@core/theme/theme.service';
import { SwUpdateService } from '@core/services/sw-update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // Instantiated here so the saved light/dark preference is applied on every
  // route (login and dashboard render without the header).
  protected readonly themeService = inject(ThemeService);
  // Instantiated here so update/unrecoverable watching starts with the app.
  protected readonly swUpdateService = inject(SwUpdateService);
}
