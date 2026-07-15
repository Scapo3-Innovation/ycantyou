import type { TourAnchorRect } from './types';

const MIN_SPOTLIGHT = 24;

export type SpotlightShape = 'pill' | 'card' | 'circle';

/** Clamp spotlight rect to screen bounds with padding. */
export function clampSpotlightRect(
  rect: TourAnchorRect,
  screenW: number,
  screenH: number,
  pad: number,
): TourAnchorRect {
  const x = Math.max(pad, rect.x - pad);
  const y = Math.max(pad, rect.y - pad);
  const maxW = screenW - x - pad;
  const maxH = screenH - y - pad;
  return {
    x,
    y,
    width: Math.max(MIN_SPOTLIGHT, Math.min(maxW, rect.width + pad * 2)),
    height: Math.max(MIN_SPOTLIGHT, Math.min(maxH, rect.height + pad * 2)),
  };
}

/** Corner radius for spotlight ring and cutout — must stay in sync. */
export function resolveSpotlightRadius(
  width: number,
  height: number,
  shape?: SpotlightShape,
): number {
  'worklet';
  if (shape === 'circle') return Math.min(width, height) / 2;
  if (shape === 'pill' || height <= 56) return Math.min(width, height) / 2;
  if (shape === 'card') return 16;
  if (width > height * 2) return Math.min(width, height) / 2;
  return 14;
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  'worklet';
  const cr = Math.min(Math.max(r, 0), w / 2, h / 2);
  if (cr <= 0.5) {
    return `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
  }
  return [
    `M ${x + cr} ${y}`,
    `H ${x + w - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w} ${y + cr}`,
    `V ${y + h - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w - cr} ${y + h}`,
    `H ${x + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x} ${y + h - cr}`,
    `V ${y + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + cr} ${y}`,
    'Z',
  ].join(' ');
}

/** SVG path: full-screen dim with rounded-rect hole (even-odd fill). */
export function buildDimOverlayPath(
  screenW: number,
  screenH: number,
  holeX: number,
  holeY: number,
  holeW: number,
  holeH: number,
  cornerRadius: number,
  hasHole: number,
): string {
  'worklet';
  const outer = `M 0 0 H ${screenW} V ${screenH} H 0 Z`;
  if (hasHole <= 0.05 || holeW <= 0 || holeH <= 0) return outer;
  return `${outer} ${roundedRectPath(holeX, holeY, holeW, holeH, cornerRadius)}`;
}
