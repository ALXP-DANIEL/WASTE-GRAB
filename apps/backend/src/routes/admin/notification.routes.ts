import { Router, type NextFunction, type Request, type Response } from "express";
import type {
  AdminNotificationLog,
  ApiErrorResponse,
  ListAdminNotificationLogsResponse,
  SendAdminNotificationInput,
  SendAdminNotificationResponse,
} from "@wastegrab/shared";
import { NotificationTargetRole } from "@wastegrab/shared";
import { getCurrentUserFromRequest } from "../../services/auth.service.js";
import { createNotifications } from "../../services/notification.service.js";
import { prisma } from "../../prisma.js";
import { getBody } from "../../utils/request.js";

const adminNotificationRouter = Router();

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
      type: "ADMIN_ANNOUNCEMENT",
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
      id: `${row.createdAt.toISOString()}-${row.title}`,
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
    type: "ADMIN_ANNOUNCEMENT",
    actionUrl,
    isClearable,
    expiresAt,
  })));

  const payload: SendAdminNotificationResponse = { sentCount };
  res.status(201).json(payload);
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

export default adminNotificationRouter;
