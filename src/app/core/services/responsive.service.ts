import { Injectable, signal, computed } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {
  private breakpointObserver = new BreakpointObserver();
  
  // Custom breakpoints for insurance app
  private readonly breakpoints = {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px) and (max-width: 1439px)',
    largeDesktop: '(min-width: 1440px)',
    portrait: '(orientation: portrait)',
    landscape: '(orientation: landscape)'
  };

  // Reactive breakpoint signals
  private isMobileSignal = toSignal(
    this.breakpointObserver.observe(this.breakpoints.mobile)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  private isTabletSignal = toSignal(
    this.breakpointObserver.observe(this.breakpoints.tablet)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  private isDesktopSignal = toSignal(
    this.breakpointObserver.observe(this.breakpoints.desktop)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  private isLargeDesktopSignal = toSignal(
    this.breakpointObserver.observe(this.breakpoints.largeDesktop)
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  private orientationSignal = toSignal(
    this.breakpointObserver.observe(this.breakpoints.portrait)
      .pipe(map(result => result.matches ? 'portrait' : 'landscape')),
    { initialValue: 'portrait' as const }
  );

  private screenWidthSignal = signal(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Public computed signals
  readonly isMobile = computed(() => this.isMobileSignal());
  readonly isTablet = computed(() => this.isTabletSignal());
  readonly isDesktop = computed(() => this.isDesktopSignal());
  readonly isLargeDesktop = computed(() => this.isLargeDesktopSignal());
  readonly orientation = computed(() => this.orientationSignal());
  readonly screenWidth = computed(() => this.screenWidthSignal());

  // Convenience computed properties
  readonly isMobileOrTablet = computed(() => this.isMobile() || this.isTablet());
  readonly isDesktopOrLarger = computed(() => this.isDesktop() || this.isLargeDesktop());
  readonly isTouchDevice = computed(() => this.isMobile() || this.isTablet());

  // Device type computed
  readonly deviceType = computed(() => {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    if (this.isDesktop()) return 'desktop';
    return 'large-desktop';
  });

  // Container classes for responsive design
  readonly containerClass = computed(() => {
    if (this.isMobile()) return 'container-mobile';
    if (this.isTablet()) return 'container-tablet';
    return 'container-desktop';
  });

  // Grid columns based on screen size
  readonly gridColumns = computed(() => {
    if (this.isMobile()) return 1;
    if (this.isTablet()) return 2;
    if (this.isDesktop()) return 3;
    return 4;
  });

  constructor() {
    if (typeof window !== 'undefined') {
      // Update screen width on resize
      window.addEventListener('resize', () => {
        this.screenWidthSignal.set(window.innerWidth);
      });
    }
  }

  // Utility method to check if current viewport matches breakpoint
  isBreakpoint(breakpoint: keyof typeof this.breakpoints): boolean {
    return this.breakpointObserver.isMatched(this.breakpoints[breakpoint]);
  }

  // Get current breakpoint info
  getBreakpointInfo(): ResponsiveBreakpoints {
    return {
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isDesktop: this.isDesktop(),
      isLargeDesktop: this.isLargeDesktop(),
      orientation: this.orientation(),
      screenWidth: this.screenWidth()
    };
  }

  // Optimized container padding based on device
  getContainerPadding(): string {
    if (this.isMobile()) return 'px-4';
    if (this.isTablet()) return 'px-6';
    return 'px-8';
  }

  // Touch-optimized button size
  getButtonSize(): string {
    return this.isTouchDevice() ? 'min-h-[48px] px-6 py-3' : 'min-h-[40px] px-4 py-2';
  }
}
