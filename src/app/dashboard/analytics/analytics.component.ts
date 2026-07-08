import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import {
  AnalyticsService,
  PAGE_SECTIONS,
  Visit,
} from '@core/services/analytics.service';
import { ThemeService } from '@core/theme/theme.service';
import { SectionHeaderComponent } from '@shared/section-header.component';

const DAY = 24 * 60 * 60 * 1000;
/** The widest range the page offers — everything is loaded once, filters are local. */
const MAX_RANGE_DAYS = 90;
/** Events of one visitor further apart than this belong to separate sessions. */
const SESSION_GAP = 30 * 60 * 1000;

interface SourceRow {
  name: string;
  count: number;
  /** Bar width relative to the biggest source, 0–100. */
  pct: number;
}

/** One visitor session: a browser's events grouped into a readable story. */
interface SessionRow {
  key: string;
  start: number;
  /** First chars of the visitor id — '' for pre-tracking events. */
  tag: string;
  returning: boolean;
  source: string;
  device: string;
  browser: string;
  /** Distinct sections seen during the session. */
  sections: number;
  /** From the session_end beacon; absent when the exit was never captured. */
  duration?: number;
  scrollDepth?: number;
  exit: string;
  hasEnd: boolean;
  /** Clicks that matter — resume/message highlighted, project opens listed. */
  interactions: { label: string; golden: boolean }[];
  events: Visit[];
  legacy: boolean;
}

@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    ChartModule,
    SelectButtonModule,
    TableModule,
    ButtonModule,
    SectionHeaderComponent,
  ],
  templateUrl: './analytics.component.html',
})
export class AnalyticsComponent {
  private analytics = inject(AnalyticsService);
  private themeService = inject(ThemeService);

  protected readonly rangeOptions = [
    { label: '7d', value: 7 },
    { label: '30d', value: 30 },
    { label: '90d', value: 90 },
  ];
  protected readonly rangeDays = signal(30);

  /** One live query for the max range; the range switch only re-filters locally. */
  protected readonly visits = toSignal(
    this.analytics.getVisitsSince(Date.now() - MAX_RANGE_DAYS * DAY),
  );

  private readonly cutoff = computed(() => Date.now() - this.rangeDays() * DAY);

  private readonly inRange = computed(() =>
    (this.visits() ?? []).filter((v) => v.timestamp >= this.cutoff()),
  );

  /** Pure page visits (one per session) — the number the KPIs revolve around. */
  private readonly pageVisits = computed(() =>
    this.inRange().filter((v) => v.event === 'visit'),
  );

  /** Same-length window immediately before the current one, for the trend delta. */
  private readonly prevPageVisits = computed(() => {
    const to = this.cutoff();
    const from = to - this.rangeDays() * DAY;
    return (this.visits() ?? []).filter(
      (v) => v.event === 'visit' && v.timestamp >= from && v.timestamp < to,
    );
  });

  protected readonly visitorCount = computed(() => this.pageVisits().length);

  /**
   * Distinct browsers behind the session count. Docs from before the
   * visitor id existed can't be linked, so each counts as its own visitor —
   * the number converges as old docs age out of the range.
   */
  protected readonly uniqueVisitors = computed(() => {
    const ids = new Set<string>();
    let unlinked = 0;
    for (const v of this.pageVisits()) {
      if (v.visitorId) {
        ids.add(v.visitorId);
      } else {
        unlinked++;
      }
    }
    return ids.size + unlinked;
  });

  /** New vs returning split — only sessions recorded since the visitor id shipped. */
  protected readonly visitorSplit = computed(() => {
    const tracked = this.pageVisits().filter((v) => v.visitorId);
    const returning = tracked.filter((v) => v.returning).length;
    const total = tracked.length;
    return {
      new: total - returning,
      returning,
      returningPct: total ? Math.round((returning / total) * 100) : 0,
      total,
    };
  });

  protected readonly visitorDelta = computed(() => {
    const prev = this.prevPageVisits().length;
    if (prev === 0) return null;
    return Math.round(((this.visitorCount() - prev) / prev) * 100);
  });

  protected readonly resumeDownloads = computed(
    () => this.inRange().filter((v) => v.event === 'resume_download').length,
  );

