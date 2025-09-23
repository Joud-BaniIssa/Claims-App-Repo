import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatToolbarModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <div class="app-shell">
      <!-- Top Header -->
      <mat-toolbar class="topbar">
        <a routerLink="/dashboard" class="brand">
          <div class="logo"><mat-icon>security</mat-icon></div>
          <div class="brand-text">
            <div class="title">InsuranceAI</div>
            <div class="subtitle">Claims Platform</div>
          </div>
        </a>
        <span class="spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="profileMenu" aria-label="Profile">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #profileMenu="matMenu">
          <button mat-menu-item routerLink="/profile"><mat-icon>person</mat-icon><span>Profile</span></button>
          <button mat-menu-item routerLink="/settings"><mat-icon>settings</mat-icon><span>Settings</span></button>
          <button mat-menu-item routerLink="/documents"><mat-icon>folder</mat-icon><span>Document vault</span></button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="onLogout()"><mat-icon>logout</mat-icon><span>Logout</span></button>
        </mat-menu>
      </mat-toolbar>

      <div class="content pt-16 pb-20">
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

    .topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: #fff; color: #212121; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 0 16px; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; }
    .logo { width: 32px; height: 32px; border-radius: 8px; background: #fff; display:flex; align-items:center; justify-content:center; border:1px solid #eee; }
    .brand-text .title { font-weight: 700; line-height: 1; }
    .brand-text .subtitle { font-size: 12px; color: #616161; line-height: 1; }
    .spacer { flex: 1 1 auto; }

    .bottom-nav {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: center;
      height: 64px;
      padding-bottom: env(safe-area-inset-bottom);
      box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
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
