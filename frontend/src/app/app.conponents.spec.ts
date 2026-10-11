import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { TodoService } from './services/todo.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockTodoService: {
    loadAllTodos: ReturnType<typeof vi.fn>;
    addTodo: ReturnType<typeof vi.fn>;
    deleteTodo: ReturnType<typeof vi.fn>;
    todos: ReturnType<typeof signal<any[]>>;
    errorMessage: ReturnType<typeof signal<string | null>>;
  };

  beforeEach(async () => {
    mockTodoService = {
      loadAllTodos: vi.fn(),
      addTodo: vi.fn().mockResolvedValue(undefined),
      deleteTodo: vi.fn().mockResolvedValue(undefined),
      todos: signal<any[]>([]),
      errorMessage: signal<string | null>(null)
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, FormsModule],
      providers: [
        { provide: TodoService, useValue: mockTodoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load todos on initialisation', () => {
    fixture.detectChanges();

    expect(mockTodoService.loadAllTodos).toHaveBeenCalledTimes(1);
  });

  describe('handleCreateTodo', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reject an empty or whitespace-only title', async () => {
      component['newTaskTitle'].set('   ');

      await component['handleCreateTodo']();

      expect(mockTodoService.addTodo).not.toHaveBeenCalled();
    });

    it('should submit a trimmed valid title and clear the input', async () => {
      component['newTaskTitle'].set('  Buy Milk  ');

      await component['handleCreateTodo']();

      expect(mockTodoService.addTodo).toHaveBeenCalledWith('Buy Milk');
      expect(component['newTaskTitle']()).toBe('');
    });

    it('should reject a title longer than 300 characters', async () => {
      component['newTaskTitle'].set('A'.repeat(301));

      await component['handleCreateTodo']();

      expect(mockTodoService.addTodo).not.toHaveBeenCalled();
      expect(mockTodoService.errorMessage()).toContain('300');
      expect(component['newTaskTitle']()).toBe('A'.repeat(301));
    });

    it.each([
      '<script>alert(1)</script>',
      '<iframe src="example.com"></iframe>',
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      'eval(alert(1))'
    ])('should reject suspicious input: %s', async (title) => {
      component['newTaskTitle'].set(title);

      await component['handleCreateTodo']();

      expect(mockTodoService.addTodo).not.toHaveBeenCalled();
      expect(mockTodoService.errorMessage()).toBeTruthy();
      expect(component['newTaskTitle']()).toBe(title);
    });

    it('should clear a previous error before validating a new title', async () => {
      mockTodoService.errorMessage.set('Previous validation error');
      component['newTaskTitle'].set('Buy groceries');

      await component['handleCreateTodo']();

      expect(mockTodoService.errorMessage()).toBeNull();
      expect(mockTodoService.addTodo).toHaveBeenCalledWith('Buy groceries');
    });
  });

  describe('handleDeleteTodo', () => {
    it('should call TodoService.deleteTodo with the supplied ID', async () => {
      fixture.detectChanges();
      const mockId = 'todo-abc-123';

      await component['handleDeleteTodo'](mockId);

      expect(mockTodoService.deleteTodo).toHaveBeenCalledWith(mockId);
    });
  });
});
