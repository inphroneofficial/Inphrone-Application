import { useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';

// Standard theme persistence - no custom gradients
export function applyThemeToDocument(isDarkMode: boolean) {
  // Simply apply dark class as needed - let CSS handle the rest
  const root = document.documentElement;
  root.classList.remove('custom-gradient-bg', 'custom-color-bg', 'theme-applied');
}

// No immediate theme application needed
if (typeof window !== 'undefined') {
  // Clean start
}

export function useThemePersistence() {
  const { resolvedTheme } = useTheme();

  const loadAndApplyTheme = useCallback(() => {
    // Standard theme handling - CSS variables do the work
  }, [resolvedTheme]);

  useEffect(() => {
    loadAndApplyTheme();
  }, [resolvedTheme, loadAndApplyTheme]);

  return { loadAndApplyTheme };
}
