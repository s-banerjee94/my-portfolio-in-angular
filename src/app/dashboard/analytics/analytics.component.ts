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

import { AnalyticsService, Visit } from '@core/services/analytics.service';
import { ThemeService } from '@core/theme/theme.service';
import { SectionHeaderComponent } from '@shared/section-header.component';

const DAY = 24 * 60 * 60 * 1000;
/** The widest range the page offers — everything is loaded once, filters are local. */
const MAX_RANGE_DAYS = 90;
/** Access-log rows per page. */
const FEED_PAGE_SIZE = 10;

interface SourceRow {
  name: string;
  count: number;
  /** Bar width relative to the biggest source, 0–100. */
  pct: number;
}

@Component({
  selector: 'app-analytics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    ChartModule,
    SelectButtonModule,
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
      this.inRange().filter((v) => v.event !== 'visit'),
      (v) => v.event,
    );
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  /** Access log pagination — newest first, FEED_PAGE_SIZE rows per page. */
  protected readonly feedPage = signal(0);

  protected readonly feedTotal = computed(() => (this.visits() ?? []).length);

  protected readonly feedPageCount = computed(() =>
    Math.max(1, Math.ceil(this.feedTotal() / FEED_PAGE_SIZE)),
  );

  /** feedPage clamped, so live updates that shrink the list can't strand us. */
  protected readonly feedCurrentPage = computed(() =>
    Math.min(this.feedPage(), this.feedPageCount() - 1),
  );

  protected readonly feed = computed(() => {
    const start = this.feedCurrentPage() * FEED_PAGE_SIZE;
    return (this.visits() ?? []).slice(start, start + FEED_PAGE_SIZE);
  });

  protected newerFeedPage(): void {
    this.feedPage.set(Math.max(0, this.feedCurrentPage() - 1));
  }

  protected olderFeedPage(): void {
    this.feedPage.set(
      Math.min(this.feedPageCount() - 1, this.feedCurrentPage() + 1),
    );
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
