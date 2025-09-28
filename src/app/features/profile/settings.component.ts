import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div [class]="containerClasses()">
      <div class="mb-4 flex items-center space-x-3">
        <button mat-icon-button routerLink="/dashboard" aria-label="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
          <p class="text-gray-600">Manage preferences and app settings</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Notifications</h2>
          <p class="text-gray-600 mb-4">Enable push notifications to receive claim and workshop updates.</p>
          <button mat-raised-button color="warn">Enable Notifications</button>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Privacy</h2>
          <p class="text-gray-600 mb-4">Control access to your data and documents.</p>
          <button mat-stroked-button>Manage Privacy</button>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  protected responsiveService = inject(ResponsiveService);
  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' py-6 min-h-screen bg-gray-50');
}
