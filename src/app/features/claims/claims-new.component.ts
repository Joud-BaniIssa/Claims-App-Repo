import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ResponsiveService } from '../../core/services/responsive.service';
import * as ClaimsActions from '../../store/claims/claims.actions';
import { selectClaimsSubmitting, selectClaimsError } from '../../store/claims/claims.selectors';
import { ClaimInitiationForm } from '../../models/claims.model';

@Component({
  selector: 'app-claims-new',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <div [class]="containerClasses()">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button mat-icon-button routerLink="/dashboard" aria-label="Back">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1 class="page-title text-3xl font-bold text-gray-900">File New Claim</h1>
            </div>
          </div>
          <button mat-stroked-button (click)="saveDraft()">Save Draft</button>
        </div>
      </div>

      <div class="mx-auto w-full max-w-screen-sm space-y-5">
        <form [formGroup]="form" class="space-y-5">
          <!-- Date of Incident -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Date of Incident</label>
            <div class="box">
              <input
                type="date"
                class="input"
                formControlName="incidentDate"
                required
              />
            </div>
            <p class="error" *ngIf="form.get('incidentDate')?.invalid && form.get('incidentDate')?.touched">Required</p>
          </div>

          <!-- Incident Description -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Incident Description</label>
            <div class="box">
              <textarea
                rows="4"
                class="input resize-none"
                placeholder="Describe what happened..."
                formControlName="description"
                maxlength="500"
                required
              ></textarea>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span *ngIf="form.get('description')?.invalid && form.get('description')?.touched">Min 20 characters</span>
              <span>{{ form.get('description')?.value?.length || 0 }}/500</span>
            </div>
          </div>

          <!-- Police Report Number -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Police Report Number</label>
            <div class="box">
              <input
                type="text"
                class="input"
                placeholder="Optional (e.g. PRN-12345)"
                formControlName="policeReportNumber"
              />
            </div>
          </div>

          <div class="pt-2 flex justify-end">
            <button mat-raised-button color="warn" type="button" (click)="submitClaim()" [disabled]="form.invalid || isSubmitting()">
              {{ isSubmitting() ? 'Submitting...' : 'Submit Claim' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    @media (max-width: 640px) { .card { margin-left: -1rem; margin-right: -1rem; border-radius: 0; border-left: none; border-right: none; } }

    .box { @apply bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm focus-within:border-primary-500 focus-within:ring-2 ring-primary-100; }
    .input { @apply w-full bg-transparent outline-none text-gray-900 placeholder-gray-400; }
    .error { @apply text-xs text-red-600 mt-1; }
    .page-title { line-height: 36px; }
    @media (max-width: 640px) { .page-title { font-size: 18px; line-height: 24px; } }
  `]
})
export class ClaimsNewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  protected responsiveService = inject(ResponsiveService);

  form: FormGroup = this.fb.group({
    incidentDate: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
    policeReportNumber: ['']
  });

  readonly isSubmitting = this.store.selectSignal(selectClaimsSubmitting);
  readonly error = this.store.selectSignal(selectClaimsError);

  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' safe-area-top safe-area-bottom min-h-screen bg-gray-50 flex flex-col');

  ngOnInit(): void {
    this.store.dispatch(ClaimsActions.loadDraft());
  }

  saveDraft(): void {
    const draftData = { ...this.form.value };
    this.store.dispatch(ClaimsActions.saveDraft({ draftData }));
    this.snackBar.open('Draft saved', 'Close', { duration: 2000 });
  }

  submitClaim(): void {
    if (this.form.invalid) return;

    const claimData: ClaimInitiationForm = {
      incidentDate: new Date(this.form.value.incidentDate),
      incidentTime: '00:00',
      location: { country: 'US' },
      claimType: 'other',
      description: this.form.value.description,
      policeReportFiled: !!this.form.value.policeReportNumber,
      policeReportNumber: this.form.value.policeReportNumber,
      emergencyServices: false,
      injuries: false,
      otherVehiclesInvolved: false
    };

    this.store.dispatch(ClaimsActions.createClaim({ claimData }));

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      this.snackBar.open('Claim submitted', 'Close', { duration: 3000 });
    }, 1200);
  }
}
