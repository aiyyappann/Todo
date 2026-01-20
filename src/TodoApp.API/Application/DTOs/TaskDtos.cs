using System;
using TodoApp.Domain.Enums;

namespace TodoApp.Application.DTOs;

public record TaskDto(
    Guid Id,
    string Title,
    DateOnly DeadlineDate,
    TimeOnly? DeadlineTime,
    TaskUrgency Urgency,
    Domain.Enums.TaskStatus Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    DateTime? CompletedAt
);

public record CreateTaskDto(
    string Title,
    DateOnly DeadlineDate,
    TimeOnly? DeadlineTime,
    TaskUrgency Urgency
);

public record UpdateTaskDetailsDto(
    string Title,
    DateOnly DeadlineDate,
    TimeOnly? DeadlineTime,
    TaskUrgency Urgency
);

public record TaskStatsDto(
    int Created,
    int InProgress,
    int Completed,
    int Deleted,
    int Overdue,
    int TotalActive
);
