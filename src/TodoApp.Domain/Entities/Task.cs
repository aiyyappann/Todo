using System;
using TodoApp.Domain.Enums;

namespace TodoApp.Domain.Entities;

public class Task
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }
    public DateOnly DeadlineDate { get; private set; }
    public TimeOnly? DeadlineTime { get; private set; }
    public TaskUrgency Urgency { get; private set; }
    public Enums.TaskStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? DeletedAt { get; private set; }

    private Task() { } // For ORM/Serialization

    public Task(string title, DateOnly deadlineDate, TaskUrgency urgency, TimeOnly? deadlineTime = null)
    {
        Id = Guid.NewGuid();
        Title = title ?? throw new ArgumentNullException(nameof(title));
        DeadlineDate = deadlineDate;
        DeadlineTime = deadlineTime;
        Urgency = urgency;
        Status = Enums.TaskStatus.Created;
        CreatedAt = DateTime.UtcNow;
    }

    public void Start()
    {
        if (Status != Enums.TaskStatus.Created && Status != Enums.TaskStatus.Completed && !(Status == Enums.TaskStatus.Deleted)) 
        {
             // Note: User requirement says Deleted -> InProgress (restore) is allowed.
             // Also Created -> InProgress
             // Completed -> InProgress (reopen)
             // So essentially, we can start from Created, Completed, or Deleted?
             // Let's check requirements carefully.
             // Allowed transitions:
             // Created -> InProgress
             // Completed -> InProgress (reopen)
             // Deleted -> InProgress (restore)
             
             // Wait, if it is currently InProgress, calling Start is idempotent or invalid? 
             // Usually invalid if strict, but idempotent is safer. 
             // Requirement says "Disallowed transitions must be rejected". 
             // So if I am InProgress, I cannot go to InProgress? 
             // Actually, from InProgress I can go to Completed or Deleted.
        }

        if (Status == Enums.TaskStatus.InProgress)
            throw new InvalidOperationException("Task is already in progress.");

        Status = Enums.TaskStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;
        if (DeletedAt.HasValue) DeletedAt = null; // Restore logic
        if (CompletedAt.HasValue) CompletedAt = null; // Reopen logic
    }

    public void Complete()
    {
        if (Status != Enums.TaskStatus.InProgress)
            throw new InvalidOperationException("Only in-progress tasks can be completed.");

        Status = Enums.TaskStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete() // Soft delete
    {
        if (Status == Enums.TaskStatus.Deleted)
            throw new InvalidOperationException("Task is already deleted.");

        Status = Enums.TaskStatus.Deleted;
        DeletedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reset()
    {
        if (Status != Enums.TaskStatus.InProgress)
             throw new InvalidOperationException("Only in-progress tasks can be reset to created.");
             
        Status = Enums.TaskStatus.Created;
        UpdatedAt = DateTime.UtcNow;
        // Should we clear timestamps? Maybe no, preserve history of creation.
    }

    public void UpdateDetails(string title, DateOnly deadlineDate, TaskUrgency urgency, TimeOnly? deadlineTime)
    {
        if (Status == Enums.TaskStatus.Deleted)
             throw new InvalidOperationException("Cannot update deleted task.");
             
        Title = title;
        DeadlineDate = deadlineDate;
        Urgency = urgency;
        DeadlineTime = deadlineTime;
        UpdatedAt = DateTime.UtcNow;
    }
}
