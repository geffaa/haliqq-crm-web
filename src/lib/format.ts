// Numbers stay exact (with thousand separators) until they'd genuinely be
// hard to read, then compact to M/B. That threshold is 1,000,000, not 1,000 —
// "744,000" reads fine on a stat tile; only 7-plus digit numbers actually
// need compacting.
export function short(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1e9) return sign + (a / 1e9).toFixed(a >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B";
  if (a >= 1e6) return sign + (a / 1e6).toFixed(a >= 1e7 ? 0 : 2).replace(/\.?0+$/, "") + "M";
  return sign + Math.round(a).toLocaleString();
}

export function pct(ratio: number | null): string {
  if (ratio == null || Number.isNaN(ratio)) return "—";
  return `${Math.round(ratio * 100)}%`;
}
