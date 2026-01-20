import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { TaskUrgency } from '../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
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
