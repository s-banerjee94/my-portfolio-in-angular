import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastService } from '@core/services/toast.service';

import { ProfileService } from '@core/services/profile-service.service';

export interface Service {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  imports: [
    FormsModule,
    ButtonModule,
    FloatLabel,
    InputTextModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './services.component.html',
})
export class ServicesComponent implements OnInit {
  static readonly MAX_SERVICES = 6;

  readonly maxServices = ServicesComponent.MAX_SERVICES;

  readonly iconOptions = [
    { label: 'Server / APIs', value: 'server' },
    { label: 'Frontend / UI', value: 'layout' },
    { label: 'Cloud', value: 'cloud' },
    { label: 'Database', value: 'database' },
    { label: 'Tooling / Fixes', value: 'wrench' },
    { label: 'Performance', value: 'zap' },
  ];

  services: Service[] = [];

  private messageService = inject(ToastService);
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
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load services',
          });
        },
      });
  }

  addService(): void {
    if (this.services.length >= this.maxServices) {
      return;
    }
    this.services.push({ icon: 'server', title: '', description: '' });
  }

  removeService(index: number): void {
    this.services.splice(index, 1);
  }

  get hasInvalidService(): boolean {
    return this.services.some(
      (service) => !service.title.trim() || !service.description.trim(),
    );
  }

  saveServices(): void {
    this.profileService
      .saveSectionData('services', { services: this.services })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Services updated',
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save services',
          });
        },
      });
  }
}
