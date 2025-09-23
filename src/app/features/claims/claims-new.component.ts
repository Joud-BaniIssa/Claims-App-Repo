import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { ResponsiveService } from '../../core/services/responsive.service';
import { EmergencyService } from '../../core/services/emergency.service';
import * as ClaimsActions from '../../store/claims/claims.actions';
import { selectClaimsSubmitting, selectClaimsError } from '../../store/claims/claims.selectors';
import { ClaimType, ClaimInitiationForm } from '../../models/claims.model';

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
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div [class]="containerClasses()">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center space-x-3 mb-4">
          <button 
            mat-icon-button
            routerLink="/dashboard"
            class="text-gray-600">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">File New Claim</h1>
            <p class="text-gray-600">AI-powered claim processing with guided assistance</p>
          </div>
        </div>

        @if (isSubmitting()) {
          <mat-progress-bar mode="indeterminate" class="mb-4"></mat-progress-bar>
        }
      </div>

      <!-- Stepper Container -->
      <div class="card">
        <mat-stepper 
          [orientation]="stepperOrientation()"
          [linear]="true"
          #stepper>
          
          <!-- Step 1: Incident Details -->
          <mat-step [stepControl]="incidentForm" label="Incident Details">
            <form [formGroup]="incidentForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Incident Date -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Date of Incident</mat-label>
                  <input 
                    matInput 
                    [matDatepicker]="datePicker"
                    formControlName="incidentDate"
                    [max]="maxDate"
                    required>
                  <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                  <mat-datepicker #datePicker></mat-datepicker>
                  <mat-error *ngIf="incidentForm.get('incidentDate')?.hasError('required')">
                    Incident date is required
                  </mat-error>
                </mat-form-field>

                <!-- Incident Time -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Time of Incident</mat-label>
                  <input 
                    matInput 
                    type="time"
                    formControlName="incidentTime"
                    required>
                  <mat-error *ngIf="incidentForm.get('incidentTime')?.hasError('required')">
                    Incident time is required
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Claim Type -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Type of Claim</mat-label>
                <mat-select formControlName="claimType" required>
                  @for (type of claimTypes; track type.value) {
                    <mat-option [value]="type.value">
                      <div class="flex items-center space-x-2">
                        <mat-icon [class]="type.iconClass">{{ type.icon }}</mat-icon>
                        <span>{{ type.label }}</span>
                      </div>
                    </mat-option>
                  }
                </mat-select>
                <mat-error *ngIf="incidentForm.get('claimType')?.hasError('required')">
                  Please select a claim type
                </mat-error>
              </mat-form-field>

              <!-- Description -->
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Description of Incident</mat-label>
                <textarea 
                  matInput 
                  formControlName="description"
                  rows="4"
                  maxlength="500"
                  placeholder="Please provide a detailed description of what happened..."
                  required></textarea>
                <mat-hint align="end">
                  {{ incidentForm.get('description')?.value?.length || 0 }}/500
                </mat-hint>
                <mat-error *ngIf="incidentForm.get('description')?.hasError('required')">
                  Description is required
                </mat-error>
                <mat-error *ngIf="incidentForm.get('description')?.hasError('minlength')">
                  Description must be at least 20 characters
                </mat-error>
              </mat-form-field>

              <!-- Action Buttons -->
              <div class="flex justify-end space-x-3">
                <button 
                  mat-stroked-button
                  (click)="saveDraft()"
                  type="button">
                  Save Draft
                </button>
                <button 
                  mat-raised-button 
                  color="primary"
                  matStepperNext
                  [disabled]="incidentForm.invalid">
                  Next: Location
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Location Information -->
          <mat-step [stepControl]="locationForm" label="Location">
            <form [formGroup]="locationForm" class="space-y-6">
              <!-- Get Current Location Button -->
              <div class="text-center">
                <button 
                  mat-stroked-button
                  (click)="getCurrentLocation()"
                  [disabled]="gettingLocation()"
                  type="button"
                  class="mb-4">
                  <mat-icon>my_location</mat-icon>
                  {{ gettingLocation() ? 'Getting Location...' : 'Use Current Location' }}
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Address -->
                <mat-form-field appearance="outline" class="w-full md:col-span-2">
                  <mat-label>Address</mat-label>
                  <input 
                    matInput 
                    formControlName="address"
                    placeholder="Street address where incident occurred"
                    required>
                  <mat-error *ngIf="locationForm.get('address')?.hasError('required')">
                    Address is required
                  </mat-error>
                </mat-form-field>

                <!-- City -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>City</mat-label>
                  <input 
                    matInput 
                    formControlName="city"
                    required>
                  <mat-error *ngIf="locationForm.get('city')?.hasError('required')">
                    City is required
                  </mat-error>
                </mat-form-field>

                <!-- State -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>State</mat-label>
                  <mat-select formControlName="state" required>
                    @for (state of states; track state.code) {
                      <mat-option [value]="state.code">{{ state.name }}</mat-option>
                    }
                  </mat-select>
                  <mat-error *ngIf="locationForm.get('state')?.hasError('required')">
                    State is required
                  </mat-error>
                </mat-form-field>

                <!-- ZIP Code -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>ZIP Code</mat-label>
                  <input 
                    matInput 
                    formControlName="zipCode"
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    maxlength="10"
                    required>
                  <mat-error *ngIf="locationForm.get('zipCode')?.hasError('required')">
                    ZIP code is required
                  </mat-error>
                  <mat-error *ngIf="locationForm.get('zipCode')?.hasError('pattern')">
                    Please enter a valid ZIP code
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-between">
                <button 
                  mat-stroked-button
                  matStepperPrevious
                  type="button">
                  Previous
                </button>
                <div class="space-x-3">
                  <button 
                    mat-stroked-button
                    (click)="saveDraft()"
                    type="button">
                    Save Draft
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary"
                    matStepperNext
                    [disabled]="locationForm.invalid">
                    Next: Additional Info
                  </button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Additional Information -->
          <mat-step [stepControl]="additionalForm" label="Additional Info">
            <form [formGroup]="additionalForm" class="space-y-6">
              <!-- Police Report -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Official Reports</h3>
                
                <mat-checkbox formControlName="policeReportFiled">
                  Police report was filed
                </mat-checkbox>

                @if (additionalForm.get('policeReportFiled')?.value) {
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Police Report Number</mat-label>
                    <input 
                      matInput 
                      formControlName="policeReportNumber"
                      placeholder="Enter report number if available">
                  </mat-form-field>
                }

                <mat-checkbox formControlName="emergencyServices">
                  Emergency services were called
                </mat-checkbox>
              </div>

              <mat-divider></mat-divider>

              <!-- Injuries -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Injuries</h3>
                
                <mat-checkbox formControlName="injuries">
                  There were injuries involved
                </mat-checkbox>

                @if (additionalForm.get('injuries')?.value) {
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Description of Injuries</mat-label>
                    <textarea 
                      matInput 
                      formControlName="injuryDescription"
                      rows="3"
                      placeholder="Please describe any injuries sustained..."></textarea>
                  </mat-form-field>
                }
              </div>

              <mat-divider></mat-divider>

              <!-- Other Parties -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900">Other Parties</h3>
                
                <mat-checkbox formControlName="otherVehiclesInvolved">
                  Other vehicles or parties were involved
                </mat-checkbox>

                @if (additionalForm.get('otherVehiclesInvolved')?.value) {
                  <div class="p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-800 mb-2">
                      <mat-icon class="text-sm mr-1">info</mat-icon>
                      You'll be able to add detailed information about other parties in the next step.
                    </p>
                  </div>
                }
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-between">
                <button 
                  mat-stroked-button
                  matStepperPrevious
                  type="button">
                  Previous
                </button>
                <div class="space-x-3">
                  <button 
                    mat-stroked-button
                    (click)="saveDraft()"
                    type="button">
                    Save Draft
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary"
                    matStepperNext
                    [disabled]="additionalForm.invalid">
                    Review & Submit
                  </button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- Step 4: Review & Submit -->
          <mat-step label="Review & Submit">
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900">Review Your Claim</h3>
              
              <!-- Summary Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Incident Summary -->
                <div class="p-4 border border-gray-200 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-3">Incident Details</h4>
                  <div class="space-y-2 text-sm">
                    <div><strong>Date:</strong> {{ incidentForm.get('incidentDate')?.value | date:'mediumDate' }}</div>
                    <div><strong>Time:</strong> {{ incidentForm.get('incidentTime')?.value }}</div>
                    <div><strong>Type:</strong> {{ getClaimTypeLabel(incidentForm.get('claimType')?.value) }}</div>
                  </div>
                </div>

                <!-- Location Summary -->
                <div class="p-4 border border-gray-200 rounded-lg">
                  <h4 class="font-semibold text-gray-900 mb-3">Location</h4>
                  <div class="text-sm">
                    <div>{{ locationForm.get('address')?.value }}</div>
                    <div>{{ locationForm.get('city')?.value }}, {{ locationForm.get('state')?.value }} {{ locationForm.get('zipCode')?.value }}</div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="p-4 border border-gray-200 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Description</h4>
                <p class="text-sm text-gray-700">{{ incidentForm.get('description')?.value }}</p>
              </div>

              <!-- Emergency Priority Option -->
              <div class="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <mat-checkbox 
                  formControlName="emergencyPriority"
                  class="mb-2">
                  <span class="font-semibold text-orange-800">Mark as Emergency Priority</span>
                </mat-checkbox>
                <p class="text-sm text-orange-700 ml-6">
                  Emergency claims receive immediate attention and expedited processing.
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex justify-between">
                <button 
                  mat-stroked-button
                  matStepperPrevious
                  type="button">
                  Previous
                </button>
                <div class="space-x-3">
                  <button 
                    mat-stroked-button
                    (click)="saveDraft()"
                    type="button">
                    Save Draft
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary"
                    (click)="submitClaim()"
                    [disabled]="isSubmitting()">
                    {{ isSubmitting() ? 'Submitting...' : 'Submit Claim' }}
                  </button>
                </div>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </div>
    </div>
  `,
  styles: [`
    .mat-mdc-stepper {
      background: transparent !important;
    }
    
    .mat-stepper-horizontal {
      margin-top: 8px;
    }
    
    .mat-form-field {
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .mat-stepper-horizontal {
        margin: 0;
      }
      
      .mat-horizontal-stepper-header-container {
        display: none;
      }
    }
  `]
})
export class ClaimsNewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  protected responsiveService = inject(ResponsiveService);
  private emergencyService = inject(EmergencyService);

  // Form groups
  incidentForm: FormGroup = this.fb.group({});
  locationForm: FormGroup = this.fb.group({});
  additionalForm: FormGroup = this.fb.group({});
  
  // UI state
  private gettingLocationSignal = signal(false);
  readonly gettingLocation = computed(() => this.gettingLocationSignal());
  
  // Store selectors
  readonly isSubmitting = this.store.selectSignal(selectClaimsSubmitting);
  readonly error = this.store.selectSignal(selectClaimsError);

  // Data
  readonly maxDate = new Date();
  
  readonly claimTypes = [
    { value: 'auto_collision', label: 'Auto Collision', icon: 'car_crash', iconClass: 'text-red-600' },
    { value: 'auto_comprehensive', label: 'Auto Comprehensive', icon: 'directions_car', iconClass: 'text-blue-600' },
    { value: 'auto_liability', label: 'Auto Liability', icon: 'gavel', iconClass: 'text-purple-600' },
    { value: 'property_damage', label: 'Property Damage', icon: 'home', iconClass: 'text-green-600' },
    { value: 'theft', label: 'Theft', icon: 'security', iconClass: 'text-orange-600' },
    { value: 'vandalism', label: 'Vandalism', icon: 'warning', iconClass: 'text-yellow-600' },
    { value: 'natural_disaster', label: 'Natural Disaster', icon: 'storm', iconClass: 'text-indigo-600' },
    { value: 'personal_injury', label: 'Personal Injury', icon: 'personal_injury', iconClass: 'text-pink-600' },
    { value: 'medical', label: 'Medical', icon: 'medical_services', iconClass: 'text-teal-600' }
  ];

  readonly states = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  // Computed properties
  readonly containerClasses = computed(() => {
    return this.responsiveService.containerClass() + ' py-6 min-h-screen bg-gray-50';
  });

  readonly stepperOrientation = computed(() => {
    return this.responsiveService.isMobile() ? 'vertical' : 'horizontal';
  });

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Load any saved draft
    this.store.dispatch(ClaimsActions.loadDraft());
  }

  private initializeForms(): void {
    this.incidentForm = this.fb.group({
      incidentDate: ['', Validators.required],
      incidentTime: ['', Validators.required],
      claimType: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]]
    });

    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}(-[0-9]{4})?$/)]]
    });

    this.additionalForm = this.fb.group({
      policeReportFiled: [false],
      policeReportNumber: [''],
      emergencyServices: [false],
      injuries: [false],
      injuryDescription: [''],
      otherVehiclesInvolved: [false],
      emergencyPriority: [false]
    });

    // Auto-save form changes as draft
    this.setupAutoSave();
  }

  private setupAutoSave(): void {
    // Combine all form value changes and debounce
    const allChanges$ = [
      this.incidentForm.valueChanges,
      this.locationForm.valueChanges,
      this.additionalForm.valueChanges
    ];

    allChanges$.forEach(changes$ => {
      changes$.subscribe(() => {
        this.saveDraft();
      });
    });
  }

  async getCurrentLocation(): Promise<void> {
    this.gettingLocationSignal.set(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      // Use reverse geocoding (in a real app, you'd use a service like Google Maps API)
      // For now, we'll just show coordinates
      this.snackBar.open('Location obtained. Please fill in the address details.', 'Close', {
        duration: 3000
      });
      
    } catch (error) {
      this.snackBar.open('Unable to get current location. Please enter manually.', 'Close', {
        duration: 3000
      });
    } finally {
      this.gettingLocationSignal.set(false);
    }
  }

  saveDraft(): void {
    const draftData = {
      ...this.incidentForm.value,
      location: this.locationForm.value,
      additional: this.additionalForm.value
    };
    
    this.store.dispatch(ClaimsActions.saveDraft({ draftData }));
  }

  submitClaim(): void {
    if (this.incidentForm.valid && this.locationForm.valid && this.additionalForm.valid) {
      const claimData: ClaimInitiationForm = {
        incidentDate: this.incidentForm.value.incidentDate,
        incidentTime: this.incidentForm.value.incidentTime,
        location: {
          address: this.locationForm.value.address,
          city: this.locationForm.value.city,
          state: this.locationForm.value.state,
          zipCode: this.locationForm.value.zipCode,
          country: 'US'
        },
        claimType: this.incidentForm.value.claimType,
        description: this.incidentForm.value.description,
        policeReportFiled: this.additionalForm.value.policeReportFiled,
        policeReportNumber: this.additionalForm.value.policeReportNumber,
        emergencyServices: this.additionalForm.value.emergencyServices,
        injuries: this.additionalForm.value.injuries,
        injuryDescription: this.additionalForm.value.injuryDescription,
        otherVehiclesInvolved: this.additionalForm.value.otherVehiclesInvolved
      };

      this.store.dispatch(ClaimsActions.createClaim({ claimData }));

      // If marked as emergency, trigger emergency service
      if (this.additionalForm.value.emergencyPriority) {
        this.emergencyService.triggerUrgentClaim();
      }

      // Navigate to dashboard after successful submission
      // In a real app, you'd listen to the success action
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
        this.snackBar.open('Claim submitted successfully!', 'Close', {
          duration: 5000
        });
      }, 2000);
    }
  }

  getClaimTypeLabel(value: string): string {
    const type = this.claimTypes.find(t => t.value === value);
    return type ? type.label : value;
  }
}
