import { Router, type NextFunction, type Request, type Response } from "express";
import type {
  ApiErrorResponse,
  CollectorPickupRequest,
  GetCollectorPickupRequestResponse,
  ListCollectorPickupRequestsResponse,
  PickupImage,
  PickupItem,
  PickupRequest,
} from "@wastegrab/shared";
import {
  ImageType as PrismaImageType,
  PickupStatus as PrismaPickupStatus,
} from "../../generated/prisma/enums.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../prisma.js";
import { getCurrentUserFromRequest } from "../../services/auth.service.js";

const pickupRouter = Router();

const pickupRequestInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  collector: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          pointsPerKg: true,
        },
      },
    },
  },
  images: true,
} satisfies Prisma.PickupRequestInclude;

async function requireCollector(req: Request, res: Response, next: NextFunction) {
  const user = await getCurrentUserFromRequest(req);
  if (!user || user.role !== "COLLECTOR") {
    res.status(403).json({ error: "Forbidden. Collector access required." } as ApiErrorResponse);
    return;
  }

  next();
}

pickupRouter.get("/", requireCollector, async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUserFromRequest(req);

    if (!user || user.role !== "COLLECTOR") {
      res.status(403).json({ error: "Forbidden. Collector access required." } as ApiErrorResponse);
      return;
    }

    const collectorCoordinates = normalizeCoordinatePair(
      req.query.latitude,
      req.query.longitude,
    );
    const scope = parsePickupScope(req.query.scope);
    const pickupRequests = await prisma.pickupRequest.findMany({
      where: pickupScopeWhere(scope, user.id),
      include: pickupRequestInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const mapped = pickupRequests.map((pickup) => toCollectorPickupRequest(
      pickup,
      collectorCoordinates,
    ));
    mapped.sort(compareCollectorPickups);

    const payload: ListCollectorPickupRequestsResponse = {
      pickupRequests: mapped,
    };

    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to fetch pickup requests.";
    res.status(500).json({ error: message } as ApiErrorResponse);
  }
});

pickupRouter.get("/:pickupRequestId", requireCollector, async (req: Request, res: Response) => {
  try {
    const user = await getCurrentUserFromRequest(req);

    if (!user || user.role !== "COLLECTOR") {
      res.status(403).json({ error: "Forbidden. Collector access required." } as ApiErrorResponse);
      return;
    }

    const collectorCoordinates = normalizeCoordinatePair(
      req.query.latitude,
      req.query.longitude,
    );
    const pickupRequest = await prisma.pickupRequest.findFirst({
      where: {
        id: String(req.params.pickupRequestId),
        OR: [
          { collectorId: user.id },
          {
            collectorId: null,
            status: {
              notIn: [PrismaPickupStatus.COMPLETED, PrismaPickupStatus.CANCELLED],
            },
          },
        ],
      },
      include: pickupRequestInclude,
    });

    if (!pickupRequest) {
      res.status(404).json({ error: "Pickup request not found." } as ApiErrorResponse);
      return;
    }

    const payload: GetCollectorPickupRequestResponse = {
      pickupRequest: toCollectorPickupRequest(pickupRequest, collectorCoordinates),
    };

    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to fetch pickup request.";
    res.status(500).json({ error: message } as ApiErrorResponse);
  }
});

type PickupScope = "all" | "available" | "my";

function parsePickupScope(value: unknown): PickupScope {
  const raw = Array.isArray(value) ? value[0] : value;

  return raw === "available" || raw === "my" ? raw : "all";
}

function pickupScopeWhere(scope: PickupScope, collectorId: string): Prisma.PickupRequestWhereInput {
  if (scope === "available") {
    return {
      collectorId: null,
      status: {
        notIn: [PrismaPickupStatus.COMPLETED, PrismaPickupStatus.CANCELLED],
      },
    };
  }

  if (scope === "my") {
    return {
      collectorId,
    };
  }

  return {};
}

