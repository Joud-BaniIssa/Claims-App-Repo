import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { ResponsiveService } from '../../core/services/responsive.service';
import * as ClaimsActions from '../../store/claims/claims.actions';
import { selectClaimsSubmitting, selectClaimsError } from '../../store/claims/claims.selectors';
import { ClaimInitiationForm } from '../../models/claims.model';

@Component({
  selector: 'app-claims-new',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div [class]="containerClasses()">
      <!-- Header -->
      <div class="mb-4">
        <div class="flex items-center space-x-3">
          <button mat-icon-button routerLink="/dashboard" aria-label="Back">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">New Claim</h1>
            <p class="text-gray-600">Minimal, fast submission</p>
          </div>
        </div>
      </div>

      <!-- Minimalist Form Card (white boxes, red buttons) -->
      <div class="card">
        <form [formGroup]="form" class="space-y-5">
          <!-- Date & Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Date of Incident</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="incidentDate" [max]="maxDate" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('incidentDate')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Time of Incident</mat-label>
              <input matInput type="time" formControlName="incidentTime" required>
              <mat-error *ngIf="form.get('incidentTime')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <!-- Police report number -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Police Report Number (optional)</mat-label>
            <input matInput formControlName="policeReportNumber" placeholder="e.g. PRN-12345" />
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="4" maxlength="500" placeholder="Describe what happened..." required></textarea>
            <mat-hint align="end">{{ form.get('description')?.value?.length || 0 }}/500</mat-hint>
            <mat-error *ngIf="form.get('description')?.hasError('required')">Required</mat-error>
            <mat-error *ngIf="form.get('description')?.hasError('minlength')">Min 20 characters</mat-error>
          </mat-form-field>

          <!-- Uploads -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
              <input type="file" accept="image/*" multiple (change)="onPhotosSelected($event)" class="hidden" #photoInput>
              <button mat-stroked-button (click)="photoInput.click()">
                <mat-icon>photo_camera</mat-icon>
                Select Photos
              </button>
              <ul class="mt-2 text-sm text-gray-600 list-disc list-inside" *ngIf="selectedPhotos.length">
                <li *ngFor="let f of selectedPhotos">{{ f.name }}</li>
              </ul>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
              <input type="file" multiple (change)="onDocsSelected($event)" class="hidden" #docInput>
              <button mat-stroked-button (click)="docInput.click()">
                <mat-icon>upload_file</mat-icon>
                Select Documents
              </button>
              <ul class="mt-2 text-sm text-gray-600 list-disc list-inside" *ngIf="selectedDocs.length">
                <li *ngFor="let f of selectedDocs">{{ f.name }}</li>
              </ul>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-2">
            <button mat-stroked-button type="button" (click)="saveDraft()">Save Draft</button>
            <button mat-raised-button color="warn" type="button" (click)="submitClaim()" [disabled]="form.invalid || isSubmitting()">
              {{ isSubmitting() ? 'Submitting...' : 'Submit Claim' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .mat-form-field { width: 100%; }
    @media (max-width: 640px) { .card { margin-left: -1rem; margin-right: -1rem; border-left: none; border-right: none; border-radius: 0; } }
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
    incidentTime: ['', Validators.required],
    policeReportNumber: [''],
    description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]]
  });

  readonly isSubmitting = this.store.selectSignal(selectClaimsSubmitting);
  readonly error = this.store.selectSignal(selectClaimsError);
  readonly maxDate = new Date();

  selectedPhotos: File[] = [];
  selectedDocs: File[] = [];

  readonly containerClasses = computed(() => {
    return this.responsiveService.containerClass() + ' py-6 min-h-screen bg-gray-50';
  });

  ngOnInit(): void {
    this.store.dispatch(ClaimsActions.loadDraft());
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedPhotos = Array.from(input.files);
    }
  }

  onDocsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedDocs = Array.from(input.files);
    }
  }

  saveDraft(): void {
    const draftData = { ...this.form.value };
    this.store.dispatch(ClaimsActions.saveDraft({ draftData }));
    this.snackBar.open('Draft saved', 'Close', { duration: 2000 });
  }

  submitClaim(): void {
    if (this.form.invalid) return;

    const claimData: ClaimInitiationForm = {
      incidentDate: this.form.value.incidentDate,
      incidentTime: this.form.value.incidentTime,
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
      this.snackBar.open('Claim submitted. You can add photos/documents in claim details.', 'Close', { duration: 5000 });
    }, 1500);
  }
}
