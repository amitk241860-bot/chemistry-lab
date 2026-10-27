/**
 * Mobile Navigation Bridge & JavaScript Helper
 * Provides seamless compatibility for mobile navigation, touch gestures,
 * safe area insets, and audio feedback across mobile browsers.
 */

'use client';

import { MobileNav } from './MobileNav';

export { MobileNav };
export default MobileNav;

/**
 * Check if current user agent or screen width is mobile
 * @returns {boolean}
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Trigger subtle haptic vibration on supporting mobile devices
 * @param {number} [duration=15] - duration in milliseconds
 */
export function triggerHaptic(duration = 15) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration errors on unsupported hardware
    }
  }
}

/**
 * Mobile navigation items configuration
 */
export const MOBILE_NAV_CONFIG = [
  { label: 'Labs', href: '/', id: 'nav-labs' },
  { label: 'Periodic 3D', href: '/periodic-table', id: 'nav-periodic' },
  { label: 'AI Studio', href: '/experiments/create', id: 'nav-ai-studio', highlight: true },
  { label: 'Apparatus', href: '/equipment', id: 'nav-equipment' },
];
