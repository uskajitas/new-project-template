// Theme tokens for __PROJECT_DISPLAY__.
// Tweak palette here — every styled-component reads from this.
export const theme = {
  colors: {
    bg:        '#0b0d12',
    surface:   '#13161d',
    border:    '#252a35',
    text:      '#e6e8ee',
    textDim:   '#8a93a6',
    primary:   '#7c5cff',
    primaryHover: '#9478ff',
    danger:    '#ff5c7c',
    success:   '#5cffb0',
  },
  radius:  '10px',
  shadow:  '0 4px 16px rgba(0, 0, 0, 0.35)',
  font:    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
};

export type Theme = typeof theme;
