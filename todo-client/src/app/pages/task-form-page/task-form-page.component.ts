import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

@Component({
    selector: 'app-task-form-page',
    standalone: true,
    imports: [CommonModule, TaskFormComponent],
    templateUrl: './task-form-page.component.html'
})
export class TaskFormPageComponent { }
