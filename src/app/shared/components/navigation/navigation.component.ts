import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="app-shell">
      <div class="content pb-20">
        <ng-content></ng-content>
      </div>

      <!-- Fixed Bottom Navigation -->
      <nav class="bottom-nav fixed bottom-0 left-0 right-0 bg-white safe-area-bottom">
        <a
          routerLink="/dashboard"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="bn-link">
          <mat-icon>dashboard</mat-icon>
          <span>Dashboard</span>
        </a>
        <a
          routerLink="/claims"
          routerLinkActive="active"
          class="bn-link">
          <mat-icon>description</mat-icon>
          <span>Claims</span>
        </a>
        <a
          routerLink="/workshop"
          routerLinkActive="active"
          class="bn-link">
          <mat-icon>build</mat-icon>
          <span>Workshop</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
    .content { flex: 1 1 auto; }

    .bottom-nav {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: center;
      height: 64px;
      padding-bottom: env(safe-area-inset-bottom);
      box-shadow: 0 -2px 16px rgba(0,0,0,0.06);
      border-top: none;
      z-index: 50;
    }

    .bn-link {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: #424242; /* gray-800 */
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
    }

    .bn-link mat-icon { font-size: 22px; height: 22px; width: 22px; }

    .bn-link.active { color: #e53935; /* primary-500 red */ }
  `]
})
export class NavigationComponent {
  readonly toolbarClasses = computed(() => '');
}
