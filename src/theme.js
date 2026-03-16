// Kiosko Food — Theme Colors (Dark Mode inspired by Foodeo)
export const Colors = {
  background: '#0A0A0F',
  surface: '#13131A',
  surfaceVariant: '#1E1E2A',
  card: '#1A1A24',
  cardBorder: '#252533',
  accent: '#FF6B35',
  accentLight: '#FF9A5C',
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  textPrimary: '#F5F5F5',
  textSecondary: '#9E9EAE',
  textMuted: '#5C5C7A',
  divider: '#2A2A38',
  // KDS Status
  statusPending: '#F39C12',
  statusInProgress: '#3498DB',
  statusReady: '#2ECC71',
  statusCancelled: '#E74C3C',
};

export const Typography = {
  fontFamily: 'System',
  h1: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  body: { fontSize: 14, color: Colors.textSecondary },
  caption: { fontSize: 12, color: Colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
