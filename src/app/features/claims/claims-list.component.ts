import { Component } from '@angular/core';
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
          <div class="mt-4 flex items-center justify-between">
            <a routerLink="/workshop" class="text-primary-700 hover:underline">View workshop updates</a>
            <button mat-stroked-button routerLink="/claims/new">Add Documents</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClaimsListComponent {}
