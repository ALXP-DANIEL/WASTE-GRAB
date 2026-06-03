import type { Achievement, UserAchievement } from "@wastegrab/shared";
import {
  AchievementMetric as PrismaAchievementMetric,
  PointLedgerStatus as PrismaPointLedgerStatus,
  PointLedgerType as PrismaPointLedgerType,
} from "../generated/prisma/enums.js";
import { prisma } from "../prisma.js";
import { createNotification } from "./notification.service.js";

type MetricTotals = {
  completedPickups: number;
  totalWeightKg: number;
};

export async function awardEligibleAchievements(userId: string): Promise<UserAchievement[]> {
  const [achievements, existing, totals] = await Promise.all([
    prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ metric: "asc" }, { threshold: "asc" }],
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    getMetricTotals(userId),
  ]);

  const existingIds = new Set(existing.map((entry) => entry.achievementId));
  const eligible = achievements.filter((achievement) => {
    if (existingIds.has(achievement.id)) return false;
    return metricValue(achievement.metric, totals) >= Number(achievement.threshold);
  });

  const awarded: UserAchievement[] = [];
  for (const achievement of eligible) {
    const metric = metricValue(achievement.metric, totals);
    const result = await prisma.$transaction(async (tx) => {
      const duplicate = await tx.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id,
          },
        },
      });

      if (duplicate) return null;

      const latestLedger = await tx.pointLedger.findFirst({
        where: { userId, status: PrismaPointLedgerStatus.POSTED },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { balanceAfter: true },
      });

      const unlocked = await tx.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          metricValue: metric,
          pointsAwarded: achievement.rewardPoints,
        },
        include: { achievement: true },
      });

      await tx.pointLedger.create({
        data: {
          userId,
          achievementId: achievement.id,
          type: PrismaPointLedgerType.ACHIEVEMENT_EARNED,
          status: PrismaPointLedgerStatus.POSTED,
          points: achievement.rewardPoints,
          balanceAfter: (latestLedger?.balanceAfter ?? 0) + achievement.rewardPoints,
          description: `Achievement unlocked: ${achievement.title}.`,
          metadata: {
            metric: achievement.metric,
            metricValue: metric,
            threshold: Number(achievement.threshold),
          },
        },
      });

      return unlocked;
    });

    if (!result) continue;
    const response = toUserAchievementResponse(result);
    awarded.push(response);
    await createNotification({
      userId,
      title: "Achievement unlocked",
      message: `${achievement.title} unlocked. You earned ${achievement.rewardPoints} points.`,
      type: "ACHIEVEMENT_UNLOCKED",
      actionUrl: "/customer/achievements",
    });
  }

  return awarded;
}

export async function listUserAchievements(userId: string): Promise<UserAchievement[]> {
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
    orderBy: [{ achievedAt: "desc" }, { id: "desc" }],
  });

  return achievements.map(toUserAchievementResponse);
}

async function getMetricTotals(userId: string): Promise<MetricTotals> {
  const completed = await prisma.pickupRequest.findMany({
    where: { userId, status: "COMPLETED" },
    select: {
      items: {
        select: {
          actualWeight: true,
          estimatedWeight: true,
        },
      },
    },
  });

  return {
    completedPickups: completed.length,
    totalWeightKg: completed.reduce((pickupTotal, pickup) => (
      pickupTotal + pickup.items.reduce((itemTotal, item) => (
        itemTotal + Number(item.actualWeight ?? item.estimatedWeight ?? 0)
      ), 0)
    ), 0),
  };
}

function metricValue(metric: PrismaAchievementMetric, totals: MetricTotals): number {
  return metric === PrismaAchievementMetric.COMPLETED_PICKUPS
    ? totals.completedPickups
    : totals.totalWeightKg;
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

function toUserAchievementResponse(entry: {
  id: string;
  userId: string;
  achievementId: string;
  metricValue: unknown;
  pointsAwarded: number;
  achievedAt: Date;
  achievement: Parameters<typeof toAchievementResponse>[0];
}): UserAchievement {
  return {
    id: entry.id,
    userId: entry.userId,
    achievementId: entry.achievementId,
    metricValue: Number(entry.metricValue).toFixed(2),
    pointsAwarded: entry.pointsAwarded,
    achievedAt: entry.achievedAt.toISOString(),
    achievement: toAchievementResponse(entry.achievement),
  };
}
