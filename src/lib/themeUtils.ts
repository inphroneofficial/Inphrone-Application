// Theme utility functions for consistent color/gradient application

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

// Extract primary color from gradient
export function extractPrimaryFromGradient(gradient: string): string | null {
  const match = gradient.match(/#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/);
  return match ? match[0] : null;
}

// Convert hex to HSL
export function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Generate CSS variable string from HSL
export function hslToCssVar(hsl: { h: number; s: number; l: number }): string {
  return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
}

// Predefined theme presets
export const THEME_PRESETS = {
  inphrone: {
    gradient: 'linear-gradient(90deg, #1F0021, #751006)',
    primary: '#751006',
    accent: '#1F0021',
  },
  ocean: {
    gradient: 'linear-gradient(135deg, #0F2027, #203A43, #2C5364)',
    primary: '#2C5364',
    accent: '#0F2027',
  },
  aurora: {
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    primary: '#0f3460',
    accent: '#1a1a2e',
  },
  midnight: {
    gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    primary: '#302b63',
    accent: '#0f0c29',
  },
  forest: {
    gradient: 'linear-gradient(135deg, #0d1b0e, #1a3a1c, #0f2810)',
    primary: '#1a3a1c',
    accent: '#0d1b0e',
  },
};

// Apply theme to document
export function applyThemeColors(
  gradientId: string | null, 
  colorId: string | null, 
  isDarkMode: boolean
): void {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('custom-gradient-bg', 'custom-color-bg', 'custom-dark-theme', 'theme-applied');
  root.style.removeProperty('--custom-app-background');
  root.style.removeProperty('--custom-theme-primary');
  root.style.removeProperty('--custom-theme-accent');
  
  if (gradientId && gradientId !== 'none') {
    const preset = THEME_PRESETS[gradientId as keyof typeof THEME_PRESETS];
    if (preset) {
      root.style.setProperty('--custom-app-background', preset.gradient);
      
      // Extract and set primary color
      const primaryHsl = hexToHSL(preset.primary);
      const accentHsl = hexToHSL(preset.accent);
      
      if (primaryHsl) {
        root.style.setProperty('--custom-theme-primary', hslToCssVar(primaryHsl));
      }
      if (accentHsl) {
        root.style.setProperty('--custom-theme-accent', hslToCssVar(accentHsl));
      }
      
      root.classList.add('custom-gradient-bg', 'theme-applied');
      if (isDarkMode) {
        root.classList.add('custom-dark-theme');
      }
    }
  } else if (colorId && colorId !== 'none') {
    const colorMap: Record<string, string> = {
      'charcoal': '#1a1a2e',
      'navy': '#0a1929',
      'slate': '#1e293b',
      'wine': '#2d1b1b',
      'emerald': '#0d2818',
    };
    
    const color = colorMap[colorId];
    if (color) {
      root.style.setProperty('--custom-app-background', color);
      
      const colorHsl = hexToHSL(color);
      if (colorHsl) {
        root.style.setProperty('--custom-theme-primary', hslToCssVar(colorHsl));
      }
      
      root.classList.add('custom-color-bg', 'theme-applied');
      if (isDarkMode) {
        root.classList.add('custom-dark-theme');
      }
    }
  }
}
