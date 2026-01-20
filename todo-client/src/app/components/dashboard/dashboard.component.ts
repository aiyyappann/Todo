import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { TaskStats } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  taskService = inject(TaskService);
  stats$ = this.taskService.stats;

  ngOnInit() {
    this.taskService.getStats().subscribe();
  }

  getDonutGradient(stats: TaskStats): string {
    const total = stats.created + stats.inProgress + stats.completed;
    if (total === 0) return 'background: #e2e8f0';

    const pCreated = (stats.created / total) * 100;
    const pInProgress = (stats.inProgress / total) * 100;
    const pCompleted = (stats.completed / total) * 100;

    // conic-gradient
    return `background: conic-gradient(
      var(--status-created) 0% ${pCreated}%,
      var(--status-inprogress) ${pCreated}% ${pCreated + pInProgress}%,
      var(--status-completed) ${pCreated + pInProgress}% 100%
    )`;
  }
}
