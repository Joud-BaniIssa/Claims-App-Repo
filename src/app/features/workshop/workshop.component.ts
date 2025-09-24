import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ResponsiveService } from '../../core/services/responsive.service';

@Component({
  selector: 'app-workshop',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div [class]="containerClasses()">
      <div class="mb-4 flex items-center space-x-3">
        <button mat-icon-button routerLink="/dashboard" aria-label="Back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Workshop</h1>
          <p class="text-gray-600">Repair progress, parts, and photos</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <!-- Repair Progress -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-gray-900">Repair Progress</h2>
            <span class="text-sm text-gray-600">Job #WRK-1024</span>
          </div>
          <div class="space-y-3">
            <div class="w-full bg-gray-100 rounded-xl overflow-hidden">
              <div class="bg-primary-500 h-3" style="width: 60%"></div>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-700">
              <span>60% complete</span>
              <span class="inline-flex items-center gap-1 text-primary-700">
                <mat-icon class="text-base">build</mat-icon>
                In progress
              </span>
            </div>
          </div>
        </div>

        <!-- Replaced Parts -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-gray-900">Replaced Parts</h2>
            <a routerLink="/claims" class="text-primary-700 hover:underline">View Claim</a>
          </div>
          <ul class="divide-y divide-gray-100">
            <li class="py-3 flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Front Bumper</p>
                <p class="text-sm text-gray-600">OEM Part • Replaced</p>
              </div>
              <span class="px-3 py-1 rounded-lg bg-green-100 text-green-800 text-sm">Done</span>
            </li>
            <li class="py-3 flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Left Headlight</p>
                <p class="text-sm text-gray-600">OEM Part • Awaiting</p>
              </div>
              <span class="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-800 text-sm">Pending</span>
            </li>
          </ul>
        </div>

        <!-- Repair Photos -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-gray-900">Repair Photos</h2>
            <button mat-raised-button routerLink="/documents" class="bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200">
              Gallery
            </button>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div class="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <mat-icon class="text-gray-400 text-3xl">image</mat-icon>
            </div>
            <div class="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <mat-icon class="text-gray-400 text-3xl">image</mat-icon>
            </div>
            <div class="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <mat-icon class="text-gray-400 text-3xl">image</mat-icon>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end">
          <button mat-raised-button color="warn">
            <mat-icon>directions_car</mat-icon>
            <span class="ml-2">Request Car Delivery</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class WorkshopComponent {
  protected responsiveService = inject(ResponsiveService);
  readonly containerClasses = computed(() => this.responsiveService.containerClass() + ' py-6 min-h-screen bg-gray-50');
}
