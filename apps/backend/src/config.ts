import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

for (const envPath of [
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env"),
]) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false });
  }
}

const port = Number(process.env.PORT || 3000);
const databaseUrl = process.env.DATABASE_URL;
const authSecret = process.env.AUTH_SECRET || "wastegrab-dev-auth-secret";
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || "";

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive number.");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

export const config = {
  port,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:4200",
  databaseUrl,
  authSecret,
  googleMapsApiKey,
  isProduction: process.env.NODE_ENV === "production",
};
