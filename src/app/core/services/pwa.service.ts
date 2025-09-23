import { Injectable, signal, computed } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PWAService {
  private promptEventSignal = signal<any>(null);
  private isInstallableSignal = signal(false);
  private isInstalledSignal = signal(false);
  private updateAvailableSignal = signal(false);

  // Public readonly signals
  readonly isInstallable = computed(() => this.isInstallableSignal());
  readonly isInstalled = computed(() => this.isInstalledSignal());
  readonly updateAvailable = computed(() => this.updateAvailableSignal());

  constructor(private swUpdate: SwUpdate) {
    this.initializePWA();
    this.checkForUpdates();
  }

  private initializePWA(): void {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalledSignal.set(true);
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.promptEventSignal.set(e);
      this.isInstallableSignal.set(true);
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      this.isInstalledSignal.set(true);
      this.isInstallableSignal.set(false);
      this.promptEventSignal.set(null);
    });
  }

  private checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      // Check for updates every 6 hours
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 6 * 60 * 60 * 1000);

      // Listen for version updates
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailableSignal.set(true);
        });
    }
  }

  // Install the PWA
  async installPWA(): Promise<boolean> {
    const promptEvent = this.promptEventSignal();
    if (!promptEvent) {
      return false;
    }

    try {
      const result = await promptEvent.prompt();
      const accepted = result.outcome === 'accepted';
      
      if (accepted) {
        this.isInstallableSignal.set(false);
        this.promptEventSignal.set(null);
      }
      
      return accepted;
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  }

  // Apply available update
  async applyUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled && this.updateAvailable()) {
      try {
        await this.swUpdate.activateUpdate();
        window.location.reload();
      } catch (error) {
        console.error('Error applying update:', error);
      }
    }
  }

  // Get PWA installation instructions based on browser
  getInstallInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'Tap the "Install" button or look for the install icon in the address bar.';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'Tap the Share button and select "Add to Home Screen".';
    } else if (userAgent.includes('firefox')) {
      return 'Look for the "Install" option in the browser menu.';
    } else if (userAgent.includes('edg')) {
      return 'Click the "Install" button or look for the app icon in the address bar.';
    } else {
      return 'Look for the "Install" or "Add to Home Screen" option in your browser.';
    }
  }

  // Check if device supports PWA features
  isPWASupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check if running in standalone mode
  isStandaloneMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }

  // Get PWA display mode
  getDisplayMode(): string {
    if (this.isStandaloneMode()) {
      return 'standalone';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    return 'browser';
  }

  // Enable push notifications
  async enablePushNotifications(): Promise<boolean> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Show notification
  showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        ...options
      });
    }
  }

  // Get app info for sharing
  getAppInfo() {
    return {
      name: 'InsuranceAI Claims Platform',
      shortName: 'InsuranceAI',
      description: 'AI-powered insurance claims platform with emergency assistance',
      url: window.location.origin,
      version: '1.0.0'
    };
  }
}
