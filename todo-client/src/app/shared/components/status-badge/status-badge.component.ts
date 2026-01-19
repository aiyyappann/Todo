import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskStatus } from '../../../core/models/task.model';

@Component({
    selector: 'app-status-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span class="badge" [ngClass]="statusClass">
      {{ statusLabel }}
    </span>
  `,
    styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status-created { background: #e0f2fe; color: #0284c7; }
    .status-inprogress { background: #fef3c7; color: #d97706; }
    .status-completed { background: #dcfce7; color: #16a34a; }
    .status-deleted { background: #fee2e2; color: #dc2626; }
  `]
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
