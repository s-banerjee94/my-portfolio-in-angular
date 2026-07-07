import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  LucideCloud,
  LucideDatabase,
  LucideDynamicIcon,
  LucideIconInput,
  LucideLayoutDashboard,
  LucideServer,
  LucideWrench,
  LucideZap,
} from '@lucide/angular';

import { ProfileService } from '@core/services/profile-service.service';
import { Service } from '@dashboard/services/services.component';
import { SectionHeaderComponent } from '@shared/section-header.component';
import { RevealDirective } from '@shared/reveal.directive';

@Component({
  selector: 'app-services-section',
  imports: [LucideDynamicIcon, SectionHeaderComponent, RevealDirective],
  templateUrl: './services-section.component.html',
})
export class ServicesSectionComponent implements OnInit {
  services: Service[] = [];

  private readonly icons: Record<string, LucideIconInput> = {
    server: LucideServer,
    layout: LucideLayoutDashboard,
    cloud: LucideCloud,
    database: LucideDatabase,
    wrench: LucideWrench,
    zap: LucideZap,
  };

  private profileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.profileService
      .getSectionData<{ services?: Service[] }>('services')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.services = data?.services ?? [];
        },
        error: () => {
          // Section simply stays hidden when the doc can't be loaded.
        },
      });
  }

  iconFor(name: string): LucideIconInput {
    return this.icons[name] ?? LucideServer;
  }
}
