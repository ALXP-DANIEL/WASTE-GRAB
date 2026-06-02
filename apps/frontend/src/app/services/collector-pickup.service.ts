import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { GetCollectorPickupRequestResponse, ListCollectorPickupRequestsResponse } from '@wastegrab/shared';
import { environment } from '../../environments/environment';

export type CollectorLocation = {
  latitude: number;
  longitude: number;
};

export type CollectorPickupScope = 'available' | 'my' | 'all';
export type VerifyPickupItemInput = {
  itemId: string;
  actualWeight: number;
};

@Injectable({ providedIn: 'root' })
export class CollectorPickupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/collector/pickups`;
  private readonly requestOptions = { withCredentials: true as const };

  listPickups(options: { location?: CollectorLocation | null; scope?: CollectorPickupScope } = {}) {
    let params = new HttpParams();

    if (options.scope) {
      params = params.set('scope', options.scope);
    }

    if (options.location) {
      params = params
        .set('latitude', String(options.location.latitude))
        .set('longitude', String(options.location.longitude));
    }

    return this.http.get<ListCollectorPickupRequestsResponse>(this.apiUrl, {
      ...this.requestOptions,
      params,
    });
  }

  getPickup(id: string, options: { location?: CollectorLocation | null } = {}) {
    let params = new HttpParams();

    if (options.location) {
      params = params
        .set('latitude', String(options.location.latitude))
        .set('longitude', String(options.location.longitude));
    }

    return this.http.get<GetCollectorPickupRequestResponse>(`${this.apiUrl}/${id}`, {
      ...this.requestOptions,
      params,
    });
  }

  acceptPickup(id: string) {
    return this.http.patch<GetCollectorPickupRequestResponse>(`${this.apiUrl}/${id}/accept`, {}, this.requestOptions);
  }

  markArrived(id: string) {
    return this.http.patch<GetCollectorPickupRequestResponse>(`${this.apiUrl}/${id}/arrive`, {}, this.requestOptions);
  }

  verifyPickup(id: string, items: VerifyPickupItemInput[]) {
    return this.http.patch<GetCollectorPickupRequestResponse>(`${this.apiUrl}/${id}/verify`, { items }, this.requestOptions);
  }

  completePickup(id: string) {
    return this.http.patch<GetCollectorPickupRequestResponse>(`${this.apiUrl}/${id}/complete`, {}, this.requestOptions);
  }
}
