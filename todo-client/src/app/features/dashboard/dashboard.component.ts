import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { TaskStats } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="text-secondary">Overview of your tasks</p>
    </div>

    <div class="stats-grid" *ngIf="stats$() as stats; else loading">
      <!-- Status Cards -->
      <div class="card stat-card">
        <h3>Total Tasks</h3>
        <div class="value">{{ stats.totalActive }}</div>
      </div>
      <div class="card stat-card">
        <h3>Created</h3>
        <div class="value text-created">{{ stats.created }}</div>
      </div>
      <div class="card stat-card">
        <h3>In Progress</h3>
        <div class="value text-inprogress">{{ stats.inProgress }}</div>
      </div>
      <div class="card stat-card">
        <h3>Completed</h3>
        <div class="value text-completed">{{ stats.completed }}</div>
      </div>
      <div class="card stat-card" *ngIf="false">
        <h3>Overdue</h3>
        <div class="value text-danger">{{ stats.overdue }}</div>
      </div>
    </div>
    
    <div class="charts-section mt-4" *ngIf="stats$() as stats">
        <div class="card chart-card">
            <h3>Status Distribution</h3>
            <div class="donut-chart" [style]="getDonutGradient(stats)">
                <div class="hole"></div>
            </div>
            <div class="legend">
               <div class="legend-item"><span class="dot created"></span> Created</div>
               <div class="legend-item"><span class="dot inprogress"></span> In Progress</div>
               <div class="legend-item"><span class="dot completed"></span> Completed</div>
            </div>
        </div>
    </div>

    <ng-template #loading>
      <p>Loading stats...</p>
    </ng-template>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card h3 {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    .stat-card .value {
      font-size: 2rem;
      font-weight: 700;
    }
    .text-created { color: var(--status-created); }
    .text-inprogress { color: var(--status-inprogress); }
    .text-completed { color: var(--status-completed); }
    .text-danger { color: #ef4444; }

    .donut-chart {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      position: relative;
      margin: 0 auto;
    }
    .donut-chart .hole {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 140px; height: 140px;
        background: var(--card-bg);
        border-radius: 50%;
    }
    .legend { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.created { background: var(--status-created); }
    .dot.inprogress { background: var(--status-inprogress); }
    .dot.completed { background: var(--status-completed); }
  `]
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
