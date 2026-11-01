export function formatPercent(p: number, digits?: number) {
  const pct = p * 100;
  if (digits !== undefined) return `${pct.toFixed(digits)}%`;
  if (pct > 0 && pct < 1) return '<1%';
  return `${pct < 10 ? pct.toFixed(1) : pct.toFixed(0)}%`;
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 100_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}
