import { Router, type NextFunction, type Request, type Response } from "express";
import type {
  Achievement,
  ApiErrorResponse,
  CreateAchievementInput,
  UpdateAchievementInput,
} from "@wastegrab/shared";
import { AchievementMetric as PrismaAchievementMetric } from "../../generated/prisma/enums.js";
import { prisma } from "../../prisma.js";
import { getCurrentUserFromRequest } from "../../services/auth.service.js";
import { getBody } from "../../utils/request.js";

const achievementRouter = Router();

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getCurrentUserFromRequest(req);
  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden. Admin access required." } as ApiErrorResponse);
    return;
  }

  next();
}

achievementRouter.get("/", requireAdmin, async (_req, res) => {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ isActive: "desc" }, { metric: "asc" }, { threshold: "asc" }],
  });
  res.json(achievements.map(toAchievementResponse));
});

achievementRouter.post("/", requireAdmin, async (req, res) => {
  const input = getBody(req.body) as Partial<CreateAchievementInput>;
  const title = normalizeRequiredString(input.title);
  const metric = normalizeMetric(input.metric);
  const threshold = normalizePositiveNumber(input.threshold);
  const rewardPoints = normalizeNonNegativeInteger(input.rewardPoints);

  if (!title || !metric || threshold === undefined || rewardPoints === undefined) {
    res.status(400).json({ error: "Missing required fields: title, metric, threshold, rewardPoints." } as ApiErrorResponse);
    return;
  }

  const created = await prisma.achievement.create({
    data: {
      title,
      description: normalizeOptionalString(input.description),
      metric,
      threshold,
      rewardPoints,
      isActive: input.isActive ?? true,
    },
  });

  res.status(201).json(toAchievementResponse(created));
});

achievementRouter.patch("/:id", requireAdmin, async (req, res) => {
  const input = getBody(req.body) as Partial<UpdateAchievementInput>;
  const existing = await prisma.achievement.findUnique({ where: { id: String(req.params.id) } });
  if (!existing) {
    res.status(404).json({ error: "Achievement not found." } as ApiErrorResponse);
    return;
  }

  const data: {
    title?: string;
    description?: string | null;
    metric?: PrismaAchievementMetric;
    threshold?: number;
    rewardPoints?: number;
    isActive?: boolean;
  } = {};

  if (input.title !== undefined) {
    const title = normalizeRequiredString(input.title);
    if (!title) {
      res.status(400).json({ error: "title is required." } as ApiErrorResponse);
      return;
    }
    data.title = title;
  }
  if (input.description !== undefined) data.description = normalizeOptionalString(input.description);
  if (input.metric !== undefined) {
    const metric = normalizeMetric(input.metric);
    if (!metric) {
      res.status(400).json({ error: "metric is invalid." } as ApiErrorResponse);
      return;
    }
    data.metric = metric;
  }
  if (input.threshold !== undefined) {
    const threshold = normalizePositiveNumber(input.threshold);
    if (threshold === undefined) {
      res.status(400).json({ error: "threshold must be positive." } as ApiErrorResponse);
      return;
    }
    data.threshold = threshold;
  }
  if (input.rewardPoints !== undefined) {
    const rewardPoints = normalizeNonNegativeInteger(input.rewardPoints);
    if (rewardPoints === undefined) {
      res.status(400).json({ error: "rewardPoints must be a non-negative integer." } as ApiErrorResponse);
      return;
    }
    data.rewardPoints = rewardPoints;
  }
  if (input.isActive !== undefined) data.isActive = Boolean(input.isActive);

  const updated = await prisma.achievement.update({ where: { id: existing.id }, data });
  res.json(toAchievementResponse(updated));
});

achievementRouter.delete("/:id", requireAdmin, async (req, res) => {
  const existing = await prisma.achievement.findUnique({
    where: { id: String(req.params.id) },
    select: {
      id: true,
      _count: {
        select: {
          userAchievements: true,
          pointLedger: true,
        },
      },
    },
  });
  if (!existing) {
    res.status(404).json({ error: "Achievement not found." } as ApiErrorResponse);
    return;
  }
  if (existing._count.userAchievements > 0 || existing._count.pointLedger > 0) {
    res.status(400).json({ error: "Achievement has unlock history. Set it inactive instead of deleting it." } as ApiErrorResponse);
    return;
  }

  await prisma.achievement.delete({ where: { id: existing.id } });
  res.status(204).send();
});

function normalizeRequiredString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function normalizeOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeMetric(value: unknown): PrismaAchievementMetric | undefined {
  if (typeof value !== "string") return undefined;
  return Object.values(PrismaAchievementMetric).includes(value as PrismaAchievementMetric)
    ? value as PrismaAchievementMetric
    : undefined;
}

function normalizePositiveNumber(value: unknown): number | undefined {
  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isFinite(normalized) && normalized > 0 ? normalized : undefined;
}

function normalizeNonNegativeInteger(value: unknown): number | undefined {
  const normalized = typeof value === "number" ? value : Number(value);
  return Number.isInteger(normalized) && normalized >= 0 ? normalized : undefined;
}

function toAchievementResponse(achievement: {
  id: string;
  title: string;
  description: string | null;
  metric: PrismaAchievementMetric;
  threshold: unknown;
  rewardPoints: number;
  isActive: boolean;
  createdAt: Date;
}): Achievement {
  return {
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    metric: achievement.metric as Achievement["metric"],
    threshold: Number(achievement.threshold).toFixed(2),
    rewardPoints: achievement.rewardPoints,
    isActive: achievement.isActive,
    createdAt: achievement.createdAt.toISOString(),
  };
}

export default achievementRouter;
