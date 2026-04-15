import { IPriceStrategy } from '../interfaces/price-strategy.interface';

export class ProfitMaximizationStrategy implements IPriceStrategy {
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
      // Rakip yoksa veya stokları yoksa, çok daha yüksek bir kar marjıyla başla (örn. %50)
      return baseCost * 1.5;
    }

    const lowestCompetitorPrice = Math.min(...validCompetitorPrices);

    // Kâr maksimizasyonunda rakiple aynı fiyata in veya rakip fiyatını referans alarak minimumun biraz üstünde tut.
    // Eğer rakiplerin stoku varsa, yine minimum kar marjının üzerinde ama rakibe yakın ol.
    const maximizedPrice = lowestCompetitorPrice;

    return Math.max(maximizedPrice, minimumAllowedPrice);
  }
}
