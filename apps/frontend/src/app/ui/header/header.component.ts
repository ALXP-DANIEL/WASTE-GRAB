import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { AppHeaderNotificationsComponent } from './header-notifications.component';
import { AppHeaderQuoteComponent } from './header-quote.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AppHeaderNotificationsComponent, AppHeaderQuoteComponent],
  template: `
    <header class="flex items-center justify-between pointer-events-auto">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">
          {{ activeRouteTitle }}
        </h1>

        <app-header-quote />
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <ng-content select="[rightSide]" />
        <app-header-notifications />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private routeEvents?: Subscription;

  protected activeRouteTitle = '';

  ngOnInit(): void {
    this.updateRouteTitle();

    this.routeEvents = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateRouteTitle();
      });
  }

  ngOnDestroy(): void {
    this.routeEvents?.unsubscribe();
  }

  private updateRouteTitle(): void {
    let route = this.route;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.activeRouteTitle = route.snapshot.data?.['title'] ?? 'Untitled Page';
  }
}
