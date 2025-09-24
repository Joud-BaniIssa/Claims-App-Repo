import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatButtonModule, MatIconModule],
  template: `
    <div [class]="containerClasses()">
      <div class="mx-auto w-full max-w-screen-sm">
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <mat-icon class="text-primary-600">person</mat-icon>
            <h2 class="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>

          <!-- Avatar -->
          <div class="flex flex-col items-center mb-4">
            <div class="relative">
              <img [src]="avatarUrl" alt="Avatar" class="w-20 h-20 rounded-full object-cover border border-gray-200" />
              <span class="absolute -bottom-1 -right-1 bg-primary-500 text-white rounded-full p-1">
                <mat-icon class="text-[14px] leading-none">verified</mat-icon>
              </span>
            </div>
            <div class="text-center mt-2">
              <div class="font-medium text-gray-900">John Smith</div>
              <div class="text-xs text-gray-500">Customer since 2019</div>
            </div>
            <button mat-stroked-button class="mt-3" (click)="fileInput.click()">Change Photo</button>
            <input #fileInput type="file" accept="image/*" class="hidden" (change)="onAvatarChange($event)" />
          </div>

          <hr class="my-4 border-gray-100" />

          <!-- Form -->
          <form [formGroup]="form" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">First Name</label>
              <input class="form-input" formControlName="firstName" placeholder="John" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
              <input class="form-input" formControlName="lastName" placeholder="Smith" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input class="form-input" formControlName="email" placeholder="john.smith@email.com" type="email" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input class="form-input" formControlName="phone" placeholder="(555) 123-4567" />
            </div>

            <div class="flex items-center gap-2 mt-2">
              <mat-icon class="text-primary-600">place</mat-icon>
              <span class="text-sm font-medium text-gray-900">Address</span>
            </div>
            <div>
              <input class="form-input" formControlName="street" placeholder="123 Main Street" />
            </div>
            <div>
              <input class="form-input" formControlName="city" placeholder="Anytown" />
            </div>
            <div>
              <input class="form-input" formControlName="state" placeholder="CA" />
            </div>
            <div>
              <input class="form-input" formControlName="zip" placeholder="12345" />
            </div>

            <div class="pt-2 flex items-center justify-between">
              <button mat-stroked-button routerLink="/dashboard">Cancel</button>
              <button mat-raised-button color="warn" (click)="save()" [disabled]="form.invalid">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  protected responsiveService = inject(ResponsiveService);
  private fb = inject(FormBuilder);

  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' py-6 min-h-screen bg-gray-50');

  form = this.fb.group({
    firstName: ['John', [Validators.required]],
    lastName: ['Smith', [Validators.required]],
    email: ['john.smith@email.com', [Validators.required, Validators.email]],
    phone: ['(555) 123-4567', [Validators.required]],
    street: ['123 Main Street', [Validators.required]],
    city: ['Anytown', [Validators.required]],
    state: ['CA', [Validators.required]],
    zip: ['12345', [Validators.required]]
  });

  avatarUrl = 'https://i.pravatar.cc/100?img=12';

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarUrl = String(reader.result);
    reader.readAsDataURL(file);
    input.value = '';
  }

  save() {
    if (this.form.invalid) return;
    // Placeholder: integrate with backend/store later
    console.log('Profile saved', this.form.value);
  }
}
