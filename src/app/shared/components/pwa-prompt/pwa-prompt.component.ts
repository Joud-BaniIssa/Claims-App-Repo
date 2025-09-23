import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { PWAService } from '../../../core/services/pwa.service';
import { ResponsiveService } from '../../../core/services/responsive.service';

@Component({
  selector: 'app-pwa-prompt',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule
  ],
  template: `
    <!-- Install Prompt Banner -->
    @if (showInstallBanner()) {
      <div [class]="bannerClasses()" class="animate-slide-up">
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <mat-icon class="text-white">get_app</mat-icon>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Install InsuranceAI</h3>
              <p class="text-sm text-gray-600">Get faster access and offline support</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              mat-stroked-button
              (click)="dismissBanner()"
              class="min-w-0">
              @if (responsiveService.isMobile()) {
                <mat-icon>close</mat-icon>
              } @else {
                Later
              }
            </button>
            <button
              mat-raised-button
              color="warn"
              (click)="installApp()">
              Install
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Update Available Banner -->
    @if (showUpdateBanner()) {
      <div class="fixed top-0 left-0 right-0 z-50 bg-primary-600 text-white p-4 animate-slide-up">
        <div class="flex items-center justify-between max-w-screen-lg mx-auto">
          <div class="flex items-center space-x-3">
            <mat-icon>system_update</mat-icon>
            <div>
              <h3 class="font-semibold">Update Available</h3>
              <p class="text-sm opacity-90">A new version is ready to install</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              mat-stroked-button
              (click)="dismissUpdateBanner()"
              class="text-white border-white hover:bg-white hover:text-primary-600">
              Later
            </button>
            <button 
              mat-raised-button
              (click)="applyUpdate()"
              class="bg-white text-primary-600 hover:bg-gray-100">
              Update Now
            </button>
          </div>
        </div>
      </div>
    }

    <!-- PWA Features Card (for non-installed users) -->
    @if (showFeaturesCard()) {
      <div class="card mb-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-3xl text-primary-600">smartphone</mat-icon>
          </div>
          
          <h3 class="text-lg font-bold text-gray-900 mb-2">Better Mobile Experience</h3>
          <p class="text-gray-600 mb-4">
            Install our app for faster loading, offline access, and a native app experience.
          </p>
          
          <div class="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div class="text-center">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <mat-icon class="text-green-600 text-sm">offline_bolt</mat-icon>
              </div>
              <span class="text-gray-700">Offline Access</span>
            </div>
            <div class="text-center">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <mat-icon class="text-blue-600 text-sm">flash_on</mat-icon>
              </div>
              <span class="text-gray-700">Faster Loading</span>
            </div>
            <div class="text-center">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <mat-icon class="text-purple-600 text-sm">notifications</mat-icon>
              </div>
              <span class="text-gray-700">Push Notifications</span>
            </div>
          </div>
          
          @if (pwaService.isInstallable()) {
            <button
              mat-raised-button
              color="warn"
              (click)="installApp()"
              class="mb-2">
              <mat-icon>get_app</mat-icon>
              Install App
            </button>
          } @else {
            <div class="p-3 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-2">
                <mat-icon class="text-sm mr-1">info</mat-icon>
                Install Instructions
              </p>
              <p class="text-xs text-gray-500">
                {{ pwaService.getInstallInstructions() }}
              </p>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class PWAPromptComponent {
  protected pwaService = inject(PWAService);
  protected responsiveService = inject(ResponsiveService);
  private snackBar = inject(MatSnackBar);

  // State management
  private showInstallBannerState = true;
  private showUpdateBannerState = true;
  private showFeaturesCardState = true;

  // Computed properties
  readonly showInstallBanner = computed(() => 
    this.showInstallBannerState && 
    this.pwaService.isInstallable() && 
    !this.pwaService.isInstalled()
  );

  readonly showUpdateBanner = computed(() => 
    this.showUpdateBannerState && 
    this.pwaService.updateAvailable()
  );

  readonly showFeaturesCard = computed(() => 
    this.showFeaturesCardState && 
    !this.pwaService.isInstalled() && 
    !this.responsiveService.isMobile()
  );

  readonly bannerClasses = computed(() => {
    const base = 'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg';
    return this.responsiveService.isMobile() 
      ? `${base} mx-0` 
      : `${base} mx-4 mb-4 rounded-t-xl border border-gray-200`;
  });

  // Install the PWA
  async installApp(): Promise<void> {
    try {
      const installed = await this.pwaService.installPWA();
      if (installed) {
        this.snackBar.open('App installed successfully!', 'Close', {
          duration: 3000
        });
        this.dismissBanner();
      } else {
        this.snackBar.open('Installation cancelled or failed', 'Close', {
          duration: 3000
        });
      }
    } catch (error) {
      this.snackBar.open('Failed to install app', 'Close', {
        duration: 3000
      });
    }
  }

  // Apply available update
  async applyUpdate(): Promise<void> {
    try {
      await this.pwaService.applyUpdate();
    } catch (error) {
      this.snackBar.open('Failed to apply update', 'Close', {
        duration: 3000
      });
    }
  }

  // Dismiss install banner
  dismissBanner(): void {
    this.showInstallBannerState = false;
    // Remember user's choice for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  }

  // Dismiss update banner
  dismissUpdateBanner(): void {
    this.showUpdateBannerState = false;
  }

  // Dismiss features card
  dismissFeaturesCard(): void {
    this.showFeaturesCardState = false;
    // Remember user's choice
    localStorage.setItem('pwa-features-dismissed', 'true');
  }

  // Enable push notifications
  async enableNotifications(): Promise<void> {
    try {
      const enabled = await this.pwaService.enablePushNotifications();
      if (enabled) {
        this.snackBar.open('Notifications enabled!', 'Close', {
          duration: 3000
        });
      } else {
        this.snackBar.open('Notifications permission denied', 'Close', {
          duration: 3000
        });
      }
    } catch (error) {
      this.snackBar.open('Failed to enable notifications', 'Close', {
        duration: 3000
      });
    }
  }

  constructor() {
    // Check if user has already dismissed prompts
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      this.showInstallBannerState = false;
    }
    
    if (localStorage.getItem('pwa-features-dismissed')) {
      this.showFeaturesCardState = false;
    }
  }
}
