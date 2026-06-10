import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideImage, lucideMapPin, lucideNavigation } from '@ng-icons/lucide';
import type { CollectionLocation } from '@wastegrab/shared';
import { firstValueFrom } from 'rxjs';

import { CollectorPickupService } from '@/services/collector-pickup.service';
import { LocationService } from '@/services/location.service';
import { AppHeaderComponent } from '@/ui/header/header.component';
import { FetchStateComponent } from '@/ui/fetch-state/fetch-state.component';
import { RouteMapComponent, type RouteMapStop } from '@/ui/route-map/route-map.component';
import { ZardButtonComponent } from '@/ui/zard/button/button.component';

@Component({
  selector: 'app-collector-location-detail-page',
  imports: [CommonModule, RouterLink, AppHeaderComponent, FetchStateComponent, RouteMapComponent, ZardButtonComponent, NgIcon],
  template: `
    <section class="grid min-w-0 gap-4 p-4 lg:p-8">
      <app-header mode="route">
        <a z-button zType="outline" rightSide class="gap-2" [routerLink]="backLink">
          <ng-icon name="lucideArrowLeft" class="size-4!" />
          Back
        </a>
      </app-header>

      <app-fetch-state [isLoading]="isLoading()" [loadError]="loadError()" loadingText="Loading location...">
        @if (location(); as loc) {
        <div class="grid gap-4">
          <section class="rounded-2xl border border-border bg-card p-4 shadow-sm lg:p-6">
            <div class="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
              <div class="overflow-hidden rounded-lg bg-muted">
                @if (loc.imageUrl) {
                <img [src]="loc.imageUrl" [alt]="loc.name" class="aspect-4/3 w-full object-cover" />
                } @else {
                <div class="grid aspect-4/3 place-items-center text-muted-foreground">
                  <ng-icon name="lucideImage" class="size-8!" />
                </div>
                }
              </div>

              <div class="grid gap-4">
                <div>
                  <p class="text-sm font-semibold text-primary">Collection Location</p>
                  <h1 class="mt-1 text-2xl font-bold tracking-tight">{{ loc.name }}</h1>
                  <p class="mt-2 text-sm text-muted-foreground">{{ locationLabel(loc) }}</p>
                </div>

                <dl class="grid gap-3 text-sm sm:grid-cols-2">
                  <div class="rounded-lg bg-muted/60 p-3">
                    <dt class="text-xs text-muted-foreground">City</dt>
                    <dd class="mt-1 font-semibold">{{ loc.city || '-' }}</dd>
                  </div>
                  <div class="rounded-lg bg-muted/60 p-3">
                    <dt class="text-xs text-muted-foreground">State</dt>
                    <dd class="mt-1 font-semibold">{{ loc.state || '-' }}</dd>
                  </div>
                </dl>

                @if (directionsUrl(); as url) {
                <a
                  [href]="url"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <ng-icon name="lucideNavigation" class="size-4!" />
                  Open in Maps
                </a>
                }
              </div>
            </div>
          </section>

          <section class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            @if (hasCoordinates(loc)) {
            <app-route-map class="block h-112 min-h-112" [collectionPoints]="mapMarkers()" />
            } @else {
            <div class="grid h-112 place-items-center p-6 text-center">
              <div>
                <ng-icon name="lucideMapPin" class="mx-auto size-8! text-muted-foreground" />
                <p class="mt-3 font-semibold">Map unavailable</p>
                <p class="mt-1 max-w-md text-sm text-muted-foreground">
                  This collection location does not have saved map coordinates.
                </p>
              </div>
            </div>
            }
          </section>
        </div>
        }
      </app-fetch-state>
    </section>
  `,
  viewProviders: [provideIcons({ lucideArrowLeft, lucideImage, lucideMapPin, lucideNavigation })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectorLocationDetailPage {
  private readonly pickupService = inject(CollectorPickupService);
  private readonly locationService = inject(LocationService);
  private readonly route = inject(ActivatedRoute);
  private readonly locationContext = this.route.snapshot.data['locationContext'] === 'admin' ? 'admin' : 'collector';

  protected readonly location = signal<CollectionLocation | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly backLink = this.locationContext === 'admin' ? '/admin/locations' : '/collector/my-pickups';
  protected readonly mapMarkers = computed<RouteMapStop[]>(() => {
    const location = this.location();

    if (!location || !this.hasCoordinates(location)) {
      return [];
    }

    return [{
      label: 'D',
      title: location.name,
      subtitle: this.locationLabel(location),
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      kind: 'collection',
    }];
  });
  protected readonly directionsUrl = computed(() => {
    const location = this.location();

    if (!location || !this.hasCoordinates(location)) {
      return null;
    }

    const destination = `${location.latitude},${location.longitude}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
  });

  constructor() {
    void this.loadLocation();
  }

  protected hasCoordinates(location: CollectionLocation): boolean {
    return location.latitude !== null && location.longitude !== null;
  }

  protected locationLabel(location: CollectionLocation): string {
    return [
      location.address,
      location.city,
      location.state,
      location.postalCode,
    ].filter(Boolean).join(', ') || 'Collection location';
  }

  private async loadLocation(): Promise<void> {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      const slug = this.route.snapshot.paramMap.get('locationSlug') ?? '';
      const id = slug.split('--').pop();
      const location = id
        ? this.locationContext === 'admin'
          ? await firstValueFrom(this.locationService.getLocation(id))
          : (await firstValueFrom(this.pickupService.listCollectionLocations())).find((item) => item.id === id) ?? null
        : null;

      if (!location) {
        this.loadError.set('Collection location not found.');
      }

      this.location.set(location);
    } catch {
      this.location.set(null);
      this.loadError.set('Unable to load collection location.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
