export const brandColors = {
  ink: '#0F172A',
  muted: '#475569',
  primary: '#7C3AED',
  primaryStrong: '#5B21B6',
  surface: '#F8FAFC',
  highlight: '#EEF2FF',
  hero: '#F4F4FF',
  border: '#E2E8F0',
  chip: '#E0F2FE',
  live: '#EF4444',
};

export const brandRadii = {
  card: 26,
  pill: 999,
  media: 22,
};

export const brandShadows = {
  soft: {
    shadowColor: '#0F172A1A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  strong: {
    shadowColor: '#0F172A33',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
  },
};

export const brandTypography = {
  heading: {
    fontSize: 24,
    fontWeight: '800' as const,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  micro: {
    fontSize: 11,
    letterSpacing: 2.2,
    fontWeight: '700' as const,
  },
};