function toCollectorPickupRequest(
  row: {
    id: string;
    userId: string;
    collectorId: string | null;
    addressText: string;
    latitude: unknown | null;
    longitude: unknown | null;
    status: PrismaPickupStatus;
    notes: string | null;
    aiClassificationLabel: string | null;
    aiConfidence: unknown | null;
    aiSuggestedPayload: unknown | null;
    createdAt: Date;
    completedAt: Date | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
    collector: {
      id: string;
      name: string;
      email: string;
    } | null;
    items?: Array<{
      id: string;
      pickupRequestId: string;
      categoryId: string;
      estimatedWeight: unknown | null;
      actualWeight: unknown | null;
      category?: {
        id: string;
        name: string;
        pointsPerKg: number;
      } | null;
    }>;
    images?: Array<{
      id: string;
      pickupRequestId: string;
      imageUrl: string;
      imageType: PrismaImageType;
      uploadedAt: Date;
    }>;
  },
  collectorCoordinates: CoordinatePair | null,
): CollectorPickupRequest {
  const pickupCoordinates = normalizeCoordinatePair(row.latitude, row.longitude);
  const request: PickupRequest = {
    id: row.id,
    userId: row.userId,
    collectorId: row.collectorId,
    addressText: row.addressText,
    latitude: pickupCoordinates ? String(pickupCoordinates.latitude) : stringifyDecimal(row.latitude),
    longitude: pickupCoordinates ? String(pickupCoordinates.longitude) : stringifyDecimal(row.longitude),
    status: row.status as PickupRequest["status"],
    notes: row.notes,
    aiClassificationLabel: row.aiClassificationLabel,
    aiConfidence: stringifyDecimal(row.aiConfidence),
    aiSuggestedPayload: row.aiSuggestedPayload,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
  };

  const items: PickupItem[] = (row.items ?? []).map((item) => ({
    id: item.id,
    pickupRequestId: item.pickupRequestId,
    categoryId: item.categoryId,
    estimatedWeight: stringifyDecimal(item.estimatedWeight),
    actualWeight: stringifyDecimal(item.actualWeight),
    category: item.category
      ? {
          id: item.category.id,
          name: item.category.name,
          pointsPerKg: item.category.pointsPerKg,
        }
      : null,
  }));

  const images: PickupImage[] = (row.images ?? []).map((image) => ({
    id: image.id,
    pickupRequestId: image.pickupRequestId,
    imageUrl: image.imageUrl,
    imageType: image.imageType as PickupImage["imageType"],
    uploadedAt: image.uploadedAt.toISOString(),
  }));

  return {
    ...request,
    items,
    images,
    user: row.user,
    collector: row.collector,
    distanceKm: calculateDistanceKm(
      collectorCoordinates,
      pickupCoordinates,
    ),
  };
}

function compareCollectorPickups(a: CollectorPickupRequest, b: CollectorPickupRequest): number {
  const aDistance = a.distanceKm === null ? Number.POSITIVE_INFINITY : Number(a.distanceKm);
  const bDistance = b.distanceKm === null ? Number.POSITIVE_INFINITY : Number(b.distanceKm);

  if (aDistance !== bDistance) {
    return aDistance - bDistance;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

type CoordinatePair = {
  latitude: number;
  longitude: number;
};

function calculateDistanceKm(from: CoordinatePair | null, to: CoordinatePair | null): string | null {
  if (!from || !to) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitudeRadians = toRadians(from.latitude);
  const toLatitudeRadians = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitudeRadians) *
      Math.cos(toLatitudeRadians) *
      Math.sin(longitudeDelta / 2) ** 2;
  const distance = 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return distance.toFixed(2);
}

function parseCoordinate(value: unknown): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCoordinatePair(latitudeValue: unknown, longitudeValue: unknown): CoordinatePair | null {
  const latitude = parseCoordinate(latitudeValue);
  const longitude = parseCoordinate(longitudeValue);

  if (latitude === null || longitude === null) {
    return null;
  }

  if (latitude === 0 && longitude === 0) {
    return null;
  }

  if (isLatitude(latitude) && isLongitude(longitude)) {
    return { latitude, longitude };
  }

  if (isLatitude(longitude) && isLongitude(latitude)) {
    return { latitude: longitude, longitude: latitude };
  }

  return null;
}

function isLatitude(value: number): boolean {
  return value >= -90 && value <= 90;
}

function isLongitude(value: number): boolean {
  return value >= -180 && value <= 180;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function stringifyDecimal(value: unknown | null): string | null {
  return value === null || value === undefined ? null : String(value);
}

export default pickupRouter;
