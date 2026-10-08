using System.ComponentModel.DataAnnotations;

namespace TodoApp.Api.Models;

public class CreateTodoRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
    public string Title { get; set; } = string.Empty;
}
