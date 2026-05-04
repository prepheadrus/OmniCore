export const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(n);
export const fmtShort = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(n);

export function winRateColor(rate: number): string {
  if (rate >= 70) return 'text-emerald-600';
  if (rate >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export function winRateBg(rate: number): string {
  if (rate >= 70) return 'bg-emerald-500';
  if (rate >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function winRateTrack(rate: number): string {
  if (rate >= 70) return 'bg-emerald-100';
  if (rate >= 40) return 'bg-amber-100';
  return 'bg-red-100';
}

export function winRateLabel(rate: number): string {
  if (rate >= 70) return 'Mükemmel';
  if (rate >= 40) return 'Orta';
  return 'Düşük';
}

export function priceDiffColor(ourPrice: number, buyBoxPrice: number): string {
  const diff = ourPrice - buyBoxPrice;
  if (diff <= 0) return 'text-emerald-600';
  if (diff <= buyBoxPrice * 0.03) return 'text-amber-600';
  return 'text-red-600';
}
