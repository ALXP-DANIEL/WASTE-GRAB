import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  ListAdminNotificationLogsResponse,
  SendAdminNotificationInput,
  SendAdminNotificationResponse,
  UpdateAdminNotificationInput,
  AdminNotificationLog,
} from '@wastegrab/shared';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminNotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/admin/notifications`;
  private readonly opts = { withCredentials: true as const };

  sendNotification(payload: SendAdminNotificationInput) {
    return this.http.post<SendAdminNotificationResponse>(this.apiUrl, payload, this.opts);
  }

  listLogs() {
    return this.http.get<ListAdminNotificationLogsResponse>(this.apiUrl, this.opts);
  }

  updateNotification(logId: string, payload: UpdateAdminNotificationInput) {
    return this.http.patch<AdminNotificationLog>(`${this.apiUrl}/${encodeURIComponent(logId)}`, payload, this.opts);
  }

  deleteNotification(logId: string) {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(logId)}`, this.opts);
  }
}
