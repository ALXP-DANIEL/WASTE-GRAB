import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { GooglePlaceSelection, PlacePrediction } from '@wastegrab/shared';

import { environment } from '../../environments/environment';

export type { GooglePlaceSelection, PlacePrediction } from '@wastegrab/shared';

@Injectable({ providedIn: 'root' })
export class PlaceSearchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/places`;
  private readonly options = { withCredentials: true as const };

  autocomplete(input: string, country: string): Observable<{ predictions: PlacePrediction[] }> {
    const params = new HttpParams().set('input', input).set('country', country);
    return this.http.get<{ predictions: PlacePrediction[] }>(`${this.apiUrl}/autocomplete`, {
      ...this.options,
      params,
    });
  }

  getDetails(placeId: string): Observable<GooglePlaceSelection> {
    const params = new HttpParams().set('placeId', placeId);
    return this.http.get<GooglePlaceSelection>(`${this.apiUrl}/details`, {
      ...this.options,
      params,
    });
  }
}
