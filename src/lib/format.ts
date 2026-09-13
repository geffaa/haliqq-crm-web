// Compact number formatting per design-system.md §6: under 1,000 stays exact,
// then k/M/B. Kept as one shared implementation so every stat tile agrees.
export function short(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1e9) return sign + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B";
  if (a >= 1e6) return sign + (a / 1e6).toFixed(a >= 1e7 ? 0 : 2).replace(/\.?0+$/, "") + "M";
  if (a >= 1e3) return sign + (a / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "k";
  return sign + String(Math.round(a));
}

export function pct(ratio: number | null): string {
  if (ratio == null || Number.isNaN(ratio)) return "—";
  return `${Math.round(ratio * 100)}%`;
}
