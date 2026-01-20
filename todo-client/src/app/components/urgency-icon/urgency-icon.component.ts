import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskUrgency } from '../../core/models/task.model';

@Component({
  selector: 'app-urgency-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urgency-icon.component.html',
  styleUrls: ['./urgency-icon.component.css']
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
