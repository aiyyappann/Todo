import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../core/services/task.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { UrgencyIconComponent } from '../../../../shared/components/urgency-icon/urgency-icon.component';
import { TaskStatus, Task, TaskUrgency } from '../../../../core/models/task.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, UrgencyIconComponent, RouterLink, FormsModule],
  template: `
    <div class="page-header flex justify-between items-center mb-4">
      <h1>{{ pageTitle }}</h1>
      <button class="btn btn-primary" routerLink="/tasks/new" *ngIf="currentStatus !== 3">+ New Task</button>
    </div>

    <!-- Actions for Deleted items -->
    <div *ngIf="currentStatus === 3 && (tasks$()?.length??0) > 0" class="alert-info mt-4 mb-4">
      <p>Deleted tasks can be restored or permanently removed.</p>
    </div>

    <!-- Filters & Search -->
    <div class="filters-bar card p-4 mb-4 flex gap-4 items-end flex-wrap" *ngIf="false">
      <div class="form-group flex-1">
        <label>Search</label>
        <input type="text" [ngModel]="searchQuery" (ngModelChange)="onSearch($event)" placeholder="Search by title..." class="form-control">
      </div>
      
      <div class="form-group" *ngIf="currentStatus === undefined"> <!-- Only show status filter on main list -->
        <label>Status</label>
        <select [(ngModel)]="filterStatus" (change)="onSearch()" class="form-control">
          <option [ngValue]="undefined">All Active</option>
          <option [ngValue]="0">Created</option>
          <option [ngValue]="1">In Progress</option>
        </select>
      </div>

      <div class="form-group">
        <label>Priority</label>
        <select [(ngModel)]="filterUrgency" (change)="onSearch()" class="form-control">
          <option [ngValue]="undefined">All Priorities</option>
          <option [ngValue]="0">Low</option>
          <option [ngValue]="1">Medium</option>
          <option [ngValue]="2">High</option>
        </select>
      </div>


    </div>

    <div class="task-list mt-4" *ngIf="tasks$() as tasks">
      <div *ngIf="loading">Loading...</div>

      <div class="card task-item" *ngFor="let task of tasks">
        <div class="task-info">
          <h3>{{ task.title }}</h3>
          <div class="meta flex gap-4">
            <span class="date">Due: {{ task.deadlineDate }}</span>
            <app-urgency-icon [urgency]="task.urgency"></app-urgency-icon>
          </div>
        </div>
        
        <div class="task-actions flex items-center gap-4">
          <app-status-badge [status]="task.status"></app-status-badge>
          
          <div class="btn-group">
            <button class="btn btn-sm btn-outline" *ngIf="task.status === 0" (click)="onStart(task)">Start</button>
            <button class="btn btn-sm btn-success" *ngIf="task.status === 1" (click)="onComplete(task)">Complete</button>
            <button class="btn btn-sm btn-outline" *ngIf="task.status === 1" (click)="onReset(task)">Reset</button>
            <button class="btn btn-sm btn-outline" *ngIf="task.status === 2" (click)="onReopen(task)">Reopen</button>
            <button class="btn btn-sm btn-danger-outline" *ngIf="task.status !== 3" (click)="onDelete(task)">Delete</button>
            <button class="btn btn-sm btn-outline" *ngIf="task.status === 3" (click)="onRestore(task)">Restore</button>
            <button class="btn btn-sm btn-danger" *ngIf="task.status === 3" (click)="onHardDelete(task)">Destroy</button>
          </div>
        </div>
      </div>
      
      <div *ngIf="tasks.length === 0 && !loading" class="empty-state">
        <p>No tasks found.</p>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination flex justify-center items-center gap-4 mt-4" *ngIf="totalCount > pageSize">
      <button class="btn btn-sm btn-outline" [disabled]="page === 1" (click)="changePage(page - 1)">Previous</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button class="btn btn-sm btn-outline" [disabled]="page === totalPages" (click)="changePage(page + 1)">Next</button>
    </div>
  `,
  styles: [`
    .task-list { display: flex; flex-direction: column; gap: 1rem; }
    .task-item { display: flex; justify-content: space-between; align-items: center; }
    .task-info h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .meta { font-size: 0.875rem; color: var(--text-secondary); }
    .btn-group { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
    .btn-outline { border: 1px solid var(--border); background: transparent; }
    .btn-outline:hover { background: var(--border); }
    .btn-success { background: var(--status-completed); color: white; border: none; }
    .btn-danger-outline { border: 1px solid #fee2e2; color: #ef4444; background: transparent; }
    .btn-danger-outline:hover { background: #fee2e2; }
    .btn-danger { background: #ef4444; color: white; border: none; }
    .empty-state { text-align: center; color: var(--text-secondary); padding: 2rem; }
    .alert-info { background: #eff6ff; color: #1e3a8a; padding: 1rem; border-radius: 0.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .form-control { padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.25rem; }
    .filters-bar { background: var(--card-bg); border: 1px solid var(--border); border-radius: 0.5rem; }
  `]
})
export class TaskListComponent implements OnInit, OnDestroy {
  taskService = inject(TaskService);
  route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  tasks$ = this.taskService.tasks;

