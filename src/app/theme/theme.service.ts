import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

const DARK_CLASS = 'my-app-dark';
const STORAGE_KEY = 'theme-mode';

/**
 * Owns light/dark mode for the whole app. The dark-mode class name must match
 * `darkModeSelector` in app.config.ts — PrimeNG swaps its token values when
 * that class is present on <html>, and Tailwind's `dark:` variant follows the
 * same class (see @custom-variant in styles.css).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly darkMode = signal<boolean>(this.initialDark());

  constructor() {
    effect(() => {
      const dark = this.darkMode();
      this.document.documentElement.classList.toggle(DARK_CLASS, dark);
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.darkMode.update((dark) => !dark);
  }

  private initialDark(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'dark';
    }
    return (
      this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)')
        .matches ?? false
    );
  }
}
