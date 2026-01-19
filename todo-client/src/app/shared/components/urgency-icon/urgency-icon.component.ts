import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskUrgency } from '../../../core/models/task.model';

@Component({
    selector: 'app-urgency-icon',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="urgency" [title]="urgencyLabel">
      <div class="dot" [ngClass]="urgencyClass"></div>
      <span class="label">{{ urgencyLabel }}</span>
    </div>
  `,
    styles: [`
    .urgency { display: flex; align-items: center; gap: 0.5rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .label { font-size: 0.875rem; color: var(--text-secondary, #64748b); }
    .urgency-low { background-color: #22c55e; }
    .urgency-medium { background-color: #f59e0b; }
    .urgency-high { background-color: #ef4444; box-shadow: 0 0 0 2px #fee2e2; }
  `]
})
export class UrgencyIconComponent {
    @Input({ required: true }) urgency!: TaskUrgency;

    get urgencyLabel(): string {
        return TaskUrgency[this.urgency];
    }

    get urgencyClass(): string {
        switch (this.urgency) {
            case TaskUrgency.Low: return 'urgency-low';
            case TaskUrgency.Medium: return 'urgency-medium';
            case TaskUrgency.High: return 'urgency-high';
            default: return '';
        }
    }
}
