import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="logo">
        <a routerLink="/">TaskMaster</a>
      </div>
      <ul class="nav-links">
        <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
        <li><a routerLink="/tasks" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Tasks</a></li>

        <li><a routerLink="/tasks/completed" routerLinkActive="active">Completed</a></li>
        <li><a routerLink="/tasks/deleted" routerLinkActive="active">Deleted</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: var(--card-bg, #ffffff);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .logo a {
      font-size: 1.5rem;
      font-weight: 700;
      text-decoration: none;
      color: var(--primary, #3b82f6);
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nav-links a {
      text-decoration: none;
      color: var(--text-secondary, #64748b);
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--primary, #3b82f6);
    }
  `]
})
export class NavbarComponent { }
