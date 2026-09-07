const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function expand(hex: string): [number, number, number] {
  const value = hex.slice(1);
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function contrastWith(rgb: [number, number, number], other: number): number {
  const lighter = Math.max(relativeLuminance(rgb), other);
  const darker = Math.min(relativeLuminance(rgb), other);
  return (lighter + 0.05) / (darker + 0.05);
}

function darken(rgb: [number, number, number], amount: number): string {
  const [r, g, b] = rgb.map((c) => Math.round(c * (1 - amount)));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Applies a merchant's colour to the page. Text on top is chosen by measured
 * contrast, so a pale brand colour never leaves an unreadable button behind.
 */
export function applyBrandColor(color: string | null): void {
  const root = document.documentElement;
  if (!color || !HEX.test(color)) {
    root.style.removeProperty('--brand');
    root.style.removeProperty('--brand-strong');
    root.style.removeProperty('--brand-ink');
    return;
  }

  const rgb = expand(color);
  const onWhite = contrastWith(rgb, relativeLuminance([255, 255, 255]));
  const onBlack = contrastWith(rgb, relativeLuminance([0, 0, 0]));

  root.style.setProperty('--brand', color);
  root.style.setProperty('--brand-strong', darken(rgb, 0.18));
  root.style.setProperty('--brand-ink', onWhite >= onBlack ? '#ffffff' : '#101828');
}
