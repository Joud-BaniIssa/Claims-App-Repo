import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ResponsiveService } from '../../core/services/responsive.service';

interface AppNotification {
  id: string;
  type: 'claim' | 'workshop' | 'general';
  title: string;
  message: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div [class]="containerClasses()">
      <div class="mb-4 flex items-center gap-3">
        <button mat-icon-button routerLink="/dashboard" aria-label="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
          <p class="text-gray-600">Claims and workshop updates</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div class="card" *ngFor="let n of notifications">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 [ngClass]="{
                   'bg-primary-50 text-primary-700': n.type === 'claim',
                   'bg-yellow-50 text-yellow-700': n.type === 'workshop',
                   'bg-gray-100 text-gray-700': n.type === 'general'
                 }">
              <mat-icon>{{ n.icon }}</mat-icon>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h2 class="font-semibold text-gray-900">{{ n.title }}</h2>
                <span class="text-xs text-gray-500">{{ n.time }}</span>
              </div>
              <p class="text-gray-700 mt-1">{{ n.message }}</p>
              <div class="mt-2 flex items-center gap-2">
                <a *ngIf="n.type==='claim'" routerLink="/claims" class="text-primary-700 hover:underline text-sm">View claim</a>
                <a *ngIf="n.type==='workshop'" routerLink="/workshop" class="text-primary-700 hover:underline text-sm">View workshop</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent {
  protected responsiveService = inject(ResponsiveService);
  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' py-6 min-h-screen bg-gray-50');

  notifications: AppNotification[] = [
    { id: 'n1', type: 'claim', title: 'Claim Approved', message: 'CLA-0004 was approved. Repair can be scheduled.', time: '2h ago', icon: 'check_circle' },
    { id: 'n2', type: 'workshop', title: 'Workshop Update', message: 'Job WRK-1024 is 60% complete. Parts arriving tomorrow.', time: '5h ago', icon: 'build' },
    { id: 'n3', type: 'claim', title: 'Claim Denied', message: 'CLA-0005 denied: Missing documents. You can resubmit.', time: '1d ago', icon: 'cancel' }
  ];
}
