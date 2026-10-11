using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TodoApp.Api.Controllers;
using TodoApp.Api.Models;
using TodoApp.Api.Services;
using Xunit;

namespace TodoApp.Tests.ControllerTests;

public class TodoControllerTests
{
    [Fact]
    public async Task GetTodos_ReturnsOkWithTodos()
    {
        // Arrange
        var todos = new[] { new TodoResponse(Guid.NewGuid(), "Existing", false) };
        var mock = new Mock<ITodoService>();
        mock.Setup(s => s.GetAllAsync()).ReturnsAsync(todos);

        var controller = new TodoController(mock.Object);

        // Act
        var actionResult = await controller.GetTodos();

        // Assert
        var ok = Assert.IsType<OkObjectResult>(actionResult.Result);
        var items = Assert.IsAssignableFrom<IEnumerable<TodoResponse>>(ok.Value);
        Assert.NotEmpty(items);
    }

    [Fact]
    public async Task CreateTodo_ValidModel_ReturnsCreated()
    {
        // Arrange
        var createdResponse = new TodoResponse(Guid.NewGuid(), "New Task", false);
        var mock = new Mock<ITodoService>();
        mock.Setup(s => s.CreateAsync(It.IsAny<CreateTodoRequest>())).ReturnsAsync(createdResponse);

        var controller = new TodoController(mock.Object);
        var request = new CreateTodoRequest { Title = "New Task" };

        // Act
        var actionResult = await controller.CreateTodo(request);

        // Assert
        var created = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        var value = Assert.IsType<TodoResponse>(created.Value);
        Assert.Equal(createdResponse.Id, value.Id);
        Assert.Equal(createdResponse.Title, value.Title);
    }

    [Fact]
    public async Task CreateTodo_InvalidModel_ReturnsBadRequest()
    {
        // Arrange
        var mock = new Mock<ITodoService>();
        var controller = new TodoController(mock.Object);
        controller.ModelState.AddModelError("Title", "Required");
        var request = new CreateTodoRequest { Title = "" };

        // Act
        var actionResult = await controller.CreateTodo(request);

        // Assert
        var bad = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task DeleteTodo_Found_ReturnsNoContent()
    {
        // Arrange
        var existing = new TodoResponse(Guid.NewGuid(), "ToDelete", false);
        var mock = new Mock<ITodoService>();
        mock.Setup(s => s.DeleteAsync(existing.Id)).ReturnsAsync(true);
        var controller = new TodoController(mock.Object);

        // Act
        var result = await controller.DeleteTodo(existing.Id);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task DeleteTodo_NotFound_ReturnsNotFound()
    {
        // Arrange
        var mock = new Mock<ITodoService>();
        mock.Setup(s => s.DeleteAsync(It.IsAny<Guid>())).ReturnsAsync(false);
        var controller = new TodoController(mock.Object);
        var id = Guid.NewGuid();

        // Act
        var result = await controller.DeleteTodo(id);

        // Assert
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Contains(id.ToString(), notFound.Value?.ToString() ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }
}
