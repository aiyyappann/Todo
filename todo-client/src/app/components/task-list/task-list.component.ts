import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { UrgencyIconComponent } from '../urgency-icon/urgency-icon.component';
import { TaskStatus, Task, TaskUrgency } from '../../core/models/task.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, UrgencyIconComponent, RouterLink, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
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
