using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TodoApp.Domain.Entities;
using Task = System.Threading.Tasks.Task;
using DomainTask = TodoApp.Domain.Entities.Task;

namespace TodoApp.Domain.Repositories;

public interface ITaskRepository
{
    Task<DomainTask?> GetByIdAsync(Guid id);
    Task<(IEnumerable<DomainTask> Items, int TotalCount)> GetAllAsync(string? search, Enums.TaskStatus? status, Enums.TaskUrgency? urgency, bool includeDeleted, int page, int pageSize);
    Task AddAsync(DomainTask task);
    Task UpdateAsync(DomainTask task);
    Task DeleteAsync(Guid id); // Hard delete
    Task<int> GetCountByStatusAsync(Enums.TaskStatus status);
    Task<int> GetOverdueCountAsync();
    Task<IEnumerable<Entities.Task>> GetOverdueTasksAsync();
    Task<IEnumerable<Entities.Task>> GetUpcomingTasksAsync();
}
