import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  signal,
} from '@angular/core';

/**
 * Fades an element up into view the first time it enters the viewport.
 * Pairs with the `.reveal` / `.reveal-in` classes in styles.css.
 * Reduced-motion users (and non-IO browsers) see content immediately.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[class.reveal]': 'true',
    '[class.reveal-in]': 'revealed()',
  },
})
export class RevealDirective {
  protected readonly revealed = signal(false);

  constructor() {
    const element = inject(ElementRef).nativeElement as HTMLElement;
    const view = element.ownerDocument.defaultView;

    if (
      !view ||
      !('IntersectionObserver' in view) ||
      view.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.revealed.set(true);
      return;
    }

    const observer = new view.IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.revealed.set(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
