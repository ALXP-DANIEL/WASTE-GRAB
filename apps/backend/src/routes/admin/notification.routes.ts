import { Router, type NextFunction, type Request, type Response } from "express";
import type {
  AdminNotificationLog,
  ApiErrorResponse,
  ListAdminNotificationLogsResponse,
  SendAdminNotificationInput,
  SendAdminNotificationResponse,
  UpdateAdminNotificationInput,
} from "@wastegrab/shared";
import { NotificationTargetRole } from "@wastegrab/shared";
import { getCurrentUserFromRequest } from "../../services/auth.service.js";
import { createNotifications } from "../../services/notification.service.js";
import { emitNotificationEvent } from "../../services/notification-stream.service.js";
import { prisma } from "../../prisma.js";
import { getBody } from "../../utils/request.js";

const adminNotificationRouter = Router();
const ADMIN_ANNOUNCEMENT_TYPE = "ADMIN_ANNOUNCEMENT";

type AdminNotificationBatchKey = {
  title: string;
  message: string;
  type: string;
  actionUrl: string | null;
  isClearable: boolean;
  expiresAt: string | null;
  createdAt: string;
};

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getCurrentUserFromRequest(req);
  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden. Admin access required." } as ApiErrorResponse);
    return;
  }

  next();
}

adminNotificationRouter.get("/", requireAdmin, async (_req: Request, res: Response) => {
  const rows = await prisma.notification.groupBy({
    by: ["title", "message", "type", "actionUrl", "isClearable", "expiresAt", "createdAt"],
    where: {
      type: ADMIN_ANNOUNCEMENT_TYPE,
    },
    _count: {
      id: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  const payload: ListAdminNotificationLogsResponse = {
    logs: rows.map((row): AdminNotificationLog => ({
      id: encodeBatchKey({
        title: row.title,
        message: row.message,
        type: row.type,
        actionUrl: row.actionUrl,
        isClearable: row.isClearable,
        expiresAt: row.expiresAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      }),
      title: row.title,
      message: row.message,
      type: row.type,
      actionUrl: row.actionUrl,
      isClearable: row.isClearable,
      expiresAt: row.expiresAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      sentCount: row._count.id,
    })),
  };

  res.json(payload);
});

adminNotificationRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  const input = getBody(req.body) as Partial<SendAdminNotificationInput>;
  const title = normalizeText(input.title);
  const message = normalizeText(input.message);
  const targetRole = normalizeTargetRole(input.targetRole);
  const actionUrl = normalizeOptionalText(input.actionUrl);
  const expiresAt = normalizeOptionalDate(input.expiresAt);
  const isClearable = input.isClearable !== false;

  if (!title || !message || !targetRole) {
    res.status(400).json({ error: "title, message, and targetRole are required." } as ApiErrorResponse);
    return;
  }

  if (input.expiresAt && !expiresAt) {
    res.status(400).json({ error: "expiresAt must be a valid date." } as ApiErrorResponse);
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      ...(targetRole === NotificationTargetRole.ALL ? {} : { role: targetRole }),
      ...(Array.isArray(input.userIds) && input.userIds.length ? { id: { in: input.userIds } } : {}),
    },
    select: {
      id: true,
    },
  });

  const sentCount = await createNotifications(users.map((user) => ({
    userId: user.id,
    title,
    message,
    type: ADMIN_ANNOUNCEMENT_TYPE,
    actionUrl,
    isClearable,
    expiresAt,
  })));

  const payload: SendAdminNotificationResponse = { sentCount };
  res.status(201).json(payload);
});

