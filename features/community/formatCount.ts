/** Compact counts for feed actions — e.g. 3500 → "3.5K". */
export function formatCompactCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10_000) {
    const k = n / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  if (n < 1_000_000) return `${Math.round(n / 1000)}K`;
  const m = n / 1_000_000;
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
}
