import app from "./app.js";
import { config } from "./config.js";
import { prisma } from "./prisma.js";

async function startServer() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection successful.");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Database connection failed.");
    console.error(message);
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`WasteGrab API running on http://localhost:${config.port}`);
  });
}

void startServer();
