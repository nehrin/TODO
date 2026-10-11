import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi
} from 'vitest';

import { TodoService } from './todo.service';
import { TodoItem } from '../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:5199/api/todo';

  const mockTodos: TodoItem[] = [
    { id: '1', title: 'Learn Angular testing' } as TodoItem,
    { id: '2', title: 'Write unit tests' } as TodoItem
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  // 1. Initial state

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with an empty todos signal', () => {
    expect(service.todos()).toEqual([]);
  });

  it('should initialize errorMessage to null', () => {
    expect(service.errorMessage()).toBeNull();
  });

  // 2. Load all todos

  it('should load all todos from the API', async () => {
    const promise = service.loadAllTodos();
    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('GET');

    req.flush(mockTodos);
    await promise;

    expect(service.todos()).toEqual(mockTodos);
  });

  it('should replace existing todos when loading all todos', async () => {
    const initialPromise = service.loadAllTodos();

    httpMock.expectOne(apiUrl).flush([mockTodos[0]]);
    await initialPromise;

    const reloadPromise = service.loadAllTodos();

    httpMock.expectOne(apiUrl).flush(mockTodos);
    await reloadPromise;

    expect(service.todos()).toEqual(mockTodos);
    expect(service.todos().length).toBe(2);
  });

  it('should handle errors when loading todos', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const promise = service.loadAllTodos();
    const req = httpMock.expectOne(apiUrl);

    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error'
    });

    await promise;

    expect(consoleError).toHaveBeenCalledWith(
      'Failed fetching tasks:',
      expect.anything()
    );

    expect(service.todos()).toEqual([]);
  });

  // 3. Add a todo

  it('should send a POST request when adding a todo', async () => {
    const newTodo = {
      id: '3',
      title: 'Learn Angular signals'
    } as TodoItem;

    const promise = service.addTodo('Learn Angular signals');
    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      title: 'Learn Angular signals'
    });

    req.flush(newTodo);
    await promise;

    expect(service.todos()).toEqual([newTodo]);
    expect(service.errorMessage()).toBeNull();
  });

  it('should prepend a new todo to existing todos', async () => {
    const initialPromise = service.loadAllTodos();

    httpMock.expectOne(apiUrl).flush(mockTodos);
    await initialPromise;

    const newTodo = {
      id: '3',
      title: 'New task'
    } as TodoItem;

    const addPromise = service.addTodo('New task');
    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('POST');

    req.flush(newTodo);
    await addPromise;

    expect(service.todos()).toEqual([newTodo, ...mockTodos]);
  });

  it('should clear a previous error before adding a todo', async () => {
    service.errorMessage.set('Previous error');

    const promise = service.addTodo('New task');

    expect(service.errorMessage()).toBeNull();

    httpMock.expectOne(apiUrl).flush({
      id: '3',
      title: 'New task'
    });

    await promise;

    expect(service.errorMessage()).toBeNull();
  });

  it('should set an error message when the server returns HTTP 400', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const promise = service.addTodo('A'.repeat(301));
    const req = httpMock.expectOne(apiUrl);

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      title: 'A'.repeat(301)
    });

    req.flush(
      { title: 'Title cannot exceed 300 characters' },
      {
        status: 400,
        statusText: 'Bad Request'
      }
    );

    await promise;

    expect(service.errorMessage()).toBe(
      'Task title was too long. Please use fewer than 300 characters.'
    );

    expect(service.todos()).toEqual([]);

    expect(consoleError).toHaveBeenCalledWith(
      'Error creating task:',
      expect.any(HttpErrorResponse)
    );
  });

  it('should set a generic error message for other add failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const promise = service.addTodo('Failed task');
    const req = httpMock.expectOne(apiUrl);

    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error'
    });

    await promise;

    expect(service.errorMessage()).toBe(
      'Unable to create the task. Please try again.'
    );

    expect(service.todos()).toEqual([]);

    expect(consoleError).toHaveBeenCalledWith(
      'Error creating task:',
      expect.any(HttpErrorResponse)
    );
  });

  // 4. Delete a todo

  it('should send a DELETE request to the correct URL', async () => {
    const initialPromise = service.loadAllTodos();

    httpMock.expectOne(apiUrl).flush(mockTodos);
    await initialPromise;

    const promise = service.deleteTodo('1');
    const req = httpMock.expectOne(`${apiUrl}/1`);

    expect(req.request.method).toBe('DELETE');

    req.flush(null);
    await promise;

    expect(service.todos()).toEqual([mockTodos[1]]);
  });

  it('should remove only the deleted todo from the signal', async () => {
    const initialPromise = service.loadAllTodos();

    httpMock.expectOne(apiUrl).flush(mockTodos);
    await initialPromise;

    const promise = service.deleteTodo('2');

    httpMock.expectOne(`${apiUrl}/2`).flush(null);
    await promise;

    expect(service.todos()).toEqual([mockTodos[0]]);
  });

  it('should handle errors when deleting a todo', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const initialPromise = service.loadAllTodos();

    httpMock.expectOne(apiUrl).flush(mockTodos);
    await initialPromise;

    const promise = service.deleteTodo('1');
    const req = httpMock.expectOne(`${apiUrl}/1`);

    req.flush('Server error', {
      status: 500,
      statusText: 'Internal Server Error'
    });

    await promise;

    expect(consoleError).toHaveBeenCalledWith(
      'Error deleting task:',
      expect.any(HttpErrorResponse)
    );

    expect(service.todos()).toEqual(mockTodos);
  });
});
