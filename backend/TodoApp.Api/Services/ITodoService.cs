using TodoApp.Api.Models;

namespace TodoApp.Api.Services;

public interface ITodoService
{
    Task<IEnumerable<TodoResponse>> GetAllAsync();
    Task<TodoResponse> CreateAsync(CreateTodoRequest request);
    Task<bool> DeleteAsync(Guid id);
}
