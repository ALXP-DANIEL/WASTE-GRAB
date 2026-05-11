import express, { Router } from 'express';
import { ApiResponse, CreateTodoInput, Todo, UpdateTodoInput } from '@wastegrab/models';

export const createTodosRouter = (): Router => {
  const router = express.Router();
  const todos: Todo[] = [];
  let nextId = 1;

  const buildTodo = (input: CreateTodoInput): Todo => {
    const now = new Date().toISOString();

    return {
      id: `todo-${nextId++}`,
      title: input.title.trim(),
      notes: input.notes.trim(),
      completed: false,
      createdAt: now,
    };
  };

  router.get('/', (req, res) => {
    const response: ApiResponse<Todo[]> = {
      data: [...todos],
      success: true,
    };

    res.json(response);
  });

  router.get('/:id', (req, res) => {
    const todo = todos.find(item => item.id === req.params.id) || null;

    if (!todo) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Todo not found',
      };

      return res.status(404).json(response);
    }

    const response: ApiResponse<Todo> = {
      data: todo,
      success: true,
    };

    res.json(response);
  });

  router.post('/', (req, res) => {
    try {
      const payload = req.body as CreateTodoInput;
      const todo = buildTodo(payload);
      todos.unshift(todo);

      const response: ApiResponse<Todo> = {
        data: todo,
        success: true,
        message: 'Todo created',
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      res.status(500).json(response);
    }
  });

  router.put('/:id', (req, res) => {
    try {
      const payload = req.body as UpdateTodoInput;
      const index = todos.findIndex(item => item.id === req.params.id);

      if (index === -1) {
        const response: ApiResponse<null> = {
          data: null,
          success: false,
          error: 'Todo not found',
        };

        return res.status(404).json(response);
      }

      const currentTodo = todos[index];
      const updatedTodo: Todo = {
        ...currentTodo,
        title: payload.title?.trim() ?? currentTodo.title,
        notes: payload.notes?.trim() ?? currentTodo.notes,
        completed: payload.completed ?? currentTodo.completed,
      };

      todos[index] = updatedTodo;

      const response: ApiResponse<Todo> = {
        data: updatedTodo,
        success: true,
        message: 'Todo updated',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      res.status(500).json(response);
    }
  });

  router.delete('/:id', (req, res) => {
    try {
      const index = todos.findIndex(item => item.id === req.params.id);

      if (index === -1) {
        const response: ApiResponse<null> = {
          data: null,
          success: false,
          error: 'Todo not found',
        };

        return res.status(404).json(response);
      }

      todos.splice(index, 1);

      const response: ApiResponse<null> = {
        data: null,
        success: true,
        message: 'Todo deleted',
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      res.status(500).json(response);
    }
  });

  return router;
};
