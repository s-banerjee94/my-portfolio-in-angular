import { inject, Injectable, NgZone } from '@angular/core';

import { environment } from '../../../env/environment';
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
  | 'project_details'
  | 'section_view'
  | 'session_end';

/** Public page sections in scroll order — the dashboard funnel follows this. */
export const PAGE_SECTIONS = [
  'home',
  'about',
  'services',
  'experience',
  'projects',
  'certifications',
  'contact',
] as const;

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
  /** Random id from localStorage — ties one browser's visits together. Absent on pre-2026-07 docs. */
  visitorId?: string;
  /** True when the visitor id predates this session — a returning browser. */
  returning?: boolean;
  /** session_end only: seconds between the visit and leaving the tab. */
  duration?: number;
  /** session_end only: deepest scroll reached, 0–100% of the page. */
  scrollDepth?: number;
  /** The visitor's local wall-clock time with offset — raw docs stay readable. */
  time?: string;
  /** One human sentence describing the event, for reading docs without the schema. */
  summary?: string;
}

const SESSION_KEY = 'visit-logged';
const SECTIONS_KEY = 'sections-viewed';
const VISITOR_KEY = 'visitor-id';
/** Remembers within a session whether VISITOR_KEY was freshly minted. */
const VISITOR_NEW_KEY = 'visitor-new';
/** Set once the visit event was actually dispatched (not just scheduled). */
const VISIT_SENT_KEY = 'visit-sent';
/** Set once this session's session_end beacon has gone out. */
const SESSION_END_KEY = 'session-ended';

