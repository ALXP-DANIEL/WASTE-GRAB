import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import type {
  ListNotificationsResponse,
  Notification,
  NotificationResponse,
  PushSubscriptionInput,
} from '@wastegrab/shared';
import { firstValueFrom, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly swPush = inject(SwPush);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiBaseUrl}/notifications`;
  private readonly opts = { withCredentials: true as const };
  private events: EventSource | null = null;

  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = signal(0);
  readonly webPushPublicKey = signal<string | null>(null);
  readonly canEnablePush = computed(() => this.swPush.isEnabled && Boolean(this.webPushPublicKey()));

  constructor() {
    // Only subscribe to `notificationClicks` when service worker push is enabled.
    if (this.swPush.isEnabled) {
      this.swPush.notificationClicks.subscribe(({ notification }) => {
        const url = notification.data?.url;
        if (typeof url === 'string' && url.startsWith('/')) {
          void this.router.navigateByUrl(url);
        }
      });
    }
  }

  loadNotifications() {
    return this.http.get<ListNotificationsResponse>(this.apiUrl, this.opts).pipe(
      tap((response) => {
        this.notifications.set(response.notifications);
        this.unreadCount.set(response.unreadCount);
        this.webPushPublicKey.set(response.webPushPublicKey);
      }),
    );
  }

  startRealtime(): void {
    if (this.events) {
      return;
    }

    void this.loadNotifications().subscribe();

    this.events = new EventSource(`${this.apiUrl}/stream`, {
      withCredentials: true,
    });
    this.events.addEventListener('notification', () => {
      void this.loadNotifications().subscribe();
    });
  }

  stopRealtime(): void {
    this.events?.close();
    this.events = null;
  }

  markRead(notification: Notification) {
    if (notification.readAt) {
      return this.openNotification(notification);
    }

    this.http.patch<NotificationResponse>(`${this.apiUrl}/${notification.id}/read`, {}, this.opts).subscribe({
      next: (response) => {
        this.notifications.update((list) => list.map((item) => (
          item.id === response.notification.id ? response.notification : item
        )));
        this.unreadCount.update((count) => Math.max(count - 1, 0));
        this.openNotification(response.notification);
      },
    });
  }

  markAllRead() {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {}, this.opts).pipe(
      tap(() => {
        const now = new Date().toISOString();
        this.notifications.update((list) => list.map((item) => ({
          ...item,
          readAt: item.readAt ?? now,
        })));
        this.unreadCount.set(0);
      }),
    );
  }

  clearNotification(notification: Notification) {
    if (!notification.isClearable) {
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiUrl}/${notification.id}`, this.opts).pipe(
      tap(() => {
        this.notifications.update((list) => list.filter((item) => item.id !== notification.id));
        if (!notification.readAt) {
          this.unreadCount.update((count) => Math.max(count - 1, 0));
        }
      }),
    );
  }

  clearAllNotifications() {
    return this.http.delete<void>(this.apiUrl, this.opts).pipe(
      tap(() => {
        this.notifications.update((list) => list.filter((item) => !item.isClearable));
        this.unreadCount.set(this.notifications().filter((item) => !item.readAt).length);
      }),
    );
  }

  async enablePushNotifications(): Promise<void> {
    const publicKey = this.webPushPublicKey();

    if (!this.swPush.isEnabled || !publicKey) {
      throw new Error('Push notifications are not available in this browser session.');
    }

    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: publicKey,
    });
    const payload = subscription.toJSON() as PushSubscriptionInput;

    await firstValueFrom(this.http.post<void>(`${this.apiUrl}/push-subscriptions`, payload, this.opts));
  }

  private openNotification(notification: Notification): void {
    if (notification.actionUrl) {
      void this.router.navigateByUrl(notification.actionUrl);
    }
  }
}
