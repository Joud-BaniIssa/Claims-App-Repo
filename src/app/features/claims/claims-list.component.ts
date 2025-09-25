import { Component, OnInit, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ClaimsActions from '../../store/claims/claims.actions';
import { selectRecentClaims } from '../../store/claims/claims.selectors';
import { Claim } from '../../models/claims.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container-mobile p-6">
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3 mx-auto sm:mx-0">
          <button mat-icon-button routerLink="/dashboard" aria-label="Back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="mr-5 sm:mr-0">
            <h1 class="text-2xl font-bold text-gray-900">Claims</h1>
            <p class="text-gray-600">File and track your claims</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <!-- File New Claim -->
        <div class="card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <mat-icon class="text-primary-700">note_add</mat-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">File a New Claim</h2>
              <p class="text-gray-600 text-sm">Quick process with photos and documents</p>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <ul class="list-disc list-inside text-gray-700 text-sm">
              <li>Accident details (date, time, description)</li>
              <li>Upload photos and documents</li>
              <li>Submit for immediate review</li>
            </ul>
            <button mat-raised-button color="warn" routerLink="/claims/new">Start</button>
          </div>
        </div>

        <!-- Track Claims -->
        <div class="card">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <mat-icon class="text-gray-700">assignment</mat-icon>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Track Claims</h2>
              <p class="text-gray-600 text-sm">Status updates and decisions</p>
            </div>
          </div>
          <ul class="divide-y divide-gray-100">
            <li class="py-3 flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">CLA-0001 • Auto Collision</p>
                <p class="text-sm text-gray-600">Filed 2d ago</p>
              </div>
              <span class="px-3 py-1 rounded-lg status-processing text-sm">Pending</span>
            </li>
            <li class="py-3 flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">CLA-0004 • Auto Comprehensive</p>
                <p class="text-sm text-gray-600">Filed 1w ago</p>
              </div>
              <span class="px-3 py-1 rounded-lg status-approved text-sm">Approved</span>
            </li>
            <li class="py-3 flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">CLA-0005 • Vandalism</p>
                <p class="text-sm text-gray-600">Filed 1w ago</p>
              </div>
              <span class="px-3 py-1 rounded-lg status-rejected text-sm">Denied</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
,
  styles: [`
    .scroll-list { max-height: 60vh; overflow-y: auto; }
  `]
})
export class ClaimsListComponent implements OnInit {
  private store = inject(Store);

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

  readonly recentClaims = this.store.selectSignal(selectRecentClaims);
  readonly displayedClaims = computed(() => {
    const list = this.recentClaims();
    return (Array.isArray(list) && list.length > 0) ? list : this.mockClaims;
  });

  ngOnInit(): void {
    this.store.dispatch(ClaimsActions.loadClaims({}));
  }

  normalizeStatusLabel(status: string): 'Approved' | 'Pending' | 'Denied' {
    const s = (status || '').toLowerCase();
    if (s === 'approved' || s === 'partially_approved') return 'Approved';
    if (s === 'rejected' || s === 'denied') return 'Denied';
    return 'Pending';
  }

  getStatusChipClass(status: string): string {
    const label = this.normalizeStatusLabel(status);
    if (label === 'Approved') return 'bg-green-100 text-green-800 border border-green-200';
    if (label === 'Denied') return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
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
}
