export const theme = {
  colors: {
    // Palette (per thesis spec)
    // Primary (brand/button/title): #064E3B
    // Accent (icons/progress/status): #059669
    // Background: #F9FAFB, Surface: #FFFFFF
    // Text main: #111827, Text secondary: #6B7280

    background: '#F9FAFB',
    foreground: '#111827',
    card: '#FFFFFF',
    cardAlt: '#F3F4F6',
    muted: '#6B7280',
    muted2: '#9CA3AF',
    border: '#E5E7EB',
    inputBorder: '#D1D5DB',

    primary: '#064E3B',
    primarySoft: 'rgba(5,150,105,0.12)',
    accent: '#059669',
    titleBg: '#F3F4F6',
    onPrimary: '#FFFFFF',

    destructive: '#DC2626',
    error: '#B00020',

    // Material 3-inspired semantic aliases
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
    outline: '#E5E7EB',
    outlineVariant: '#D1D5DB',

    primaryContainer: 'rgba(5,150,105,0.12)',
    onPrimaryContainer: '#059669',

    errorContainer: '#FEE2E2',
    errorOutline: '#FCA5A5',
    successOutline: '#86EFAC',

    // Common translucent accents used across badges/selected states
    primaryOutlineSoft: 'rgba(5,150,105,0.18)',
    primaryOutline: 'rgba(5,150,105,0.22)',

    // On-primary translucency tokens (used on green hero/primary surfaces)
    onPrimaryDivider: 'rgba(255,255,255,0.35)',
    onPrimaryRipple: 'rgba(255,255,255,0.18)',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fontSize: {
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    display: 34,
  },
  typography: {
    titleLarge: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '900',
    },
    titleMedium: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '900',
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '800',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '700',
    },
  },
  elevation: {
    // Android elevation numbers; iOS uses shadow props in components.
    sm: 2,
    md: 4,
    lg: 8,
  },
} as const;

export type Theme = typeof theme;
