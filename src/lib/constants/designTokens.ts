/**
 * Design Tokens for UI Consolidation Improvement
 * 
 * This file contains unified design tokens using shadcn/ui theme variables
 * for consistent styling across all dialogs and components.
 */

// shadcn/ui Color System
export const COLORS = {
  // Using shadcn/ui CSS variables
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",
  popover: "hsl(var(--popover))",
  popoverForeground: "hsl(var(--popover-foreground))",
  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",
  secondary: "hsl(var(--secondary))",
  secondaryForeground: "hsl(var(--secondary-foreground))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",
  destructive: "hsl(var(--destructive))",
  destructiveForeground: "hsl(var(--destructive-foreground))",
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
} as const;

// Spacing System (using Tailwind spacing scale)
export const SPACING = {
  // Base spacing units (Tailwind scale)
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem",  // 8px
  3: "0.75rem", // 12px
  4: "1rem",    // 16px
  5: "1.25rem", // 20px
  6: "1.5rem",  // 24px
  8: "2rem",    // 32px
  10: "2.5rem", // 40px
  12: "3rem",   // 48px
  16: "4rem",   // 64px
  20: "5rem",   // 80px
  24: "6rem",   // 96px

  // Component-specific spacing
  dialog: {
    padding: "6", // p-6 (24px)
    gap: "6",     // gap-6 (24px)
  },

  // Grid and layout spacing
  grid: {
    gap: "4",      // gap-4 (16px)
    gapLarge: "6", // gap-6 (24px)
    gapSmall: "3", // gap-3 (12px)
  },
} as const;

// Typography System (shadcn/ui compatible)
export const TYPOGRAPHY = {
  // Font sizes (Tailwind scale)
  sizes: {
    xs: "text-xs",     // 12px
    sm: "text-sm",     // 14px
    base: "text-base", // 16px
    lg: "text-lg",     // 18px
    xl: "text-xl",     // 20px
    "2xl": "text-2xl", // 24px
    "3xl": "text-3xl", // 30px
    "4xl": "text-4xl", // 36px
  },

  // Font weights
  weights: {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  },

  // Line heights
  leading: {
    tight: "leading-tight",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
    none: "leading-none",
  },
} as const;

// Animation System (Tailwind compatible)
export const ANIMATIONS = {
  // Transition classes
  transitions: {
    all: "transition-all",
    colors: "transition-colors",
    transform: "transition-transform",
    opacity: "transition-opacity",
    shadow: "transition-shadow",
  },

  // Duration classes
  duration: {
    75: "duration-75",
    100: "duration-100",
    150: "duration-150",
    200: "duration-200",
    300: "duration-300",
    500: "duration-500",
    700: "duration-700",
    1000: "duration-1000",
  },

  // Easing classes
  ease: {
    linear: "ease-linear",
    in: "ease-in",
    out: "ease-out",
    inOut: "ease-in-out",
  },
} as const;

// Shadow System (Tailwind scale)
export const SHADOWS = {
  // Shadow levels
  sm: "shadow-sm",
  base: "shadow",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  none: "shadow-none",
} as const;

// Border Radius System (Tailwind scale)
export const RADIUS = {
  none: "rounded-none",
  sm: "rounded-sm",
  base: "rounded",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
} as const;

// Component Style Presets (shadcn/ui compatible)
export const COMPONENT_STYLES = {
  // Dialog styles
  dialog: {
    overlay: "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    content: "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
    header: "flex flex-col space-y-1.5 text-center sm:text-left",
    title: "text-lg font-semibold leading-none tracking-tight",
    description: "text-sm text-muted-foreground",
    footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
  },

  // Card styles
  card: {
    base: "rounded-lg border bg-card text-card-foreground shadow-sm",
    header: "flex flex-col space-y-1.5 p-6",
    title: "text-2xl font-semibold leading-none tracking-tight",
    description: "text-sm text-muted-foreground",
    content: "p-6 pt-0",
    footer: "flex items-center p-6 pt-0",
  },

  // Button variants (matching shadcn/ui)
  button: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },

  // Input styles
  input: {
    base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  },

  // Badge styles
  badge: {
    default: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  },
} as const;

// Layout Utilities
export const LAYOUT = {
  // Container styles
  container: "container mx-auto px-4",
  
  // Flexbox utilities
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
  },

  // Grid utilities
  grid: {
    cols1: "grid grid-cols-1",
    cols2: "grid grid-cols-2",
    cols3: "grid grid-cols-3",
    cols4: "grid grid-cols-4",
    responsive: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  },
} as const;

// Export all design tokens as a single object for easy importing
export const DESIGN_TOKENS = {
  colors: COLORS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  animations: ANIMATIONS,
  shadows: SHADOWS,
  radius: RADIUS,
  components: COMPONENT_STYLES,
  layout: LAYOUT,
} as const;

// Type definitions for better TypeScript support
export type ColorKey = keyof typeof COLORS;
export type SpacingKey = keyof typeof SPACING;
export type TypographySize = keyof typeof TYPOGRAPHY.sizes;
export type ShadowLevel = keyof typeof SHADOWS;
export type RadiusSize = keyof typeof RADIUS;

// Helper function to combine classes with design tokens
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Utility functions for accessing design tokens
export const getColor = (color: ColorKey) => COLORS[color];
export const getSpacing = (size: SpacingKey) => SPACING[size];
export const getTypography = (size: TypographySize) => TYPOGRAPHY.sizes[size];
export const getShadow = (level: ShadowLevel) => SHADOWS[level];
export const getRadius = (size: RadiusSize) => RADIUS[size];