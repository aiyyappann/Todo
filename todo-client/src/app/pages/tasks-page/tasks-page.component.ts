import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from '../../components/task-list/task-list.component';

@Component({
    selector: 'app-tasks-page',
    standalone: true,
    imports: [CommonModule, TaskListComponent],
    templateUrl: './tasks-page.component.html'
})
export class TasksPageComponent { }
