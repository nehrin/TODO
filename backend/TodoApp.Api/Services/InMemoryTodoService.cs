using System.Collections.Concurrent;
using TodoApp.Api.Models;

namespace TodoApp.Api.Services;

public class InMemoryTodoService : ITodoService
{
    private readonly ConcurrentDictionary<Guid, TodoItem> _todos = new();

    public InMemoryTodoService()
    {
        // Seed initial items safely
        var initialItems = new[] { "Learn Angular 22", "Master .NET 10", "Build Great Architecture" };
        foreach (var title in initialItems)
        {
            var item = new TodoItem { Title = title };
            _todos[item.Id] = item;
        }
    }

    public Task<IEnumerable<TodoResponse>> GetAllAsync()
    {
        var items = _todos.Values
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TodoResponse(t.Id, t.Title, t.IsCompleted));
            
        return Task.FromResult(items);
    }

    public Task<TodoResponse> CreateAsync(CreateTodoRequest request)
    {
        var newItem = new TodoItem { Title = request.Title.Trim() };
        _todos[newItem.Id] = newItem;
        return Task.FromResult(new TodoResponse(newItem.Id, newItem.Title, newItem.IsCompleted));
    }

    public Task<bool> DeleteAsync(Guid id)
    {
        return Task.FromResult(_todos.TryRemove(id, out _));
    }
}
