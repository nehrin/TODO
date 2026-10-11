using Xunit;
using TodoApp.Api.Models;
using TodoApp.Api.Services;

namespace TodoApp.Tests.ServiceTests;

public class InMemoryTodoServiceTests
{
    private readonly InMemoryTodoService _service;

    public InMemoryTodoServiceTests()
    {
        _service = new InMemoryTodoService();
    }

    [Fact]
    public async Task CreateAsync_ShouldAddTodoItem()
    {
        // Arrange
        var request = new CreateTodoRequest { Title = "Test Task" };

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test Task", result.Title);
        Assert.False(result.IsCompleted);
    }

    [Fact]
    public async Task DeleteAsync_WithValidId_ShouldReturnTrue()
    {
        // Arrange
        var todos = await _service.GetAllAsync();
        var targetId = todos.First().Id;

        // Act
        var deleted = await _service.DeleteAsync(targetId);
        var updatedTodos = await _service.GetAllAsync();

        // Assert
        Assert.True(deleted);
        Assert.DoesNotContain(updatedTodos, t => t.Id == targetId);
    }
}
