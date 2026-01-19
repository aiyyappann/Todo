import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskListComponent } from './features/tasks/pages/task-list/task-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'tasks', component: TaskListComponent },
    { path: 'tasks/new', loadComponent: () => import('./features/tasks/components/task-form/task-form.component').then(m => m.TaskFormComponent) },
    { path: 'tasks/completed', component: TaskListComponent, data: { status: 2 } }, // 2 = Completed
    { path: 'tasks/deleted', component: TaskListComponent, data: { status: 3 } }, // 3 = Deleted

];