adminNotificationRouter.patch("/:logId", requireAdmin, async (req: Request, res: Response) => {
  const key = decodeBatchKey(String(req.params.logId));
  if (!key || key.type !== ADMIN_ANNOUNCEMENT_TYPE) {
    res.status(404).json({ error: "Announcement batch not found." } as ApiErrorResponse);
    return;
  }

  const input = getBody(req.body) as Partial<UpdateAdminNotificationInput>;
  const title = normalizeText(input.title);
  const message = normalizeText(input.message);
  const actionUrl = normalizeOptionalText(input.actionUrl);
  const expiresAt = normalizeOptionalDate(input.expiresAt);
  const isClearable = input.isClearable !== false;

  if (!title || !message) {
    res.status(400).json({ error: "title and message are required." } as ApiErrorResponse);
    return;
  }

  if (input.expiresAt && !expiresAt) {
    res.status(400).json({ error: "expiresAt must be a valid date." } as ApiErrorResponse);
    return;
  }

  const where = batchWhere(key);
  const recipients = await prisma.notification.findMany({
    where,
    distinct: ["userId"],
    select: { userId: true },
  });

  if (recipients.length === 0) {
    res.status(404).json({ error: "Announcement batch not found." } as ApiErrorResponse);
    return;
  }

  const updated = await prisma.notification.updateMany({
    where,
    data: {
      title,
      message,
      actionUrl,
      isClearable,
      expiresAt,
    },
  });

  for (const recipient of recipients) {
    emitNotificationEvent(recipient.userId);
  }

  const updatedKey: AdminNotificationBatchKey = {
    title,
    message,
    type: key.type,
    actionUrl,
    isClearable,
    expiresAt: expiresAt?.toISOString() ?? null,
    createdAt: key.createdAt,
  };

  const payload: AdminNotificationLog = {
    id: encodeBatchKey(updatedKey),
    title,
    message,
    type: key.type,
    actionUrl,
    isClearable,
    expiresAt: expiresAt?.toISOString() ?? null,
    createdAt: key.createdAt,
    sentCount: updated.count,
  };

  res.json(payload);
});

adminNotificationRouter.delete("/:logId", requireAdmin, async (req: Request, res: Response) => {
  const key = decodeBatchKey(String(req.params.logId));
  if (!key || key.type !== ADMIN_ANNOUNCEMENT_TYPE) {
    res.status(404).json({ error: "Announcement batch not found." } as ApiErrorResponse);
    return;
  }

  const where = batchWhere(key);
  const recipients = await prisma.notification.findMany({
    where,
    distinct: ["userId"],
    select: { userId: true },
  });

  if (recipients.length === 0) {
    res.status(404).json({ error: "Announcement batch not found." } as ApiErrorResponse);
    return;
  }

  await prisma.notification.deleteMany({ where });

  for (const recipient of recipients) {
    emitNotificationEvent(recipient.userId);
  }

  res.status(204).send();
});

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalText(value: unknown): string | null {
  const text = normalizeText(value);
  return text || null;
}

function normalizeOptionalDate(value: unknown): Date | null {
  const text = normalizeText(value);
  if (!text) {
    return null;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeTargetRole(value: unknown): NotificationTargetRole | null {
  if (typeof value !== "string") {
    return null;
  }

  return Object.values(NotificationTargetRole).includes(value as NotificationTargetRole)
    ? value as NotificationTargetRole
    : null;
}

function encodeBatchKey(key: AdminNotificationBatchKey): string {
  return Buffer.from(JSON.stringify(key), "utf8").toString("base64url");
}

function decodeBatchKey(value: string): AdminNotificationBatchKey | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<AdminNotificationBatchKey>;
    if (
      typeof parsed.title !== "string" ||
      typeof parsed.message !== "string" ||
      typeof parsed.type !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.isClearable !== "boolean"
    ) {
      return null;
    }

    return {
      title: parsed.title,
      message: parsed.message,
      type: parsed.type,
      actionUrl: typeof parsed.actionUrl === "string" ? parsed.actionUrl : null,
      isClearable: parsed.isClearable,
      expiresAt: typeof parsed.expiresAt === "string" ? parsed.expiresAt : null,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

function batchWhere(key: AdminNotificationBatchKey) {
  return {
    title: key.title,
    message: key.message,
    type: key.type,
    actionUrl: key.actionUrl,
    isClearable: key.isClearable,
    expiresAt: key.expiresAt ? new Date(key.expiresAt) : null,
    createdAt: new Date(key.createdAt),
  };
}

export default adminNotificationRouter;
