import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container-mobile p-6">
      <div class="card text-center">
        <mat-icon class="text-6xl text-gray-300 mb-4">person</mat-icon>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Profile Management</h2>
        <p class="text-gray-600 mb-6">This page will allow you to manage your personal information, insurance policies, and preferences.</p>
        <button mat-raised-button color="primary" routerLink="/dashboard">
          Back to Dashboard
        </button>
      </div>
    </div>
  `
})
export class ProfileComponent {}
