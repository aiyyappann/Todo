# Todo App Technical Documentation

## 1. System Overview
The Todo Application is a full-stack task management system built to provide robust task tracking, status management, and deadline monitoring. It utilizes a **.NET 10** backend with Clean Architecture principles and an **Angular 20** frontend for a responsive user interface.

### Technology Stack
- **Backend**: .NET 10 (C#)
- **Frontend**: Angular 20 (TypeScript)
- **Database**: MongoDB
- **Architecture**: Domain-Driven Design (DDD) / Clean Architecture

---

## 2. Backend Architecture
The backend is structured into four distinct layers following Clean Architecture principles to ensure separation of concerns and maintainability.

### 2.1 Project Structure
*   **`TodoApp.Domain`**: The core of the application. Contains business entities, enums, and logic. No external dependencies.
*   **`TodoApp.Application`**: Defines the use cases, interfaces (Services, Repositories), and DTOs. Depends on Domain.
*   **`TodoApp.Infrastructure`**: Implements interfaces (Database access, external services). Depends on Application and Domain.
*   **`TodoApp.API`**: The entry point. Controllers, middleware, and dependency injection configuration. Depends on Application and Infrastructure.

### 2.2 Data Models (Domain Layer)

#### **Task Entity** (`Task.cs`)
Represents a user task.
| Property | Type | Description |
| :--- | :--- | :--- |
| `Id` | `Guid` | Unique identifier. |
| `Title` | `string` | Task description/name. |
| `DeadlineDate` | `DateOnly` | Due date for the task. |
| `DeadlineTime` | `TimeOnly?` | Optional due time. |
| `Urgency` | `TaskUrgency` | Enum: Low(0), Medium(1), High(2). |
| `Status` | `TaskStatus` | Enum: Created(0), InProgress(1), Completed(2), Deleted(3). |
| `CreatedAt` | `DateTime` | UTC timestamp of creation. |
| `UpdatedAt` | `DateTime?` | UTC timestamp of last modification. |
| `CompletedAt` | `DateTime?` | UTC timestamp when marked complete. |
| `DeletedAt` | `DateTime?` | UTC timestamp when soft-deleted. |

### 2.3 Business Logic (State Machine)
The `Task` entity enforces valid state transitions:
*   **Start**: `Created` / `Completed` / `Deleted` → `InProgress`
*   **Complete**: `InProgress` → `Completed`
*   **Reset**: `InProgress` → `Created`
*   **Reopen**: `Completed` → `InProgress`
*   **Delete**: Any (except `Deleted`) → `Deleted` (Soft Delete)
*   **Restore**: `Deleted` → `InProgress` (or previous state logic)

### 2.4 API Endpoints (`TasksController`)
Base Route: `/tasks`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Retrieve paginated tasks with filters (search, status, urgency). |
| **GET** | `/overdue` | Retrieve all overdue active tasks. |
| **GET** | `/upcoming` | Retrieve tasks due soon (upcoming). |
| **GET** | `/stats` | Get application-wide task statistics. |
| **GET** | `/{id}` | Get a single task by ID. |
| **POST** | `/` | Create a new task. |
| **PUT** | `/{id}/details` | Update task details (title, deadline, urgency). |
| **PUT** | `/{id}/start` | Transition status to `InProgress`. |
| **PUT** | `/{id}/complete` | Transition status to `Completed`. |
| **PUT** | `/{id}/reset` | Reset status to `Created`. |
| **PUT** | `/{id}/reopen` | Reopen a completed task. |
| **PUT** | `/{id}/delete` | Soft delete a task. |
| **PUT** | `/{id}/restore` | Restore a deleted task. |
| **DEL** | `/{id}` | Permanently delete a task (Hard Delete). |

---

## 3. Frontend Architecture
The frontend is built with Angular 20, utilizing standalone components and Signal-based reactivity.

### 3.1 Project Structure (`src/app`)
*   **`core/`**: Singletons and global services.
    *   `services/task.service.ts`: Handles HTTP communication with the API.
    *   `models/task.model.ts`: TypeScript interfaces matching backend DTOs.
*   **`features/`**: Feature-specific modules.
    *   `tasks/`: Task list and management pages.
    *   `reminders/`: View for overdue and upcoming tasks.
    *   `dashboard/`: Main overview page (if applicable).
*   **`shared/`**: Reusable UI components.
    *   `components/`: `status-badge`, `urgency-icon`, `navbar`.

### 3.2 Services & Integration
**`TaskService`**
*   Uses `HttpClient` to communicate with the .NET backend.
*   Exposes `tasks` Signal or Observable for reactive UI updates.
*   Handles pagination and filtering parameters (search, status, urgency).

### 3.3 Routing (`app.routes.ts`)
*   `/tasks`: The main task list view.
*   `/tasks/new`: Task creation form.
*   `/reminders`: Special view for Overdue/Upcoming tasks.

---

## 4. Database Schema (MongoDB)
The application uses a NoSQL document structure.

**Collection: `Tasks`**
```json
{
  "_id": "UUID",
  "Title": "String",
  "DeadlineDate": "String (ISO Date)",
  "DeadlineTime": "String (HH:mm) | null",
  "Urgency": Int (0-2),
  "Status": Int (0-3),
  "CreatedAt": "ISODate",
  "UpdatedAt": "ISODate",
  "CompletedAt": "ISODate",
  "DeletedAt": "ISODate"
}
```
Indexes are recommended on `Status`, `DeadlineDate`, and `Urgency` for performance optimizations on filters.
