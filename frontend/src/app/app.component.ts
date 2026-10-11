
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

  protected newTaskTitle = signal('');
  protected validationError = signal<string | null>(null);

  private readonly maxTitleLength = 300;

  ngOnInit(): void {
    this.todoService.loadAllTodos();
  }

  protected async handleCreateTodo(): Promise<void> {
    const currentTitle = this.newTaskTitle().trim();

    this.todoService.errorMessage.set(null);

    if (!currentTitle) {
      return;
    }

    if (currentTitle.length > 300) {
      this.todoService.errorMessage.set(
        'Task title cannot exceed 300 characters.'
      );
      return;
    }

    if (this.containsExecutableCode(currentTitle)) {
      this.todoService.errorMessage.set(
        'Your task title contains potentially executable code. Please enter plain text.'
      );
      return;
    }

    await this.todoService.addTodo(currentTitle);

    // Clear the input only if the API request succeeded.
    if (this.todoService.errorMessage() === null) {
      this.newTaskTitle.set('');
    }
  }
  
  protected async handleDeleteTodo(id: string): Promise<void> {
    // Basic defensive validation of the identifier.
    if (
      typeof id !== 'string' ||
      id.trim().length === 0 ||
      id.length > 100 ||
      /[\u0000-\u001F\u007F]/.test(id)
    ) {
      return;
    }

    await this.todoService.deleteTodo(id);
  }

  private containsExecutableCode(value: string): boolean {
    const suspiciousPatterns = [
      /<\s*script\b/i,          // Script tags
      /<\s*iframe\b/i,          // Iframes
      /<\s*object\b/i,          // Embedded objects
      /<\s*embed\b/i,           // Embedded content
      /\bon\w+\s*=/i,            // HTML event handlers, e.g. onclick=
      /javascript\s*:/i,         // JavaScript URLs
      /\beval\s*\(/i,            // eval()
      /\bnew\s+Function\b/i,     // Function constructor
      /\bprocess\.start\s*\(/i   // .NET process execution
    ];

    return suspiciousPatterns.some(pattern => pattern.test(value));
  }
}
