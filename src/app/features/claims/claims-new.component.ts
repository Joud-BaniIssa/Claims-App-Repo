import { Component, OnInit, inject, computed } from '@angular/core';
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
      <!-- Header (matches dashboard style) -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button mat-icon-button routerLink="/dashboard" aria-label="Back">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">File New Claim</h1>
              <p class="text-gray-600">Provide incident details and submit</p>
            </div>
          </div>
          <button mat-stroked-button (click)="saveDraft()">Save Draft</button>
        </div>
      </div>

      <div class="mx-auto w-full max-w-screen-md space-y-6">
        <!-- Accident Details Card -->
        <div class="card">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Accident Details</h2>
          <form [formGroup]="form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline" class="form-field w-full">
              <mat-label>Date of Incident</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="incidentDate" [max]="maxDate" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="form.get('incidentDate')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field w-full">
              <mat-label>Time of Incident</mat-label>
              <input matInput type="time" formControlName="incidentTime" required>
              <mat-error *ngIf="form.get('incidentTime')?.hasError('required')">Required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field md:col-span-2 w-full">
              <mat-label>Police Report Number (optional)</mat-label>
              <input matInput formControlName="policeReportNumber" placeholder="e.g. PRN-12345" />
              <mat-icon matPrefix>local_police</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field md:col-span-2 w-full">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="4" maxlength="500" placeholder="Describe what happened..." required></textarea>
              <mat-hint align="end">{{ form.get('description')?.value?.length || 0 }}/500</mat-hint>
              <mat-error *ngIf="form.get('description')?.hasError('required')">Required</mat-error>
              <mat-error *ngIf="form.get('description')?.hasError('minlength')">Min 20 characters</mat-error>
            </mat-form-field>
          </form>
        </div>

        <!-- Uploads Card -->
        <div class="card">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Uploads</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-800 mb-2">Photos</label>
              <input type="file" accept="image/*" multiple (change)="onPhotosSelected($event)" class="hidden" #photoInput>
              <button mat-stroked-button (click)="photoInput.click()" class="rounded-xl">
                <mat-icon>photo_camera</mat-icon>
                <span class="ml-2">Select Photos</span>
              </button>
              <ul class="mt-2 text-sm text-gray-600 list-disc list-inside" *ngIf="selectedPhotos.length">
                <li *ngFor="let f of selectedPhotos; let i = index" class="flex items-center justify-between">
                  <span class="truncate mr-2">{{ f.name }}</span>
                  <button mat-icon-button (click)="removePhoto(i)" aria-label="Remove photo">
                    <mat-icon>close</mat-icon>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-800 mb-2">Documents</label>
              <input type="file" multiple (change)="onDocsSelected($event)" class="hidden" #docInput>
              <button mat-stroked-button (click)="docInput.click()" class="rounded-xl">
                <mat-icon>upload_file</mat-icon>
                <span class="ml-2">Select Documents</span>
              </button>
              <ul class="mt-2 text-sm text-gray-600 list-disc list-inside" *ngIf="selectedDocs.length">
                <li *ngFor="let f of selectedDocs; let i = index" class="flex items-center justify-between">
                  <span class="truncate mr-2">{{ f.name }}</span>
                  <button mat-icon-button (click)="removeDoc(i)" aria-label="Remove document">
                    <mat-icon>close</mat-icon>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end">
          <button mat-raised-button color="warn" type="button" (click)="submitClaim()" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Submitting...' : 'Submit Claim' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Match dashboard container behavior */
    @media (max-width: 640px) {
      .card { margin-left: -1rem; margin-right: -1rem; border-radius: 0; border-left: none; border-right: none; }
    }

    /* Rounded inputs and clean white fields */
    :host ::ng-deep .form-field .mat-mdc-text-field-wrapper { border-radius: 1rem !important; background-color: #ffffff !important; }
    :host ::ng-deep .form-field .mdc-notched-outline__leading,
    :host ::ng-deep .form-field .mdc-notched-outline__trailing { border-radius: 1rem !important; }
    :host ::ng-deep .form-field .mat-mdc-form-field-infix { min-height: 48px; padding: 12px 0; }
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

  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' safe-area-top safe-area-bottom min-h-screen bg-gray-50 flex flex-col');

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

  removePhoto(index: number): void { this.selectedPhotos.splice(index, 1); }
  removeDoc(index: number): void { this.selectedDocs.splice(index, 1); }

  saveDraft(): void {
    const draftData = { ...this.form.value, photoCount: this.selectedPhotos.length, docCount: this.selectedDocs.length };
    this.store.dispatch(ClaimsActions.saveDraft({ draftData }));
    this.snackBar.open('Draft saved', 'Close', { duration: 2000 });
  }

  submitClaim(): void {
    if (this.form.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
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
    } as any;

    this.store.dispatch(ClaimsActions.createClaim({ claimData }));

    setTimeout(() => {
      this.router.navigate(['/claims']);
      this.snackBar.open('Claim submitted successfully', 'Close', { duration: 3000 });
    }, 1200);
  }
}
