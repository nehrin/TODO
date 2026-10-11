using System.ComponentModel.DataAnnotations;

namespace TodoApp.Api.Models;

public class CreateTodoRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(300, ErrorMessage = "Title cannot exceed 300 characters")]
    public string Title { get; set; } = string.Empty;
}
