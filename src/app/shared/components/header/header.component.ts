import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar class="topbar">
      <a routerLink="/dashboard" class="brand">
        <div class="logo"><mat-icon>security</mat-icon></div>
        <div class="brand-text">
          <div class="title">InsuranceAI</div>
          <div class="subtitle">Claims Platform</div>
        </div>
      </a>
      <span class="spacer"></span>
      <button mat-icon-button routerLink="/notifications" aria-label="Notifications">
        <mat-icon>notifications</mat-icon>
      </button>
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
  `,
  styles: [`
    .topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: #fff; color: #212121; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 0 16px; }
    .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; }
    .logo { width: 32px; height: 32px; border-radius: 8px; background: #fff; display:flex; align-items:center; justify-content:center; border:1px solid #eee; }
    .brand-text .title { font-weight: 700; line-height: 1; }
    .brand-text .subtitle { font-size: 12px; color: #616161; line-height: 1; }
    .spacer { flex: 1 1 auto; }
  `]
})
export class HeaderComponent {
  onLogout() {
    console.log('Logout');
  }
}
