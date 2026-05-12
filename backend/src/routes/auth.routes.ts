import { Router, type Request, type Response } from "express";
import type {
  ApiErrorResponse,
  AuthResponse,
  CreateUserInput,
  LoginInput,
} from "@wastegrab/shared";
import {
  clearAuthCookie,
  createAuthCookie,
  getCurrentUserFromRequest,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import { getBody } from "../utils/request.js";

const authRouter = Router();

authRouter.get("/me", async (req: Request, res: Response) => {
  const user = await getCurrentUserFromRequest(req);

  if (!user) {
    const payload: ApiErrorResponse = { error: "Not authenticated." };
    res.status(401).json(payload);
    return;
  }

  const payload: AuthResponse = { user };
  res.json(payload);
});

authRouter.post("/register", async (req: Request, res: Response) => {
  const body = getBody(req.body) as Partial<CreateUserInput>;
  const name = normalizeText(body.name);
  const email = normalizeEmail(body.email);
  const password = normalizeText(body.password);

  if (!name) {
    res.status(400).json({ error: "Name is required." });
    return;
  }

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  try {
    const session = await registerUser({
      name,
      email,
      password,
      phone: normalizeOptionalText(body.phone),
    });

    res.setHeader("Set-Cookie", createAuthCookie(session.token));
    const payload: AuthResponse = { user: session.user };
    res.status(201).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register.";
    const statusCode = message === "Email already in use." ? 409 : 400;
    res.status(statusCode).json({ error: message });
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const body = getBody(req.body) as Partial<LoginInput>;
  const email = normalizeEmail(body.email);
  const password = normalizeText(body.password);

  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }

  if (!password) {
    res.status(400).json({ error: "Password is required." });
    return;
  }

  try {
    const session = await loginUser({ email, password });

    res.setHeader("Set-Cookie", createAuthCookie(session.token));
    const payload: AuthResponse = { user: session.user };
    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to login.";
    res.status(401).json({ error: message });
  }
});

authRouter.post("/logout", (req: Request, res: Response) => {
  res.setHeader("Set-Cookie", clearAuthCookie());
  res.sendStatus(204);
});

export default authRouter;

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function normalizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue || undefined;
}
