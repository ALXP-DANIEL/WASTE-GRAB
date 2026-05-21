import { Router, type Request, type Response } from "express";
import type { ApiErrorResponse } from "@wastegrab/shared";
import { requireAuthenticatedUser } from "../middleware/require-auth.js";
import { autocompletePlaces, getPlaceDetails } from "../services/places.service.js";

const placesRouter = Router();

placesRouter.use(requireAuthenticatedUser);

placesRouter.get("/autocomplete", async (req: Request, res: Response) => {
  const input = normalizeQueryValue(req.query.input);
  const country = normalizeQueryValue(req.query.country) || "my";

  try {
    const predictions = await autocompletePlaces(input, country);
    res.json({ predictions });
  } catch (error) {
    sendPlacesError(res, error);
  }
});

placesRouter.get("/details", async (req: Request, res: Response) => {
  const placeId = normalizeQueryValue(req.query.placeId);

  if (!placeId) {
    res.status(400).json({ error: "placeId is required." } as ApiErrorResponse);
    return;
  }

  try {
    const place = await getPlaceDetails(placeId);
    res.json(place);
  } catch (error) {
    sendPlacesError(res, error);
  }
});

export default placesRouter;

function normalizeQueryValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sendPlacesError(res: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : "Unable to search places.";
  const statusCode = message === "GOOGLE_MAPS_API_KEY is required." ? 503 : 502;
  res.status(statusCode).json({ error: message } as ApiErrorResponse);
}
