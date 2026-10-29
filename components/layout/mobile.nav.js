'use client';

/**
 * Mobile Navigation Helper Utilities & Exports
 * Preserves existing exports while re-exporting the responsive MobileNav component.
 */

export { MobileNav, default } from './MobileNav';

export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

export function triggerHaptic(duration = 12) {
  if (
    typeof window !== 'undefined' &&
    window.navigator &&
    typeof window.navigator.vibrate === 'function'
  ) {
    try {
      window.navigator.vibrate(duration);
    } catch {
      // Ignore if vibration API is blocked by browser policy
    }
  }
}

export const MOBILE_NAV_CONFIG = {
  breakpoint: 768,
  heightPx: 68,
  minTouchTargetPx: 48,
  sections: [
    { id: 'lab', label: 'Lab', href: '/' },
    { id: 'experiments', label: 'Experiments', href: '/classes/form-1' },
    { id: 'ai-studio', label: 'AI Studio', href: '/experiments/create' },
    { id: 'stockroom', label: 'Stockroom', href: '/equipment' },
    { id: 'history', label: 'History', href: '/progress' },
  ],
};
