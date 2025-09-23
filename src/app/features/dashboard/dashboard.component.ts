import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';

import { ResponsiveService } from '../../core/services/responsive.service';
import * as ClaimsActions from '../../store/claims/claims.actions';
import { 
  selectRecentClaims, 
  selectClaimsSummary, 
  selectClaimsLoading
} from '../../store/claims/claims.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatRippleModule
  ],
  template: `
    <div [class]="containerClasses()">
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Insurance Claims Dashboard</h1>
            <p class="text-gray-600">Quickly file new claims and track existing ones</p>
          </div>
          @if (!responsiveService.isMobile()) {
            <div class="flex space-x-3">
              <button 
                mat-raised-button 
                color="primary"
                routerLink="/claims/new"
                class="btn-primary">
                <mat-icon>add</mat-icon>
                New Claim
              </button>
              <button 
                mat-stroked-button
                (click)="refreshData()"
                [disabled]="isLoading()">
                <mat-icon>refresh</mat-icon>
                Refresh
              </button>
            </div>
          }
        </div>

        @if (responsiveService.isMobile()) {
          <div class="flex space-x-3 mb-6">
            <button 
              mat-raised-button 
              color="primary"
              routerLink="/claims/new"
              class="flex-1 btn-primary">
              <mat-icon>add</mat-icon>
              New Claim
            </button>
            <button 
              mat-icon-button
              (click)="refreshData()"
              [disabled]="isLoading()"
              class="border border-gray-300">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        }
      </div>

      <!-- Stats (simplified) -->
      <div [class]="statsRowClasses()" class="mb-8">
        <div class="card w-full flex-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Claims</p>
              <p class="text-2xl font-bold text-gray-900">{{ claimsSummary()?.totalClaims || 0 }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <mat-icon class="text-blue-600">description</mat-icon>
            </div>
          </div>
        </div>

        <div class="card w-full flex-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Pending</p>
              <p class="text-2xl font-bold text-orange-600">{{ claimsSummary()?.pendingClaims || 0 }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-xl">
              <mat-icon class="text-orange-600">hourglass_empty</mat-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Claims -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Recent Claims</h2>
          <button 
            mat-button 
            routerLink="/claims"
            class="text-primary-600 hover:text-primary-700">
            View All
          </button>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-8">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (recentClaims().length === 0) {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-gray-300 mb-4">description</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No Claims Yet</h3>
            <p class="text-gray-600 mb-4">Start by filing your first insurance claim</p>
            <button 
              mat-raised-button 
              color="primary"
              routerLink="/claims/new">
              File Your First Claim
            </button>
          </div>
        } @else {
          <div class="space-y-4">
            @for (claim of recentClaims(); track claim.id) {
              <div class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center space-x-3">
                    <div [class]="getClaimTypeIconClass(claim.type)" class="p-2 rounded-lg">
                      <mat-icon>{{ getClaimTypeIcon(claim.type) }}</mat-icon>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ claim.claimNumber }}</h3>
                      <p class="text-sm text-gray-600">{{ claim.type | titlecase }}</p>
                    </div>
                  </div>
                  <mat-chip 
                    [class]="getStatusChipClass(claim.status)"
                    class="text-xs font-medium">
                    {{ claim.status | titlecase }}
                  </mat-chip>
                </div>
                
                <p class="text-sm text-gray-700 mb-3 line-clamp-2">{{ claim.description }}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-600">
                  <span>{{ claim.dateReported | date:'mediumDate' }}</span>
                  <span>{{ claim.estimatedDamage | currency }}</span>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Floating Action Button for Mobile -->
      @if (responsiveService.isMobile()) {
        <button 
          mat-fab
          color="primary"
          routerLink="/claims/new"
          class="fixed bottom-6 right-6 z-10 shadow-lg">
          <mat-icon>add</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    mat-chip {
      border-radius: 12px !important;
    }

    .mat-mdc-fab {
      box-shadow: 0 8px 24px rgba(229, 57, 53, 0.3) !important;
    }

    @media (max-width: 640px) {
      .card {
        margin-left: -1rem;
        margin-right: -1rem;
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private store = inject(Store);
  protected responsiveService = inject(ResponsiveService);

  // Store selectors
  readonly recentClaims = this.store.selectSignal(selectRecentClaims);
  readonly claimsSummary = this.store.selectSignal(selectClaimsSummary);
  readonly isLoading = this.store.selectSignal(selectClaimsLoading);

  // Responsive computed properties
  readonly containerClasses = computed(() => {
    return this.responsiveService.containerClass() + ' safe-area-top safe-area-bottom min-h-screen bg-gray-50 flex flex-col';
  });

  readonly statsRowClasses = computed(() => {
    const base = 'gap-4 mx-auto';
    if (this.responsiveService.isMobile()) {
      return `flex flex-col ${base}`;
    }
    return `flex flex-row items-start justify-center ${base}`;
  });

  ngOnInit(): void {
    this.store.dispatch(ClaimsActions.loadClaims({}));
  }

  refreshData(): void {
    this.store.dispatch(ClaimsActions.refreshClaims());
  }

  // UI Helper Methods
  getClaimTypeIcon(type: string): string {
    switch (type) {
      case 'auto_collision': return 'car_crash';
      case 'auto_comprehensive': return 'directions_car';
      case 'auto_liability': return 'gavel';
      case 'property_damage': return 'home';
      case 'theft': return 'security';
      case 'vandalism': return 'warning';
      case 'natural_disaster': return 'storm';
      case 'personal_injury': return 'personal_injury';
      case 'medical': return 'medical_services';
      default: return 'description';
    }
  }

  getClaimTypeIconClass(type: string): string {
    const base = 'text-white';
    switch (type) {
      case 'auto_collision': return `${base} bg-red-500`;
      case 'auto_comprehensive': return `${base} bg-blue-500`;
      case 'auto_liability': return `${base} bg-purple-500`;
      case 'property_damage': return `${base} bg-green-500`;
      case 'theft': return `${base} bg-orange-500`;
      case 'vandalism': return `${base} bg-yellow-500`;
      case 'natural_disaster': return `${base} bg-indigo-500`;
      case 'personal_injury': return `${base} bg-pink-500`;
      case 'medical': return `${base} bg-teal-500`;
      default: return `${base} bg-gray-500`;
    }
  }

  getStatusChipClass(status: string): string {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return 'status-new';
      case 'investigating':
      case 'processing':
        return 'status-processing';
      case 'approved':
      case 'partially_approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }
}
