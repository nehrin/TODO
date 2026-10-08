export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface CreateTodoRequest {
  title: string;
}
