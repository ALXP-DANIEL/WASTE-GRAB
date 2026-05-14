import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type { HealthResponse } from "@wastegrab/shared";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import authRouter from "./routes/auth.routes.js";
import todoRouter from "./routes/todo.routes.js";
import addressRouter from "./routes/address.routes.js";

const app = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PATCH,DELETE,OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get("/api/health", (req: Request, res: Response) => {
  const payload: HealthResponse = {
    status: "ok",
    service: "wastegrab-todo-api",
  };

  res.json(payload);
});

app.use("/api/auth", authRouter);
app.use("/api/todos", todoRouter);
app.use("/api/address", addressRouter);

app.use(notFoundHandler);
app.use(errorHandler);


export default app;