  protected readonly messagesSent = computed(
    () => this.inRange().filter((v) => v.event === 'contact_submit').length,
  );

  protected readonly topSource = computed(() => this.sources()[0]?.name ?? '—');

  protected readonly sources = computed<SourceRow[]>(() => {
    const counts = countBy(this.pageVisits(), (v) => v.source || 'direct');
    const rows = Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    const max = rows[0]?.count ?? 1;
    for (const row of rows) row.pct = Math.round((row.count / max) * 100);
    return rows;
  });

  protected readonly devices = computed(() => {
    const total = this.pageVisits().length;
    const mobile = this.pageVisits().filter(
      (v) => v.device === 'mobile',
    ).length;
    const pct = total ? Math.round((mobile / total) * 100) : 0;
    return { mobile, desktop: total - mobile, mobilePct: pct };
  });

  protected readonly eventCounts = computed(() => {
    const counts = countBy(
      // section_view and session_end feed their own panels; here they would
      // drown the actual clicks.
      this.inRange().filter(
        (v) =>
          v.event !== 'visit' &&
          v.event !== 'section_view' &&
          v.event !== 'session_end',
      ),
      (v) => v.event,
    );
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  /**
   * Scroll funnel: % of visitors whose session recorded a section_view for
   * each section, in page order. Both event types are deduped per session,
   * so the ratio is honest; capped at 100 for ranges where they drift.
   */
  protected readonly sectionReach = computed(() => {
    const visitors = this.visitorCount();
    const counts = countBy(
      this.inRange().filter((v) => v.event === 'section_view'),
      (v) => v.meta,
    );
    return PAGE_SECTIONS.map((name) => ({
      name,
      count: counts[name] ?? 0,
      pct: visitors
        ? Math.min(100, Math.round(((counts[name] ?? 0) / visitors) * 100))
        : 0,
    }));
  });

  protected readonly hasSectionViews = computed(() =>
    this.inRange().some((v) => v.event === 'section_view'),
  );

  private readonly sessionEnds = computed(() =>
    this.inRange().filter((v) => v.event === 'session_end'),
  );

  /** Time-on-site, scroll depth, and where sessions end — from session_end beacons. */
  protected readonly engagement = computed(() => {
    const ends = this.sessionEnds();
    const durations = ends
      .map((v) => v.duration ?? 0)
      .filter((seconds) => seconds > 0);
    const scrolls = ends.map((v) => v.scrollDepth ?? 0);
    const avg = (nums: number[]) =>
      nums.length
        ? Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length)
        : 0;
    return {
      sessions: ends.length,
      avgDuration: formatSeconds(avg(durations)),
      avgScroll: avg(scrolls),
    };
  });

  /** Last section on screen before leaving, ranked — the page's drop-off map. */
  protected readonly exitPoints = computed<SourceRow[]>(() => {
    const counts = countBy(
      this.sessionEnds().filter((v) => v.meta),
      (v) => v.meta,
    );
    const rows = Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: 0 }))
      .sort((a, b) => b.count - a.count);
    const max = rows[0]?.count ?? 1;
    for (const row of rows) row.pct = Math.round((row.count / max) * 100);
    return rows;
  });

  /**
   * The visitor log: every event grouped into sessions so each visitor's
   * flow reads as one story even when several people browse at once.
   * Events are bucketed by visitor id, split at each `visit` event (and on
   * 30-minute gaps as a safety net). Pre-tracking events can't be linked to
   * a browser, so they're bundled into one legacy row that ages out.
   */
  protected readonly sessions = computed<SessionRow[]>(() => {
    const all = [...(this.visits() ?? [])].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    const byVisitor = new Map<string, Visit[]>();
    const untracked: Visit[] = [];
    for (const visit of all) {
      if (!visit.visitorId) {
        untracked.push(visit);
        continue;
      }
      const list = byVisitor.get(visit.visitorId) ?? [];
      list.push(visit);
      byVisitor.set(visit.visitorId, list);
    }
    const rows: SessionRow[] = [];
    for (const [id, events] of byVisitor) {
      let current: Visit[] = [];
      let prev = 0;
      const flush = () => {
        if (current.length) rows.push(buildSession(id, current));
        current = [];
      };
      for (const event of events) {
        if (
          event.event === 'visit' ||
          (prev && event.timestamp - prev > SESSION_GAP)
        ) {
          flush();
        }
        current.push(event);
        prev = event.timestamp;
      }
      flush();
    }
    if (untracked.length) {
      rows.push(buildLegacyRow(untracked));
    }
    return rows.sort((a, b) => b.start - a.start);
  });

  protected durationLabel(seconds: number | undefined): string {
    return formatSeconds(seconds ?? 0);
  }

  protected readonly chartData = computed(() => {
    const days = this.rangeDays();
    const labels: string[] = [];
    const data: number[] = [];
    const start = startOfDay(Date.now() - (days - 1) * DAY);
    const buckets = new Map<number, number>();
    for (const v of this.pageVisits()) {
      const day = startOfDay(v.timestamp);
      buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    for (let i = 0; i < days; i++) {
      const day = start + i * DAY;
      labels.push(
        new Date(day).toLocaleDateString('en', {
          day: '2-digit',
          month: 'short',
        }),
      );
      data.push(buckets.get(day) ?? 0);
    }
    const primary = primaryColor();
    return {
      labels,
      datasets: [
        {
          label: 'visitors',
          data,
          fill: true,
          tension: 0.4,
          pointRadius: this.rangeDays() === 7 ? 3 : 0,
          borderColor: primary,
          backgroundColor: hexToRgba(primary, 0.14),
        },
      ],
    };
  });

  protected readonly chartOptions = computed(() => {
    const dark = this.themeService.darkMode();
    const grid = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const ticks = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
    return {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: ticks,
            maxTicksLimit: 10,
            font: { family: 'monospace', size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: grid },
          ticks: {
            color: ticks,
            precision: 0,
            font: { family: 'monospace', size: 11 },
          },
        },
      },
    };
  });

  protected eventLabel(visit: Visit): string {
    return visit.event.replace('_', ' ');
  }
}

