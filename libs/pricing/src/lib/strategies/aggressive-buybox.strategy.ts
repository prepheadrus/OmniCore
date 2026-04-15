import { IPriceStrategy } from '../interfaces/price-strategy.interface';

export class AggressiveBuyboxStrategy implements IPriceStrategy {
  calculatePrice(
    baseCost: number,
    competitorPrices: number[],
    competitorStockStatus: boolean[],
    minimumMargin: number
  ): number {
    const minimumAllowedPrice = baseCost * (1 + minimumMargin);

    // Rakiplerin fiyatlarını al, stoku olanları değerlendir
    const validCompetitorPrices = competitorPrices.filter((price, index) => competitorStockStatus[index] && price > 0);

    if (validCompetitorPrices.length === 0) {
      // Rakip yoksa veya stokları yoksa, yüksek bir kar marjıyla başla (örn. %30)
      return baseCost * 1.3;
    }

    const lowestCompetitorPrice = Math.min(...validCompetitorPrices);

    // Rakibin fiyatının 0.01 (veya küçük bir miktar) altını teklif et, ama minimum limite takıl
    const aggressivePrice = lowestCompetitorPrice - 0.01;

    return Math.max(aggressivePrice, minimumAllowedPrice);
  }
}
