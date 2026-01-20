import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Task, CreateTaskDto, UpdateTaskDetailsDto, TaskStats, TaskStatus, TaskUrgency, PagedResult } from '../models/task.model';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:5000/tasks'; 

    // Signals for state - can be extended for reactive UI
    tasks = signal<Task[]>([]);
    stats = signal<TaskStats | null>(null);
    overdueTasks = signal<Task[]>([]);
    upcomingTasks = signal<Task[]>([]);


    // Updated to return PagedResult
    getTasks(search: string = '', status?: TaskStatus, urgency?: TaskUrgency, includeDeleted: boolean = false, page: number = 1, pageSize: number = 10): Observable<PagedResult<Task>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('pageSize', pageSize.toString());

        if (search) params = params.set('search', search);
        if (status !== undefined && status !== null) params = params.set('status', status.toString());
        if (urgency !== undefined && urgency !== null) params = params.set('urgency', urgency.toString());
        params = params.set('includeDeleted', includeDeleted.toString());

        return this.http.get<PagedResult<Task>>(this.apiUrl, { params }).pipe(
            tap(result => this.tasks.set(result.items)) // Signal now holds current page items
        );
    }

    getOverdueTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/overdue`).pipe(
            tap(tasks => this.overdueTasks.set(tasks))
        );
    }

    getUpcomingTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/upcoming`).pipe(
            tap(tasks => this.upcomingTasks.set(tasks))
        );
    }

    loadReminders() {
        this.getOverdueTasks().subscribe();
        this.getUpcomingTasks().subscribe();
    }

    getTaskById(id: string): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`);
    }

    createTask(dto: CreateTaskDto): Observable<string> {
        return this.http.post<string>(this.apiUrl, dto);
    }

    updateDetails(id: string, dto: UpdateTaskDetailsDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/details`, dto);
    }

    startTask(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/start`, {});
    }

    completeTask(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/complete`, {});
    }

    reopenTask(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/reopen`, {});
    }

    deleteTask(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/delete`, {});
    }

    restoreTask(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/restore`, {});
    }

    hardDeleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getStats(): Observable<TaskStats> {
        return this.http.get<TaskStats>(`${this.apiUrl}/stats`).pipe(
            tap(stats => this.stats.set(stats))
        );
    }

    resetTask(id: string): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}/reset`, {});
    }
}
