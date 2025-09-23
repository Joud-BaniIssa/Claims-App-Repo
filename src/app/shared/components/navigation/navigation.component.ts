import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

import { ResponsiveService } from '../../../core/services/responsive.service';
import { EmergencyService } from '../../../core/services/emergency.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatSidenavModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar [class]="toolbarClasses()">
      <div class="flex items-center justify-between w-full">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-4">
          @if (responsiveService.isMobile()) {
            <button 
              mat-icon-button
              (click)="toggleMobileMenu()"
              aria-label="Menu">
              <mat-icon>menu</mat-icon>
            </button>
          }
          
          <a 
            routerLink="/" 
            class="flex items-center space-x-3 text-white hover:text-gray-200 transition-colors">
            <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <mat-icon class="text-primary-500">security</mat-icon>
            </div>
            @if (!responsiveService.isMobile()) {
              <div>
                <h1 class="text-xl font-bold">InsuranceAI</h1>
                <p class="text-xs opacity-80">Claims Platform</p>
              </div>
            }
          </a>
        </div>

        <!-- Desktop Navigation -->
        @if (!responsiveService.isMobile()) {
          <nav class="flex items-center space-x-6">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </a>
            <a 
              routerLink="/claims" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon>description</mat-icon>
              Claims
            </a>
            <a 
              routerLink="/documents" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon>folder</mat-icon>
              Documents
            </a>
            <a 
              routerLink="/profile" 
              routerLinkActive="active-link"
              class="nav-link">
              <mat-icon>person</mat-icon>
              Profile
            </a>
          </nav>
        }

        <!-- Actions -->
        <div class="flex items-center space-x-2">
          <!-- Emergency Indicator -->
          @if (emergencyService.isEmergencyMode()) {
            <button 
              mat-icon-button
              [matBadge]="'!'"
              matBadgeColor="warn"
              matBadgeSize="small"
              class="text-white animate-pulse"
              (click)="showEmergencyDetails()">
              <mat-icon>warning</mat-icon>
            </button>
          }

          <!-- Notifications -->
          <button 
            mat-icon-button
            [matBadge]="notificationCount()"
            [matBadgeHidden]="notificationCount() === 0"
            matBadgeColor="accent"
            matBadgeSize="small"
            class="text-white">
            <mat-icon>notifications</mat-icon>
          </button>

          <!-- User Menu -->
          <button 
            mat-icon-button
            [matMenuTriggerFor]="userMenu"
            class="text-white">
            <mat-icon>account_circle</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item routerLink="/profile">
        <mat-icon>person</mat-icon>
        <span>Profile</span>
      </button>
      <button mat-menu-item routerLink="/settings">
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>

    <!-- Mobile Navigation Drawer -->
    @if (responsiveService.isMobile()) {
      <mat-sidenav-container class="mobile-nav-container">
        <mat-sidenav 
          #mobileNav
          mode="over"
          [opened]="isMobileMenuOpen()"
          (closed)="closeMobileMenu()"
          class="mobile-nav">
          <div class="p-6">
            <!-- Mobile Logo -->
            <div class="flex items-center space-x-3 mb-8">
              <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <mat-icon class="text-white">security</mat-icon>
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900">InsuranceAI</h2>
                <p class="text-sm text-gray-600">Claims Platform</p>
              </div>
            </div>

            <!-- Mobile Navigation Links -->
            <nav class="space-y-4">
              <a 
                routerLink="/dashboard" 
                routerLinkActive="mobile-active-link"
                class="mobile-nav-link"
                (click)="closeMobileMenu()">
                <mat-icon>dashboard</mat-icon>
                Dashboard
              </a>
              <a 
                routerLink="/claims" 
                routerLinkActive="mobile-active-link"
                class="mobile-nav-link"
                (click)="closeMobileMenu()">
                <mat-icon>description</mat-icon>
                Claims
              </a>
              <a 
                routerLink="/documents" 
                routerLinkActive="mobile-active-link"
                class="mobile-nav-link"
                (click)="closeMobileMenu()">
                <mat-icon>folder</mat-icon>
                Documents
              </a>
              <a 
                routerLink="/profile" 
                routerLinkActive="mobile-active-link"
                class="mobile-nav-link"
                (click)="closeMobileMenu()">
                <mat-icon>person</mat-icon>
                Profile
              </a>
            </nav>

            <!-- Emergency Section -->
            @if (emergencyService.isEmergencyMode()) {
              <div class="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div class="flex items-center space-x-2 mb-2">
                  <mat-icon class="text-red-600">warning</mat-icon>
                  <h3 class="font-semibold text-red-800">Emergency Active</h3>
                </div>
                <p class="text-sm text-red-700 mb-3">{{ emergencyService.activeEmergency()?.type | titlecase }}</p>
                <button 
                  mat-stroked-button
                  class="w-full text-red-600 border-red-600"
                  (click)="showEmergencyDetails(); closeMobileMenu()">
                  View Details
                </button>
              </div>
            }
          </div>
        </mat-sidenav>
        <mat-sidenav-content>
          <ng-content></ng-content>
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <ng-content></ng-content>
    }
  `,
  styles: [`
    .nav-link {
      @apply flex items-center space-x-2 px-3 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200;
    }

    .active-link {
      @apply bg-white bg-opacity-20 font-semibold;
    }

    .mobile-nav-link {
      @apply flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors;
    }

    .mobile-active-link {
      @apply bg-primary-50 text-primary-700 font-semibold;
    }

    .mobile-nav {
      width: 280px;
    }

    .mobile-nav-container {
      height: calc(100vh - 64px);
    }

    mat-toolbar {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    @media (max-width: 640px) {
      mat-toolbar {
        padding: 0 16px;
        min-height: 64px;
      }
    }
  `]
})
export class NavigationComponent {
  protected responsiveService = inject(ResponsiveService);
  protected emergencyService = inject(EmergencyService);

  // UI state
  private isMobileMenuOpenSignal = signal(false);
  private notificationCountSignal = signal(3);

  // Computed properties
  readonly isMobileMenuOpen = computed(() => this.isMobileMenuOpenSignal());
  readonly notificationCount = computed(() => this.notificationCountSignal());

  readonly toolbarClasses = computed(() => {
    const base = 'claims-gradient text-white sticky top-0 z-50';
    return this.responsiveService.isMobile() 
      ? `${base} px-4` 
      : `${base} px-6`;
  });

  // Mobile menu methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpenSignal.update(isOpen => !isOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpenSignal.set(false);
  }

  // Emergency methods
  showEmergencyDetails(): void {
    // This could open a dialog or navigate to emergency details
    console.log('Show emergency details');
  }

  // Auth methods
  logout(): void {
    // Implement logout logic
    console.log('Logout user');
  }
}
