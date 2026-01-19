using Microsoft.AspNetCore.Mvc;
using TodoApp.Application.DTOs;
using TodoApp.Application.Services;
using TodoApp.Domain.Enums;

namespace TodoApp.API.Controllers;

[ApiController]
[Route("tasks")] // Clean resource naming
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TaskDto>>> GetTasks(
        [FromQuery] string? search,
        [FromQuery] Domain.Enums.TaskStatus? status,
        [FromQuery] Domain.Enums.TaskUrgency? urgency,
        [FromQuery] bool includeDeleted = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _taskService.GetTasksAsync(search, status, urgency, includeDeleted, page, pageSize);
        return Ok(result);
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetOverdue()
    {
        var tasks = await _taskService.GetOverdueTasksAsync();
        return Ok(tasks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDto>> GetTaskById(Guid id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        return task == null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> CreateTask([FromBody] CreateTaskDto dto)
    {
        var id = await _taskService.CreateTaskAsync(dto);
        return CreatedAtAction(nameof(GetTaskById), new { id }, new { id });
    }

    [HttpPut("{id:guid}/details")]
    public async Task<IActionResult> UpdateDetails(Guid id, [FromBody] UpdateTaskDetailsDto dto)
    {
        try
        {
            await _taskService.UpdateTaskDetailsAsync(id, dto);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpPut("{id:guid}/start")]
    public async Task<IActionResult> StartTask(Guid id)
    {
        try
        {
            await _taskService.StartTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }
    
    // Using a generic status update endpoint might be cleaner, but sticking to specific actions for now
    [HttpPut("{id:guid}/reset")]
    public async Task<IActionResult> ResetTask(Guid id)
    {
        try
        {
            await _taskService.ResetTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpPut("{id:guid}/complete")]
    public async Task<IActionResult> CompleteTask(Guid id)
    {
        try
        {
            await _taskService.CompleteTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpPut("{id:guid}/reopen")]
    public async Task<IActionResult> ReopenTask(Guid id)
    {
        try
        {
            await _taskService.ReopenTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpPut("{id:guid}/delete")]
    public async Task<IActionResult> SoftDeleteTask(Guid id)
    {
        try
        {
            await _taskService.DeleteTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpPut("{id:guid}/restore")]
    public async Task<IActionResult> RestoreTask(Guid id)
    {
        try
        {
            await _taskService.RestoreTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> HardDeleteTask(Guid id)
    {
        try
        {
            await _taskService.HardDeleteTaskAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (InvalidOperationException ex) { return BadRequest(ex.Message); }
    }
    
    [HttpGet("stats")]
    public async Task<ActionResult<TaskStatsDto>> GetStats()
    {
        var stats = await _taskService.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetUpcoming()
    {
        var tasks = await _taskService.GetUpcomingTasksAsync();
        return Ok(tasks);
    }
}
