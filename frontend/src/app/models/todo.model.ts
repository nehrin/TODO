// src/app/models/todo.model.ts
export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTodoRequest {
  title: string;
}
