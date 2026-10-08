namespace TodoApp.Api.Models;

public record TodoResponse(Guid Id, string Title, bool IsCompleted);
