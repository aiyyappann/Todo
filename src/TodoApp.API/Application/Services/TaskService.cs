using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TodoApp.Application.DTOs;
using TodoApp.Domain.Repositories;
using TaskStatus = TodoApp.Domain.Enums.TaskStatus;

namespace TodoApp.Application.Services;

public class TaskService : ITaskService
{
    private readonly ITaskRepository _repository;

    public TaskService(ITaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<TaskDto>> GetTasksAsync(string? search, Domain.Enums.TaskStatus? status, Domain.Enums.TaskUrgency? urgency, bool includeDeleted, int page, int pageSize)
    {
        var (tasks, totalCount) = await _repository.GetAllAsync(search, status, urgency, includeDeleted, page, pageSize);
        var dtos = tasks.Select(MapToDto);
        return new PagedResult<TaskDto>(dtos, totalCount, page, pageSize);
    }

    public async Task<IEnumerable<TaskDto>> GetOverdueTasksAsync()
    {
        var tasks = await _repository.GetOverdueTasksAsync();
        return tasks.Select(MapToDto);
    }

    public async Task<TaskDto?> GetTaskByIdAsync(Guid id)
    {
        var task = await _repository.GetByIdAsync(id);
        return task == null ? null : MapToDto(task);
    }

    public async Task<Guid> CreateTaskAsync(CreateTaskDto dto)
    {
        var task = new Domain.Entities.Task(dto.Title, dto.DeadlineDate, dto.Urgency, dto.DeadlineTime);
        await _repository.AddAsync(task);
        return task.Id;
    }

    public async Task UpdateTaskDetailsAsync(Guid id, UpdateTaskDetailsDto dto)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task == null) throw new KeyNotFoundException($"Task with ID {id} not found.");

        task.UpdateDetails(dto.Title, dto.DeadlineDate, dto.Urgency, dto.DeadlineTime);
        await _repository.UpdateAsync(task);
    }

    public async Task StartTaskAsync(Guid id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task == null) throw new KeyNotFoundException($"Task with ID {id} not found.");

        task.Start();
        await _repository.UpdateAsync(task);
    }

    public async Task CompleteTaskAsync(Guid id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task == null) throw new KeyNotFoundException($"Task with ID {id} not found.");

        task.Complete();
        await _repository.UpdateAsync(task);
    }

    public async Task ReopenTaskAsync(Guid id)
    {
        // Reopen maps to Start logic in Domain (Completed -> InProgress)
        // Check if logic needs specific handling? Domain says Start() handles transitions to InProgress
        await StartTaskAsync(id);
    }

    public async Task DeleteTaskAsync(Guid id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task == null) throw new KeyNotFoundException($"Task with ID {id} not found.");

        task.Delete();
        await _repository.UpdateAsync(task);
    }

    public async Task RestoreTaskAsync(Guid id)
    {
        // Restore maps to Start logic (Deleted -> InProgress)
        await StartTaskAsync(id);
    }

    public async Task HardDeleteTaskAsync(Guid id)
    {
         var task = await _repository.GetByIdAsync(id);
         if (task == null) throw new KeyNotFoundException($"Task with ID {id} not found.");
         
         // Only allowing hard delete from Deleted status?
         if (task.Status != TaskStatus.Deleted)
             throw new InvalidOperationException("Task must be soft-deleted before hard deletion.");

         await _repository.DeleteAsync(id);
    }

    public async Task ResetTaskAsync(Guid id)
    {
         var task = await _repository.GetByIdAsync(id);
         if (task == null) throw new KeyNotFoundException($"Task with ID {id} not found.");
         
         task.Reset();
         await _repository.UpdateAsync(task);
    }

    public async Task<IEnumerable<TaskDto>> GetUpcomingTasksAsync()
    {
        var tasks = await _repository.GetUpcomingTasksAsync();
        return tasks.Select(MapToDto);
    }

    public async Task<TaskStatsDto> GetStatsAsync()
    {
        var created = await _repository.GetCountByStatusAsync(TaskStatus.Created);
        var inProgress = await _repository.GetCountByStatusAsync(TaskStatus.InProgress);
        var completed = await _repository.GetCountByStatusAsync(TaskStatus.Completed);
        var deleted = await _repository.GetCountByStatusAsync(TaskStatus.Deleted);
        
        // Active is calculated only when task is started (In Progress) per user request
        // Update: User requested to revert to old logic (Created + InProgress) and rename to Total Tasks.
        int totalActive = created + inProgress;
        int overdue = await _repository.GetOverdueCountAsync();
        
        return new TaskStatsDto(created, inProgress, completed, deleted, overdue, totalActive);
    }

    private static TaskDto MapToDto(Domain.Entities.Task task)
    {
        return new TaskDto(
            task.Id,
            task.Title,
            task.DeadlineDate,
            task.DeadlineTime,
            task.Urgency,
            task.Status,
            task.CreatedAt,
            task.UpdatedAt,
            task.CompletedAt
        );
    }
}
