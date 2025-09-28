import { Component, OnInit, inject, computed, signal } from '@angular/core';
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
            <button mat-icon-button routerLink="/dashboard" aria-label="Back" class="flex justify-center items-center">
              <mat-icon class="text-gray-900 flex justify-center items-center mb-[2px]">arrow_back</mat-icon>
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

          <!-- Photos Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Photos</label>
            <div class="rounded-2xl border border-dashed border-gray-300 bg-white shadow-sm p-4 text-center">
              <div class="mx-auto mb-3 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <mat-icon class="text-gray-600">photo_library</mat-icon>
              </div>
              <p class="text-sm text-gray-600 mb-3">Add photos of the incident</p>
              <button mat-stroked-button type="button" (click)="photoInput.click()">
                <mat-icon>upload</mat-icon>
                <span class="ml-2">Choose Photos</span>
              </button>
              <input #photoInput type="file" class="hidden" accept="image/*" multiple (change)="onPhotosSelected($event)" />

              <div *ngIf="photos().length" class="mt-3 grid grid-cols-3 gap-2">
                <div *ngFor="let f of photos()" class="bg-gray-50 rounded-xl p-2 text-[11px] text-gray-700 truncate">
                  <mat-icon class="align-middle text-sm mr-1">image</mat-icon>{{ f.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-900 mb-2">Documents</label>
            <div class="rounded-2xl border border-dashed border-gray-300 bg-white shadow-sm p-4 text-center">
              <div class="mx-auto mb-3 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <mat-icon class="text-gray-600">description</mat-icon>
              </div>
              <p class="text-sm text-gray-600 mb-3">Upload supporting documents (PDF, images)</p>
              <button mat-stroked-button type="button" (click)="documentInput.click()">
                <mat-icon>upload</mat-icon>
                <span class="ml-2">Choose Documents</span>
              </button>
              <input #documentInput type="file" class="hidden" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.heic,.webp,application/pdf,image/*" (change)="onDocumentsSelected($event)" />

              <div *ngIf="documents().length" class="mt-3 grid grid-cols-3 gap-2">
                <div *ngFor="let f of documents()" class="bg-gray-50 rounded-xl p-2 text-[11px] text-gray-700 truncate">
                  <mat-icon class="align-middle text-sm mr-1">insert_drive_file</mat-icon>{{ f.name }}
                </div>
              </div>
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

  photos = signal<File[]>([]);
  documents = signal<File[]>([]);

  readonly isSubmitting = this.store.selectSignal(selectClaimsSubmitting);
  readonly error = this.store.selectSignal(selectClaimsError);

  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' safe-area-top safe-area-bottom min-h-screen bg-gray-50 flex flex-col');

  ngOnInit(): void {
    this.store.dispatch(ClaimsActions.loadDraft());
  }

  saveDraft(): void {
    const draftData = { ...this.form.value, photoCount: this.photos().length, documentCount: this.documents().length };
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
      otherVehiclesInvolved: false,
      photoCount: this.photos().length,
      documentCount: this.documents().length
    };

    this.store.dispatch(ClaimsActions.createClaim({ claimData }));

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
      this.snackBar.open('Claim submitted', 'Close', { duration: 3000 });
    }, 1200);
  }

  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.photos.set(files);
    input.value = '';
  }

  onDocumentsSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.documents.set(files);
    input.value = '';
  }
}
