import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';

import { EmergencyService } from '../../../core/services/emergency.service';
import { ResponsiveService } from '../../../core/services/responsive.service';

@Component({
  selector: 'app-emergency-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatRippleModule
  ],
  template: `
    <div class="emergency-widget" [class]="containerClasses()">
      <!-- Emergency Mode Banner -->
      @if (emergencyService.isEmergencyMode()) {
        <div [class]="emergencyConfig().backgroundColor + ' ' + emergencyConfig().textColor + ' p-4 rounded-xl mb-4 ' + (emergencyConfig().pulseAnimation ? 'animate-pulse-emergency' : '')">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <mat-icon class="text-2xl">warning</mat-icon>
              <div>
                <h3 class="font-bold text-lg">Emergency Active</h3>
                <p class="text-sm opacity-90">
                  {{ activeEmergency()?.type | titlecase }} - {{ activeEmergency()?.timestamp | date:'short' }}
                </p>
              </div>
            </div>
            <button 
              mat-icon-button 
              (click)="clearEmergency()"
              class="text-white hover:bg-white hover:bg-opacity-20">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          @if (activeEmergency()?.description) {
            <p class="mt-2 text-sm">{{ activeEmergency()?.description }}</p>
          }
          
          <div class="flex flex-wrap gap-2 mt-3">
            <button 
              mat-stroked-button 
              (click)="shareEmergencyDetails()"
              class="text-white border-white hover:bg-white hover:text-red-600">
              <mat-icon>share</mat-icon>
              Share Details
            </button>
            <button 
              mat-stroked-button 
              (click)="callEmergencyServices()"
              class="text-white border-white hover:bg-white hover:text-red-600">
              <mat-icon>phone</mat-icon>
              Call 911
            </button>
          </div>
        </div>
      }

      <!-- Emergency Action Buttons -->
      <div class="emergency-actions">
        <div class="text-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 mb-2">Emergency Actions</h2>
          <p class="text-gray-600 text-sm">Quick access to emergency services and urgent claim reporting</p>
        </div>

        <div [class]="gridClasses()">
          <!-- Accident Report -->
          <button 
            mat-raised-button 
            color="warn"
            (click)="triggerAccidentReport()"
            [class]="buttonClasses() + ' bg-red-500 hover:bg-red-600 text-white'"
            matRipple>
            <div class="flex flex-col items-center space-y-2">
              <mat-icon class="text-3xl">car_crash</mat-icon>
              <span class="font-bold">Accident</span>
              <span class="text-xs opacity-90">Report vehicle accident</span>
            </div>
          </button>

          <!-- Medical Emergency -->
          <button 
            mat-raised-button
            (click)="triggerMedicalEmergency()"
            [class]="buttonClasses() + ' bg-red-600 hover:bg-red-700 text-white'"
            matRipple>
            <div class="flex flex-col items-center space-y-2">
              <mat-icon class="text-3xl">medical_services</mat-icon>
              <span class="font-bold">Medical</span>
              <span class="text-xs opacity-90">Medical emergency</span>
            </div>
          </button>

          <!-- Roadside Assistance -->
          <button 
            mat-raised-button
            (click)="triggerRoadsideAssistance()"
            [class]="buttonClasses() + ' bg-orange-500 hover:bg-orange-600 text-white'"
            matRipple>
            <div class="flex flex-col items-center space-y-2">
              <mat-icon class="text-3xl">build</mat-icon>
              <span class="font-bold">Roadside</span>
              <span class="text-xs opacity-90">Need assistance</span>
            </div>
          </button>

          <!-- Urgent Claim -->
          <button 
            mat-raised-button
            (click)="triggerUrgentClaim()"
            [class]="buttonClasses() + ' bg-primary-500 hover:bg-primary-600 text-white'"
            matRipple>
            <div class="flex flex-col items-center space-y-2">
              <mat-icon class="text-3xl">priority_high</mat-icon>
              <span class="font-bold">Urgent Claim</span>
              <span class="text-xs opacity-90">Fast-track claim</span>
            </div>
          </button>
        </div>

        <!-- Emergency Contacts -->
        <div class="mt-6 p-4 bg-gray-50 rounded-xl">
          <h3 class="text-sm font-semibold text-gray-800 mb-3">Emergency Contacts</h3>
          <div class="space-y-2">
            @for (contact of emergencyContacts(); track contact.name) {
              <button 
                (click)="callContact(contact.type)"
                class="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div class="flex items-center space-x-3">
                  <mat-icon [class]="getContactIconClass(contact.type)">{{ getContactIcon(contact.type) }}</mat-icon>
                  <div class="text-left">
                    <div class="text-sm font-medium text-gray-900">{{ contact.name }}</div>
                    <div class="text-xs text-gray-600">{{ contact.phone }}</div>
                  </div>
                </div>
                @if (contact.available24h) {
                  <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">24/7</span>
                }
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .emergency-widget {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid #e2e8f0;
      border-radius: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .emergency-actions {
      position: relative;
    }

    .emergency-actions::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 4px;
      background: linear-gradient(90deg, #e53935, #d32f2f);
      border-radius: 2px;
    }

    button:focus-visible {
      outline: 2px solid #e53935;
      outline-offset: 2px;
    }

    @media (max-width: 640px) {
      .emergency-widget {
        border-radius: 0.75rem;
      }
    }
  `]
})
export class EmergencyWidgetComponent {
  protected emergencyService = inject(EmergencyService);
  protected responsiveService = inject(ResponsiveService);

