using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using TodoApp.Domain.Entities;
using TodoApp.Domain.Repositories;
using TodoApp.Infrastructure.Context;
using Task = System.Threading.Tasks.Task;
using DomainTask = TodoApp.Domain.Entities.Task;

namespace TodoApp.Infrastructure.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly MongoDbContext _context;

    public TaskRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<DomainTask?> GetByIdAsync(Guid id)
    {
        return await _context.Tasks.Find(t => t.Id == id).FirstOrDefaultAsync();
    }

    public async Task<(IEnumerable<DomainTask> Items, int TotalCount)> GetAllAsync(string? search, Domain.Enums.TaskStatus? status, Domain.Enums.TaskUrgency? urgency, bool includeDeleted, int page, int pageSize)
    {
        var builder = Builders<DomainTask>.Filter;
        var filter = builder.Empty;

        // "Deleted" status Logic:
        // usually we exclude deleted unless includeDeleted is true OR status is specifically requesting Deleted.
        
        if (!includeDeleted && status != Domain.Enums.TaskStatus.Deleted)
        {
             // Exclude deleted
             filter &= builder.Ne(t => t.Status, Domain.Enums.TaskStatus.Deleted);
        }

        if (status.HasValue)
        {
            filter &= builder.Eq(t => t.Status, status.Value);
        }

        if (urgency.HasValue)
        {
            filter &= builder.Eq(t => t.Urgency, urgency.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            filter &= builder.Regex(t => t.Title, new MongoDB.Bson.BsonRegularExpression(search, "i"));
        }

        var totalCount = await _context.Tasks.CountDocumentsAsync(filter);
        var items = await _context.Tasks.Find(filter)
                                        .SortByDescending(t => t.CreatedAt)
                                        .Skip((page - 1) * pageSize)
                                        .Limit(pageSize)
                                        .ToListAsync();

        return (items, (int)totalCount);
    }

    public async Task AddAsync(DomainTask task)
    {
        await _context.Tasks.InsertOneAsync(task);
    }

    public async Task UpdateAsync(DomainTask task)
    {
        await _context.Tasks.ReplaceOneAsync(t => t.Id == task.Id, task);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _context.Tasks.DeleteOneAsync(t => t.Id == id);
    }

    public async Task<int> GetCountByStatusAsync(Domain.Enums.TaskStatus status)
    {
        return (int)await _context.Tasks.CountDocumentsAsync(t => t.Status == status);
    }

    public async Task<int> GetOverdueCountAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var filter = Builders<Domain.Entities.Task>.Filter.And(
            Builders<Domain.Entities.Task>.Filter.Nin(t => t.Status, new[] { Domain.Enums.TaskStatus.Completed, Domain.Enums.TaskStatus.Deleted }),
            Builders<Domain.Entities.Task>.Filter.Lt(t => t.DeadlineDate, today)
        );
        return (int)await _context.Tasks.CountDocumentsAsync(filter);
    }

    public async Task<IEnumerable<Domain.Entities.Task>> GetOverdueTasksAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var filter = Builders<Domain.Entities.Task>.Filter.And(
            Builders<Domain.Entities.Task>.Filter.Nin(t => t.Status, new[] { Domain.Enums.TaskStatus.Completed, Domain.Enums.TaskStatus.Deleted }),
            Builders<Domain.Entities.Task>.Filter.Lt(t => t.DeadlineDate, today)
        );
        return await _context.Tasks.Find(filter).SortBy(t => t.DeadlineDate).ToListAsync();
    }

    public async Task<IEnumerable<Domain.Entities.Task>> GetUpcomingTasksAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var tomorrow = today.AddDays(1);
        var threeDaysLater = today.AddDays(3);

        // Logic: Status is NOT (Completed OR Deleted) AND
        // (
        //   (DeadlineDate <= Tomorrow) OR
        //   (Urgency == High AND DeadlineDate <= ThreeDaysLater)
        // )
        
        var notCompletedOrDeleted = Builders<Domain.Entities.Task>.Filter.Nin(t => t.Status, new[] { Domain.Enums.TaskStatus.Completed, Domain.Enums.TaskStatus.Deleted });
        
        var dueSoon = Builders<Domain.Entities.Task>.Filter.Lte(t => t.DeadlineDate, tomorrow);
        
        var highPrioritySoon = Builders<Domain.Entities.Task>.Filter.And(
            Builders<Domain.Entities.Task>.Filter.Eq(t => t.Urgency, Domain.Enums.TaskUrgency.High),
            Builders<Domain.Entities.Task>.Filter.Lte(t => t.DeadlineDate, threeDaysLater)
        );

        var criteria = Builders<Domain.Entities.Task>.Filter.And(
            notCompletedOrDeleted,
            Builders<Domain.Entities.Task>.Filter.Or(dueSoon, highPrioritySoon)
        );

        return await _context.Tasks.Find(criteria).SortBy(t => t.DeadlineDate).ToListAsync();
    }
}
