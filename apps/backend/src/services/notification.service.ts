import { createHash } from "node:crypto";
import webPush from "web-push";
import type {
  Notification,
  PushSubscriptionInput,
} from "@wastegrab/shared";
import { config } from "../config.js";
import { prisma } from "../prisma.js";
import { emitNotificationEvent } from "./notification-stream.service.js";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  isClearable?: boolean;
  expiresAt?: Date | null;
};

const isWebPushConfigured = Boolean(
  config.webPushPublicKey &&
  config.webPushPrivateKey &&
  config.webPushSubject,
);

if (isWebPushConfigured) {
  webPush.setVapidDetails(
    config.webPushSubject,
    config.webPushPublicKey,
    config.webPushPrivateKey,
  );
}

export async function listNotifications(userId: string): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({
      where: {
        userId,
        readAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    }),
  ]);

  return {
    notifications: notifications.map(toNotificationResponse),
    unreadCount,
  };
}

export async function createNotification(input: NotificationInput): Promise<Notification> {
  const created = await prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      actionUrl: input.actionUrl ?? null,
      isClearable: input.isClearable ?? true,
      expiresAt: input.expiresAt ?? null,
    },
  });

  await sendWebPush(input).catch(() => undefined);
  emitNotificationEvent(input.userId);

  return toNotificationResponse(created);
}

export async function createNotifications(inputs: NotificationInput[]): Promise<number> {
  if (!inputs.length) {
    return 0;
  }

  await prisma.notification.createMany({
    data: inputs.map((input) => ({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      actionUrl: input.actionUrl ?? null,
      isClearable: input.isClearable ?? true,
      expiresAt: input.expiresAt ?? null,
    })),
  });

  await Promise.all(inputs.map((input) => sendWebPush(input).catch(() => undefined)));
  for (const userId of new Set(inputs.map((input) => input.userId))) {
    emitNotificationEvent(userId);
  }

  return inputs.length;
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<Notification | null> {
  const existing = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.notification.update({
    where: { id: existing.id },
    data: {
      readAt: existing.readAt ?? new Date(),
    },
  });

  return toNotificationResponse(updated);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
}

export async function deleteNotification(
  userId: string,
  notificationId: string,
): Promise<"deleted" | "not_found" | "not_clearable"> {
  const existing = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: {
      id: true,
      isClearable: true,
    },
  });

  if (!existing) {
    return "not_found";
  }

  if (!existing.isClearable) {
    return "not_clearable";
  }

  await prisma.notification.delete({ where: { id: existing.id } });
  return "deleted";
}

export async function deleteAllNotifications(userId: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: {
      userId,
      isClearable: true,
    },
  });
}

export async function savePushSubscription(
  userId: string,
  input: PushSubscriptionInput,
  userAgent: string | undefined,
): Promise<void> {
  const endpointHash = hashEndpoint(input.endpoint);

  await prisma.pushSubscription.upsert({
    where: { endpointHash },
    update: {
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: userAgent ?? null,
    },
    create: {
      userId,
      endpoint: input.endpoint,
      endpointHash,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: userAgent ?? null,
    },
  });
}

export async function removePushSubscription(userId: string, endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: {
      userId,
      endpointHash: hashEndpoint(endpoint),
    },
  });
}

async function sendWebPush(input: NotificationInput): Promise<void> {
  if (!isWebPushConfigured) {
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: input.userId,
    },
  });

  const payload = JSON.stringify({
    notification: {
      title: input.title,
      body: input.message,
      icon: "/icons/icon-192x192.png",
      data: {
        url: input.actionUrl ?? "/",
      },
    },
  });

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webPush.sendNotification({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      }, payload);
    } catch {
      await prisma.pushSubscription.delete({
        where: { id: subscription.id },
      }).catch(() => undefined);
    }
  }));
}

function hashEndpoint(endpoint: string): string {
  return createHash("sha256").update(endpoint).digest("hex");
}

function toNotificationResponse(notification: {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isClearable: boolean;
  expiresAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
}): Notification {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    actionUrl: notification.actionUrl,
    isClearable: notification.isClearable,
    expiresAt: notification.expiresAt?.toISOString() ?? null,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}
