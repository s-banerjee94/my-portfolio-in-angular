import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css',
})
export class PageNotFoundComponent {
  /** The path the visitor actually hit — echoed back in the fake curl line. */
  protected readonly path = inject(DOCUMENT).location?.pathname || '/';
}
