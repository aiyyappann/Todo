using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TodoApp.Application.DTOs;
using TodoApp.Domain.Enums;

namespace TodoApp.Application.Services;

public interface ITaskService
{
    Task<PagedResult<TaskDto>> GetTasksAsync(string? search, Domain.Enums.TaskStatus? status, TaskUrgency? urgency, bool includeDeleted, int page, int pageSize);
    Task<TaskDto?> GetTaskByIdAsync(Guid id);
    Task<IEnumerable<TaskDto>> GetOverdueTasksAsync();
    Task<Guid> CreateTaskAsync(CreateTaskDto dto);
    Task UpdateTaskDetailsAsync(Guid id, UpdateTaskDetailsDto dto);
    Task StartTaskAsync(Guid id);
    Task CompleteTaskAsync(Guid id);
    Task ReopenTaskAsync(Guid id); // Using start/reopen overlap in domain, but separate intent here if needed, or just Start
    Task DeleteTaskAsync(Guid id); // Soft
    Task RestoreTaskAsync(Guid id);
    Task HardDeleteTaskAsync(Guid id);
    Task ResetTaskAsync(Guid id);
    Task<TaskStatsDto> GetStatsAsync();
    Task<IEnumerable<TaskDto>> GetUpcomingTasksAsync();
}
