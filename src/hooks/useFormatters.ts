export function fmt(n: number, d: number = 2): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export function fmtCompact(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function pnlColor(n: number): string {
  return n >= 0 ? '#00D68F' : '#FF6B8A';
}

export function pnlSign(n: number): string {
  return n >= 0 ? '+' : '';
}
