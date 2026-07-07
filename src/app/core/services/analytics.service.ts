import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

/** Everything the public site records — one doc per visit or interaction. */
export type AnalyticsEvent =
  | 'visit'
  | 'resume_download'
  | 'contact_submit'
  | 'social_github'
  | 'social_linkedin'
  | 'social_email'
  | 'project_source'
  | 'project_live'
  | 'project_details';

export interface Visit {
  id?: string;
  event: AnalyticsEvent;
  /** Parsed origin: 'linkedin', 'google', 'direct', a utm_source value, or a bare domain. */
  source: string;
  /** Raw document.referrer, truncated — kept for debugging the parser. */
  referrer: string;
  path: string;
  device: 'mobile' | 'desktop' | string;
  browser: string;
  language: string;
  timezone: string;
  timestamp: number;
  /** Event context, e.g. the project title behind a project_* event. */
  meta: string;
}

const SESSION_KEY = 'visit-logged';

/**
 * Privacy-light visit tracking: no cookies, no IPs, no fingerprinting —
 * only the referrer the browser already sends plus coarse device info,
 * written once per browser session. Writes are fire-and-forget so a
 * Firestore hiccup can never break the public site, and nothing is
 * recorded while the admin is logged in (so your own edits don't count).
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  readonly collectionName: string = 'visits';

  /** Called once from the public home page. Deduped per browser session. */
  recordVisit(): void {
    if (sessionStorage.getItem(SESSION_KEY)) {
      return;
    }
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    // Small delay: lets Firebase restore an admin login first (so it can be
    // skipped) and skips bots/bounces that leave within the first seconds.
    setTimeout(() => this.write('visit', ''), 2500);
  }

  /** Records an interaction (resume download, social click, ...). */
  trackEvent(event: AnalyticsEvent, meta = ''): void {
    this.write(event, meta);
  }

  /** Admin dashboard: live stream of visits newer than `since` (ms epoch). */
  getVisitsSince(since: number): Observable<Visit[]> {
    const visitsRef = collection(this.firestore, this.collectionName);
    const q = query(
      visitsRef,
      where('timestamp', '>=', since),
      orderBy('timestamp', 'desc'),
    );
    return from(collectionData(q, { idField: 'id' })) as Observable<Visit[]>;
  }

  private write(event: AnalyticsEvent, meta: string): void {
    if (this.auth.currentUser) {
      return; // the admin browsing their own site is not traffic
    }
    const visit: Visit = {
      event,
      source: parseSource(document.referrer),
      referrer: document.referrer.slice(0, 200),
      path: location.pathname.slice(0, 100),
      device: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        ? 'mobile'
        : 'desktop',
      browser: parseBrowser(navigator.userAgent),
      language: (navigator.language || '').slice(0, 20),
      timezone: safeTimezone(),
      timestamp: Date.now(),
      meta: meta.slice(0, 120),
    };
    const visitsRef = collection(this.firestore, this.collectionName);
    addDoc(visitsRef, visit).catch(() => {
      // Analytics must never surface an error to a visitor.
    });
  }
}

function parseSource(referrer: string): string {
  // Links you hand out can carry ?utm_source=... (or ?ref=...) — that beats
  // the referrer, which chat apps and many sites strip.
  const params = new URLSearchParams(location.search);
  const utm = params.get('utm_source') ?? params.get('ref');
  if (utm) {
    return utm.toLowerCase().slice(0, 80);
  }
  if (!referrer) {
    return 'direct';
  }
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (host === location.hostname) {
      return 'direct'; // internal navigation, not a real origin
    }
    if (host.includes('linkedin') || host === 'lnkd.in') return 'linkedin';
    if (host.includes('google')) return 'google';
    if (host.includes('github')) return 'github';
    if (host.includes('twitter') || host === 'x.com' || host === 't.co')
      return 'x';
    if (host.includes('facebook') || host === 'fb.me') return 'facebook';
    if (host.includes('instagram')) return 'instagram';
    if (host.includes('whatsapp')) return 'whatsapp';
    if (host.includes('bing')) return 'bing';
    if (host.includes('duckduckgo')) return 'duckduckgo';
    if (host.includes('naukri')) return 'naukri';
    return host.slice(0, 80);
  } catch {
    return 'direct';
  }
}

function parseBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('OPR/')) return 'opera';
  if (ua.includes('SamsungBrowser')) return 'samsung';
  if (ua.includes('Firefox/')) return 'firefox';
  if (ua.includes('Chrome/')) return 'chrome';
  if (ua.includes('Safari/')) return 'safari';
  return 'other';
}

function safeTimezone(): string {
  try {
    return (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(
      0,
      60,
    );
  } catch {
    return '';
  }
}
