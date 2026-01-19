export enum TaskStatus {
  Created = 0,
  InProgress = 1,
  Completed = 2,
  Deleted = 3
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export enum TaskUrgency {
  Low = 0,
  Medium = 1,
  High = 2
}

export interface Task {
  id: string; // Guid as string
  title: string;
  deadlineDate: string; // DateOnly as string (ISO)
  deadlineTime?: string; // TimeOnly as string (HH:mm)
  urgency: TaskUrgency;
  status: TaskStatus;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  deadlineDate: string;
  deadlineTime?: string;
  urgency: TaskUrgency;
}

export interface UpdateTaskDetailsDto {
  title: string;
  deadlineDate: string;
  deadlineTime?: string;
  urgency: TaskUrgency;
}

export interface TaskStats {
  created: number;
  inProgress: number;
  completed: number;
  deleted: number;
  overdue: number;
  totalActive: number;
}
