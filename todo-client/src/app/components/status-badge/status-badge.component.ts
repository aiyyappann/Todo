import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css']
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: TaskStatus;

  get statusLabel(): string {
    return TaskStatus[this.status];
  }

  get statusClass(): string {
    switch (this.status) {
      case TaskStatus.Created: return 'status-created';
      case TaskStatus.InProgress: return 'status-inprogress';
      case TaskStatus.Completed: return 'status-completed';
      case TaskStatus.Deleted: return 'status-deleted';
      default: return '';
    }
  }
}
