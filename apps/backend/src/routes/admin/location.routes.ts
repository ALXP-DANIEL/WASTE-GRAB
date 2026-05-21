import { Router, type Request, type Response } from "express";
import type { ApiErrorResponse } from "@wastegrab/shared";
import { getBody } from "../../utils/request.js";
import { parseCreateCollectionLocationInput, parseUpdateCollectionLocationInput } from "../../utils/location-payload.js";
import { getCurrentUserFromRequest } from "../../services/auth.service.js";
import { prisma } from "../../prisma.js";

const locationRouter = Router();

function toLocationResponse(location: any) {
  return {
    ...location,
    latitude: location.latitude === null ? null : Number(location.latitude),
    longitude: location.longitude === null ? null : Number(location.longitude),
    createdAt: location.createdAt.toISOString(),
  };
}

// Middleware to check if user is admin
async function requireAdmin(req: Request, res: Response, next: Function) {
  const user = await getCurrentUserFromRequest(req);
  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden. Admin access required." } as ApiErrorResponse);
    return;
  }
  next();
}

// GET /api/admin/locations - list collection locations
locationRouter.get("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(locations.map(toLocationResponse));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to fetch locations.";
    res.status(500).json({ error: message } as ApiErrorResponse);
  }
});

// GET /api/admin/locations/:id - get single location
locationRouter.get("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const location = await prisma.location.findUnique({ where: { id: String(req.params.id) } });

    if (!location) {
      res.status(404).json({ error: "Location not found." } as ApiErrorResponse);
      return;
    }

    res.json(toLocationResponse(location));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to fetch location.";
    res.status(500).json({ error: message } as ApiErrorResponse);
  }
});

// POST /api/admin/locations - create a location
locationRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  const input = parseCreateCollectionLocationInput(getBody(req.body));

  if (!input.name) {
    res.status(400).json({ error: "Missing required field: name." } as ApiErrorResponse);
    return;
  }

  try {
    const currentUser = await getCurrentUserFromRequest(req);

    const location = await prisma.location.create({
      data: {
        name: input.name,
        address: input.address ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        postalCode: input.postalCode ?? null,
        latitude: input.latitude ?? undefined,
        longitude: input.longitude ?? undefined,
        googlePlaceId: input.googlePlaceId ?? null,
        createdBy: currentUser?.id ?? null,
      },
    });

    res.status(201).json(toLocationResponse(location));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to create location.";
    res.status(400).json({ error: message } as ApiErrorResponse);
  }
});

// PATCH /api/admin/locations/:id - update location
locationRouter.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  const updateData = parseUpdateCollectionLocationInput(getBody(req.body));

  try {
    const existing = await prisma.location.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) {
      res.status(404).json({ error: 'Location not found.' } as ApiErrorResponse);
      return;
    }

    const updated = await prisma.location.update({
      where: { id: existing.id },
      data: updateData,
    });

    res.json(toLocationResponse(updated));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to update location.';
    res.status(400).json({ error: message } as ApiErrorResponse);
  }
});

// DELETE /api/admin/locations/:id - delete location
locationRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.location.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) {
      res.status(404).json({ error: 'Location not found.' } as ApiErrorResponse);
      return;
    }

    await prisma.location.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to delete location.';
    res.status(400).json({ error: message } as ApiErrorResponse);
  }
});

export default locationRouter;
