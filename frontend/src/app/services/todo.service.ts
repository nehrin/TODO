// src/app/services/todo.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TodoItem, CreateTodoRequest } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5199/api/todo';

  // Internal reactive application state
  #todosState = signal<TodoItem[]>([]);

  // Public read-only signal exposing calculated data directly to components
  public readonly todos = computed(() => this.#todosState());

  async loadAllTodos(): Promise<void> {
    try {
      const items = await firstValueFrom(this.http.get<TodoItem[]>(this.apiUrl));
      this.#todosState.set(items);
    } catch (error) {
      console.error('Failed fetching tasks database entries:', error);
    }
  }

  async addTodo(title: string): Promise<void> {
    const payload: CreateTodoRequest = { title };
    try {
      const addedItem = await firstValueFrom(this.http.post<TodoItem>(this.apiUrl, payload));
      // Update state layout reactively without forcing complete structural collection refetches
      this.#todosState.update(prev => [addedItem, ...prev]);
    } catch (error) {
      console.error('Error inserting item item payload entity:', error);
    }
  }

  async deleteTodo(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
      this.#todosState.update(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error destroying remote backend item records:', error);
    }
  }
}
