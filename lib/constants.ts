// Brand constants and tokens for inRECORD

export const BRAND_COLORS = {
  aurora: '#0099FF',
  gold: '#D4AF37',
  midnight: '#0B0B0B'
} as const;

export const IN_GLOBAL_CSS = `
  @keyframes inr-fade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .inr-fade { animation: inr-fade 1.2s ease-out both; }
`;
