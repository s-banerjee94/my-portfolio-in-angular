import { inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { ToastService } from './toast.service';

/**
 * Watches the Angular service worker for app updates. The service worker
 * serves the cached version for the whole visit and downloads new builds in
 * the background, so without this a visitor never learns a newer version is
 * one refresh away.
 */
@Injectable({ providedIn: 'root' })
export class SwUpdateService {
  private readonly updates = inject(SwUpdate);
  private readonly toast = inject(ToastService);

  constructor() {
    if (!this.updates.isEnabled) {
      return;
    }

    this.updates.versionUpdates
      .pipe(filter((event) => event.type === 'VERSION_READY'))
      .subscribe(() => {
        this.toast.add({
          severity: 'info',
          summary: 'Update available',
          detail: 'Refresh the page to load the latest version of the site.',
          life: 8000,
        });
      });

    // A broken cache state (e.g. files evicted mid-session) can't be repaired
    // in place — a full reload re-fetches everything from the network.
    this.updates.unrecoverable.subscribe(() => location.reload());
  }
}
