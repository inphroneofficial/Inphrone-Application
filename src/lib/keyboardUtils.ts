/**
 * Utility functions for keyboard handling
 * Ensures proper keyboard input across desktop and mobile
 */

/**
 * Check if an event should be allowed for normal text input
 * Returns true if the event is a normal text input event
 */
export const isNormalTextInput = (event: KeyboardEvent): boolean => {
  // Allow all keyboard events except when specific modifier combinations are used
  // This ensures backspace, delete, arrow keys, etc. work normally
  
  // Don't interfere with system shortcuts (Cmd+A, Ctrl+C, etc.)
  if (event.metaKey || event.ctrlKey) {
    return false;
  }
  
  return true;
};

/**
 * Prevent event propagation for specific keys only when needed
 * This ensures keyboard shortcuts don't interfere with normal input
 */
export const handleKeyboardEvent = (
  event: KeyboardEvent,
  allowedKeys?: string[]
): void => {
  // If no specific keys are allowed, don't interfere
  if (!allowedKeys) return;
  
  // Only prevent default for specified keys
  if (allowedKeys.includes(event.key)) {
    event.preventDefault();
  }
};

/**
 * Check if user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Handle mobile-specific input behavior
 */
export const handleMobileInput = (element: HTMLInputElement | HTMLTextAreaElement): void => {
  if (!isMobileDevice()) return;
  
  // Prevent zoom on focus for mobile devices
  element.style.fontSize = '16px';
};
