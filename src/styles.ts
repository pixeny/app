import { CSSProperties } from 'react';

// Colors - Modern palette
export const C = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FF8A5C',
  dark: '#1A1A1A',
  darkLight: '#2D2D2D',
  card: '#FFFFFF',
  cardDark: '#F8F9FA',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#10B981',
  successLight: '#34D399',
  danger: '#EF4444',
  dangerLight: '#F87171',
  info: '#3B82F6',
  infoLight: '#60A5FA',
  warning: '#F59E0B',
  white: '#FFFFFF',
  bg: '#FAFBFC',
  bgDark: '#F9FAFB',
  mapBg: '#F0F4F8',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// Shadows - Modern subtle design
export const shadow = {
  xs: '0 1px 2px rgba(0,0,0,0.05)',
  sm: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
  lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
  '2xl': '0 25px 50px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.1)',
  inner: 'inset 0 2px 4px rgba(0,0,0,0.06)',
};

// Common styles
export const s = {
  fullAbs: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as CSSProperties,
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as CSSProperties,
  flexRow: { display: 'flex', alignItems: 'center' } as CSSProperties,
  flexCol: { display: 'flex', flexDirection: 'column' } as CSSProperties,
  roundedPanel: { borderTopLeftRadius: 24, borderTopRightRadius: 24 } as CSSProperties,
  roundedLg: { borderRadius: 16 } as CSSProperties,
  roundedMd: { borderRadius: 12 } as CSSProperties,
  roundedSm: { borderRadius: 8 } as CSSProperties,
  roundedFull: { borderRadius: 9999 } as CSSProperties,
  btn: { border: 'none', cursor: 'pointer', outline: 'none', background: 'none' } as CSSProperties,
  btnPrimary: {
    backgroundColor: C.primary,
    color: C.white,
    padding: '12px 24px',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadow.md,
    '&:hover': {
      backgroundColor: C.primaryDark,
      transform: 'translateY(-1px)',
      boxShadow: shadow.lg,
    }
  } as CSSProperties,
  btnSecondary: {
    backgroundColor: C.white,
    color: C.gray700,
    padding: '12px 24px',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14,
    border: `1px solid ${C.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: shadow.sm,
    '&:hover': {
      backgroundColor: C.gray50,
      borderColor: C.gray300,
      transform: 'translateY(-1px)',
      boxShadow: shadow.md,
    }
  } as CSSProperties,
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    boxShadow: shadow.sm,
    border: `1px solid ${C.borderLight}`,
    transition: 'all 0.2s ease',
  } as CSSProperties,
  slideUp: { animation: 'slideUp 0.35s ease-out forwards' } as CSSProperties,
  fadeIn: { animation: 'fadeIn 0.3s ease-out forwards' } as CSSProperties,
  scaleIn: { animation: 'scaleIn 0.2s ease-out forwards' } as CSSProperties,
};

// Typography
export const typography = {
  h1: { fontSize: 32, fontWeight: 700, lineHeight: 1.2, color: C.dark } as CSSProperties,
  h2: { fontSize: 24, fontWeight: 600, lineHeight: 1.3, color: C.dark } as CSSProperties,
  h3: { fontSize: 20, fontWeight: 600, lineHeight: 1.4, color: C.dark } as CSSProperties,
  h4: { fontSize: 18, fontWeight: 600, lineHeight: 1.4, color: C.gray800 } as CSSProperties,
  body1: { fontSize: 16, fontWeight: 400, lineHeight: 1.5, color: C.gray700 } as CSSProperties,
  body2: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, color: C.gray600 } as CSSProperties,
  caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4, color: C.gray500 } as CSSProperties,
  button: { fontSize: 14, fontWeight: 600, lineHeight: 1.2 } as CSSProperties,
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// CSS Animations
export const animations = `
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

