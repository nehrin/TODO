import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

export interface TodoItem { id: string; title: string; isCompleted: boolean; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5199/api/todo'; // Adjust port matching your .NET project

  newTodoTitle = signal<string>('');
  todos = signal<TodoItem[]>([]);

  async ngOnInit() {
    await this.loadTodos();
  }

  async loadTodos() {
    try {
      const data = await firstValueFrom(this.http.get<TodoItem[]>(this.apiUrl));
      this.todos.set(data);
    } catch (e) { console.error('Failed to load tasks', e); }
  }

  async handleAddTodo() {
    const title = this.newTodoTitle().trim();
    if (!title) return;
    try {
      const newItem = await firstValueFrom(this.http.post<TodoItem>(this.apiUrl, { title }));
      this.todos.update(current => [newItem, ...current]);
      this.newTodoTitle.set('');
    } catch (e) { console.error(e); }
  }

  async handleDelete(id: string) {
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.todos.update(current => current.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
  }
}
