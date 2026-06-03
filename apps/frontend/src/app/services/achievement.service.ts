import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  Achievement,
  CreateAchievementInput,
  CustomerAchievementsResponse,
  UpdateAchievementInput,
} from '@wastegrab/shared';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private readonly http = inject(HttpClient);
  private readonly adminApiUrl = `${environment.apiBaseUrl}/admin/achievements`;
  private readonly customerApiUrl = `${environment.apiBaseUrl}/customer/achievements`;
  private readonly opts = { withCredentials: true as const };

  listAchievements(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(this.adminApiUrl, this.opts);
  }

  createAchievement(payload: CreateAchievementInput): Observable<Achievement> {
    return this.http.post<Achievement>(this.adminApiUrl, payload, this.opts);
  }

  updateAchievement(id: string, payload: UpdateAchievementInput): Observable<Achievement> {
    return this.http.patch<Achievement>(`${this.adminApiUrl}/${id}`, payload, this.opts);
  }

  deleteAchievement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminApiUrl}/${id}`, this.opts);
  }

  listCustomerAchievements(): Observable<CustomerAchievementsResponse> {
    return this.http.get<CustomerAchievementsResponse>(this.customerApiUrl, this.opts);
  }
}
