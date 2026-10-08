import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TodoItem, CreateTodoRequest } from '../models/todo.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7147/api/todo'; // Adjust port matching your .NET project launching URLs

  // Signal State Management
  #todosState = signal<TodoItem[]>([]);
  todos = this.#todosState.asReadonly();

  async loadTodos(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<TodoItem[]>(this.apiUrl));
      this.#todosState.set(data);
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  }

  async addTodo(title: string): Promise<void> {
    try {
      const newTodo = await firstValueFrom(this.http.post<TodoItem>(this.apiUrl, { title } as CreateTodoRequest));
      this.#todosState.update(current => [newTodo, ...current]);
    } catch (error) {
      console.error('Failed to create task', error);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.#todosState.update(current => current.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to remove task', error);
    }
  }
}
