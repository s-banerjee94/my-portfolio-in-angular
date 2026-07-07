import { inject, Injectable } from '@angular/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';

/**
 * App-wide toast facade. There is exactly one `<p-toast>` (in the root
 * component) and one `MessageService` (provided at the root), so every
 * notification in the app flows through here.
 *
 * It also de-duplicates: an identical toast (same severity + summary + detail)
 * fired again while the first is still on screen is swallowed. That stops the
 * "burst of the same error" problem — e.g. a session whose auth token is
 * revoked mid-use, where several in-flight requests all fail with the same
 * message at once.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private messageService = inject(MessageService);

  /** Keys of toasts currently considered "on screen", for de-duplication. */
  private readonly active = new Set<string>();

  /** How long a key is held before an identical toast may show again (ms). */
  private static readonly DEDUPE_WINDOW = 4000;

  /** Core entry point — mirrors MessageService.add, minus the duplicates. */
  add(message: ToastMessageOptions): void {
    const key = this.keyFor(message);
    if (this.active.has(key)) {
      return;
    }
    this.active.add(key);
    this.messageService.add(message);

    const life =
      typeof message.life === 'number'
        ? message.life
        : ToastService.DEDUPE_WINDOW;
    setTimeout(() => this.active.delete(key), life);
  }

  success(detail: string, summary = 'Success'): void {
    this.add({ severity: 'success', summary, detail });
  }

  error(detail: string, summary = 'Error'): void {
    this.add({ severity: 'error', summary, detail });
  }

  info(detail: string, summary = 'Info'): void {
    this.add({ severity: 'info', summary, detail });
  }

  warn(detail: string, summary = 'Warning'): void {
    this.add({ severity: 'warn', summary, detail });
  }

  /** Clear everything on screen — handy on logout / hard auth failures. */
  clear(): void {
    this.messageService.clear();
    this.active.clear();
  }

  private keyFor(message: ToastMessageOptions): string {
    return `${message.severity ?? 'info'}|${message.summary ?? ''}|${message.detail ?? ''}`;
  }
}