/**
 * Privacy-light visit tracking: no cookies, no IPs, no fingerprinting —
 * only the referrer the browser already sends plus coarse device info,
 * written once per browser session. The one piece of persistent state is
 * a random id in localStorage that tells returning browsers apart; it
 * links visits to each other, never to a person. Writes are
 * fire-and-forget so a Firestore hiccup can never break the public site,
 * and nothing is recorded while the admin is logged in (so your own
 * edits don't count).
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private zone = inject(NgZone);
  readonly collectionName: string = 'visits';

  /** Called once from the public home page. Deduped per browser session. */
  recordVisit(): void {
    if (sessionStorage.getItem(SESSION_KEY)) {
      return;
    }
    sessionStorage.setItem(SESSION_KEY, String(Date.now()));
    // Small delay: lets Firebase restore an admin login first (so it can be
    // skipped) and skips bots/bounces that leave within the first seconds.
    setTimeout(() => {
      sessionStorage.setItem(VISIT_SENT_KEY, '1');
      this.write('visit', '');
    }, 2500);
  }

  /** Records an interaction (resume download, social click, ...). */
  trackEvent(event: AnalyticsEvent, meta = ''): void {
    this.write(event, meta);
  }

  /**
   * Records one `section_view` per section per session, the first time it
   * stays meaningfully visible for a second. Starts after the same 2.5s
   * bot/bounce delay as recordVisit so "% of visitors" stays an honest ratio.
   */
  observeSections(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const seen = readSeenSections();
    const pending = new Set<string>(
      PAGE_SECTIONS.filter((id) => !seen.has(id)),
    );
    if (!pending.size) {
      return;
    }
    // Outside the zone: scroll-driven callbacks shouldn't run change detection.
    this.zone.runOutsideAngular(() => {
      const dwellTimers = new Map<string, number>();
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).id;
            // Tall sections can never reach a 50% ratio, so "fills 40% of
            // the viewport" also counts as seen.
            const visible =
              entry.intersectionRatio >= 0.5 ||
              entry.intersectionRect.height >= window.innerHeight * 0.4;
            const timer = dwellTimers.get(id);
            if (visible && timer === undefined) {
              dwellTimers.set(
                id,
                window.setTimeout(() => {
                  observer.unobserve(entry.target);
                  seen.add(id);
                  sessionStorage.setItem(
                    SECTIONS_KEY,
                    JSON.stringify([...seen]),
                  );
                  this.write('section_view', id);
                }, 1000),
              );
            } else if (!visible && timer !== undefined) {
              clearTimeout(timer);
              dwellTimers.delete(id);
            }
          }
        },
        // Steps every 10%, so the viewport-fill check above gets evaluated
        // while a tall section scrolls through.
        { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] },
      );
      // Some sections render only after their Firestore data lands (@if
      // wrappers) — retry a few times instead of silently dropping them.
      let attempts = 0;
      const attach = () => {
        for (const id of [...pending]) {
          const element = document.getElementById(id);
          if (element) {
            observer.observe(element);
            pending.delete(id);
          }
        }
        if (pending.size && ++attempts < 4) {
          setTimeout(attach, 2000);
        }
      };
      setTimeout(attach, 2500);
    });
  }

  /**
   * Records one `session_end` per session when the tab is hidden or closed:
   * seconds on site, deepest scroll %, and the section on screen at exit.
   * The Firestore SDK can't write during unload, so this goes out as a
   * keepalive fetch straight to the Firestore REST endpoint — same doc
   * shape, same security rules.
   */
  trackSessionEnd(): void {
    this.zone.runOutsideAngular(() => {
      let maxScroll = 0;
      const measure = () => {
        const height = document.documentElement.scrollHeight || 1;
        const seen = Math.min(
          100,
          Math.round(((window.scrollY + window.innerHeight) / height) * 100),
        );
        maxScroll = Math.max(maxScroll, seen);
      };
      window.addEventListener('scroll', measure, { passive: true });

      const finish = () => {
        if (document.visibilityState !== 'hidden') {
          return;
        }
        // Once per session — the first hide wins; and only for sessions
        // whose visit event went out, so dashboard ratios stay honest.
        if (
          sessionStorage.getItem(SESSION_END_KEY) ||
          !sessionStorage.getItem(VISIT_SENT_KEY) ||
          this.auth.currentUser
        ) {
          return;
        }
        const started = Number(sessionStorage.getItem(SESSION_KEY));
        if (!started) {
          return;
        }
        sessionStorage.setItem(SESSION_END_KEY, '1');
        measure();
        const visitor = visitorInfo();
        const seconds = Math.min(
          86400,
          Math.max(0, Math.round((Date.now() - started) / 1000)),
        );
        const host = environment.useEmulators
          ? 'http://localhost:8081'
          : 'https://firestore.googleapis.com';
        const projectId = environment.firebase.projectId;
        const body = JSON.stringify({
          fields: {
            event: { stringValue: 'session_end' },
            source: { stringValue: parseSource(document.referrer) },
            referrer: { stringValue: document.referrer.slice(0, 200) },
            path: { stringValue: location.pathname.slice(0, 100) },
            device: {
              stringValue: /Android|iPhone|iPad|iPod|Mobile/i.test(
                navigator.userAgent,
              )
                ? 'mobile'
                : 'desktop',
            },
            browser: { stringValue: parseBrowser(navigator.userAgent) },
            language: { stringValue: (navigator.language || '').slice(0, 20) },
            timezone: { stringValue: safeTimezone() },
            timestamp: { integerValue: String(Date.now()) },
            meta: { stringValue: exitSection() },
            visitorId: { stringValue: visitor.id },
            returning: { booleanValue: visitor.returning },
            duration: { integerValue: String(seconds) },
            scrollDepth: { integerValue: String(maxScroll) },
            time: { stringValue: isoLocal(new Date()) },
            summary: {
              stringValue: summarize(
                'session_end',
                exitSection(),
                visitor.returning,
                seconds,
                maxScroll,
              ),
            },
          },
        });
        fetch(
          `${host}/v1/projects/${projectId}/databases/(default)/documents/${this.collectionName}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
          },
        ).catch(() => {
          // Analytics must never surface an error to a visitor.
        });
      };
      document.addEventListener('visibilitychange', finish);
      window.addEventListener('pagehide', finish);
    });
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
    const visitor = visitorInfo();
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
      visitorId: visitor.id,
      returning: visitor.returning,
      time: isoLocal(new Date()),
      summary: summarize(event, meta.slice(0, 120), visitor.returning),
    };
    const visitsRef = collection(this.firestore, this.collectionName);
    addDoc(visitsRef, visit).catch(() => {
      // Analytics must never surface an error to a visitor.
    });
  }
}

/**
 * The visitor id and whether it predates this session. "New" is decided the
 * moment the id is minted and pinned in sessionStorage, so every event of
 * that first session agrees, and every later session counts as returning.
 */
function visitorInfo(): { id: string; returning: boolean } {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        crypto.randomUUID?.() ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, id);
      sessionStorage.setItem(VISITOR_NEW_KEY, 'yes');
      return { id, returning: false };
    }
    if (!sessionStorage.getItem(VISITOR_NEW_KEY)) {
      sessionStorage.setItem(VISITOR_NEW_KEY, 'no');
    }
    return { id, returning: sessionStorage.getItem(VISITOR_NEW_KEY) === 'no' };
  } catch {
    // Storage can be blocked (private mode) — record the visit anonymously.
    return { id: '', returning: false };
  }
}

/** The visitor's local time with UTC offset, e.g. 2026-07-08T18:23:41+05:30. */
function isoLocal(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(Math.abs(offsetMinutes) % 60)}`
  );
}

/** One plain-language sentence per doc, so raw JSON reads without the schema. */
function summarize(
  event: AnalyticsEvent,
  meta: string,
  returning: boolean,
  duration?: number,
  scrollDepth?: number,
): string {
  switch (event) {
    case 'visit':
      return returning ? 'returning visitor arrived' : 'new visitor arrived';
    case 'section_view':
      return `viewed the ${meta} section`;
    case 'session_end':
      return `left from ${meta || 'unknown section'} after ${duration ?? 0}s, scrolled ${scrollDepth ?? 0}% of the page`;
    case 'resume_download':
      return 'downloaded the resume';
    case 'contact_submit':
      return 'sent a message via the contact form';
    case 'project_details':
      return `opened project details: ${meta}`;
    case 'project_live':
      return `opened live demo of: ${meta}`;
    case 'project_source':
      return `opened source code of: ${meta}`;
    case 'social_github':
      return 'clicked the GitHub profile link';
    case 'social_linkedin':
      return 'clicked the LinkedIn profile link';
    case 'social_email':
      return 'clicked the email link';
  }
}

/** The section under the viewport's midline — where the visitor was when they left. */
function exitSection(): string {
  const midline = window.innerHeight / 2;
  for (const id of PAGE_SECTIONS) {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    if (rect && rect.top <= midline && rect.bottom >= midline) {
      return id;
    }
  }
  return '';
}

function readSeenSections(): Set<string> {
  try {
    const stored = JSON.parse(sessionStorage.getItem(SECTIONS_KEY) ?? '[]');
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
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
