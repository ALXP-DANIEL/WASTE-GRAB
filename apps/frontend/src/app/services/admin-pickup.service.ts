import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ListAdminPickupRequestsResponse } from '@wastegrab/shared';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminPickupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/pickups`;
  private readonly requestOptions = { withCredentials: true as const };

  listPickups() {
    return this.http.get<ListAdminPickupRequestsResponse>(this.apiUrl, this.requestOptions);
  }
}