  // Pagination & Filtering
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  loading = false;

  // Search & Filter State
  searchQuery = '';
  filterStatus?: TaskStatus;
  filterUrgency?: TaskUrgency;

  // Route State
  currentStatus?: TaskStatus;
  pageTitle = 'My Tasks';
  // ... properties

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.currentStatus = data['status'];
      this.updateTitle();
      this.page = 1;
      this.loadTasks();
    });

    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.loadTasks();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateTitle() {
    if (this.currentStatus === undefined) {
      this.pageTitle = 'My Tasks';
    } else {
      switch (this.currentStatus) {
        case TaskStatus.Created: this.pageTitle = 'Pending Tasks'; break;
        case TaskStatus.InProgress: this.pageTitle = 'In Progress'; break;
        case TaskStatus.Completed: this.pageTitle = 'Completed Tasks'; break;
        case TaskStatus.Deleted: this.pageTitle = 'Deleted Tasks'; break;
        default: this.pageTitle = 'Tasks';
      }
    }
  }

  onSearch(term?: string) {
    if (term !== undefined) {
      this.searchQuery = term;
      this.searchSubject.next(term);
    } else {
      // Triggered by dropdowns immediately
      this.page = 1;
      this.loadTasks();
    }
  }

  // ... changePage, loadTasks


  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadTasks();
    }
  }

  loadTasks() {
    this.loading = true;
    const includeDeleted = this.currentStatus === TaskStatus.Deleted;

    // If we are in 'My Tasks' (currentStatus undefined), use the filterStatus from dropdown.
    // If we are in specific routes (Completed/Deleted), currentStatus overrides dropdown (dropdown unused/hidden)
    const effectiveStatus = this.currentStatus !== undefined ? this.currentStatus : this.filterStatus;

    this.taskService.getTasks(this.searchQuery, effectiveStatus, this.filterUrgency, includeDeleted, this.page, this.pageSize)
      .subscribe({
        next: (result) => {
          // Service updates the signal 'tasks' automatically via tap, but we need metadata
          // Actually, my service update returns Observable<PagedResult>, let's capture metadata here
          // Note: The service tap updates the signal with items array.
          // I should capture totalCount here.
          this.totalCount = result.totalCount;
          this.totalPages = result.totalPages;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  // Actions
  onStart(task: Task) { this.taskService.startTask(task.id).subscribe(() => this.loadTasks()); }
  onComplete(task: Task) { this.taskService.completeTask(task.id).subscribe(() => this.loadTasks()); }
  onReset(task: Task) { this.taskService.resetTask(task.id).subscribe(() => this.loadTasks()); }
  onReopen(task: Task) { this.taskService.reopenTask(task.id).subscribe(() => this.loadTasks()); }
  onDelete(task: Task) { if (confirm('Delete?')) this.taskService.deleteTask(task.id).subscribe(() => this.loadTasks()); }
  onRestore(task: Task) { this.taskService.restoreTask(task.id).subscribe(() => this.loadTasks()); }
  onHardDelete(task: Task) { if (confirm('Permanent Delete?')) this.taskService.hardDeleteTask(task.id).subscribe(() => this.loadTasks()); }
}
