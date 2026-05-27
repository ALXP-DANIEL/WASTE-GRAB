import { Router, type RequestHandler } from "express";
import type {
  ApiErrorResponse,
  ListNotificationsResponse,
  NotificationResponse,
  PushSubscriptionInput,
} from "@wastegrab/shared";
import { config } from "../config.js";
import { getCurrentUserFromRequest } from "../services/auth.service.js";
import { registerNotificationStream } from "../services/notification-stream.service.js";
import {
  deleteAllNotifications,
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  removePushSubscription,
  savePushSubscription,
} from "../services/notification.service.js";
import { getBody } from "../utils/request.js";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    const result = await listNotifications(user.id);
    const payload: ListNotificationsResponse = {
      notifications: result.notifications,
      unreadCount: result.unreadCount,
      webPushPublicKey: config.webPushPublicKey || null,
    };

    res.json(payload);
  }) as RequestHandler,
);

notificationRouter.get(
  "/stream",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    const cleanup = registerNotificationStream(user.id, res);
    req.on("close", cleanup);
  }) as RequestHandler,
);

notificationRouter.patch(
  "/read-all",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    await markAllNotificationsRead(user.id);
    res.status(204).send();
  }) as RequestHandler,
);

notificationRouter.post(
  "/push-subscriptions",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    const body = getBody(req.body) as Partial<PushSubscriptionInput>;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      res.status(400).json({ error: "Push subscription is invalid." } as ApiErrorResponse);
      return;
    }

    await savePushSubscription(user.id, {
      endpoint: body.endpoint,
      keys: {
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
      },
    }, req.headers["user-agent"]);

    res.status(204).send();
  }) as RequestHandler,
);

notificationRouter.delete(
  "/push-subscriptions",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    const body = getBody(req.body) as Partial<PushSubscriptionInput>;

    if (!body.endpoint) {
      res.status(400).json({ error: "Push subscription endpoint is required." } as ApiErrorResponse);
      return;
    }

    await removePushSubscription(user.id, body.endpoint);
    res.status(204).send();
  }) as RequestHandler,
);

notificationRouter.delete(
  "/",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    await deleteAllNotifications(user.id);
    res.status(204).send();
  }) as RequestHandler,
);

notificationRouter.patch(
  "/:notificationId/read",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    const notification = await markNotificationRead(user.id, String(req.params.notificationId));

    if (!notification) {
      res.status(404).json({ error: "Notification not found." } as ApiErrorResponse);
      return;
    }

    const payload: NotificationResponse = { notification };
    res.json(payload);
  }) as RequestHandler,
);

notificationRouter.delete(
  "/:notificationId",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    const result = await deleteNotification(user.id, String(req.params.notificationId));

    if (result === "not_found") {
      res.status(404).json({ error: "Notification not found." } as ApiErrorResponse);
      return;
    }

    if (result === "not_clearable") {
      res.status(403).json({ error: "Notification cannot be cleared." } as ApiErrorResponse);
      return;
    }

    res.status(204).send();
  }) as RequestHandler,
);

export default notificationRouter;
