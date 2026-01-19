import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { TaskUrgency } from '../../../../core/models/task.model';

@Component({
    selector: 'app-task-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="card form-card">
      <h2>Create New Task</h2>
      
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Title</label>
          <input id="title" type="text" formControlName="title" placeholder="What needs to be done?">
          <div class="error" *ngIf="taskForm.get('title')?.touched && taskForm.get('title')?.invalid">
            Title is required
          </div>
        </div>

        <div class="row">
          <div class="form-group">
            <label for="deadlineDate">Deadline Date</label>
            <input id="deadlineDate" type="date" formControlName="deadlineDate">
          </div>
          
          <div class="form-group">
            <label for="deadlineTime">Deadline Time (Optional)</label>
            <input id="deadlineTime" type="time" formControlName="deadlineTime">
          </div>
        </div>

        <div class="form-group">
          <label for="urgency">Urgency</label>
          <select id="urgency" formControlName="urgency">
            <option [ngValue]="0">Low</option>
            <option [ngValue]="1">Medium</option>
            <option [ngValue]="2">High</option>
          </select>
        </div>

        <div class="actions">
          <button type="button" class="btn btn-ghost" routerLink="/tasks">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  `,
    styles: [`
    .form-card { max-width: 600px; margin: 2rem auto; }
    h2 { margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-weight: 500; font-size: 0.875rem; color: var(--text-secondary); }
    input, select {
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .error { font-size: 0.75rem; color: #ef4444; }
    .actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
  `]
})
export class TaskFormComponent {
    private fb = inject(FormBuilder);
    private taskService = inject(TaskService);
    private router = inject(Router);

    isSubmitting = false;

    taskForm = this.fb.group({
        title: ['', Validators.required],
        deadlineDate: [new Date().toISOString().split('T')[0], Validators.required],
        deadlineTime: [''],
        urgency: [TaskUrgency.Medium, Validators.required]
    });

    onSubmit() {
        if (this.taskForm.valid) {
            this.isSubmitting = true;
            const val = this.taskForm.value;

            this.taskService.createTask({
                title: val.title!,
                deadlineDate: val.deadlineDate!,
                deadlineTime: val.deadlineTime || undefined,
                urgency: val.urgency!
            }).subscribe({
                next: () => {
                    this.router.navigate(['/tasks']);
                },
                error: (err) => {
                    console.error(err);
                    this.isSubmitting = false;
                }
            });
        }
    }
}
