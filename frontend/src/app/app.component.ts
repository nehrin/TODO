// src/app/app.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from './services/todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  protected readonly todoService = inject(TodoService);
  protected newTaskTitle = signal<string>('');

  ngOnInit(): void {
    this.todoService.loadAllTodos();
  }

  protected async handleCreateTodo(): Promise<void> {
    const currentTitle = this.newTaskTitle().trim();
    if (!currentTitle) return;

    await this.todoService.addTodo(currentTitle);
    this.newTaskTitle.set(''); // Clear form state smoothly via signals
  }

  protected async handleDeleteTodo(id: string): Promise<void> {
    await this.todoService.deleteTodo(id);
  }
}
