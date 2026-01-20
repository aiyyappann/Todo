import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';

@Component({
    selector: 'app-dashboard-page',
    standalone: true,
    imports: [CommonModule, DashboardComponent],
    templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent { }
