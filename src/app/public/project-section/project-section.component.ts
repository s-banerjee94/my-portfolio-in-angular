import { Component, inject, OnInit, signal } from '@angular/core';

import { ExternalLink, Folder, Github, LucideAngularModule } from 'lucide-angular';

import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';

import { ProfileService } from '@core/services/profile-service.service';
import { GithubReadmeService } from '@core/services/github-readme.service';
import { Project } from '@dashboard/project/add-edit-project/add-edit-project.component';
import { SectionHeaderComponent } from '@shared/section-header.component';
import { RevealDirective } from '@shared/reveal.directive';

@Component({
  selector: 'app-project-section',
  imports: [
    LucideAngularModule,
    Dialog,
    TabsModule,
    SectionHeaderComponent,
    RevealDirective,
  ],
  templateUrl: './project-section.component.html',
  styleUrl: './project-section.component.css',
})
export class ProjectSectionComponent implements OnInit {
  readonly ExternalLink = ExternalLink;
  readonly Github = Github;
  readonly Folder = Folder;

  featured: Project | undefined;
  others: Project[] = [];

  protected readonly dialogVisible = signal(false);
  protected readonly selected = signal<Project | undefined>(undefined);
  protected readonly activeTab = signal<'overview' | 'readme'>('overview');
  protected readonly readmeHtml = signal('');
  protected readonly readmeState = signal<'idle' | 'loading' | 'error'>('idle');

  private profileService = inject(ProfileService);
  private readmeService = inject(GithubReadmeService);

  ngOnInit(): void {
    this.profileService.getAllProjects().subscribe((projects) => {
      const all = projects as Project[];
      // One featured project leads the section; ties go to the newest
      // (the list arrives ordered by projectDate desc).
      this.featured = all.find((project) => project.featured) ?? all[0];
      this.others = all.filter((project) => project !== this.featured);
    });
  }

  openDetails(project: Project): void {
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
