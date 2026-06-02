import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ListCollectorPickupRequestsResponse } from '@wastegrab/shared';
import { environment } from '../../environments/environment';

export type CollectorLocation = {
  latitude: number;
  longitude: number;
};

@Injectable({ providedIn: 'root' })
export class CollectorPickupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/collector/pickups`;
  private readonly requestOptions = { withCredentials: true as const };

  listPickups(location?: CollectorLocation | null) {
    const params = location
      ? new HttpParams()
          .set('latitude', String(location.latitude))
          .set('longitude', String(location.longitude))
      : undefined;

    return this.http.get<ListCollectorPickupRequestsResponse>(this.apiUrl, {
      ...this.requestOptions,
      ...(params ? { params } : {}),
    });
  }
}
