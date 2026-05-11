import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { config } from "./config.js";
import { prisma } from "./prisma.js";

type TodoParams = {
  id: string;
};

const app = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
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
  res.json({
    status: "ok",
    service: "wastegrab-todo-api",
  });
});

app.get("/api/todos", async (req: Request, res: Response) => {
  const todos = await prisma.todo.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(todos);
});

app.get<TodoParams>("/api/todos/:id", async (req, res) => {
  const todo = await prisma.todo.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!todo) {
    res.status(404).json({ error: "Todo not found." });
    return;
  }

  res.json(todo);
});

app.post("/api/todos", async (req: Request, res: Response) => {
  const body = getBody(req.body);
  const title = normalizeTitle(body.title);

  if (!title) {
    res.status(400).json({ error: "Title is required." });
    return;
  }

  const todo = await prisma.todo.create({
    data: {
      title,
    },
  });

  res.status(201).json(todo);
});

app.patch<TodoParams>("/api/todos/:id", async (req, res) => {
  const body = getBody(req.body);
  const data: { title?: string; completed?: boolean } = {};

  if (Object.hasOwn(body, "title")) {
    const title = normalizeTitle(body.title);

    if (!title) {
      res.status(400).json({ error: "Title cannot be empty." });
      return;
    }

    data.title = title;
  }

  if (Object.hasOwn(body, "completed")) {
    if (typeof body.completed !== "boolean") {
      res.status(400).json({ error: "Completed must be a boolean." });
      return;
    }

    data.completed = body.completed;
  }

  const todo = await prisma.todo.update({
    where: {
      id: req.params.id,
    },
    data,
  });

  res.json(todo);
});

app.delete<TodoParams>("/api/todos/:id", async (req, res) => {
  await prisma.todo.delete({
    where: {
      id: req.params.id,
    },
  });

  res.sendStatus(204);
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && isObject(err) && "body" in err) {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }

  if (isPrismaNotFoundError(err)) {
    res.status(404).json({ error: "Todo not found." });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

function isPrismaNotFoundError(error: unknown): boolean {
  return isObject(error) && error.code === "P2025";
}

function getBody(value: unknown): Record<string, unknown> {
  if (!isObject(value) || Array.isArray(value)) {
    return {};
  }

  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTitle(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export default app;
