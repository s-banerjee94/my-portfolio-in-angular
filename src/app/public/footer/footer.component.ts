import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProfileService } from '@core/services/profile-service.service';
import { ContactInfo } from '@dashboard/contact/contact.component';

interface SocialLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  socials: SocialLink[] = [];
  currentYear: number = new Date().getFullYear();

  private profileService = inject(ProfileService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    // Socials come from the same contact doc the CMS edits, so the footer
    // stays in sync with the admin panel instead of being hardcoded.
    this.profileService
      .getSectionData<ContactInfo>('contact')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (!data) {
          this.socials = [];
          return;
        }
        this.socials = [
          { label: 'github', url: data.github },
          { label: 'linkedin', url: data.linkedin },
          { label: 'x', url: data.twitter },
          { label: 'leetcode', url: data.leetcode },
          { label: 'hackerrank', url: data.hackerrank },
        ].filter((link) => !!link.url);
      });
  }
}
