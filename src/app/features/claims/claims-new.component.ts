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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

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
    MatSnackBarModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <!-- Mobile-first PWA Header -->
    <div class="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button 
            mat-icon-button 
            routerLink="/dashboard" 
            aria-label="Back"
            class="text-gray-700 hover:text-red-600 transition-colors">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-lg font-semibold text-gray-900">File New Claim</h1>
        </div>
        <button 
          mat-button 
          (click)="saveDraft()" 
          class="text-red-600 font-medium text-sm">
          Save Draft
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <mat-progress-bar 
      *ngIf="isSubmitting()" 
      mode="indeterminate" 
      class="sticky top-[65px] z-40">
    </mat-progress-bar>

    <!-- Main Content -->
    <div class="min-h-screen bg-white pb-20">
      <div class="px-4 py-6 space-y-6 max-w-lg mx-auto">
        
        <!-- Accident Details Section -->
        <div class="space-y-4">
          <h2 class="text-base font-medium text-gray-900 flex items-center gap-2">
            <mat-icon class="text-red-600 text-xl">event</mat-icon>
            Accident Details
          </h2>
          
          <form [formGroup]="form" class="space-y-4">
            <!-- Date & Time Row -->
            <div class="grid grid-cols-2 gap-3">
              <mat-form-field appearance="outline" class="mobile-field">
                <mat-label>Date</mat-label>
                <input 
                  matInput 
                  [matDatepicker]="picker" 
                  formControlName="incidentDate" 
                  [max]="maxDate" 
                  required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="form.get('incidentDate')?.hasError('required')">
                  Date required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="mobile-field">
                <mat-label>Time</mat-label>
                <input 
                  matInput 
                  type="time" 
                  formControlName="incidentTime" 
                  required>
                <mat-error *ngIf="form.get('incidentTime')?.hasError('required')">
                  Time required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Police Report -->
            <mat-form-field appearance="outline" class="mobile-field w-full">
              <mat-label>Police Report Number</mat-label>
              <input 
                matInput 
                formControlName="policeReportNumber" 
                placeholder="Optional - if police attended">
              <mat-icon matPrefix class="text-gray-400 mr-2">local_police</mat-icon>
            </mat-form-field>

            <!-- Description -->
            <mat-form-field appearance="outline" class="mobile-field w-full">
              <mat-label>What happened?</mat-label>
              <textarea 
                matInput 
                formControlName="description" 
                rows="4" 
                maxlength="500" 
                placeholder="Describe the accident in detail..."
                required>
              </textarea>
              <mat-hint align="end" class="text-xs">
                {{ form.get('description')?.value?.length || 0 }}/500
              </mat-hint>
              <mat-error *ngIf="form.get('description')?.hasError('required')">
                Description required
              </mat-error>
              <mat-error *ngIf="form.get('description')?.hasError('minlength')">
                Please provide more details (min 20 characters)
              </mat-error>
            </mat-form-field>
          </form>
        </div>

        <!-- Photos Section -->
        <div class="space-y-4">
          <h2 class="text-base font-medium text-gray-900 flex items-center gap-2">
            <mat-icon class="text-red-600 text-xl">photo_camera</mat-icon>
            Photos
          </h2>
          
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              capture="environment"
              (change)="onPhotosSelected($event)" 
              class="hidden" 
              #photoInput>
            
            <div *ngIf="!selectedPhotos.length; else photosList">
              <mat-icon class="text-gray-400 text-3xl mb-2">add_photo_alternate</mat-icon>
              <p class="text-sm text-gray-600 mb-3">Take photos of damage, scene, and documents</p>
              <button 
                mat-raised-button 
                color="primary"
                (click)="photoInput.click()" 
                class="bg-red-600 text-white hover:bg-red-700">
                <mat-icon>camera_alt</mat-icon>
                <span class="ml-2">Take Photos</span>
              </button>
            </div>

            <ng-template #photosList>
              <div class="grid grid-cols-3 gap-2 mb-4">
                <div 
                  *ngFor="let photo of selectedPhotos; let i = index" 
                  class="relative bg-gray-100 rounded-lg p-2">
                  <mat-icon class="text-gray-600">image</mat-icon>
                  <p class="text-xs text-gray-700 mt-1 truncate">{{ photo.name }}</p>
                  <button 
                    mat-icon-button 
                    (click)="removePhoto(i)"
                    class="absolute -top-1 -right-1 bg-red-600 text-white w-5 h-5 text-xs">
                    <mat-icon class="text-sm">close</mat-icon>
                  </button>
                </div>
              </div>
              <button 
                mat-button 
                (click)="photoInput.click()"
                class="text-red-600">
                <mat-icon>add</mat-icon>
                Add More Photos
              </button>
            </ng-template>
          </div>

          <!-- Photo Tips -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <h3 class="text-sm font-medium text-red-800 mb-2">📸 Photo Tips:</h3>
            <ul class="text-xs text-red-700 space-y-1">
              <li>• Vehicle damage from multiple angles</li>
              <li>• License plates of all vehicles</li>
              <li>• Scene overview and road conditions</li>
              <li>• Driver's license and insurance cards</li>
            </ul>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="space-y-4">
          <h2 class="text-base font-medium text-gray-900 flex items-center gap-2">
            <mat-icon class="text-red-600 text-xl">description</mat-icon>
            Documents
          </h2>
          
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
            <input 
              type="file" 
              multiple 
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              (change)="onDocsSelected($event)" 
              class="hidden" 
              #docInput>
            
            <div *ngIf="!selectedDocs.length; else docsList">
              <mat-icon class="text-gray-400 text-3xl mb-2">upload_file</mat-icon>
              <p class="text-sm text-gray-600 mb-3">Upload police reports, witness statements, etc.</p>
              <button 
                mat-stroked-button
                (click)="docInput.click()" 
                class="border-red-600 text-red-600 hover:bg-red-50">
                <mat-icon>attach_file</mat-icon>
                <span class="ml-2">Upload Documents</span>
              </button>
            </div>

            <ng-template #docsList>
              <div class="space-y-2 mb-4">
                <div 
                  *ngFor="let doc of selectedDocs; let i = index"
                  class="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-red-600">description</mat-icon>
                    <span class="text-sm text-gray-700 truncate">{{ doc.name }}</span>
                  </div>
                  <button 
                    mat-icon-button 
                    (click)="removeDoc(i)"
                    class="text-red-600 w-8 h-8">
                    <mat-icon class="text-sm">delete</mat-icon>
                  </button>
                </div>
              </div>
              <button 
                mat-button 
                (click)="docInput.click()"
                class="text-red-600">
                <mat-icon>add</mat-icon>
                Add More Documents
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Bottom Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
      <div class="max-w-lg mx-auto">
        <button 
          mat-raised-button 
          color="primary"
          (click)="submitClaim()" 
          [disabled]="form.invalid || isSubmitting()"
          class="w-full py-3 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 text-base font-medium">
          <mat-icon *ngIf="isSubmitting()" class="animate-spin mr-2">sync</mat-icon>
          {{ isSubmitting() ? 'Submitting Claim...' : 'Submit Claim' }}
        </button>
        
        <p class="text-xs text-gray-500 text-center mt-2">
          You can add more photos and documents after submission
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Mobile-first form field styling */
    :host ::ng-deep .mobile-field .mat-mdc-text-field-wrapper {
      border-radius: 0.75rem !important;
      background-color: #ffffff !important;
    }

    :host ::ng-deep .mobile-field .mdc-notched-outline__leading,
    :host ::ng-deep .mobile-field .mdc-notched-outline__trailing {
      border-radius: 0.75rem !important;
    }

    :host ::ng-deep .mobile-field .mdc-notched-outline__notch {
      border-radius: 0 !important;
    }

    /* Enhanced touch targets for mobile */
    :host ::ng-deep .mobile-field .mat-mdc-form-field-infix {
      min-height: 48px;
      padding: 12px 0;
    }

    /* Red accent colors for form focus states */
    :host ::ng-deep .mobile-field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .mobile-field.mat-focused .mdc-notched-outline__notch,
    :host ::ng-deep .mobile-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #dc2626 !important;
      border-width: 2px !important;
    }

    :host ::ng-deep .mobile-field.mat-focused .mat-mdc-floating-label {
      color: #dc2626 !important;
    }

    /* Button styling */
    :host ::ng-deep .mat-mdc-raised-button.mat-primary {
      --mdc-protected-button-container-color: #dc2626;
      --mdc-protected-button-label-text-color: white;
    }

    :host ::ng-deep .mat-mdc-raised-button.mat-primary:hover {
      --mdc-protected-button-container-color: #b91c1c;
    }

    /* Responsive adjustments */
    @media (min-width: 768px) {
      :host ::ng-deep .mobile-field .mat-mdc-form-field-infix {
        min-height: 44px;
        padding: 10px 0;
      }
    }

    /* Smooth animations */
    .transition-colors {
      transition: color 0.2s ease-in-out;
    }

    /* Loading animation */
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
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

  ngOnInit(): void {
    this.store.dispatch(ClaimsActions.loadDraft());
  }

  onPhotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedPhotos = [...this.selectedPhotos, ...Array.from(input.files)];
    }
  }

  onDocsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedDocs = [...this.selectedDocs, ...Array.from(input.files)];
    }
  }

  removePhoto(index: number): void {
    this.selectedPhotos.splice(index, 1);
  }

  removeDoc(index: number): void {
    this.selectedDocs.splice(index, 1);
  }

  saveDraft(): void {
    const draftData = {
      ...this.form.value,
      photoCount: this.selectedPhotos.length,
      docCount: this.selectedDocs.length
    };
    this.store.dispatch(ClaimsActions.saveDraft({ draftData }));
    this.snackBar.open('✓ Draft saved', '', {
      duration: 2000,
      panelClass: 'success-snackbar'
    });
  }

  submitClaim(): void {
    if (this.form.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    const claimData: ClaimInitiationForm = {
      incidentDate: this.form.value.incidentDate,
      incidentTime: this.form.value.incidentTime,
      location: { country: 'US' },
      claimType: 'auto_collision',
      description: this.form.value.description,
      policeReportFiled: !!this.form.value.policeReportNumber,
      policeReportNumber: this.form.value.policeReportNumber,
      emergencyServices: false,
      injuries: false,
      otherVehiclesInvolved: false,
      photoCount: this.selectedPhotos.length,
      documentCount: this.selectedDocs.length
    };

    this.store.dispatch(ClaimsActions.createClaim({ claimData }));

    // Show success feedback and navigate
    setTimeout(() => {
      this.router.navigate(['/claims']);
      this.snackBar.open('🎉 Claim submitted successfully!', '', {
        duration: 4000,
        panelClass: 'success-snackbar'
      });
    }, 1500);
  }
}