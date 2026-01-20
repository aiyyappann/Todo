import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { TasksPageComponent } from './pages/tasks-page/tasks-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardPageComponent },
    { path: 'tasks', component: TasksPageComponent },
    { path: 'tasks/new', loadComponent: () => import('./pages/task-form-page/task-form-page.component').then(m => m.TaskFormPageComponent) },
    { path: 'tasks/completed', component: TasksPageComponent, data: { status: 2 } }, // 2 = Completed
    { path: 'tasks/deleted', component: TasksPageComponent, data: { status: 3 } }  // 3 = Deleted
];
