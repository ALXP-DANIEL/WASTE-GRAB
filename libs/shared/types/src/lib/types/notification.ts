import type { UserRole } from './user';

export enum NotificationTargetRole {
  ALL = "ALL",
  CUSTOMER = "CUSTOMER",
  COLLECTOR = "COLLECTOR",
  ADMIN = "ADMIN",
}

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isClearable: boolean;
  expiresAt: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ListNotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
  webPushPublicKey: string | null;
};

export type NotificationResponse = {
  notification: Notification;
};

export type PushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type SendAdminNotificationInput = {
  title: string;
  message: string;
  targetRole: NotificationTargetRole;
  userIds?: string[];
  actionUrl?: string | null;
  isClearable?: boolean;
  expiresAt?: string | null;
};

export type SendAdminNotificationResponse = {
  sentCount: number;
};

export type UpdateAdminNotificationInput = {
  title: string;
  message: string;
  actionUrl?: string | null;
  isClearable?: boolean;
  expiresAt?: string | null;
};

export type AdminNotificationLog = {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isClearable: boolean;
  expiresAt: string | null;
  createdAt: string;
  sentCount: number;
};

export type ListAdminNotificationLogsResponse = {
  logs: AdminNotificationLog[];
};

export type NotificationRecipientRole = UserRole | NotificationTargetRole.ALL;
