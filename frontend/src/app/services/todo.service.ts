import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TodoItem, CreateTodoRequest } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5199/api/todo';

  #todosState = signal<TodoItem[]>([]);

  public readonly todos = computed(() => this.#todosState());

  // Stores the error message for display in the component template.
  public readonly errorMessage = signal<string | null>(null);

  async loadAllTodos(): Promise<void> {
    try {
      const items = await firstValueFrom(
        this.http.get<TodoItem[]>(this.apiUrl)
      );

      this.#todosState.set(items);
    } catch (error) {
      console.error('Failed fetching tasks:', error);
    }
  }

  async addTodo(title: string): Promise<void> {
    // Clear any previous error before submitting.
    this.errorMessage.set(null);

    const payload: CreateTodoRequest = { title };

    try {
      const addedItem = await firstValueFrom(
        this.http.post<TodoItem>(this.apiUrl, payload)
      );

      this.#todosState.update(prev => [addedItem, ...prev]);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 400) {
        this.errorMessage.set(
          'Task title was too long. Please use fewer than 300 characters.'
        );
      } else {
        this.errorMessage.set(
          'Unable to create the task. Please try again.'
        );
      }

      console.error('Error creating task:', error);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/${id}`)
      );

      this.#todosState.update(prev =>
        prev.filter(item => item.id !== id)
      );
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }
}
