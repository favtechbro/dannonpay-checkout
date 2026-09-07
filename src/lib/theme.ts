const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const DEFAULT = '#005EE6';

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
  return `#${rgb
    .map((c) => Math.round(c * (1 - amount)).toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * A merchant's colour drives the action colour of the page. Text on top is
 * chosen by measured contrast, and the Dannon Pay frame around it never
 * changes, so a pale or loud brand colour cannot break the page.
 */
export function applyBrandColor(color: string | null): void {
  const chosen = color && HEX.test(color) ? color : DEFAULT;
  const rgb = expand(chosen);
  const onWhite = contrastWith(rgb, relativeLuminance([255, 255, 255]));
  const onInk = contrastWith(rgb, relativeLuminance([33, 33, 33]));
  const root = document.documentElement.style;

  root.setProperty('--accent', chosen);
  root.setProperty('--accent-strong', darken(rgb, 0.16));
  root.setProperty('--accent-ink', onWhite >= onInk ? '#ffffff' : '#212121');
  root.setProperty('--accent-soft', `rgba(${rgb.join(', ')}, 0.16)`);
}
