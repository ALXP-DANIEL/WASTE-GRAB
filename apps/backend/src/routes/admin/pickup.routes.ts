import { Router, type NextFunction, type Request, type Response } from "express";
import type {
  AdminPickupRequest,
  ApiErrorResponse,
  GetAdminPickupRequestResponse,
  ListAdminPickupRequestsResponse,
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

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getCurrentUserFromRequest(req);
  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden. Admin access required." } as ApiErrorResponse);
    return;
  }

  next();
}

pickupRouter.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const pickupRequests = await prisma.pickupRequest.findMany({
      include: pickupRequestInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const payload: ListAdminPickupRequestsResponse = {
      pickupRequests: pickupRequests.map(toAdminPickupRequest),
    };

    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to fetch pickup requests.";
    res.status(500).json({ error: message } as ApiErrorResponse);
  }
});

pickupRouter.get("/:pickupRequestId", requireAdmin, async (req: Request, res: Response) => {
  try {
    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: {
        id: String(req.params.pickupRequestId),
      },
      include: pickupRequestInclude,
    });

    if (!pickupRequest) {
      res.status(404).json({ error: "Pickup request not found." } as ApiErrorResponse);
      return;
    }

    const payload: GetAdminPickupRequestResponse = {
      pickupRequest: toAdminPickupRequest(pickupRequest),
    };

    res.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to fetch pickup request.";
    res.status(500).json({ error: message } as ApiErrorResponse);
  }
});

function toAdminPickupRequest(row: {
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
}): AdminPickupRequest {
  const request: PickupRequest = {
    id: row.id,
    userId: row.userId,
    collectorId: row.collectorId,
    addressText: row.addressText,
    latitude: stringifyDecimal(row.latitude),
    longitude: stringifyDecimal(row.longitude),
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
  };
}

function stringifyDecimal(value: unknown | null): string | null {
  return value === null || value === undefined ? null : String(value);
}

export default pickupRouter;
