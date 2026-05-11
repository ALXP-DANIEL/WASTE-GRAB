import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type {
  ApiErrorResponse,
  CreateTodoInput,
  HealthResponse,
  Todo,
  UpdateTodoInput,
} from "@wastegrab/shared";
import { config } from "./config.js";
import {
  createTodo,
  deleteTodo,
  getTodoById,
  listTodos,
  updateTodo,
} from "./services/todo.service.js";

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
  const payload: HealthResponse = {
    status: "ok",
    service: "wastegrab-todo-api",
  };

  res.json(payload);
});

app.get("/api/todos", async (req: Request, res: Response) => {
  const todos = await listTodos();

  res.json(todos);
});

app.get<TodoParams>("/api/todos/:id", async (req, res) => {
  const todo = await getTodoById(req.params.id);

  if (!todo) {
    const payload: ApiErrorResponse = { error: "Todo not found." };
    res.status(404).json(payload);
    return;
  }

  res.json(todo);
});

app.post("/api/todos", async (req: Request, res: Response) => {
  const body = getBody(req.body) as Partial<CreateTodoInput>;
  const title = normalizeTitle(body.title);

  if (!title) {
    const payload: ApiErrorResponse = { error: "Title is required." };
    res.status(400).json(payload);
    return;
  }

  const todo = await createTodo({ title });

  res.status(201).json(todo);
});

app.patch<TodoParams>("/api/todos/:id", async (req, res) => {
  const body = getBody(req.body) as Partial<UpdateTodoInput>;

  if (Object.hasOwn(body, "title")) {
    const title = normalizeTitle(body.title);

    if (!title) {
      const payload: ApiErrorResponse = { error: "Title cannot be empty." };
      res.status(400).json(payload);
      return;
    }

    body.title = title;
  }

  if (Object.hasOwn(body, "completed") && typeof body.completed !== "boolean") {
    const payload: ApiErrorResponse = { error: "Completed must be a boolean." };
    res.status(400).json(payload);
    return;
  }

  const todo = await updateTodo(req.params.id, body);

  res.json(todo);
});

app.delete<TodoParams>("/api/todos/:id", async (req, res) => {
  await deleteTodo(req.params.id);

  res.sendStatus(204);
});

app.use((req: Request, res: Response) => {
  const payload: ApiErrorResponse = { error: "Route not found." };
  res.status(404).json(payload);
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && isObject(err) && "body" in err) {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }

  if (isPrismaNotFoundError(err)) {
    const payload: ApiErrorResponse = { error: "Todo not found." };
    res.status(404).json(payload);
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
