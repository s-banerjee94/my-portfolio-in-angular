import { Component, inject, OnInit, signal } from '@angular/core';

import { LucideExternalLink, LucideFolder } from '@lucide/angular';

import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';

import { ProfileService } from '@core/services/profile-service.service';
import { GithubReadmeService } from '@core/services/github-readme.service';
import {
  AnalyticsService,
  AnalyticsEvent,
} from '@core/services/analytics.service';
import { Project } from '@dashboard/project/add-edit-project/add-edit-project.component';
import { SectionHeaderComponent } from '@shared/section-header.component';
import { RevealDirective } from '@shared/reveal.directive';

@Component({
  selector: 'app-project-section',
  imports: [
    LucideExternalLink,
    LucideFolder,
    Dialog,
    TabsModule,
    SectionHeaderComponent,
    RevealDirective,
  ],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent implements OnInit {
  featured: Project[] = [];
  others: Project[] = [];
  loading = true;

  protected readonly dialogVisible = signal(false);
  protected readonly selected = signal<Project | undefined>(undefined);
  protected readonly activeTab = signal<'overview' | 'readme'>('overview');
  protected readonly readmeHtml = signal('');
  protected readonly readmeState = signal<'idle' | 'loading' | 'error'>('idle');
  protected readonly failedImgIds = new Set<string>();

  private profileService = inject(ProfileService);
  private readmeService = inject(GithubReadmeService);
  private analytics = inject(AnalyticsService);

  ngOnInit(): void {
    this.profileService.getAllProjects().subscribe({
      next: (projects) => {
        const all = projects as Project[];
        // Up to 3 featured projects lead the section (the dashboard enforces the
        // cap); with none flagged, the newest project takes the spot — the list
        // arrives ordered by projectDate desc.
        const flagged = all.filter((project) => project.featured).slice(0, 3);
        this.featured = flagged.length ? flagged : all.slice(0, 1);
        this.others = all.filter((project) => !this.featured.includes(project));
        this.failedImgIds.clear();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  protected onImgError(project: Project): void {
    this.failedImgIds.add(project.id ?? project.title);
  }

  track(event: AnalyticsEvent, project: Project): void {
    this.analytics.trackEvent(event, project.title);
  }

  openDetails(project: Project): void {
    this.analytics.trackEvent('project_details', project.title);
    this.selected.set(project);
    this.readmeHtml.set('');
    this.readmeState.set('idle');
    const tab = project.detailsSource === 'readme' ? 'readme' : 'overview';
    this.activeTab.set(tab);
    this.dialogVisible.set(true);
    if (tab === 'readme') {
      this.loadReadme();
    }
  }

  onTabChange(value: string | number | undefined): void {
    this.activeTab.set(value === 'readme' ? 'readme' : 'overview');
    if (value === 'readme') {
      this.loadReadme();
    }
  }

  private loadReadme(): void {
    const project = this.selected();
    if (
      !project?.gitHubUrl ||
      this.readmeState() === 'loading' ||
      this.readmeHtml()
    ) {
      return;
    }
    this.readmeState.set('loading');
    this.readmeService.getReadmeHtml(project.gitHubUrl).subscribe({
      next: (html) => {
        this.readmeHtml.set(html);
        this.readmeState.set('idle');
      },
      error: () => this.readmeState.set('error'),
    });
  }
}