  // Reactive properties
  readonly activeEmergency = this.emergencyService.activeEmergency;
  readonly emergencyContacts = this.emergencyService.emergencyContacts;
  readonly emergencyConfig = this.emergencyService.emergencyUIConfig;

  // Responsive computed properties
  readonly containerClasses = computed(() => {
    const base = 'p-6';
    return this.responsiveService.isMobile() 
      ? `${base} mx-4` 
      : `${base} mx-6`;
  });

  readonly gridClasses = computed(() => {
    const base = 'grid gap-4';
    if (this.responsiveService.isMobile()) {
      return `${base} grid-cols-2`;
    }
    if (this.responsiveService.isTablet()) {
      return `${base} grid-cols-2`;
    }
    return `${base} grid-cols-4`;
  });

  readonly buttonClasses = computed(() => {
    const base = 'min-h-[120px] rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200';
    return this.responsiveService.isMobile() 
      ? `${base} p-4` 
      : `${base} p-6`;
  });

  // Emergency actions
  triggerAccidentReport(): void {
    this.emergencyService.triggerAccidentReport();
  }

  triggerMedicalEmergency(): void {
    this.emergencyService.triggerMedicalEmergency();
  }

  triggerRoadsideAssistance(): void {
    this.emergencyService.triggerRoadsideAssistance();
  }

  triggerUrgentClaim(): void {
    this.emergencyService.triggerUrgentClaim();
  }

  // Emergency management
  clearEmergency(): void {
    this.emergencyService.clearEmergency();
  }

  shareEmergencyDetails(): void {
    this.emergencyService.shareEmergencyDetails();
  }

  callEmergencyServices(): void {
    this.emergencyService.makeEmergencyCall('police');
  }

  callContact(type: any): void {
    this.emergencyService.makeEmergencyCall(type);
  }

  // UI helpers
  getContactIcon(type: string): string {
    switch (type) {
      case 'police': return 'local_police';
      case 'medical': return 'medical_services';
      case 'fire': return 'local_fire_department';
      case 'insurance': return 'security';
      case 'roadside': return 'build';
      default: return 'phone';
    }
  }

  getContactIconClass(type: string): string {
    const base = 'text-xl';
    switch (type) {
      case 'police': return `${base} text-blue-600`;
      case 'medical': return `${base} text-red-600`;
      case 'fire': return `${base} text-orange-600`;
      case 'insurance': return `${base} text-primary-600`;
      case 'roadside': return `${base} text-gray-600`;
      default: return `${base} text-gray-500`;
    }
  }
}
