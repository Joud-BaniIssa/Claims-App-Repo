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
import { Claim } from '../../models/claims.model';

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
            <div class="flex flex-col items-end space-y-2">
              <button
                mat-raised-button
                color="primary"
                routerLink="/claims/new"
                class="btn-primary">
                <mat-icon>add</mat-icon>
                New Claim
              </button>
              <div class="flex items-center space-x-2">
                <button
                  mat-stroked-button
                  [routerLink]="['/claims/new']"
                  [queryParams]="{ workshop: true }">
                  <mat-icon>build</mat-icon>
                  Workshop
                </button>
                <button
                  mat-stroked-button
                  (click)="refreshData()"
                  [disabled]="isLoading()">
                  <mat-icon>refresh</mat-icon>
                  Refresh
                </button>
              </div>
            </div>
          }
        </div>

        @if (responsiveService.isMobile()) {
          <div class="flex flex-col space-y-2 mb-6">
            <div class="flex space-x-3">
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
            <button
              mat-stroked-button
              [routerLink]="['/claims/new']"
              [queryParams]="{ workshop: true }"
              class="w-full">
              <mat-icon>build</mat-icon>
              Workshop
            </button>
          </div>
        }
      </div>


      <!-- Recent Claims -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Track Claims</h2>
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
        } @else {
          <div class="space-y-4">
            @for (claim of displayedClaims(); track claim.id) {
              <div class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div [class]="getClaimTypeIconClass(claim.type)" class="p-2 rounded-lg">
                      <mat-icon>{{ getClaimTypeIcon(claim.type) }}</mat-icon>
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900">{{ claim.claimNumber }}</h3>
                      <p class="text-sm text-gray-600">{{ getClaimTypeLabel(claim.type) }}</p>
                    </div>
                  </div>
                  <mat-chip
                    [class]="getStatusChipClass(claim.status)"
                    class="text-xs font-medium">
                    {{ normalizeStatusLabel(claim.status) }}
                  </mat-chip>
                </div>
              </div>
            }
          </div>
        }
      </div>

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

  // Mock recent claims fallback
  readonly mockClaims: Claim[] = [
    {
      id: '1', claimNumber: 'CLA-0001', policyNumber: 'POL-12345', status: 'submitted', type: 'auto_collision',
      dateReported: new Date(), dateOfIncident: new Date(), location: { address: '', city: '', state: '', zipCode: '', country: 'US' },
      description: 'Rear bumper collision at intersection.', documents: [], photos: [], timeline: [], deductible: 500, createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '2', claimNumber: 'CLA-0002', policyNumber: 'POL-55555', status: 'under_review', type: 'property_damage',
      dateReported: new Date(), dateOfIncident: new Date(), location: { address: '', city: '', state: '', zipCode: '', country: 'US' },
      description: 'Storm damage to roof shingles.', documents: [], photos: [], timeline: [], deductible: 1000, createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '3', claimNumber: 'CLA-0003', policyNumber: 'POL-77777', status: 'processing', type: 'theft',
      dateReported: new Date(), dateOfIncident: new Date(), location: { address: '', city: '', state: '', zipCode: '', country: 'US' },
      description: 'Stolen catalytic converter.', documents: [], photos: [], timeline: [], deductible: 250, createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '4', claimNumber: 'CLA-0004', policyNumber: 'POL-88888', status: 'approved', type: 'auto_comprehensive',
      dateReported: new Date(), dateOfIncident: new Date(), location: { address: '', city: '', state: '', zipCode: '', country: 'US' },
      description: 'Windshield cracked by debris.', documents: [], photos: [], timeline: [], deductible: 200, createdAt: new Date(), updatedAt: new Date()
    },
    {
      id: '5', claimNumber: 'CLA-0005', policyNumber: 'POL-99999', status: 'rejected', type: 'vandalism',
      dateReported: new Date(), dateOfIncident: new Date(), location: { address: '', city: '', state: '', zipCode: '', country: 'US' },
      description: 'Graffiti on garage door.', documents: [], photos: [], timeline: [], deductible: 300, createdAt: new Date(), updatedAt: new Date()
    }
  ];

  readonly displayedClaims = computed(() => {
    const list = this.recentClaims();
    return (Array.isArray(list) && list.length > 0) ? list : this.mockClaims;
  });

  // Store selectors
  readonly recentClaims = this.store.selectSignal(selectRecentClaims);
  readonly claimsSummary = this.store.selectSignal(selectClaimsSummary);
  readonly isLoading = this.store.selectSignal(selectClaimsLoading);

  // Responsive computed properties
  readonly containerClasses = computed(() => {
    return this.responsiveService.containerClass() + ' safe-area-top safe-area-bottom min-h-screen bg-gray-50 flex flex-col';
  });

  ngOnInit(): void {
    this.store.dispatch(ClaimsActions.loadClaims({}));
  }

  refreshData(): void {
    this.store.dispatch(ClaimsActions.refreshClaims());
  }

  // UI Helper Methods
  normalizeStatusLabel(status: string): 'Approved' | 'Pending' | 'Denied' {
    const s = (status || '').toLowerCase();
    if (s === 'approved' || s === 'partially_approved') return 'Approved';
    if (s === 'rejected' || s === 'denied') return 'Denied';
    return 'Pending';
  }

  getClaimTypeLabel(type: string): string {
    switch (type) {
      case 'auto_collision': return 'Auto Collision';
      case 'auto_comprehensive': return 'Auto Comprehensive';
      case 'auto_liability': return 'Auto Liability';
      case 'property_damage': return 'Property Damage';
      case 'theft': return 'Theft';
      case 'vandalism': return 'Vandalism';
      case 'natural_disaster': return 'Natural Disaster';
      case 'personal_injury': return 'Personal Injury';
      case 'medical': return 'Medical';
      default: return 'Claim';
    }
  }

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
    return 'text-white bg-primary-500';
  }

  getStatusChipClass(status: string): string {
    const label = this.normalizeStatusLabel(status);
    if (label === 'Approved') return 'bg-green-100 text-green-800 border border-green-200';
    if (label === 'Denied') return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  }
}
