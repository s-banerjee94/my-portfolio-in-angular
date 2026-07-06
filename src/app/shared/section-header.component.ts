import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shared section heading in the site's "API route" style:
 * a mono eyebrow (`// GET /about`), a serif title, and an optional lede.
 */
@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block mb-10' },
  template: `
    <p class="text-primary mb-3 font-mono text-sm">
      <span class="text-muted-color">// </span>{{ eyebrow() }}
    </p>
    <h2
      class="font-display mb-3 text-3xl font-semibold text-balance md:text-4xl"
    >
      {{ title() }}
    </h2>
    @if (lede()) {
      <p class="text-muted-color max-w-xl">{{ lede() }}</p>
    }
  `,
})
export class SectionHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lede = input<string>('');
}
