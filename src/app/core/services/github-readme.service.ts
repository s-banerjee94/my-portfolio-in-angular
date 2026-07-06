import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/**
 * Fetches a repository's README from raw.githubusercontent.com (CORS-open)
 * and renders it to HTML with `marked`, which is imported lazily so the
 * parser stays out of the initial bundle. Results are cached per repo URL.
 *
 * The returned HTML is bound via [innerHTML], so Angular's built-in
 * sanitizer strips anything unsafe — do not bypass it.
 */
@Injectable({ providedIn: 'root' })
export class GithubReadmeService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<string>>();

  getReadmeHtml(gitHubUrl: string): Observable<string> {
    const cached = this.cache.get(gitHubUrl);
    if (cached) {
      return cached;
    }

    const rawUrl = this.toRawReadmeUrl(gitHubUrl);
    if (!rawUrl) {
      return throwError(() => new Error(`Not a GitHub repo URL: ${gitHubUrl}`));
    }

    const readme$ = this.http.get(rawUrl, { responseType: 'text' }).pipe(
      switchMap((markdown) =>
        from(import('marked')).pipe(
          map(({ marked }) => marked.parse(markdown, { async: false })),
        ),
      ),
      catchError((error) => {
        // Don't cache failures — the next open retries the fetch.
        this.cache.delete(gitHubUrl);
        return throwError(() => error);
      }),
      shareReplay(1),
    );

    this.cache.set(gitHubUrl, readme$);
    return readme$;
  }

  /** https://github.com/owner/repo → raw README URL on the default branch. */
  private toRawReadmeUrl(gitHubUrl: string): string | null {
    const match = /github\.com\/([^/]+)\/([^/#?]+)/.exec(gitHubUrl);
    if (!match) {
      return null;
    }
    const repo = match[2].replace(/\.git$/, '');
    return `https://raw.githubusercontent.com/${match[1]}/${repo}/HEAD/README.md`;
  }
}
