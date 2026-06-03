import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  CollectionLocation,
  CreateCollectionLocationInput,
  UpdateCollectionLocationInput,
} from '@wastegrab/shared';
import { environment } from '../../environments/environment';

export type LocationRecord = CollectionLocation;

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/locations`;
  private readonly opts = { withCredentials: true as const };

  listLocations(): Observable<LocationRecord[]> {
    return this.http.get<LocationRecord[]>(this.apiUrl, this.opts);
  }

  getLocation(id: string): Observable<LocationRecord> {
    return this.http.get<LocationRecord>(`${this.apiUrl}/${id}`, this.opts);
  }

  createLocation(payload: CreateCollectionLocationInput | FormData) {
    return this.http.post<LocationRecord>(this.apiUrl, payload, this.opts);
  }

  updateLocation(id: string, payload: UpdateCollectionLocationInput | FormData) {
    return this.http.patch<LocationRecord>(`${this.apiUrl}/${id}`, payload, this.opts);
  }

  deleteLocation(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, this.opts);
  }
}
