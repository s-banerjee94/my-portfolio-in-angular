import {
  Component,
  DestroyRef,
  DOCUMENT,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

/**
 * Animation phases, in order: type the curl command, show the response
 * status line, stream in the JSON body, then collapse the JSON into the
 * rendered status card ("same payload — rendered by the frontend").
 */
type Phase = 'typing' | 'meta' | 'json' | 'ui';

@Component({
  selector: 'app-api-status-card',
  templateUrl: './api-status-card.component.html',
  styleUrl: './api-status-card.component.css',
})
export class ApiStatusCardComponent implements OnInit {
  readonly name = input<string>('');
  readonly role = input<string>('');
  readonly stack = input<string[]>([
    'java',
    'spring-boot',
    'angular',
    'firebase',
  ]);

  protected readonly command = '$ curl -s https://api.sandeepan.dev/api/v1/status';
  protected readonly typed = signal('');
  protected readonly phase = signal<Phase>('typing');

  protected readonly metaVisible = computed(() => this.phase() !== 'typing');
  protected readonly jsonVisible = computed(
    () => this.phase() === 'json' || this.phase() === 'ui',
  );
  protected readonly uiVisible = computed(() => this.phase() === 'ui');

  private readonly document = inject(DOCUMENT);
  private timers: ReturnType<typeof setTimeout>[] = [];
  private typing: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  ngOnInit(): void {
    this.play();
  }

  protected play(): void {
    this.stop();
    this.typed.set('');
    this.phase.set('typing');

    const reduced =
      this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)')
        .matches ?? false;
    if (reduced) {
      this.typed.set(this.command);
      this.phase.set('ui');
      return;
    }

    let i = 0;
    this.typing = setInterval(() => {
      i++;
      this.typed.set(this.command.slice(0, i));
      if (i >= this.command.length) {
        clearInterval(this.typing);
        this.typing = undefined;
        this.schedule(() => this.phase.set('meta'), 350);
        this.schedule(() => this.phase.set('json'), 750);
        this.schedule(() => this.phase.set('ui'), 3600);
      }
    }, 26);
  }

  private schedule(fn: () => void, delay: number): void {
    this.timers.push(setTimeout(fn, delay));
  }

  private stop(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.typing !== undefined) {
      clearInterval(this.typing);
      this.typing = undefined;
    }
  }
}
