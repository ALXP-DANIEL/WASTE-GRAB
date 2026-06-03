import { Router, type RequestHandler } from "express";
import type { ApiErrorResponse, CustomerAchievementsResponse } from "@wastegrab/shared";
import { getCurrentUserFromRequest } from "../../services/auth.service.js";
import { listUserAchievements } from "../../services/achievement.service.js";

const achievementRouter = Router();

achievementRouter.get(
  "/",
  (async (req, res) => {
    const user = await getCurrentUserFromRequest(req);

    if (!user) {
      res.status(401).json({ error: "Not authenticated." } as ApiErrorResponse);
      return;
    }

    const payload: CustomerAchievementsResponse = {
      achievements: await listUserAchievements(user.id),
    };

    res.json(payload);
  }) as RequestHandler,
);

export default achievementRouter;
