using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.Models;
using TodoApp.Api.Services;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodoController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodoController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoResponse>>> GetTodos()
    {
        var todos = await _todoService.GetAllAsync();
        return Ok(todos);
    }

    [HttpPost]
    public async Task<ActionResult<TodoResponse>> CreateTodo([FromBody] CreateTodoRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var todo = await _todoService.CreateAsync(request);
        return CreatedAtAction(nameof(GetTodos), new { id = todo.Id }, todo);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTodo(Guid id)
    {
        var deleted = await _todoService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { Message = $"Todo item with ID {id} not found." });
        }

        return NoContent();
    }
}
