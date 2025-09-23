import { Injectable, signal, computed } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface EmergencyEvent {
  type: 'accident' | 'medical' | 'roadside' | 'urgent_claim' | 'system_alert';
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  type: 'police' | 'medical' | 'fire' | 'insurance' | 'roadside' | 'custom';
  available24h: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmergencyService {
  private emergencySubject = new Subject<EmergencyEvent>();
  private isEmergencyModeSignal = signal(false);
  private activeEmergencySignal = signal<EmergencyEvent | null>(null);
  private emergencyHistorySignal = signal<EmergencyEvent[]>([]);

  // Emergency contacts with default values
  private emergencyContactsSignal = signal<EmergencyContact[]>([
    {
      name: 'Emergency Services',
      phone: '911',
      type: 'police',
      available24h: true
    },
    {
      name: 'Insurance Claims Hotline',
      phone: '1-800-CLAIMS',
      type: 'insurance',
      available24h: true
    },
    {
      name: 'Roadside Assistance',
      phone: '1-800-ROADSIDE',
      type: 'roadside',
      available24h: true
    },
    {
      name: 'Medical Emergency',
      phone: '911',
      type: 'medical',
      available24h: true
    }
  ]);

  // Public readonly signals
  readonly isEmergencyMode = computed(() => this.isEmergencyModeSignal());
  readonly activeEmergency = computed(() => this.activeEmergencySignal());
  readonly emergencyHistory = computed(() => this.emergencyHistorySignal());
  readonly emergencyContacts = computed(() => this.emergencyContactsSignal());

  // Emergency stream
  readonly emergencyEvents$: Observable<EmergencyEvent> = this.emergencySubject.asObservable();

  // Severity level computed
  readonly currentSeverityLevel = computed(() => {
    const active = this.activeEmergency();
    return active ? active.severity : 'low';
  });

  // Emergency mode UI state
  readonly emergencyUIConfig = computed(() => {
    const severity = this.currentSeverityLevel();
    const isActive = this.isEmergencyMode();
    
    return {
      showEmergencyBar: isActive,
      backgroundColor: this.getSeverityColor(severity),
      textColor: severity === 'low' ? 'text-gray-800' : 'text-white',
      pulseAnimation: severity === 'critical',
      priority: severity === 'critical' ? 'z-50' : 'z-40'
    };
  });

  constructor() {
    // Auto-clear emergency mode after 24 hours
    this.emergencyEvents$.subscribe(event => {
      setTimeout(() => {
        if (this.activeEmergency() === event) {
          this.clearEmergency();
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
    });
  }

  // Trigger emergency with location detection
  async triggerEmergency(
    type: EmergencyEvent['type'], 
    description?: string, 
    severity: EmergencyEvent['severity'] = 'high'
  ): Promise<void> {
    try {
      const location = await this.getCurrentLocation();
      
      const emergency: EmergencyEvent = {
        type,
        timestamp: new Date(),
        location,
        description,
        severity,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      this.activateEmergency(emergency);
    } catch (error) {
      // Fallback without location
      const emergency: EmergencyEvent = {
        type,
        timestamp: new Date(),
        description,
        severity,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          locationError: error
        }
      };

      this.activateEmergency(emergency);
    }
  }

  // Quick emergency actions
  triggerAccidentReport(): void {
    this.triggerEmergency('accident', 'Vehicle accident reported', 'critical');
  }

  triggerMedicalEmergency(): void {
    this.triggerEmergency('medical', 'Medical emergency', 'critical');
  }

  triggerRoadsideAssistance(): void {
    this.triggerEmergency('roadside', 'Roadside assistance needed', 'medium');
  }

  triggerUrgentClaim(): void {
    this.triggerEmergency('urgent_claim', 'Urgent insurance claim', 'high');
  }

  // Activate emergency mode
  private activateEmergency(emergency: EmergencyEvent): void {
    this.isEmergencyModeSignal.set(true);
    this.activeEmergencySignal.set(emergency);
    
    // Add to history
    const history = this.emergencyHistorySignal();
    this.emergencyHistorySignal.set([emergency, ...history].slice(0, 50)); // Keep last 50
    
    // Emit event
    this.emergencySubject.next(emergency);
    
    // Trigger haptic feedback on mobile
    this.triggerHapticFeedback(emergency.severity);
    
    // Send system notification if permission granted
    this.sendNotification(emergency);
  }

  // Clear emergency mode
  clearEmergency(): void {
    this.isEmergencyModeSignal.set(false);
    this.activeEmergencySignal.set(null);
  }

  // Get current location
  private getCurrentLocation(): Promise<{latitude: number; longitude: number}> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Make emergency call
  makeEmergencyCall(contactType: EmergencyContact['type']): void {
    const contact = this.emergencyContacts().find(c => c.type === contactType);
    if (contact) {
      window.location.href = `tel:${contact.phone}`;
    }
  }

  // Share emergency details
  shareEmergencyDetails(): void {
    const emergency = this.activeEmergency();
    if (!emergency) return;

    const shareText = this.formatEmergencyDetails(emergency);
    
    if (navigator.share) {
      navigator.share({
        title: 'Emergency Details',
        text: shareText
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
    }
  }

  // Add custom emergency contact
  addEmergencyContact(contact: EmergencyContact): void {
    const contacts = this.emergencyContactsSignal();
    this.emergencyContactsSignal.set([...contacts, contact]);
  }

  // Remove emergency contact
  removeEmergencyContact(index: number): void {
    const contacts = this.emergencyContactsSignal();
    this.emergencyContactsSignal.set(contacts.filter((_, i) => i !== index));
  }

  // Helper methods
  private getSeverityColor(severity: EmergencyEvent['severity']): string {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }

  private triggerHapticFeedback(severity: EmergencyEvent['severity']): void {
    if ('vibrate' in navigator) {
      switch (severity) {
        case 'critical':
          navigator.vibrate([200, 100, 200, 100, 200]);
          break;
        case 'high':
          navigator.vibrate([300, 200, 300]);
          break;
        case 'medium':
          navigator.vibrate([200, 100, 200]);
          break;
        default:
          navigator.vibrate(200);
      }
    }
  }

  private async sendNotification(emergency: EmergencyEvent): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Emergency: ${emergency.type}`, {
        body: emergency.description || 'Emergency event triggered',
        icon: '/assets/icons/emergency.png',
        badge: '/assets/icons/badge.png',
        tag: 'emergency',
        requireInteraction: true
      });
    }
  }

  private formatEmergencyDetails(emergency: EmergencyEvent): string {
    let details = `Emergency Type: ${emergency.type.toUpperCase()}\n`;
    details += `Time: ${emergency.timestamp.toLocaleString()}\n`;
    details += `Severity: ${emergency.severity.toUpperCase()}\n`;
    
    if (emergency.description) {
      details += `Description: ${emergency.description}\n`;
    }
    
    if (emergency.location) {
      details += `Location: ${emergency.location.latitude}, ${emergency.location.longitude}\n`;
      if (emergency.location.address) {
        details += `Address: ${emergency.location.address}\n`;
      }
    }
    
    return details;
  }
}