function countBy(
  visits: Visit[],
  key: (v: Visit) => string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of visits) {
    const k = key(v);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

function buildSession(id: string, events: Visit[]): SessionRow {
  const visit = events.find((e) => e.event === 'visit');
  const end = [...events].reverse().find((e) => e.event === 'session_end');
  const sections = new Set(
    events.filter((e) => e.event === 'section_view').map((e) => e.meta),
  ).size;
  const interactions = events
    .filter((e) => !['visit', 'section_view', 'session_end'].includes(e.event))
    .map((e) => ({
      golden: e.event === 'resume_download' || e.event === 'contact_submit',
      label:
        e.event === 'resume_download'
          ? '⬇ resume'
          : e.event === 'contact_submit'
            ? '✉ message'
            : e.event.replace('_', ' ') + (e.meta ? ` · ${e.meta}` : ''),
    }));
  const first = events[0];
  return {
    key: `${id}-${first.timestamp}`,
    start: first.timestamp,
    tag: id.slice(0, 4),
    returning: visit?.returning ?? first.returning ?? false,
    source: visit?.source || first.source,
    device: first.device,
    browser: first.browser,
    sections,
    duration: end?.duration,
    scrollDepth: end?.scrollDepth,
    exit: end?.meta ?? '',
    hasEnd: !!end,
    interactions,
    events,
    legacy: false,
  };
}

/** Events from before visitor ids existed — one bundle, ages out of the range. */
function buildLegacyRow(events: Visit[]): SessionRow {
  const last = events[events.length - 1];
  return {
    key: 'legacy',
    start: last.timestamp,
    tag: '',
    returning: false,
    source: '',
    device: '',
    browser: '',
    sections: 0,
    exit: '',
    hasEnd: false,
    interactions: [],
    events: [...events].reverse(),
    legacy: true,
  };
}

function formatSeconds(seconds: number): string {
  if (!seconds) return '—';
  if (seconds >= 3600) {
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function primaryColor(): string {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--p-primary-color')
      .trim() || '#e35933'
  );
}

/** Canvas can't parse color-mix(); derive the area fill from the hex instead. */
function hexToRgba(hex: string, alpha: number): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return `rgba(227, 89, 51, ${alpha})`;
  const n = parseInt(match[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
